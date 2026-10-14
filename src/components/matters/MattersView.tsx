import React, { useState } from 'react';
import {
  ExactMatterRecord,
  ExactFeeNoteRecord,
  ExactVaultFileRecord,
  ExactClientRecord,
  SystemUser
} from '../../services/supabase';
import { fetchMatterRelatedData, fetchMatters, createMatter, updateMatter, deleteMatter } from '../../services/data';
import { hasPermission } from '../../services/rbac';
import {
  Plus,
  Users,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  X,
  FileText,
  Building2,
  ExternalLink,
  FolderOpen,
  ArrowRight,
  Scale,
  CheckSquare,
  Square,
  Gavel,
  Calendar,
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface MattersViewProps {
  onNavigateTab?: (tab: string, targetUserId?: string) => void;
  onNavigateToBuilder?: (note?: any, isPreview?: boolean) => void;
  currentUser?: SystemUser | null;
}

export const MattersView: React.FC<MattersViewProps> = ({ onNavigateTab, onNavigateToBuilder, currentUser }) => {
  const [mattersList, setMattersList] = useState<ExactMatterRecord[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [search, setSearch] = useState('');
  const [forumFilter, setForumFilter] = useState('All');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedMatterIds, setSelectedMatterIds] = useState<string[]>([]);
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
    const firmId = currentUser?.firmId || 'firm-001';
    const loadMatters = () => fetchMatters(firmId).then(setMattersList).catch(error => setErrorMessage(error.message || 'Unable to load matters.'));
    void loadMatters();
    const handleRealtime = (event: Event) => {
      const detail = (event as CustomEvent<{ table?: string }>).detail;
      if (detail?.table === 'matters') void loadMatters();
    };
    const handleMattersUpdated = (event: any) => {
      if (event?.detail && Array.isArray(event.detail)) {
        setMattersList(event.detail);
      } else {
        void loadMatters();
      }
    };
    window.addEventListener('databaseRealtimeUpdate', handleRealtime);
    window.addEventListener('mattersUpdated', handleMattersUpdated);
    window.addEventListener('storage', loadMatters);
    return () => {
      window.removeEventListener('databaseRealtimeUpdate', handleRealtime);
      window.removeEventListener('mattersUpdated', handleMattersUpdated);
      window.removeEventListener('storage', loadMatters);
    };
  }, [currentUser?.firmId]);

  // Auto-open targeted matter from Dashboard deep-link
  React.useEffect(() => {
    if (mattersList.length === 0) return;
    const targetId = sessionStorage.getItem('OPEN_MATTER_ID');
    const targetAction = sessionStorage.getItem('OPEN_MATTER_ACTION');
    if (targetId) {
      const found = mattersList.find(m => m.id === targetId || m.caseNo === targetId);
      if (found) {
        if (targetAction === 'edit') {
          setEditingMatter(found);
          setSelectedMatter(null);
        } else {
          setSelectedMatter(found);
          setEditingMatter(null);
        }
      }
      sessionStorage.removeItem('OPEN_MATTER_ID');
      sessionStorage.removeItem('OPEN_MATTER_ACTION');
    }
  }, [mattersList]);

  // Load related dossier data when matter selected
  React.useEffect(() => {
    const firmId = currentUser?.firmId || 'firm-001';
    if (!selectedMatter) return;
    const loadRelated = () => fetchMatterRelatedData(firmId, selectedMatter.id).then(related => {
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

  // 1-Tap Bill of Costs generation deep link
  const handleDraftBOC = (matter: ExactMatterRecord) => {
    if (!onNavigateToBuilder) return;
    let schedule = 'schedule_6_high_court';
    const f = (matter.forum || '').toLowerCase();
    if (f.includes('magistrate') || f.includes('subordinate')) {
      schedule = 'schedule_5_magistrate';
    } else if (f.includes('arbitrat')) {
      schedule = 'schedule_7_arbitration';
    } else if (f.includes('conveyanc')) {
      schedule = 'schedule_1_conveyancing';
    } else if (f.includes('court of appeal') || f.includes('appellate')) {
      schedule = 'schedule_8_court_of_appeal';
    }

    onNavigateToBuilder({
      matterTitle: matter.title,
      caseNo: matter.caseNo,
      clientName: matter.applicant,
      claimValue: matter.amount,
      courtSchedule: schedule,
      forumName: matter.forum,
      claimantName: matter.applicant,
      respondentName: matter.respondent,
    }, false);
  };

  // Filter matters by search & forum chip
  const filtered = mattersList.filter(m => {
    const q = search.toLowerCase();
    const matchesSearch =
      m.title.toLowerCase().includes(q) ||
      m.caseNo.toLowerCase().includes(q) ||
      m.applicant.toLowerCase().includes(q) ||
      m.respondent.toLowerCase().includes(q) ||
      m.forum.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (forumFilter === 'All') return true;
    const forum = m.forum.toLowerCase();
    if (forumFilter === 'Commercial' && (forum.includes('commercial') || m.caseNo.toUpperCase().includes('HCCC'))) return true;
    if (forumFilter === 'ELC / ELRC' && (forum.includes('elc') || forum.includes('elrc') || forum.includes('land') || forum.includes('labour'))) return true;
    if (forumFilter === 'Magistrate' && (forum.includes('magistrate') || forum.includes('subordinate') || forum.includes('cmcc'))) return true;
    if (forumFilter === 'Arbitration' && (forum.includes('arbitrat') || forum.includes('ncia'))) return true;
    if (forumFilter === 'Conveyancing' && forum.includes('conveyanc')) return true;
    return false;
  });

  // Batch toggle
  const toggleSelectAll = () => {
    if (selectedMatterIds.length === filtered.length) {
      setSelectedMatterIds([]);
    } else {
      setSelectedMatterIds(filtered.map(m => m.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedMatterIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Bulk status update
  const handleBulkStatus = async (newStatus: 'Active' | 'Concluded' | 'Stayed' | 'Pending Taxation') => {
    if (selectedMatterIds.length === 0 || !currentUser?.firmId) return;
    try {
      for (const id of selectedMatterIds) {
        const item = mattersList.find(m => m.id === id);
        if (item) {
          await updateMatter(currentUser.firmId, id, { ...item, status: newStatus });
        }
      }
      setMattersList(prev => prev.map(m => selectedMatterIds.includes(m.id) ? { ...m, status: newStatus } : m));
      setSelectedMatterIds([]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Batch status update failed.');
    }
  };

  const handleUpdateMatter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatter || !currentUser?.firmId) return;
    try {
      const savedMatter = await updateMatter(currentUser.firmId, editingMatter.id, editingMatter);
      setMattersList(prev => prev.map(m => m.id === savedMatter.id ? savedMatter : m));
      setEditingMatter(null);
    } catch (error: any) {
      setErrorMessage(error.message || 'Unable to update matter.');
    }
  };

  const handleCreateMatter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !currentUser?.firmId) return;

    const newRecord: Partial<ExactMatterRecord> = {
      title: newTitle.trim(),
      caseNo: newCaseNo.trim() || 'HCCC Cause No. E' + Math.floor(100 + Math.random() * 900) + ' of 2026',
      forum: newForum,
      applicant: newApplicant.trim() || 'Claimant Entity',
      applicantRole: 'Claimant',
      respondent: newRespondent.trim() || 'Respondent Entity',
      respondentRole: 'Respondent',
      amount: newClaimAmount,
      status: 'Active',
      filedBy: currentUser?.fullName || 'Guyoh Alake'
    };

    try {
      const savedMatter = await createMatter(currentUser.firmId, newRecord);
      setMattersList(prev => [savedMatter, ...prev]);
      setShowNewMatterModal(false);
      setNewTitle('');
      setNewCaseNo('');
      setNewApplicant('');
      setNewRespondent('');
      setNewClaimAmount(0);
    } catch (error: any) {
      setErrorMessage(error.message || 'Unable to create matter.');
    }
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

  // High Court & Kenyan Forum badge formatter
  const getKenyanCaseBadge = (caseNo: string, forum: string) => {
    const f = (forum || '').toLowerCase();
    const c = (caseNo || '').toUpperCase();
    if (c.includes('HCCC') || f.includes('commercial')) {
      return { tag: 'HCCC Commercial', style: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' };
    }
    if (c.includes('ELRC') || f.includes('employment') || f.includes('labour')) {
      return { tag: 'ELRC Court', style: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' };
    }
    if (c.includes('ELC') || f.includes('land')) {
      return { tag: 'ELC Court', style: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
    }
    if (c.includes('ARB') || f.includes('arbitrat') || c.includes('NCIA')) {
      return { tag: 'NCIA Arbitration', style: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
    }
    if (f.includes('magistrate') || f.includes('subordinate') || c.includes('CMCC')) {
      return { tag: 'Magistrate Court', style: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20' };
    }
    if (f.includes('conveyanc')) {
      return { tag: 'Conveyancing', style: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' };
    }
    return { tag: 'High Court', style: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' };
  };

  const forumChips = [
    { id: 'All', label: 'All Matters' },
    { id: 'Commercial', label: 'Commercial High Court' },
    { id: 'ELC / ELRC', label: 'ELC / ELRC' },
    { id: 'Magistrate', label: 'Magistrate Court' },
    { id: 'Arbitration', label: 'Arbitration' },
    { id: 'Conveyancing', label: 'Conveyancing' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner - Standardized geometry matching Dashboard & Clients */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b border-[var(--border-color)] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-brand font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
              Matters Register
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-mono text-xs font-semibold">
              {mattersList.length} Active Causes
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 font-sans">
            High Court Causes, Subordinate Courts, Taxations & Arbitrations
          </p>
        </div>

        {/* Consolidated Action Bar */}
        <div className="flex items-center gap-2.5 shrink-0">
          {can('matters.create') && (
            <button
              onClick={() => setShowNewMatterModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-zinc-100 font-sans font-semibold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-400" /> + New Matter / Cause
            </button>
          )}
          {can('clients.view') && (
            <button
              onClick={() => onNavigateTab ? onNavigateTab('clients') : null}
              className="px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-main)] hover:bg-[var(--bg-subtle)] font-sans font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Users className="w-4 h-4 text-slate-500" /> Clients Directory
            </button>
          )}
        </div>
      </div>

      {/* Controls Bar: Search & Forum Filter Chips */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, cause number, forum, party..."
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl pl-10 pr-3.5 py-2 text-xs text-[var(--text-main)] focus:outline-none focus:border-amber-500/50 transition-colors shadow-2xs"
            />
          </div>

          {/* Bulk Selection Actions Bar */}
          {selectedMatterIds.length > 0 && (
            <div className="flex items-center gap-2 bg-[var(--bg-subtle)] border border-amber-500/30 px-3 py-1.5 rounded-xl shadow-xs text-xs animate-in fade-in">
              <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                {selectedMatterIds.length} selected
              </span>
              <span className="text-[var(--text-muted)]">|</span>
              <span className="text-[11px] text-[var(--text-muted)] font-mono">Set:</span>
              <button
                onClick={() => handleBulkStatus('Active')}
                className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold hover:bg-emerald-500/20 cursor-pointer"
              >
                Active
              </button>
              <button
                onClick={() => handleBulkStatus('Pending Taxation')}
                className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-bold hover:bg-amber-500/20 cursor-pointer"
              >
                Taxation
              </button>
              <button
                onClick={() => handleBulkStatus('Concluded')}
                className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[10px] font-bold hover:bg-blue-500/20 cursor-pointer"
              >
                Concluded
              </button>
              <button
                onClick={() => handleBulkStatus('Stayed')}
                className="px-2 py-0.5 rounded bg-slate-500/10 text-slate-600 border border-slate-500/20 text-[10px] font-bold hover:bg-slate-500/20 cursor-pointer"
              >
                Stayed
              </button>
              <button
                onClick={() => setSelectedMatterIds([])}
                className="text-xs text-[var(--text-muted)] hover:text-red-500 ml-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* 1-Tap Court Forum Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {forumChips.map(chip => (
            <button
              key={chip.id}
              onClick={() => setForumFilter(chip.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                forumFilter === chip.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs font-semibold'
                  : 'bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-color)] hover:text-[var(--text-main)] hover:border-slate-400'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-xs font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* EXECUTIVE FULL-WIDTH LINE / TABLE FORMAT */}
      <div className="w-full bg-[var(--bg-main)] rounded-2xl border border-[var(--border-color)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--text-main)] border-collapse">
            <thead className="h-[42px] bg-[var(--bg-subtle)] text-[var(--text-muted)] uppercase text-[10px] font-mono tracking-wider border-b border-[var(--border-color)] font-semibold select-none">
              <tr>
                <th className="py-3.5 px-4 w-10 text-center">
                  <button onClick={toggleSelectAll} className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-main)]">
                    {selectedMatterIds.length === filtered.length && filtered.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-4">Court Cause Number</th>
                <th className="py-3.5 px-4 min-w-[280px]">Matter Title & Parties</th>
                <th className="py-3.5 px-4">Court Forum</th>
                <th className="py-3.5 px-4 text-right">Claim Value (KES)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right min-w-[190px]">Direct Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--text-muted)] font-mono text-xs">
                    No matching law firm matters found for this filter.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => {
                  const badge = getKenyanCaseBadge(m.caseNo, m.forum);
                  const isSelected = selectedMatterIds.includes(m.id);

                  return (
                    <tr
                      key={m.id}
                      className={`hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer group ${
                        isSelected ? 'bg-amber-500/5' : ''
                      }`}
                      onClick={() => setSelectedMatter(m)}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleSelectRow(m.id)}
                          className="cursor-pointer text-[var(--text-muted)] hover:text-amber-500"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-amber-500" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Case Number with Official Kenyan Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className="font-mono font-bold text-xs text-[var(--text-main)] block">
                            {m.caseNo}
                          </span>
                          <span className={`inline-block px-2 py-0.5 rounded text-[9.5px] font-mono font-bold border ${badge.style}`}>
                            {badge.tag}
                          </span>
                        </div>
                      </td>

                      {/* Title & Parties */}
                      <td className="py-3.5 px-4">
                        <strong className="font-bold text-xs text-[var(--text-main)] block line-clamp-1 group-hover:text-amber-600 transition-colors">
                          {m.title}
                        </strong>
                        <div className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5 truncate">
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">{m.applicant}</span>
                          <span className="mx-1.5 text-slate-400 font-bold">vs</span>
                          <span className="text-red-600 dark:text-red-400 font-semibold">{m.respondent}</span>
                        </div>
                      </td>

                      {/* Forum */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-[var(--text-muted)]">
                        <span className="flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{m.forum}</span>
                        </span>
                      </td>

                      {/* Claim Value */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right font-mono font-bold text-xs text-[var(--text-main)]">
                        KES {m.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${
                          m.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : m.status === 'Pending Taxation'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            : m.status === 'Concluded'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                            : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
                        }`}>
                          {m.status}
                        </span>
                      </td>

                      {/* Direct Actions: 1-Tap Draft Bill of Costs & Dropdown */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1-Tap Draft Bill of Costs */}
                          <button
                            onClick={() => handleDraftBOC(m)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-all font-mono text-[10.5px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Pre-populate claim value & parties directly into Bill of Costs Builder"
                          >
                            <span>Draft Bill</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>

                          {/* Detail Button */}
                          <button
                            onClick={() => setSelectedMatter(m)}
                            className="p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                            title="View Matter File Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Menu Dropdown */}
                          <div className="relative">
                            <button
                              onClick={() => setActiveMenuId(activeMenuId === m.id ? null : m.id)}
                              className="p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {activeMenuId === m.id && (
                              <div className="absolute right-0 top-7 w-44 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-xl z-30 py-1 text-xs space-y-0.5">
                                <button
                                  onClick={() => {
                                    setSelectedMatter(m);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-[var(--text-main)] hover:bg-[var(--bg-subtle)] flex items-center gap-2"
                                >
                                  <Eye className="w-3.5 h-3.5 text-[var(--text-muted)]" /> Matter File Details
                                </button>
                                <button
                                  onClick={() => {
                                    handleDraftBOC(m);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 flex items-center gap-2 font-medium"
                                >
                                  <FileText className="w-3.5 h-3.5" /> Draft Bill of Costs
                                </button>
                                {can('matters.edit') && (
                                  <button
                                    onClick={() => {
                                      setEditingMatter(m);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-[var(--text-main)] hover:bg-[var(--bg-subtle)] flex items-center gap-2"
                                  >
                                    <Edit className="w-3.5 h-3.5 text-[var(--text-muted)]" /> Edit Matter
                                  </button>
                                )}
                                {can('matters.delete') && (
                                  <button
                                    onClick={() => handleDeleteMatter(m.id, m.title)}
                                    className="w-full text-left px-3 py-1.5 text-red-500 hover:bg-red-500/10 flex items-center gap-2 font-medium"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete Matter
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MATTER CAUSE DOSSIER (2-COLUMN HIGH-CONTRAST SLIDE-OVER MODAL) */}
      {selectedMatter && (
        <div className="fixed inset-0 bg-[#0b1b36]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto">
          <div className="bg-[var(--bg-main)] rounded-2xl border border-[var(--border-color)] max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Dossier Header */}
            <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-subtle)] flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-[var(--bg-main)] border border-[var(--border-color)] font-mono text-xs font-bold text-[var(--text-main)]">
                    {selectedMatter.caseNo}
                  </span>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold border ${getKenyanCaseBadge(selectedMatter.caseNo, selectedMatter.forum).style}`}>
                    {getKenyanCaseBadge(selectedMatter.caseNo, selectedMatter.forum).tag}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold">
                    {selectedMatter.status}
                  </span>
                </div>
                <h2 className="font-brand font-extrabold text-xl sm:text-2xl text-[var(--text-main)] leading-tight">
                  {selectedMatter.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] font-mono">
                  <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> {selectedMatter.forum}</span>
                  <span>&bull;</span>
                  <span>Advocate on Record: {selectedMatter.filedBy || 'Guyoh Alake'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* 1-Tap Bill of Costs Action */}
                <button
                  onClick={() => {
                    handleDraftBOC(selectedMatter);
                    setSelectedMatter(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 font-sans font-bold text-xs flex items-center gap-1.5 hover:bg-amber-400 transition-all shadow-xs cursor-pointer"
                >
                  <FileText className="w-4 h-4" /> Draft Bill of Costs →
                </button>
                <button
                  onClick={() => setSelectedMatter(null)}
                  className="p-2 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* High-Contrast 2-Column Breakdown */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              {/* Left Column: Court Forum, Coram, Parties, Financials */}
              <div className="space-y-6">
                {/* Parties Matrix */}
                <div className="space-y-3">
                  <h3 className="font-mono text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-amber-500" /> Cause Parties
                  </h3>
                  <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] space-y-3">
                    <div className="p-3 rounded-lg border border-blue-500/20 bg-blue-500/5">
                      <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold uppercase block mb-1">
                        Plaintiff / Claimant ({selectedMatter.applicantRole || 'Applicant'})
                      </span>
                      <strong className="text-sm font-bold text-[var(--text-main)] block">
                        {selectedMatter.applicant}
                      </strong>
                    </div>

                    <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5">
                      <span className="text-[10px] font-mono text-red-600 dark:text-red-400 font-bold uppercase block mb-1">
                        Defendant / Respondent ({selectedMatter.respondentRole || 'Respondent'})
                      </span>
                      <strong className="text-sm font-bold text-[var(--text-main)] block">
                        {selectedMatter.respondent}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Forum & Coram Breakdown */}
                <div className="space-y-3">
                  <h3 className="font-mono text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1.5">
                    <Gavel className="w-3.5 h-3.5 text-blue-500" /> Court Forum & Coram
                  </h3>
                  <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] space-y-2.5">
                    <div className="flex justify-between py-1 border-b border-[var(--border-color)]">
                      <span className="text-[var(--text-muted)]">Judicial Forum:</span>
                      <strong className="text-[var(--text-main)] font-mono">{selectedMatter.forum}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[var(--border-color)]">
                      <span className="text-[var(--text-muted)]">Registry Number:</span>
                      <strong className="text-[var(--text-main)] font-mono">{selectedMatter.caseNo}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[var(--border-color)]">
                      <span className="text-[var(--text-muted)]">Filing Advocate:</span>
                      <strong className="text-[var(--text-main)]">{selectedMatter.filedBy || 'Guyoh Alake'}</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[var(--text-muted)]">Case State:</span>
                      <span className="font-bold text-emerald-600 font-mono">{selectedMatter.status}</span>
                    </div>
                  </div>
                </div>

                {/* Claim Value & Recovery */}
                <div className="space-y-3">
                  <h3 className="font-mono text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Financial Value
                  </h3>
                  <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono block uppercase">Claim Value</span>
                      <strong className="text-base font-mono font-bold text-[var(--text-main)] block mt-0.5">
                        KES {selectedMatter.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono block uppercase">Billed to Date</span>
                      <strong className="text-base font-mono font-bold text-emerald-600 block mt-0.5">
                        KES {selectedFeeNotes.reduce((sum, fn) => sum + fn.grandTotal, 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Linked Bills of Costs, Taxations & Vault Pleadings */}
              <div className="space-y-6">
                {/* Linked Bills of Costs */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-mono text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-500" /> Linked Bills of Costs & Fee Notes
                    </h3>
                    <span className="font-mono text-[10px] text-[var(--text-muted)]">
                      {selectedFeeNotes.length} Generated
                    </span>
                  </div>

                  {selectedFeeNotes.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-[var(--border-color)] rounded-xl bg-[var(--bg-subtle)] space-y-2">
                      <p className="text-xs text-[var(--text-muted)] font-mono">No bills drafted yet for this cause.</p>
                      <button
                        onClick={() => {
                          handleDraftBOC(selectedMatter);
                          setSelectedMatter(null);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 font-mono text-xs font-bold hover:bg-amber-500/20 cursor-pointer"
                      >
                        + Draft Bill of Costs Now
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {selectedFeeNotes.map(fn => (
                        <div key={fn.id} className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] flex items-center justify-between">
                          <div>
                            <span className="font-mono font-bold text-xs text-[var(--text-main)] block">{fn.billNumber}</span>
                            <span className="text-[10px] font-mono text-[var(--text-muted)]">
                              Taxed / Issued on {fn.createdAt}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-xs text-[var(--text-main)] block">
                              KES {fn.grandTotal.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                            </span>
                            <button
                              onClick={() => {
                                if (onNavigateToBuilder) onNavigateToBuilder(fn, true);
                                setSelectedMatter(null);
                              }}
                              className="text-[10px] text-amber-600 hover:underline font-mono font-bold"
                            >
                              Review PDF →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Connected Pleadings & Documents */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-mono text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1.5">
                      <FolderOpen className="w-3.5 h-3.5 text-purple-500" /> Connected Pleadings & Documents
                    </h3>
                    <span className="font-mono text-[10px] text-[var(--text-muted)]">
                      {selectedDocuments.length} Documents
                    </span>
                  </div>

                  {selectedDocuments.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-[var(--border-color)] rounded-xl bg-[var(--bg-subtle)]">
                      <p className="text-xs text-[var(--text-muted)] font-mono">No pleadings securely vaulted.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedDocuments.map(doc => (
                        <div key={doc.id} className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-1.5 rounded bg-purple-500/10 text-purple-600 shrink-0">
                              <FileText className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-xs text-[var(--text-main)] block truncate">{doc.filename}</span>
                              <span className="text-[10px] font-mono text-[var(--text-muted)]">{doc.size}</span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-white dark:bg-zinc-800 text-[10px] font-mono font-bold shrink-0">
                            VAULTED ✓
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* NEW MATTER REGISTRATION MODAL */}
      {showNewMatterModal && (
        <div className="fixed inset-0 bg-[#0b1b36]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="font-brand font-bold text-sm text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-500" /> Register New Court Cause / Matter
              </h3>
              <button onClick={() => setShowNewMatterModal(false)} className="text-[var(--text-muted)] hover:text-red-500 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMatter} className="space-y-3">
              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-semibold">Matter Description / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Seyani Brothers vs. Prime Bank Limited"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-muted)] mb-1 font-semibold">Court Cause / Case Number</label>
                  <input
                    type="text"
                    placeholder="e.g. HCCC No. E123 of 2026"
                    value={newCaseNo}
                    onChange={(e) => setNewCaseNo(e.target.value)}
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)] font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-muted)] mb-1 font-semibold">Court Forum / Coram</label>
                  <select
                    value={newForum}
                    onChange={(e) => setNewForum(e.target.value)}
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)] focus:outline-none focus:border-amber-500"
                  >
                    <option value="High Court — Commercial">High Court — Commercial</option>
                    <option value="Arbitration / High Court">Arbitration / High Court</option>
                    <option value="Subordinate / Magistrate's Court">Subordinate / Magistrate's Court</option>
                    <option value="Environment & Land Court (ELC)">Environment & Land Court (ELC)</option>
                    <option value="Employment & Labour Relations Court (ELRC)">Employment & Labour (ELRC)</option>
                    <option value="Non-Contentious Conveyancing">Non-Contentious Conveyancing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-muted)] mb-1 font-semibold">Plaintiff / Claimant</label>
                  <input
                    type="text"
                    required
                    placeholder="Applicant entity"
                    value={newApplicant}
                    onChange={(e) => setNewApplicant(e.target.value)}
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)] focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-muted)] mb-1 font-semibold">Defendant / Respondent</label>
                  <input
                    type="text"
                    required
                    placeholder="Respondent entity"
                    value={newRespondent}
                    onChange={(e) => setNewRespondent(e.target.value)}
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)] focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-semibold">Subject / Claim Value (KES)</label>
                <input
                  type="number"
                  value={newClaimAmount === 0 ? '' : newClaimAmount}
                  onChange={(e) => setNewClaimAmount(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 10000000"
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)] font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setShowNewMatterModal(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold text-xs cursor-pointer shadow-xs"
                >
                  Register Matter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MATTER MODAL */}
      {editingMatter && (
        <div className="fixed inset-0 bg-[#0b1b36]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="font-brand font-bold text-sm text-[var(--text-main)] uppercase tracking-wider">
                Edit Law Firm Matter / Cause
              </h3>
              <button onClick={() => setEditingMatter(null)} className="text-[var(--text-muted)] hover:text-red-500 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateMatter} className="space-y-3">
              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-semibold">Matter Description</label>
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
                    <option value="Employment & Labour Relations Court (ELRC)">Employment & Labour (ELRC)</option>
                    <option value="Non-Contentious Conveyancing">Non-Contentious Conveyancing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-muted)] mb-1 font-semibold">Plaintiff / Claimant</label>
                  <input
                    type="text"
                    value={editingMatter.applicant}
                    onChange={(e) => setEditingMatter({ ...editingMatter, applicant: e.target.value })}
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)]"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-muted)] mb-1 font-semibold">Defendant / Respondent</label>
                  <input
                    type="text"
                    value={editingMatter.respondent}
                    onChange={(e) => setEditingMatter({ ...editingMatter, respondent: e.target.value })}
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-semibold">Subject / Claim Amount (KES)</label>
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
                  className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-[var(--text-muted)] text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold text-xs cursor-pointer"
                >
                  Save Changes
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
