import React from 'react';
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
  Lock,
  Bell,
  Database,
  Power
} from 'lucide-react';

import { SystemUser } from '../../services/supabase';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  currentUser?: SystemUser | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  sidebarOpen,
  setSidebarOpen,
  currentUser,
}) => {
  // Main Basic Navigation Items
  const basicItems = [
    { id: 'home', label: 'Home Overview', icon: Home },
    { id: 'boc', label: 'Bill of Costs Builder', icon: FileText },
    { id: 'feenotes', label: 'Saved Fee Notes', icon: FileText, count: 5 },
    { id: 'matters', label: 'My Matters', icon: Briefcase, count: 3 },
    { id: 'clients', label: 'My Clients', icon: Users, count: 5 },
    { id: 'messages', label: 'Messages', icon: MessageSquare, count: 3 },
    { id: 'vault', label: 'Documentations & Storage', icon: Folder },
    { id: 'guide', label: 'Remuneration Guide', icon: BookOpen },
    { id: 'company', label: 'Company Profile', icon: Building2 },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'settings', label: 'Firm Settings', icon: Settings },
    { id: 'support', label: 'Tech Support', icon: HelpCircle },
  ];

  // Admin Control Panel Items (Developer Role Only)
  const adminItems = [
    { id: 'admin_boc', label: 'Home / BOC Settings', icon: Sliders },
    { id: 'admin_firms', label: 'Firms Management', icon: Building },
    { id: 'admin_documents', label: 'Documents Policy', icon: Folder },
    { id: 'admin_support', label: 'Tech Support Settings', icon: Bot },
    { id: 'admin_python', label: 'Python BOC Engine', icon: Cpu },
    { id: 'admin_permissions', label: 'Permissions Matrix', icon: ShieldCheck },
    { id: 'admin_users', label: 'Users & System Roles', icon: Users },
    { id: 'admin_notifications', label: 'Notifications Dispatch', icon: Bell },
    { id: 'admin_ticketing', label: 'Ticketing & Helpdesk', icon: HelpCircle },
    { id: 'admin_database', label: 'Supabase DB Health', icon: Database },
    { id: 'admin_server', label: 'Emergency Server & Infra', icon: Power },
  ];

  const handleSelect = (id: string) => {
    setCurrentTab(id);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Drawer Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* Smart Responsive Sidebar */}
      <aside
        className={`fixed lg:static top-16 bottom-0 left-0 w-64 border-r border-[var(--border-color)] bg-[var(--bg-main)] p-4 sm:p-5 flex flex-col justify-between z-50 lg:z-10 transition-all duration-200 ease-in-out shrink-0 overflow-y-auto ${
          sidebarOpen ? 'translate-x-0 shadow-2xl lg:shadow-none' : '-translate-x-full lg:w-0 lg:p-0 lg:overflow-hidden lg:border-none'
        }`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-end px-2 lg:hidden">
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-[var(--text-muted)] p-1 rounded-lg hover:bg-[var(--bg-subtle)] hover:text-[var(--text-main)] transition-colors"
              title="Close Menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* BASIC NAVIGATION SECTION */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-3 block mb-1 font-mono">
              Basic Navigation
            </span>
            {basicItems.map((it) => {
              const Icon = it.icon;
              const active = currentTab === it.id;
              return (
                <button
                  key={it.id}
                  onClick={() => handleSelect(it.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    active
                      ? 'bg-[var(--btn-bg)] text-[var(--btn-text)] shadow-sm font-semibold'
                      : 'text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-main)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{it.label}</span>
                  </div>
                  {it.count !== undefined && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                      active ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black' : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
                    }`}>
                      {it.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* SEPARATE ADMIN SETTINGS SECTION - RESTRICTED TO DEVELOPER ROLE ONLY */}
          {currentUser?.role === 'Developer' && (
            <div className="space-y-1 pt-3 border-t border-[var(--border-color)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 px-3 block mb-1 font-mono flex items-center justify-between">
                <span>Admin Settings</span>
                <span className="text-[9px] bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20 font-mono">
                  Developer
                </span>
              </span>
              {adminItems.map((it) => {
                const Icon = it.icon;
                const active = currentTab === it.id;
                return (
                  <button
                    key={it.id}
                    onClick={() => handleSelect(it.id)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-[11.5px] font-medium transition-all cursor-pointer ${
                      active
                        ? 'bg-[var(--btn-bg)] text-[var(--btn-text)] shadow-sm font-semibold'
                        : 'text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{it.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Branding strictly as requested */}
        <div className="pt-4 mt-4 border-t border-[var(--border-color)] text-center text-xs text-[var(--text-muted)] shrink-0">
          <p className="text-[11px] text-[var(--text-muted)]">
            Developed by <span className="font-bold text-[var(--text-main)]">P3L Developers</span>, Nairobi
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
