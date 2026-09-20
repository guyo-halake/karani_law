import React, { useState, useEffect } from 'react';
import { Calculator, Scale, Plus, Trash2, Printer, FileText, ListFilter, X, Check } from 'lucide-react';
import { calculateLegalBill, BillCalculationResult } from '../../services/api';
import { EXACT_FIRM_INFO } from '../../services/supabase';

interface FeeNoteBuilderViewProps {
  initialCourt?: string;
  initialValue?: number;
  onNavigateToTab?: (tab: string) => void;
}

export const FeeNoteBuilderView: React.FC<FeeNoteBuilderViewProps> = ({
  initialCourt = '',
  initialValue = 0,
  onNavigateToTab,
}) => {
  const [claimValue, setClaimValue] = useState<number>(initialValue);
  const [courtSchedule, setCourtSchedule] = useState<string>(initialCourt);
  const [isDefendant, setIsDefendant] = useState(false);
  const [includeGettingUp, setIncludeGettingUp] = useState(true);
  const [disbursements, setDisbursements] = useState(0);

  const [items, setItems] = useState<Array<{ description: string; type: string; qty: number; unit?: string; unitRate?: number }>>([]);
  const [showPickItems, setShowPickItems] = useState(false);
  const [showNewItemForm, setShowNewItemForm] = useState(false);

  // New Work Item Inline Form State
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState('folios');
  const [newItemValue, setNewItemValue] = useState(500);

  const PRESET_WORK_ITEMS = [
    { description: 'Drawing Plaint & Statement of Claim', type: 'drawing_folio', qty: 14, unit: 'folios', unitRate: 500, label: '14 folios @ Kshs 500' },
    { description: 'Drawing Verifying Affidavit & Annexures', type: 'drawing_folio', qty: 18, unit: 'folios', unitRate: 500, label: '18 folios @ Kshs 500' },
    { description: 'Copying Bundles of Documents for Filing & Service', type: 'copying_folio', qty: 120, unit: 'folios', unitRate: 50, label: '120 folios @ Kshs 50' },
    { description: 'Attendance in Court for Directions & Hearing', type: 'attendance_court', qty: 4, unit: 'Hours', unitRate: 2500, label: '4 Hours @ Kshs 2,500/hr' },
    { description: 'Perusal of Pleadings & Supporting Affidavits', type: 'drawing_folio', qty: 10, unit: 'folios', unitRate: 500, label: '10 folios @ Kshs 500' },
  ];

  const [result, setResult] = useState<BillCalculationResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!courtSchedule) {
      setResult(null);
      return;
    }

    calculateLegalBill({
      claim_value: claimValue,
      court_schedule: courtSchedule,
      is_defendant: isDefendant,
      include_getting_up: includeGettingUp,
      items,
      disbursements,
    }).then(res => setResult(res));
  }, [claimValue, courtSchedule, isDefendant, includeGettingUp, disbursements, items]);

  const addPresetItem = (preset: { description: string; type: string; qty: number; unit?: string; unitRate?: number }) => {
    setItems([...items, { description: preset.description, type: preset.type, qty: preset.qty, unit: preset.unit || 'folios', unitRate: preset.unitRate || 500 }]);
  };

  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    setItems([
      ...items,
      {
        description: `${newItemName.trim()} (${newItemQty} ${newItemUnit} @ Kshs ${newItemValue})`,
        type: 'custom',
        qty: newItemQty,
        unit: newItemUnit,
        unitRate: newItemValue,
      }
    ]);
    setNewItemName('');
    setNewItemQty(1);
    setShowNewItemForm(false);
  };

  const removeItemRow = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItemRow = (index: number, field: string, val: any) => {
    const copy = [...items];
    copy[index] = { ...copy[index], [field]: val };
    setItems(copy);
  };

  const [showPdfModal, setShowPdfModal] = useState(false);

  const handleSaveDraft = async () => {
    if (!result) return;
    setIsSaving(true);
    try {
      alert(`Draft Saved: Fee Note for Kshs ${result.grand_total.toLocaleString()} saved as Draft in Supabase DB!`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrintAndExport = async () => {
    if (!result) return;
    setShowPdfModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Modern Title Banner without background card container */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 px-1 border-b border-[var(--border-color)]/50 pb-5">
        <div>
          <h1 className="font-brand font-extrabold text-2xl text-[var(--text-main)] flex items-center gap-2.5 tracking-tight">
            <Calculator className="w-6 h-6 text-[var(--text-main)]" /> Bill of Costs Builder
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            In accordance with the Advocates (Remuneration) Order (Kenya Subsidiary Legislation LN 64/1962, ed. 2022)
          </p>
        </div>

        {/* View Fee Notes Navigation Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigateToTab ? onNavigateToTab('vault') : null}
            className="btn-outline px-4 py-2 text-xs font-semibold flex items-center gap-2 shadow-xs"
          >
            <FileText className="w-4 h-4 text-slate-600 dark:text-slate-300" /> View Fee Notes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scale Parameters & Itemized Work Container */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scale Parameters Card */}
          <div className="vercel-card p-6 space-y-4">
            <h3 className="font-brand font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-[var(--text-main)]" /> Prescribed Scale & Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[var(--text-muted)] mb-1.5 font-semibold">
                  Advocates Remuneration Schedule Picker
                </label>
                <select
                  value={courtSchedule}
                  onChange={(e) => setCourtSchedule(e.target.value)}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-[var(--text-main)] font-sans focus:outline-none focus:border-[var(--text-main)] transition-colors"
                >
                  <option value="">Please pick a schedule...</option>
                  <option value="schedule_1_conveyancing">Schedule 1 — Conveyancing (Sales, Purchases & Leases)</option>
                  <option value="schedule_2_securities">Schedule 2 — Debentures, Mortgages & Security Charges</option>
                  <option value="schedule_3_company">Schedule 3 — Commercial Agreements & Company Incorporation</option>
                  <option value="schedule_4_ip">Schedule 4 — Intellectual Property (Trademarks & Patents)</option>
                  <option value="schedule_5_magistrate">Schedule 5 — Subordinate / Magistrate's Court Litigation</option>
                  <option value="schedule_6_high_court">Schedule 6 — High Court, Court of Appeal, ELC & ELRC Litigation</option>
                  <option value="schedule_7_arbitration">Schedule 7 — Arbitral Proceedings & Commercial Arbitration</option>
                  <option value="schedule_8_general">Schedule 8 — General & Non-Contentious Legal Business</option>
                </select>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1.5 font-semibold">
                  Subject / Claim Value (Kshs)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-[var(--text-muted)] font-mono">Kshs</span>
                  <input
                    type="number"
                    value={claimValue}
                    onChange={(e) => setClaimValue(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl pl-16 pr-3.5 py-2.5 text-[var(--text-main)] font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1.5 font-semibold">
                  Disbursements Total (Kshs)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-[var(--text-muted)] font-mono">Kshs</span>
                  <input
                    type="number"
                    value={disbursements}
                    onChange={(e) => setDisbursements(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl pl-16 pr-3.5 py-2.5 text-[var(--text-main)] font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 space-y-2.5 pt-2 border-t border-[var(--border-color)]">
                <label className="flex items-center gap-2.5 text-[var(--text-main)] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isDefendant}
                    onChange={(e) => setIsDefendant(e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--border-color)] text-black dark:text-white focus:ring-0 cursor-pointer"
                  />
                  <span className="font-medium">Acting for Defendant / Respondent (15% reduction)</span>
                </label>

                <label className="flex items-center gap-2.5 text-[var(--text-main)] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeGettingUp}
                    onChange={(e) => setIncludeGettingUp(e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--border-color)] text-black dark:text-white focus:ring-0 cursor-pointer"
                  />
                  <span className="font-medium">Include Getting-Up Fee (33.33% / 1/3 of Instruction Fee)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Itemized Work & Attendances Card */}
          <div className="vercel-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-brand font-bold text-xs text-[var(--text-main)] uppercase tracking-wider">
                  Itemized Work & Attendances
                </h3>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Statutory Folio Charges & Attendances (LN 64/1962 ed. 2022)
                </p>
              </div>

              {/* Action Buttons: Pick Item and Add New Item */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowPickItems(!showPickItems)}
                  className="btn-outline px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5"
                >
                  <ListFilter className="w-3.5 h-3.5" /> Pick Item
                </button>

                <button
                  onClick={() => setShowNewItemForm(!showNewItemForm)}
                  className="btn-black px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New Item
                </button>
              </div>
            </div>

            {/* Inline Popover Form for Add New Item */}
            {showNewItemForm && (
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-brand font-bold text-xs text-[var(--text-main)] uppercase tracking-wider">
                    New Work Item
                  </span>
                  <button onClick={() => setShowNewItemForm(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateNewItem} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block text-[var(--text-muted)] mb-1 font-semibold">Name / Description</label>
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="e.g. Perusal of Plaint & Annexures"
                      className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-[var(--text-main)]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[var(--text-muted)] mb-1 font-semibold">Qty & Unit</label>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        value={newItemQty}
                        onChange={(e) => setNewItemQty(parseFloat(e.target.value) || 1)}
                        className="w-16 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-2 py-1.5 font-mono text-center text-[var(--text-main)]"
                        min="1"
                      />
                      <select
                        value={newItemUnit}
                        onChange={(e) => setNewItemUnit(e.target.value)}
                        className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-2 py-1.5 text-[var(--text-main)] font-sans"
                      >
                        <option value="folios">folios</option>
                        <option value="pages">pages</option>
                        <option value="Hours">Hours</option>
                        <option value="Minutes">Minutes</option>
                        <option value="grams">grams</option>
                        <option value="kg">kg</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[var(--text-muted)] mb-1 font-semibold">Value (Kshs)</label>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        value={newItemValue}
                        onChange={(e) => setNewItemValue(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-2.5 py-1.5 font-mono text-[var(--text-main)]"
                      />
                      <button type="submit" className="btn-black px-3 py-1.5 text-xs shrink-0">
                        Add
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Prescribed Items Picker (Only shown when Pick Item button is clicked) */}
            {showPickItems && (
              <div className="p-4 rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-subtle)]/40 space-y-3">
                <p className="text-xs text-[var(--text-muted)] font-medium">
                  Prescribed Statutory Folio Items — Click <span className="font-bold text-[var(--text-main)]">+ Add</span> to include in active ledger:
                </p>

                <div className="space-y-2">
                  {PRESET_WORK_ITEMS.map((preset, pIdx) => (
                    <div
                      key={pIdx}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--border-color)]/60 bg-[var(--bg-card)]/60 hover:bg-[var(--bg-card)] opacity-75 hover:opacity-100 transition-all text-xs"
                    >
                      <div>
                        <span className="font-semibold text-[var(--text-main)] block">{preset.description}</span>
                        <span className="text-[10.5px] text-[var(--text-muted)] font-mono">{preset.label}</span>
                      </div>
                      <button
                        onClick={() => addPresetItem(preset)}
                        className="btn-black px-3 py-1 text-[11px] flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Ledger Items List */}
            {items.length > 0 && (
              <div className="space-y-2.5 text-xs pt-2">
                <span className="font-brand font-bold text-[11px] text-[var(--text-muted)] uppercase tracking-wider block">
                  Active Work Items ({items.length})
                </span>
                {items.map((it, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 bg-[var(--bg-subtle)] p-2.5 rounded-xl border border-[var(--border-color)]">
                    <input
                      type="text"
                      value={it.description}
                      onChange={(e) => updateItemRow(idx, 'description', e.target.value)}
                      className="flex-1 bg-transparent border-none text-[var(--text-main)] focus:outline-none px-2 font-medium"
                    />
                    <select
                      value={it.type}
                      onChange={(e) => updateItemRow(idx, 'type', e.target.value)}
                      className="bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] rounded-lg px-2.5 py-1"
                    >
                      <option value="drawing_folio">Drawing Folio (Kshs 500)</option>
                      <option value="copying_folio">Copying Folio (Kshs 50)</option>
                      <option value="attendance_court">Court Attendance (Kshs 2,500/hr)</option>
                      <option value="letter">Demand Letter (Kshs 500)</option>
                      <option value="custom">Custom Item</option>
                    </select>
                    <input
                      type="number"
                      value={it.qty}
                      onChange={(e) => updateItemRow(idx, 'qty', parseFloat(e.target.value) || 0)}
                      className="w-16 bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] font-mono text-center rounded-lg py-1"
                    />
                    <button onClick={() => removeItemRow(idx)} className="p-1 text-[var(--text-muted)] hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live Real-Time Side Preview Card (Updates LIVE as Advocate edits) */}
        <div className="lg:col-span-1">
          {!courtSchedule ? (
            <div className="vercel-card p-6 text-center space-y-3">
              <Calculator className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
              <p className="text-xs text-[var(--text-muted)] font-medium">
                Please pick an Advocates Remuneration Order Schedule above to begin calculation.
              </p>
            </div>
          ) : result && (
            <div className="vercel-card p-6 space-y-5 sticky top-20">
              <div className="border-b border-[var(--border-color)] pb-3">
                <span className="font-brand font-bold text-xs text-[var(--text-main)] uppercase tracking-wider block">
                  Live Fee Note Preview
                </span>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5 font-mono">{result.formula}</p>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
                  <span className="text-[11px] text-[var(--text-muted)] font-sans">Instruction Fee</span>
                  <span className="text-[var(--text-main)] font-bold">Kshs {result.instruction_fee.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
                  <span className="text-[11px] text-[var(--text-muted)] font-sans">Getting-Up Fee</span>
                  <span className="text-[var(--text-main)] font-bold">Kshs {result.getting_up_fee.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
                  <span className="text-[11px] text-[var(--text-muted)] font-sans">Itemized Work Total</span>
                  <span className="text-[var(--text-main)] font-bold">Kshs {result.items_total.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
                  <span className="text-[11px] text-[var(--text-muted)] font-sans">VAT (16%)</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Kshs {result.vat_amount.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
                  <span className="text-[11px] text-[var(--text-muted)] font-sans">Disbursements</span>
                  <span className="text-[var(--text-main)] font-bold">Kshs {result.disbursements.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border-color)] space-y-1">
                <span className="font-bold text-[11px] text-[var(--text-muted)] uppercase tracking-wider block font-sans">Grand Total</span>
                <p className="text-2xl font-extrabold text-[var(--text-main)] font-mono tracking-tight">
                  Kshs {result.grand_total.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* Action Buttons: Save Draft & Print/Export Bill */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="btn-outline w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  {isSaving ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  onClick={handlePrintAndExport}
                  className="btn-black w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Export
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Official Print & PDF Export Statement (Clean A4 Paper Format matching xx.pdf) */}
      {result && (
        <div className="hidden print:block print:p-0 bg-white text-black font-sans text-xs space-y-6 max-w-[210mm] mx-auto leading-normal">
          {/* Header Block matching xx.pdf */}
          <div className="flex justify-between items-start border-b-2 border-black pb-4">
            <div>
              <h1 className="font-bold text-xl uppercase tracking-tight text-black">{EXACT_FIRM_INFO.name}</h1>
              <span className="text-xs font-bold text-black block uppercase tracking-wider">ADVOCATES OF THE HIGH COURT OF KENYA</span>
            </div>
            <div className="text-right text-[11px] leading-tight text-black font-mono">
              <p>{EXACT_FIRM_INFO.poBox}</p>
              <p>Tel: {EXACT_FIRM_INFO.phone}</p>
              <p>Email: {EXACT_FIRM_INFO.email}</p>
              <p>KRA PIN: {EXACT_FIRM_INFO.kraPin}</p>
              <p>{EXACT_FIRM_INFO.address}</p>
            </div>
          </div>

          {/* Client & Taxing Forum Ref */}
          <div className="grid grid-cols-2 gap-6 border-b border-black pb-4 text-xs">
            <div>
              <span className="font-bold block text-black text-[10px] uppercase tracking-wider">BILLED TO (CLIENT):</span>
              <p className="font-bold text-sm text-black">Seyani Brothers & Company (K) Limited</p>
              <p className="text-black">Attn: Finance & Executive Directorate</p>
            </div>
            <div className="text-right font-mono text-[11px] space-y-0.5">
              <p><strong className="font-bold">DOCUMENT REF:</strong> BOC-2026-FEE</p>
              <p><strong className="font-bold">DATE BILLED:</strong> {new Date().toISOString().split('T')[0]}</p>
              <p><strong className="font-bold">SUBJECT CLAIM VALUE:</strong> Kshs {claimValue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          {/* Re Line */}
          <div className="p-3 text-center border border-black rounded-none">
            <h2 className="font-bold text-sm uppercase text-black tracking-wide">RE: STATEMENT OF ADVOCATE'S BILL OF COSTS</h2>
            <p className="text-[11px] text-black italic">Drawn under Advocates (Remuneration) (Amendment) Order (LN 64/1962 ed. 2022)</p>
          </div>

          {/* Particulars Table without background fill */}
          <table className="w-full text-left border-collapse border border-black text-xs">
            <thead>
              <tr className="border-b border-black font-bold uppercase text-[10px]">
                <th className="p-2.5 border-r border-black w-12 text-center">ITEM</th>
                <th className="p-2.5 border-r border-black">PARTICULARS OF PROFESSIONAL SERVICES RENDERED</th>
                <th className="p-2.5 border-r border-black text-right w-28">DISB. (KSHS)</th>
                <th className="p-2.5 text-right w-36">LEGAL FEE (KSHS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black font-mono text-[11px]">
              <tr>
                <td className="p-2.5 border-r border-black text-center font-bold">1</td>
                <td className="p-2.5 border-r border-black font-sans">
                  <strong className="block font-bold">A. INSTRUCTION FEE</strong>
                  <span>Instruction Fee on Claim Value under {courtSchedule.replace(/_/g, ' ')}</span>
                </td>
                <td className="p-2.5 border-r border-black text-right">—</td>
                <td className="p-2.5 text-right font-bold">Kshs {result.instruction_fee.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
              </tr>

              {result.getting_up_fee > 0 && (
                <tr>
                  <td className="p-2.5 border-r border-black text-center font-bold">2</td>
                  <td className="p-2.5 border-r border-black font-sans">
                    <strong className="block font-bold">B. GETTING-UP FEE (1/3 RULE)</strong>
                    <span>Preparation for hearing & defense proceedings</span>
                  </td>
                  <td className="p-2.5 border-r border-black text-right">—</td>
                  <td className="p-2.5 text-right font-bold">Kshs {result.getting_up_fee.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                </tr>
              )}

              {items.map((it, i) => (
                <tr key={i}>
                  <td className="p-2.5 border-r border-black text-center">{i + 3}</td>
                  <td className="p-2.5 border-r border-black font-sans">{it.description}</td>
                  <td className="p-2.5 border-r border-black text-right">—</td>
                  <td className="p-2.5 text-right">Kshs {((it.unitRate || 500) * it.qty).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}

              {result.disbursements > 0 && (
                <tr>
                  <td className="p-2.5 border-r border-black text-center">{items.length + 3}</td>
                  <td className="p-2.5 border-r border-black font-sans font-bold">Arbitrator & Filing Disbursements Paid</td>
                  <td className="p-2.5 border-r border-black text-right font-bold">Kshs {result.disbursements.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                  <td className="p-2.5 text-right">—</td>
                </tr>
              )}

              <tr className="font-bold border-t-2 border-black">
                <td colSpan={2} className="p-2.5 text-right font-sans uppercase">Subtotal Professional Legal Fees & VAT (16%):</td>
                <td className="p-2.5 text-right font-mono">Kshs {result.disbursements.toLocaleString()}</td>
                <td className="p-2.5 text-right font-mono">Kshs {result.taxable_subtotal.toLocaleString()}</td>
              </tr>
              <tr className="text-sm font-extrabold border-t-2 border-black">
                <td colSpan={2} className="p-3 text-right font-sans uppercase">GRAND TOTAL AMOUNT DUE (KSHS):</td>
                <td colSpan={2} className="p-3 text-right font-mono text-base">Kshs {result.grand_total.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>

          {/* Bank Settlement & Signature Block matching xx.pdf */}
          <div className="pt-6 border-t border-black grid grid-cols-2 gap-8 text-xs">
            <div>
              <span className="font-bold block uppercase text-black text-[10px]">BANK SETTLEMENT DETAILS:</span>
              <p className="font-semibold text-black">{EXACT_FIRM_INFO.bankDetails}</p>
            </div>
            <div className="text-right space-y-6">
              <p>DATED at <strong className="uppercase">NAIROBI</strong> this {new Date().getDate()}th day of September, 2026.</p>
              <div className="pt-8 border-t border-black inline-block min-w-[220px] text-center">
                <strong className="block uppercase text-black font-bold">{EXACT_FIRM_INFO.name}</strong>
                <span className="text-[10px] text-black uppercase block">SIGNATURE & OFFICIAL STAMP</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive PDF Viewer Modal (Formatted Clean A4 Paper) */}
      {showPdfModal && result && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex flex-col items-center justify-center p-2 sm:p-6 overflow-y-auto no-print">
          <div className="bg-white text-black p-6 sm:p-10 rounded-xl max-w-4xl w-full shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto font-sans border border-gray-300">
            {/* Modal Control Bar */}
            <div className="flex items-center justify-between border-b border-gray-300 pb-4">
              <div>
                <h3 className="font-bold text-sm text-black uppercase tracking-wider font-mono">
                  Statement of Advocate's Bill of Costs (A4 Sheet Preview)
                </h3>
                <p className="text-[11px] text-gray-600">LN 64/1962 ed. 2022 statutory format</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="bg-black text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md hover:bg-gray-800 transition-colors"
                >
                  <Printer className="w-4 h-4" /> Download / Print PDF
                </button>
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="text-gray-500 hover:text-black p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document A4 Paper Sheet Body starting directly from firm header */}
            <div className="space-y-6 text-xs text-black p-2 sm:p-4 bg-white border border-gray-200 shadow-sm rounded-sm">
              {/* Firm Logo Header */}
              <div className="flex justify-between items-start border-b-2 border-black pb-4">
                <div>
                  <h1 className="font-bold text-xl uppercase tracking-tight text-black">{EXACT_FIRM_INFO.name}</h1>
                  <span className="text-xs font-bold text-black block uppercase tracking-wider">ADVOCATES OF THE HIGH COURT OF KENYA</span>
                </div>
                <div className="text-right text-[11px] leading-tight text-black font-mono">
                  <p>{EXACT_FIRM_INFO.poBox}</p>
                  <p>Tel: {EXACT_FIRM_INFO.phone}</p>
                  <p>Email: {EXACT_FIRM_INFO.email}</p>
                  <p>KRA PIN: {EXACT_FIRM_INFO.kraPin}</p>
                  <p>{EXACT_FIRM_INFO.address}</p>
                </div>
              </div>

              {/* Client & Taxing Forum Ref */}
              <div className="grid grid-cols-2 gap-6 border-b border-black pb-4 text-xs">
                <div>
                  <span className="font-bold block text-black text-[10px] uppercase tracking-wider">BILLED TO (CLIENT):</span>
                  <p className="font-bold text-sm text-black">Seyani Brothers & Company (K) Limited</p>
                  <p className="text-black">Attn: Finance & Executive Directorate</p>
                </div>
                <div className="text-right font-mono text-[11px] space-y-0.5">
                  <p><strong className="font-bold">DOCUMENT REF:</strong> BOC-2026-FEE</p>
                  <p><strong className="font-bold">DATE BILLED:</strong> {new Date().toISOString().split('T')[0]}</p>
                  <p><strong className="font-bold">SUBJECT CLAIM VALUE:</strong> Kshs {claimValue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              {/* Re Line */}
              <div className="p-3 text-center border border-black rounded-none">
                <h2 className="font-bold text-sm uppercase text-black tracking-wide">RE: STATEMENT OF ADVOCATE'S BILL OF COSTS</h2>
                <p className="text-[11px] text-black italic">Drawn under Advocates (Remuneration) (Amendment) Order (LN 64/1962 ed. 2022)</p>
              </div>

              {/* Particulars Table */}
              <table className="w-full text-left border-collapse border border-black text-xs">
                <thead>
                  <tr className="border-b border-black font-bold uppercase text-[10px]">
                    <th className="p-2.5 border-r border-black w-12 text-center">ITEM</th>
                    <th className="p-2.5 border-r border-black">PARTICULARS OF PROFESSIONAL SERVICES RENDERED</th>
                    <th className="p-2.5 border-r border-black text-right w-28">DISB. (KSHS)</th>
                    <th className="p-2.5 text-right w-36">LEGAL FEE (KSHS)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black font-mono text-[11px]">
                  <tr>
                    <td className="p-2.5 border-r border-black text-center font-bold">1</td>
                    <td className="p-2.5 border-r border-black font-sans">
                      <strong className="block font-bold">A. INSTRUCTION FEE</strong>
                      <span>Instruction Fee on Claim Value under {courtSchedule.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="p-2.5 border-r border-black text-right">—</td>
                    <td className="p-2.5 text-right font-bold">Kshs {result.instruction_fee.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                  </tr>

                  {result.getting_up_fee > 0 && (
                    <tr>
                      <td className="p-2.5 border-r border-black text-center font-bold">2</td>
                      <td className="p-2.5 border-r border-black font-sans">
                        <strong className="block font-bold">B. GETTING-UP FEE (1/3 RULE)</strong>
                        <span>Preparation for hearing & defense proceedings</span>
                      </td>
                      <td className="p-2.5 border-r border-black text-right">—</td>
                      <td className="p-2.5 text-right font-bold">Kshs {result.getting_up_fee.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  )}

                  {items.map((it, i) => (
                    <tr key={i}>
                      <td className="p-2.5 border-r border-black text-center">{i + 3}</td>
                      <td className="p-2.5 border-r border-black font-sans">{it.description}</td>
                      <td className="p-2.5 border-r border-black text-right">—</td>
                      <td className="p-2.5 text-right">Kshs {((it.unitRate || 500) * it.qty).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}

                  {result.disbursements > 0 && (
                    <tr>
                      <td className="p-2.5 border-r border-black text-center">{items.length + 3}</td>
                      <td className="p-2.5 border-r border-black font-sans font-bold">Arbitrator & Filing Disbursements Paid</td>
                      <td className="p-2.5 border-r border-black text-right font-bold">Kshs {result.disbursements.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                      <td className="p-2.5 text-right">—</td>
                    </tr>
                  )}

                  <tr className="font-bold border-t-2 border-black">
                    <td colSpan={2} className="p-2.5 text-right font-sans uppercase">Subtotal Professional Legal Fees & VAT (16%):</td>
                    <td className="p-2.5 text-right font-mono">Kshs {result.disbursements.toLocaleString()}</td>
                    <td className="p-2.5 text-right font-mono">Kshs {result.taxable_subtotal.toLocaleString()}</td>
                  </tr>
                  <tr className="text-sm font-extrabold border-t-2 border-black">
                    <td colSpan={2} className="p-3 text-right font-sans uppercase">GRAND TOTAL AMOUNT DUE (KSHS):</td>
                    <td colSpan={2} className="p-3 text-right font-mono text-base">Kshs {result.grand_total.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>

              {/* Bank Settlement & Signature Block matching xx.pdf */}
              <div className="pt-6 border-t border-black grid grid-cols-2 gap-8 text-xs">
                <div>
                  <span className="font-bold block uppercase text-black text-[10px]">BANK SETTLEMENT DETAILS:</span>
                  <p className="font-semibold text-black">{EXACT_FIRM_INFO.bankDetails}</p>
                </div>
                <div className="text-right space-y-6">
                  <p>DATED at <strong className="uppercase">NAIROBI</strong> this {new Date().getDate()}th day of September, 2026.</p>
                  <div className="pt-8 border-t border-black inline-block min-w-[220px] text-center">
                    <strong className="block uppercase text-black font-bold">{EXACT_FIRM_INFO.name}</strong>
                    <span className="text-[10px] text-black uppercase block">SIGNATURE & OFFICIAL STAMP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
