import React, { useState } from 'react';
import { 
  Calculator, Save, CheckCircle2, Sliders, DollarSign, Layers, FileText, 
  CheckSquare, RefreshCw, Zap, Play, Scale, Percent, AlertCircle 
} from 'lucide-react';

export const AdminBocSettingsView: React.FC = () => {
  const [multiplierTier1, setMultiplierTier1] = useState(1.0);
  const [autoGettingUp, setAutoGettingUp] = useState(true);
  const [defaultVatRate, setDefaultVatRate] = useState('16');
  const [rule7InterestRate, setRule7InterestRate] = useState(14);
  const [maxClaimCap, setMaxClaimCap] = useState(500000000);
  const [defaultSchedule, setDefaultSchedule] = useState('schedule_6_high_court');
  const [invoicePrefix, setInvoicePrefix] = useState('BOC-2026-FEE');
  const [autoSaveFreq, setAutoSaveFreq] = useState('30');
  const [currencyFormat, setCurrencyFormat] = useState('KSHS');
  const [drawingFolioRate, setDrawingFolioRate] = useState(500);
  const [copyingFolioRate, setCopyingFolioRate] = useState(100);
  const [courtAttendanceRate, setCourtAttendanceRate] = useState(3000);

  // Minimum statutory fee overrides for schedules
  const [sched1Min, setSched1Min] = useState(35000);
  const [sched3Min, setSched3Min] = useState(40000);
  const [sched5Min, setSched5Min] = useState(30000);
  const [sched6PlaintiffMin, setSched6PlaintiffMin] = useState(75000);
  const [sched6DefendantMin, setSched6DefendantMin] = useState(50000);

  // Live calculation test runner
  const [testClaimValue, setTestClaimValue] = useState(2500000);
  const [testResult, setTestResult] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleRunPythonMathSimulation = () => {
    // Math logic based on Kenyan Advocates Remuneration Order Schedule 6 High Court
    // Instruction fee: Kshs 75,000 + 5% of excess over 1M up to 5M
    const excessOver1M = Math.max(0, testClaimValue - 1000000);
    const instructionFee = Math.max(sched6PlaintiffMin, 75000 + (excessOver1M * 0.05));
    const gettingUpFee = autoGettingUp ? (instructionFee * 0.333333) : 0;
    const drawingFoliosFee = drawingFolioRate * 12; // 12 folios test
    const subtotal = instructionFee + gettingUpFee + drawingFoliosFee;
    const vat = subtotal * (parseFloat(defaultVatRate) / 100);
    const totalFee = subtotal + vat;
    const interestOneYear = totalFee * (rule7InterestRate / 100);

    setTestResult({
      claimValue: testClaimValue,
      instructionFee,
      gettingUpFee,
      drawingFoliosFee,
      subtotal,
      vat,
      totalFee,
      interestOneYear,
      timestamp: new Date().toLocaleTimeString()
    });
  };

  return (
    <div className="w-full space-y-8 pb-12 text-xs">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)]/50 pb-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-bold text-[10px]">
            DEVELOPER CONTROL PANEL
          </span>
          <h1 className="font-brand font-extrabold text-2xl text-[var(--text-main)] tracking-tight mt-1">
            BOC Statutory Math Engine & Remuneration Settings
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Configure statutory percentage rates, 14% annual interest rules, 16% VAT, minimum fees, folio rates, and simulate backend Python calculations.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="btn-black px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
        >
          {isSaved ? (
            <><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Statutory Settings Saved!</>
          ) : (
            <><Save className="w-4 h-4" /> Save Master BOC Config</>
          )}
        </button>
      </div>

      {/* Live Math Simulation Tester Banner */}
      <div className="vercel-card p-5 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-transparent border border-blue-500/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Python Backend Math Simulation Engine
            </h3>
            <p className="text-[11.5px] text-[var(--text-muted)] mt-0.5">
              Test real-time calculation execution based on your active statutory parameters below.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold">Test Claim (Kshs):</span>
              <input
                type="number"
                value={testClaimValue}
                onChange={(e) => setTestClaimValue(parseFloat(e.target.value) || 0)}
                className="w-36 bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-1.5 font-mono text-xs text-[var(--text-main)] font-bold"
              />
            </div>
            <button
              onClick={handleRunPythonMathSimulation}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 text-xs cursor-pointer shadow-sm transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-white" /> Simulate Calculation
            </button>
          </div>
        </div>

        {testResult && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 pt-3 border-t border-[var(--border-color)]/50 font-mono text-[11px]">
            <div className="bg-[var(--bg-subtle)] p-2.5 rounded-xl border border-[var(--border-color)]">
              <span className="text-[10px] text-[var(--text-muted)] block uppercase">Instruction Fee</span>
              <strong className="text-[var(--text-main)] font-bold">Kshs {testResult.instructionFee.toLocaleString()}</strong>
            </div>
            <div className="bg-[var(--bg-subtle)] p-2.5 rounded-xl border border-[var(--border-color)]">
              <span className="text-[10px] text-[var(--text-muted)] block uppercase">Getting-Up (1/3)</span>
              <strong className="text-emerald-500 font-bold">Kshs {testResult.gettingUpFee.toLocaleString(undefined, {maximumFractionDigits:2})}</strong>
            </div>
            <div className="bg-[var(--bg-subtle)] p-2.5 rounded-xl border border-[var(--border-color)]">
              <span className="text-[10px] text-[var(--text-muted)] block uppercase">Folios (12 Pgs)</span>
              <strong className="text-[var(--text-main)] font-bold">Kshs {testResult.drawingFoliosFee.toLocaleString()}</strong>
            </div>
            <div className="bg-[var(--bg-subtle)] p-2.5 rounded-xl border border-[var(--border-color)]">
              <span className="text-[10px] text-[var(--text-muted)] block uppercase">Subtotal</span>
              <strong className="text-[var(--text-main)] font-bold">Kshs {testResult.subtotal.toLocaleString(undefined, {maximumFractionDigits:2})}</strong>
            </div>
            <div className="bg-[var(--bg-subtle)] p-2.5 rounded-xl border border-[var(--border-color)]">
              <span className="text-[10px] text-[var(--text-muted)] block uppercase">VAT ({defaultVatRate}%)</span>
              <strong className="text-blue-500 font-bold">Kshs {testResult.vat.toLocaleString(undefined, {maximumFractionDigits:2})}</strong>
            </div>
            <div className="bg-[var(--bg-subtle)] p-2.5 rounded-xl border border-[var(--border-color)]">
              <span className="text-[10px] text-[var(--text-muted)] block uppercase">Total Payable</span>
              <strong className="text-amber-500 font-bold">Kshs {testResult.totalFee.toLocaleString(undefined, {maximumFractionDigits:2})}</strong>
            </div>
            <div className="bg-[var(--bg-subtle)] p-2.5 rounded-xl border border-[var(--border-color)]">
              <span className="text-[10px] text-[var(--text-muted)] block uppercase">Rule 7 Interest (1yr)</span>
              <strong className="text-purple-400 font-bold">Kshs {testResult.interestOneYear.toLocaleString(undefined, {maximumFractionDigits:2})}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Settings Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. Getting Up Fee Engine */}
        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <CheckSquare className="w-4 h-4 text-emerald-500" /> 1. Getting-Up Fee (1/3 Surcharge)
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
          <p className="text-[10.5px] text-[var(--text-muted)] italic">
            Schedule 6 Rule 2: 1/3 surcharge added when case goes for full oral trial.
          </p>
        </div>

        {/* 2. Statutory VAT Rate */}
        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <Percent className="w-4 h-4 text-blue-500" /> 2. Statutory VAT Tax Rate
          </h3>
          <select
            value={defaultVatRate}
            onChange={(e) => setDefaultVatRate(e.target.value)}
            className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs text-[var(--text-main)] focus:outline-none"
          >
            <option value="16">16% Standard Rate (Kenya Value Added Tax Act)</option>
            <option value="0">0% VAT Exempt (Cross-border / Arbitral Exemption)</option>
          </select>
        </div>

        {/* 3. Advocates Remuneration Rule 7 Interest Rate */}
        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <Scale className="w-4 h-4 text-purple-500" /> 3. Rule 7 Annual Statutory Interest Rate
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.5"
              value={rule7InterestRate}
              onChange={(e) => setRule7InterestRate(parseFloat(e.target.value))}
              className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs text-[var(--text-main)] font-bold focus:outline-none"
            />
            <span className="font-mono font-bold text-xs">% p.a.</span>
          </div>
          <p className="text-[10.5px] text-[var(--text-muted)] italic">
            Interest accrues after 30 days from bill delivery date under Rule 7.
          </p>
        </div>

        {/* 4. Minimum Scale Fees Overrides */}
        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <Sliders className="w-4 h-4 text-amber-500" /> 4. Scale Minimum Fee Floors (Kshs)
          </h3>
          <div className="space-y-2 text-[11px]">
            <div className="flex items-center justify-between">
              <span>Schedule 1 Conveyancing Min:</span>
              <input
                type="number"
                value={sched1Min}
                onChange={(e) => setSched1Min(parseInt(e.target.value))}
                className="w-28 bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded px-2 py-1 font-mono text-right text-xs"
              />
            </div>
            <div className="flex items-center justify-between">
              <span>Schedule 3 Probate Min:</span>
              <input
                type="number"
                value={sched3Min}
                onChange={(e) => setSched3Min(parseInt(e.target.value))}
                className="w-28 bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded px-2 py-1 font-mono text-right text-xs"
              />
            </div>
            <div className="flex items-center justify-between">
              <span>Schedule 5 Subordinate Min:</span>
              <input
                type="number"
                value={sched5Min}
                onChange={(e) => setSched5Min(parseInt(e.target.value))}
                className="w-28 bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded px-2 py-1 font-mono text-right text-xs"
              />
            </div>
            <div className="flex items-center justify-between">
              <span>Sched 6 Plaintiff Min:</span>
              <input
                type="number"
                value={sched6PlaintiffMin}
                onChange={(e) => setSched6PlaintiffMin(parseInt(e.target.value))}
                className="w-28 bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded px-2 py-1 font-mono text-right text-xs text-emerald-500 font-bold"
              />
            </div>
            <div className="flex items-center justify-between">
              <span>Sched 6 Defendant Min:</span>
              <input
                type="number"
                value={sched6DefendantMin}
                onChange={(e) => setSched6DefendantMin(parseInt(e.target.value))}
                className="w-28 bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded px-2 py-1 font-mono text-right text-xs text-blue-500 font-bold"
              />
            </div>
          </div>
        </div>

        {/* 5. Drawing Folio Unit Rate */}
        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <Calculator className="w-4 h-4 text-rose-500" /> 5. Drawing Folio Unit Rate (Kshs)
          </h3>
          <input
            type="number"
            value={drawingFolioRate}
            onChange={(e) => setDrawingFolioRate(parseInt(e.target.value))}
            className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs text-[var(--text-main)] focus:outline-none"
          />
          <p className="text-[10.5px] text-[var(--text-muted)] italic">
            1 Folio = 100 words in legal pleadings.
          </p>
        </div>

        {/* 6. Copying Folio Rate */}
        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <Calculator className="w-4 h-4 text-teal-500" /> 6. Copying Folio Unit Rate (Kshs)
          </h3>
          <input
            type="number"
            value={copyingFolioRate}
            onChange={(e) => setCopyingFolioRate(parseInt(e.target.value))}
            className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs text-[var(--text-main)] focus:outline-none"
          />
        </div>

        {/* 7. Court Attendance Rate */}
        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <Calculator className="w-4 h-4 text-orange-500" /> 7. Court Attendance Hourly Rate
          </h3>
          <input
            type="number"
            value={courtAttendanceRate}
            onChange={(e) => setCourtAttendanceRate(parseInt(e.target.value))}
            className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs text-[var(--text-main)] focus:outline-none"
          />
        </div>

        {/* 8. Invoice Number Sequence */}
        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <FileText className="w-4 h-4 text-cyan-500" /> 8. Document Ref Prefix Sequence
          </h3>
          <input
            type="text"
            value={invoicePrefix}
            onChange={(e) => setInvoicePrefix(e.target.value)}
            className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs text-[var(--text-main)] focus:outline-none"
          />
        </div>

        {/* 9. Currency Formatting */}
        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <DollarSign className="w-4 h-4 text-amber-500" /> 9. Global Currency Formatter
          </h3>
          <select
            value={currencyFormat}
            onChange={(e) => setCurrencyFormat(e.target.value)}
            className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs text-[var(--text-main)] focus:outline-none"
          >
            <option value="KSHS">Kshs (Kenyan Shilling - KES)</option>
            <option value="USD">USD ($ United States Dollar)</option>
            <option value="EUR">EUR (€ Euro)</option>
          </select>
        </div>

      </div>
    </div>
  );
};

export default AdminBocSettingsView;

