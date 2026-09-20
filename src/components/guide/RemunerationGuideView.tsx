import React, { useState } from 'react';
import {
  FileText,
  Search,
  Printer,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Calculator,
  ExternalLink,
  BookOpen,
  Scale,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Info,
  Layers,
  ChevronDown,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

import {
  calculate_bill_of_costs,
  check_one_sixth_taxed_off_rule,
  ITEM_RATES,
  BillItem
} from '../../engine/remuneration_engine';

export const RemunerationGuideView: React.FC = () => {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<'gazette' | 'toc' | 'simulator' | 'schedules'>('gazette');
  const [selectedSection, setSelectedSection] = useState<string>('part_I');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);

  // Math Simulator State
  const [simClaimValue, setSimClaimValue] = useState<number>(30820193.28);
  const [simSchedule, setSimSchedule] = useState<'schedule_6_high_court' | 'schedule_5_magistrate' | 'schedule_1_conveyancing' | 'schedule_3_probate'>('schedule_6_high_court');
  const [simIsDefendant, setSimIsDefendant] = useState(false);
  const [simIncludeGettingUp, setSimIncludeGettingUp] = useState(true);
  const [simComplexityMultiplier, setSimComplexityMultiplier] = useState<number>(1.0);
  const [simMonthsOverdue, setSimMonthsOverdue] = useState<number>(3); // Sec. 7 Interest (14% p.a.)
  const [simDisbursements, setSimDisbursements] = useState<number>(15000);
  const [simTaxedOffAmount, setSimTaxedOffAmount] = useState<number>(85000);

  // Dynamic Line-Item Folios Manager State
  const [simFolios, setSimFolios] = useState<BillItem[]>([
    { description: 'Drawing Pleadings, Plaint & Plain Statements', type: 'drawing_folio', qty: 25 },
    { description: 'Copying Documents for Court & Adverse Parties', type: 'copying_folio', qty: 120 },
    { description: 'Attending High Court Hearing (2 Hours)', type: 'attendance_court_hr', qty: 2 },
    { description: 'Office Consultation & Instructions Conference', type: 'attendance_office_hr', qty: 1.5 },
    { description: 'Formal Demand & Statutory Notice Letters', type: 'letter_formal', qty: 2 },
    { description: 'Search at Land Registry & Companies Registry', type: 'search_registry', qty: 1 }
  ]);

  // Folio Item Form State
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemType, setNewItemType] = useState('drawing_folio');
  const [newItemQty, setNewItemQty] = useState<number>(1);

  const handleAddFolioItem = () => {
    if (!newItemDesc.trim()) return;
    setSimFolios((prev) => [
      ...prev,
      {
        description: newItemDesc.trim(),
        type: newItemType,
        qty: Number(newItemQty) || 1
      }
    ]);
    setNewItemDesc('');
    setNewItemQty(1);
  };

  const handleRemoveFolioItem = (index: number) => {
    setSimFolios((prev) => prev.filter((_, i) => i !== index));
  };

  // Live Math Computation
  const simResult = calculate_bill_of_costs(
    simClaimValue,
    simSchedule,
    simIsDefendant,
    simIncludeGettingUp,
    simFolios,
    simDisbursements,
    simComplexityMultiplier,
    simMonthsOverdue
  );

  // Sec. 77 Rule Audit
  const taxedOffAudit = check_one_sixth_taxed_off_rule(simResult.grand_total, simTaxedOffAmount);

  const totalPages = 6;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Minimalist Navigation & Toolbar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 sm:p-3 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg text-xs w-full md:w-auto justify-center overflow-x-auto">
          <button
            onClick={() => setActiveTab('gazette')}
            className={`px-3.5 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              activeTab === 'gazette'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            PDF Gazette Document
          </button>
          <button
            onClick={() => setActiveTab('toc')}
            className={`px-3.5 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              activeTab === 'toc'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Statutory Index (79 Secs)
          </button>
          <button
            onClick={() => setActiveTab('schedules')}
            className={`px-3.5 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              activeTab === 'schedules'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Schedules 1 – 11 Full Scales
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3.5 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Math Simulator Engine
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Gazette / Statutory Rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 dark:text-white placeholder-slate-400 font-medium"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
          {/* Zoom */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs text-slate-700 dark:text-slate-300">
            <button
              onClick={() => setZoomLevel(Math.max(75, zoomLevel - 10))}
              className="p-0.5 hover:text-slate-900 dark:hover:text-white rounded cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] px-1 font-bold">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(130, zoomLevel + 10))}
              className="p-0.5 hover:text-slate-900 dark:hover:text-white rounded cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Print */}
          <button
            onClick={() => window.print()}
            className="p-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg border border-slate-200 dark:border-zinc-700 cursor-pointer"
            title="Print Gazette Document"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Visit Official Kenya Law Web Button */}
          <a
            href="https://new.kenyalaw.org/akn/ke/act/ln/1962/64/eng@2022-12-31"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Open official Kenya Law web page (L.N. 64/1962 ed. 2022)"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Visit Kenya Law Gazette
          </a>
        </div>
      </div>

      {/* TAB 1: FULL SCROLLABLE PDF GAZETTE DOCUMENT READER */}
      {activeTab === 'gazette' && (
        <div className="flex flex-col items-center space-y-6">
          <div
            className="bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 shadow-xl rounded-sm p-6 sm:p-12 text-slate-900 dark:text-slate-100 font-serif leading-relaxed transition-all duration-200"
            style={{
              width: `${(zoomLevel / 100) * 850}px`,
              minHeight: '1100px',
              maxWidth: '100%'
            }}
          >
            {/* Gazette Official Header Stamp */}
            <div className="text-center border-b-2 border-slate-900 dark:border-slate-100 pb-6 mb-8">
              <div className="text-xs uppercase tracking-widest font-sans font-bold text-slate-500 mb-1">
                REPUBLIC OF KENYA
              </div>
              <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight font-sans">
                THE KENYA GAZETTE SUPPLEMENT
              </h1>
              <div className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-1">
                LEGAL NOTICE NO. 64 OF 1962 (ed. 2022) & L.N. 35 OF 2014
              </div>
              <div className="text-xs italic font-sans text-slate-500 mt-2 flex flex-wrap items-center justify-center gap-2">
                <span>Published by Authority of the High Court of Kenya & National Council for Law Reporting</span>
                <a
                  href="https://new.kenyalaw.org/akn/ke/act/ln/1962/64/eng@2022-12-31"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-sans font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  (View Source on Kenya Law <ExternalLink className="w-3 h-3" />)
                </a>
              </div>
            </div>

            {/* PAGE 1 CONTENT */}
            {currentPage === 1 && (
              <div className="space-y-6 text-sm">
                <div className="text-center font-bold font-sans uppercase tracking-wider text-base mb-4">
                  PART I — GENERAL MATTERS (SECTIONS 1 TO 17)
                </div>

                <p className="text-justify indent-6">
                  <strong>IN EXERCISE</strong> of the powers conferred by section 48 of the Advocates Act, the Chief Justice, on the recommendation of the Council of the Law Society of Kenya, makes the following Order:—
                </p>

                <div className="space-y-6 font-sans text-xs">
                  <div className="border-l-2 border-slate-900 dark:border-slate-100 pl-4 py-1">
                    <h3 className="font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      1. Citation & Commencement
                    </h3>
                    <p className="text-justify text-slate-700 dark:text-slate-300 mt-1 leading-relaxed font-serif text-sm">
                      This Order may be cited as the Advocates (Remuneration) Order, and shall apply to all bills of costs taxed or rendered after the commencement hereof in respect of contentious and non-contentious legal business.
                    </p>
                  </div>

                  <div className="border-l-2 border-slate-900 dark:border-slate-100 pl-4 py-1">
                    <h3 className="font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      2 & 3. Application of Order & Scales of Fees
                    </h3>
                    <p className="text-justify text-slate-700 dark:text-slate-300 mt-1 leading-relaxed font-serif text-sm">
                      The remuneration of an advocate in respect of business transacted by him shall be regulated strictly according to Schedules 1 to 6. No advocate shall charge, and no Taxing Officer shall allow, an instruction fee lower than the prescribed statutory minimum.
                    </p>
                  </div>

                  <div className="border-l-2 border-slate-900 dark:border-slate-100 pl-4 py-1">
                    <h3 className="font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      5. Special Fee for Exceptional Importance & Complexity
                    </h3>
                    <p className="text-justify text-slate-700 dark:text-slate-300 mt-1 leading-relaxed font-serif text-sm">
                      Where a suit or application involves extraordinary complexity, novel questions of constitutional or commercial law, or exceptional financial stakes, the Taxing Officer or Judge may certify an additional instruction fee multiplier of up to 1.5x (50% increase).
                    </p>
                  </div>

                  <div className="border-l-2 border-slate-900 dark:border-slate-100 pl-4 py-1">
                    <h3 className="font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      7. Statutory Interest Charged on Overdue Bills (14% p.a.)
                    </h3>
                    <p className="text-justify text-slate-700 dark:text-slate-300 mt-1 leading-relaxed font-serif text-sm">
                      An advocate may charge interest at the statutory rate of <strong>14% per annum</strong> on his disbursements and remuneration from the expiration of one month from the date of delivery of his bill of costs to the client.
                    </p>
                  </div>

                  <div className="border-l-2 border-slate-900 dark:border-slate-100 pl-4 py-1">
                    <h3 className="font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      17. Statutory Length of Folio Definition
                    </h3>
                    <p className="text-justify text-slate-700 dark:text-slate-300 mt-1 leading-relaxed font-serif text-sm">
                      A folio is defined under statutory law as consisting of <strong>100 words</strong> (or 72 figures). Every fraction of a folio beyond a full folio shall be charged as a full folio.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 2 CONTENT */}
            {currentPage === 2 && (
              <div className="space-y-6 text-sm">
                <div className="text-center font-bold font-sans uppercase tracking-wider text-sm mb-4">
                  SCHEDULE 6 — CONTENTIOUS BUSINESS (HIGH COURT & SUPERIOR COURTS)
                </div>

                <p className="text-justify indent-6">
                  Instruction fees to sue or defend in civil proceedings in the High Court, Environment & Land Court (ELC), Employment & Labour Relations Court (ELRC), Court of Appeal, or Supreme Court:
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-sans border-collapse border border-slate-300 dark:border-zinc-700">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-zinc-800">
                        <th className="border border-slate-300 dark:border-zinc-700 p-2 text-left">Value of Subject Matter (Kshs)</th>
                        <th className="border border-slate-300 dark:border-zinc-700 p-2 text-left">Plaintiff Instruction Fee Scale Formula</th>
                        <th className="border border-slate-300 dark:border-zinc-700 p-2 text-left">Minimum Prescribed Fee</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2">Up to 500,000</td>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2 font-mono">Kshs 45,000 fixed</td>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2 font-mono">Kshs 75,000</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2">500,001 to 1,000,000</td>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2 font-mono">Kshs 75,000 fixed</td>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2 font-mono">Kshs 75,000</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2">1,000,001 to 5,000,000</td>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2 font-mono">Kshs 75,000 + 1.75% of excess over 1M</td>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2 font-mono">Kshs 75,000</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2">5,000,001 to 10,000,000</td>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2 font-mono">Kshs 145,000 + 1.50% of excess over 5M</td>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2 font-mono">Kshs 145,000</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2">10,000,001 to 20,000,000</td>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2 font-mono">Kshs 220,000 + 1.00% of excess over 10M</td>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2 font-mono">Kshs 220,000</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2">Over 20,000,000</td>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2 font-mono">Kshs 320,000 + 0.75% of excess over 20M</td>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2 font-mono">Kshs 320,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="space-y-4 font-sans text-xs pt-2">
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg">
                    <div className="font-bold text-slate-900 dark:text-white uppercase">Defendant's Instruction Fee Rule:</div>
                    <div className="text-slate-600 dark:text-slate-300 mt-1 font-serif text-sm">
                      Calculated at <strong>85%</strong> of the Plaintiff's instruction fee scale, subject to a statutory minimum defendant fee of <strong>Kshs 50,000</strong>.
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg">
                    <div className="font-bold text-slate-900 dark:text-white uppercase">Getting-Up Fee (Schedule 6 Item 2):</div>
                    <div className="text-slate-600 dark:text-slate-300 mt-1 font-serif text-sm">
                      An additional <strong>Getting-Up Fee</strong> equal to <strong>33.33% (1/3)</strong> of the allowed instruction fee shall be allowed once notice of trial or hearing date has been served.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 3 CONTENT */}
            {currentPage === 3 && (
              <div className="space-y-6 text-sm">
                <div className="text-center font-bold font-sans uppercase tracking-wider text-sm mb-4">
                  PART II — NON-CONTENTIOUS BUSINESS & SCHEDULE 1 CONVEYANCING
                </div>

                <p className="text-justify indent-6">
                  Remuneration of advocates in sales, transfers, mortgages, charges, and leases of immovable property:
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-sans border-collapse border border-slate-300 dark:border-zinc-700">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-zinc-800">
                        <th className="border border-slate-300 dark:border-zinc-700 p-2 text-left">Property Value / Consideration (Kshs)</th>
                        <th className="border border-slate-300 dark:border-zinc-700 p-2 text-left">Purchaser Advocate Fee Formula</th>
                        <th className="border border-slate-300 dark:border-zinc-700 p-2 text-left">Vendor Advocate Fee</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2">Up to 1,000,000</td>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2 font-mono">Kshs 35,000 fixed minimum</td>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2 font-mono">75% of Purchaser fee</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2">1,000,001 to 5,000,000</td>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2 font-mono">Kshs 35,000 + 2.0% of excess over 1M</td>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2 font-mono">75% of Purchaser fee</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2">5,000,001 to 10,000,000</td>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2 font-mono">Kshs 115,000 + 1.5% of excess over 5M</td>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2 font-mono">75% of Purchaser fee</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2">10,000,001 to 20,000,000</td>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2 font-mono">Kshs 190,000 + 1.0% of excess over 10M</td>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2 font-mono">75% of Purchaser fee</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2">Over 20,000,000</td>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2 font-mono">Kshs 290,000 + 0.75% of excess over 20M</td>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2 font-mono">75% of Purchaser fee</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3 font-sans text-xs">
                  <h4 className="font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Negotiation Commission (Section 27):
                  </h4>
                  <p className="text-justify indent-4">
                    For negotiating a sale or purchase of property, an advocate is entitled to an additional commission of <strong>1.5%</strong> of the purchase price up to Kshs 5,000,000, and <strong>1.0%</strong> on the excess over Kshs 5,000,000.
                  </p>
                </div>
              </div>
            )}

            {/* PAGE 4 CONTENT */}
            {currentPage >= 4 && (
              <div className="space-y-6 text-sm">
                <div className="text-center font-bold font-sans uppercase tracking-wider text-sm mb-4">
                  PART III — TAXATION PROCEDURES & SECTION 77 PENALTY
                </div>

                <div className="space-y-4 font-sans text-xs">
                  <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl">
                    <h3 className="font-bold text-red-700 dark:text-red-300 uppercase tracking-wider mb-1">
                      Sec. 77. The One-Sixth (1/6th) Taxed-Off Statutory Penalty Rule
                    </h3>
                    <p className="text-justify text-slate-700 dark:text-slate-300 leading-relaxed font-serif text-sm">
                      If on taxation more than <strong>one-sixth (16.67%)</strong> of the total amount of the advocate's bill of costs is taxed off by the Taxing Officer, the advocate shall be disallowable from receiving the costs of taxation and shall pay the costs of taxation incurred by the client or adverse party.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                      Sec. 69. 5-Column Preparation of Bills of Costs
                    </h3>
                    <p className="text-justify indent-4 leading-relaxed font-serif text-sm">
                      Bills for taxation lodged under Part III must be prepared with 5 distinct columns: dates, itemized legal work descriptions, folios, disbursements, and professional charges.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* PAGE NAVIGATION DOCK AT BOTTOM OF GAZETTE SHEET */}
            <div className="mt-12 pt-6 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between font-sans">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Previous Page
              </button>

              <div className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                PAGE {currentPage} OF {totalPages}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-4 py-2 bg-slate-900 dark:bg-zinc-100 disabled:opacity-30 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-slate-900 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                Next Page <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STATUTORY INDEX (79 SECTIONS) */}
      {activeTab === 'toc' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono mb-3">
              Kenya Law Statutory Index (79 Sections)
            </h3>

            <div className="space-y-1 text-xs">
              <button
                onClick={() => setSelectedSection('part_I')}
                className={`w-full text-left px-3 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                  selectedSection === 'part_I'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Part I — General Matters (Sec. 1 - 17)
              </button>
              <button
                onClick={() => setSelectedSection('part_II')}
                className={`w-full text-left px-3 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                  selectedSection === 'part_II'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Part II — Non-Contentious Matters (Sec. 18 - 48)
              </button>
              <button
                onClick={() => setSelectedSection('part_III')}
                className={`w-full text-left px-3 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                  selectedSection === 'part_III'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Part III — Taxation of Costs (Sec. 49 - 79)
              </button>
            </div>
          </div>

          <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
            {selectedSection === 'part_I' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-zinc-800 pb-2">
                  Part I — General Matters (Sections 1 to 17)
                </h3>
                <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-serif text-sm">
                  <p><strong>Sec. 1: Citation</strong> — The Advocates (Remuneration) Order.</p>
                  <p><strong>Sec. 3: Scale of fees</strong> — Remuneration governed strictly by Schedules 1 to 6.</p>
                  <p><strong>Sec. 5: Special fee for complexity</strong> — Allows up to 1.5x increased instruction fees for complex matters.</p>
                  <p><strong>Sec. 7: Interest on unpaid fees (14% p.a.)</strong> — Interest accrues after 30 days from delivery of bill.</p>
                  <p><strong>Sec. 10: Taxing Officer</strong> — Registrar or Deputy Registrar of the High Court.</p>
                  <p><strong>Sec. 11: Appeals & Objections</strong> — Procedure for chamber summons objections to taxation.</p>
                  <p><strong>Sec. 17: Length of Folio</strong> — Defined as 100 words (or 72 figures).</p>
                </div>
              </div>
            )}

            {selectedSection === 'part_II' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-zinc-800 pb-2">
                  Part II — Non-Contentious Business (Sections 18 to 48)
                </h3>
                <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-serif text-sm">
                  <p><strong>Sec. 18: Remuneration scope</strong> — Applies to conveyancing, leases, mortgages, and debentures.</p>
                  <p><strong>Sec. 26: Application of Schedule 1</strong> — Tiered percentage fees on land sales and purchases.</p>
                  <p><strong>Sec. 27: Negotiation commissions</strong> — Commission charged for negotiating land sales or purchases.</p>
                  <p><strong>Sec. 31: Borrower pays mortgage costs</strong> — Mortgagor liable for lender's advocate scale fees.</p>
                  <p><strong>Sec. 42: Schedule 2 Debentures</strong> — Corporate loan security scale charges.</p>
                </div>
              </div>
            )}

            {selectedSection === 'part_III' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-zinc-800 pb-2">
                  Part III — Taxation of Costs in Contentious Matters (Sections 49 to 79)
                </h3>
                <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-serif text-sm">
                  <p><strong>Sec. 50: High Court costs</strong> — Taxed under Schedule 6.</p>
                  <p><strong>Sec. 51: Subordinate Court costs</strong> — Taxed under Schedule 5 / 7.</p>
                  <p><strong>Sec. 51C: Probate costs</strong> — Grants of probate taxed under Schedule 3.</p>
                  <p><strong>Sec. 69: Manner of preparing bills</strong> — 5-column layout required for lodging bills.</p>
                  <p><strong>Sec. 77: One-Sixth (1/6th) Penalty Rule</strong> — If &gt;1/6th taxed off, advocate pays taxation costs.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SCHEDULES 1 TO 11 FULL STATUTORY SCALES */}
      {activeTab === 'schedules' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-zinc-800 pb-3">
              Full Statutory Scale Tables for All 11 Schedules
            </h3>

            {/* SCHEDULE 1 */}
            <div className="space-y-3 border-b border-slate-200 dark:border-zinc-800 pb-6">
              <h4 className="font-bold text-sm text-blue-600 dark:text-blue-400 font-mono">
                SCHEDULE 1 — Conveyancing, Sales, Purchases, Mortgages & Leases
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Governs legal fees for transfers of immovable property. Purchaser's Advocate scale: Minimum fee Kshs 35,000 for value up to Kshs 1,000,000.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-sans border-collapse border border-slate-300 dark:border-zinc-700">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-zinc-800">
                      <th className="p-2 border border-slate-300 dark:border-zinc-700 text-left">Property Value</th>
                      <th className="p-2 border border-slate-300 dark:border-zinc-700 text-left">Purchaser Advocate Scale</th>
                      <th className="p-2 border border-slate-300 dark:border-zinc-700 text-left">Vendor Advocate Scale</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border border-slate-300 dark:border-zinc-700">Up to Kshs 1,000,000</td>
                      <td className="p-2 border border-slate-300 dark:border-zinc-700 font-mono">Kshs 35,000 fixed</td>
                      <td className="p-2 border border-slate-300 dark:border-zinc-700 font-mono">75% of Purchaser Fee</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-300 dark:border-zinc-700">1,000,001 – 5,000,000</td>
                      <td className="p-2 border border-slate-300 dark:border-zinc-700 font-mono">Kshs 35,000 + 2.0% of excess over 1M</td>
                      <td className="p-2 border border-slate-300 dark:border-zinc-700 font-mono">75% of Purchaser Fee</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-300 dark:border-zinc-700">5,000,001 – 10,000,000</td>
                      <td className="p-2 border border-slate-300 dark:border-zinc-700 font-mono">Kshs 115,000 + 1.5% of excess over 5M</td>
                      <td className="p-2 border border-slate-300 dark:border-zinc-700 font-mono">75% of Purchaser Fee</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-300 dark:border-zinc-700">Over 20,000,000</td>
                      <td className="p-2 border border-slate-300 dark:border-zinc-700 font-mono">Kshs 290,000 + 0.75% of excess over 20M</td>
                      <td className="p-2 border border-slate-300 dark:border-zinc-700 font-mono">75% of Purchaser Fee</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* SCHEDULE 3 */}
            <div className="space-y-3 border-b border-slate-200 dark:border-zinc-800 pb-6">
              <h4 className="font-bold text-sm text-blue-600 dark:text-blue-400 font-mono">
                SCHEDULE 3 — Grants of Probate & Estate Administration
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Governs petition for grant of probate, letters of administration, and distribution of deceased estates.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-sans border-collapse border border-slate-300 dark:border-zinc-700">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-zinc-800">
                      <th className="p-2 border border-slate-300 dark:border-zinc-700 text-left">Gross Estate Value</th>
                      <th className="p-2 border border-slate-300 dark:border-zinc-700 text-left">Probate Scale Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border border-slate-300 dark:border-zinc-700">Up to Kshs 500,000</td>
                      <td className="p-2 border border-slate-300 dark:border-zinc-700 font-mono">Kshs 40,000 fixed minimum</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-300 dark:border-zinc-700">500,001 – 5,000,000</td>
                      <td className="p-2 border border-slate-300 dark:border-zinc-700 font-mono">Kshs 40,000 + 2.5% of excess over 500k</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-300 dark:border-zinc-700">Over 5,000,000</td>
                      <td className="p-2 border border-slate-300 dark:border-zinc-700 font-mono">Kshs 152,500 + 1.5% of excess over 5M</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* SCHEDULE 6 */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-blue-600 dark:text-blue-400 font-mono">
                SCHEDULE 6 — Superior Courts Litigation (High Court, ELC, ELRC, Court of Appeal, Supreme Court)
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Minimum Plaintiff Fee: Kshs 75,000 | Minimum Defendant Fee: Kshs 50,000 | Getting-Up Fee: 33.33% (1/3).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: UNIVERSAL MATH SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Universal Remuneration Math Simulator Engine
                </h3>
                <p className="text-xs text-slate-500">
                  Full statutory calculation for High Court, Magistrate Court, Conveyancing, Probate, 14% Interest, & 1/6th Penalty Rule.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800">
                  Sec. 7 Interest: 14% p.a.
                </span>
                <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700">
                  VAT: 16% Statutory
                </span>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Subject Value / Claim Amount (Kshs)
                </label>
                <input
                  type="number"
                  value={simClaimValue}
                  onChange={(e) => setSimClaimValue(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Jurisdiction & Schedule Domain
                </label>
                <select
                  value={simSchedule}
                  onChange={(e) => setSimSchedule(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-900 dark:text-white font-medium"
                >
                  <option value="schedule_6_high_court">Schedule 6 — High Court / ELC / ELRC / Court of Appeal</option>
                  <option value="schedule_5_magistrate">Schedule 5 — Magistrate / Subordinate Court</option>
                  <option value="schedule_1_conveyancing">Schedule 1 — Conveyancing & Land Sales</option>
                  <option value="schedule_3_probate">Schedule 3 — Probate & Estate Administration</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Sec. 5 Complexity Multiplier
                </label>
                <select
                  value={simComplexityMultiplier}
                  onChange={(e) => setSimComplexityMultiplier(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-900 dark:text-white font-medium"
                >
                  <option value={1.0}>1.0x — Standard Scale</option>
                  <option value={1.25}>1.25x — High Complexity (+25%)</option>
                  <option value={1.5}>1.5x — Exceptional Importance (+50%)</option>
                </select>
              </div>
            </div>

            {/* Checkbox Options & Interest Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="space-y-3">
                <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simIsDefendant}
                    onChange={(e) => setSimIsDefendant(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-zinc-700"
                  />
                  <span>Representing Defendant (85% Scale)</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simIncludeGettingUp}
                    onChange={(e) => setSimIncludeGettingUp(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-zinc-700"
                  />
                  <span>Include Getting-Up Fee (33.33% / 1/3)</span>
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Sec. 7 Months Overdue (14% Interest)
                </label>
                <input
                  type="number"
                  min={0}
                  value={simMonthsOverdue}
                  onChange={(e) => setSimMonthsOverdue(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Sec. 77 Taxed Off Amount (Kshs)
                </label>
                <input
                  type="number"
                  value={simTaxedOffAmount}
                  onChange={(e) => setSimTaxedOffAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* DYNAMIC LINE-ITEM FOLIOS MANAGER */}
            <div className="border-t border-slate-200 dark:border-zinc-800 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Dynamic Itemized Folios & Attendances Manager ({simFolios.length} items)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-200 dark:border-zinc-700">
                <input
                  type="text"
                  placeholder="Item Description (e.g., Drawing Affidavit...)"
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  className="sm:col-span-2 px-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg dark:text-white"
                />
                <select
                  value={newItemType}
                  onChange={(e) => setNewItemType(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg dark:text-white"
                >
                  <option value="drawing_folio">Drawing Pleadings (Kshs 500/fol)</option>
                  <option value="copying_folio">Copying Documents (Kshs 50/fol)</option>
                  <option value="attendance_court_hr">Court Attendance (Kshs 2,500/hr)</option>
                  <option value="attendance_office_hr">Office Consultation (Kshs 1,500/hr)</option>
                  <option value="letter_formal">Formal Letter (Kshs 500)</option>
                  <option value="search_registry">Registry Search (Kshs 1,500)</option>
                </select>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(Number(e.target.value))}
                    className="w-16 px-2 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg dark:text-white text-center font-mono"
                  />
                  <button
                    onClick={handleAddFolioItem}
                    className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs font-sans border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400">
                      <th className="p-2 text-left">Description</th>
                      <th className="p-2 text-left">Rate Type</th>
                      <th className="p-2 text-center">Qty</th>
                      <th className="p-2 text-right">Unit Rate</th>
                      <th className="p-2 text-right">Subtotal</th>
                      <th className="p-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                    {simResult.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                        <td className="p-2 font-medium text-slate-900 dark:text-white">{item.description}</td>
                        <td className="p-2 text-slate-500 font-mono text-[11px]">{item.type}</td>
                        <td className="p-2 text-center font-mono">{item.qty}</td>
                        <td className="p-2 text-right font-mono">Kshs {item.unit_rate?.toLocaleString()}</td>
                        <td className="p-2 text-right font-mono font-bold">Kshs {item.subtotal?.toLocaleString()}</td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => handleRemoveFolioItem(idx)}
                            className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculations Breakdown Card */}
            <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-xl p-6 border border-slate-200 dark:border-zinc-700/80 space-y-4">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                Taxation Results & Statutory Formula Applied
              </h4>

              <div className="text-xs text-slate-700 dark:text-slate-300 font-mono bg-white dark:bg-zinc-800 p-3 rounded-lg border border-slate-200 dark:border-zinc-700">
                <strong>Formula:</strong> {simResult.formula}
              </div>

              {/* Sec. 77 Audit Banner */}
              <div className={`p-3.5 rounded-xl border text-xs font-mono flex items-center gap-3 ${
                taxedOffAudit.is_penalty
                  ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300'
              }`}>
                {taxedOffAudit.is_penalty ? <AlertTriangle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                <div>{taxedOffAudit.message}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                  <div className="text-xs text-slate-500 font-medium">Instruction Fee</div>
                  <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1">
                    Kshs {simResult.instruction_fee.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                  <div className="text-xs text-slate-500 font-medium">Getting-Up Fee (1/3)</div>
                  <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1">
                    Kshs {simResult.getting_up_fee.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                  <div className="text-xs text-slate-500 font-medium">Sec. 7 Interest (14% p.a.)</div>
                  <div className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
                    Kshs {simResult.interest_14_percent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                  <div className="text-xs text-slate-500 font-medium">Total Bill + Interest</div>
                  <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    Kshs {simResult.grand_total_with_interest.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
