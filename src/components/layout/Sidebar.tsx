import React, { useState } from 'react';
import {
  Home,
  FileText,
  Briefcase,
  Users,
  MessageSquare,
  Folder,
  BookOpen,
  Building2,
  User,
  Settings,
  HelpCircle,
  X,
  Sliders,
  Building,
  ShieldCheck,
  Bot,
  Cpu,
  Power,
  Database,
  Bell,
  ChevronDown,
  ChevronRight,
  LogOut
} from 'lucide-react';

import { SystemUser } from '../../services/supabase';

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

  const userDisplayName = currentUser?.advocateTitle || currentUser?.fullName || "Adv. Karani Victor";
  const userEmail = currentUser?.workEmail || currentUser?.personalEmail || "vickarani@gmail.com";
  const userInitials = currentUser?.fullName 
    ? currentUser.fullName.split(' ').map(n => n[0]).slice(0, 2).join('') 
    : "KV";

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
          {/* Top Logo Header strictly as requested */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]/60">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Nyagah B. Kithinji & Co. Advocates Logo"
                className="h-10 w-auto object-contain shrink-0"
              />
              <div className="min-w-0">
                <span className="font-brand font-extrabold text-sm text-slate-900 dark:text-white block tracking-tight truncate">
                  Kithinji & Co
                </span>
                <span className="text-[10px] text-slate-500 font-sans block truncate leading-tight">
                  Advocates of the High Court of Kenya
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
                5
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

          {/* DEVELOPER & SYSTEM CONTROL PAGES (DEVELOPER ROLE ONLY) */}
          {currentUser?.role === 'Developer' && (
            <div className="space-y-1 pt-2 border-t border-[var(--border-color)]/60">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 px-3 block mb-1.5 font-mono">
                DEVELOPER TOOLS
              </span>

              <button
                onClick={() => handleSelect('admin_boc')}
                className={`w-full flex items-center gap-3 px-3.5 py-1.5 rounded-lg text-[11.5px] font-medium transition-all cursor-pointer ${
                  currentTab === 'admin_boc'
                    ? 'modulix-active-nav'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>BOC Scale Master</span>
              </button>

              <button
                onClick={() => handleSelect('admin_firms')}
                className={`w-full flex items-center gap-3 px-3.5 py-1.5 rounded-lg text-[11.5px] font-medium transition-all cursor-pointer ${
                  currentTab === 'admin_firms'
                    ? 'modulix-active-nav'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900'
                }`}
              >
                <Building className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Firm Profile Master</span>
              </button>

              <button
                onClick={() => handleSelect('admin_python')}
                className={`w-full flex items-center gap-3 px-3.5 py-1.5 rounded-lg text-[11.5px] font-medium transition-all cursor-pointer ${
                  currentTab === 'admin_python'
                    ? 'modulix-active-nav'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Python Remuneration Engine</span>
              </button>

              <button
                onClick={() => handleSelect('admin_database')}
                className={`w-full flex items-center gap-3 px-3.5 py-1.5 rounded-lg text-[11.5px] font-medium transition-all cursor-pointer ${
                  currentTab === 'admin_database'
                    ? 'modulix-active-nav'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Database Sync & Health</span>
              </button>

              <button
                onClick={() => handleSelect('admin_users')}
                className={`w-full flex items-center gap-3 px-3.5 py-1.5 rounded-lg text-[11.5px] font-medium transition-all cursor-pointer ${
                  currentTab === 'admin_users'
                    ? 'modulix-active-nav'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>User & Roles Matrix</span>
              </button>

              <button
                onClick={() => handleSelect('admin_server')}
                className={`w-full flex items-center gap-3 px-3.5 py-1.5 rounded-lg text-[11.5px] font-medium transition-all cursor-pointer ${
                  currentTab === 'admin_server'
                    ? 'modulix-active-nav'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900'
                }`}
              >
                <Power className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Server & Infrastructure</span>
              </button>
            </div>
          )}
        </div>

        {/* BOTTOM PROFILE DOCK */}
        <div className="pt-4 mt-4 border-t border-[var(--border-color)]/60 shrink-0">
          <div className="flex items-center justify-between bg-slate-50 dark:bg-zinc-800/80 p-2.5 rounded-2xl border border-slate-200/80 dark:border-zinc-700/80">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                KV
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  Karani Victor
                </p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                  vickarani@gmail.com
                </p>
              </div>
            </div>

            <button
              onClick={handleLogOut}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer shrink-0 ml-1"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
