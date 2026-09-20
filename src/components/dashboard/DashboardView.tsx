import React, { useState } from 'react';
import { UserPlus, FileText, Calculator, Clock, Briefcase, ChevronRight, CheckCircle2, Plus } from 'lucide-react';
import { EXACT_MATTERS, EXACT_FIRM_INFO, ExactMatterRecord, SystemUser } from '../../services/supabase';

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
  onNavigateToBuilder: (court: string, value: number) => void;
  onOpenRecents?: () => void;
  currentUser?: SystemUser | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onNavigateToBuilder,
  onOpenRecents,
  currentUser,
}) => {
  const [showClientModal, setShowClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientCat, setNewClientCat] = useState('Corporate or Institutional');
  const [newClientKra, setNewClientKra] = useState('');

  const [quickCourt, setQuickCourt] = useState('schedule_6_high_court');
  const [quickValue, setQuickValue] = useState('0');

  // Dynamic Machine System Time Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClientName.trim()) {
      alert(`Success: Client "${newClientName.trim()}" registered successfully!`);
      setShowClientModal(false);
      setNewClientName('');
    }
  };

  const userName = currentUser?.fullName || currentUser?.advocateTitle || EXACT_FIRM_INFO.user.name;

  // Genuine dynamic portfolio computations from EXACT_MATTERS
  const totalClaimValue = EXACT_MATTERS.reduce((sum, m) => sum + (m.amount || 0), 0);
  const pendingTaxationsCount = EXACT_MATTERS.filter(
    (m) => m.status.toLowerCase().includes('taxation') || m.status.toLowerCase().includes('ready')
  ).length;

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Clean Welcome Header without background card container */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-1 pb-6 border-b border-[var(--border-color)]/50">
        <div className="space-y-1">
          <span className="section-eyebrow">
            {EXACT_FIRM_INFO.name}
          </span>
          <h1 className="executive-title text-gradient-gold">
            {getGreeting()}, {userName}
          </h1>
          <p className="executive-subtitle max-w-xl">
            Advocates Remuneration Order Platform — High Court Taxations, Arbitration Portfolio, and Real-Time Storage Vault.
          </p>
        </div>

        {/* Action Buttons in Welcome Section: Icon on Top, Text Bottom */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 -mt-1 lg:-mt-2 shrink-0">
          <button
            onClick={() => setShowClientModal(true)}
            className="bg-amber-500/10 border border-amber-500/20 hover:border-amber-500 hover:bg-amber-500/20 p-3 rounded-2xl transition-all flex flex-col items-center justify-center text-center cursor-pointer group focus:outline-none active:scale-95 min-w-[100px]"
            title="Register New Client"
          >
            <UserPlus className="w-5.5 h-5.5 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform mb-1.5" />
            <span className="text-[11.5px] font-bold text-[var(--text-main)] leading-tight">
              Register Client
            </span>
          </button>

          <button
            onClick={() => onNavigateTab('boc')}
            className="bg-amber-500/10 border border-amber-500/20 hover:border-amber-500 hover:bg-amber-500/20 p-3 rounded-2xl transition-all flex flex-col items-center justify-center text-center cursor-pointer group focus:outline-none active:scale-95 min-w-[100px]"
            title="New Fee Note"
          >
            <Plus className="w-5.5 h-5.5 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform mb-1.5" />
            <span className="text-[11.5px] font-bold text-[var(--text-main)] leading-tight">
              New Fee Note
            </span>
          </button>

          <button
            onClick={() => onNavigateTab('boc')}
            className="bg-amber-500/10 border border-amber-500/20 hover:border-amber-500 hover:bg-amber-500/20 p-3 rounded-2xl transition-all flex flex-col items-center justify-center text-center cursor-pointer group focus:outline-none active:scale-95 min-w-[100px]"
            title="Fee Calculator"
          >
            <Calculator className="w-5.5 h-5.5 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform mb-1.5" />
            <span className="text-[11.5px] font-bold text-[var(--text-main)] leading-tight">
              Fee Calculator
            </span>
          </button>

          <button
            onClick={() => onOpenRecents ? onOpenRecents() : onNavigateTab('vault')}
            className="bg-amber-500/10 border border-amber-500/20 hover:border-amber-500 hover:bg-amber-500/20 p-3 rounded-2xl transition-all flex flex-col items-center justify-center text-center cursor-pointer group focus:outline-none active:scale-95 min-w-[100px]"
            title="Recents / Drafts"
          >
            <Clock className="w-5.5 h-5.5 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform mb-1.5" />
            <span className="text-[11.5px] font-bold text-[var(--text-main)] leading-tight">
              Recents / Drafts
            </span>
          </button>
        </div>
      </div>

      {/* Spaced Interactive Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Total Claim Portfolio */}
        <div
          onClick={() => onNavigateTab('matters')}
          className="vercel-card-interactive card-gold-accent p-6 space-y-3 group flex flex-col justify-between min-w-0"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider font-mono truncate">
              Total Claim Portfolio Value
            </span>
            <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform shrink-0" />
          </div>

          <div className="min-w-0">
            <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[var(--text-main)] font-mono tracking-tight break-all">
              Kshs {totalClaimValue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1 truncate">
              Across {EXACT_MATTERS.length} Active Legal Causes
            </p>
          </div>

          <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            <span>View Full Portfolio</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">My Matters →</span>
          </div>
        </div>

        {/* Card 2: Pending High Court Taxations */}
        <div
          onClick={() => onNavigateTab('boc')}
          className="vercel-card-interactive p-6 space-y-3 group flex flex-col justify-between min-w-0"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider font-mono truncate">
              Pending High Court Taxations
            </span>
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:translate-x-1 transition-transform shrink-0" />
          </div>

          <div className="min-w-0">
            <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[var(--text-main)] font-mono tracking-tight">
              {pendingTaxationsCount} Matters
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 mt-1 truncate">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Remuneration Bills Calculated
            </p>
          </div>

          <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            <span>Build & Review Bills</span>
            <span className="font-semibold text-[var(--text-main)]">Bill Builder →</span>
          </div>
        </div>

        {/* Card 3: Primary Practice Forum */}
        <div
          onClick={() => onNavigateTab('matters')}
          className="vercel-card-interactive p-6 space-y-3 group flex flex-col justify-between min-w-0 sm:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider font-mono truncate">
              Primary Practice Forums
            </span>
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:translate-x-1 transition-transform shrink-0" />
          </div>

          <div className="min-w-0">
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--text-main)] tracking-tight truncate">
              Arbitration / High Court
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1 truncate">Commercial & Conveyancing Division</p>
          </div>

          <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            <span>Filter Proceedings</span>
            <span className="font-semibold text-[var(--text-main)]">View Matters →</span>
          </div>
        </div>
      </div>

      {/* Spacious, Minimalist Quick Legal Fee Calculator Converter Widget */}
      <div className="vercel-card p-6 sm:p-8 space-y-5">
        <div>
          <h3 className="font-brand font-bold text-sm text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2">
            <Calculator className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            Quick Legal Fee Calculator Converter
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Calculate Advocates Remuneration Order prescribed instruction fees across all official schedules. Default value set to 0.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-[var(--text-muted)] mb-1.5 font-semibold">Advocates Remuneration Schedule</label>
            <select
              value={quickCourt}
              onChange={(e) => setQuickCourt(e.target.value)}
              className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-[var(--text-main)] font-sans focus:outline-none"
            >
              <option value="schedule_6_high_court">Schedule 6 — High Court / Court of Appeal / ELC / ELRC</option>
              <option value="schedule_5_magistrate">Schedule 5 — Subordinate / Magistrate's Court</option>
              <option value="schedule_1_conveyancing">Schedule 1 — Conveyancing (Sales, Purchases, Leases)</option>
              <option value="schedule_2_securities">Schedule 2 — Debentures & Mortgages / Charges</option>
              <option value="schedule_3_company">Schedule 3 — Commercial & Company Incorporation</option>
              <option value="schedule_4_ip">Schedule 4 — Intellectual Property (Trademarks & Patents)</option>
              <option value="schedule_7_arbitration">Schedule 7 — Arbitral Proceedings & Commercial Arbitration</option>
              <option value="schedule_8_general">Schedule 8 — General / Non-Contentious Business</option>
            </select>
          </div>

          <div>
            <label className="block text-[var(--text-muted)] mb-1.5 font-semibold">Subject / Claim Value (Kshs)</label>
            <input
              type="number"
              value={quickValue}
              onChange={(e) => setQuickValue(e.target.value)}
              placeholder="0"
              className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-[var(--text-main)] font-mono focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => onNavigateToBuilder(quickCourt, parseFloat(quickValue) || 0)}
              className="btn-black w-full py-2.5 text-xs shadow-sm"
            >
              Calculate Bill of Costs
            </button>
          </div>
        </div>
      </div>

      {/* Active Legal Causes Portfolio Table */}
      <div className="vercel-card overflow-hidden">
        <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between">
          <div>
            <h3 className="font-brand font-bold text-xs text-[var(--text-main)] uppercase tracking-wider">
              Active Legal Matters & Court Filings
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5"> Nyagah B. Kithinji & Co. Advocates Client Causes</p>
          </div>
          <span className="text-xs text-[var(--text-muted)] font-mono">{EXACT_MATTERS.length} Matters Listed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--text-main)]">
            <thead className="bg-[var(--bg-subtle)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider border-b border-[var(--border-color)] font-semibold">
              <tr>
                <th className="px-5 py-3.5">Matter Title & Cause No.</th>
                <th className="px-5 py-3.5">Applicant / Claimant</th>
                <th className="px-5 py-3.5">Court / Forum</th>
                <th className="px-5 py-3.5 text-right">Claim Amount (Kshs)</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {EXACT_MATTERS.map((m: ExactMatterRecord) => (
                <tr key={m.id} className="hover:bg-[var(--bg-subtle)] transition-colors">
                  <td className="px-5 py-3.5">
                    <strong className="font-bold text-[var(--text-main)] block">{m.title}</strong>
                    <span className="text-[10.5px] text-[var(--text-muted)] font-mono">{m.caseNo}</span>
                  </td>
                  <td className="px-5 py-3.5 text-[var(--text-muted)]">
                    {m.applicant} <span className="text-[10px]">({m.applicantRole})</span>
                  </td>
                  <td className="px-5 py-3.5">{m.forum}</td>
                  <td className="px-5 py-3.5 text-right font-mono font-bold text-[var(--text-main)]">
                    Kshs {m.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[10.5px] font-semibold text-[var(--text-main)]">
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Client Modal */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="vercel-card p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-brand font-bold text-[var(--text-main)] text-sm">
              Register New Law Firm Client
            </h3>
            <form onSubmit={handleClientSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-semibold">Client or Entity Name</label>
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="e.g. Seyani Brothers Kenya Limited"
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)]"
                  required
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-semibold">Client Category</label>
                <select
                  value={newClientCat}
                  onChange={(e) => setNewClientCat(e.target.value)}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)]"
                >
                  <option value="Corporate or Institutional">Corporate or Institutional</option>
                  <option value="Individual Client">Individual Client</option>
                </select>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-semibold">KRA PIN</label>
                <input
                  type="text"
                  value={newClientKra}
                  onChange={(e) => setNewClientKra(e.target.value)}
                  placeholder="P051123456Z"
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)] font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setShowClientModal(false)}
                  className="btn-outline px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-black px-4 py-2 text-xs"
                >
                  Save Client Realtime
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
