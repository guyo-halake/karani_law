import React, { useState } from 'react';
import {
  BookOpen,
  Scale,
  CheckCircle,
  FileText,
  Search,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Calculator,
  ShieldCheck,
  Building2,
  HelpCircle,
  ExternalLink,
  Info
} from 'lucide-react';

import {
  calculate_high_court_instruction_fee,
  calculate_subordinate_court_instruction_fee,
  calculate_getting_up_fee,
  calculate_bill_of_costs
} from '../../engine/remuneration_engine';

export const RemunerationGuideView: React.FC = () => {
  // PDF Viewer State
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'gazette' | 'simulator' | 'schedules' | 'itemized'>('gazette');

  // Interactive Math Simulator State
  const [simClaimValue, setSimClaimValue] = useState<number>(30820193.28);
  const [simCourt, setSimCourt] = useState<'schedule_6_high_court' | 'schedule_5_magistrate'>('schedule_6_high_court');
  const [simIsDefendant, setSimIsDefendant] = useState(false);
  const [simIncludeGettingUp, setSimIncludeGettingUp] = useState(true);

  // Live Math Computation using exact Python Remuneration Engine logic
  const simResult = calculate_bill_of_costs(
    simClaimValue,
    simCourt,
    simIsDefendant,
    simIncludeGettingUp,
    [
      { description: "Drawing Pleadings & Plain Statements", type: "drawing_folio", qty: 25 },
      { description: "Copying Documents for Court & Parties", type: "copying_folio", qty: 120 },
      { description: "Attending High Court Hearing (2 Hours)", type: "attendance_court_hr", qty: 2 }
    ],
    15000.0 // Disbursements (Court Filing Fees)
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top PDF Reader Header Toolbar */}
      <div className="bg-slate-900 text-white p-3 sm:p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
        
        {/* Left: Document Title & Legal Ref */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-400 font-mono uppercase tracking-wider">
                Official Kenya Gazette Supplement
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                L.N. 64/1962 (ed. 2022)
              </span>
            </div>
            <h2 className="font-brand font-bold text-sm sm:text-base text-white tracking-tight">
              Advocates (Remuneration) Order Legal Reference & Taxation Guide
            </h2>
          </div>
        </div>

        {/* Center: Search & Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
          <button
            onClick={() => setActiveTab('gazette')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'gazette' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            PDF Gazette
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'simulator' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Math Simulator
          </button>
          <button
            onClick={() => setActiveTab('schedules')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'schedules' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Schedules 1-6
          </button>
        </div>

        {/* Right: PDF Reader Toolbar Actions (Page count, Zoom, Print/Download) */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-700 text-xs text-slate-300 font-mono">
            <span>Page {currentPage} of 6</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setZoomLevel(Math.max(75, zoomLevel - 10))}
              className="p-1 text-slate-300 hover:text-white rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono px-1 text-slate-300 font-bold">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(130, zoomLevel + 10))}
              className="p-1 text-slate-300 hover:text-white rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Print Gazette Document"
          >
            <Printer className="w-4 h-4" />
          </button>

          <a
            href="https://new.kenyalaw.org/akn/ke/act/ln/1962/64/eng@2022-12-31"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-blue px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Open Official Kenya Law Gazette"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Official Gazette
          </a>
        </div>
      </div>

      {/* INTERACTIVE MATH SIMULATOR TAB */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          <div className="modulix-card p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
              <div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider font-mono">
                  Interactive Legal Calculator
                </span>
                <h3 className="font-brand font-extrabold text-xl text-slate-900 dark:text-white">
                  Advocates Remuneration Math Simulator
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Test custom claim values against exact Kenyan High Court & Magistrate Court instruction fee formulas.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 px-3 py-1 rounded-full font-bold border border-blue-200 dark:border-blue-500/20">
                  L.N. 64/1962 ed. 2022 Engine
                </span>
              </div>
            </div>

            {/* Controls Input Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-slate-200 dark:border-zinc-700">
              
              {/* Claim Value Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
                  Subject Claim Value (Kshs)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={simClaimValue}
                    onChange={(e) => setSimClaimValue(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Court Schedule Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
                  Court Schedule Forum
                </label>
                <select
                  value={simCourt}
                  onChange={(e) => setSimCourt(e.target.value as any)}
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="schedule_6_high_court">Schedule 6 — High Court / ELC / ELRC</option>
                  <option value="schedule_5_magistrate">Schedule 5 — Subordinate / Magistrate Court</option>
                </select>
              </div>

              {/* Party Role Toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
                  Party Representation
                </label>
                <select
                  value={simIsDefendant ? 'defendant' : 'plaintiff'}
                  onChange={(e) => setSimIsDefendant(e.target.value === 'defendant')}
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="plaintiff">Plaintiff / Claimant (100% Scale)</option>
                  <option value="defendant">Defendant (85% Scale / Min 50k)</option>
                </select>
              </div>

              {/* Getting-Up Fee Toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
                  Getting-Up Fee (33.33%)
                </label>
                <div className="flex items-center h-9">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={simIncludeGettingUp}
                      onChange={(e) => setSimIncludeGettingUp(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Include 1/3 Getting-Up Fee</span>
                  </label>
                </div>
              </div>

            </div>

            {/* Arithmetic Formula Breakdown Card */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4 shadow-xl border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-brand font-bold text-sm text-amber-400 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-amber-400" />
                  Exact Mathematical Calculation Breakdown
                </h4>
                <span className="text-xs font-mono text-slate-400">
                  {simResult.schedule}
                </span>
              </div>

              {/* Formula Step Description */}
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 text-xs font-mono text-slate-300 leading-relaxed">
                <span className="font-bold text-blue-400">Formula Rule: </span>
                {simResult.formula}
              </div>

              {/* Calculation Summary Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono pt-2">
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase">Instruction Fee</span>
                  <span className="text-lg font-bold text-white block">
                    Kshs {simResult.instruction_fee.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase">Getting-Up Fee (1/3)</span>
                  <span className="text-lg font-bold text-blue-400 block">
                    Kshs {simResult.getting_up_fee.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase">VAT (16%)</span>
                  <span className="text-lg font-bold text-emerald-400 block">
                    Kshs {simResult.vat_amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-blue-600/20 border border-blue-500/30 space-y-1">
                  <span className="text-[10px] text-blue-300 block uppercase font-bold">Grand Total Taxed Bill</span>
                  <span className="text-lg font-bold text-white block">
                    Kshs {simResult.grand_total.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL GAZETTE PDF A4 DOCUMENT VIEWER TAB */}
      {(activeTab === 'gazette' || activeTab === 'schedules' || activeTab === 'itemized') && (
        <div className="flex justify-center">
          {/* Centered A4 PDF Gazette Document Container */}
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="w-full max-w-4xl bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 shadow-2xl rounded-2xl p-8 sm:p-12 space-y-8 font-serif transition-all duration-200 text-slate-900 dark:text-zinc-100"
          >
            {/* Gazette Official Government Header */}
            <div className="text-center space-y-2 border-b-4 border-slate-900 dark:border-white pb-6">
              <p className="text-xs uppercase tracking-widest font-mono font-bold text-slate-600 dark:text-zinc-400">
                SPECIAL ISSUE — REPUBLIC OF KENYA
              </p>
              <h1 className="font-brand font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 dark:text-white uppercase">
                THE KENYA GAZETTE SUPPLEMENT
              </h1>
              <p className="text-xs font-mono font-bold text-slate-700 dark:text-zinc-300">
                LEGAL NOTICE NO. 35 — THE ADVOCATES ACT (Cap. 16)
              </p>
              <div className="flex items-center justify-center gap-4 text-[11px] font-mono text-slate-500 pt-1">
                <span>NAIROBI, 31st December 2022</span>
                <span>•</span>
                <span>L.N. 64/1962 (ed. 2022)</span>
              </div>
            </div>

            {/* Notice Title */}
            <div className="text-center space-y-1 py-2">
              <h2 className="font-brand font-bold text-lg text-slate-900 dark:text-white uppercase">
                THE ADVOCATES (REMUNERATION) (AMENDMENT) ORDER
              </h2>
              <p className="text-xs text-slate-600 dark:text-zinc-400 italic">
                IN EXERCISE of the powers conferred by section 48 of the Advocates Act, the Chief Justice makes the following Order—
              </p>
            </div>

            {/* Official Order Citation */}
            <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-zinc-200">
              <p>
                <strong>1. Citation.</strong> This Order may be cited as the Advocates (Remuneration) (Amendment) Order, and shall apply to all bills of costs, fee notes, and legal taxation proceedings filed in the High Court, Court of Appeal, Environment and Land Court, Employment and Labour Relations Court, and Subordinate Courts of Kenya.
              </p>

              <p>
                <strong>2. Instruction Fees Structure.</strong> Subject to the provisions of this Order, the instruction fee in any suit, cause, or legal proceeding shall be calculated in accordance with the prescribed Schedules below.
              </p>
            </div>

            {/* SCHEDULE 6 TABLE: HIGH COURT LITIGATION */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between border-b-2 border-slate-900 dark:border-white pb-1.5">
                <h3 className="font-brand font-bold text-sm text-slate-900 dark:text-white uppercase">
                  SCHEDULE 6 — HIGH COURT, COURT OF APPEAL, ELC & ELRC LITIGATION
                </h3>
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">Paragraph 1</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-zinc-800 border-y border-slate-300 dark:border-zinc-700 font-mono font-bold text-slate-700 dark:text-zinc-300">
                      <th className="py-2.5 px-3">Subject Claim Value Range</th>
                      <th className="py-2.5 px-3">Prescribed Base Instruction Fee Formula</th>
                      <th className="py-2.5 px-3 text-right">Minimum Floor Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                    <tr>
                      <td className="py-2.5 px-3 font-mono">Up to Kshs 500,000</td>
                      <td className="py-2.5 px-3 font-semibold">Fixed scale fee of Kshs 45,000</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-600">Kshs 75,000</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono">Kshs 500,001 – 1,000,000</td>
                      <td className="py-2.5 px-3 font-semibold">Fixed scale fee of Kshs 75,000</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-600">Kshs 75,000</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono">Kshs 1,000,001 – 5,000,000</td>
                      <td className="py-2.5 px-3 font-semibold">Kshs 75,000 + 1.75% of excess over Kshs 1,000,000</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-600">Kshs 75,000</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono">Kshs 5,000,001 – 10,000,000</td>
                      <td className="py-2.5 px-3 font-semibold">Kshs 145,000 + 1.5% of excess over Kshs 5,000,000</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-600">Kshs 145,000</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono">Kshs 10,000,001 – 20,000,000</td>
                      <td className="py-2.5 px-3 font-semibold">Kshs 220,000 + 1.0% of excess over Kshs 10,000,000</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-600">Kshs 220,000</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono">Over Kshs 20,000,000</td>
                      <td className="py-2.5 px-3 font-semibold">Kshs 320,000 + 0.75% of excess over Kshs 20,000,000</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-600">Kshs 320,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* GETTING-UP FEE & ITEMIZED WORK SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-xs font-sans">
              
              {/* Getting Up Fee Rules */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2 bg-slate-50/50 dark:bg-zinc-900/50">
                <h4 className="font-brand font-bold text-xs text-slate-900 dark:text-white uppercase flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Schedule 6 Item 2 — Getting-Up Fee
                </h4>
                <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-[11.5px]">
                  Where a suit is defended and has been set down for hearing, or instructions have been received to get up the case for trial, a <strong>Getting-Up Fee equal to 33.33% (1/3) of the Instruction Fee</strong> shall be allowed.
                </p>
              </div>

              {/* Itemized Folio Rates */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2 bg-slate-50/50 dark:bg-zinc-900/50">
                <h4 className="font-brand font-bold text-xs text-slate-900 dark:text-white uppercase flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Scale className="w-4 h-4 text-blue-600" />
                  Prescribed Folio & Attendance Rates
                </h4>
                <ul className="space-y-1.5 text-[11.5px] text-slate-700 dark:text-zinc-300 font-mono">
                  <li className="flex justify-between">
                    <span>Drawing Pleadings / Affidavits:</span>
                    <span className="font-bold text-slate-900 dark:text-white">Kshs 500 / folio</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Copying Documents & Bundles:</span>
                    <span className="font-bold text-slate-900 dark:text-white">Kshs 50 / folio</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Court Attendance (Per Hour):</span>
                    <span className="font-bold text-slate-900 dark:text-white">Kshs 2,500 / hr</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Value Added Tax (VAT):</span>
                    <span className="font-bold text-emerald-600">16%</span>
                  </li>
                </ul>
              </div>

            </div>

            {/* Official Gazette Footer & Signature Line */}
            <div className="pt-8 border-t border-slate-300 dark:border-zinc-800 flex items-center justify-between text-xs font-mono text-slate-500">
              <div>
                <p>CERTIFIED OFFICIAL GAZETTE COPIES</p>
                <p className="text-[10px]">Published by Authority of the Chief Justice of Kenya</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900 dark:text-white">NYAGAH B. KITHINJI & CO. ADVOCATES</p>
                <p className="text-[10px]">Official System Legal Remuneration Engine v2.0</p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default RemunerationGuideView;
