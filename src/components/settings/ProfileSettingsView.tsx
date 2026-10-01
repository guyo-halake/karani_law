import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Building2,
  Calculator,
  Palette,
  Bell,
  ShieldCheck,
  Save,
  CheckCircle2,
  Moon,
  Sun,
  Camera,
  Upload,
  Download,
  KeyRound,
  FileText,
  Mail,
  Phone,
  MapPin,
  Landmark,
  Briefcase,
  Layers,
  Sliders,
  Sparkles,
  Lock,
  Clock,
  Eye,
  EyeOff,
  Check,
  Share2,
  AlertCircle
} from 'lucide-react';
import { supabase, SystemUser, EXACT_FIRM_INFO, getFeeNotes } from '../../services/supabase';
import { logSystemActivity } from '../../services/activityLogger';
import { hasPermission } from '../../services/rbac';

interface SettingsProps {
  currentUser?: SystemUser | null;
  isDarkMode?: boolean;
  toggleTheme?: () => void;
  initialTab?: 'profile' | 'firm' | 'calculator' | 'appearance' | 'notifications' | 'security';
}

export const ProfileSettingsView: React.FC<SettingsProps> = ({
  currentUser,
  isDarkMode = false,
  toggleTheme,
  initialTab = 'profile'
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'firm' | 'calculator' | 'appearance' | 'notifications' | 'security'>(initialTab);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const can = (code: string) => hasPermission(currentUser, code);

  // Resolve active logged in user from props or session storage
  const getActiveUser = (): Partial<SystemUser> => {
    if (currentUser && currentUser.fullName) return currentUser;
    try {
      const saved = localStorage.getItem('BILLSZIP_SESSION');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.fullName || parsed.workEmail)) return parsed;
      }
    } catch (e) {}
    return currentUser || {};
  };

  const initialUser = getActiveUser();

  // --------------------------------------------------------------------------
  // MODULE 1: ADVOCATE PROFILE STATE (REAL-TIME AUTHENTICATED USER DATA)
  // --------------------------------------------------------------------------
  const [userFullName, setUserFullName] = useState(initialUser.fullName || '');
  const [userTitle, setUserTitle] = useState(initialUser.advocateTitle || (initialUser.fullName ? `Adv. ${initialUser.fullName}` : ''));
  const [userLskNo, setUserLskNo] = useState(initialUser.lskNo || '');
  const [userPosition, setUserPosition] = useState(initialUser.position || 'Senior Advocate');
  const [userDepartment, setUserDepartment] = useState(initialUser.department || 'Commercial & Civil Litigation');
  const [userWorkEmail, setUserWorkEmail] = useState(initialUser.workEmail || initialUser.personalEmail || '');
  const [userPersonalEmail, setUserPersonalEmail] = useState(initialUser.personalEmail || initialUser.workEmail || '');
  const [userPhonePrimary, setUserPhonePrimary] = useState(initialUser.phonePrimary || '+254 700 000 000');
  const [userPhoneSecondary, setUserPhoneSecondary] = useState(initialUser.phoneSecondary || '');
  const [userAvatarUrl, setUserAvatarUrl] = useState(initialUser.avatarUrl || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const active = getActiveUser();
    if (active.fullName || active.workEmail) {
      setUserFullName(active.fullName || '');
      setUserTitle(active.advocateTitle || (active.fullName ? `Adv. ${active.fullName}` : ''));
      setUserLskNo(active.lskNo || '');
      setUserPosition(active.position || 'Senior Advocate');
      setUserDepartment(active.department || 'Commercial & Civil Litigation');
      setUserWorkEmail(active.workEmail || active.personalEmail || '');
      setUserPersonalEmail(active.personalEmail || active.workEmail || '');
      setUserPhonePrimary(active.phonePrimary || '+254 700 000 000');
      setUserPhoneSecondary(active.phoneSecondary || '');
      setUserAvatarUrl(active.avatarUrl || '');
    }

    // Live sync directly from Supabase if user ID is available
    const syncRemoteUser = async () => {
      if (active.id) {
        try {
          const { data, error } = await supabase.from('users').select('*').eq('id', active.id).single();
          if (!error && data) {
            setUserFullName(data.full_name || active.fullName || '');
            setUserTitle(data.advocate_title || active.advocateTitle || '');
            setUserLskNo(data.lsk_no || active.lskNo || '');
            setUserPosition(data.position || active.position || 'Senior Advocate');
            setUserDepartment(data.department || active.department || 'Commercial & Civil Litigation');
            setUserWorkEmail(data.work_email || active.workEmail || '');
            setUserPersonalEmail(data.personal_email || active.personalEmail || '');
            setUserPhonePrimary(data.phone_primary || active.phonePrimary || '+254 700 000 000');
            setUserPhoneSecondary(data.phone_secondary || active.phoneSecondary || '');
            setUserAvatarUrl(data.avatar_url || active.avatarUrl || '');
          }
        } catch (e) {}
      }
    };
    syncRemoteUser();
  }, [currentUser]);

  // --------------------------------------------------------------------------
  // MODULE 2: FIRM BRANDING & LETTERHEAD STATE
  // --------------------------------------------------------------------------
  const [firmSettings, setFirmSettings] = useState(() => {
    const saved = localStorage.getItem('BILLSZIP_FIRM_SETTINGS');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      topbarTitle: EXACT_FIRM_INFO.name || 'Kithinji & Co',
      topbarSubtitle: (EXACT_FIRM_INFO as any).title || 'Advocates of the High Court of Kenya',
      logoUrl: EXACT_FIRM_INFO.logoUrl || '/logo.png',
      poBox: EXACT_FIRM_INFO.poBox || 'P.O. Box 45892-00100, Nairobi, Kenya',
      address: EXACT_FIRM_INFO.address || 'Upper Hill Financial District, Mbaruk Road off Ngong Road',
      phone: EXACT_FIRM_INFO.phone || '+254 (0)20 271 8900 / +254 722 000 000',
      email: EXACT_FIRM_INFO.email || 'info@kithinjilegal.co.ke',
      kraPin: EXACT_FIRM_INFO.kraPin || 'P051234567Z',
      vatNumber: (EXACT_FIRM_INFO as any).vatNumber || 'VAT-0192834-K',
      bankDetails: EXACT_FIRM_INFO.bankDetails || 'Standard Chartered Bank • Account: 010203040506 • Branch: Kenyatta Avenue'
    };
  });

  // --------------------------------------------------------------------------
  // MODULE 3: BOC CALCULATOR & SCALE ENGINE STATE
  // --------------------------------------------------------------------------
  const [calcSettings, setCalcSettings] = useState(() => {
    const saved = localStorage.getItem('BILLSZIP_CALC_SETTINGS');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      defaultSchedule: 'schedule_6_high_court',
      defaultParty: 'plaintiff',
      autoGettingUp: false,
      autoVat: true,
      folioRate: 50,
      billNumberPrefix: 'FN',
      defaultCourtForum: 'REPUBLIC OF KENYA\nIN THE HIGH COURT OF KENYA'
    };
  });

  // --------------------------------------------------------------------------
  // MODULE 4: APPEARANCE & DISPLAY STATE
  // --------------------------------------------------------------------------
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('BILLSZIP_ACCENT') || 'obsidian');
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('BILLSZIP_FONT_SIZE') || 'standard');
  const [tableDensity, setTableDensity] = useState(() => localStorage.getItem('BILLSZIP_TABLE_DENSITY') || 'standard');
  const [showGraphWidget, setShowGraphWidget] = useState<boolean>(() => localStorage.getItem('BILLSZIP_SHOW_GRAPH') === 'true');
  const [sidebarHoverEnabled, setSidebarHoverEnabled] = useState<boolean>(() => localStorage.getItem('BILLSZIP_SIDEBAR_HOVER') !== 'false');

  // --------------------------------------------------------------------------
  // MODULE 5: NOTIFICATIONS & DISPATCH STATE
  // --------------------------------------------------------------------------
  const [notifSettings, setNotifSettings] = useState(() => {
    const saved = localStorage.getItem('BILLSZIP_NOTIF_SETTINGS');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      emailOnDraft: true,
      emailOnApproval: true,
      dailyMorningDigest: true,
      clientDeliveryChannel: 'email',
      toastDuration: '3'
    };
  });

  // --------------------------------------------------------------------------
  // MODULE 6: SECURITY & SESSION TIMEOUT STATE
  // --------------------------------------------------------------------------
  const [sessionTimeout, setSessionTimeout] = useState(() => localStorage.getItem('BILLSZIP_SESSION_TIMEOUT') || '30');
  const [auditLoggingEnabled, setAuditLoggingEnabled] = useState(() => localStorage.getItem('BILLSZIP_AUDIT_LOGGING') !== 'false');

  // --------------------------------------------------------------------------
  // HANDLERS: SAVE & DISPATCH
  // --------------------------------------------------------------------------
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Avatar Upload Handler
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      showToast('Avatar file size must be under 4MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setUserAvatarUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Firm Logo Upload Handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setFirmSettings((prev: any) => ({ ...prev, logoUrl: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Save Advocate Profile
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentUser?.id) {
      showToast('Profile saved locally.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      showToast('Password confirmation does not match.');
      return;
    }

    try {
      const updatedData: any = {
        full_name: userFullName.trim() || currentUser.fullName,
        advocate_title: userTitle.trim() || currentUser.advocateTitle,
        lsk_no: userLskNo.trim() || currentUser.lskNo,
        position: userPosition.trim() || currentUser.position,
        department: userDepartment.trim(),
        work_email: userWorkEmail.trim() || currentUser.workEmail,
        personal_email: userPersonalEmail.trim() || currentUser.personalEmail,
        phone_primary: userPhonePrimary.trim() || currentUser.phonePrimary,
        phone_secondary: userPhoneSecondary.trim() || currentUser.phoneSecondary,
        avatar_url: userAvatarUrl || currentUser.avatarUrl
      };

      if (newPassword) {
        updatedData.password_hash = newPassword;
      }

      const { data, error } = await supabase
        .from('users')
        .update(updatedData)
        .eq('id', currentUser.id)
        .select('*')
        .single();

      const mergedUser: SystemUser = {
        ...currentUser,
        fullName: userFullName.trim() || currentUser.fullName,
        advocateTitle: userTitle.trim() || currentUser.advocateTitle,
        lskNo: userLskNo.trim() || currentUser.lskNo,
        position: userPosition.trim() || currentUser.position,
        department: userDepartment.trim(),
        workEmail: userWorkEmail.trim() || currentUser.workEmail,
        personalEmail: userPersonalEmail.trim() || currentUser.personalEmail,
        phonePrimary: userPhonePrimary.trim() || currentUser.phonePrimary,
        phoneSecondary: userPhoneSecondary.trim() || currentUser.phoneSecondary,
        avatarUrl: userAvatarUrl || currentUser.avatarUrl
      };

      localStorage.setItem('BILLSZIP_SESSION', JSON.stringify(mergedUser));
      window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: mergedUser }));
      
      logSystemActivity(
        mergedUser.fullName,
        'updated advocate profile coordinates and preferences',
        'profile',
        'bg-blue-500'
      );

      setNewPassword('');
      setConfirmPassword('');
      showToast('Advocate Profile successfully updated.');
    } catch (err: any) {
      showToast(err.message || 'Saved to session.');
    }
  };

  // Save Firm Branding Settings
  const handleSaveFirmSettings = async () => {
    localStorage.setItem('BILLSZIP_FIRM_SETTINGS', JSON.stringify(firmSettings));
    window.dispatchEvent(new CustomEvent('firmSettingsChanged', { detail: firmSettings }));
    
    // Also sync to Supabase firms table if available
    if (currentUser?.firmId) {
      try {
        await supabase.from('firms').update({
          name: firmSettings.topbarTitle,
          address: firmSettings.address,
          po_box: firmSettings.poBox,
          phone: firmSettings.phone,
          email: firmSettings.email,
          kra_pin: firmSettings.kraPin,
          vat_number: firmSettings.vatNumber,
          bank_details: firmSettings.bankDetails,
          logo_url: firmSettings.logoUrl
        }).eq('id', currentUser.firmId);
      } catch (e) {}
    }

    logSystemActivity(
      currentUser?.fullName || 'Managing Partner',
      `updated firm letterhead branding: ${firmSettings.topbarTitle}`,
      'settings',
      'bg-purple-500'
    );
    showToast('Firm Branding & Letterhead updated in real time.');
  };

  // Save Calculator & Fee Engine
  const handleSaveCalcSettings = () => {
    localStorage.setItem('BILLSZIP_CALC_SETTINGS', JSON.stringify(calcSettings));
    showToast('Bill of Costs Calculation rules saved.');
  };

  // Save Appearance & UI
  const handleSaveAppearance = () => {
    localStorage.setItem('BILLSZIP_ACCENT', accentColor);
    localStorage.setItem('theme_accent', accentColor);
    localStorage.setItem('BILLSZIP_FONT_SIZE', fontSize);
    localStorage.setItem('BILLSZIP_TABLE_DENSITY', tableDensity);
    localStorage.setItem('BILLSZIP_SHOW_GRAPH', showGraphWidget ? 'true' : 'false');
    localStorage.setItem('BILLSZIP_SIDEBAR_HOVER', sidebarHoverEnabled ? 'true' : 'false');

    document.documentElement.setAttribute('data-accent', accentColor);
    document.documentElement.setAttribute('data-font-size', fontSize);
    document.documentElement.setAttribute('data-density', tableDensity);

    if (fontSize === 'compact') {
      document.documentElement.style.fontSize = '13px';
    } else if (fontSize === 'large') {
      document.documentElement.style.fontSize = '15.5px';
    } else {
      document.documentElement.style.fontSize = '14px';
    }

    window.dispatchEvent(new CustomEvent('appearanceSettingsChanged', {
      detail: { accentColor, fontSize, tableDensity, showGraphWidget, sidebarHoverEnabled }
    }));
    window.dispatchEvent(new CustomEvent('sidebarHoverChanged', { detail: sidebarHoverEnabled }));
    window.dispatchEvent(new CustomEvent('showGraphWidgetChanged', { detail: showGraphWidget }));

    showToast('Display & UI preferences saved and applied in real time.');
  };

  // Save Notifications
  const handleSaveNotifications = () => {
    localStorage.setItem('BILLSZIP_NOTIF_SETTINGS', JSON.stringify(notifSettings));
    showToast('Notification & Dispatch preferences saved.');
  };

  // Save Security & Session
  const handleSaveSecurity = () => {
    localStorage.setItem('BILLSZIP_SESSION_TIMEOUT', sessionTimeout);
    localStorage.setItem('BILLSZIP_AUDIT_LOGGING', auditLoggingEnabled ? 'true' : 'false');
    showToast('Security & Session configurations updated.');
  };

  // Master Save All
  const handleSaveAll = () => {
    handleSaveProfile();
    handleSaveFirmSettings();
    handleSaveCalcSettings();
    handleSaveAppearance();
    handleSaveNotifications();
    handleSaveSecurity();
  };

  // Export Complete Firm Data (JSON Backup)
  const handleExportBackup = () => {
    const feeNotes = getFeeNotes();
    const backupData = {
      exportedAt: new Date().toISOString(),
      firm: firmSettings,
      calculationRules: calcSettings,
      feeNotesCount: feeNotes.length,
      feeNotes: feeNotes
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `firm_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('Firm database backup downloaded.');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      
      {/* Hidden File Upload Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarUpload}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />
      <input
        type="file"
        ref={logoInputRef}
        onChange={handleLogoUpload}
        accept="image/png, image/jpeg, image/svg+xml, image/webp"
        className="hidden"
      />

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-fadeIn border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Command Suite Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-[var(--border-color)]/60 pb-4">
        <div>
          <h1 className="font-brand font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">
            Firm Settings & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5 font-sans">
            Configure advocate coordinates, letterhead branding, calculation scales, and security
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportBackup}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 border border-[var(--border-color)] hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Download full firm database JSON backup"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup Data</span>
          </button>
          
          <button
            onClick={handleSaveAll}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-black dark:hover:bg-slate-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save All Changes</span>
          </button>
        </div>
      </div>

      {/* iOS / iPhone Segmented Control Pill Bar */}
      <div className="flex items-center p-1 rounded-2xl bg-slate-200/70 dark:bg-zinc-800/80 border border-[var(--border-color)]/50 overflow-x-auto">
        {[
          { id: 'profile' as const, label: 'Advocate Profile', icon: User },
          { id: 'firm' as const, label: 'Firm Branding', icon: Building2 },
          { id: 'calculator' as const, label: 'Calculation Engine', icon: Calculator },
          { id: 'appearance' as const, label: 'Appearance & UI', icon: Palette },
          { id: 'notifications' as const, label: 'Alerts & Dispatch', icon: Bell },
          { id: 'security' as const, label: 'Security & Access', icon: ShieldCheck },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                isActive 
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs font-bold' 
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ADVOCATE IDENTITY & CREDENTIALS */}
      {activeTab === 'profile' && (
        <div className="modulix-card p-6 sm:p-8 space-y-6 border border-[var(--border-color)] bg-white dark:bg-zinc-900 shadow-xs animate-fadeIn">
          
          {/* Avatar & Hero Identity */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-[var(--border-color)]/60">
            <div className="relative group shrink-0">
              {userAvatarUrl ? (
                <img
                  src={userAvatarUrl}
                  alt={userFullName}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-[var(--border-color)] shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-zinc-800 border-2 border-[var(--border-color)] text-slate-800 dark:text-zinc-200 flex items-center justify-center font-brand font-bold text-2xl shadow-sm">
                  {userFullName ? userFullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'AD'}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 text-white rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold"
              >
                <Camera className="w-5 h-5 mb-0.5" />
                Change
              </button>
            </div>

            <div className="space-y-1 text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                <h2 className="font-brand font-bold text-lg text-slate-900 dark:text-white">
                  {userTitle || userFullName || 'Advocate Profile'}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-medium">
                  {currentUser?.role || 'Advocate'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-sans">
                {userPosition} &middot; {userDepartment}
              </p>
              <p className="text-[11px] font-mono text-slate-400">
                LSK Roll: {userLskNo || 'Unspecified'} &middot; {userWorkEmail}
              </p>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl text-xs font-medium border border-[var(--border-color)] text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Upload Photo
            </button>
          </div>

          {/* Form Fields: Professional Coordinates */}
          <div className="space-y-4">
            <h3 className="font-brand font-bold text-xs uppercase tracking-wider text-slate-500">
              Professional & Practice Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Full Legal Name:
                </label>
                <input
                  type="text"
                  value={userFullName}
                  onChange={e => setUserFullName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Honorific Title:
                </label>
                <input
                  type="text"
                  value={userTitle}
                  onChange={e => setUserTitle(e.target.value)}
                  placeholder="e.g. Adv. Nyagah Kithinji"
                  className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                  LSK Admission Roll No:
                </label>
                <input
                  type="text"
                  value={userLskNo}
                  onChange={e => setUserLskNo(e.target.value)}
                  placeholder="e.g. P.105/14982/20"
                  className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 font-mono text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Firm Practice Designation:
                </label>
                <input
                  type="text"
                  value={userPosition}
                  onChange={e => setUserPosition(e.target.value)}
                  placeholder="e.g. Senior Partner / Lead Counsel"
                  className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Practice Department:
                </label>
                <input
                  type="text"
                  value={userDepartment}
                  onChange={e => setUserDepartment(e.target.value)}
                  placeholder="e.g. Commercial & Civil Litigation"
                  className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Contact Coordinates */}
          <div className="space-y-4 pt-2 border-t border-[var(--border-color)]/60">
            <h3 className="font-brand font-bold text-xs uppercase tracking-wider text-slate-500">
              Contact & Dispatches
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Work Company Email:
                </label>
                <input
                  type="email"
                  value={userWorkEmail}
                  onChange={e => setUserWorkEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 font-mono text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Personal Alternate Email:
                </label>
                <input
                  type="email"
                  value={userPersonalEmail}
                  onChange={e => setUserPersonalEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 font-mono text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Primary Mobile / Telephone:
                </label>
                <input
                  type="text"
                  value={userPhonePrimary}
                  onChange={e => setUserPhonePrimary(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 font-mono text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Secondary Mobile / WhatsApp:
                </label>
                <input
                  type="text"
                  value={userPhoneSecondary}
                  onChange={e => setUserPhoneSecondary(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 font-mono text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Account Password Reset */}
          <div className="space-y-4 pt-2 border-t border-[var(--border-color)]/60">
            <h3 className="font-brand font-bold text-xs uppercase tracking-wider text-slate-500">
              Security & Credentials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                  New Password:
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Confirm Password:
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={handleSaveProfile}
              className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold hover:bg-black dark:hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Update Profile</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: FIRM BRANDING & LETTERHEAD */}
      {activeTab === 'firm' && (
        <div className="modulix-card p-6 sm:p-8 space-y-6 border border-[var(--border-color)] bg-white dark:bg-zinc-900 shadow-xs animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-[var(--border-color)]/60">
            <div className="relative group shrink-0">
              <img
                src={firmSettings.logoUrl || '/logo.png'}
                alt="Firm Logo"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/logo.png';
                }}
                className="h-20 max-w-[200px] w-auto object-contain p-2 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-[var(--border-color)] shadow-xs"
              />
              <button
                onClick={() => logoInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 text-white rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold"
              >
                <Camera className="w-5 h-5 mb-0.5" />
                Change
              </button>
            </div>

            <div className="space-y-1 text-center sm:text-left flex-1">
              <h2 className="font-brand font-bold text-lg text-slate-900 dark:text-white">
                {firmSettings.topbarTitle}
              </h2>
              <p className="text-xs text-slate-500 font-sans">
                {firmSettings.topbarSubtitle}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                Logo displays on navigation bar, sidebar, and exported bills of costs
              </p>
            </div>

            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl text-xs font-medium border border-[var(--border-color)] text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Upload Logo
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="font-brand font-bold text-xs uppercase tracking-wider text-slate-500">
              Corporate Name & Identification
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Firm Legal Name:
                </label>
                <input
                  type="text"
                  value={firmSettings.topbarTitle}
                  onChange={e => setFirmSettings({ ...firmSettings, topbarTitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 font-bold text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Practice Subtitle / Banner:
                </label>
                <input
                  type="text"
                  value={firmSettings.topbarSubtitle}
                  onChange={e => setFirmSettings({ ...firmSettings, topbarSubtitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-[var(--border-color)]/60">
            <h3 className="font-brand font-bold text-xs uppercase tracking-wider text-slate-500">
              Postal & Physical Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Postal Box & Code:
                </label>
                <input
                  type="text"
                  value={firmSettings.poBox}
                  onChange={e => setFirmSettings({ ...firmSettings, poBox: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Physical Office Chambers:
                </label>
                <input
                  type="text"
                  value={firmSettings.address}
                  onChange={e => setFirmSettings({ ...firmSettings, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Official Switchboard / Telephone:
                </label>
                <input
                  type="text"
                  value={firmSettings.phone}
                  onChange={e => setFirmSettings({ ...firmSettings, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 font-mono text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                  General Inquiries Email:
                </label>
                <input
                  type="email"
                  value={firmSettings.email}
                  onChange={e => setFirmSettings({ ...firmSettings, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 font-mono text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-[var(--border-color)]/60">
            <h3 className="font-brand font-bold text-xs uppercase tracking-wider text-slate-500">
              Taxation & Settlement Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Firm KRA PIN:
                </label>
                <input
                  type="text"
                  value={firmSettings.kraPin}
                  onChange={e => setFirmSettings({ ...firmSettings, kraPin: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 font-mono text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                  VAT Registration No:
                </label>
                <input
                  type="text"
                  value={firmSettings.vatNumber}
                  onChange={e => setFirmSettings({ ...firmSettings, vatNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 font-mono text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                Bank Remittance & Settlement Instructions:
              </label>
              <textarea
                rows={2}
                value={firmSettings.bankDetails}
                onChange={e => setFirmSettings({ ...firmSettings, bankDetails: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={handleSaveFirmSettings}
              className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold hover:bg-black dark:hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Firm Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: CALCULATION ENGINE & STATUTORY RULES */}
      {activeTab === 'calculator' && (
        <div className="modulix-card p-6 sm:p-8 space-y-6 border border-[var(--border-color)] bg-white dark:bg-zinc-900 shadow-xs animate-fadeIn">
          <div>
            <h2 className="font-brand font-bold text-base text-slate-900 dark:text-white">
              Statutory Remuneration & Calculation Rules
            </h2>
            <p className="text-xs text-slate-500">
              Configure default scales, folio rates, and fee note numbering sequences
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                Default Scale on New Bill:
              </label>
              <select
                value={calcSettings.defaultSchedule}
                onChange={e => setCalcSettings({ ...calcSettings, defaultSchedule: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="schedule_6_high_court">Schedule 6: High Court & Court of Appeal</option>
                <option value="schedule_1_conveyancing">Schedule 1: Conveyancing & Land Transactions</option>
                <option value="schedule_2_securities">Schedule 2: Debentures & Mortgages</option>
                <option value="schedule_3_company">Schedule 3: Probate & Company Formation</option>
                <option value="schedule_5_magistrate">Schedule 5: Subordinate / Magistrate Court</option>
                <option value="schedule_7_arbitration">Schedule 9: Arbitration & Tribunals</option>
              </select>
            </div>

            <div>
              <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                Default Party Scale:
              </label>
              <select
                value={calcSettings.defaultParty}
                onChange={e => setCalcSettings({ ...calcSettings, defaultParty: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="plaintiff">Plaintiff / Claimant (100% Standard Scale)</option>
                <option value="defendant">Defendant / Respondent (65% Scale)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                Default Folio Charge Rate (KES):
              </label>
              <input
                type="number"
                value={calcSettings.folioRate}
                onChange={e => setCalcSettings({ ...calcSettings, folioRate: Number(e.target.value) || 50 })}
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 font-mono text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                Bill of Costs Number Prefix:
              </label>
              <input
                type="text"
                value={calcSettings.billNumberPrefix}
                onChange={e => setCalcSettings({ ...calcSettings, billNumberPrefix: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 font-mono text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-[var(--border-color)]">
              <div>
                <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                  Automatic Statutory VAT (16%)
                </span>
                <span className="text-[11px] text-slate-500">
                  Automatically calculate 16% VAT on taxable professional fees
                </span>
              </div>
              <input
                type="checkbox"
                checked={calcSettings.autoVat}
                onChange={e => setCalcSettings({ ...calcSettings, autoVat: e.target.checked })}
                className="rounded w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-[var(--border-color)]">
              <div>
                <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                  Include One-Third Getting-Up Fee
                </span>
                <span className="text-[11px] text-slate-500">
                  Default to including 1/3 Getting-Up fee on qualifying litigation matters
                </span>
              </div>
              <input
                type="checkbox"
                checked={calcSettings.autoGettingUp}
                onChange={e => setCalcSettings({ ...calcSettings, autoGettingUp: e.target.checked })}
                className="rounded w-4 h-4 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={handleSaveCalcSettings}
              className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold hover:bg-black dark:hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Calculation Rules</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: APPEARANCE & DISPLAY */}
      {activeTab === 'appearance' && (
        <div className="modulix-card p-6 sm:p-8 space-y-6 border border-[var(--border-color)] bg-white dark:bg-zinc-900 shadow-xs animate-fadeIn">
          <div>
            <h2 className="font-brand font-bold text-base text-slate-900 dark:text-white">
              Visual Appearance & Display
            </h2>
            <p className="text-xs text-slate-500">
              Customize theme mode, accent palettes, typography, and density
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                Interface Theme:
              </label>
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 text-xs font-semibold text-slate-900 dark:text-white flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors"
              >
                <span className="flex items-center gap-2">
                  {isDarkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Toggle</span>
              </button>
            </div>

            <div>
              <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                Accent Palette:
              </label>
              <select
                value={accentColor}
                onChange={e => setAccentColor(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="obsidian">Obsidian Minimalist</option>
                <option value="navy">Royal Navy</option>
                <option value="emerald">High Court Emerald</option>
                <option value="gold">Kenyan Legal Gold</option>
              </select>
            </div>

            <div>
              <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                Typography Scale:
              </label>
              <select
                value={fontSize}
                onChange={e => setFontSize(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="compact">Compact (11px / 12px)</option>
                <option value="standard">Standard (12px / 13px)</option>
                <option value="large">Comfortable (13px / 14px)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-[var(--border-color)]">
              <div>
                <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                  Sidebar Edge Hover Trigger
                </span>
                <span className="text-[11px] text-slate-500">
                  Automatically open navigation when cursor moves near the left screen edge
                </span>
              </div>
              <input
                type="checkbox"
                checked={sidebarHoverEnabled}
                onChange={e => setSidebarHoverEnabled(e.target.checked)}
                className="rounded w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-[var(--border-color)]">
              <div>
                <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                  Dashboard Claim Overview Graph Widget
                </span>
                <span className="text-[11px] text-slate-500">
                  Display graphical breakdown of portfolio matter claims on home dashboard
                </span>
              </div>
              <input
                type="checkbox"
                checked={showGraphWidget}
                onChange={e => setShowGraphWidget(e.target.checked)}
                className="rounded w-4 h-4 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={handleSaveAppearance}
              className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold hover:bg-black dark:hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Display Preferences</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: NOTIFICATIONS & DISPATCH */}
      {activeTab === 'notifications' && (
        <div className="modulix-card p-6 sm:p-8 space-y-6 border border-[var(--border-color)] bg-white dark:bg-zinc-900 shadow-xs animate-fadeIn">
          <div>
            <h2 className="font-brand font-bold text-base text-slate-900 dark:text-white">
              Notifications & Communication Alerts
            </h2>
            <p className="text-xs text-slate-500">
              Manage automatic email dispatches, court alerts, and client communications
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-[var(--border-color)]">
              <div>
                <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                  Fee Note Approval Notifications
                </span>
                <span className="text-[11px] text-slate-500">
                  Receive an email alert when an executive approves a drafted bill of costs
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifSettings.emailOnApproval}
                onChange={e => setNotifSettings({ ...notifSettings, emailOnApproval: e.target.checked })}
                className="rounded w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-[var(--border-color)]">
              <div>
                <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                  New Fee Note Draft Alerts
                </span>
                <span className="text-[11px] text-slate-500">
                  Notify assigned lead advocate when a new fee note draft is registered
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifSettings.emailOnDraft}
                onChange={e => setNotifSettings({ ...notifSettings, emailOnDraft: e.target.checked })}
                className="rounded w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-[var(--border-color)]">
              <div>
                <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                  Daily Morning Court Docket Digest
                </span>
                <span className="text-[11px] text-slate-500">
                  Receive a summary of upcoming cause list dates and hearings every morning at 8:00 AM
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifSettings.dailyMorningDigest}
                onChange={e => setNotifSettings({ ...notifSettings, dailyMorningDigest: e.target.checked })}
                className="rounded w-4 h-4 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                Default Client Bill Delivery:
              </label>
              <select
                value={notifSettings.clientDeliveryChannel}
                onChange={e => setNotifSettings({ ...notifSettings, clientDeliveryChannel: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="email">PDF Email Attachment</option>
                <option value="whatsapp">WhatsApp Direct Share</option>
                <option value="both">Email & WhatsApp</option>
              </select>
            </div>

            <div>
              <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                In-App Toast Alert Duration:
              </label>
              <select
                value={notifSettings.toastDuration}
                onChange={e => setNotifSettings({ ...notifSettings, toastDuration: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="3">3 Seconds</option>
                <option value="5">5 Seconds</option>
                <option value="8">8 Seconds</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={handleSaveNotifications}
              className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold hover:bg-black dark:hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Alert Preferences</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: SECURITY & ACCESS */}
      {activeTab === 'security' && (
        <div className="modulix-card p-6 sm:p-8 space-y-6 border border-[var(--border-color)] bg-white dark:bg-zinc-900 shadow-xs animate-fadeIn">
          <div>
            <h2 className="font-brand font-bold text-base text-slate-900 dark:text-white">
              Security, Session & Access Control
            </h2>
            <p className="text-xs text-slate-500">
              Session timeouts, user permissions overview, and firm audit configuration
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                Active User Role Privilege:
              </label>
              <div className="p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 text-xs font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                <span>{currentUser?.role || 'Advocate'}</span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {currentUser?.hasAllPermissions ? 'Full Access' : 'Custom Permissions'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                Inactivity Session Timeout:
              </label>
              <select
                value={sessionTimeout}
                onChange={e => setSessionTimeout(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 font-mono text-xs text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="15">15 Minutes Inactivity</option>
                <option value="30">30 Minutes Inactivity</option>
                <option value="60">1 Hour Inactivity</option>
                <option value="never">Never (Stay Logged In)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-[var(--border-color)]">
              <div>
                <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                  Multi-User Event Audit Logging
                </span>
                <span className="text-[11px] text-slate-500">
                  Record calculations, imports, and profile changes to firm activity logs
                </span>
              </div>
              <input
                type="checkbox"
                checked={auditLoggingEnabled}
                onChange={e => setAuditLoggingEnabled(e.target.checked)}
                className="rounded w-4 h-4 cursor-pointer"
              />
            </div>
          </div>

          {/* Active Session Coordinates */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-[var(--border-color)] space-y-1 text-xs">
            <div className="font-bold text-slate-900 dark:text-white">Active Session Details</div>
            <div className="text-[11px] text-slate-500 font-mono">
              Signed in as <strong className="text-slate-700 dark:text-zinc-300">{currentUser?.workEmail || 'advocate'}</strong>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Client: {navigator.userAgent.slice(0, 60)}...
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={handleSaveSecurity}
              className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold hover:bg-black dark:hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Security Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* Pinned Minimalist Footer in Sora Font */}
      <footer className="pt-6 border-t border-[var(--border-color)]/60 text-center font-['Sora'] space-y-0.5 select-none">
        <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">
          FNB V1.3 Beta Version &middot; Bill of Costs Builder
        </div>
        <div className="text-[10px] text-slate-400">
          Developed by P3L Developers, Kenya
        </div>
      </footer>

    </div>
  );
};

export default ProfileSettingsView;
