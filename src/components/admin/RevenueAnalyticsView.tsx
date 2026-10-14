import React, { useState, useEffect, useRef } from 'react';
import { ExactFeeNoteRecord, fetchFeeNotesFromDatabase } from '../../services/supabase';
import { fetchCollectedAmount } from '../../services/data';
import { SystemUser } from '../../services/supabase';
import { 
  TrendingUp, Users, ArrowUpRight, Download, Calendar, 
  BarChart3, PieChart, AlertTriangle, ChevronRight, ArrowUp, ArrowDown
} from 'lucide-react';

// Animated number hook
function useAnimatedNumber(target: number, duration: number = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef<number | null>(null);
  useEffect(() => {
    if (ref.current !== null) cancelAnimationFrame(ref.current);
    const start = performance.now();
    const from = 0;
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => { if (ref.current !== null) cancelAnimationFrame(ref.current); };
  }, [target, duration]);
  return value;
}

interface RevenueAnalyticsViewProps {
  currentUser?: SystemUser | null;
}

export const RevenueAnalyticsView: React.FC<RevenueAnalyticsViewProps> = ({ currentUser }) => {
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'ytd' | 'all'>('ytd');
  const [viewMode, setViewMode] = useState<'advocate' | 'client'>('advocate');
  const [feeNotes, setFeeNotes] = useState<ExactFeeNoteRecord[]>([]);
  const [totalCollected, setTotalCollected] = useState(0);

  useEffect(() => {
    if (!currentUser?.firmId) return;
    const loadRevenue = async () => {
      try {
        const [notes, collected] = await Promise.all([
          fetchFeeNotesFromDatabase(currentUser.firmId!),
          fetchCollectedAmount(currentUser.firmId!),
        ]);
        setFeeNotes(notes);
        setTotalCollected(collected);
      } catch {}
    };
    void loadRevenue();
    const handleRealtime = (event: Event) => {
      const detail = (event as CustomEvent<{ table?: string }>).detail;
      if (detail?.table === 'fee_notes' || detail?.table === 'payments') void loadRevenue();
    };
    window.addEventListener('databaseRealtimeUpdate', handleRealtime);
    return () => window.removeEventListener('databaseRealtimeUpdate', handleRealtime);
  }, [currentUser?.firmId]);

  // Real revenue from actual fee notes
  const totalBilledReal = feeNotes.reduce((sum, fn) => sum + (fn.grandTotal || 0), 0);
  
  // Group by advocate
  const advocateMap: Record<string, { billed: number; count: number }> = {};
  feeNotes.forEach(fn => {
    const name = fn.generatedByUser || 'Adv. Nyagah Kithinji';
    if (!advocateMap[name]) advocateMap[name] = { billed: 0, count: 0 };
    advocateMap[name].billed += fn.grandTotal || 0;
    advocateMap[name].count += 1;
  });

  // Group by client
  const clientMap: Record<string, { billed: number; count: number }> = {};
  feeNotes.forEach(fn => {
    const name = fn.clientName || 'Unknown Client';
    if (!clientMap[name]) clientMap[name] = { billed: 0, count: 0 };
    clientMap[name].billed += fn.grandTotal || 0;
    clientMap[name].count += 1;
  });

  const collectionRate = totalBilledReal > 0 ? totalCollected / totalBilledReal : 0;
  const totalOutstanding = totalBilledReal - totalCollected;

  // Overdue simulation (notes older than 30 days with status still draft)
  const overdueNotes = feeNotes.filter(fn => {
    const created = new Date(fn.createdAt || 0);
    const daysSince = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > 30 && fn.status !== 'processed';
  });

  // Animated KPIs
  const animBilled = useAnimatedNumber(totalBilledReal);
  const animCollected = useAnimatedNumber(totalCollected);
  const animOutstanding = useAnimatedNumber(totalOutstanding);

  const breakdownData = viewMode === 'advocate' 
    ? Object.entries(advocateMap).sort((a, b) => b[1].billed - a[1].billed)
    : Object.entries(clientMap).sort((a, b) => b[1].billed - a[1].billed);

  const maxBilled = breakdownData.length > 0 ? Math.max(...breakdownData.map(([, d]) => d.billed)) : 1;

  return (
    <div className="space-y-5 text-slate-900 dark:text-white font-sans">
      
      {/* Header */}
      <div className="glass-banner p-6 text-white anim-fade-up relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-blue-500/8 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 w-fit"
              style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)' }}>
              <TrendingUp className="w-3 h-3" /> Real-Time Financial Overview
            </span>
            <h1 className="font-brand font-black text-2xl text-white mt-2">Firm Revenue & Billing</h1>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Calculated from {feeNotes.length} saved fee notes in the database.
            </p>
          </div>

          {/* Time Range + Export */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center p-0.5 rounded-xl font-mono text-[10px]"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {(['month', 'quarter', 'ytd', 'all'] as const).map(range => (
                <button key={range} onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                    timeRange === range ? 'bg-white/15 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
                  }`}>
                  {range === 'ytd' ? 'YTD' : range === 'all' ? 'All' : range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
            <button className="p-2 rounded-xl cursor-pointer transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              title="Export Report">
              <Download className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Billed', value: animBilled, color: 'blue', icon: BarChart3, sublabel: `From ${feeNotes.length} fee notes` },
          { label: 'Collected', value: animCollected, color: 'emerald', icon: ArrowUp, sublabel: `${(collectionRate * 100).toFixed(0)}% Recovery Rate` },
          { label: 'Outstanding', value: animOutstanding, color: 'amber', icon: ArrowDown, sublabel: overdueNotes.length > 0 ? `${overdueNotes.length} overdue (30+ days)` : 'All current' },
        ].map((kpi, i) => {
          const colors: Record<string, string> = {
            blue: 'from-blue-500/8 to-blue-500/3 border-blue-500/15 text-blue-700 dark:text-blue-400',
            emerald: 'from-emerald-500/8 to-emerald-500/3 border-emerald-500/15 text-emerald-700 dark:text-emerald-400',
            amber: 'from-amber-500/8 to-amber-500/3 border-amber-500/15 text-amber-700 dark:text-amber-400',
          };
          return (
            <div key={kpi.label} className={`glass-card p-5 space-y-2 anim-fade-up bg-gradient-to-br ${colors[kpi.color]}`}
              style={{ animationDelay: `${100 + i * 80}ms`, borderRadius: '18px' }}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono opacity-80">{kpi.label}</span>
                <kpi.icon className="w-4 h-4 opacity-50" />
              </div>
              <p className="text-2xl sm:text-3xl font-mono font-black anim-count-up" style={{ animationDelay: `${200 + i * 100}ms` }}>
                KES {kpi.value.toLocaleString('en-KE')}
              </p>
              <span className="text-[10px] font-mono block opacity-70">{kpi.sublabel}</span>
            </div>
          );
        })}
      </div>

      {/* Overdue Alert */}
      {overdueNotes.length > 0 && (
        <div className="glass-card accent-border-red p-4 flex items-center gap-3 anim-fade-up anim-fade-up-d3" style={{ borderRadius: '14px' }}>
          <div className="p-2 rounded-xl bg-red-500/10">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-red-700 dark:text-red-400">
              {overdueNotes.length} Overdue Fee Note{overdueNotes.length > 1 ? 's' : ''} (30+ Days Outstanding)
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              Total overdue: KES {overdueNotes.reduce((s, n) => s + (n.grandTotal || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Breakdown Section */}
      <div className="glass-card p-5 space-y-5 anim-fade-up anim-fade-up-d4" style={{ borderRadius: '18px' }}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" /> Billing Breakdown
          </h3>
          
          {/* Toggle: Advocate vs Client */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-[10px] font-mono">
            <button onClick={() => setViewMode('advocate')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${viewMode === 'advocate' ? 'bg-slate-900 text-white dark:bg-zinc-700 shadow-sm' : 'text-slate-500'}`}>
              By Advocate
            </button>
            <button onClick={() => setViewMode('client')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${viewMode === 'client' ? 'bg-slate-900 text-white dark:bg-zinc-700 shadow-sm' : 'text-slate-500'}`}>
              By Client
            </button>
          </div>
        </div>

        {breakdownData.length === 0 ? (
          <div className="text-center py-8">
            <PieChart className="w-12 h-12 text-slate-200 dark:text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No billing data yet</p>
            <p className="text-[10px] text-slate-400/60 font-mono mt-1">Create fee notes to populate this view</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {breakdownData.map(([name, stats], idx) => {
              const pct = Math.round((stats.billed / maxBilled) * 100);
              const collectedAmt = Math.round(stats.billed * collectionRate);
              const outstandingAmt = stats.billed - collectedAmt;
              return (
                <div key={name} className="p-4 rounded-xl bg-slate-50/50 dark:bg-zinc-800/30 border border-slate-100 dark:border-zinc-800/50 space-y-3 anim-fade-up"
                  style={{ animationDelay: `${idx * 60}ms` }}>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        <span className="text-slate-400 font-mono mr-1.5">#{idx + 1}</span>
                        {name}
                      </h4>
                      <span className="text-[9px] text-slate-400 font-mono">{stats.count} fee note{stats.count > 1 ? 's' : ''}</span>
                    </div>
                    <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white shrink-0">
                      KES {(stats.billed / 1000000).toFixed(stats.billed > 1000000 ? 1 : 2)}{stats.billed > 1000000 ? 'M' : 'K'}
                    </span>
                  </div>

                  {/* Animated Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full anim-progress"
                      style={{ width: `${pct}%`, animationDelay: `${300 + idx * 80}ms` }}></div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    <span>Collected: <strong className="text-emerald-600">KES {(collectedAmt / 1000).toFixed(0)}K</strong></span>
                    <span>Outstanding: <strong className="text-amber-600">KES {(outstandingAmt / 1000).toFixed(0)}K</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default RevenueAnalyticsView;
