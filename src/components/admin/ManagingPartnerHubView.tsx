import React from 'react';
import { ShieldCheck, Clock, TrendingUp, Lock, Activity, FileText, ChevronRight, ArrowUpRight } from 'lucide-react';
import { getFeeNotes } from '../../services/supabase';

interface ManagingPartnerHubViewProps {
  onNavigateTab: (tab: string) => void;
}

export const ManagingPartnerHubView: React.FC<ManagingPartnerHubViewProps> = ({ onNavigateTab }) => {
  const feeNotes = getFeeNotes();
  const pendingCount = feeNotes.filter(n => n.status === 'draft' || (n as any).status === 'pending').length;

  return (
    <div className="space-y-8 text-slate-900 dark:text-white font-sans">
      
      {/* GOD MODE HUB BANNER */}
      <div className="p-8 rounded-3xl bg-slate-900 dark:bg-zinc-900 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-400 font-mono font-extrabold text-xs tracking-wider border border-amber-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              EXECUTIVE GOD MODE SUITE
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="System Live"></span>
          </div>
          
          <h1 className="font-brand font-black text-3xl sm:text-4xl tracking-tight text-white">
            Managing Partner Control Suite — Adv. Nyagah Kithinji
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-sans leading-relaxed">
            Welcome to your dedicated executive workspace. Select any of your specialized management consoles from the menu below or the sidebar navigation.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateTab('boc')}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Create My BOC (As Practicing Advocate)
            </button>
          </div>
        </div>
      </div>

      {/* 4 DEDICATED CONSOLE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Approval Queue */}
        <div 
          onClick={() => onNavigateTab('managing_approvals')}
          className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-amber-500/50 transition-all cursor-pointer space-y-4 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              {pendingCount} Pending
            </span>
          </div>
          <div>
            <h3 className="font-brand font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-1 group-hover:text-amber-500 transition-colors">
              BOC Approval Queue <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-1">
              Review itemized folios, approve bills for court filing, or return to advocates with taxing master notes.
            </p>
          </div>
        </div>

        {/* Card 2: Revenue Analytics */}
        <div 
          onClick={() => onNavigateTab('managing_revenue')}
          className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-blue-500/50 transition-all cursor-pointer space-y-4 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
              Real-time DB Sync
            </span>
          </div>
          <div>
            <h3 className="font-brand font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-1 group-hover:text-blue-500 transition-colors">
              Firm Revenue & Billing Analytics <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-1">
              Total billed, collected, and outstanding fee breakdown by advocate with date filtering (Month, Quarter, YTD).
            </p>
          </div>
        </div>

        {/* Card 3: Permissions Dashboard */}
        <div 
          onClick={() => onNavigateTab('managing_permissions')}
          className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-purple-500/50 transition-all cursor-pointer space-y-4 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Lock className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
              RBAC Matrix
            </span>
          </div>
          <div>
            <h3 className="font-brand font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-1 group-hover:text-purple-500 transition-colors">
              Advocate Permissions & RBAC <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-1">
              Granular toggles for advocate fee note rights, client visibility scope, data export, and matter deletion.
            </p>
          </div>
        </div>

        {/* Card 4: Live Activity Feed */}
        <div 
          onClick={() => onNavigateTab('managing_audit')}
          className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-emerald-500/50 transition-all cursor-pointer space-y-4 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              Live Socket Trace
            </span>
          </div>
          <div>
            <h3 className="font-brand font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-1 group-hover:text-emerald-500 transition-colors">
              Live Firm Activity Stream <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-1">
              Real-time audit feed capturing advocate edits, demand letters, security policy updates, and logins.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ManagingPartnerHubView;
