import React, { useState, useEffect } from 'react';
import {
  EmailTemplate,
  getSavedEmailTemplates,
  fetchEmailTemplatesFromBackend,
  saveEmailTemplate,
  resetEmailTemplate,
  renderTemplateText
} from '../../services/emailTemplates';
import { sendEmail } from '../../services/email';
import {
  Mail,
  Edit3,
  Eye,
  EyeOff,
  Code,
  Check,
  RotateCcw,
  Send,
  Sparkles,
  Info,
  Copy,
  Layers,
  FileText,
  Shield,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Key,
  RefreshCw,
  X,
  Server,
  Save,
  Sliders
} from 'lucide-react';

interface SmtpStatus {
  connected: boolean;
  email_user: string;
  email_pass?: string;
  host: string;
  port: number;
  error_code?: number;
  error_message?: string;
  reason?: string;
  unlock_url?: string;
  app_password_url?: string;
}

interface MailingTemplatesViewProps {
  showSmtpBanner?: boolean;
}

export const MailingTemplatesView: React.FC<MailingTemplatesViewProps> = ({
  showSmtpBanner = true
}) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>(() => getSavedEmailTemplates());
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || 'welcome_user');
  const [editMode, setEditMode] = useState<'preview' | 'html' | 'text'>('preview');

  // Active Template Working Copy
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];
  const [subject, setSubject] = useState(selectedTemplate?.subject || '');
  const [htmlContent, setHtmlContent] = useState(selectedTemplate?.htmlContent || '');
  const [plainText, setPlainText] = useState(selectedTemplate?.plainText || '');

  // Feedback & Test Send
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSendNotice, setTestSendNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  // SMTP Diagnostics & Real-Time Environment Credentials
  const [smtpStatus, setSmtpStatus] = useState<SmtpStatus | null>(null);
  const [isCheckingSmtp, setIsCheckingSmtp] = useState(false);
  const [configUser, setConfigUser] = useState('p3lcodes@gmail.com');
  const [configPass, setConfigPass] = useState('qubl ppmq mhmb qaqx');
  const [configHost, setConfigHost] = useState('smtp.gmail.com');
  const [configPort, setConfigPort] = useState(587);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configNotice, setConfigNotice] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  const checkSmtp = async () => {
    setIsCheckingSmtp(true);
    try {
      const res = await fetch('/api/v1/email/smtp-status');
      if (res.ok) {
        const data = await res.json();
        setSmtpStatus(data);
        if (data.email_user) setConfigUser(data.email_user);
        if (data.email_pass) setConfigPass(data.email_pass);
        if (data.host) setConfigHost(data.host);
        if (data.port) setConfigPort(data.port);
      }
    } catch (e) {}
    setIsCheckingSmtp(false);
  };

  // Fetch from persistent backend on mount
  useEffect(() => {
    fetchEmailTemplatesFromBackend().then(backendTemplates => {
      if (backendTemplates && backendTemplates.length > 0) {
        setTemplates(backendTemplates);
      }
    });
    checkSmtp();
  }, []);

  const handleSaveSmtpConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingConfig(true);
    setConfigNotice(null);
    try {
      const res = await fetch('/api/v1/email/smtp-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_user: configUser,
          email_pass: configPass,
          smtp_host: configHost,
          smtp_port: configPort,
          force_save: true
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to update SMTP configuration');
      }
      setConfigNotice({
        type: data.connected ? 'success' : 'warning',
        message: data.message || `Credentials saved to system .env for ${configUser}!`
      });
      await checkSmtp();
    } catch (err: any) {
      setConfigNotice({
        type: 'error',
        message: err.message || 'Failed to save SMTP credentials'
      });
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(configPass);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  useEffect(() => {
    if (selectedTemplate) {
      setSubject(selectedTemplate.subject);
      setHtmlContent(selectedTemplate.htmlContent);
      setPlainText(selectedTemplate.plainText);
      setTestSendNotice(null);
    }
  }, [selectedTemplateId]);

  const handleSave = async () => {
    if (!selectedTemplate) return;
    const updated = await saveEmailTemplate({
      ...selectedTemplate,
      subject,
      htmlContent,
      plainText
    });
    setTemplates(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = async () => {
    if (!selectedTemplate) return;
    if (confirm(`Reset "${selectedTemplate.name}" to default system template?`)) {
      const updated = await resetEmailTemplate(selectedTemplate.id);
      setTemplates(updated);
      const def = updated.find(t => t.id === selectedTemplate.id);
      if (def) {
        setSubject(def.subject);
        setHtmlContent(def.htmlContent);
        setPlainText(def.plainText);
      }
    }
  };

  const handleSendTest = async () => {
    if (!testEmailAddress || !testEmailAddress.includes('@')) {
      setTestSendNotice({ type: 'error', message: 'Please enter a valid test recipient email address.' });
      return;
    }
    setIsSendingTest(true);
    setTestSendNotice(null);

    try {
      const renderedSubject = renderTemplateText(subject, selectedTemplate.sampleData);
      const renderedHtml = renderTemplateText(htmlContent, selectedTemplate.sampleData);
      const renderedText = renderTemplateText(plainText, selectedTemplate.sampleData);

      await sendEmail({
        to: [testEmailAddress.trim()],
        subject: `[TEST] ${renderedSubject}`,
        body: renderedText,
        htmlBody: renderedHtml,
        category: 'developer_admin'
      });

      setTestSendNotice({
        type: 'success',
        message: `Test email successfully dispatched to ${testEmailAddress}. Check your inbox!`
      });
    } catch (err: any) {
      setTestSendNotice({
        type: 'error',
        message: err.message || 'Failed to dispatch test email.'
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleCopyVariable = (varName: string) => {
    const textToCopy = `{{${varName}}}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedVar(varName);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  // Interpolated Preview
  const previewHtml = selectedTemplate
    ? renderTemplateText(htmlContent, selectedTemplate.sampleData)
    : '';

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'onboarding':
        return <UserCheck className="w-3.5 h-3.5 text-blue-500" />;
      case 'client_dispatch':
        return <FileText className="w-3.5 h-3.5 text-emerald-500" />;
      case 'authentication':
        return <Shield className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-purple-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]/60">
        <div>
          <h2 className="font-brand font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Mailing &amp; Email Templates Studio</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-sans mt-0.5">
            Customize HTML and plain-text templates for onboarding, password resets, and client fee note statements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-4 h-4" /> Saved Successfully!
            </span>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-white dark:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Reset active template to system default"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Default</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-blue-600/20"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Template</span>
          </button>
        </div>
      </div>

      {/* Live SMTP Mail Gateway & Environment Credentials Console */}
      {showSmtpBanner && (
        <div className="p-5 rounded-3xl border border-[var(--border-color)] bg-white dark:bg-zinc-900 shadow-md space-y-4">
          {/* Top Header: Title, Status Badge, Quick Links */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl border ${
                smtpStatus?.connected
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800'
              }`}>
                <Server className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-brand font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    Live SMTP Mail Gateway &amp; System Credentials (.env)
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold border flex items-center gap-1.5 ${
                    smtpStatus?.connected
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-300'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-300'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${smtpStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-ping'}`} />
                    <span>{smtpStatus?.connected ? 'Online & Authenticated' : 'Google Auth Required (Blocked 534)'}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Active sender for Fee Notes dispatches, client statements, welcome emails, and password resets.
                </p>
              </div>
            </div>

            {/* Top Action Buttons: Test Connection & Google Links */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={checkSmtp}
                disabled={isCheckingSmtp}
                className="px-3.5 py-2 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 text-slate-800 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingSmtp ? 'animate-spin text-blue-600' : ''}`} />
                <span>{isCheckingSmtp ? 'Testing...' : 'Test Connection'}</span>
              </button>

              {!smtpStatus?.connected && (
                <>
                  <a
                    href="https://accounts.google.com/DisplayUnlockCaptcha"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                    title="Click Continue on Google to unlock automated logins"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>1. Unlock Google WebLogin</span>
                  </a>
                  <a
                    href="https://myaccount.google.com/apppasswords"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                    title="Generate a 16-character App Password"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>2. Get App Password</span>
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Credentials Grid: Editable and Real-Time from backend/.env */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* 1. Sender Email */}
            <div className="p-3.5 rounded-2xl border border-[var(--border-color)] bg-slate-50/60 dark:bg-zinc-800/40 space-y-1.5">
              <label className="text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-500" />
                <span>Sender Email (.env)</span>
              </label>
              <input
                type="email"
                value={configUser}
                onChange={e => setConfigUser(e.target.value)}
                placeholder="p3lcodes@gmail.com"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] bg-white dark:bg-zinc-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 block truncate">
                Active system dispatch sender
              </span>
            </div>

            {/* 2. Google App Password */}
            <div className="p-3.5 rounded-2xl border border-[var(--border-color)] bg-slate-50/60 dark:bg-zinc-800/40 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-500" />
                  <span>Google Password (.env)</span>
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-0.5 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show Google password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-0.5 cursor-pointer"
                    title="Copy password"
                  >
                    {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={configPass}
                  onChange={e => setConfigPass(e.target.value)}
                  placeholder="qubl ppmq mhmb qaqx"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] bg-white dark:bg-zinc-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <span className="text-[10px] text-slate-400 block truncate">
                {copiedPass ? 'Copied to clipboard!' : (showPassword ? 'Visible (16-char App Password)' : 'Click eye to reveal')}
              </span>
            </div>

            {/* 3. SMTP Host */}
            <div className="p-3.5 rounded-2xl border border-[var(--border-color)] bg-slate-50/60 dark:bg-zinc-800/40 space-y-1.5">
              <label className="text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-indigo-500" />
                <span>SMTP Host</span>
              </label>
              <input
                type="text"
                value={configHost}
                onChange={e => setConfigHost(e.target.value)}
                placeholder="smtp.gmail.com"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] bg-white dark:bg-zinc-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 block truncate">
                Default: smtp.gmail.com
              </span>
            </div>

            {/* 4. Port & Security */}
            <div className="p-3.5 rounded-2xl border border-[var(--border-color)] bg-slate-50/60 dark:bg-zinc-800/40 space-y-1.5">
              <label className="text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-teal-500" />
                <span>Port &amp; TLS</span>
              </label>
              <select
                value={configPort}
                onChange={e => setConfigPort(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] bg-white dark:bg-zinc-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono cursor-pointer"
              >
                <option value={587}>Port 587 (STARTTLS - Recommended)</option>
                <option value={465}>Port 465 (SSL / TLS Direct)</option>
              </select>
              <span className="text-[10px] text-slate-400 block truncate">
                Encrypted TLS Relay
              </span>
            </div>
          </div>

          {/* Bottom Status / Save Row */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-slate-500 dark:text-zinc-400 text-[11.5px] leading-relaxed">
              {smtpStatus?.connected ? (
                <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Google SMTP server is verified and active. All transactional emails will deliver directly.</span>
                </span>
              ) : (
                <span className="text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Google Error 534: Visit Unlock Google WebLogin or paste a new 16-letter App Password and click Apply.</span>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleSaveSmtpConfig()}
              disabled={isSavingConfig}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-600/20 disabled:opacity-50 shrink-0"
            >
              {isSavingConfig ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving &amp; Testing...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save &amp; Apply to Entire System (.env)</span>
                </>
              )}
            </button>
          </div>

          {/* Notification Banner */}
          {configNotice && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
              configNotice.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300'
                : configNotice.type === 'warning'
                  ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300'
                  : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-300'
            }`}>
              <div className="flex items-center gap-2">
                {configNotice.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-amber-600" />}
                <span>{configNotice.message}</span>
              </div>
              <button onClick={() => setConfigNotice(null)} className="cursor-pointer text-slate-400 hover:text-slate-600 font-bold ml-2">&times;</button>
            </div>
          )}
        </div>
      )}

      {/* Main Studio Grid: Left Template Selector + Right Interactive Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Template Cards List (4 columns) */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 px-1">
            System Templates ({templates.length})
          </div>

          <div className="space-y-2">
            {templates.map(tpl => {
              const isSelected = tpl.id === selectedTemplateId;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-400 dark:border-blue-600 shadow-sm ring-1 ring-blue-500/20'
                      : 'bg-white dark:bg-zinc-900 border-[var(--border-color)] hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-slate-100 dark:bg-zinc-800">
                        {getCategoryIcon(tpl.category)}
                      </div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {tpl.name}
                      </span>
                    </div>
                    {tpl.isCustom && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold">
                        Customized
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2 mt-1.5 font-sans">
                    {tpl.description}
                  </p>
                  <div className="mt-2 pt-2 border-t border-[var(--border-color)]/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{tpl.variables.length} Variables</span>
                    <span className="capitalize">{tpl.category.replace('_', ' ')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Template Editor & Live Preview (8 columns) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Header Card with Subject & Mode Switcher */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-[var(--border-color)] space-y-4 shadow-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 uppercase font-mono tracking-wider">
                Email Subject Line
              </label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Subject Line (e.g. Welcome to {{firmName}})"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Dynamic Variable Chips */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase font-mono">
                  Available Variables (Click to copy)
                </span>
                {copiedVar && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    Copied &#123;&#123;{copiedVar}&#125;&#125;
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedTemplate?.variables.map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => handleCopyVariable(v)}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-mono text-[11px] font-semibold border border-[var(--border-color)] flex items-center gap-1 cursor-pointer transition-colors"
                    title={`Click to copy {{${v}}}`}
                  >
                    <Copy className="w-2.5 h-2.5 text-slate-400" />
                    <span>&#123;&#123;{v}&#125;&#125;</span>
                  </button>
                ))}
              </div>
            </div>

            {/* View Mode Tabs: Preview vs HTML Code vs Plain Text */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
              <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-[var(--border-color)] text-xs">
                <button
                  type="button"
                  onClick={() => setEditMode('preview')}
                  className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    editMode === 'preview'
                      ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-blue-500" />
                  <span>Visual Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode('html')}
                  className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    editMode === 'html'
                      ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  <Code className="w-3.5 h-3.5 text-purple-500" />
                  <span>HTML Template</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode('text')}
                  className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    editMode === 'text'
                      ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Plain Text Fallback</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-400 font-mono">
                {editMode === 'preview' ? 'Sample Data Interpolated' : 'Editable Code'}
              </span>
            </div>
          </div>

          {/* Editor Body Area */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
            {editMode === 'preview' && (
              <div className="p-4 bg-slate-100 dark:bg-zinc-950/70 overflow-x-auto min-h-[420px] flex items-center justify-center">
                <div
                  className="w-full max-w-xl shadow-lg rounded-2xl overflow-hidden bg-white"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            )}

            {editMode === 'html' && (
              <div className="p-3">
                <textarea
                  rows={20}
                  value={htmlContent}
                  onChange={e => setHtmlContent(e.target.value)}
                  className="w-full p-4 rounded-xl font-mono text-xs bg-slate-900 text-emerald-400 focus:outline-none leading-relaxed border border-slate-800"
                  placeholder="<!DOCTYPE html>..."
                />
              </div>
            )}

            {editMode === 'text' && (
              <div className="p-3">
                <textarea
                  rows={16}
                  value={plainText}
                  onChange={e => setPlainText(e.target.value)}
                  className="w-full p-4 rounded-xl font-mono text-xs bg-[var(--bg-subtle)] text-slate-900 dark:text-white focus:outline-none leading-relaxed border border-[var(--border-color)]"
                  placeholder="Plain text fallback body..."
                />
              </div>
            )}
          </div>

          {/* Bottom Test Send Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-[var(--border-color)] space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                  Send Live Test Email via SMTP
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Sends this template rendered with sample data to your real inbox.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={testEmailAddress}
                  onChange={e => setTestEmailAddress(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="px-3 py-1.5 text-xs font-mono rounded-xl border border-[var(--border-color)] bg-white dark:bg-zinc-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-52 sm:w-60"
                />
                <button
                  type="button"
                  onClick={handleSendTest}
                  disabled={isSendingTest}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingTest ? 'Sending...' : 'Send Test'}</span>
                </button>
              </div>
            </div>

            {testSendNotice && (
              <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                testSendNotice.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200'
              }`}>
                <span>{testSendNotice.message}</span>
                <button onClick={() => setTestSendNotice(null)} className="cursor-pointer font-bold">&times;</button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
