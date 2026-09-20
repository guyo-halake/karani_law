import React, { useState } from 'react';
import { Calculator, Save, CheckCircle2, Sliders, DollarSign, Layers, FileText, CheckSquare, RefreshCw } from 'lucide-react';

export const AdminBocSettingsView: React.FC = () => {
  const [multiplierTier1, setMultiplierTier1] = useState(1.0);
  const [autoGettingUp, setAutoGettingUp] = useState(true);
  const [defaultVatRate, setDefaultVatRate] = useState('16');
  const [maxClaimCap, setMaxClaimCap] = useState(500000000);
  const [defaultSchedule, setDefaultSchedule] = useState('schedule_6_high_court');
  const [invoicePrefix, setInvoicePrefix] = useState('BOC-2026-FEE');
  const [autoSaveFreq, setAutoSaveFreq] = useState('30');
  const [currencyFormat, setCurrencyFormat] = useState('KSHS');
  const [drawingFolioRate, setDrawingFolioRate] = useState(500);
  const [copyingFolioRate, setCopyingFolioRate] = useState(100);
  const [courtAttendanceRate, setCourtAttendanceRate] = useState(3000);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="w-full space-y-8 pb-12 text-xs">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)]/50 pb-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-bold text-[10px]">
            ADMIN CONTROL PANEL
          </span>
          <h1 className="font-brand font-extrabold text-2xl text-[var(--text-main)] tracking-tight mt-1">
            Home & Bill of Costs Settings Engine
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            11 Master Configuration Controls for Advocates Remuneration Order Tiers & Calculation Engine
          </p>
        </div>

        <button
          onClick={handleSave}
          className="btn-black px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
        >
          {isSaved ? <><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Settings Saved!</> : <><Save className="w-4 h-4" /> Save BOC Config</>}
        </button>
      </div>

      {/* 11 Packed Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Feature 1: Multiplier Overrides */}
        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <Sliders className="w-4 h-4 text-amber-500" /> 1. Scale Tier Multiplier Override
          </h3>
          <label className="text-[11px] text-[var(--text-muted)] block">Statutory Tier 1 Multiplier (Default 1.0x):</label>
          <input
            type="number"
            step="0.05"
            value={multiplierTier1}
            onChange={(e) => setMultiplierTier1(parseFloat(e.target.value))}
            className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs text-[var(--text-main)] focus:outline-none"
          />
        </div>

        {/* Feature 2: Getting Up Fee Engine */}
        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <CheckSquare className="w-4 h-4 text-emerald-500" /> 2. Getting-Up Fee 1/3 Engine
          </h3>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[var(--text-muted)]">Auto-apply 33.33% surcharge on instruction fee:</span>
            <input
              type="checkbox"
              checked={autoGettingUp}
              onChange={(e) => setAutoGettingUp(e.target.checked)}
              className="w-4 h-4 accent-black dark:accent-white cursor-pointer"
            />
          </div>
        </div>

        {/* Feature 3: VAT Rate Rules */}
        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <DollarSign className="w-4 h-4 text-blue-500" /> 3. Default Statutory VAT Rate
          </h3>
          <select
            value={defaultVatRate}
            onChange={(e) => setDefaultVatRate(e.target.value)}
            className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs text-[var(--text-main)] focus:outline-none"
          >
            <option value="16">16% (Standard Advocates Remuneration VAT)</option>
            <option value="0">0% (VAT Exempt / Arbitral Exemption)</option>
          </select>
        </div>

        {/* Feature 4: Claim Value Cap */}
        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <Layers className="w-4 h-4 text-purple-500" /> 4. Max Subject Claim Threshold Cap
          </h3>
          <input
            type="number"
            value={maxClaimCap}
            onChange={(e) => setMaxClaimCap(parseInt(e.target.value))}
            className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs text-[var(--text-main)] focus:outline-none"
          />
        </div>

        {/* Feature 5: Default Schedule Selector */}
        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <FileText className="w-4 h-4 text-indigo-500" /> 5. Default Court Schedule
          </h3>
          <select
            value={defaultSchedule}
            onChange={(e) => setDefaultSchedule(e.target.value)}
            className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-sans text-xs text-[var(--text-main)] focus:outline-none"
          >
            <option value="schedule_6_high_court">Schedule 6: High Court Litigation</option>
            <option value="schedule_7_arbitration">Schedule 7: Commercial Arbitration</option>
            <option value="schedule_5_subordinate">Schedule 5: Subordinate/Magistrate</option>
          </select>
        </div>

        {/* Feature 6: Drawing Folio Rate */}
        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <Calculator className="w-4 h-4 text-rose-500" /> 6. Drawing Folio Unit Rate (Kshs)
          </h3>
          <input
            type="number"
            value={drawingFolioRate}
            onChange={(e) => setDrawingFolioRate(parseInt(e.target.value))}
            className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs text-[var(--text-main)] focus:outline-none"
          />
        </div>

        {/* Feature 7: Copying Folio Rate */}
        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <Calculator className="w-4 h-4 text-teal-500" /> 7. Copying Folio Unit Rate (Kshs)
          </h3>
          <input
            type="number"
            value={copyingFolioRate}
            onChange={(e) => setCopyingFolioRate(parseInt(e.target.value))}
            className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs text-[var(--text-main)] focus:outline-none"
          />
        </div>

        {/* Feature 8: Court Attendance Rate */}
        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <Calculator className="w-4 h-4 text-orange-500" /> 8. Court Attendance Hourly Rate
          </h3>
          <input
            type="number"
            value={courtAttendanceRate}
            onChange={(e) => setCourtAttendanceRate(parseInt(e.target.value))}
            className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs text-[var(--text-main)] focus:outline-none"
          />
        </div>

        {/* Feature 9: Invoice Number Sequence */}
        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <FileText className="w-4 h-4 text-cyan-500" /> 9. Document Ref Prefix Sequence
          </h3>
          <input
            type="text"
            value={invoicePrefix}
            onChange={(e) => setInvoicePrefix(e.target.value)}
            className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs text-[var(--text-main)] focus:outline-none"
          />
        </div>

        {/* Feature 10: Auto-Save Frequency */}
        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <RefreshCw className="w-4 h-4 text-emerald-500" /> 10. Auto-Draft Saving Timer
          </h3>
          <select
            value={autoSaveFreq}
            onChange={(e) => setAutoSaveFreq(e.target.value)}
            className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs text-[var(--text-main)] focus:outline-none"
          >
            <option value="15">Every 15 Seconds</option>
            <option value="30">Every 30 Seconds</option>
            <option value="60">Every 1 Minute</option>
          </select>
        </div>

        {/* Feature 11: Currency Formatting */}
        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <DollarSign className="w-4 h-4 text-amber-500" /> 11. Global Legal Currency Formatter
          </h3>
          <select
            value={currencyFormat}
            onChange={(e) => setCurrencyFormat(e.target.value)}
            className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs text-[var(--text-main)] focus:outline-none"
          >
            <option value="KSHS">Kshs (Kenyan Shilling - KEK)</option>
            <option value="USD">USD ($ United States Dollar)</option>
            <option value="EUR">EUR (€ Euro)</option>
          </select>
        </div>

      </div>
    </div>
  );
};

export default AdminBocSettingsView;
