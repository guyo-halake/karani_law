import React, { useState, useEffect } from 'react';
import { ExactFeeNoteRecord, getFeeNotes, persistFeeNotes } from '../../services/supabase';
import { logSystemActivity } from '../../services/activityLogger';
import { CheckCircle2, XCircle, Eye, Clock, FileText, Filter, AlertCircle, ShieldCheck } from 'lucide-react';

interface ApprovalQueueViewProps {
  onNavigateToBuilder?: (note?: any) => void;
  onNavigateTab?: (tab: string) => void;
}

export const ApprovalQueueView: React.FC<ApprovalQueueViewProps> = ({
  onNavigateToBuilder,
  onNavigateTab
}) => {
  const [feeNotes, setFeeNotes] = useState<ExactFeeNoteRecord[]>(() => getFeeNotes());
  const [selectedNote, setSelectedNote] = useState<ExactFeeNoteRecord | null>(null);
  const [returnNotesInput, setReturnNotesInput] = useState('Reduce folio count from 40 to 25 — Taxing Master will challenge this');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'draft' | 'approved' | 'returned'>('all');

  useEffect(() => {
    const handleUpdate = () => {
      setFeeNotes(getFeeNotes());
    };
    window.addEventListener('feeNotesUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('feeNotesUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Filter pending/draft/all notes
  const displayedNotes = feeNotes.filter(fn => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return fn.status === 'draft' || (fn as any).status === 'pending';
    return fn.status === filterStatus || (fn as any).status === filterStatus;
  });

  const handleApprove = (note: ExactFeeNoteRecord) => {
    const updated = feeNotes.map(n => n.id === note.id ? { ...n, status: 'processed' as const, approvalStatus: 'approved' } : n);
    persistFeeNotes(updated);
    setFeeNotes(updated);
    logSystemActivity(
      'Adv. Nyagah Kithinji',
      `APPROVED Bill of Costs ${note.billNumber} (Kshs ${note.grandTotal.toLocaleString()}) for court filing`,
      'approval',
      'bg-emerald-500'
    );
    if (selectedNote?.id === note.id) setSelectedNote(null);
    alert(`✅ ${note.billNumber} has been APPROVED and signed off for official court filing!`);
  };

  const handleReturn = (note: ExactFeeNoteRecord) => {
    if (!returnNotesInput.trim()) {
      alert('Please enter return notes for the advocate.');
      return;
    }
    const updated = feeNotes.map(n => n.id === note.id ? { 
      ...n, 
      status: 'draft' as const, 
      approvalStatus: 'returned',
      returnNotes: returnNotesInput 
    } : n);
    persistFeeNotes(updated);
    setFeeNotes(updated);
    logSystemActivity(
      'Adv. Nyagah Kithinji',
      `RETURNED Bill of Costs ${note.billNumber} with notes: "${returnNotesInput}"`,
      'return',
      'bg-red-500'
    );
    if (selectedNote?.id === note.id) setSelectedNote(null);
    alert(`❌ ${note.billNumber} RETURNED to advocate with notes: "${returnNotesInput}"`);
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-white font-sans">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-mono font-bold text-[11px] uppercase tracking-wider border border-amber-500/20 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" /> MANAGING PARTNER APPROVALS
            </span>
          </div>
          <h1 className="font-brand font-black text-2xl text-slate-900 dark:text-white mt-1">
            BOC Sign-Off & Approval Queue
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Review itemized folios, approve for filing, or return with Taxing Master notes to advocates in real-time.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-zinc-800 rounded-xl text-xs font-mono shrink-0">
          {(['all', 'pending', 'draft', 'approved', 'returned'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                filterStatus === st 
                  ? 'bg-slate-900 text-white dark:bg-zinc-700 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Real Database Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 font-mono uppercase">
            <Clock className="w-4 h-4 text-amber-500" /> Pending Bills of Costs ({displayedNotes.length} Found)
          </h3>
        </div>

        {displayedNotes.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-mono text-xs">
            No Bills of Costs currently match the filter criteria.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {displayedNotes.map((note) => (
              <div key={note.id} className="p-5 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-xs text-slate-900 dark:text-white">{note.billNumber}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300">
                      {note.generatedByUser || 'Advocate'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{note.createdAt}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{note.matterTitle}</h4>
                  <p className="text-xs text-slate-500 font-sans">
                    Client: <strong>{note.clientName}</strong> | Forum: <span>{note.courtSchedule}</span>
                  </p>
                </div>

                <div className="flex flex-col sm:items-end gap-2 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-xs font-mono font-bold text-slate-400 block">Grand Total</span>
                    <span className="font-mono font-black text-lg text-emerald-600 dark:text-emerald-400">
                      Kshs {note.grandTotal.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setSelectedNote(note)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Review Items
                    </button>
                    <button
                      onClick={() => handleApprove(note)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer shadow-sm shadow-emerald-500/20"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => { setSelectedNote(note); setReturnNotesInput('Reduce folio count from 40 to 25 — Taxing Master will challenge this'); }}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Return
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-3xl my-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-4 mb-6">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-mono font-bold text-xs">
                  {selectedNote.billNumber} REVIEW
                </span>
                <h2 className="font-brand font-extrabold text-xl text-slate-900 dark:text-white mt-1">
                  {selectedNote.matterTitle}
                </h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Prepared by <strong>{selectedNote.generatedByUser}</strong> for client <strong>{selectedNote.clientName}</strong>
                </p>
              </div>

              <button
                onClick={() => setSelectedNote(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Calculations Breakdown */}
            <div className="grid grid-cols-3 gap-4 mb-6 font-mono text-xs p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800">
              <div>
                <span className="text-slate-400 block text-[10px]">Claim Value</span>
                <strong className="text-slate-900 dark:text-white">Kshs {(selectedNote.claimValue || 0).toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Instruction Fee</span>
                <strong className="text-slate-900 dark:text-white">Kshs {(selectedNote.instructionFee || 0).toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Grand Total</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-black">Kshs {selectedNote.grandTotal.toLocaleString()}</strong>
              </div>
            </div>

            {/* Return Notes Input Box */}
            <div className="space-y-2 mb-6">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Return Notes / Taxing Master Guidance (Required if Returning):
              </label>
              <textarea
                rows={3}
                value={returnNotesInput}
                onChange={(e) => setReturnNotesInput(e.target.value)}
                placeholder="e.g. Reduce folio count from 40 to 25 — Taxing Master will challenge this"
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
              <button
                onClick={() => setSelectedNote(null)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReturn(selectedNote)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4" /> Return to Advocate
              </button>
              <button
                onClick={() => handleApprove(selectedNote)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve & Sign-Off BOC
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ApprovalQueueView;
