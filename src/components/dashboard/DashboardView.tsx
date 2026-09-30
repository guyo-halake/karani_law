import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  Briefcase,
  TrendingUp,
  Filter,
  ChevronDown,
  Plus,
  UserPlus,
  Calculator,
  FileText,
  DollarSign,
  ChevronRight,
  Sparkles,
  FileCode,
  Eye,
  EyeOff,
  FileEdit
} from 'lucide-react';

import { EXACT_MATTERS, EXACT_CLIENTS, EXACT_FIRM_INFO, SystemUser, saveFeeNotes, ExactFeeNoteRecord, getFeeNotes, persistFeeNotes } from '../../services/supabase';
import { ManagingPartnerGodMode } from '../admin/ManagingPartnerGodMode';
import { 
  calculate_schedule_1_conveyancing,
  calculate_schedule_2_debentures,
  calculate_schedule_3_probate,
  calculate_schedule_4_ip,
  calculate_schedule_5_subordinate,
  calculate_schedule_6_high_court,
  calculate_schedule_7_secondary,
  calculate_schedule_8_tribunals,
  calculate_schedule_9_arbitration,
  calculate_schedule_10_criminal,
  calculate_schedule_11_itemized
} from '../../engine/remuneration_engine';

import * as XLSX from 'xlsx';

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
  onNavigateToBuilder?: (arg1?: any, arg2?: any) => void;
  onOpenRecents?: () => void;
  currentUser?: SystemUser | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onNavigateToBuilder,
  onOpenRecents,
  currentUser,
}) => {
  const [selectedBarIndex, setSelectedBarIndex] = useState(0);
  const [showPortfolioGraph, setShowPortfolioGraph] = useState<boolean>(() => {
    return localStorage.getItem('BILLSZIP_SHOW_GRAPH') === 'true';
  });

  // Dynamic Real-time Fee Notes State
  const [feeNotes, setFeeNotes] = useState<ExactFeeNoteRecord[]>(() => getFeeNotes());

  // Matter Table Checkbox Selection State (none checked by default)
  const [selectedMatterIds, setSelectedMatterIds] = useState<string[]>([]);

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

  const handleToggleAllMatters = () => {
    if (selectedMatterIds.length === EXACT_MATTERS.length) {
      setSelectedMatterIds([]);
    } else {
      setSelectedMatterIds(EXACT_MATTERS.map(m => m.id));
    }
  };

  const handleToggleMatter = (id: string) => {
    setSelectedMatterIds(prev => 
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };

  // Excel Import State
  const [showExcelImport, setShowExcelImport] = useState(false);
  const [excelData, setExcelData] = useState<any[]>([]);
  const [excelFileName, setExcelFileName] = useState('');
  const [parsedMeta, setParsedMeta] = useState<{
    claimantName?: string;
    respondentName?: string;
    judgeName?: string;
    matterTitle?: string;
    forumName?: string;
    grandTotal?: number;
    courtSchedule?: string;
  }>({});

  const isDuplicate = feeNotes.some(fn => 
    fn.matterTitle === excelFileName.replace('.xlsx', '') || 
    (fn.excelUrl && fn.excelUrl.includes(excelFileName))
  );

  const formatExcelDate = (val: any) => {
    if (val === null || val === undefined || val === '') return '';
    if (typeof val === 'number' && val > 25000 && val < 65000) {
      const d = new Date(Math.round((val - 25569) * 86400 * 1000));
      const day = String(d.getUTCDate()).padStart(2, '0');
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const year = d.getUTCFullYear();
      return `${day}/${month}/${year}`;
    }
    return String(val).trim();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      if (bstr) {
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const allRows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true });

        // 1. Find Header Row (where first column or any cell has 'DATE')
        let headerRowIndex = -1;
        for (let i = 0; i < Math.min(15, allRows.length); i++) {
          const row = allRows[i];
          if (row && row.some(cell => typeof cell === 'string' && cell.trim().toUpperCase().includes('DATE'))) {
            headerRowIndex = i;
            break;
          }
        }

        const metaRows = headerRowIndex !== -1 ? allRows.slice(0, headerRowIndex) : [];
        const rawDataRows = headerRowIndex !== -1 ? allRows.slice(headerRowIndex + 1) : allRows;

        // Extract metadata from metaRows
        let forumName = '';
        let matterTitle = '';
        let claimantName = '';
        let respondentName = '';
        let judgeName = '';
        let courtSchedule = 'Schedule 6 — High Court / Arbitration';

        const metaLines: string[] = [];
        metaRows.forEach(r => {
          (r || []).forEach(c => {
            if (c) {
              String(c).split(/[\r\n]+/).forEach(l => {
                const trimmed = l.trim();
                if (trimmed) metaLines.push(trimmed);
              });
            }
          });
        });

        const forumParts: string[] = [];
        for (const line of metaLines) {
          const u = line.toUpperCase();
          if (u.includes('REPUBLIC OF KENYA') || u.includes('ARBITRATION ACT') || u.includes('HIGH COURT') || u.includes('COMMERCIAL AND')) {
            forumParts.push(line);
          } else if (u.includes('DISPUTE') || u.includes('CONTRACT FOR') || u.includes('CIVIL CASE')) {
            matterTitle = line;
          } else if (u.includes('CLAIMANT') || u.includes('PLAINTIFF')) {
            const cleaned = line.replace(/[\.\s…\-_]*(CLAIMANT|PLAINTIFF).*$/i, '').replace(/^(BETWEEN\s*)/i, '').trim();
            if (cleaned) claimantName = cleaned;
          } else if (u.includes('RESPONDENT') || u.includes('DEFENDANT')) {
            const cleaned = line.replace(/[\.\s…\-_]*(RESPONDENT|DEFENDANT|1ST DEFENDANT).*$/i, '').replace(/^(AND\s*|VERSUS\s*)/i, '').trim();
            if (cleaned) respondentName = cleaned;
          } else if (u.includes('BEFORE') || u.includes('ARCH.') || u.includes('HON.') || u.includes('JUSTICE') || u.includes('FCIARB') || u.includes('MCIARB')) {
            judgeName = line;
          } else if (u.includes('SCHEDULE')) {
            courtSchedule = line;
          }
        }
        if (forumParts.length > 0) {
          forumName = forumParts.join('\\n');
        }

        // 2. Cut off trailing Signature block rows from table
        let signatureIndex = rawDataRows.length;
        for (let i = 0; i < rawDataRows.length; i++) {
          const r = rawDataRows[i];
          const text = (r || []).map(c => String(c || '')).join(' ').toUpperCase();
          if (text.includes('DATED AT') || text.includes('DRAWN & FILED') || text.includes('TO BE SERVED') || text.includes('TO BE FILED')) {
            signatureIndex = i;
            break;
          }
        }

        const tableRows = rawDataRows.slice(0, signatureIndex).filter(r => r && r.length > 0 && r.some(c => c !== null && c !== undefined && c !== ''));

        // 3. Find Grand Total
        let grandTotal = 0;
        for (let i = tableRows.length - 1; i >= 0; i--) {
          const r = tableRows[i];
          const text = (r || []).map(c => String(c || '')).join(' ').toUpperCase();
          if (text.includes('GRAND TOTAL') || text.includes('TOTAL')) {
            for (let j = r.length - 1; j >= 0; j--) {
              const val = Number(r[j]);
              if (!isNaN(val) && val > 0) {
                grandTotal = val;
                break;
              }
            }
            if (grandTotal > 0) break;
          }
        }

        // 4. Clean table rows (format serial dates, safe numbers)
        const cleanedTableRows = tableRows.map(r => {
          const rowCopy = [...r];
          rowCopy[0] = formatExcelDate(rowCopy[0]);
          return rowCopy;
        });

        setExcelData(cleanedTableRows);
        setParsedMeta({
          claimantName,
          respondentName,
          judgeName,
          matterTitle: matterTitle || file.name.replace('.xlsx', ''),
          forumName: forumName || 'REPUBLIC OF KENYA\\nIN THE MATTER OF THE ARBITRATION ACT 1995',
          grandTotal: grandTotal || 0,
          courtSchedule: courtSchedule || 'Schedule 6 — High Court / Arbitration'
        });
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleConfirmSave = () => {
    const totalAmount = parsedMeta.grandTotal || 0;

    const newFeeNote: ExactFeeNoteRecord = {
      id: "fn-import-" + Date.now(),
      billNumber: "BOC-IMPORT-" + Date.now().toString().slice(-4),
      matterId: "imported-matter",
      matterTitle: parsedMeta.matterTitle || excelFileName.replace('.xlsx', ''),
      clientName: parsedMeta.claimantName || "Imported Client",
      claimantName: parsedMeta.claimantName || "",
      respondentName: parsedMeta.respondentName || "",
      judgeName: parsedMeta.judgeName || "",
      forumName: parsedMeta.forumName || "",
      courtSchedule: parsedMeta.courtSchedule || "Schedule 6 — High Court / Arbitration",
      claimValue: 0,
      instructionFee: 0,
      gettingUpFee: 0,
      grandTotal: totalAmount,
      status: "processed" as const,
      generatedByUser: currentUser?.fullName || "Admin",
      generatedByUserId: currentUser?.id || "usr-admin",
      createdAt: new Date().toLocaleString(),
      pdfUrl: "",
      excelUrl: excelFileName,
      excelData: excelData
    };
    
    const updated = [newFeeNote, ...feeNotes];
    persistFeeNotes(updated);
    setFeeNotes(updated);
    alert("Successfully imported " + excelData.length + " line items (Grand Total: Kshs " + totalAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 }) + ") and saved to Database!");
    setShowExcelImport(false);
    setExcelData([]);
    setExcelFileName('');
    setParsedMeta({});
  };

  // Quick Quote Estimator State
  const [showBocCalc, setShowBocCalc] = useState(true);
  const [qqCategory, setQqCategory] = useState('high_court_plaintiff');
  const [qqValue, setQqValue] = useState<number | ''>('');

  const getQuickQuoteFee = () => {
    const val = Number(qqValue) || 0;
    
    switch(qqCategory) {
      case 'sch1_purchaser': return calculate_schedule_1_conveyancing(val, 'purchaser').raw_calculated_fee;
      case 'sch1_vendor': return calculate_schedule_1_conveyancing(val, 'vendor').raw_calculated_fee;
      case 'sch2_lender': return calculate_schedule_2_debentures(val, 'lender').raw_calculated_fee;
      case 'sch2_borrower': return calculate_schedule_2_debentures(val, 'borrower').raw_calculated_fee;
      case 'sch3_probate': return calculate_schedule_3_probate(val).raw_calculated_fee;
      case 'sch4_ip_tm': return calculate_schedule_4_ip('trademark_reg').raw_calculated_fee;
      case 'sch4_ip_opp': return calculate_schedule_4_ip('opposition').raw_calculated_fee;
      case 'sch5_subordinate': return calculate_schedule_5_subordinate(val).raw_calculated_fee;
      case 'high_court_plaintiff': return calculate_schedule_6_high_court(val, false).raw_calculated_fee;
      case 'high_court_defendant': return calculate_schedule_6_high_court(val, true).raw_calculated_fee;
      case 'sch7_secondary': return calculate_schedule_7_secondary().raw_calculated_fee;
      case 'sch8_tribunals': return calculate_schedule_8_tribunals().raw_calculated_fee;
      case 'sch9_arbitration': return calculate_schedule_9_arbitration(val).raw_calculated_fee;
      case 'sch10_criminal': return calculate_schedule_10_criminal().raw_calculated_fee;
      case 'sch11_itemized': return calculate_schedule_11_itemized().raw_calculated_fee;
      default: return 0;
    }
  };

  const userName = currentUser?.advocateTitle || currentUser?.fullName || EXACT_FIRM_INFO.user.name;

  // Real Dynamic Computations based on live database state
  const pendingTaxationsCount = EXACT_MATTERS.filter(
    (m) => m.status.toLowerCase().includes('taxation') || m.status.toLowerCase().includes('ready')
  ).length;

  const processedTodayCount = feeNotes.filter(
    (fn) => fn.status === 'processed'
  ).length;

  const untaxedDraftsCount = feeNotes.filter(
    (fn) => fn.status === 'draft'
  ).length;

  const totalMattersCount = EXACT_MATTERS.length;

  const totalPortfolioValue = EXACT_MATTERS.reduce(
    (sum, m) => sum + (m.amount || 0), 0
  );

  return (
    <div className="space-y-12 sm:space-y-14 pb-12">
      
      {/* EXCEL IMPORT COMMAND CENTER */}
      {showExcelImport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-5xl my-8 max-h-[90vh] overflow-y-auto overflow-x-hidden flex flex-col relative">
            <button
              onClick={() => { setShowExcelImport(false); setExcelData([]); setExcelFileName(''); }}
              className="absolute top-6 right-6 p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-red-500 hover:border-red-500 transition-all cursor-pointer"
            >
              Cancel
            </button>
            
            <h2 className="font-brand font-extrabold text-2xl text-[var(--text-main)] mb-2 flex items-center gap-2">
              <FileText className="w-6 h-6 text-emerald-500" />
              Import Excel Bill of Costs
            </h2>
            <p className="text-xs text-[var(--text-muted)] font-mono mb-6">
              Upload your .xlsx file to parse all rows and save exactly as written.
            </p>

            {!excelFileName ? (
              <div className="border-2 border-dashed border-[var(--border-color)] rounded-2xl p-12 flex flex-col items-center justify-center bg-[var(--bg-subtle)] hover:bg-[var(--bg-main)] transition-colors relative">
                <FileText className="w-12 h-12 text-slate-400 mb-4" />
                <p className="text-sm font-bold text-[var(--text-main)]">Click to Browse or Drag & Drop</p>
                <p className="text-xs text-[var(--text-muted)] font-mono mt-1">Supports .xlsx files only</p>
                <input 
                  type="file" 
                  accept=".xlsx" 
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            ) : (
              <div className="space-y-6">
                {isDuplicate && (
                  <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-amber-700 dark:text-amber-500">Duplicate File Detected</h4>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        A bill of costs from this exact file seems to already exist in the database. You can still save it if you wish to create a duplicate copy.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {excelFileName}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] font-sans">
                      <strong className="text-[var(--text-main)]">Matter:</strong> {parsedMeta.matterTitle || 'Extracted Matter'}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
                      {parsedMeta.claimantName && <span><strong>Claimant:</strong> {parsedMeta.claimantName}</span>}
                      {parsedMeta.respondentName && <span><strong>Respondent:</strong> {parsedMeta.respondentName}</span>}
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono pt-1">
                      <span className="text-slate-600 font-semibold">{excelData.length} bill items parsed</span>
                      <span className="text-emerald-600 font-bold">Grand Total: Kshs {(parsedMeta.grandTotal || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleConfirmSave}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-500/20 cursor-pointer shrink-0"
                  >
                    Confirm & Save to Database
                  </button>
                </div>

                <div className="border border-[var(--border-color)] rounded-xl overflow-hidden bg-[var(--bg-main)]">
                  <div className="max-h-[50vh] overflow-y-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[var(--bg-subtle)] sticky top-0 border-b border-[var(--border-color)]">
                        <tr>
                          <th className="py-2 px-4 font-bold text-[var(--text-muted)]">Row</th>
                          <th className="py-2 px-4 font-bold text-[var(--text-muted)]">Content Preview</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-color)]">
                        {excelData.slice(0, 100).map((row, idx) => (
                          <tr key={idx} className="hover:bg-[var(--bg-subtle)]/50 transition-colors">
                            <td className="py-2 px-4 text-slate-400 w-16">{idx + 1}</td>
                            <td className="py-2 px-4 text-[var(--text-main)] truncate max-w-2xl">
                              {row.map((cell: any) => String(cell)).join(' | ')}
                            </td>
                          </tr>
                        ))}
                        {excelData.length > 100 && (
                          <tr>
                            <td colSpan={2} className="py-3 text-center text-slate-400 italic">
                              ...and {excelData.length - 100} more rows
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Welcome Header & Action Chips */}
      <div className="flex flex-col gap-6 pb-6 border-b border-[var(--border-color)]/60">
        <div>
          <h1 className="font-brand font-extrabold text-2xl sm:text-3xl lg:text-4xl text-slate-900 dark:text-white tracking-tight">
            Hey, {userName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1.5 font-sans">
            Welcome to Nyagah B. Kithinji & Co. Advocates
          </p>
        </div>

        {/* Action Chips (Horizontal Row) */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigateTab('boc')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold flex items-center gap-2 transition-colors shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Fee Note
          </button>
          
          <button
            onClick={() => setShowExcelImport(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold flex items-center gap-2 transition-colors shadow-sm shadow-emerald-500/20 cursor-pointer"
          >
            <FileText className="w-4 h-4" /> Import Excel Bill
          </button>

          <button
            onClick={() => onNavigateTab('clients')}
            className="px-4 py-2 bg-[var(--bg-subtle)] hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-[var(--border-color)] rounded-full text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-emerald-500" /> Add Client
          </button>

          <button
            onClick={() => onOpenRecents ? onOpenRecents() : onNavigateTab('vault')}
            className="px-4 py-2 bg-[var(--bg-subtle)] hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-[var(--border-color)] rounded-full text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            title="Open Draft Fee Notes & Recent Files"
          >
            <Clock className="w-4 h-4 text-amber-500" /> Drafts / Recents
          </button>
        </div>
      </div>

      {/* MANAGING PARTNER (GOD MODE) SECTION */}
      <ManagingPartnerGodMode
        onNavigateToBuilder={onNavigateToBuilder}
        onNavigateTab={onNavigateTab}
      />

      {/* Main 12-Column Modulix Dashboard Grid Layout */}
      <div className="grid grid-cols-12 gap-6 lg:gap-8">
        
        {/* LEFT MAIN CONTENT (8 Columns) */}
        <div className="col-span-12 lg:col-span-8 space-y-6 lg:space-y-8">
          
          {/* Top 3 KPI Stat Cards Strictly Requested: 1. Claim Overview, 2. Pending Taxation, 3. Processed Fee Notes Today */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            
            {/* KPI Card 1: Claim Overview */}
            <div
              onClick={() => onNavigateTab('matters')}
              className="modulix-card-interactive p-5 space-y-3 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold font-sans text-slate-900 dark:text-white">Claim Overview</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight truncate">
                    Kshs {(totalPortfolioValue / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {totalMattersCount} Active Causes
                  </p>
                </div>

                <svg className="w-14 h-7 text-blue-500 shrink-0" viewBox="0 0 60 30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 25 L 20 15 L 35 20 L 55 5" />
                </svg>
              </div>
            </div>

            {/* KPI Card 2: Pending Taxation */}
            <div
              onClick={() => onNavigateTab('matters')}
              className="modulix-card-interactive p-5 space-y-3 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold font-sans text-slate-900 dark:text-white">Pending Taxation</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                    {pendingTaxationsCount}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Ready for Court</span>
                  </div>
                </div>

                <svg className="w-14 h-7 text-emerald-500 shrink-0" viewBox="0 0 60 30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 20 L 20 12 L 35 18 L 55 8" />
                </svg>
              </div>
            </div>

            {/* KPI Card 3: Processed Fee Notes Today */}
            <div
              onClick={() => onNavigateTab('feenotes')}
              className="modulix-card-interactive p-5 space-y-3 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold font-sans text-slate-900 dark:text-white">Processed Fee Notes Today</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                    {processedTodayCount}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-1">
                    <span>{untaxedDraftsCount} Untaxed / Drafts Pending</span>
                  </div>
                </div>

                <svg className="w-14 h-7 text-emerald-500 shrink-0" viewBox="0 0 60 30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 22 L 18 14 L 32 20 L 55 6" />
                </svg>
              </div>
            </div>

          </div>

          {/* Quick Quote Estimator Widget (Minimalist Theme) */}
          {showBocCalc ? (
            <div className="modulix-card p-5 sm:p-6 bg-[var(--bg-card)] border border-[var(--border-color)]/60">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-emerald-500" />
                <h3 className="font-brand font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">BOC Calc</h3>
                
                <div className="ml-auto flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest border border-emerald-500/20">Live Tool</span>
                  <button 
                    onClick={() => setShowBocCalc(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    title="Hide Calculator"
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-end gap-4 lg:gap-6 animate-fade-in pt-2">
                <div className="w-full sm:w-1/3">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1.5">Matter Type</label>
                  <select 
                    value={qqCategory}
                    onChange={(e) => setQqCategory(e.target.value)}
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-400 transition-colors"
                  >
                    <option value="sch1_purchaser">Schedule 1: Conveyancing (Purchaser)</option>
                    <option value="sch1_vendor">Schedule 1: Conveyancing (Vendor)</option>
                    <option value="sch2_lender">Schedule 2: Debentures (Lender)</option>
                    <option value="sch2_borrower">Schedule 2: Debentures (Borrower)</option>
                    <option value="sch3_probate">Schedule 3: Probate</option>
                    <option value="sch4_ip_tm">Schedule 4: Trademarks (Registration)</option>
                    <option value="sch4_ip_opp">Schedule 4: Trademarks (Opposition)</option>
                    <option value="sch5_subordinate">Schedule 5: Magistrate Court</option>
                    <option value="high_court_plaintiff">Schedule 6: High Court (Plaintiff)</option>
                    <option value="high_court_defendant">Schedule 6: High Court (Defendant)</option>
                    <option value="sch7_secondary">Schedule 7: Secondary Scale (Default)</option>
                    <option value="sch8_tribunals">Schedule 8: Tribunals (Default)</option>
                    <option value="sch9_arbitration">Schedule 9: Arbitration</option>
                    <option value="sch10_criminal">Schedule 10: Criminal Retainer</option>
                    <option value="sch11_itemized">Schedule 11: Base Folio Rate</option>
                  </select>
                </div>
                
                <div className="w-full sm:w-1/3">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1.5">Claim / Property Value (Kshs)</label>
                  <input 
                    type="number"
                    value={qqValue}
                    onChange={(e) => setQqValue(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Enter value..."
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-400 transition-colors font-mono"
                    disabled={['sch4_ip_tm', 'sch4_ip_opp', 'sch7_secondary', 'sch8_tribunals', 'sch10_criminal', 'sch11_itemized'].includes(qqCategory)}
                  />
                </div>

                <div className="w-full sm:w-1/3 sm:text-right pt-2 sm:pt-0">
                  <span className="text-[10px] font-['Inter'] text-slate-400 uppercase tracking-widest block mb-1">Base Instruction Fee</span>
                  <div className="text-2xl sm:text-3xl font-['Sora'] text-slate-900 dark:text-white tracking-tight">
                    {`Kshs ${getQuickQuoteFee().toLocaleString('en-KE', { minimumFractionDigits: 2 })}`}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <button 
                onClick={() => setShowBocCalc(true)}
                className="p-2.5 bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-xl text-slate-400 hover:text-emerald-500 transition-colors shadow-sm flex items-center gap-2"
                title="Show BOC Calc"
              >
                <Eye className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Show BOC Calc</span>
              </button>
            </div>
          )}

          {/* Portfolio Overview Chart (Only rendered when enabled in Settings) */}
          {showPortfolioGraph && (
            <div className="modulix-card space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider font-mono block mb-0.5">
                    Portfolio Claim Breakdown
                  </span>
                  <h3 className="font-brand font-extrabold text-xl text-slate-900 dark:text-white font-mono">
                    Kshs {totalPortfolioValue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-sans">
                    Total Legal Claim Sum Across {totalMattersCount} Active Causes
                  </p>
                </div>

                <button
                  onClick={() => onNavigateTab('matters')}
                  className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-300 hover:border-blue-500 cursor-pointer"
                >
                  <span>View All ({totalMattersCount})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Dynamic Matter Value Bars */}
              <div className="pt-6 pb-2 px-2">
                <div className="flex items-end justify-between gap-4 h-48 relative border-b border-slate-200/80 dark:border-zinc-700 pb-2">
                  {EXACT_MATTERS.map((m, idx) => {
                    const isSelected = selectedBarIndex === idx;
                    const percentage = Math.round((m.amount / totalPortfolioValue) * 100);
                    return (
                      <div
                        key={m.id}
                        onClick={() => setSelectedBarIndex(idx)}
                        className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer relative"
                      >
                        {/* Tooltip Bubble */}
                        {isSelected && (
                          <div className="absolute -top-16 bg-slate-900 text-white px-3.5 py-2 rounded-xl text-center shadow-xl z-20 animate-fade-in border border-slate-700 max-w-[200px]">
                            <p className="text-[10px] text-slate-400 font-sans truncate">{m.caseNo}</p>
                            <p className="text-xs font-bold font-mono text-emerald-400">
                              Kshs {m.amount.toLocaleString('en-KE')}
                            </p>
                            <div className="w-2 h-2 bg-slate-900 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border-r border-b border-slate-700"></div>
                          </div>
                        )}

                        {/* Bar Visual */}
                        <div
                          style={{ height: `${Math.max(percentage, 25)}%` }}
                          className={`w-full max-w-[65px] rounded-t-xl transition-all duration-200 ${
                            isSelected
                              ? 'bg-slate-900 dark:bg-blue-600 shadow-md scale-105'
                              : 'bg-slate-200 dark:bg-zinc-700/60 hover:bg-slate-300 dark:hover:bg-zinc-600'
                          }`}
                        >
                          {!isSelected && (
                            <div className="w-full h-full opacity-20 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.1)_25%,rgba(0,0,0,0.1)_50%,transparent_50%,transparent_75%,rgba(0,0,0,0.1)_75%)] bg-[length:8px_8px] rounded-t-xl"></div>
                          )}
                        </div>

                        <span className={`text-[11px] mt-2.5 font-bold font-mono truncate max-w-[90px] ${
                          isSelected ? 'text-slate-900 dark:text-blue-400' : 'text-slate-500'
                        }`}>
                          {m.caseNo.split(' ')[0]} ({percentage}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Court Filings & Taxations Table */}
          <div className="modulix-card p-0 overflow-hidden">
            <div className="p-5 flex items-center justify-between border-b border-slate-200/70">
              <div>
                <h3 className="font-brand font-bold text-base text-slate-900 dark:text-white">
                  Upcoming Court Filings & Taxations
                </h3>
                <p className="text-xs text-slate-500">Live Active Causes Registered in Database</p>
              </div>
              <button
                onClick={() => onNavigateTab('matters')}
                className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:border-blue-500 cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                <span>View Matters</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="modulix-table-header">
                    <th className="py-3 px-5">
                      <input 
                        type="checkbox" 
                        className="rounded cursor-pointer" 
                        checked={selectedMatterIds.length > 0 && selectedMatterIds.length === EXACT_MATTERS.length}
                        onChange={handleToggleAllMatters}
                        title="Select All / Clear All"
                      />
                    </th>
                    <th className="py-3 px-4">Cause / Matter ID</th>
                    <th className="py-3 px-4">Client / Title</th>
                    <th className="py-3 px-4">Claim Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 dark:divide-zinc-800 text-xs">
                  {EXACT_MATTERS.map((m) => {
                    const isChecked = selectedMatterIds.includes(m.id);
                    return (
                      <tr
                        key={m.id}
                        onClick={() => onNavigateTab('matters')}
                        className={`hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer ${
                          isChecked ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''
                        }`}
                      >
                        <td className="py-3.5 px-5" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            className="rounded cursor-pointer" 
                            checked={isChecked}
                            onChange={() => handleToggleMatter(m.id)}
                          />
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {m.caseNo}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-zinc-200">
                          {m.title}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-blue-400">
                          Kshs {m.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            m.statusClass === 'ready'
                              ? 'badge-green'
                              : 'badge-blue'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              m.statusClass === 'ready' ? 'bg-emerald-500' : 'bg-blue-500'
                            }`}></span>
                            {m.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={(e) => { e.stopPropagation(); onNavigateTab('matters'); }} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onNavigateTab('matters'); }} className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors">
                              <FileEdit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT AUXILIARY COLUMN (4 Columns): REAL Fee Notes & Billing History */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="modulix-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
              <div>
                <h3 className="font-brand font-bold text-base text-slate-900 dark:text-white">
                  Fee Notes & Billing History
                </h3>
                <p className="text-[11px] text-slate-500">Live Database Generated Bills ({feeNotes.length})</p>
              </div>
              <button
                onClick={() => onNavigateTab('feenotes')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                View All →
              </button>
            </div>

            {/* List of Real-time Fee Note Cards from feeNotes */}
            <div className="space-y-3">
              {feeNotes.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No fee notes registered yet.
                </div>
              ) : (
                feeNotes.slice(0, 8).map((fn) => (
                  <div
                    key={fn.id}
                    onClick={() => onNavigateTab('feenotes')}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200/80 dark:border-zinc-700/80 hover:border-blue-500 transition-all cursor-pointer group flex items-start gap-3"
                  >
                    {/* Thumbnail Icon */}
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-700 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0 shadow-xs group-hover:border-blue-500 transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors" title={fn.clientName || fn.matterTitle}>
                          {fn.clientName || fn.matterTitle}
                        </p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                          fn.status === 'processed'
                            ? 'badge-green'
                            : 'badge-blue'
                        }`}>
                          {fn.status === 'processed' ? 'Processed' : 'Draft'}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate font-mono">
                        Ref: {fn.billNumber}
                      </p>

                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200/60 dark:border-zinc-700/60 text-[10.5px]">
                        <span className="font-mono font-bold text-slate-900 dark:text-blue-400">
                          Kshs {(fn.grandTotal || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-slate-400 font-mono">
                          {fn.createdAt ? fn.createdAt.split('T')[0] : 'Recent'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardView;
