import React, { useState } from 'react';
import {
  EXACT_CLIENTS,
  EXACT_FEE_NOTES,
  EXACT_VAULT_FILES,
  ExactMatterRecord,
  ExactFeeNoteRecord,
  ExactVaultFileRecord,
  ExactClientRecord
} from '../../services/supabase';
import { fetchMatterRelatedData, fetchMatters, createMatter, updateMatter, deleteMatter } from '../../services/data';
import { SystemUser } from '../../services/supabase';
import { hasPermission } from '../../services/rbac';
import {
  Plus,
  Users,
  Search,
  LayoutGrid,
  Table as TableIcon,
  List as ListIcon,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  X,
  FileText,
  Building2,
  ExternalLink,
  FolderOpen
} from 'lucide-react';

interface MattersViewProps {
  onNavigateTab?: (tab: string) => void;
  currentUser?: SystemUser | null;
}

export const MattersView: React.FC<MattersViewProps> = ({ onNavigateTab, currentUser }) => {
  const [mattersList, setMattersList] = useState<ExactMatterRecord[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'table' | 'list'>('list');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [, setPermissionTick] = useState(0);

  const can = (code: string) => hasPermission(currentUser, code);

  // Matter Detail Modal / Drawer State
  const [selectedMatter, setSelectedMatter] = useState<ExactMatterRecord | null>(null);
  const [selectedClient, setSelectedClient] = useState<ExactClientRecord | null>(null);
  const [selectedFeeNotes, setSelectedFeeNotes] = useState<ExactFeeNoteRecord[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<ExactVaultFileRecord[]>([]);

  // Edit Matter Modal State
  const [editingMatter, setEditingMatter] = useState<ExactMatterRecord | null>(null);

  // New Matter Form Modal State
  const [showNewMatterModal, setShowNewMatterModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCaseNo, setNewCaseNo] = useState('');
  const [newForum, setNewForum] = useState('High Court — Commercial');
  const [newClientName, setNewClientName] = useState('Seyani Brothers & Co. (K) Limited');
  const [newApplicant, setNewApplicant] = useState('');
  const [newRespondent, setNewRespondent] = useState('');
  const [newClaimAmount, setNewClaimAmount] = useState<number>(0);

  React.useEffect(() => {
    const handlePermissions = () => {
      setPermissionTick(t => t + 1);
    };
    window.addEventListener('permissionsUpdated', handlePermissions);
    window.addEventListener('storage', handlePermissions);
    return () => {
      window.removeEventListener('permissionsUpdated', handlePermissions);
      window.removeEventListener('storage', handlePermissions);
    };
  }, []);

  React.useEffect(() => {
    if (!currentUser?.firmId) return;
    const loadMatters = () => fetchMatters(currentUser.firmId!).then(setMattersList).catch(error => setErrorMessage(error.message || 'Unable to load matters.'));
    void loadMatters();
    const handleRealtime = (event: Event) => {
      const detail = (event as CustomEvent<{ table?: string }>).detail;
      if (detail?.table === 'matters') void loadMatters();
    };
    window.addEventListener('databaseRealtimeUpdate', handleRealtime);
    return () => window.removeEventListener('databaseRealtimeUpdate', handleRealtime);
  }, [currentUser?.firmId]);

  React.useEffect(() => {
    if (!currentUser?.firmId || !selectedMatter) return;
    const loadRelated = () => fetchMatterRelatedData(currentUser.firmId!, selectedMatter.id).then(related => {
      setSelectedClient(related.client);
      setSelectedFeeNotes(related.feeNotes as ExactFeeNoteRecord[]);
      setSelectedDocuments(related.documents as ExactVaultFileRecord[]);
    }).catch(() => {
      setSelectedClient(null);
      setSelectedFeeNotes([]);
      setSelectedDocuments([]);
    });
    void loadRelated();
    const handleRealtime = (event: Event) => {
      const detail = (event as CustomEvent<{ table?: string }>).detail;
      if (['fee_notes', 'documents', 'matters'].includes(detail?.table || '')) void loadRelated();
    };
    window.addEventListener('databaseRealtimeUpdate', handleRealtime);
    return () => window.removeEventListener('databaseRealtimeUpdate', handleRealtime);
  }, [currentUser?.firmId, selectedMatter?.id]);

  const filtered = mattersList.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.caseNo.toLowerCase().includes(search.toLowerCase()) ||
    m.applicant.toLowerCase().includes(search.toLowerCase()) ||
    m.respondent.toLowerCase().includes(search.toLowerCase()) ||
    m.forum.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdateMatter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatter) return;

    if (!currentUser?.firmId) return;
    try {
      const savedMatter = await updateMatter(currentUser.firmId, editingMatter.id, editingMatter);
      setMattersList(prev => prev.map(m => m.id === savedMatter.id ? savedMatter : m));
    } catch (error: any) {
      setErrorMessage(error.message || 'Unable to update matter.');
      return;
    }
    setEditingMatter(null);
  };

  const handleCreateMatter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (!currentUser?.firmId) return;
    const newRecord: Partial<ExactMatterRecord> = {
      title: newTitle.trim(),
      caseNo: newCaseNo.trim() || 'HCCC Cause No. 2026',
      forum: newForum,
      applicant: newApplicant.trim() || 'Claimant Entity',
      applicantRole: 'Claimant',
      respondent: newRespondent.trim() || 'Respondent Entity',
      respondentRole: 'Respondent',
      amount: newClaimAmount,
    };

    try {
      const savedMatter = await createMatter(currentUser.firmId, newRecord);
      setMattersList(prev => [savedMatter, ...prev]);
    } catch (error: any) {
      setErrorMessage(error.message || 'Unable to create matter.');
      return;
    }
    setShowNewMatterModal(false);
    setNewTitle('');
    setNewCaseNo('');
    setNewClaimAmount(0);
  };

  const handleDeleteMatter = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete matter "${title}"?`)) {
      if (!currentUser?.firmId) return;
      try {
        await deleteMatter(currentUser.firmId, id);
        setMattersList(prev => prev.filter(m => m.id !== id));
      } catch (error: any) {
        setErrorMessage(error.message || 'Unable to delete matter.');
      }
      setActiveMenuId(null);
    }
  };

  // Helper to find client details for selected matter
  const getFeeNotesForMatter = (_matter: ExactMatterRecord): ExactFeeNoteRecord[] => selectedFeeNotes;
  const getDocumentsForMatter = (_matter: ExactMatterRecord): ExactVaultFileRecord[] => selectedDocuments;

  if (selectedMatter) {
    return (
      <div className="space-y-6 pb-12">
        {/* THE ULTIMATE MATTER DETAIL COMMAND CENTER (FULL PAGE) */}
        <div className="w-full bg-[var(--bg-main)] rounded-2xl p-0 flex flex-col">
          
          {/* The Case Status Header */}
          <div className="p-8 border-b border-[var(--border-color)] bg-[var(--bg-subtle)] relative">
            <button
              onClick={() => setSelectedMatter(null)}
              className="absolute top-6 right-6 px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition-all font-bold text-xs"
            >
              &larr; Back to Matters
            </button>
            
            <div className="space-y-4 max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-main)] text-[10px] font-mono font-bold tracking-widest uppercase">
                  {selectedMatter.caseNo}
                </span>
                <span className="px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold tracking-widest uppercase flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> {selectedMatter.status}
                </span>
              </div>
              
              <h2 className="font-brand font-extrabold text-3xl sm:text-4xl text-[var(--text-main)] tracking-tight leading-tight">
                {selectedMatter.title}
              </h2>
              
              <div className="flex items-center gap-4 text-xs font-mono text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4"/> {selectedMatter.forum}</span>
                <span>&bull;</span>
                <span>Filed by: {selectedMatter.filedBy}</span>
              </div>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: The "Versus" Matrix & Financial Core */}
            <div className="lg:col-span-1 space-y-8">
              
              {/* The "Versus" Matrix */}
              <div className="space-y-3 relative">
                <h3 className="font-mono text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  Parties Matrix
                </h3>
                
                <div className="relative space-y-4 before:absolute before:inset-y-0 before:left-[21px] before:w-[2px] before:bg-[var(--border-color)] before:z-0">
                  
                  {/* Claimant Card */}
                  <div className="relative z-10 p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 hover:border-blue-500/50 transition-colors ml-10">
                    <div className="absolute top-1/2 -left-[27px] -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--bg-main)] border-2 border-blue-500 flex items-center justify-center text-[10px] font-bold text-blue-500">
                      C
                    </div>
                    <p className="text-[10px] font-mono text-blue-600 dark:text-blue-400 uppercase font-bold mb-1">Claimant / Plaintiff</p>
                    <p className="text-sm font-bold text-[var(--text-main)] leading-tight">{selectedMatter.applicant}</p>
                  </div>

                  {/* VS Badge */}
                  <div className="relative z-10 flex items-center ml-10">
                    <div className="absolute top-1/2 -left-[26px] -translate-y-1/2 w-5 h-5 rounded bg-[var(--bg-subtle)] border border-[var(--border-color)] flex items-center justify-center text-[8px] font-mono font-bold text-[var(--text-muted)]">
                      VS
                    </div>
                  </div>

                  {/* Respondent Card */}
                  <div className="relative z-10 p-4 rounded-xl border border-red-500/30 bg-red-500/5 hover:border-red-500/50 transition-colors ml-10">
                    <div className="absolute top-1/2 -left-[27px] -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--bg-main)] border-2 border-red-500 flex items-center justify-center text-[10px] font-bold text-red-500">
                      R
                    </div>
                    <p className="text-[10px] font-mono text-red-600 dark:text-red-400 uppercase font-bold mb-1">Respondent / Defendant</p>
                    <p className="text-sm font-bold text-[var(--text-main)] leading-tight">{selectedMatter.respondent}</p>
                  </div>
                </div>
              </div>

              {/* Financial Core */}
              <div className="space-y-3">
                <h3 className="font-mono text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  Financial Core Metrics
                </h3>
                
                <div className="grid gap-3">
                  {/* Claim Value */}
                  <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)] block font-mono font-bold uppercase mb-1">Total Claim Value</span>
                    <strong className="text-xl font-mono font-bold text-[var(--text-main)] block">
                      Kshs {selectedMatter.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>

                  {/* Billed So Far */}
                  {(() => {
                    const totalBilled = getFeeNotesForMatter(selectedMatter).reduce((acc, fn) => acc + fn.grandTotal, 0);
                    const percentage = selectedMatter.amount > 0 ? ((totalBilled / selectedMatter.amount) * 100).toFixed(1) : 0;
                    return (
                      <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-mono font-bold uppercase">Billed to Date</span>
                          <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-600 px-1.5 py-0.5 rounded">{percentage}%</span>
                        </div>
                        <strong className="text-xl font-mono font-bold text-[var(--text-main)] block">
                          Kshs {totalBilled.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                        </strong>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Right Column: Evidence Vault & Activity Timeline */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* The Evidence Vault */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
                  <h3 className="font-mono text-[11px] font-bold text-[var(--text-main)] uppercase tracking-widest flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-purple-500" /> Evidence & Documents Vault
                  </h3>
                  <span className="font-mono text-[10px] bg-[var(--bg-subtle)] px-2 py-0.5 rounded border border-[var(--border-color)] text-[var(--text-muted)]">
                    {getDocumentsForMatter(selectedMatter).length} FILES
                  </span>
                </div>

                {getDocumentsForMatter(selectedMatter).length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-[var(--border-color)] rounded-xl">
                    <p className="text-xs text-[var(--text-muted)] font-mono">No documents securely vaulted.</p>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {getDocumentsForMatter(selectedMatter).map((doc) => (
                      <div key={doc.id} className="p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] hover:border-purple-500/50 transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="p-2 rounded bg-purple-500/10 border border-purple-500/20">
                            <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-xs text-[var(--text-main)] block truncate">{doc.filename}</span>
                            <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
                              {doc.size} &bull; {doc.updatedAt}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 shrink-0 ml-4">
                          {doc.extractedMetrics && (
                            <span className="hidden sm:inline-block px-2 py-1 rounded bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[9px] font-mono font-bold text-[var(--text-muted)]">
                              PARSED DATA ✓
                            </span>
                          )}
                          <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-sm flex items-center gap-1.5 text-[10px] font-bold uppercase cursor-pointer" title="Download Document">
                            <ExternalLink className="w-3 h-3" /> OPEN
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Case Timeline / Fee Notes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
                  <h3 className="font-mono text-[11px] font-bold text-[var(--text-main)] uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Generated Fee Notes
                  </h3>
                </div>

                {getFeeNotesForMatter(selectedMatter).length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-[var(--border-color)] rounded-xl">
                    <p className="text-xs text-[var(--text-muted)] font-mono">No bills generated for this matter.</p>
                  </div>
                ) : (
                  <div className="relative space-y-0 before:absolute before:inset-y-0 before:left-[15px] before:w-[2px] before:bg-[var(--border-color)] before:z-0 py-2">
                    {getFeeNotesForMatter(selectedMatter).map((fn, idx) => (
                      <div key={fn.id} className="relative z-10 flex items-start gap-4 mb-6 last:mb-0">
                        <div className="w-8 h-8 rounded-full bg-[var(--bg-main)] border-2 border-emerald-500 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                          <FileText className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <div className="flex-1 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)]">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                            <strong className="font-mono font-bold text-[var(--text-main)] text-sm">{fn.billNumber}</strong>
                            <span className="font-mono font-bold text-sm text-[var(--text-main)]">
                              Kshs {fn.grandTotal.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--text-muted)] font-mono">
                            Generated by {fn.generatedByUser} on {fn.createdAt}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b border-[var(--border-color)]/50 pb-6">
        <div>
          <h1 className="font-brand font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
            My Matters & Case Files
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 font-sans">
            Active Court Causes, High Court Taxations & Arbitrations — Nyagah B. Kithinji & Co. Advocates
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {can('matters.create') && (
            <button
              onClick={() => setShowNewMatterModal(true)}
              className="btn-gold px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> New Matter / Case
            </button>
          )}
          {can('clients.view') && (
            <button
              onClick={() => onNavigateTab ? onNavigateTab('clients') : null}
              className="btn-navy px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-4 h-4 text-amber-400" /> Clients Directory
            </button>
          )}
        </div>
      </div>

      {/* Controls Bar: Search & View Mode Picker */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search matter title, cause number, forum..."
            className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl pl-10 pr-3.5 py-2 text-xs text-[var(--text-main)] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 bg-[var(--bg-subtle)] p-1 rounded-xl border border-[var(--border-color)] shrink-0">
          <button
            onClick={() => setViewMode('card')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all cursor-pointer ${
              viewMode === 'card'
                ? 'bg-[var(--btn-bg)] text-[var(--btn-text)] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Card View
          </button>

          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-[var(--btn-bg)] text-[var(--btn-text)] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" /> Table View
          </button>

          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-[var(--btn-bg)] text-[var(--btn-text)] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <ListIcon className="w-3.5 h-3.5" /> List View
          </button>
        </div>
      </div>

      {/* CARD VIEW MODE */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((m: ExactMatterRecord) => (
            <div
              key={m.id}
              onClick={() => setSelectedMatter(m)}
              className="vercel-card-interactive p-6 space-y-4 flex flex-col justify-between relative group min-w-0"
            >
              <div className="space-y-2 pr-6 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10.5px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-wider block truncate">
                    {m.caseNo}
                  </span>

                  {/* Three Dots Menu Button */}
                  <div className="relative shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === m.id ? null : m.id);
                      }}
                      className="p-1 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Popover Dropdown */}
                    {activeMenuId === m.id && (
                      <div className="absolute right-0 top-6 w-40 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-xl z-30 py-1 text-xs space-y-0.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMatter(m);
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-3 py-1.5 text-[var(--text-main)] hover:bg-[var(--bg-subtle)] flex items-center gap-2"
                        >
                          <Eye className="w-3.5 h-3.5 text-[var(--text-muted)]" /> View Details
                        </button>
                        {can('matters.edit') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingMatter(m);
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 text-[var(--text-main)] hover:bg-[var(--bg-subtle)] flex items-center gap-2 font-medium"
                          >
                            <Edit className="w-3.5 h-3.5 text-[var(--text-muted)]" /> Edit Matter
                          </button>
                        )}
                        {can('matters.delete') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMatter(m.id, m.title);
                            }}
                            className="w-full text-left px-3 py-1.5 text-red-500 hover:bg-red-500/10 flex items-center gap-2 font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete Matter
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-sm text-[var(--text-main)] tracking-tight leading-snug line-clamp-2">
                  {m.title}
                </h3>

                <p className="text-xs text-[var(--text-muted)] font-medium">
                  {m.forum}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-[var(--text-main)]">
                  Kshs {m.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[10.5px] font-semibold text-[var(--text-main)]">
                  {m.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TABLE VIEW MODE */}
      {viewMode === 'table' && (
        <div className="vercel-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[var(--text-main)]">
              <thead className="bg-[var(--bg-subtle)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider border-b border-[var(--border-color)] font-semibold">
                <tr>
                  <th className="px-4 py-3.5">Matter Title & Cause No.</th>
                  <th className="px-4 py-3.5">Claimant / Plaintiff</th>
                  <th className="px-4 py-3.5">Court / Forum</th>
                  <th className="px-4 py-3.5 text-right">Claim Amount (Kshs)</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {filtered.map((m: ExactMatterRecord) => (
                  <tr key={m.id} className="hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer" onClick={() => setSelectedMatter(m)}>
                    <td className="px-4 py-3.5">
                      <strong className="font-bold text-[var(--text-main)] block">{m.title}</strong>
                      <span className="text-[10.5px] text-[var(--text-muted)] font-mono">{m.caseNo}</span>
                    </td>
                    <td className="px-4 py-3.5 text-[var(--text-muted)]">
                      {m.applicant} <span className="text-[10px]">({m.applicantRole})</span>
                    </td>
                    <td className="px-4 py-3.5">{m.forum}</td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-[var(--text-main)]">
                      Kshs {m.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[10.5px] font-semibold text-[var(--text-main)]">
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedMatter(m)}
                        className="p-1.5 rounded-md hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                        title="View Full Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LIST VIEW MODE */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filtered.map((m: ExactMatterRecord) => (
            <div
              key={m.id}
              onClick={() => setSelectedMatter(m)}
              className="vercel-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[var(--text-main)] transition-colors cursor-pointer"
            >
              <div className="space-y-1">
                <span className="text-[10.5px] font-mono text-[var(--text-muted)] font-bold uppercase">{m.caseNo} — {m.forum}</span>
                <h4 className="font-bold text-sm text-[var(--text-main)]">{m.title}</h4>
                <p className="text-xs text-[var(--text-muted)]">Claimant: {m.applicant} | Respondent: {m.respondent}</p>
              </div>

              <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                <span className="font-mono font-bold text-xs text-[var(--text-main)]">
                  Kshs {m.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMatter(m);
                  }}
                  className="btn-outline px-3 py-1 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}



      {/* NEW MATTER REGISTRATION MODAL */}
      {showNewMatterModal && (
        <div className="fixed inset-0 bg-[#0b1b36] flex items-center justify-center p-4 z-50">
          <div className="vercel-card p-6 max-w-lg w-full space-y-4 shadow-2xl text-xs border-2 border-amber-500/30">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="font-brand font-bold text-sm text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-500" /> Register New Law Firm Matter / Cause
              </h3>
              <button onClick={() => setShowNewMatterModal(false)} className="text-[var(--text-muted)] hover:text-red-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMatter} className="space-y-3">
              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-semibold">Matter Title / Cause Description</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-muted)] mb-1 font-semibold">Cause / Case Number</label>
                  <input
                    type="text"
                    value={newCaseNo}
                    onChange={(e) => setNewCaseNo(e.target.value)}
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-muted)] mb-1 font-semibold">Court Forum</label>
                  <select
                    value={newForum}
                    onChange={(e) => setNewForum(e.target.value)}
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)]"
                  >
                    <option value="High Court — Commercial">High Court — Commercial</option>
                    <option value="Arbitration / High Court">Arbitration / High Court</option>
                    <option value="Subordinate / Magistrate's Court">Subordinate / Magistrate's Court</option>
                    <option value="Environment & Land Court (ELC)">Environment & Land Court (ELC)</option>
                    <option value="Non-Contentious Conveyancing">Non-Contentious Conveyancing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-muted)] mb-1 font-semibold">Claimant / Plaintiff</label>
                  <input
                    type="text"
                    value={newApplicant}
                    onChange={(e) => setNewApplicant(e.target.value)}
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)]"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-muted)] mb-1 font-semibold">Respondent / Defendant</label>
                  <input
                    type="text"
                    value={newRespondent}
                    onChange={(e) => setNewRespondent(e.target.value)}
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-semibold">Subject / Claim Amount (Kshs)</label>
                <input
                  type="number"
                  value={newClaimAmount === 0 ? '' : newClaimAmount}
                  onChange={(e) => setNewClaimAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)] font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setShowNewMatterModal(false)}
                  className="btn-outline px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-black px-4 py-2 text-xs cursor-pointer"
                >
                  Save Matter Realtime
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MATTER MODAL */}
      {editingMatter && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="vercel-card p-6 max-w-lg w-full space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="font-brand font-bold text-sm text-[var(--text-main)] uppercase tracking-wider">
                Edit Law Firm Matter / Cause
              </h3>
              <button onClick={() => setEditingMatter(null)} className="text-[var(--text-muted)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateMatter} className="space-y-3">
              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-semibold">Matter Title</label>
                <input
                  type="text"
                  required
                  value={editingMatter.title}
                  onChange={(e) => setEditingMatter({ ...editingMatter, title: e.target.value })}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-muted)] mb-1 font-semibold">Cause / Case Number</label>
                  <input
                    type="text"
                    value={editingMatter.caseNo}
                    onChange={(e) => setEditingMatter({ ...editingMatter, caseNo: e.target.value })}
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-muted)] mb-1 font-semibold">Court Forum</label>
                  <select
                    value={editingMatter.forum}
                    onChange={(e) => setEditingMatter({ ...editingMatter, forum: e.target.value })}
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)]"
                  >
                    <option value="High Court — Commercial">High Court — Commercial</option>
                    <option value="Arbitration / High Court">Arbitration / High Court</option>
                    <option value="Subordinate / Magistrate's Court">Subordinate / Magistrate's Court</option>
                    <option value="Environment & Land Court (ELC)">Environment & Land Court (ELC)</option>
                    <option value="Non-Contentious Conveyancing">Non-Contentious Conveyancing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-muted)] mb-1 font-semibold">Claimant / Plaintiff</label>
                  <input
                    type="text"
                    value={editingMatter.applicant}
                    onChange={(e) => setEditingMatter({ ...editingMatter, applicant: e.target.value })}
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)]"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-muted)] mb-1 font-semibold">Respondent / Defendant</label>
                  <input
                    type="text"
                    value={editingMatter.respondent}
                    onChange={(e) => setEditingMatter({ ...editingMatter, respondent: e.target.value })}
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-semibold">Subject / Claim Amount (Kshs)</label>
                <input
                  type="number"
                  value={editingMatter.amount}
                  onChange={(e) => setEditingMatter({ ...editingMatter, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)] font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setEditingMatter(null)}
                  className="btn-outline px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-black px-4 py-2 text-xs cursor-pointer"
                >
                  Update Matter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MattersView;
