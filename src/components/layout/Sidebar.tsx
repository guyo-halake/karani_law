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
  LogOut
} from 'lucide-react';

import { SystemUser, getFeeNotes } from '../../services/supabase';

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
  const [mattersExpanded, setMattersExpanded] = useState(true);
  const [feeNotesCount, setFeeNotesCount] = useState<number>(() => getFeeNotes().length);

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

    window.addEventListener('firmSettingsChanged', handleSettingsChange);
    window.addEventListener('feeNotesUpdated', handleFeeNotes);
    window.addEventListener('storage', handleFeeNotes);

    return () => {
      window.removeEventListener('firmSettingsChanged', handleSettingsChange);
      window.removeEventListener('feeNotesUpdated', handleFeeNotes);
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

  const userDisplayName = currentUser?.advocateTitle || currentUser?.fullName || (currentUser?.workEmail ? currentUser.workEmail.split('@')[0] : "Logged In Advocate");
  const userEmail = currentUser?.workEmail || currentUser?.personalEmail || "";
  const userInitials = currentUser?.fullName 
    ? currentUser.fullName.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase() 
    : (userDisplayName ? userDisplayName.substring(0, 2).toUpperCase() : "AD");

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* Modulix-Inspired Executive Sidebar */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 w-64 border-r border-[var(--border-color)] bg-[var(--bg-card)] p-4 flex flex-col justify-between z-50 lg:z-10 transition-all duration-200 ease-in-out shrink-0 overflow-y-auto ${
          sidebarOpen ? 'translate-x-0 shadow-2xl lg:shadow-none' : '-translate-x-full lg:w-0 lg:p-0 lg:overflow-hidden lg:border-none'
        }`}
      >
        <div className="space-y-6">
          {/* Top Logo Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]/60">
            <div className="flex flex-col items-center text-center gap-2 pt-2 pb-1 w-full relative">
              <img
                src={firmSettings.logoUrl || '/logo.png'}
                alt="Nyagah B. Kithinji & Co. Advocates Logo"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/logo.png';
                }}
                className="h-20 max-w-[200px] w-auto object-contain shrink-0"
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

          {/* MAIN MENU SECTION */}
          <div className="space-y-1">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-1.5 font-mono">
              MAIN MENU
            </span>

            {/* Home / Dashboard */}
            <button
              onClick={() => handleSelect('home')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                currentTab === 'home'
                  ? 'modulix-active-nav'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Home className="w-4 h-4 shrink-0 text-slate-700 dark:text-zinc-300" />
                <span>Dashboard</span>
              </div>
            </button>

            {/* Bill of Costs Builder */}
            <button
              onClick={() => handleSelect('boc')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                currentTab === 'boc'
                  ? 'modulix-active-nav'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 shrink-0 text-slate-700 dark:text-zinc-300" />
                <span>BOC Builder</span>
              </div>
            </button>

            {/* Saved Fee Notes */}
            <button
              onClick={() => handleSelect('feenotes')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                currentTab === 'feenotes'
                  ? 'modulix-active-nav'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900'
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

            {/* Collapsible My Matters with Sub-Tree Guide Lines */}
            <div>
              <button
                onClick={() => {
                  handleSelect('matters');
                  setMattersExpanded(!mattersExpanded);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  currentTab === 'matters'
                    ? 'modulix-active-nav'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 shrink-0 text-slate-700 dark:text-zinc-300" />
                  <span>My Matters</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 font-bold">
                    3
                  </span>
                  {mattersExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                </div>
              </button>

              {/* Sub-Tree Guide Lines for Matters */}
              {mattersExpanded && (
                <div className="pl-6 pt-1.5 space-y-1 subtree-connector">
                  <button
                    onClick={() => handleSelect('matters')}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[11.5px] text-slate-500 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-100/60 text-left"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    <span>High Court Commercial</span>
                  </button>
                  <button
                    onClick={() => handleSelect('matters')}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[11.5px] text-slate-500 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-100/60 text-left"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    <span>Subordinate Court</span>
                  </button>
                  <button
                    onClick={() => handleSelect('matters')}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[11.5px] text-slate-500 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-100/60 text-left"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    <span>Arbitration tribunal</span>
                  </button>
                </div>
              )}
            </div>

            {/* Clients Directory */}
            <button
              onClick={() => handleSelect('clients')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                currentTab === 'clients'
                  ? 'modulix-active-nav'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 shrink-0 text-slate-700 dark:text-zinc-300" />
                <span>My Clients</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 font-bold">
                5
              </span>
            </button>

            {/* Documentations & Vault */}
            <button
              onClick={() => handleSelect('vault')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                currentTab === 'vault'
                  ? 'modulix-active-nav'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Folder className="w-4 h-4 shrink-0 text-slate-700 dark:text-zinc-300" />
                <span>Document Vault</span>
              </div>
            </button>
          </div>

          {/* SETTINGS SECTION */}
          <div className="space-y-1 pt-2 border-t border-[var(--border-color)]/60">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-1.5 font-mono">
              SETTING
            </span>

            <button
              onClick={() => handleSelect('guide')}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                currentTab === 'guide'
                  ? 'modulix-active-nav'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0 text-slate-700 dark:text-zinc-300" />
              <span>Remuneration Guide</span>
            </button>

            <button
              onClick={() => handleSelect('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                currentTab === 'settings'
                  ? 'modulix-active-nav'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0 text-slate-700 dark:text-zinc-300" />
              <span>Firm Settings</span>
            </button>

            <button
              onClick={() => handleSelect('support')}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                currentTab === 'support'
                  ? 'modulix-active-nav'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-4 h-4 shrink-0 text-slate-700 dark:text-zinc-300" />
              <span>Support & Help</span>
            </button>
          </div>
        </div>

        {/* P3L LOGO — pinned to very bottom of sidebar */}
        <div className="shrink-0 mt-auto flex items-center justify-center px-2 py-2">
          <img
            src="/p3l_logo_nobg.png"
            alt="P3L Logo"
            className="w-full max-h-40 object-contain opacity-90 drop-shadow-sm scale-110"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/logo.png';
            }}
          />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
