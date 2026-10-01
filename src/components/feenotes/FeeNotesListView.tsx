import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Plus,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  User,
  Calculator,
  ExternalLink,
  Trash2,
  Edit3,
  FileSpreadsheet,
  Eye
} from 'lucide-react';
import { ExactFeeNoteRecord, deleteFeeNote, fetchFeeNotesFromDatabase, updateFeeNoteStatus, getFeeNotes } from '../../services/supabase';
import { getCurrentUserProfile } from '../../services/auth';
import { SystemUser } from '../../services/supabase';
import { hasPermission } from '../../services/rbac';

interface FeeNotesListViewProps {
  onNavigateTab: (tab: string) => void;
  onNavigateToBuilder?: (note?: ExactFeeNoteRecord, isPreview?: boolean) => void;
  currentUser?: SystemUser | null;
}

export const FeeNotesListView: React.FC<FeeNotesListViewProps> = ({
  onNavigateTab,
  onNavigateToBuilder,
  currentUser,
}) => {
  const [feeNotesList, setFeeNotesList] = useState<ExactFeeNoteRecord[]>(() => getFeeNotes());
  const [errorMessage, setErrorMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [, setPermissionTick] = useState(0);

  const can = (code: string) => hasPermission(currentUser, code);

  useEffect(() => {
    const loadFeeNotes = () => {
      fetchFeeNotesFromDatabase(currentUser?.firmId).then(setFeeNotesList).catch(() => {
        setFeeNotesList(getFeeNotes());
      });
    };
    loadFeeNotes();

    const handleFeeNotesUpdate = (event: any) => {
      if (event?.detail && Array.isArray(event.detail)) {
        setFeeNotesList(event.detail);
      } else {
        setFeeNotesList(getFeeNotes());
      }
    };

    const handleRealtimeUpdate = async (event: Event) => {
      const detail = (event as CustomEvent<{ table?: string }>).detail;
      if (detail?.table !== 'fee_notes') return;
      loadFeeNotes();
    };

    const handlePermissions = () => {
      setPermissionTick(t => t + 1);
    };

    window.addEventListener('feeNotesUpdated', handleFeeNotesUpdate);
    window.addEventListener('databaseRealtimeUpdate', handleRealtimeUpdate);
    window.addEventListener('permissionsUpdated', handlePermissions);
    window.addEventListener('storage', handlePermissions);

    return () => {
      window.removeEventListener('feeNotesUpdated', handleFeeNotesUpdate);
      window.removeEventListener('databaseRealtimeUpdate', handleRealtimeUpdate);
      window.removeEventListener('permissionsUpdated', handlePermissions);
      window.removeEventListener('storage', handlePermissions);
    };
  }, [currentUser?.firmId]);

  const handleProcessFeeNote = async (id: string, billNumber: string) => {
    if (!currentUser?.firmId) return;
    try {
      await updateFeeNoteStatus(currentUser.firmId, id, 'processed');
      setFeeNotesList(prev => prev.map(fn => fn.id === id ? { ...fn, status: 'processed' as const } : fn));
    } catch (error: any) {
      setErrorMessage(error.message || `Unable to process ${billNumber}.`);
    }
  };

  const handleDeleteFeeNote = async (id: string, billNumber: string) => {
    if (confirm(`Are you sure you want to delete Fee Note "${billNumber}" from the database?`)) {
      if (!currentUser?.firmId) return;
      try {
        await deleteFeeNote(currentUser.firmId, id);
        setFeeNotesList(prev => prev.filter(fn => fn.id !== id));
      } catch (error: any) {
        setErrorMessage(error.message || `Unable to delete ${billNumber}.`);
      }
    }
  };

  const handleViewPDF = (fn: ExactFeeNoteRecord) => {
    if (fn.pdfUrl && !fn.pdfUrl.startsWith('/vault/')) {
      window.open(fn.pdfUrl, '_blank');
    } else {
      if (onNavigateToBuilder) onNavigateToBuilder(fn, true);
    }
  };

  const handleDownloadPDF = (fn: ExactFeeNoteRecord) => {
    if (fn.pdfUrl && !fn.pdfUrl.startsWith('/vault/')) {
      const a = document.createElement('a');
      a.href = fn.pdfUrl;
      a.download = `${fn.billNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      if (onNavigateToBuilder) {
        onNavigateToBuilder(fn, true);
      } else {
        alert("Please open in BOC Builder to generate & print the PDF.");
      }
    }
  };

  const filteredFeeNotes = feeNotesList.filter((fn: ExactFeeNoteRecord) => {
    const matchesStatus = filterStatus === 'all' || fn.status === filterStatus;
    const matchesQuery =
      fn.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fn.matterTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fn.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fn.generatedByUser.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const totalProcessedValue = feeNotesList
    .filter(fn => fn.status === 'processed')
    .reduce((sum, fn) => sum + fn.grandTotal, 0);

  const draftsCount = feeNotesList.filter(fn => fn.status === 'draft').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-[var(--border-color)]/50 pb-4">
        <div>
          <h1 className="font-brand font-extrabold text-2xl text-[var(--text-main)] tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-[var(--text-main)]" /> Saved Fee Notes & Bills of Costs
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            Database ledger of all processed and draft Advocates Remuneration Order bills of costs
          </p>
        </div>

        {can('boc.view') && (
          <button
            onClick={() => onNavigateTab('boc')}
            className="btn-black px-4 py-2 text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create New Fee Note
          </button>
        )}
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-mono">
        <div className="vercel-card p-5 space-y-1">
          <span className="text-[11px] text-[var(--text-muted)] font-semibold uppercase block">Total Fee Notes Saved</span>
          <p className="text-2xl font-bold text-[var(--text-main)]">{feeNotesList.length} Records</p>
        </div>

        <div className="vercel-card p-5 space-y-1">
          <span className="text-[11px] text-[var(--text-muted)] font-semibold uppercase block">Processed Bills Total</span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            Kshs {totalProcessedValue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="vercel-card p-5 space-y-1">
          <span className="text-[11px] text-[var(--text-muted)] font-semibold uppercase block">Pending Drafts</span>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{draftsCount} Drafts Saved</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="vercel-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-muted)] font-semibold">Filter Status:</span>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-[var(--btn-bg)] text-[var(--btn-text)] shadow-xs'
                : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-color)]'
            }`}
          >
            All ({feeNotesList.length})
          </button>
          <button
            onClick={() => setFilterStatus('processed')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              filterStatus === 'processed'
                ? 'bg-[var(--btn-bg)] text-[var(--btn-text)] shadow-xs'
                : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-color)]'
            }`}
          >
            Processed ({feeNotesList.length - draftsCount})
          </button>
          <button
            onClick={() => setFilterStatus('draft')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              filterStatus === 'draft'
                ? 'bg-[var(--btn-bg)] text-[var(--btn-text)] shadow-xs'
                : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-color)]'
            }`}
          >
            Drafts ({draftsCount})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bill no, client, matter..."
            className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[var(--text-main)] focus:outline-none"
          />
        </div>
      </div>

      {/* Fee Notes Table */}
      <div className="vercel-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--text-main)]">
            <thead className="bg-[var(--bg-subtle)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider border-b border-[var(--border-color)] font-semibold">
              <tr>
                <th className="px-5 py-3.5">Bill No. & Timestamp</th>
                <th className="px-5 py-3.5">Matter Title & Client Entity</th>
                <th className="px-5 py-3.5">Advocate Remuneration Schedule</th>
                <th className="px-5 py-3.5 text-right">Grand Total (Kshs)</th>
                <th className="px-5 py-3.5">Generated By</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredFeeNotes.map((fn: ExactFeeNoteRecord) => (
                <tr key={fn.id} className="hover:bg-[var(--bg-subtle)] transition-colors">
                  <td className="px-5 py-3.5">
                    <strong className="font-mono font-bold text-[var(--text-main)] block">{fn.billNumber}</strong>
                    <span className="text-[10.5px] text-[var(--text-muted)] font-mono">{fn.createdAt}</span>
                  </td>

                  <td className="px-5 py-3.5 max-w-xs">
                    <strong className="font-bold text-[var(--text-main)] block truncate">{fn.matterTitle}</strong>
                    <span className="text-[10.5px] text-[var(--text-muted)] block truncate">{fn.clientName}</span>
                  </td>

                  <td className="px-5 py-3.5 text-[var(--text-muted)] text-[11px]">
                    {fn.courtSchedule}
                  </td>

                  <td className="px-5 py-3.5 text-right font-mono font-bold text-[var(--text-main)] text-sm">
                    Kshs {fn.grandTotal.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </td>

                  <td className="px-5 py-3.5 text-[11px] text-[var(--text-muted)] font-mono">
                    {fn.generatedByUser}
                  </td>

                  <td className="px-5 py-3.5">
                    {fn.status === 'processed' ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10.5px] font-mono font-bold">
                        Processed
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10.5px] font-mono font-bold">
                        Draft
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View PDF Icon */}
                      {can('feenotes.preview_bill') && (
                        <button
                          onClick={() => handleViewPDF(fn)}
                          className="p-1 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-blue-500 hover:border-blue-500 transition-colors cursor-pointer"
                          title="View PDF"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Download PDF Icon */}
                      {can('feenotes.download_pdf') && (
                        <button
                          onClick={() => handleDownloadPDF(fn)}
                          className="p-1 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-emerald-500 hover:border-emerald-500 transition-colors cursor-pointer"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Edit Icon */}
                      {can('feenotes.edit') && (
                        <button
                          onClick={() => {
                            if (onNavigateToBuilder) {
                              onNavigateToBuilder(fn, false);
                            } else {
                              onNavigateTab('boc');
                            }
                          }}
                          className="p-1 rounded-lg border border-[var(--border-color)] text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:border-blue-500 transition-colors cursor-pointer"
                          title="Edit Fee Note"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete Icon */}
                      {can('feenotes.delete') && (
                        <button
                          onClick={() => handleDeleteFeeNote(fn.id, fn.billNumber)}
                          className="p-1 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-red-500 hover:border-red-500 transition-colors cursor-pointer"
                          title="Delete Fee Note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FeeNotesListView;
