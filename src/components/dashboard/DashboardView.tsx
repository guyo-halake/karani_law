import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Filter,
  ChevronDown,
  Plus,
  UserPlus,
  Calculator,
  FileText,
  DollarSign,
  Calendar,
  AlertCircle,
  Building2,
  ChevronRight,
  Sparkles
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
  const [timeFilter, setTimeFilter] = useState('Last Month');
  const [selectedBarIndex, setSelectedBarIndex] = useState(4); // August selected by default

  const userName = currentUser?.advocateTitle || currentUser?.fullName || EXACT_FIRM_INFO.user.name;

  // Monthly breakdown mock data for bar chart
  const monthlyData = [
    { month: 'Apr', value: 45, label: 'Kshs 8.2M' },
    { month: 'May', value: 60, label: 'Kshs 11.4M' },
    { month: 'Jun', value: 75, label: 'Kshs 14.1M' },
    { month: 'Jul', value: 50, label: 'Kshs 9.8M' },
    { month: 'Aug', value: 95, label: 'Kshs 18.5M' }, // Selected
    { month: 'Sep', value: 70, label: 'Kshs 13.2M' },
    { month: 'Oct', value: 55, label: 'Kshs 10.6M' },
    { month: 'Nov', value: 80, label: 'Kshs 15.7M' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header strictly following Modulix format */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--border-color)]/60">
        <div>
          <h1 className="font-brand font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Welcome, {userName} <span className="inline-block animate-bounce">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 font-sans">
            Manage court taxations, track fee notes, and legal portfolio — all in one place.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
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

      {/* Main 12-Column Dashboard Grid Layout */}
      <div className="grid grid-cols-12 gap-6 lg:gap-8">
        
        {/* LEFT MAIN CONTENT (8 Columns) */}
        <div className="col-span-12 lg:col-span-8 space-y-6 lg:space-y-8">
          
          {/* Top 3 Modulix KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            
            {/* KPI Card 1: Pending Taxations */}
            <div className="modulix-card p-5 space-y-3 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700">
                  <Clock className="w-4 h-4 text-slate-700 dark:text-zinc-300" />
                </div>
                <span className="text-xs font-bold font-sans">Pending Taxations</span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                    219
                  </p>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+21% vs Last Month</span>
                  </div>
                </div>

                {/* SVG Mini Sparkline */}
                <svg className="w-16 h-8 text-emerald-500" viewBox="0 0 60 30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 25 L 20 20 L 35 22 L 55 5" />
                </svg>
              </div>
            </div>

            {/* KPI Card 2: Recent Delivered Fee Notes */}
            <div className="modulix-card p-5 space-y-3 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700">
                  <CheckCircle2 className="w-4 h-4 text-slate-700 dark:text-zinc-300" />
                </div>
                <span className="text-xs font-bold font-sans">Recent Delivered</span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                    231
                  </p>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+11% vs Last Month</span>
                  </div>
                </div>

                {/* SVG Mini Sparkline */}
                <svg className="w-16 h-8 text-emerald-500" viewBox="0 0 60 30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 22 L 18 18 L 32 24 L 55 8" />
                </svg>
              </div>
            </div>

            {/* KPI Card 3: Total Portfolio */}
            <div className="modulix-card p-5 space-y-3 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700">
                  <Briefcase className="w-4 h-4 text-slate-700 dark:text-zinc-300" />
                </div>
                <span className="text-xs font-bold font-sans">Total Matters</span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                    500
                  </p>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 mt-1">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>-125 vs Last Month</span>
                  </div>
                </div>

                {/* SVG Mini Sparkline */}
                <svg className="w-16 h-8 text-rose-500" viewBox="0 0 60 30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 8 L 22 15 L 38 12 L 55 25" />
                </svg>
              </div>
            </div>

          </div>

          {/* Overview Chart Container strictly following Modulix Bar & Popover Tooltip */}
          <div className="modulix-card space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-brand font-bold text-lg text-slate-900 dark:text-white">
                  Overview
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500 font-sans">Avg Per month</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">1,860/3K</span>
                  <span className="text-[11px] font-bold bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    50.2% ▲
                  </span>
                </div>
              </div>

              {/* Time Filter Pill Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setTimeFilter(timeFilter === 'Last Month' ? 'This Quarter' : 'Last Month')}
                  className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:border-slate-400 cursor-pointer"
                >
                  <span>{timeFilter}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Striped Bar Chart with Floating Dark Tooltip */}
            <div className="pt-8 pb-2 px-2">
              <div className="flex items-end justify-between gap-3 h-48 relative border-b border-slate-200/80 dark:border-zinc-700 pb-2">
                
                {monthlyData.map((item, idx) => {
                  const isSelected = selectedBarIndex === idx;
                  return (
                    <div
                      key={item.month}
                      onClick={() => setSelectedBarIndex(idx)}
                      className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer relative"
                    >
                      {/* Dark Tooltip Bubble for Selected Bar */}
                      {isSelected && (
                        <div className="absolute -top-14 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-center shadow-xl z-20 animate-fade-in border border-slate-700">
                          <p className="text-[10px] text-slate-400 font-sans">{item.month} 2026</p>
                          <p className="text-xs font-bold font-mono text-amber-400">{item.label}</p>
                          {/* Tooltip Arrow */}
                          <div className="w-2 h-2 bg-slate-900 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border-r border-b border-slate-700"></div>
                        </div>
                      )}

                      {/* Bar Visual */}
                      <div
                        style={{ height: `${item.value}%` }}
                        className={`w-full max-w-[36px] rounded-t-xl transition-all duration-200 ${
                          isSelected
                            ? 'bg-slate-900 dark:bg-amber-500 shadow-md scale-105'
                            : 'bg-slate-200 dark:bg-zinc-700/60 hover:bg-slate-300 dark:hover:bg-zinc-600'
                        }`}
                      >
                        {/* Striped pattern overlay for inactive bars */}
                        {!isSelected && (
                          <div className="w-full h-full opacity-30 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.1)_25%,rgba(0,0,0,0.1)_50%,transparent_50%,transparent_75%,rgba(0,0,0,0.1)_75%)] bg-[length:8px_8px] rounded-t-xl"></div>
                        )}
                      </div>

                      <span className={`text-xs mt-3 font-semibold font-mono ${
                        isSelected ? 'text-slate-900 dark:text-amber-400 font-bold' : 'text-slate-400'
                      }`}>
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Upcoming Filings & Taxations Table strictly following Light Gray #F9FAFB Table Header */}
          <div className="modulix-card p-0 overflow-hidden">
            <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-200/70">
              <h3 className="font-brand font-bold text-lg text-slate-900 dark:text-white">
                Upcoming Court Filings & Taxations
              </h3>
              <button
                onClick={() => onNavigateTab('matters')}
                className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:border-slate-400 cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filter</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="modulix-table-header">
                    <th className="py-3 px-6"><input type="checkbox" className="rounded" /></th>
                    <th className="py-3 px-4">Cause / Matter ID</th>
                    <th className="py-3 px-4">Client / Item</th>
                    <th className="py-3 px-4">Claim Amount</th>
                    <th className="py-3 px-4">Filing Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 dark:divide-zinc-800 text-xs">
                  {EXACT_MATTERS.slice(0, 3).map((m, idx) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="py-3.5 px-6"><input type="checkbox" className="rounded" defaultChecked={idx === 0} /></td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{m.caseNo}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-zinc-200">{m.title}</td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-amber-400">
                        Kshs {(m.amount || 15000000).toLocaleString('en-KE')}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">Sep {20 + idx}, 2026</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          idx === 0 ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                          idx === 1 ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                          'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            idx === 0 ? 'bg-emerald-500' : idx === 1 ? 'bg-amber-500' : 'bg-indigo-500'
                          }`}></span>
                          {idx === 0 ? 'Scheduled' : idx === 1 ? 'On The Way' : 'In Progress'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT AUXILIARY COLUMN (4 Columns): Fee Notes & Billing History strictly replacing buying history */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="modulix-card space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
              <h3 className="font-brand font-bold text-base text-slate-900 dark:text-white">
                Fee Notes & Billing History
              </h3>
              <button
                onClick={() => onNavigateTab('feenotes')}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                View All →
              </button>
            </div>

            {/* List of Recent Fee Note Cards */}
            <div className="space-y-3.5">
              {EXACT_FEE_NOTES.slice(0, 5).map((fn, idx) => (
                <div
                  key={fn.id}
                  onClick={() => onNavigateTab('feenotes')}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200/80 dark:border-zinc-700/80 hover:border-slate-400 transition-all cursor-pointer group flex items-start gap-3"
                >
                  {/* Thumbnail Icon */}
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-700 flex items-center justify-center text-slate-700 dark:text-amber-400 font-bold text-sm shrink-0 shadow-xs group-hover:border-amber-500 transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-600 transition-colors">
                        {fn.clientName}
                      </p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                        idx % 3 === 0 ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                        idx % 3 === 1 ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                        'bg-slate-200/80 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300'
                      }`}>
                        {idx % 3 === 0 ? 'On Progress' : idx % 3 === 1 ? 'On Hold' : 'Completed'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate font-mono">
                      Ref: {fn.billNumber}
                    </p>

                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200/60 dark:border-zinc-700/60 text-[10.5px]">
                      <span className="font-mono font-bold text-slate-900 dark:text-amber-400">
                        Kshs {fn.grandTotal.toLocaleString('en-KE')}
                      </span>
                      <span className="text-slate-400 font-mono">Sep {15 + idx}, 2026</span>
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
