import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Briefcase,
  TrendingUp,
  Filter,
  ChevronDown,
  Plus,
  UserPlus,
  Calculator,
  FileText,
  DollarSign,
  Calendar,
  Building2,
  ChevronRight,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

import { EXACT_MATTERS, EXACT_FEE_NOTES, EXACT_CLIENTS, EXACT_FIRM_INFO, SystemUser } from '../../services/supabase';

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
  onNavigateToBuilder?: (court: string, value: number) => void;
  onOpenRecents?: () => void;
  currentUser?: SystemUser | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onNavigateToBuilder,
  onOpenRecents,
  currentUser,
}) => {
  const [selectedBarIndex, setSelectedBarIndex] = useState(0); // First matter selected by default

  const userName = currentUser?.advocateTitle || currentUser?.fullName || EXACT_FIRM_INFO.user.name;

  // REAL DYNAMIC COMPUTATIONS FROM DATABASE (No Fake Data)
  const pendingTaxationsCount = EXACT_MATTERS.filter(
    (m) => m.status.toLowerCase().includes('taxation') || m.status.toLowerCase().includes('ready')
  ).length;

  const processedFeeNotesCount = EXACT_FEE_NOTES.filter(
    (fn) => fn.status === 'processed'
  ).length;

  const totalMattersCount = EXACT_MATTERS.length;

  const totalPortfolioValue = EXACT_MATTERS.reduce(
    (sum, m) => sum + (m.amount || 0), 0
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header strictly following user instructions (No hand emoji 👋, Hey greeting, exact subtitle) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]/60">
        <div>
          <h1 className="font-brand font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
            Hey, {userName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 font-sans">
            Welcome to Nyagah B. Kithinji & Co. Advocates
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigateTab('boc')}
            className="btn-gold px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Fee Note
          </button>
          <button
            onClick={() => onNavigateTab('clients')}
            className="btn-navy px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-amber-400" /> Add Client
          </button>
        </div>
      </div>

      {/* Main 12-Column Modulix Dashboard Grid Layout */}
      <div className="grid grid-cols-12 gap-6 lg:gap-8">
        
        {/* LEFT MAIN CONTENT (8 Columns) */}
        <div className="col-span-12 lg:col-span-8 space-y-6 lg:space-y-8">
          
          {/* Top 3 Real Dynamic Modulix KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            
            {/* KPI Card 1: Real Pending Taxations */}
            <div
              onClick={() => onNavigateTab('matters')}
              className="modulix-card-interactive p-5 space-y-3 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold font-sans">Pending Taxations</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                    {pendingTaxationsCount}
                  </p>
                  <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-1">
                    Ready for Court Taxation
                  </p>
                </div>

                <svg className="w-14 h-7 text-amber-500" viewBox="0 0 60 30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 25 L 20 18 L 35 22 L 55 5" />
                </svg>
              </div>
            </div>

            {/* KPI Card 2: Real Processed Fee Notes */}
            <div
              onClick={() => onNavigateTab('feenotes')}
              className="modulix-card-interactive p-5 space-y-3 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold font-sans">Processed Fee Notes</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                    {processedFeeNotesCount}
                  </p>
                  <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    Taxed & Billing Ready
                  </p>
                </div>

                <svg className="w-14 h-7 text-emerald-500" viewBox="0 0 60 30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 22 L 18 18 L 32 24 L 55 8" />
                </svg>
              </div>
            </div>

            {/* KPI Card 3: Real Total Active Matters */}
            <div
              onClick={() => onNavigateTab('matters')}
              className="modulix-card-interactive p-5 space-y-3 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold font-sans">Total Active Matters</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                    {totalMattersCount}
                  </p>
                  <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                    Active High Court Causes
                  </p>
                </div>

                <svg className="w-14 h-7 text-indigo-500" viewBox="0 0 60 30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 15 L 20 8 L 35 18 L 55 10" />
                </svg>
              </div>
            </div>

          </div>

          {/* Real Dynamic Portfolio Overview Chart */}
          <div className="modulix-card space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider font-mono block mb-0.5">
                  Portfolio Claim Overview
                </span>
                <h3 className="font-brand font-extrabold text-xl text-slate-900 dark:text-white font-mono">
                  Kshs {totalPortfolioValue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-sans">
                  Total Legal Claim Sum Across Active High Court & Arbitration Causes
                </p>
              </div>

              <button
                onClick={() => onNavigateTab('matters')}
                className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-300 hover:border-slate-400 cursor-pointer"
              >
                <span>View All Causes ({totalMattersCount})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Dynamic Matter Value Bars */}
            <div className="pt-6 pb-2 px-2">
              <div className="flex items-end justify-between gap-4 h-44 relative border-b border-slate-200/80 dark:border-zinc-700 pb-2">
                {EXACT_MATTERS.map((m, idx) => {
                  const isSelected = selectedBarIndex === idx;
                  const percentage = Math.round((m.amount / totalPortfolioValue) * 100);
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedBarIndex(idx)}
                      className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer relative"
                    >
                      {/* Dark Tooltip Bubble for Selected Bar */}
                      {isSelected && (
                        <div className="absolute -top-16 bg-slate-900 text-white px-3.5 py-2 rounded-xl text-center shadow-xl z-20 animate-fade-in border border-slate-700 max-w-[200px]">
                          <p className="text-[10px] text-slate-400 font-sans truncate">{m.caseNo}</p>
                          <p className="text-xs font-bold font-mono text-amber-400">
                            Kshs {m.amount.toLocaleString('en-KE')}
                          </p>
                          <div className="w-2 h-2 bg-slate-900 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border-r border-b border-slate-700"></div>
                        </div>
                      )}

                      {/* Bar Visual */}
                      <div
                        style={{ height: `${Math.max(percentage, 25)}%` }}
                        className={`w-full max-w-[60px] rounded-t-xl transition-all duration-200 ${
                          isSelected
                            ? 'bg-slate-900 dark:bg-amber-500 shadow-md scale-105'
                            : 'bg-slate-200 dark:bg-zinc-700/60 hover:bg-slate-300 dark:hover:bg-zinc-600'
                        }`}
                      >
                        {!isSelected && (
                          <div className="w-full h-full opacity-20 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.1)_25%,rgba(0,0,0,0.1)_50%,transparent_50%,transparent_75%,rgba(0,0,0,0.1)_75%)] bg-[length:8px_8px] rounded-t-xl"></div>
                        )}
                      </div>

                      <span className={`text-[11px] mt-2.5 font-bold font-mono truncate max-w-[90px] ${
                        isSelected ? 'text-slate-900 dark:text-amber-400' : 'text-slate-500'
                      }`}>
                        {m.caseNo.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Upcoming Court Filings & Taxations Table with REAL Database Records */}
          <div className="modulix-card p-0 overflow-hidden">
            <div className="p-5 flex items-center justify-between border-b border-slate-200/70">
              <div>
                <h3 className="font-brand font-bold text-base text-slate-900 dark:text-white">
                  Upcoming Court Filings & Taxations
                </h3>
                <p className="text-xs text-slate-500">Live Active Causes Registered in Database</p>
              </div>
              <button
                onClick={() => onNavigateTab('matters')}
                className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:border-slate-400 cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>View Matters</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="modulix-table-header">
                    <th className="py-3 px-5"><input type="checkbox" className="rounded" /></th>
                    <th className="py-3 px-4">Cause / Matter ID</th>
                    <th className="py-3 px-4">Client / Title</th>
                    <th className="py-3 px-4">Claim Amount</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 dark:divide-zinc-800 text-xs">
                  {EXACT_MATTERS.map((m, idx) => (
                    <tr
                      key={m.id}
                      onClick={() => onNavigateTab('matters')}
                      className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-5" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded" defaultChecked={idx === 0} />
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {m.caseNo}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-zinc-200">
                        {m.title}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-amber-400">
                        Kshs {m.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          m.statusClass === 'ready' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                          m.statusClass === 'court' ? 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20' :
                          'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            m.statusClass === 'ready' ? 'bg-emerald-500' :
                            m.statusClass === 'court' ? 'bg-indigo-500' : 'bg-amber-500'
                          }`}></span>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT AUXILIARY COLUMN (4 Columns): REAL Fee Notes & Billing History */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="modulix-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
              <div>
                <h3 className="font-brand font-bold text-base text-slate-900 dark:text-white">
                  Fee Notes & Billing History
                </h3>
                <p className="text-[11px] text-slate-500">Live Database Generated Bills</p>
              </div>
              <button
                onClick={() => onNavigateTab('feenotes')}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                View All →
              </button>
            </div>

            {/* List of Real Fee Note Cards from EXACT_FEE_NOTES */}
            <div className="space-y-3">
              {EXACT_FEE_NOTES.map((fn) => (
                <div
                  key={fn.id}
                  onClick={() => onNavigateTab('feenotes')}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200/80 dark:border-zinc-700/80 hover:border-amber-500 transition-all cursor-pointer group flex items-start gap-3"
                >
                  {/* Thumbnail Icon */}
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-700 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-sm shrink-0 shadow-xs group-hover:border-amber-500 transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-600 transition-colors">
                        {fn.clientName}
                      </p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                        fn.status === 'processed'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      }`}>
                        {fn.status === 'processed' ? 'Processed' : 'Draft Fee Note'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate font-mono">
                      Ref: {fn.billNumber}
                    </p>

                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200/60 dark:border-zinc-700/60 text-[10.5px]">
                      <span className="font-mono font-bold text-slate-900 dark:text-amber-400">
                        Kshs {fn.grandTotal.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-slate-400 font-mono">{fn.createdAt.split('T')[0]}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardView;
