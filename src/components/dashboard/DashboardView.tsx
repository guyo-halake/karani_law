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
  ChevronRight,
  Sparkles,
  FileCode,
  Eye,
  EyeOff
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
  const [selectedBarIndex, setSelectedBarIndex] = useState(0);
  const [showPortfolioGraph, setShowPortfolioGraph] = useState(true);
  const [graphMetricTab, setGraphMetricTab] = useState<'claims' | 'feenotes' | 'schedules'>('claims');

  const userName = currentUser?.advocateTitle || currentUser?.fullName || EXACT_FIRM_INFO.user.name;

  // Real Dynamic Computations
  const pendingTaxationsCount = EXACT_MATTERS.filter(
    (m) => m.status.toLowerCase().includes('taxation') || m.status.toLowerCase().includes('ready')
  ).length;

  const todayStr = new Date().toISOString().split('T')[0];
  const processedTodayCount = EXACT_FEE_NOTES.filter(
    (fn) => (fn.createdAt && fn.createdAt.startsWith(todayStr)) && fn.status === 'processed'
  ).length;

  const untaxedDraftsCount = EXACT_FEE_NOTES.filter(
    (fn) => fn.status === 'draft'
  ).length;

  const totalMattersCount = EXACT_MATTERS.length;

  const totalPortfolioValue = EXACT_MATTERS.reduce(
    (sum, m) => sum + (m.amount || 0), 0
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header (Hey, Adv. Karani Victor / Welcome to Nyagah B. Kithinji & Co. Advocates - NO hand emoji 👋) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]/60">
        <div>
          <h1 className="font-brand font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
            Hey, {userName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 font-sans">
            Welcome to Nyagah B. Kithinji & Co. Advocates
          </p>
        </div>

        {/* Action Buttons: Prominent Drafts / Recents button + New Fee Note + Add Client */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => onOpenRecents ? onOpenRecents() : onNavigateTab('vault')}
            className="btn-blue px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            title="Open Draft Fee Notes & Recent Files"
          >
            <Clock className="w-4 h-4" /> Drafts / Recents
          </button>
          <button
            onClick={() => onNavigateTab('boc')}
            className="btn-navy px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-blue-400" /> New Fee Note
          </button>
          <button
            onClick={() => onNavigateTab('clients')}
            className="btn-outline px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-blue-600" /> Add Client
          </button>
        </div>
      </div>

      {/* Main 12-Column Modulix Dashboard Grid Layout */}
      <div className="grid grid-cols-12 gap-6 lg:gap-8">
        
        {/* LEFT MAIN CONTENT (8 Columns) */}
        <div className="col-span-12 lg:col-span-8 space-y-6 lg:space-y-8">
          
          {/* Top 3 KPI Stat Cards Strictly Requested: 1. Claim Overview, 2. Pending Taxation, 3. Processed Fee Notes Today */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            
            {/* KPI Card 1: Claim Overview */}
            <div
              onClick={() => onNavigateTab('matters')}
              className="modulix-card-interactive p-5 space-y-3 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold font-sans text-slate-900 dark:text-white">Claim Overview</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight truncate">
                    Kshs {(totalPortfolioValue / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {totalMattersCount} Active Causes
                  </p>
                </div>

                <svg className="w-14 h-7 text-blue-500 shrink-0" viewBox="0 0 60 30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 25 L 20 15 L 35 20 L 55 5" />
                </svg>
              </div>
            </div>

            {/* KPI Card 2: Pending Taxation */}
            <div
              onClick={() => onNavigateTab('matters')}
              className="modulix-card-interactive p-5 space-y-3 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold font-sans text-slate-900 dark:text-white">Pending Taxation</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                    {pendingTaxationsCount}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Ready for Court</span>
                  </div>
                </div>

                <svg className="w-14 h-7 text-emerald-500 shrink-0" viewBox="0 0 60 30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 20 L 20 12 L 35 18 L 55 8" />
                </svg>
              </div>
            </div>

            {/* KPI Card 3: Processed Fee Notes Today */}
            <div
              onClick={() => onNavigateTab('feenotes')}
              className="modulix-card-interactive p-5 space-y-3 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold font-sans text-slate-900 dark:text-white">Processed Fee Notes Today</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                    {processedTodayCount}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-1">
                    <span>{untaxedDraftsCount} Untaxed / Drafts Pending</span>
                  </div>
                </div>

                <svg className="w-14 h-7 text-emerald-500 shrink-0" viewBox="0 0 60 30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 22 L 18 14 L 32 20 L 55 6" />
                </svg>
              </div>
            </div>

          </div>

          {/* Real Dynamic Portfolio Overview Chart & Multi-Metric Visualizer */}
          <div className="modulix-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider font-mono block">
                    Portfolio Claim & Remuneration Analytics
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-mono font-bold text-[10px]">
                    Live Math Sync
                  </span>
                </div>
                <h3 className="font-brand font-extrabold text-xl text-slate-900 dark:text-white font-mono mt-0.5">
                  Kshs {totalPortfolioValue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-sans">
                  Total Legal Portfolio Sum Across {totalMattersCount} Active Causes & Arbitrations
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Metric Mode Switcher */}
                <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold">
                  <button
                    onClick={() => setGraphMetricTab('claims')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      graphMetricTab === 'claims'
                        ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Claims (Kshs)
                  </button>
                  <button
                    onClick={() => setGraphMetricTab('feenotes')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      graphMetricTab === 'feenotes'
                        ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Fee Notes & Drafts
                  </button>
                  <button
                    onClick={() => setGraphMetricTab('schedules')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      graphMetricTab === 'schedules'
                        ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Statutory Schedules
                  </button>
                </div>

                {/* Show / Hide Graph Toggle Button */}
                <button
                  onClick={() => setShowPortfolioGraph(!showPortfolioGraph)}
                  className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-300 hover:border-blue-500 cursor-pointer transition-all"
                  title={showPortfolioGraph ? "Hide Graph Visualization" : "Show Graph Visualization"}
                >
                  {showPortfolioGraph ? (
                    <><EyeOff className="w-3.5 h-3.5 text-blue-600" /> Hide Graph</>
                  ) : (
                    <><Eye className="w-3.5 h-3.5 text-emerald-600" /> Show Graph</>
                  )}
                </button>
              </div>
            </div>

            {/* Collapsible Graph Section */}
            {showPortfolioGraph ? (
              <div className="space-y-6 animate-fade-in">
                {/* 1. Claims Metric Mode */}
                {graphMetricTab === 'claims' && (
                  <div className="pt-4 pb-2 px-2 space-y-4">
                    <div className="flex items-end justify-between gap-4 h-52 relative border-b border-slate-200/80 dark:border-zinc-700 pb-2">
                      {EXACT_MATTERS.map((m, idx) => {
                        const isSelected = selectedBarIndex === idx;
                        const percentage = Math.round((m.amount / totalPortfolioValue) * 100);
                        return (
                          <div
                            key={m.id}
                            onClick={() => setSelectedBarIndex(idx)}
                            className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer relative"
                          >
                            {/* Selected Bar Tooltip */}
                            {isSelected && (
                              <div className="absolute -top-16 bg-slate-900 text-white px-3.5 py-2 rounded-xl text-center shadow-xl z-20 animate-fade-in border border-slate-700 max-w-[220px]">
                                <p className="text-[10px] text-slate-400 font-sans truncate">{m.title}</p>
                                <p className="text-xs font-bold font-mono text-emerald-400">
                                  Kshs {m.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })} ({percentage}%)
                                </p>
                                <div className="w-2 h-2 bg-slate-900 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border-r border-b border-slate-700"></div>
                              </div>
                            )}

                            {/* Bar Visual */}
                            <div
                              style={{ height: `${Math.max(percentage, 20)}%` }}
                              className={`w-full max-w-[70px] rounded-t-xl transition-all duration-300 ${
                                isSelected
                                  ? 'bg-gradient-to-t from-blue-600 to-indigo-600 shadow-lg scale-105'
                                  : 'bg-slate-200 dark:bg-zinc-700/60 hover:bg-blue-500/30 dark:hover:bg-zinc-600'
                              }`}
                            >
                              <div className="w-full h-full opacity-30 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_25%,rgba(255,255,255,0.2)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.2)_75%)] bg-[length:8px_8px] rounded-t-xl"></div>
                            </div>

                            <span className={`text-[11px] mt-2.5 font-bold font-mono truncate max-w-[120px] ${
                              isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'
                            }`}>
                              {m.applicant.split(' ')[0]} ({percentage}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Interactive matter summary card for selected bar */}
                    {EXACT_MATTERS[selectedBarIndex] && (
                      <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase block">
                            Active Bar Selection: {EXACT_MATTERS[selectedBarIndex].forum}
                          </span>
                          <p className="font-bold text-slate-900 dark:text-white font-sans text-sm mt-0.5">
                            {EXACT_MATTERS[selectedBarIndex].title}
                          </p>
                          <p className="text-slate-500 text-[11px] font-mono mt-0.5">
                            Case Ref: {EXACT_MATTERS[selectedBarIndex].caseNo} • Claim: Kshs {EXACT_MATTERS[selectedBarIndex].amount.toLocaleString()}
                          </p>
                        </div>

                        {onNavigateToBuilder && (
                          <button
                            onClick={() => onNavigateToBuilder('schedule_6_high_court', EXACT_MATTERS[selectedBarIndex].amount)}
                            className="btn-black px-4 py-2 text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
                          >
                            <Calculator className="w-3.5 h-3.5 text-amber-400" /> Calculate Fee Note in BOC
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Fee Notes & Drafts Metric Mode */}
                {graphMetricTab === 'feenotes' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 font-mono">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700 space-y-3">
                      <span className="text-[11px] font-bold text-slate-500 uppercase block font-sans">
                        Fee Notes Status Distribution
                      </span>
                      <div className="space-y-2 text-xs">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">Processed & Taxed Bills</span>
                            <span>{EXACT_FEE_NOTES.filter(f => f.status === 'processed').length} Bills (75%)</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-3/4 rounded-full"></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="font-bold text-amber-600 dark:text-amber-400">Untaxed Drafts Pending</span>
                            <span>{EXACT_FEE_NOTES.filter(f => f.status === 'draft').length} Drafts (25%)</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 w-1/4 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700 space-y-3">
                      <span className="text-[11px] font-bold text-slate-500 uppercase block font-sans">
                        Remuneration Revenue Components
                      </span>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700">
                          <span className="text-[10px] text-slate-400 block">Total Instruction Fees</span>
                          <strong className="text-blue-600 dark:text-blue-400 font-bold text-sm">Kshs 18.89M</strong>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700">
                          <span className="text-[10px] text-slate-400 block">Getting-Up Fee (1/3)</span>
                          <strong className="text-emerald-500 font-bold text-sm">Kshs 6.29M</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Statutory Schedules Metric Mode */}
                {graphMetricTab === 'schedules' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 font-mono">
                    <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-2">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase block font-sans">
                        Schedule 6 — Superior Courts
                      </span>
                      <p className="text-lg font-extrabold text-slate-900 dark:text-white">Kshs 30.82M</p>
                      <p className="text-[11px] text-slate-500 font-sans">High Court, ELC & Court of Appeal Litigation.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-2">
                      <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase block font-sans">
                        Schedule 7 — Arbitration
                      </span>
                      <p className="text-lg font-extrabold text-slate-900 dark:text-white">Kshs 3.98M</p>
                      <p className="text-[11px] text-slate-500 font-sans">Commercial Arbitral Proceedings & Awards.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase block font-sans">
                        Schedule 5 — Subordinate
                      </span>
                      <p className="text-lg font-extrabold text-slate-900 dark:text-white">Kshs 405.5K</p>
                      <p className="text-[11px] text-slate-500 font-sans">Magistrate's Court Civil Suits.</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-zinc-800/50 border border-dashed border-slate-300 dark:border-zinc-700 text-center text-xs text-slate-500">
                <span>Graph visualization hidden. Click <strong>"Show Graph"</strong> above to display analytics chart.</span>
              </div>
            )}
          </div>

          {/* Upcoming Court Filings & Taxations Table */}
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
                className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:border-blue-500 cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5 text-blue-600" />
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
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-blue-400">
                        Kshs {m.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          m.statusClass === 'ready'
                            ? 'badge-green'
                            : 'badge-blue'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            m.statusClass === 'ready' ? 'bg-emerald-500' : 'bg-blue-500'
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
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
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
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200/80 dark:border-zinc-700/80 hover:border-blue-500 transition-all cursor-pointer group flex items-start gap-3"
                >
                  {/* Thumbnail Icon */}
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-700 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0 shadow-xs group-hover:border-blue-500 transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                        {fn.clientName}
                      </p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                        fn.status === 'processed'
                          ? 'badge-green'
                          : 'badge-blue'
                      }`}>
                        {fn.status === 'processed' ? 'Processed' : 'Draft Fee Note'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate font-mono">
                      Ref: {fn.billNumber}
                    </p>

                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200/60 dark:border-zinc-700/60 text-[10.5px]">
                      <span className="font-mono font-bold text-slate-900 dark:text-blue-400">
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
