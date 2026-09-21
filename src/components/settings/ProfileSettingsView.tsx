import React, { useState } from 'react';
import {
  Palette,
  Bell,
  ShieldAlert,
  Save,
  CheckCircle2,
  Moon,
  Sun
} from 'lucide-react';

interface SettingsProps {
  isDarkMode?: boolean;
  toggleTheme?: () => void;
}

export const ProfileSettingsView: React.FC<SettingsProps> = ({ isDarkMode, toggleTheme }) => {
  // Theme & Customization Settings
  const [accentColor, setAccentColor] = useState('obsidian');
  const [fontSize, setFontSize] = useState('standard');
  const [showGraphWidget, setShowGraphWidget] = useState<boolean>(() => {
    return localStorage.getItem('BILLSZIP_SHOW_GRAPH') === 'true';
  });

  // Notifications Settings
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [dailyDigest, setDailyDigest] = useState('daily');

  // Roles & Security Settings
  const [activeRole, setActiveRole] = useState('admin');
  const [auditLogging, setAuditLogging] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('BILLSZIP_SHOW_GRAPH', showGraphWidget ? 'true' : 'false');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-[var(--border-color)]/50 pb-4">
        <div>
          <h1 className="font-brand font-extrabold text-2xl text-[var(--text-main)] tracking-tight">
            System Settings & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            Manage your UI theme, notifications dispatch, and user role security permissions
          </p>
        </div>

        <button
          onClick={handleSave}
          className="btn-black px-5 py-2 text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
        >
          {isSaved ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Preferences Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Preferences
            </>
          )}
        </button>
      </div>

      {/* SINGLE UNIFIED SETTINGS CARD CONTAINER */}
      <div className="vercel-card p-6 sm:p-8 space-y-8 text-xs">
        
        {/* SECTION 1: THEME & UI CUSTOMIZATION */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-2.5">
            <Palette className="w-4 h-4 text-[var(--text-main)]" />
            <h2 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider">
              1. Theme & UI Customization
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
            {/* Setting 1: Interface Theme */}
            <div className="space-y-1.5">
              <label className="font-semibold text-[var(--text-main)] block">
                Interface Theme:
              </label>
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-main)] font-semibold flex items-center justify-between hover:border-[var(--text-main)] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  {isDarkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  {isDarkMode ? 'Dark Mode (Pure Black)' : 'Light Mode'}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">Toggle</span>
              </button>
            </div>

            {/* Setting 2: Accent Scheme */}
            <div className="space-y-1.5">
              <label className="font-semibold text-[var(--text-main)] block">
                UI Accent Scheme:
              </label>
              <select
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-main)] focus:outline-none"
              >
                <option value="obsidian">Obsidian Minimalist Black</option>
                <option value="gold">Kenyan Legal Gold</option>
                <option value="emerald">High Court Emerald</option>
              </select>
            </div>

            {/* Setting 3: Font Scaling */}
            <div className="space-y-1.5">
              <label className="font-semibold text-[var(--text-main)] block">
                Font Scaling:
              </label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-main)] focus:outline-none"
              >
                <option value="compact">Compact (11px / 12px)</option>
                <option value="standard">Standard (12px / 13px)</option>
                <option value="large">Large (14px / 15px)</option>
              </select>
            </div>

            {/* Setting 4: Dashboard Portfolio Graph Widget */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] md:col-span-3">
              <div>
                <span className="font-semibold text-[var(--text-main)] block">Dashboard Portfolio Claim Breakdown Graph Widget:</span>
                <span className="text-[11px] text-[var(--text-muted)]">Check to display interactive legal claim value graph on home dashboard</span>
              </div>
              <input
                type="checkbox"
                checked={showGraphWidget}
                onChange={(e) => {
                  const nextVal = e.target.checked;
                  setShowGraphWidget(nextVal);
                  localStorage.setItem('BILLSZIP_SHOW_GRAPH', nextVal ? 'true' : 'false');
                }}
                className="rounded accent-black dark:accent-white w-4 h-4 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: NOTIFICATIONS & ALERTS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-2.5">
            <Bell className="w-4 h-4 text-[var(--text-main)]" />
            <h2 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider">
              2. Notifications & Communication Alerts
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
            {/* Setting 4: Email Notifications */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
              <div>
                <span className="font-semibold text-[var(--text-main)] block">Email Draft Alerts:</span>
                <span className="text-[11px] text-[var(--text-muted)]">Alert when fee note is drafted</span>
              </div>
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={(e) => setEmailNotifs(e.target.checked)}
                className="rounded accent-black dark:accent-white w-4 h-4 cursor-pointer"
              />
            </div>

            {/* Setting 5: SMS Notifications */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
              <div>
                <span className="font-semibold text-[var(--text-main)] block">SMS Hearing Reminders:</span>
                <span className="text-[11px] text-[var(--text-muted)]">SMS alerts for cause list dates</span>
              </div>
              <input
                type="checkbox"
                checked={smsNotifs}
                onChange={(e) => setSmsNotifs(e.target.checked)}
                className="rounded accent-black dark:accent-white w-4 h-4 cursor-pointer"
              />
            </div>

            {/* Setting 6: Automated Summary Digest */}
            <div className="space-y-1.5">
              <label className="font-semibold text-[var(--text-main)] block">
                Automated Summary Digest:
              </label>
              <select
                value={dailyDigest}
                onChange={(e) => setDailyDigest(e.target.value)}
                className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-main)] focus:outline-none"
              >
                <option value="daily">Daily Morning Email Digest</option>
                <option value="weekly">Weekly Summary Report</option>
                <option value="never">Disabled / Manual Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: ROLES WATCHING & SECURITY PERMISSIONS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-2.5">
            <ShieldAlert className="w-4 h-4 text-[var(--text-main)]" />
            <h2 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider">
              3. Roles Watching & Security Permissions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
            {/* Setting 7: Active Role */}
            <div className="space-y-1.5">
              <label className="font-semibold text-[var(--text-main)] block">
                Active User Role Privilege:
              </label>
              <select
                value={activeRole}
                onChange={(e) => setActiveRole(e.target.value)}
                className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-main)] focus:outline-none font-semibold"
              >
                <option value="admin">Admin (All Permissions Granted)</option>
                <option value="developer">Developer (All Permissions Granted)</option>
                <option value="advocate">Advocates / Lawyers / Custom</option>
              </select>
            </div>

            {/* Setting 8: Session Timeout */}
            <div className="space-y-1.5">
              <label className="font-semibold text-[var(--text-main)] block">
                Inactivity Session Timeout:
              </label>
              <select
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-main)] focus:outline-none font-mono"
              >
                <option value="15">15 Minutes Inactivity</option>
                <option value="30">30 Minutes Inactivity</option>
                <option value="60">1 Hour Inactivity</option>
                <option value="never">Never (Stay Logged In)</option>
              </select>
            </div>

            {/* Setting 9: Multi-User Audit Logging */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
              <div>
                <span className="font-semibold text-[var(--text-main)] block">Multi-User Audit Logging:</span>
                <span className="text-[11px] text-[var(--text-muted)]">Log all calculation edits</span>
              </div>
              <input
                type="checkbox"
                checked={auditLogging}
                onChange={(e) => setAuditLogging(e.target.checked)}
                className="rounded accent-black dark:accent-white w-4 h-4 cursor-pointer"
              />
            </div>
          </div>
        </div>

      </div>

      {/* MODERN FOOTER Strictly matching user specification */}
      <footer className="pt-8 border-t border-[var(--border-color)] text-center space-y-1 text-xs text-[var(--text-muted)]">
        <p className="font-semibold text-[var(--text-main)]">
          BoC Builder Software 2026. All rights reserved.
        </p>
        <p className="text-[11px]">
          Developed by <span className="font-bold text-[var(--text-main)]">© P3L Developers</span>, Nairobi
        </p>
      </footer>
    </div>
  );
};

export default ProfileSettingsView;
