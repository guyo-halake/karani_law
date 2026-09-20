import React, { useState } from 'react';
import { ShieldAlert, Lock, Key, CheckCircle2, Save, Globe, Eye, Server, UserCheck, ShieldCheck } from 'lucide-react';

export const AdminPermissionsView: React.FC = () => {
  const [mfaEnforced, setMfaEnforced] = useState(false);
  const [ipWhitelist, setIpWhitelist] = useState('192.168.100.0/24');
  const [lockoutAttempts, setLockoutAttempts] = useState('5');
  const [featurePdfModal, setFeaturePdfModal] = useState(true);
  const [featureNodemailer, setFeatureNodemailer] = useState(true);
  const [featureStorageVault, setFeatureStorageVault] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="w-full space-y-8 pb-12 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)]/50 pb-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-bold text-[10px]">
            ADMIN CONTROL PANEL
          </span>
          <h1 className="font-brand font-extrabold text-2xl text-[var(--text-main)] tracking-tight mt-1">
            Permissions Matrix & RBAC Security Policy
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            11 Master Feature Controls for System Roles (Admin, Developer, Advocates/Lawyers) & Security Policies
          </p>
        </div>

        <button
          onClick={handleSave}
          className="btn-black px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
        >
          {isSaved ? <><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Security Saved!</> : <><Save className="w-4 h-4" /> Save Security Matrix</>}
        </button>
      </div>

      {/* RBAC Table Matrix */}
      <div className="vercel-card overflow-hidden">
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Role-Based Access Control (RBAC) Matrix
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--text-main)]">
            <thead className="bg-[var(--bg-subtle)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider border-b border-[var(--border-color)] font-semibold">
              <tr>
                <th className="px-5 py-3.5">Permission Capability</th>
                <th className="px-5 py-3.5 text-center">Admin</th>
                <th className="px-5 py-3.5 text-center">Developer</th>
                <th className="px-5 py-3.5 text-center">Advocates / Lawyers / Custom</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              <tr>
                <td className="px-5 py-3 font-semibold">Create & Export Bill of Costs</td>
                <td className="px-5 py-3 text-center text-emerald-500 font-bold">✓ Full</td>
                <td className="px-5 py-3 text-center text-emerald-500 font-bold">✓ Full</td>
                <td className="px-5 py-3 text-center text-emerald-500 font-bold">✓ Full</td>
              </tr>
              <tr>
                <td className="px-5 py-3 font-semibold">Approve Official Fee Notes</td>
                <td className="px-5 py-3 text-center text-emerald-500 font-bold">✓ Full</td>
                <td className="px-5 py-3 text-center text-emerald-500 font-bold">✓ Full</td>
                <td className="px-5 py-3 text-center text-amber-500 font-bold">Pending Review</td>
              </tr>
              <tr>
                <td className="px-5 py-3 font-semibold">Manage System Users & Roles</td>
                <td className="px-5 py-3 text-center text-emerald-500 font-bold">✓ Full</td>
                <td className="px-5 py-3 text-center text-emerald-500 font-bold">✓ Full</td>
                <td className="px-5 py-3 text-center text-red-500 font-bold">✕ Denied</td>
              </tr>
              <tr>
                <td className="px-5 py-3 font-semibold">Emergency Server & Infra Killswitch</td>
                <td className="px-5 py-3 text-center text-emerald-500 font-bold">✓ Full</td>
                <td className="px-5 py-3 text-center text-emerald-500 font-bold">✓ Full</td>
                <td className="px-5 py-3 text-center text-red-500 font-bold">✕ Denied</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Switches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <Lock className="w-4 h-4 text-emerald-500" /> Enforce Multi-Factor Auth (MFA)
          </h3>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[var(--text-muted)]">Require 2FA for Admin login:</span>
            <input type="checkbox" checked={mfaEnforced} onChange={(e) => setMfaEnforced(e.target.checked)} className="w-4 h-4 accent-black dark:accent-white cursor-pointer" />
          </div>
        </div>

        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <Globe className="w-4 h-4 text-blue-500" /> IP Whitelist Rule Range
          </h3>
          <input type="text" value={ipWhitelist} onChange={(e) => setIpWhitelist(e.target.value)} className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs text-[var(--text-main)] focus:outline-none" />
        </div>

        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" /> Account Lockout Threshold
          </h3>
          <select value={lockoutAttempts} onChange={(e) => setLockoutAttempts(e.target.value)} className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs text-[var(--text-main)] focus:outline-none">
            <option value="3">3 Failed Attempts</option>
            <option value="5">5 Failed Attempts (Default)</option>
            <option value="10">10 Failed Attempts</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default AdminPermissionsView;
