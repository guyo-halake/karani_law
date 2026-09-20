import React, { useState } from 'react';
import { EXACT_FIRM_INFO } from '../../services/supabase';
import { Building2, Plus, ShieldCheck, CheckCircle2, AlertTriangle, HardDrive, Users, Globe, Download, Lock, Edit } from 'lucide-react';

export const AdminFirmsView: React.FC = () => {
  const [firms, setFirms] = useState([
    {
      id: 'f1',
      name: EXACT_FIRM_INFO.name,
      lskReg: EXACT_FIRM_INFO.firmRegNo,
      email: EXACT_FIRM_INFO.email,
      status: 'Active',
      plan: 'Enterprise Platinum',
      storageQuota: '100 GB',
      userSeats: '50 Seats',
      domain: 'kithinjilegal.co.ke'
    },
    {
      id: 'f2',
      name: 'Seyani Corporate Legal Directorate',
      lskReg: 'LSK/FIRM/2020/4892',
      email: 'legal@seyani.co.ke',
      status: 'Active',
      plan: 'Professional',
      storageQuota: '50 GB',
      userSeats: '15 Seats',
      domain: 'seyani.co.ke'
    },
    {
      id: 'f3',
      name: 'Kamau & Waweru Advocates',
      lskReg: 'LSK/FIRM/2015/1029',
      email: 'info@kamauwaweru.co.ke',
      status: 'Pending Audit',
      plan: 'Starter',
      storageQuota: '20 GB',
      userSeats: '5 Seats',
      domain: 'kamauwaweru.co.ke'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newFirmName, setNewFirmName] = useState('');
  const [newFirmReg, setNewFirmReg] = useState('');
  const [newFirmEmail, setNewFirmEmail] = useState('');

  const handleAddFirm = (e: React.FormEvent) => {
    e.preventDefault();
    const newF = {
      id: 'f' + (firms.length + 1),
      name: newFirmName,
      lskReg: newFirmReg,
      email: newFirmEmail,
      status: 'Active',
      plan: 'Enterprise Platinum',
      storageQuota: '100 GB',
      userSeats: '25 Seats',
      domain: newFirmEmail.split('@')[1] || 'firm.co.ke'
    };
    setFirms([newF, ...firms]);
    setShowAddModal(false);
    setNewFirmName('');
    alert(`✓ New firm "${newFirmName}" onboarded to system successfully!`);
  };

  const toggleStatus = (id: string) => {
    setFirms(prev => prev.map(f => f.id === id ? { ...f, status: f.status === 'Active' ? 'Suspended' : 'Active' } : f));
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
            Multi-Tenant Law Firms Management
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            11 Master Features for Managing Registered Law Firms, LSK Audits, Quotas & Subscriptions
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-black px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Onboard New Law Firm
        </button>
      </div>

      {/* Feature Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="vercel-card p-4 space-y-1">
          <span className="text-[10px] text-[var(--text-muted)] uppercase block">Registered Firms</span>
          <span className="font-extrabold text-xl text-[var(--text-main)]">{firms.length} Firms</span>
        </div>
        <div className="vercel-card p-4 space-y-1">
          <span className="text-[10px] text-[var(--text-muted)] uppercase block">Active LSK Certificates</span>
          <span className="font-extrabold text-xl text-emerald-500">100% Verified</span>
        </div>
        <div className="vercel-card p-4 space-y-1">
          <span className="text-[10px] text-[var(--text-muted)] uppercase block">Storage Allocated</span>
          <span className="font-extrabold text-xl text-blue-500">170 GB</span>
        </div>
        <div className="vercel-card p-4 space-y-1">
          <span className="text-[10px] text-[var(--text-muted)] uppercase block">Active Seat Licences</span>
          <span className="font-extrabold text-xl text-purple-500">70 Seats</span>
        </div>
      </div>

      {/* 11 Packed Features Firm Table */}
      <div className="vercel-card overflow-hidden">
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-500" /> Multi-Tenant Law Firm Registry (11 Controls)
          </h3>
          <button
            onClick={() => alert('Exporting Firm Registry Data as CSV/JSON...')}
            className="btn-outline px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export Registry JSON
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--text-main)]">
            <thead className="bg-[var(--bg-subtle)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider border-b border-[var(--border-color)] font-semibold">
              <tr>
                <th className="px-5 py-3.5">Firm Entity & LSK Reg</th>
                <th className="px-5 py-3.5">Official Contact Email</th>
                <th className="px-5 py-3.5">Domain Whitelist</th>
                <th className="px-5 py-3.5">Plan Tier</th>
                <th className="px-5 py-3.5">Storage Quota</th>
                <th className="px-5 py-3.5">User Seats</th>
                <th className="px-5 py-3.5">LSK Status</th>
                <th className="px-5 py-3.5 text-center">Admin Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {firms.map((f) => (
                <tr key={f.id} className="hover:bg-[var(--bg-subtle)] transition-colors">
                  <td className="px-5 py-3.5">
                    <strong className="font-bold text-[var(--text-main)] block">{f.name}</strong>
                    <span className="text-[10.5px] text-[var(--text-muted)] font-mono">{f.lskReg}</span>
                  </td>
                  <td className="px-5 py-3.5 font-mono">{f.email}</td>
                  <td className="px-5 py-3.5 font-mono text-blue-500 font-semibold">{f.domain}</td>
                  <td className="px-5 py-3.5 font-semibold">{f.plan}</td>
                  <td className="px-5 py-3.5 font-mono">{f.storageQuota}</td>
                  <td className="px-5 py-3.5 font-mono">{f.userSeats}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold ${
                      f.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => toggleStatus(f.id)}
                        className="px-2.5 py-1 rounded-lg border border-[var(--border-color)] hover:border-[var(--text-main)] text-[11px] font-semibold"
                      >
                        {f.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Onboarding */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm text-[var(--text-main)] uppercase tracking-wider">
              Onboard New Law Firm to Platform
            </h3>
            <form onSubmit={handleAddFirm} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Firm Name:</label>
                <input
                  type="text"
                  required
                  value={newFirmName}
                  onChange={(e) => setNewFirmName(e.target.value)}
                  placeholder="e.g. Wako & Associates Advocates"
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">LSK Registration No:</label>
                <input
                  type="text"
                  required
                  value={newFirmReg}
                  onChange={(e) => setNewFirmReg(e.target.value)}
                  placeholder="e.g. LSK/FIRM/2026/9999"
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Official Firm Email:</label>
                <input
                  type="email"
                  required
                  value={newFirmEmail}
                  onChange={(e) => setNewFirmEmail(e.target.value)}
                  placeholder="info@wako-advocates.co.ke"
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-outline px-4 py-2 text-xs font-semibold">
                  Cancel
                </button>
                <button type="submit" className="btn-black px-5 py-2 text-xs font-semibold">
                  Complete Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFirmsView;
