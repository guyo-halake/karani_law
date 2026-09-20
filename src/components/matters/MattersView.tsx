import React, { useState } from 'react';
import {
  EXACT_MATTERS,
  EXACT_CLIENTS,
  EXACT_FEE_NOTES,
  EXACT_VAULT_FILES,
  ExactMatterRecord,
  ExactFeeNoteRecord,
  ExactVaultFileRecord,
  ExactClientRecord
} from '../../services/supabase';
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
}

export const MattersView: React.FC<MattersViewProps> = ({ onNavigateTab }) => {
  const [mattersList, setMattersList] = useState<ExactMatterRecord[]>(EXACT_MATTERS);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'table' | 'list'>('card');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Matter Detail Modal / Drawer State
  const [selectedMatter, setSelectedMatter] = useState<ExactMatterRecord | null>(null);

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

  const filtered = mattersList.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.caseNo.toLowerCase().includes(search.toLowerCase()) ||
    m.applicant.toLowerCase().includes(search.toLowerCase()) ||
    m.respondent.toLowerCase().includes(search.toLowerCase()) ||
    m.forum.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdateMatter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatter) return;

    setMattersList(prev => prev.map(m => m.id === editingMatter.id ? editingMatter : m));
    setEditingMatter(null);
    alert(`✓ Matter "${editingMatter.title}" updated successfully!`);
  };

  const handleCreateMatter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newRecord: ExactMatterRecord = {
      id: 'm-' + (mattersList.length + 1),
      title: newTitle.trim(),
      caseNo: newCaseNo.trim() || 'HCCC Cause No. 2026',
      forum: newForum,
      applicant: newApplicant.trim() || 'Claimant Entity',
      applicantRole: 'Claimant',
      respondent: newRespondent.trim() || 'Respondent Entity',
      respondentRole: 'Respondent',
      status: 'Taxation Ready',
      statusClass: 'ready',
      filedBy: 'Nyagah B. Kithinji & Co. Advocates',
      amount: newClaimAmount,
      itemsCount: 12,
      feeNoteLink: `BOC-2026-NEW-${mattersList.length + 1}`,
      documentLink: `Document_Vault_${newTitle.slice(0, 15)}.xlsx`
    };

    setMattersList([newRecord, ...mattersList]);
    setShowNewMatterModal(false);
    setNewTitle('');
    setNewCaseNo('');
    setNewClaimAmount(0);
    alert(`✓ Matter "${newRecord.title}" registered successfully in database!`);
  };

  const handleDeleteMatter = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete matter "${title}"?`)) {
      setMattersList(prev => prev.filter(m => m.id !== id));
      setActiveMenuId(null);
    }
  };

  // Helper to find client details for selected matter
  const getClientForMatter = (matter: ExactMatterRecord): ExactClientRecord => {
    const found = EXACT_CLIENTS.find(c =>
      matter.title.toLowerCase().includes(c.name.toLowerCase()) ||
      c.mattersList.some(mName => matter.title.toLowerCase().includes(mName.toLowerCase()))
    );
    return found || EXACT_CLIENTS[0];
  };

  // Helper to find fee notes for selected matter
  const getFeeNotesForMatter = (matter: ExactMatterRecord): ExactFeeNoteRecord[] => {
    return EXACT_FEE_NOTES.filter(fn =>
      fn.matterId === matter.id ||
      fn.matterTitle.toLowerCase().includes(matter.title.toLowerCase()) ||
      matter.title.toLowerCase().includes(fn.clientName.toLowerCase())
    );
  };

  // Helper to find vault documents for selected matter
  const getDocumentsForMatter = (matter: ExactMatterRecord): ExactVaultFileRecord[] => {
    return EXACT_VAULT_FILES.filter(vf =>
      vf.matter.toLowerCase().includes(matter.title.toLowerCase()) ||
      matter.title.toLowerCase().includes(vf.client.toLowerCase())
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 px-1 border-b border-[var(--border-color)]/50 pb-5">
        <div>
          <h1 className="font-brand font-extrabold text-2xl text-[var(--text-main)] tracking-tight">
            Matters & Litigation Proceedings
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Active Law Firm Causes, Court Taxations & Associated Client Records
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowNewMatterModal(true)}
            className="btn-black px-4 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Matter / Case
          </button>
          <button
            onClick={() => onNavigateTab ? onNavigateTab('clients') : null}
            className="btn-outline px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-4 h-4" /> Clients Directory
          </button>
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMatter(m.id, m.title);
                          }}
                          className="w-full text-left px-3 py-1.5 text-red-500 hover:bg-red-500/10 flex items-center gap-2 font-medium"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete Matter
                        </button>
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

      {/* MATTER DETAIL DRAWER / MODAL */}
      {selectedMatter && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="vercel-card p-6 sm:p-8 max-w-3xl w-full space-y-6 my-8 max-h-[90vh] overflow-y-auto text-xs shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border-color)] pb-4">
              <div>
                <span className="text-[11px] font-mono font-bold text-[var(--text-muted)] uppercase">
                  {selectedMatter.caseNo} &bull; {selectedMatter.forum}
                </span>
                <h2 className="font-brand font-extrabold text-xl text-[var(--text-main)] mt-0.5">
                  {selectedMatter.title}
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {selectedMatter.filedBy}
                </p>
              </div>

              <button
                onClick={() => setSelectedMatter(null)}
                className="p-1.5 rounded-xl border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Matter Metric Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
              <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
                <span className="text-[10px] text-[var(--text-muted)] block font-semibold uppercase">Claim Amount</span>
                <strong className="text-sm font-bold text-[var(--text-main)]">
                  Kshs {selectedMatter.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
                <span className="text-[10px] text-[var(--text-muted)] block font-semibold uppercase">Status</span>
                <strong className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedMatter.status}
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
                <span className="text-[10px] text-[var(--text-muted)] block font-semibold uppercase">Claimant / Plaintiff</span>
                <strong className="text-xs font-bold text-[var(--text-main)] truncate block">
                  {selectedMatter.applicant}
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
                <span className="text-[10px] text-[var(--text-muted)] block font-semibold uppercase">Respondent</span>
                <strong className="text-xs font-bold text-[var(--text-main)] truncate block">
                  {selectedMatter.respondent}
                </strong>
              </div>
            </div>

            {/* Client Information Section */}
            {(() => {
              const client = getClientForMatter(selectedMatter);
              return (
                <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)]/40 space-y-3">
                  <div className="flex items-center gap-2 border-b border-[var(--border-color)]/60 pb-2">
                    <Building2 className="w-4 h-4 text-[var(--text-main)]" />
                    <h3 className="font-brand font-bold text-xs uppercase text-[var(--text-main)] tracking-wider">
                      Associated Law Firm Client Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <span className="text-[10.5px] text-[var(--text-muted)] uppercase block font-semibold">Client Name:</span>
                      <strong className="font-bold text-[var(--text-main)]">{client.name}</strong>
                    </div>

                    <div>
                      <span className="text-[10.5px] text-[var(--text-muted)] uppercase block font-semibold">Company Entity:</span>
                      <p className="font-medium text-[var(--text-main)]">{client.company}</p>
                    </div>

                    <div>
                      <span className="text-[10.5px] text-[var(--text-muted)] uppercase block font-semibold">Contact Email & Phone:</span>
                      <p className="font-mono text-[11px] text-[var(--text-main)]">{client.email}</p>
                      <p className="font-mono text-[11px] text-[var(--text-muted)]">{client.phonePrimary} | {client.phoneSecondary}</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Issued Fee Notes & Bills of Costs Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
                <h3 className="font-brand font-bold text-xs uppercase text-[var(--text-main)] tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-500" /> Fee Notes & Bills of Costs for this Matter
                </h3>
                <span className="font-mono text-[10.5px] text-[var(--text-muted)]">
                  {getFeeNotesForMatter(selectedMatter).length} Bills Found
                </span>
              </div>

              {getFeeNotesForMatter(selectedMatter).length === 0 ? (
                <p className="text-[11px] text-[var(--text-muted)] italic">No fee notes generated for this matter yet.</p>
              ) : (
                <div className="space-y-2">
                  {getFeeNotesForMatter(selectedMatter).map((fn) => (
                    <div
                      key={fn.id}
                      className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="font-mono font-bold text-[var(--text-main)]">{fn.billNumber}</strong>
                          <span className="px-2 py-0.2 rounded bg-emerald-500/10 text-emerald-600 font-mono text-[10px] font-bold">
                            {fn.status.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">
                          {fn.courtSchedule} &bull; Generated by {fn.generatedByUser} ({fn.createdAt})
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono font-bold text-sm text-[var(--text-main)]">
                          Kshs {fn.grandTotal.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                        </span>

                        <button
                          onClick={() => alert(`Opening PDF statement for ${fn.billNumber}...`)}
                          className="btn-outline px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" /> PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Attached Vault Documents Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
                <h3 className="font-brand font-bold text-xs uppercase text-[var(--text-main)] tracking-wider flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-purple-500" /> Storage Vault Documents for this Matter
                </h3>
                <span className="font-mono text-[10.5px] text-[var(--text-muted)]">
                  {getDocumentsForMatter(selectedMatter).length} Files Attached
                </span>
              </div>

              {getDocumentsForMatter(selectedMatter).length === 0 ? (
                <p className="text-[11px] text-[var(--text-muted)] italic">No documents attached in storage vault yet.</p>
              ) : (
                <div className="space-y-2">
                  {getDocumentsForMatter(selectedMatter).map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <strong className="font-semibold text-[var(--text-main)] block truncate">{doc.filename}</strong>
                        <span className="text-[10.5px] text-[var(--text-muted)] font-mono">
                          {doc.size} &bull; {doc.fileType} &bull; Updated: {doc.updatedAt}
                        </span>
                      </div>

                      <button
                        onClick={() => alert(`Downloading "${doc.filename}" from Supabase vault...`)}
                        className="btn-outline px-3 py-1 text-[11px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" /> View / Download
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-[var(--border-color)]">
              <button
                onClick={() => setSelectedMatter(null)}
                className="btn-black px-5 py-2 text-xs font-semibold cursor-pointer"
              >
                Close Matter Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW MATTER REGISTRATION MODAL */}
      {showNewMatterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="vercel-card p-6 max-w-lg w-full space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="font-brand font-bold text-sm text-[var(--text-main)] uppercase tracking-wider">
                Register New Law Firm Matter / Cause
              </h3>
              <button onClick={() => setShowNewMatterModal(false)} className="text-[var(--text-muted)]">
                <X className="w-4 h-4" />
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
                  placeholder="e.g. Seyani Brothers v Greenhills Investment Ltd"
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
                    placeholder="HCCC No. E104 of 2025"
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
                    placeholder="Seyani Brothers & Co."
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)]"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-muted)] mb-1 font-semibold">Respondent / Defendant</label>
                  <input
                    type="text"
                    value={newRespondent}
                    onChange={(e) => setNewRespondent(e.target.value)}
                    placeholder="Greenhills Investment Ltd"
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-semibold">Subject / Claim Amount (Kshs)</label>
                <input
                  type="number"
                  value={newClaimAmount}
                  onChange={(e) => setNewClaimAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
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
