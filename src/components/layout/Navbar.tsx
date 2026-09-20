import React, { useState } from 'react';
import { Menu, X, Bell, Sun, Moon, User, CheckCircle2, LogOut } from 'lucide-react';
import { EXACT_FIRM_INFO, SystemUser } from '../../services/supabase';

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onNavigateTab?: (tab: string) => void;
  onLogout?: () => void;
  currentUser?: SystemUser | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  isDarkMode,
  toggleTheme,
  onNavigateTab,
  onLogout,
  currentUser,
}) => {
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    {
      id: 'n1',
      title: 'Taxation Sheet Ready',
      desc: 'Seyani Brothers & Co. (K) Ltd v Greenhills Investment Ltd (HCCC E104/2025) is ready for filing.',
      time: '10 mins ago',
    },
    {
      id: 'n2',
      title: 'Fee Note Generated',
      desc: 'Bill of Costs BOC-2026-FEE generated for Seyani Brothers (Kshs 30,820,193.28).',
      time: '1 hour ago',
    },
    {
      id: 'n3',
      title: 'Supabase Storage Sync',
      desc: '3 Excel workbooks uploaded and verified 100% against Advocates Remuneration Order.',
      time: '3 hours ago',
    },
    {
      id: 'n4',
      title: 'New Client Registered',
      desc: 'Zhenjian Chengjian Construction Africa Ltd added to firm database.',
      time: 'Yesterday',
    }
  ];

  const handleLogOut = () => {
    setShowProfileMenu(false);
    localStorage.removeItem('BILLSZIP_SESSION');
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-card)] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 transition-colors duration-200">
      {/* Hamburger Toggle (All Screens) + Firm Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-main)] hover:border-amber-500 transition-colors focus:outline-none cursor-pointer"
          title="Toggle Navigation Menu"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-amber-500/20 font-brand shrink-0">
            K
          </div>
          <div>
            <span className="font-brand font-extrabold text-sm text-[var(--text-main)] block tracking-tight">
              {EXACT_FIRM_INFO.name}
            </span>
            <span className="text-[10.5px] text-amber-600 dark:text-amber-400 font-semibold font-sans block hidden sm:block">
              Advocates & Legal Consultants
            </span>
          </div>
        </div>
      </div>
      {/* Global Search Bar */}
      <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/80 rounded-2xl px-3.5 py-1.5 w-72 lg:w-96 transition-all focus-within:border-slate-400 focus-within:bg-white dark:focus-within:bg-zinc-900">
        <Menu className="w-4 h-4 text-slate-400 shrink-0 hidden" />
        <input
          type="text"
          placeholder="Search anything... matters, clients, fee notes"
          className="bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none w-full font-sans"
        />
      </div>

      {/* Right Controls: Theme Switcher, Notifications Bell, Profile Avatar */}
      <div className="flex items-center gap-3 relative">
        {/* Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-main)] hover:border-[var(--text-main)] transition-colors cursor-pointer"
          title="Toggle Light / Dark Mode"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifModal(!showNotifModal);
              setShowProfileMenu(false);
            }}
            className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-main)] hover:border-[var(--text-main)] transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-[var(--text-muted)]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500"></span>
          </button>

          {/* Floating Notifications Popover */}
          {showNotifModal && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl z-50 p-4 space-y-3 font-sans text-xs">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
                <div className="flex items-center gap-2 font-bold text-sm text-[var(--text-main)]">
                  <Bell className="w-4 h-4 text-blue-500" />
                  <span>Notifications & Alerts</span>
                </div>
                <button
                  onClick={() => setShowNotifModal(false)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[var(--text-main)] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {n.title}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Advocate Profile Avatar -> Clicking shows 2 options: View Profile & Log Out */}
        <div className="relative">
          <div
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifModal(false);
            }}
            className="flex items-center gap-2.5 pl-3 border-l border-[var(--border-color)] cursor-pointer group select-none"
            title="Account Options"
          >
            <div className="text-right hidden sm:block">
              <span className="font-bold text-xs text-[var(--text-main)] block group-hover:underline">
                {currentUser?.advocateTitle || currentUser?.fullName || EXACT_FIRM_INFO.user.name}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-mono block">
                LSK: {currentUser?.lskNo || EXACT_FIRM_INFO.user.lskNo}
              </span>
            </div>

            <div className="w-9 h-9 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-main)] font-bold text-xs shadow-xs group-hover:border-[var(--text-main)] transition-colors uppercase font-mono">
              {currentUser?.fullName ? currentUser.fullName.split(' ').map((n: string) => n[0]).slice(0, 2).join('') : <User className="w-4 h-4 text-[var(--text-muted)]" />}
            </div>
          </div>

          {/* Profile Dropdown Menu (View Profile & Log Out) */}
          {showProfileMenu && (
            <div className="absolute right-0 top-12 w-44 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl z-50 py-1.5 text-xs space-y-1">
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  if (onNavigateTab) onNavigateTab('profile');
                }}
                className="w-full text-left px-4 py-2 hover:bg-[var(--bg-subtle)] text-[var(--text-main)] font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <User className="w-4 h-4 text-emerald-500" /> View Profile
              </button>

              <button
                onClick={handleLogOut}
                className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-red-500 font-semibold flex items-center gap-2 transition-colors cursor-pointer border-t border-[var(--border-color)]/50 pt-2"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
