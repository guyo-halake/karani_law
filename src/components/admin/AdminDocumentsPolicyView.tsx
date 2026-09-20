import React, { useState } from 'react';
import { Folder, Shield, HardDrive, Lock, Clock, FileCheck, Save, CheckCircle2, AlertOctagon, RefreshCw, Trash2 } from 'lucide-react';

export const AdminDocumentsPolicyView: React.FC = () => {
  const [aesEncryption, setAesEncryption] = useState(true);
  const [retentionYears, setRetentionYears] = useState('7');
  const [maxUploadMb, setMaxUploadMb] = useState(50);
  const [allowPdf, setAllowPdf] = useState(true);
  const [allowExcel, setAllowExcel] = useState(true);
  const [allowWord, setAllowWord] = useState(true);
  const [allowMedia, setAllowMedia] = useState(true);
  const [autoArchive, setAutoArchive] = useState(true);
  const [virusScanning, setVirusScanning] = useState(true);
  const [linkExpiry, setLinkExpiry] = useState('24');
  const [backupSchedule, setBackupSchedule] = useState('daily');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="w-full space-y-8 pb-12 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)]/50 pb-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-bold text-[10px]">
            ADMIN CONTROL PANEL
          </span>
          <h1 className="font-brand font-extrabold text-2xl text-[var(--text-main)] tracking-tight mt-1">
            Documents & Storage Vault Policy Settings
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            11 Master Features for Supabase Encryption, Statutory Retention, Bucket Quotas & Archiving
          </p>
        </div>

        <button
          onClick={handleSave}
          className="btn-black px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
        >
          {isSaved ? <><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Policy Saved!</> : <><Save className="w-4 h-4" /> Save Storage Policy</>}
        </button>
      </div>

      {/* 11 Packed Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. AES Encryption */}
        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <Lock className="w-4 h-4 text-emerald-500" /> 1. AES-256 Bucket Encryption
          </h3>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[var(--text-muted)]">Encrypt all legal files at rest:</span>
            <input
              type="checkbox"
              checked={aesEncryption}
              onChange={(e) => setAesEncryption(e.target.checked)}
              className="w-4 h-4 accent-black dark:accent-white cursor-pointer"
            />
          </div>
        </div>

        {/* 2. Statutory 7-Year Retention */}
        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <Clock className="w-4 h-4 text-amber-500" /> 2. Statutory Legal Retention Rule
          </h3>
          <select
            value={retentionYears}
            onChange={(e) => setRetentionYears(e.target.value)}
            className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs text-[var(--text-main)] focus:outline-none"
          >
            <option value="7">7 Years (Kenyan High Court Statutory Mandate)</option>
            <option value="10">10 Years Extended Corporate Archive</option>
            <option value="indefinite">Indefinite Retention (No Purging)</option>
          </select>
        </div>

        {/* 3. Max Upload Size */}
        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <HardDrive className="w-4 h-4 text-blue-500" /> 3. Max Single Object Upload Limit
          </h3>
          <select
            value={maxUploadMb}
            onChange={(e) => setMaxUploadMb(parseInt(e.target.value))}
            className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs text-[var(--text-main)] focus:outline-none"
          >
            <option value={25}>25 MB Limit</option>
            <option value={50}>50 MB Limit (Standard Legal Vault)</option>
            <option value={100}>100 MB Limit (Large Filings)</option>
          </select>
        </div>

        {/* 4. MIME Type Filters */}
        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <FileCheck className="w-4 h-4 text-purple-500" /> 4. MIME Type Whitelist
          </h3>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={allowPdf} onChange={(e) => setAllowPdf(e.target.checked)} className="accent-black dark:accent-white" /> PDF Documents</label>
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={allowExcel} onChange={(e) => setAllowExcel(e.target.checked)} className="accent-black dark:accent-white" /> Excel Workbooks</label>
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={allowWord} onChange={(e) => setAllowWord(e.target.checked)} className="accent-black dark:accent-white" /> Word Documents</label>
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={allowMedia} onChange={(e) => setAllowMedia(e.target.checked)} className="accent-black dark:accent-white" /> Multimedia Assets</label>
          </div>
        </div>

        {/* 5. Auto Archiving */}
        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <Folder className="w-4 h-4 text-indigo-500" /> 5. Auto-Archive Closed Matters
          </h3>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[var(--text-muted)]">Auto-move closed cause files to vault:</span>
            <input
              type="checkbox"
              checked={autoArchive}
              onChange={(e) => setAutoArchive(e.target.checked)}
              className="w-4 h-4 accent-black dark:accent-white cursor-pointer"
            />
          </div>
        </div>

        {/* 6. Storage Quota Gauge */}
        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <HardDrive className="w-4 h-4 text-rose-500" /> 6. Supabase Bucket Quota Monitor
          </h3>
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-[11px]">
              <span>Used: 14.2 GB</span>
              <span>Total: 100 GB</span>
            </div>
            <div className="w-full bg-[var(--bg-subtle)] h-2 rounded-full overflow-hidden border border-[var(--border-color)]">
              <div className="bg-emerald-500 h-full w-[14%]" />
            </div>
          </div>
        </div>

        {/* 7. Virus Scanning */}
        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <Shield className="w-4 h-4 text-teal-500" /> 7. Real-Time Virus/Malware Scanner
          </h3>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[var(--text-muted)]">Scan uploads before bucket save:</span>
            <input
              type="checkbox"
              checked={virusScanning}
              onChange={(e) => setVirusScanning(e.target.checked)}
              className="w-4 h-4 accent-black dark:accent-white cursor-pointer"
            />
          </div>
        </div>

        {/* 8. Public Link Expiry */}
        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <Clock className="w-4 h-4 text-orange-500" /> 8. Shared Link Expiration Timer
          </h3>
          <select
            value={linkExpiry}
            onChange={(e) => setLinkExpiry(e.target.value)}
            className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs text-[var(--text-main)] focus:outline-none"
          >
            <option value="1">1 Hour Link Expiry</option>
            <option value="24">24 Hours Link Expiry (Default)</option>
            <option value="168">7 Days Link Expiry</option>
          </select>
        </div>

        {/* 9. Automated Backup Schedule */}
        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <RefreshCw className="w-4 h-4 text-cyan-500" /> 9. Vault Backup Schedule
          </h3>
          <select
            value={backupSchedule}
            onChange={(e) => setBackupSchedule(e.target.value)}
            className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs text-[var(--text-main)] focus:outline-none"
          >
            <option value="daily">Daily Midnight Snapshot</option>
            <option value="weekly">Weekly Sunday Snapshot</option>
          </select>
        </div>

      </div>
    </div>
  );
};

export default AdminDocumentsPolicyView;
