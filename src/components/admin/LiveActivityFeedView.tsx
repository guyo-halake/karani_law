import React, { useState, useEffect } from 'react';
import { getActivityLogs, ActivityLogItem } from '../../services/activityLogger';
import { Activity, Clock, ShieldCheck, Filter, RefreshCw } from 'lucide-react';

export const LiveActivityFeedView: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLogItem[]>(() => getActivityLogs());
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    const handleUpdate = () => setLogs(getActivityLogs());
    window.addEventListener('activityLogsUpdated', handleUpdate);
    const timer = setInterval(() => setLogs(getActivityLogs()), 3000);
    return () => {
      window.removeEventListener('activityLogsUpdated', handleUpdate);
      clearInterval(timer);
    };
  }, []);

  const filteredLogs = logs.filter(l => filterType === 'all' || l.type === filterType);

  return (
    <div className="space-y-6 text-slate-900 dark:text-white font-sans">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[11px] uppercase tracking-wider border border-emerald-500/20 flex items-center gap-1 w-fit">
            <Activity className="w-3.5 h-3.5" /> REAL-TIME AUDIT LOG
          </span>
          <h1 className="font-brand font-black text-2xl text-slate-900 dark:text-white mt-1">
            Live Firm Activity Feed
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Streaming audit trace of advocate fee note creations, approvals, demand letters, logins & security policy updates.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-zinc-800 rounded-xl text-xs font-mono shrink-0">
          {(['all', 'feenote', 'approval', 'return', 'permission', 'login'] as const).map(tp => (
            <button
              key={tp}
              onClick={() => setFilterType(tp)}
              className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                filterType === tp 
                  ? 'bg-slate-900 text-white dark:bg-zinc-700 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {tp}
            </button>
          ))}
        </div>
      </div>

      {/* Real Audit Stream Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm p-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white font-mono uppercase">
              Live Socket Event Stream ({filteredLogs.length} Events Logged)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Auto-sync active</span>
        </div>

        <div className="space-y-3">
          {filteredLogs.map(log => (
            <div key={log.id} className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 flex items-start gap-3 hover:bg-slate-100/70 transition-colors">
              <span className={`w-3 h-3 rounded-full ${log.badgeColor} mt-1 shrink-0`}></span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-900 dark:text-white leading-relaxed">
                  <strong className="font-bold">{log.advocateName}</strong> {log.action}
                </p>
                <span className="text-[10px] text-slate-400 font-mono block mt-1">{log.timeAgo} ({new Date(log.timestamp).toLocaleTimeString()})</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default LiveActivityFeedView;
