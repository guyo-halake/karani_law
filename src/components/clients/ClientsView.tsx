import React, { useState, useEffect } from 'react';
import {
  ExactClientRecord
} from '../../services/supabase';
import { createClient, deleteClient, fetchClients } from '../../services/data';
import { SystemUser } from '../../services/supabase';
import { sendEmail } from '../../services/email';
import { hasPermission } from '../../services/rbac';
import {
  UserPlus,
  Search,
  Phone,
  Mail,
  MessageCircle,
  X,
  Trash2,
  Building2,
  Briefcase,
  CheckCircle2,
  Send
} from 'lucide-react';

interface ClientsViewProps {
  currentUser?: SystemUser | null;
}

export const ClientsView: React.FC<ClientsViewProps> = ({ currentUser }) => {
  const [clientsList, setClientsList] = useState<ExactClientRecord[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [search, setSearch] = useState('');
  const [, setPermissionTick] = useState(0);

  const can = (code: string) => hasPermission(currentUser, code);
  
  // Registration Modal State
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newCategory, setNewCategory] = useState('Corporate or Institutional');
  const [newEmail, setNewEmail] = useState('');
  const [newPhonePrimary, setNewPhonePrimary] = useState('');
  const [newPhoneSecondary, setNewPhoneSecondary] = useState('');

  // Email Compose Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailClient, setEmailClient] = useState<ExactClientRecord | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const handlePermissions = () => {
      setPermissionTick(t => t + 1);
    };
    window.addEventListener('permissionsUpdated', handlePermissions);
    window.addEventListener('storage', handlePermissions);
    return () => {
      window.removeEventListener('permissionsUpdated', handlePermissions);
      window.removeEventListener('storage', handlePermissions);
    };
  }, []);

  useEffect(() => {
    if (!currentUser?.firmId) return;
    const loadClients = () => fetchClients(currentUser.firmId!).then(setClientsList).catch(error => setErrorMessage(error.message || 'Unable to load clients.'));
    void loadClients();
    const handleRealtime = (event: Event) => {
      const detail = (event as CustomEvent<{ table?: string }>).detail;
      if (detail?.table === 'clients') void loadClients();
    };
    window.addEventListener('databaseRealtimeUpdate', handleRealtime);
    return () => window.removeEventListener('databaseRealtimeUpdate', handleRealtime);
  }, [currentUser?.firmId]);

  const filtered = clientsList.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.company && c.company.toLowerCase().includes(search.toLowerCase())) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
    (c.phonePrimary && c.phonePrimary.toLowerCase().includes(search.toLowerCase())) ||
    (c.category && c.category.toLowerCase().includes(search.toLowerCase()))
  );

  const handleRegisterClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    if (!currentUser?.firmId) return;
    try {
      const newRecord = await createClient(currentUser.firmId, {
        name: newName.trim(),
        company: newCompany.trim() || newName.trim(),
        category: newCategory as ExactClientRecord['category'],
        email: newEmail.trim(),
        phonePrimary: newPhonePrimary.trim(),
        phoneSecondary: newPhoneSecondary.trim(),
      });
      setClientsList(prev => [newRecord, ...prev]);
    } catch (error: any) {
      setErrorMessage(error.message || 'Unable to create client.');
      return;
    }
    setShowNewClientModal(false);
    setNewName('');
    setNewCompany('');
    setNewEmail('');
    setNewPhonePrimary('');
    setNewPhoneSecondary('');
  };

  const handleDeleteClient = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete client "${name}" from the database?`)) {
      if (!currentUser?.firmId) return;
      try {
        await deleteClient(currentUser.firmId, id);
        setClientsList(prev => prev.filter(c => c.id !== id));
      } catch (error: any) {
        setErrorMessage(error.message || 'Unable to delete client.');
      }
    }
  };

  const handleOpenEmail = (client: ExactClientRecord) => {
    setEmailClient(client);
    setEmailSubject(`Nyagah B. Kithinji & Co. Advocates - Legal Correspondence`);
    setEmailBody(`Dear ${client.name},\n\nPlease find attached the official correspondence and statement from Nyagah B. Kithinji & Co. Advocates.\n\nKindly acknowledge receipt.\n\nYours faithfully,\nNyagah B. Kithinji & Co. Advocates`);
    setShowEmailModal(true);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailClient?.email) return;
    setIsSending(true);
    try {
      await sendEmail({
        to: [emailClient.email],
        subject: emailSubject,
        body: emailBody,
        category: 'firm_to_client',
      });
      setIsSending(false);
      setShowEmailModal(false);
    } catch (error: any) {
      setErrorMessage(error.message || 'Unable to send email.');
      setIsSending(false);
    }
  };

  const handleWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    const message = encodeURIComponent(`Hello ${name}, this is Nyagah B. Kithinji & Co. Advocates.`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-[var(--border-color)]/60 pb-5">
        <div>
          <h1 className="font-brand font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
            My Clients Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 font-sans">
            Client Portfolio & Direct Contacts ({clientsList.length} Registered)
          </p>
        </div>

        {can('clients.create') && (
          <button
            onClick={() => setShowNewClientModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm shadow-blue-500/20 cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" /> Add New Client
          </button>
        )}
      </div>

      {/* Search Input Bar */}
      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by client name, company, email, phone..."
          className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Clean Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((c: ExactClientRecord) => {
          const initials = c.name
            .split(' ')
            .filter(Boolean)
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();

          return (
            <div
              key={c.id}
              className="modulix-card p-5 flex flex-col justify-between hover:border-blue-500 transition-all group"
            >
              {/* Header: Avatar, Name & Category */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-slate-900 text-white font-mono font-bold text-sm flex items-center justify-center shrink-0 shadow-xs uppercase">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate" title={c.name}>
                        {c.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate flex items-center gap-1">
                        <Building2 className="w-3 h-3 shrink-0" />
                        <span>{c.company || c.name}</span>
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                    {c.category}
                  </span>
                </div>

                {/* Contact Information */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-300 font-mono truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-300 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{c.phonePrimary}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 text-[11px]">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{c.matters || 1} Active Matter(s)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-zinc-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {/* Call Action */}
                  <a
                    href={`tel:${c.phonePrimary}`}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    title={`Call ${c.name}`}
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call</span>
                  </a>

                  {/* Email Action */}
                  {can('clients.email') && (
                    <button
                      onClick={() => handleOpenEmail(c)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                      title={`Email ${c.name}`}
                    >
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      <span>Email</span>
                    </button>
                  )}

                  {/* WhatsApp Action */}
                  {can('clients.whatsapp') && (
                    <button
                      onClick={() => handleWhatsApp(c.phonePrimary, c.name)}
                      className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer border border-emerald-500/20"
                      title="Send WhatsApp Message"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  )}
                </div>

                {/* Delete Action */}
                {can('clients.delete') && (
                  <button
                    onClick={() => handleDeleteClient(c.id, c.name)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors cursor-pointer"
                    title="Delete Client"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="p-12 text-center modulix-card">
          <p className="text-slate-400 text-sm">No clients found matching "{search}"</p>
        </div>
      )}

      {/* REGISTER NEW CLIENT MODAL */}
      {showNewClientModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="font-brand font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" /> Register New Law Firm Client
              </h3>
              <button
                onClick={() => setShowNewClientModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterClient} className="space-y-3.5">
              <div>
                <label className="block text-[var(--text-main)] font-semibold mb-1">
                  Client Name / Individual
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Seyani Brothers & Co."
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[var(--text-main)] font-semibold mb-1">
                  Company / Organization Name
                </label>
                <input
                  type="text"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="e.g. Seyani Brothers Limited"
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[var(--text-main)] font-semibold mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)] focus:outline-none focus:border-blue-500"
                >
                  <option value="Corporate or Institutional">Corporate or Institutional</option>
                  <option value="Individual Client">Individual Client</option>
                  <option value="Family Trust / Estate">Family Trust / Estate</option>
                  <option value="Government Entity">Government Entity</option>
                </select>
              </div>

              <div>
                <label className="block text-[var(--text-main)] font-semibold mb-1">
                  Official Email
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="client@company.co.ke"
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)] font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-main)] font-semibold mb-1">
                    Primary Phone
                  </label>
                  <input
                    type="text"
                    value={newPhonePrimary}
                    onChange={(e) => setNewPhonePrimary(e.target.value)}
                    placeholder="+254 700 000 000"
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)] font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-main)] font-semibold mb-1">
                    Secondary Phone
                  </label>
                  <input
                    type="text"
                    value={newPhoneSecondary}
                    onChange={(e) => setNewPhoneSecondary(e.target.value)}
                    placeholder="+254 20 000 0000"
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)] font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setShowNewClientModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-zinc-700 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EMAIL COMPOSE MODAL */}
      {showEmailModal && emailClient && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="font-brand font-bold text-sm text-[var(--text-main)]">
                Compose Email to {emailClient.name}
              </h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-3">
              <div>
                <label className="block text-[var(--text-main)] font-semibold mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={emailClient.email}
                  readOnly
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 font-mono text-[var(--text-main)] opacity-80"
                />
              </div>

              <div>
                <label className="block text-[var(--text-main)] font-semibold mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)] font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[var(--text-main)] font-semibold mb-1">
                  Message Body
                </label>
                <textarea
                  rows={5}
                  required
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl p-3 text-[var(--text-main)] font-sans leading-relaxed focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-zinc-700 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> {isSending ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsView;
