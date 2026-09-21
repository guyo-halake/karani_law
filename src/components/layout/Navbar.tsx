import React, { useState } from 'react';
import { Menu, X, Bell, Sun, Moon, User, CheckCircle2, LogOut, Search } from 'lucide-react';
import { EXACT_FIRM_INFO, SystemUser } from '../../services/supabase';

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onNavigateTab?: (tab: string) => void;
  onLogout?: () => void;
  currentUser?: SystemUser | null;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  isDarkMode,
  toggleTheme,
  onNavigateTab,
  onLogout,
  currentUser,
  searchQuery = '',
  setSearchQuery,
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
      title: 'New Matter Registered',
      desc: 'Dhanya Construction Kenya Ltd v Sunil Shah added to firm database.',
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
    <header className="h-16 bg-[var(--bg-main)] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 transition-colors duration-200 border-b border-[var(--border-color)]/30">
      {/* Left Area: Hamburger Toggle + Logo (Always Visible) + Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-3xl">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] text-slate-700 dark:text-zinc-300 hover:border-blue-500 transition-colors focus:outline-none cursor-pointer shrink-0"
          title="Toggle Navigation Menu"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Firm Logo ALWAYS visible on topbar */}
        <div className="flex items-center gap-3 shrink-0 pr-4 border-r border-[var(--border-color)]/60">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-brand font-extrabold text-lg flex items-center justify-center shadow-md shrink-0">
            N
          </div>
          <div className="hidden sm:block">
            <span className="font-brand font-extrabold text-xs text-slate-900 dark:text-white block tracking-tight">
              Kithinji & Co
            </span>
            <span className="text-[9.5px] text-slate-500 font-sans block truncate leading-tight">
              Advocates of the High Court of Kenya
            </span>
          </div>
        </div>

        {/* Global Top Search Bar */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/80 rounded-2xl px-3.5 py-1.5 w-full transition-all focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-zinc-900 focus-within:ring-2 focus-within:ring-blue-500/10">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            placeholder="Search anything... matters, clients, fee notes"
            className="bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none w-full font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery && setSearchQuery('')}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Controls: Theme Switcher, Notifications Bell, Profile Avatar */}
      <div className="flex items-center gap-3 relative shrink-0 ml-4">
        {/* Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-main)] hover:border-blue-500 transition-colors cursor-pointer"
          title="Toggle Light / Dark Mode"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-blue-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifModal(!showNotifModal);
              setShowProfileMenu(false);
            }}
            className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-main)] hover:border-blue-500 transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500"></span>
          </button>

          {/* Floating Notifications Popover */}
          {showNotifModal && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl z-50 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
                <h4 className="font-brand font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  Notifications & Dispatch
                </h4>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-bold">
                  3 Unread
                </span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">{n.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Advocate Profile Avatar */}
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
              <span className="font-bold text-xs text-slate-900 dark:text-white block group-hover:text-blue-600 transition-colors">
                {currentUser?.advocateTitle || currentUser?.fullName || EXACT_FIRM_INFO.user.name}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block">
                {currentUser?.workEmail || "vickarani@gmail.com"}
              </span>
            </div>

            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:bg-blue-600 transition-colors uppercase font-mono">
              {currentUser?.fullName ? currentUser.fullName.split(' ').map((n: string) => n[0]).slice(0, 2).join('') : "KV"}
            </div>
          </div>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 top-12 w-48 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl z-50 py-1.5 text-xs space-y-1">
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  if (onNavigateTab) onNavigateTab('profile');
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-900 dark:text-white font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <User className="w-4 h-4 text-blue-600" /> View Profile
              </button>

              <button
                onClick={handleLogOut}
                className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-red-500 font-semibold flex items-center gap-2 transition-colors cursor-pointer border-t border-[var(--border-color)] pt-2"
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
