import React, { useState, useEffect, useRef } from 'react';
import { getActivityLogs, ActivityLogItem } from '../../services/activityLogger';
import { 
  Activity, Clock, Search, Download, AlertTriangle, Shield,
  Eye, RefreshCw, Filter, ChevronDown, Globe, Users
} from 'lucide-react';

const TYPE_COLORS: Record<string, { dot: string; bg: string; label: string }> = {
  feenote: { dot: 'bg-amber-500', bg: 'bg-amber-500/8 border-amber-500/15', label: 'Fee Note' },
  approval: { dot: 'bg-emerald-500', bg: 'bg-emerald-500/8 border-emerald-500/15', label: 'Approval' },
  return: { dot: 'bg-red-500', bg: 'bg-red-500/8 border-red-500/15', label: 'Return' },
  permission: { dot: 'bg-purple-500', bg: 'bg-purple-500/8 border-purple-500/15', label: 'Permission' },
  login: { dot: 'bg-blue-500', bg: 'bg-blue-500/8 border-blue-500/15', label: 'Login' },
  letter: { dot: 'bg-teal-500', bg: 'bg-teal-500/8 border-teal-500/15', label: 'Letter' },
  vault: { dot: 'bg-indigo-500', bg: 'bg-indigo-500/8 border-indigo-500/15', label: 'Vault' },
};

const ADVOCATE_INITIALS: Record<string, string> = {
  'Adv. Wanjiku': 'WJ',
  'Adv. Ochieng': 'OC',
  'Adv. Kamau': 'KM',
  'Adv. Nyagah Kithinji': 'NK',
  'Adv. Karani Victor': 'KV',
};

export const LiveActivityFeedView: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLogItem[]>(() => getActivityLogs());
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCount, setShowCount] = useState(20);
  const prevLogsRef = useRef<number>(logs.length);
  const [newEventIds, setNewEventIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleUpdate = () => {
      const updated = getActivityLogs();
      // Track new events for animation
      if (updated.length > prevLogsRef.current) {
        const newIds = new Set(updated.slice(0, updated.length - prevLogsRef.current).map(l => l.id));
        setNewEventIds(newIds);
        setTimeout(() => setNewEventIds(new Set()), 2000);
      }
      prevLogsRef.current = updated.length;
      setLogs(updated);
    };
    window.addEventListener('activityLogsUpdated', handleUpdate);
    const timer = setInterval(() => setLogs(getActivityLogs()), 5000);
    return () => {
      window.removeEventListener('activityLogsUpdated', handleUpdate);
      clearInterval(timer);
    };
  }, []);

  // Filter + search
  let filteredLogs = logs.filter(l => {
    if (filterType !== 'all' && l.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return l.advocateName.toLowerCase().includes(q) || l.action.toLowerCase().includes(q);
    }
    return true;
  });

  const displayedLogs = filteredLogs.slice(0, showCount);

  // Suspicious activity detection
  const suspiciousEvents = logs.filter(l => {
    if (l.type === 'login' && l.action.toLowerCase().includes('mombasa')) return true;
    if (l.type === 'permission' && l.action.toLowerCase().includes('delete')) return true;
    if (l.action.toLowerCase().includes('export') && l.action.toLowerCase().includes('bulk')) return true;
    return false;
  });

  // Activity stats
  const stats = {
    total: logs.length,
    today: logs.filter(l => {
      const d = new Date(l.timestamp);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }).length,
    types: Object.entries(
      logs.reduce((acc, l) => { acc[l.type] = (acc[l.type] || 0) + 1; return acc; }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1]),
  };

  // Relative time that updates
  const getRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const filterTypes = ['all', ...Object.keys(TYPE_COLORS)];

  const exportCSV = () => {
    const header = 'Timestamp,Advocate,Action,Type\n';
    const rows = filteredLogs.map(l => `"${new Date(l.timestamp).toISOString()}","${l.advocateName}","${l.action}","${l.type}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity_log_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 text-slate-900 dark:text-white font-sans">
      
      {/* Header */}
      <div className="glass-banner p-6 text-white anim-fade-up relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 w-fit"
              style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' }}>
              <Activity className="w-3 h-3" /> Real-Time Audit Log
            </span>
            <h1 className="font-brand font-black text-2xl text-white mt-2">Live Activity Stream</h1>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              {stats.total} events tracked &middot; {stats.today} today &middot; Auto-sync active
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search events..."
                className="glass-input pl-9 pr-4 py-2 text-xs font-mono w-48"
                style={{ color: '#e2e8f0', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
            <button onClick={exportCSV} className="p-2 rounded-xl cursor-pointer transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              title="Export CSV">
              <Download className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Suspicious Activity Alert */}
      {suspiciousEvents.length > 0 && (
        <div className="glass-card accent-border-red p-4 flex items-center gap-3 anim-fade-up anim-fade-up-d1" style={{ borderRadius: '14px' }}>
          <div className="p-2 rounded-xl bg-red-500/10">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-red-700 dark:text-red-400">
              {suspiciousEvents.length} Flagged Event{suspiciousEvents.length > 1 ? 's' : ''} Detected
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              Unusual login locations, permission changes, or bulk data operations flagged for review.
            </p>
          </div>
          <button onClick={() => setFilterType('login')} className="px-3 py-1.5 text-[10px] font-bold bg-red-500/10 text-red-600 rounded-lg cursor-pointer hover:bg-red-500/20 transition-colors">
            Review
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex items-center gap-1 p-1 glass-card anim-fade-up anim-fade-up-d2" style={{ borderRadius: '14px', padding: '4px' }}>
        {filterTypes.map(tp => {
          const typeData = TYPE_COLORS[tp];
          return (
            <button key={tp} onClick={() => setFilterType(tp)}
              className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all cursor-pointer text-[10px] font-mono ${
                filterType === tp
                  ? (typeData ? `${typeData.bg} border shadow-sm` : 'bg-slate-900 text-white dark:bg-zinc-700 shadow-sm')
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}>
              {typeData ? (
                <span className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${typeData.dot}`}></span>
                  {typeData.label}
                </span>
              ) : 'All'}
            </button>
          );
        })}
      </div>

      {/* Activity Feed */}
      <div className="glass-card p-5 space-y-4 anim-fade-up anim-fade-up-d3" style={{ borderRadius: '18px' }}>
        <div className="flex items-center justify-between border-b border-slate-100/60 dark:border-zinc-800/60 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 anim-pulse-glow"></span>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white font-mono uppercase tracking-wider">
              Event Stream ({filteredLogs.length})
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }} /> Polling every 5s
          </span>
        </div>

        {displayedLogs.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-slate-200 dark:text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No events match your filter</p>
            <p className="text-[10px] text-slate-400/60 font-mono mt-1">Try a different filter or search term</p>
          </div>
        ) : (
          <div className="space-y-2 custom-scrollbar max-h-[600px] overflow-y-auto pr-1">
            {displayedLogs.map((log, idx) => {
              const typeData = TYPE_COLORS[log.type] || TYPE_COLORS.feenote;
              const initials = ADVOCATE_INITIALS[log.advocateName] || log.advocateName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
              const isNew = newEventIds.has(log.id);
              const isExpanded = expandedId === log.id;

              return (
                <div key={log.id}
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer anim-fade-up ${
                    isNew ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-50/30 dark:bg-zinc-800/20 border-slate-100/60 dark:border-zinc-800/40 hover:bg-slate-50/60 dark:hover:bg-zinc-800/40'
                  }`}
                  style={{ animationDelay: `${idx * 30}ms` }}>
                  
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-brand font-bold text-slate-600 dark:text-slate-400">{initials}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-xs font-bold text-slate-900 dark:text-white">{log.advocateName}</strong>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${typeData.bg} border`}>{typeData.label}</span>
                        {isNew && <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">NEW</span>}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{log.action}</p>
                      <span className="text-[9px] text-slate-400 font-mono mt-1 block">{getRelativeTime(log.timestamp)} &middot; {new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>

                    <span className={`w-2.5 h-2.5 rounded-full ${typeData.dot} mt-2 shrink-0`}></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More */}
        {filteredLogs.length > showCount && (
          <button onClick={() => setShowCount(s => s + 20)}
            className="w-full py-3 text-xs font-mono font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-500/5 rounded-xl transition-colors cursor-pointer">
            Load More ({filteredLogs.length - showCount} remaining)
          </button>
        )}
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 anim-fade-up anim-fade-up-d4">
        {stats.types.slice(0, 4).map(([type, count], i) => {
          const typeData = TYPE_COLORS[type] || TYPE_COLORS.feenote;
          return (
            <div key={type} className="glass-card p-3.5 flex items-center gap-3 cursor-pointer hover:bg-slate-50/40 dark:hover:bg-zinc-800/20 transition-colors"
              onClick={() => setFilterType(type)} style={{ borderRadius: '14px' }}>
              <span className={`w-3 h-3 rounded-full ${typeData.dot} shrink-0`}></span>
              <div>
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{count}</span>
                <span className="text-[9px] font-mono text-slate-400 block capitalize">{typeData.label}</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default LiveActivityFeedView;
