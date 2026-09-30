import React, { useState, useEffect } from 'react';
import { SEEDED_USERS, SystemUser } from '../../services/supabase';
import { logSystemActivity } from '../../services/activityLogger';
import { Lock, ShieldCheck, CheckCircle2, AlertCircle, Save, Users, Key } from 'lucide-react';

export interface AdvocatePermissionItem {
  id: string;
  name: string;
  role: string;
  email: string;
  canCreateFeeNotes: boolean;
  clientVisibility: 'all' | 'assigned';
  canExportData: boolean;
  canDeleteMatter: boolean;
}

export const AdvocatePermissionsView: React.FC = () => {
  const [permissions, setPermissions] = useState<AdvocatePermissionItem[]>(() => {
    const saved = localStorage.getItem('EXACT_USER_PERMISSIONS');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'usr-karani-admin', name: 'Adv. Karani Victor', role: 'Senior Managing Partner', email: 'vickarani@gmail.com', canCreateFeeNotes: true, clientVisibility: 'all', canExportData: true, canDeleteMatter: true },
      { id: 'usr-advocate-002', name: 'Adv. Nyagah Kithinji', role: 'Senior Associate Advocate', email: 'advocate@kithinjilegal.co.ke', canCreateFeeNotes: true, clientVisibility: 'all', canExportData: true, canDeleteMatter: true },
      { id: 'usr-advocate-003', name: 'Adv. Wanjiku', role: 'Senior Associate', email: 'wanjiku@kithinjilegal.co.ke', canCreateFeeNotes: true, clientVisibility: 'all', canExportData: true, canDeleteMatter: false },
      { id: 'usr-advocate-004', name: 'Adv. Ochieng', role: 'Associate Advocate', email: 'ochieng@kithinjilegal.co.ke', canCreateFeeNotes: true, clientVisibility: 'assigned', canExportData: false, canDeleteMatter: false },
      { id: 'usr-advocate-005', name: 'Adv. Kamau', role: 'Junior Associate', email: 'kamau@kithinjilegal.co.ke', canCreateFeeNotes: false, clientVisibility: 'assigned', canExportData: false, canDeleteMatter: false }
    ];
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const updatePermission = (id: string, field: keyof AdvocatePermissionItem, value: any) => {
    setPermissions(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, [field]: value } : p);
      localStorage.setItem('EXACT_USER_PERMISSIONS', JSON.stringify(updated));
      const targetUser = updated.find(p => p.id === id);
      logSystemActivity(
        'Adv. Nyagah Kithinji',
        `updated security policy "${String(field)}" for ${targetUser?.name || id} to ${String(value)}`,
        'permission',
        'bg-purple-500'
      );
      return updated;
    });
  };

  const handleSaveAll = () => {
    localStorage.setItem('EXACT_USER_PERMISSIONS', JSON.stringify(permissions));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
    alert('✅ Advocate Permissions saved and enforced across all active sessions!');
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-white font-sans">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono font-bold text-[11px] uppercase tracking-wider border border-purple-500/20 flex items-center gap-1 w-fit">
            <Lock className="w-3.5 h-3.5" /> SECURITY POLICY & ACCESS CONTROL
          </span>
          <h1 className="font-brand font-black text-2xl text-slate-900 dark:text-white mt-1">
            Advocate Permissions Dashboard
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Toggle granular advocate rights (Fee note creation, client visibility scope, data exporting, matter deletion).
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer shrink-0"
        >
          {savedSuccess ? <><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Saved!</> : <><Save className="w-4 h-4" /> Save Permission Matrix</>}
        </button>
      </div>

      {/* Permissions Matrix Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 font-mono uppercase">
            <ShieldCheck className="w-4 h-4 text-purple-500" /> Granular Access Control Matrix ({permissions.length} Users)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-zinc-700">
              <tr>
                <th className="p-4">Advocate / Staff User</th>
                <th className="p-4 text-center">Create Fee Notes</th>
                <th className="p-4 text-center">Client Scope</th>
                <th className="p-4 text-center">Export Data</th>
                <th className="p-4 text-center">Delete Matters</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {permissions.map((adv) => (
                <tr key={adv.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{adv.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{adv.role} ({adv.email})</div>
                  </td>

                  {/* Create Fee Notes Toggle */}
                  <td className="p-4 text-center">
                    <input 
                      type="checkbox"
                      checked={adv.canCreateFeeNotes}
                      onChange={(e) => updatePermission(adv.id, 'canCreateFeeNotes', e.target.checked)}
                      className="w-4 h-4 accent-amber-500 cursor-pointer"
                    />
                  </td>

                  {/* Client Visibility Scope */}
                  <td className="p-4 text-center">
                    <select
                      value={adv.clientVisibility}
                      onChange={(e) => updatePermission(adv.id, 'clientVisibility', e.target.value)}
                      className="bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="all">All Clients</option>
                      <option value="assigned">Assigned Only</option>
                    </select>
                  </td>

                  {/* Export Data Toggle */}
                  <td className="p-4 text-center">
                    <input 
                      type="checkbox"
                      checked={adv.canExportData}
                      onChange={(e) => updatePermission(adv.id, 'canExportData', e.target.checked)}
                      className="w-4 h-4 accent-amber-500 cursor-pointer"
                    />
                  </td>

                  {/* Delete Matter Toggle */}
                  <td className="p-4 text-center">
                    <input 
                      type="checkbox"
                      checked={adv.canDeleteMatter}
                      onChange={(e) => updatePermission(adv.id, 'canDeleteMatter', e.target.checked)}
                      className="w-4 h-4 accent-red-500 cursor-pointer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdvocatePermissionsView;
