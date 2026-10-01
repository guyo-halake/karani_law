import React, { useState, useEffect } from 'react';
import {
  Home,
  FileText,
  Briefcase,
  Users,
  Folder,
  BookOpen,
  Settings,
  HelpCircle,
  X,
  ChevronDown,
  ChevronRight,
  LogOut,
  ShieldCheck,
  Clock,
  TrendingUp,
  Lock,
  Activity
} from 'lucide-react';

import { SystemUser, getFeeNotes } from '../../services/supabase';
import { hasPermission } from '../../services/rbac';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  currentUser?: SystemUser | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  sidebarOpen,
  setSidebarOpen,
  currentUser,
  onLogout
}) => {
  const [mattersExpanded, setMattersExpanded] = useState(false);
  const [feeNotesCount, setFeeNotesCount] = useState<number>(() => getFeeNotes().length);
  const [, setPermissionTick] = useState(0);

  const can = (code: string) => hasPermission(currentUser, code);

  const [firmSettings, setFirmSettings] = useState(() => {
    const saved = localStorage.getItem('BILLSZIP_FIRM_SETTINGS');
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    return { topbarTitle: 'Kithinji & Co', topbarSubtitle: 'Advocates of the High Court of Kenya', logoUrl: '/logo.png' };
  });

  useEffect(() => {
    const handleSettingsChange = () => {
      const saved = localStorage.getItem('BILLSZIP_FIRM_SETTINGS');
      if (saved) {
        try { setFirmSettings(JSON.parse(saved)); } catch(e) {}
      }
    };
    const handleFeeNotes = () => {
      setFeeNotesCount(getFeeNotes().length);
    };
    const handlePermissions = () => {
      setPermissionTick(t => t + 1);
    };

    window.addEventListener('firmSettingsChanged', handleSettingsChange);
    window.addEventListener('feeNotesUpdated', handleFeeNotes);
    window.addEventListener('permissionsUpdated', handlePermissions);
    window.addEventListener('storage', handlePermissions);
    window.addEventListener('storage', handleFeeNotes);

    return () => {
      window.removeEventListener('firmSettingsChanged', handleSettingsChange);
      window.removeEventListener('feeNotesUpdated', handleFeeNotes);
      window.removeEventListener('permissionsUpdated', handlePermissions);
      window.removeEventListener('storage', handlePermissions);
      window.removeEventListener('storage', handleFeeNotes);
    };
  }, []);

  const handleSelect = (id: string) => {
    setCurrentTab(id);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleLogOut = () => {
    localStorage.removeItem('BILLSZIP_SESSION');
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <>
      {/* Invisible Hover Trigger on Left Screen Edge */}
      {!sidebarOpen && (
        <div 
          onMouseEnter={() => setSidebarOpen(true)}
          className="fixed left-0 top-0 bottom-0 w-3 z-30 hidden lg:block cursor-pointer hover:bg-blue-500/10 transition-colors"
          title="Hover to open navigation sidebar"
        />
      )}

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* Unified Seamless Sidebar with Hover Sensor */}
      <aside
        onMouseEnter={() => {
          if (window.innerWidth >= 1024) setSidebarOpen(true);
        }}
        className={`fixed lg:static top-0 bottom-0 left-0 w-64 border-r border-[var(--border-color)] bg-[var(--bg-card)] flex flex-col justify-between z-50 lg:z-10 transition-all duration-300 ease-in-out shrink-0 overflow-hidden shadow-2xl lg:shadow-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:w-0 lg:p-0 lg:border-none'
        }`}
      >
        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Top Logo Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]/60">
            <div className="flex flex-col items-center text-center gap-1.5 pt-1 pb-1 w-full relative">
              <img
                src={firmSettings.logoUrl || '/logo.png'}
                alt="Logo"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/logo.png';
                }}
                className="h-16 max-w-[180px] w-auto object-contain shrink-0"
              />
              <div className="w-full">
                <span className="font-brand font-extrabold text-sm text-slate-900 dark:text-white block tracking-tight">
                  {firmSettings.topbarTitle}
                </span>
                <span className="text-[10px] text-slate-500 font-sans block leading-tight mt-0.5">
                  {firmSettings.topbarSubtitle}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="text-slate-400 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors lg:hidden"
              title="Close Menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Unified Seamless Navigation List (In exact order requested) */}
          <nav className="space-y-1">
            
            {/* 1. Dashboard */}
            {can('dashboard.view') && (
              <button
                onClick={() => handleSelect('home')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  currentTab === 'home'
                    ? 'modulix-active-nav font-bold shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Home className="w-4 h-4 shrink-0 text-slate-700 dark:text-zinc-300" />
                  <span>Dashboard</span>
                </div>
              </button>
            )}

            {/* 2. BOC Builder */}
            {can('boc.view') && (
              <button
                onClick={() => handleSelect('boc')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  currentTab === 'boc'
                    ? 'modulix-active-nav font-bold shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 shrink-0 text-slate-700 dark:text-zinc-300" />
                  <span>BOC Builder</span>
                </div>
              </button>
            )}

            {/* 3. Fee Notes */}
            {can('feenotes.view') && (
              <button
                onClick={() => handleSelect('feenotes')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  currentTab === 'feenotes'
                    ? 'modulix-active-nav font-bold shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 shrink-0 text-slate-700 dark:text-zinc-300" />
                  <span>Fee Notes</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/20">
                  {feeNotesCount}
                </span>
              </button>
            )}

            {/* 4. My Matters */}
            {can('matters.view') && (
              <div>
                <button
                  onClick={() => {
                    handleSelect('matters');
                    setMattersExpanded(!mattersExpanded);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    currentTab === 'matters'
                      ? 'modulix-active-nav font-bold shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 shrink-0 text-slate-700 dark:text-zinc-300" />
                    <span>My Matters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {mattersExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                </button>

                {mattersExpanded && (
                  <div className="pl-6 pt-1 space-y-0.5 subtree-connector">
                    <button
                      onClick={() => handleSelect('matters')}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100/60 dark:hover:bg-zinc-800/40 text-left"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      <span>High Court Commercial</span>
                    </button>
                    <button
                      onClick={() => handleSelect('matters')}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100/60 dark:hover:bg-zinc-800/40 text-left"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Subordinate Court</span>
                    </button>
                    <button
                      onClick={() => handleSelect('matters')}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100/60 dark:hover:bg-zinc-800/40 text-left"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                      <span>Arbitration Tribunal</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 5. My Clients */}
            {can('clients.view') && (
              <button
                onClick={() => handleSelect('clients')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  currentTab === 'clients'
                    ? 'modulix-active-nav font-bold shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 shrink-0 text-slate-700 dark:text-zinc-300" />
                  <span>My Clients</span>
                </div>
              </button>
            )}

            {/* 6. Remuneration Guide */}
            {can('guide.view') && (
              <button
                onClick={() => handleSelect('guide')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  currentTab === 'guide'
                    ? 'modulix-active-nav font-bold shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4 shrink-0 text-slate-700 dark:text-zinc-300" />
                <span>Remuneration Guide</span>
              </button>
            )}

            {/* 7. Firm Settings */}
            {can('settings.view') && (
              <button
                onClick={() => handleSelect('settings')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  currentTab === 'settings'
                    ? 'modulix-active-nav font-bold shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4 shrink-0 text-slate-700 dark:text-zinc-300" />
                <span>Firm Settings</span>
              </button>
            )}

            {/* 8. Document Vault */}
            {can('vault.view') && (
              <button
                onClick={() => handleSelect('vault')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  currentTab === 'vault'
                    ? 'modulix-active-nav font-bold shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Folder className="w-4 h-4 shrink-0 text-slate-700 dark:text-zinc-300" />
                  <span>Document Vault</span>
                </div>
              </button>
            )}

            {/* 9. Support & Help */}
            {can('support.view') && (
              <button
                onClick={() => handleSelect('support')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  currentTab === 'support'
                    ? 'modulix-active-nav font-bold shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <HelpCircle className="w-4 h-4 shrink-0 text-slate-700 dark:text-zinc-300" />
                <span>Support & Help</span>
              </button>
            )}

            {/* 10. Permissions & Templates */}
            {(can('permissions.view') || currentUser?.role === 'Admin' || currentUser?.role === 'Developer') && (
              <button
                onClick={() => handleSelect('permissions')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  (currentTab === 'permissions' || currentTab === 'managing_permissions')
                    ? 'modulix-active-nav font-bold shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 shrink-0 text-slate-700 dark:text-zinc-300" />
                  <span>Permissions & Templates</span>
                </div>
              </button>
            )}

            {/* 11. Executive Hub */}
            {(can('managing_hub.view') || currentUser?.role === 'Admin' || currentUser?.role === 'Developer') && (
              <button
                onClick={() => handleSelect('managing_hub')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  currentTab === 'managing_hub'
                    ? 'modulix-active-nav font-bold shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-slate-700 dark:text-zinc-300" />
                  <span>Executive Hub</span>
                </div>
              </button>
            )}

          </nav>
        </div>

        {/* Pinned Minimalist Footer (Strictly in Sora font as requested) */}
        <div className="shrink-0 p-4 border-t border-[var(--border-color)]/60 bg-[var(--bg-subtle)]/40 text-center select-none font-['Sora']">
          <div className="text-[11px] font-extrabold tracking-tight text-slate-800 dark:text-zinc-200">
            FNB V1.3 Beta Version
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">
            P3L Developers, Kenya
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
