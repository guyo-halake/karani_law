import React, { useState, useEffect } from 'react';
import { ExactFeeNoteRecord, fetchFeeNotesFromDatabase, updateFeeNoteStatus } from '../../services/supabase';
import { SystemUser } from '../../services/supabase';
import { showToast } from './ToastNotification';
import { 
  CheckCircle2, XCircle, Eye, Clock, FileText, AlertCircle, ShieldCheck,
  ChevronDown, ChevronUp, Search, Download, Flag, MessageSquare, ArrowUpRight
} from 'lucide-react';

interface ApprovalQueueViewProps {
  onNavigateToBuilder?: (note?: any) => void;
  onNavigateTab?: (tab: string) => void;
  currentUser?: SystemUser | null;
}

const RETURN_TEMPLATES = [
  'Reduce folio count — Taxing Master will challenge this',
  'Missing court attendance dates for listed appearances',
  'Incorrect Remuneration Order schedule reference',
  'Fee exceeds Advocates Remuneration guidelines for this court tier',
  'Duplicate items detected across schedule entries',
  'Client instruction letter date not verified',
];

export const ApprovalQueueView: React.FC<ApprovalQueueViewProps> = ({
  onNavigateToBuilder,
  onNavigateTab,
  currentUser,
}) => {
  const [feeNotes, setFeeNotes] = useState<ExactFeeNoteRecord[]>([]);
  const [selectedNote, setSelectedNote] = useState<ExactFeeNoteRecord | null>(null);
  const [returnNotesInput, setReturnNotesInput] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'draft' | 'approved' | 'returned'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'advocate'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmApproveId, setConfirmApproveId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!currentUser?.firmId) return;
    const handleUpdate = () => fetchFeeNotesFromDatabase(currentUser.firmId!).then(setFeeNotes).catch(error => setErrorMessage(error.message || 'Unable to load approvals.'));
    void handleUpdate();
    window.addEventListener('databaseRealtimeUpdate', handleUpdate);
    return () => {
      window.removeEventListener('databaseRealtimeUpdate', handleUpdate);
    };
  }, [currentUser?.firmId]);

  // Filter + search + sort
  let displayedNotes = feeNotes.filter(fn => {
    if (filterStatus !== 'all') {
      if (filterStatus === 'pending') {
        if (fn.status !== 'draft' && (fn as any).status !== 'pending') return false;
      } else {
        if (fn.status !== filterStatus && (fn as any).status !== filterStatus && (fn as any).approvalStatus !== filterStatus) return false;
      }
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (fn.billNumber?.toLowerCase().includes(q) || fn.matterTitle?.toLowerCase().includes(q) || fn.clientName?.toLowerCase().includes(q) || fn.generatedByUser?.toLowerCase().includes(q));
    }
    return true;
  });

  displayedNotes = [...displayedNotes].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortBy === 'amount') return (a.grandTotal - b.grandTotal) * dir;
    if (sortBy === 'advocate') return (a.generatedByUser || '').localeCompare(b.generatedByUser || '') * dir;
    return (new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()) * dir;
  });

  const handleApprove = async (note: ExactFeeNoteRecord) => {
    if (!currentUser?.firmId) return;
    try {
      await updateFeeNoteStatus(currentUser.firmId, note.id, 'processed');
      setFeeNotes(prev => prev.map(n => n.id === note.id ? { ...n, status: 'processed', approvalStatus: 'approved' } : n));
    } catch (error: any) {
      setErrorMessage(error.message || 'Unable to approve bill.');
      return;
    }
    if (selectedNote?.id === note.id) setSelectedNote(null);
    setConfirmApproveId(null);
    showToast('success', `${note.billNumber} Approved`, 'BOC signed off and locked for court filing.');
  };

  const handleReturn = async (note: ExactFeeNoteRecord) => {
    if (!returnNotesInput.trim()) {
      showToast('warning', 'Notes Required', 'Please enter return notes for the advocate.');
      return;
    }
    if (!currentUser?.firmId) return;
    try {
      await updateFeeNoteStatus(currentUser.firmId, note.id, 'draft');
      setFeeNotes(prev => prev.map(n => n.id === note.id ? { ...n, status: 'draft', approvalStatus: 'returned', returnNotes: returnNotesInput } : n));
    } catch (error: any) {
      setErrorMessage(error.message || 'Unable to return bill.');
      return;
    }
    if (selectedNote?.id === note.id) setSelectedNote(null);
    showToast('info', `${note.billNumber} Returned`, `Sent back to advocate with review notes.`);
  };

  const handleBatchApprove = async () => {
    const ids = Array.from(selectedIds);
    if (!currentUser?.firmId) return;
    try {
      await Promise.all(ids.map(id => updateFeeNoteStatus(currentUser.firmId!, id, 'processed')));
      setFeeNotes(prev => prev.map(n => ids.includes(n.id) ? { ...n, status: 'processed', approvalStatus: 'approved' } : n));
    } catch (error: any) {
      setErrorMessage(error.message || 'Unable to approve selected bills.');
      return;
    }
    setSelectedIds(new Set());
    showToast('success', `${ids.length} BOCs Approved`, 'All selected bills signed off for filing.');
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSort = (field: 'date' | 'amount' | 'advocate') => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('desc'); }
  };

  const filterColors: Record<string, string> = {
    all: 'bg-slate-900 text-white dark:bg-zinc-700',
    pending: 'bg-amber-500 text-white',
    draft: 'bg-slate-600 text-white',
    approved: 'bg-emerald-500 text-white',
    returned: 'bg-red-500 text-white',
  };

  return (
    <div className="space-y-5 text-slate-900 dark:text-white font-sans">
      
      {/* Header */}
      <div className="glass-banner p-6 text-white anim-fade-up relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-amber-500/8 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 w-fit"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' }}>
              <ShieldCheck className="w-3 h-3" /> Managing Partner Approvals
            </span>
            <h1 className="font-brand font-black text-2xl text-white mt-2">BOC Sign-Off Queue</h1>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Review itemized folios, approve for filing, or return with Taxing Master notes.
            </p>
          </div>

          {/* Search */}
          <div className="relative shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search bills, clients, advocates..."
              className="glass-input pl-9 pr-4 py-2 text-xs font-mono w-64"
              style={{ color: '#e2e8f0', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>
        </div>
      </div>

      {/* Filter + Batch Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 anim-fade-up anim-fade-up-d1">
        <div className="flex items-center gap-1 p-1 rounded-xl glass-card" style={{ borderRadius: '14px', padding: '4px' }}>
          {(['all', 'pending', 'draft', 'approved', 'returned'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all cursor-pointer text-[11px] font-mono ${
                filterStatus === st ? filterColors[st] + ' shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {selectedIds.size > 0 && (
          <button onClick={handleBatchApprove}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20 anim-scale-in">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approve Selected ({selectedIds.size})
          </button>
        )}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden anim-fade-up anim-fade-up-d2" style={{ borderRadius: '18px', padding: 0 }}>
        {/* Sort header */}
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800/60 flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2 font-mono uppercase tracking-wider">
            <Clock className="w-4 h-4 text-amber-500" /> {displayedNotes.length} Bills Found
          </h3>
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
            <span>Sort:</span>
            {(['date', 'amount', 'advocate'] as const).map(f => (
              <button key={f} onClick={() => toggleSort(f)}
                className={`px-2 py-1 rounded-lg capitalize cursor-pointer transition-colors ${sortBy === f ? 'bg-slate-900 text-white dark:bg-zinc-700' : 'hover:bg-slate-100 dark:hover:bg-zinc-800'}`}>
                {f} {sortBy === f && (sortDir === 'asc' ? '↑' : '↓')}
              </button>
            ))}
          </div>
        </div>

        {displayedNotes.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
              <FileText className="w-8 h-8 text-slate-300 dark:text-zinc-600" />
            </div>
            <p className="text-sm font-medium text-slate-400">No bills match the current filter</p>
            <p className="text-[11px] text-slate-400/60 font-mono mt-1">Adjust your filters or wait for new submissions</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100/60 dark:divide-zinc-800/60">
            {displayedNotes.map((note, idx) => {
              const approvalStatus = (note as any).approvalStatus;
              const isExpanded = expandedId === note.id;
              
              return (
                <div key={note.id} className="anim-fade-up" style={{ animationDelay: `${idx * 40}ms` }}>
                  <div className={`p-5 hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors ${approvalStatus === 'approved' ? 'opacity-60' : ''}`}>
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedIds.has(note.id)}
                        onChange={() => toggleSelect(note.id)}
                        className="mt-1 w-4 h-4 accent-amber-500 cursor-pointer rounded shrink-0"
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-extrabold text-xs text-slate-900 dark:text-white">{note.billNumber}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                              approvalStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                              approvalStatus === 'returned' ? 'bg-red-500/10 text-red-600 border border-red-500/20' :
                              'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                            }`}>
                              {approvalStatus || note.status || 'pending'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{note.generatedByUser || 'Advocate'}</span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{note.matterTitle}</h4>
                          <p className="text-[11px] text-slate-500">
                            Client: <strong>{note.clientName}</strong> &middot; {note.courtSchedule}
                          </p>
                        </div>

                        <div className="flex flex-col sm:items-end gap-2 shrink-0">
                          <div className="text-left sm:text-right">
                            <span className="font-mono font-black text-lg text-emerald-600 dark:text-emerald-400 anim-count-up" style={{ animationDelay: `${200 + idx * 50}ms` }}>
                              Kshs {note.grandTotal.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          {approvalStatus !== 'approved' && (
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => setExpandedId(isExpanded ? null : note.id)}
                                className="px-2.5 py-1.5 glass-card text-[10px] font-semibold rounded-lg flex items-center gap-1 cursor-pointer" style={{ borderRadius: '10px', padding: '6px 10px' }}>
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />} Items
                              </button>
                              <button onClick={() => setConfirmApproveId(note.id)}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer shadow-sm shadow-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" /> Approve
                              </button>
                              <button onClick={() => { setSelectedNote(note); setReturnNotesInput(''); }}
                                className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-semibold rounded-lg flex items-center gap-1 cursor-pointer">
                                <XCircle className="w-3 h-3" /> Return
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Inline Expandable Items */}
                  {isExpanded && (
                    <div className="px-12 pb-4 anim-scale-in">
                      <div className="glass-card p-4 space-y-2" style={{ borderRadius: '14px' }}>
                        <div className="grid grid-cols-12 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-zinc-800">
                          <span className="col-span-1">#</span>
                          <span className="col-span-9">Description</span>
                          <span className="col-span-2 text-right">Fee (KES)</span>
                        </div>
                        {(note as any).items?.map?.((item: any, i: number) => (
                          <div key={i} className="grid grid-cols-12 text-[11px] py-1.5 hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 rounded-lg transition-colors">
                            <span className="col-span-1 text-slate-400 font-mono">{i + 1}</span>
                            <span className="col-span-9 text-slate-700 dark:text-slate-300">{item.description || item.itemDescription || 'Line item'}</span>
                            <span className="col-span-2 text-right font-mono font-bold text-slate-900 dark:text-white">{(item.fee || item.amount || 0).toLocaleString()}</span>
                          </div>
                        )) || <p className="text-[11px] text-slate-400 font-mono">No line items available — view full BOC for details.</p>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CONFIRM APPROVE DIALOG */}
      {confirmApproveId && (() => {
        const note = feeNotes.find(n => n.id === confirmApproveId);
        if (!note) return null;
        return (
          <div className="fixed inset-0 glass-modal-overlay flex items-center justify-center p-4 z-50">
            <div className="glass-modal p-6 w-full max-w-md anim-scale-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-emerald-500/10">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-brand font-bold text-base text-slate-900 dark:text-white">Confirm Approval</h3>
                  <p className="text-[11px] text-slate-500 font-mono">{note.billNumber}</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
                This will <strong>lock the BOC hash</strong> and sign it off for official court filing. This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setConfirmApproveId(null)} className="px-4 py-2 text-xs font-semibold text-slate-600 cursor-pointer">Cancel</button>
                <button onClick={() => handleApprove(note)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4" /> Approve & Lock
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* RETURN NOTES MODAL */}
      {selectedNote && (
        <div className="fixed inset-0 glass-modal-overlay flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="glass-modal p-6 sm:p-8 w-full max-w-2xl my-8 anim-scale-in">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-zinc-800/60 pb-4 mb-5">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-600 font-mono font-bold text-[10px] border border-red-500/20">
                  RETURN {selectedNote.billNumber}
                </span>
                <h2 className="font-brand font-extrabold text-lg text-slate-900 dark:text-white mt-1">{selectedNote.matterTitle}</h2>
                <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                  Prepared by <strong>{selectedNote.generatedByUser}</strong> for <strong>{selectedNote.clientName}</strong>
                </p>
              </div>
              <button onClick={() => setSelectedNote(null)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">✕</button>
            </div>

            {/* Quick Return Templates */}
            <div className="mb-4">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-2 uppercase tracking-wider font-mono">Quick Templates</label>
              <div className="flex flex-wrap gap-1.5">
                {RETURN_TEMPLATES.map((t, i) => (
                  <button key={i} onClick={() => setReturnNotesInput(t)}
                    className="px-2.5 py-1 text-[10px] font-mono rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-400 transition-colors cursor-pointer border border-transparent hover:border-amber-500/20">
                    {t.substring(0, 40)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Return Notes */}
            <div className="space-y-2 mb-6">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider font-mono">
                Return Notes / Taxing Master Guidance
              </label>
              <textarea
                rows={4}
                value={returnNotesInput}
                onChange={e => setReturnNotesInput(e.target.value)}
                placeholder="Describe what needs to be corrected before resubmission..."
                className="glass-input w-full p-3.5 text-xs text-slate-900 dark:text-white font-mono resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/60 dark:border-zinc-800/60">
              <button onClick={() => setSelectedNote(null)} className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">Cancel</button>
              <button onClick={() => handleReturn(selectedNote)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-red-500/20">
                <XCircle className="w-4 h-4" /> Return to Advocate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalQueueView;
