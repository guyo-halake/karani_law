import React, { useState } from 'react';
import {
  EXACT_CLIENTS,
  EXACT_MATTERS,
  EXACT_FEE_NOTES,
  ExactClientRecord,
  ExactMatterRecord,
  ExactFeeNoteRecord
} from '../../services/supabase';
import {
  UserPlus,
  Search,
  Phone,
  Mail,
  MessageSquare,
  MessageCircle,
  LayoutGrid,
  Table as TableIcon,
  X,
  Paperclip,
  Send,
  Building2,
  Briefcase,
  FileText,
  ExternalLink,
  Eye,
  CheckCircle2,
  Trash2
} from 'lucide-react';

export const ClientsView: React.FC = () => {
  const [clientsList, setClientsList] = useState<ExactClientRecord[]>(EXACT_CLIENTS);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  
  // Client Detail Modal / Drawer State
  const [selectedClientDetail, setSelectedClientDetail] = useState<ExactClientRecord | null>(null);

  // New Client Registration Modal State
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newCategory, setNewCategory] = useState('Corporate or Institutional');
  const [newEmail, setNewEmail] = useState('');
  const [newPhonePrimary, setNewPhonePrimary] = useState('');
  const [newPhoneSecondary, setNewPhoneSecondary] = useState('');

  // Email Compose Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailClient, setEmailClient] = useState<ExactClientRecord | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  const filtered = clientsList.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phonePrimary.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleRegisterClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newRecord: ExactClientRecord = {
      id: 'c-' + (clientsList.length + 1),
      name: newName.trim(),
      company: newCompany.trim() || newName.trim(),
      category: newCategory,
      email: newEmail.trim() || 'client@firm.co.ke',
      phone: newPhonePrimary.trim() || '+254 700 000 000',
      phonePrimary: newPhonePrimary.trim() || '+254 700 000 000',
      phoneSecondary: newPhoneSecondary.trim() || '+254 20 000 0000',
      matters: 0,
      mattersList: []
    };

    setClientsList([newRecord, ...clientsList]);
    setShowNewClientModal(false);
    setNewName('');
    setNewCompany('');
    setNewEmail('');
    setNewPhonePrimary('');
    setNewPhoneSecondary('');
    alert(`✓ Client "${newRecord.name}" registered successfully!`);
  };

  const handleDeleteClient = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete client "${name}" from the database?`)) {
      setClientsList(prev => prev.filter(c => c.id !== id));
      if (selectedClientDetail?.id === id) {
        setSelectedClientDetail(null);
      }
    }
  };

  const handleOpenEmail = (client: ExactClientRecord) => {
    setEmailClient(client);
    setEmailSubject(`Nyagah B. Kithinji & Co. Advocates - Notice regarding Matter Filings`);
    setEmailBody(`Dear ${client.name},\n\nPlease find attached the official legal documentation and statement of account from Nyagah B. Kithinji & Co. Advocates.\n\nKindly acknowledge receipt.\n\nYours faithfully,\nNyagah B. Kithinji & Co. Advocates`);
    setShowEmailModal(true);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setShowEmailModal(false);
      alert(`✓ Email sent successfully to ${emailClient?.email}!`);
    }, 1000);
  };

  // Helper to find matters belonging to selected client
  const getMattersForClient = (client: ExactClientRecord): ExactMatterRecord[] => {
    return EXACT_MATTERS.filter(m =>
      m.title.toLowerCase().includes(client.name.toLowerCase()) ||
      m.applicant.toLowerCase().includes(client.name.toLowerCase()) ||
      client.mattersList.some(mName => m.title.toLowerCase().includes(mName.toLowerCase()))
    );
  };

  // Helper to find fee notes belonging to selected client
  const getFeeNotesForClient = (client: ExactClientRecord): ExactFeeNoteRecord[] => {
    return EXACT_FEE_NOTES.filter(fn =>
      fn.clientName.toLowerCase().includes(client.name.toLowerCase()) ||
      client.name.toLowerCase().includes(fn.clientName.toLowerCase())
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b border-[var(--border-color)]/50 pb-6">
        <div>
          <span className="section-eyebrow">Client Management</span>
          <h1 className="executive-title">
            Firm Clients Directory
          </h1>
          <p className="executive-subtitle">
            Institutional, Corporate & Private Client Records, Contact Information & Billing Profiles
          </p>
        </div>

        <button
          onClick={() => setShowNewClientModal(true)}
          className="btn-gold px-4 py-2 text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Register New Client
        </button>
      </div>

      {/* Controls Bar: Search & View Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client name, company, email, phone..."
            className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl pl-10 pr-3.5 py-2 text-xs text-[var(--text-main)] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[var(--text-muted)] font-mono text-xs hidden md:inline">{filtered.length} Clients Registered</span>
          
          <div className="flex items-center gap-1 bg-[var(--bg-subtle)] p-1 rounded-xl border border-[var(--border-color)] shrink-0">
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
              onClick={() => setViewMode('card')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all cursor-pointer ${
                viewMode === 'card'
                  ? 'bg-[var(--btn-bg)] text-[var(--btn-text)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Card View
            </button>
          </div>
        </div>
      </div>

      {/* TABLE VIEW MODE */}
      {viewMode === 'table' && (
        <div className="vercel-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[var(--text-main)]">
              <thead className="bg-[var(--bg-subtle)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider border-b border-[var(--border-color)] font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Client Entity & Company</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Official Email</th>
                  <th className="px-5 py-3.5">Telephone Numbers</th>
                  <th className="px-5 py-3.5 text-center">Matters</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {filtered.map((c: ExactClientRecord) => (
                  <tr key={c.id} className="hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer" onClick={() => setSelectedClientDetail(c)}>
                    <td className="px-5 py-3.5">
                      <strong className="font-bold text-[var(--text-main)] block">{c.name}</strong>
                      <span className="text-[10.5px] text-[var(--text-muted)] font-mono">{c.company}</span>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--text-muted)]">
                      <span className="px-2.5 py-0.5 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[10.5px] font-semibold">
                        {c.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono">{c.email}</td>
                    <td className="px-5 py-3.5 font-mono text-[11px]">
                      <div>{c.phonePrimary}</div>
                      {c.phoneSecondary && <div className="text-[var(--text-muted)]">{c.phoneSecondary}</div>}
                    </td>
                    <td className="px-5 py-3.5 text-center font-mono font-bold">{c.matters}</td>
                    <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedClientDetail(c)}
                          className="p-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                          title="View Full Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEmail(c)}
                          className="p-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                          title="Send Email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(c.id, c.name)}
                          className="p-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-red-500 transition-colors cursor-pointer"
                          title="Delete Client"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CARD VIEW MODE */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c: ExactClientRecord) => (
            <div
              key={c.id}
              onClick={() => setSelectedClientDetail(c)}
              className="vercel-card-interactive p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    {c.category}
                  </span>
                  <span className="font-mono font-bold text-xs text-[var(--text-main)]">{c.matters} Active Matters</span>
                </div>

                <h3 className="font-bold text-sm text-[var(--text-main)]">{c.name}</h3>
                <p className="text-xs text-[var(--text-muted)] font-mono">{c.company}</p>
              </div>

              <div className="pt-3 border-t border-[var(--border-color)] space-y-1.5 text-xs font-mono">
                <p className="flex items-center gap-1.5 text-[var(--text-main)]"><Mail className="w-3.5 h-3.5 text-[var(--text-muted)]" /> {c.email}</p>
                <p className="flex items-center gap-1.5 text-[var(--text-main)]"><Phone className="w-3.5 h-3.5 text-[var(--text-muted)]" /> {c.phonePrimary}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CLIENT DETAIL DRAWER / MODAL */}
      {selectedClientDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="vercel-card p-6 sm:p-8 max-w-3xl w-full space-y-6 my-8 max-h-[90vh] overflow-y-auto text-xs shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border-color)] pb-4">
              <div>
                <span className="text-[11px] font-mono font-bold text-[var(--text-muted)] uppercase">
                  {selectedClientDetail.category}
                </span>
                <h2 className="font-brand font-extrabold text-xl text-[var(--text-main)] mt-0.5">
                  {selectedClientDetail.name}
                </h2>
                <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                  Company Entity: {selectedClientDetail.company}
                </p>
              </div>

              <button
                onClick={() => setSelectedClientDetail(null)}
                className="p-1.5 rounded-xl border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contact Information Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
              <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
                <span className="text-[10px] text-[var(--text-muted)] block font-semibold uppercase">Official Email</span>
                <strong className="text-xs font-bold text-[var(--text-main)] block truncate">
                  {selectedClientDetail.email}
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
                <span className="text-[10px] text-[var(--text-muted)] block font-semibold uppercase">Primary Telephone</span>
                <strong className="text-xs font-bold text-[var(--text-main)] block">
                  {selectedClientDetail.phonePrimary}
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
                <span className="text-[10px] text-[var(--text-muted)] block font-semibold uppercase">Secondary Telephone</span>
                <strong className="text-xs font-bold text-[var(--text-main)] block">
                  {selectedClientDetail.phoneSecondary || 'N/A'}
                </strong>
              </div>
            </div>

            {/* Client Matters List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
                <h3 className="font-brand font-bold text-xs uppercase text-[var(--text-main)] tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-500" /> Active Legal Matters for {selectedClientDetail.name}
                </h3>
                <span className="font-mono text-[10.5px] text-[var(--text-muted)]">
                  {getMattersForClient(selectedClientDetail).length} Matters Registered
                </span>
              </div>

              {getMattersForClient(selectedClientDetail).length === 0 ? (
                <p className="text-[11px] text-[var(--text-muted)] italic">No specific matters recorded under this client entity.</p>
              ) : (
                <div className="space-y-2">
                  {getMattersForClient(selectedClientDetail).map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-between gap-3"
                    >
                      <div>
                        <strong className="font-bold text-[var(--text-main)] block">{m.title}</strong>
                        <span className="text-[10.5px] text-[var(--text-muted)] font-mono">
                          {m.caseNo} &bull; {m.forum} &bull; Status: {m.status}
                        </span>
                      </div>

                      <span className="font-mono font-bold text-xs text-[var(--text-main)] shrink-0">
                        Kshs {m.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Client Fee Notes List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
                <h3 className="font-brand font-bold text-xs uppercase text-[var(--text-main)] tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-500" /> Fee Notes & Bills Issued to Client
                </h3>
                <span className="font-mono text-[10.5px] text-[var(--text-muted)]">
                  {getFeeNotesForClient(selectedClientDetail).length} Fee Notes Found
                </span>
              </div>

              {getFeeNotesForClient(selectedClientDetail).length === 0 ? (
                <p className="text-[11px] text-[var(--text-muted)] italic">No fee notes generated for this client yet.</p>
              ) : (
                <div className="space-y-2">
                  {getFeeNotesForClient(selectedClientDetail).map((fn) => (
                    <div
                      key={fn.id}
                      className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-between gap-3"
                    >
                      <div>
                        <strong className="font-mono font-bold text-[var(--text-main)]">{fn.billNumber}</strong>
                        <span className="text-[10.5px] text-[var(--text-muted)] block mt-0.5">
                          {fn.courtSchedule} &bull; Status: {fn.status}
                        </span>
                      </div>

                      <span className="font-mono font-bold text-sm text-[var(--text-main)] shrink-0">
                        Kshs {fn.grandTotal.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-[var(--border-color)]">
              <button
                onClick={() => setSelectedClientDetail(null)}
                className="btn-black px-5 py-2 text-xs font-semibold cursor-pointer"
              >
                Close Client Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER NEW CLIENT MODAL */}
      {showNewClientModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="vercel-card p-6 max-w-md w-full space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="font-brand font-bold text-sm text-[var(--text-main)] uppercase tracking-wider">
                Register New Law Firm Client
              </h3>
              <button onClick={() => setShowNewClientModal(false)} className="text-[var(--text-muted)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterClient} className="space-y-3">
              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-semibold">Client Name / Full Entity</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Seyani Brothers & Co. (K) Limited"
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)]"
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-semibold">Company Registered Name</label>
                <input
                  type="text"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="e.g. Seyani Construction Group"
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)]"
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-semibold">Client Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)]"
                >
                  <option value="Corporate or Institutional">Corporate or Institutional</option>
                  <option value="Individual Client">Individual Client</option>
                  <option value="Family Trust / Estate">Family Trust / Estate</option>
                  <option value="Government Entity">Government Entity</option>
                </select>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-semibold">Official Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="info@seyani.co.ke"
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-muted)] mb-1 font-semibold">Primary Phone</label>
                  <input
                    type="text"
                    value={newPhonePrimary}
                    onChange={(e) => setNewPhonePrimary(e.target.value)}
                    placeholder="+254 720 100 200"
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-muted)] mb-1 font-semibold">Secondary Phone</label>
                  <input
                    type="text"
                    value={newPhoneSecondary}
                    onChange={(e) => setNewPhoneSecondary(e.target.value)}
                    placeholder="+254 20 271 8800"
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)] font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setShowNewClientModal(false)}
                  className="btn-outline px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-black px-4 py-2 text-xs cursor-pointer"
                >
                  Save Client Realtime
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EMAIL COMPOSE MODAL */}
      {showEmailModal && emailClient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="vercel-card p-6 max-w-lg w-full space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="font-brand font-bold text-sm text-[var(--text-main)]">
                Compose Email to {emailClient.name}
              </h3>
              <button onClick={() => setShowEmailModal(false)} className="text-[var(--text-muted)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-3">
              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-semibold">Recipient Email</label>
                <input
                  type="email"
                  value={emailClient.email}
                  readOnly
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 font-mono text-[var(--text-main)] opacity-80"
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-semibold">Subject</label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-[var(--text-main)] font-medium"
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-semibold">Message Body</label>
                <textarea
                  rows={5}
                  required
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl p-3 text-[var(--text-main)] font-sans leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="btn-outline px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="btn-black px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> {isSending ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsView;
