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
  Scale
} from 'lucide-react';

import {
  calculate_bill_of_costs,
  calculate_high_court_instruction_fee,
  calculate_subordinate_court_instruction_fee
} from '../../engine/remuneration_engine';

export const RemunerationGuideView: React.FC = () => {
  // Viewer State
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'gazette' | 'simulator' | 'schedules'>('gazette');

  // Interactive Math Simulator State
  const [simClaimValue, setSimClaimValue] = useState<number>(30820193.28);
  const [simCourt, setSimCourt] = useState<'schedule_6_high_court' | 'schedule_5_magistrate'>('schedule_6_high_court');
  const [simIsDefendant, setSimIsDefendant] = useState(false);
  const [simIncludeGettingUp, setSimIncludeGettingUp] = useState(true);
  const [simDisbursements, setSimDisbursements] = useState<number>(15000);

  // Folio Items State
  const [simFolios, setSimFolios] = useState([
    { description: 'Drawing Pleadings, Plaint & Plain Statements', type: 'drawing_folio', qty: 25 },
    { description: 'Copying Documents for Court & Adverse Parties', type: 'copying_folio', qty: 120 },
    { description: 'Attending High Court Hearing (2 Hours)', type: 'attendance_court_hr', qty: 2 },
    { description: 'Office Consultation & Instructions Conference', type: 'attendance_office_hr', qty: 1.5 },
    { description: 'Formal Demand & Statutory Notice Letters', type: 'letter_formal', qty: 2 }
  ]);

  // Live Math Computation using exact Python / TS Remuneration Engine logic
  const simResult = calculate_bill_of_costs(
    simClaimValue,
    simCourt,
    simIsDefendant,
    simIncludeGettingUp,
    simFolios,
    simDisbursements
  );

  const totalPages = 6;

  return (
    <div className="space-y-6 pb-12">
      {/* Sleek Minimalist PDF Toolbar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 sm:p-3 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left: Clean Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg text-xs w-full md:w-auto justify-center">
          <button
            onClick={() => setActiveTab('gazette')}
            className={`px-3.5 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              activeTab === 'gazette'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            PDF Gazette
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3.5 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Math Simulator
          </button>
          <button
            onClick={() => setActiveTab('schedules')}
            className={`px-3.5 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              activeTab === 'schedules'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Schedules
          </button>
        </div>

        {/* Center: Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Gazette / Rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 dark:text-white placeholder-slate-400"
          />
        </div>

        {/* Right: Controls (Zoom, Pagination, Print, External Link) */}
        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
          {/* Zoom controls */}
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

          {/* Page Selector (visible in Gazette mode) */}
          {activeTab === 'gazette' && (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-mono text-slate-700 dark:text-slate-300">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-0.5 disabled:opacity-30 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-semibold px-1">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-0.5 disabled:opacity-30 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Print */}
          <button
            onClick={() => window.print()}
            className="p-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg border border-slate-200 dark:border-zinc-700 cursor-pointer"
            title="Print Gazette Document"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Official Gazette Link */}
          <a
            href="https://new.kenyalaw.org/akn/ke/act/ln/1962/64/eng@2022-12-31"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Official Gazette
          </a>
        </div>
      </div>

      {/* TAB 1: PDF GAZETTE DOCUMENT VIEWER */}
      {activeTab === 'gazette' && (
        <div className="flex justify-center overflow-x-auto py-2">
          <div
            className="bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 shadow-xl rounded-sm p-8 sm:p-12 text-slate-900 dark:text-slate-100 font-serif leading-relaxed transition-all duration-200"
            style={{
              width: `${(zoomLevel / 100) * 800}px`,
              minHeight: '1050px',
              maxWidth: '100%'
            }}
          >
            {/* Header Stamp */}
            <div className="text-center border-b-2 border-slate-900 dark:border-slate-100 pb-6 mb-8">
              <div className="text-xs uppercase tracking-widest font-sans font-bold text-slate-500 mb-1">
                REPUBLIC OF KENYA
              </div>
              <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight font-sans">
                THE KENYA GAZETTE SUPPLEMENT
              </h1>
              <div className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-1">
                LEGAL NOTICE NO. 64 / 1962 (ed. 2022) & L.N. 35 / 2014
              </div>
              <div className="text-xs italic font-sans text-slate-500 mt-2">
                Published by Authority of the High Court of Kenya & National Council for Law Reporting
              </div>
            </div>

            {/* Page Content Renderer */}
            {currentPage === 1 && (
              <div className="space-y-6 text-sm">
                <div className="text-center font-bold font-sans uppercase tracking-wider text-base mb-4">
                  THE ADVOCATES (REMUNERATION) ORDER
                </div>

                <p className="text-justify indent-6">
                  <strong>IN EXERCISE</strong> of the powers conferred by section 48 of the Advocates Act, the Chief Justice, on the recommendation of the Council of the Law Society of Kenya, makes the following Order:—
                </p>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold font-sans text-xs uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800 pb-1 mb-2">
                      1. Citation & Commencement
                    </h3>
                    <p className="text-justify indent-6">
                      This Order may be cited as the Advocates (Remuneration) Order, and shall apply to all bills of costs taxed or rendered after the commencement hereof in respect of contentious and non-contentious legal business.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold font-sans text-xs uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800 pb-1 mb-2">
                      2. Application of Schedules
                    </h3>
                    <p className="text-justify indent-6">
                      The remuneration of an advocate of the High Court of Kenya in respect of business transacted by him shall be regulated as follows:
                    </p>
                    <ul className="list-disc pl-8 space-y-1.5 text-xs font-sans mt-2">
                      <li><strong>Schedule 1 (Conveyancing & Sales):</strong> Applies to sales, purchases, mortgages, charges, and leases of immovable property.</li>
                      <li><strong>Schedule 2 (Company Formations & Debentures):</strong> Applies to corporate securities, debentures, and company formation.</li>
                      <li><strong>Schedule 3 (Probate & Administration):</strong> Applies to grant applications, resealing, and administration of estates.</li>
                      <li><strong>Schedule 4 (Trademarks & Patents):</strong> Applies to intellectual property registrations, oppositions, and assignments.</li>
                      <li><strong>Schedule 5 (Subordinate Courts):</strong> Applies to civil litigation in Magistrate's Courts.</li>
                      <li><strong>Schedule 6 (Superior Courts):</strong> Applies to contentious business in the High Court, Environment & Land Court (ELC), Employment & Labour Relations Court (ELRC), Court of Appeal, and Supreme Court.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold font-sans text-xs uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800 pb-1 mb-2">
                      3. Statutory Minimum Instruction Fee Rules
                    </h3>
                    <p className="text-justify indent-6">
                      No advocate shall charge, and no Taxing Officer shall allow, an instruction fee lower than the prescribed statutory minimum set out in the relevant Schedule, except where explicitly directed by a Judge of the Superior Court for exceptional recorded reasons.
                    </p>
                  </div>
                </div>

                <div className="mt-12 pt-4 border-t border-slate-200 dark:border-zinc-800 flex justify-between text-[11px] font-mono text-slate-500 font-sans">
                  <span>KENYA GAZETTE SUPPLEMENT NO. 64</span>
                  <span>PAGE 1 OF 6</span>
                </div>
              </div>
            )}

            {currentPage === 2 && (
              <div className="space-y-6 text-sm">
                <div className="text-center font-bold font-sans uppercase tracking-wider text-sm mb-4">
                  SCHEDULE 6 — CONTENTIOUS BUSINESS (HIGH COURT & SUPERIOR COURTS)
                </div>

                <p className="text-justify indent-6">
                  Instruction fees to sue or defend in civil proceedings in the High Court, Environment & Land Court, or Employment & Labour Relations Court where the value of the subject matter can be ascertained:
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-sans border-collapse border border-slate-300 dark:border-zinc-700">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-zinc-800">
                        <th className="border border-slate-300 dark:border-zinc-700 p-2 text-left">Value of Subject Matter (Kshs)</th>
                        <th className="border border-slate-300 dark:border-zinc-700 p-2 text-left">Plaintiff Instruction Fee Formula</th>
                        <th className="border border-slate-300 dark:border-zinc-700 p-2 text-left">Statutory Minimum</th>
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

                <div className="space-y-3 font-sans text-xs">
                  <h4 className="font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Defendant's Instruction Fee Rules:
                  </h4>
                  <p className="text-justify indent-4">
                    The instruction fee to defend an action is calculated at <strong>85%</strong> of the Plaintiff's instruction fee scale, subject to a statutory minimum defendant fee of <strong>Kshs 50,000</strong>.
                  </p>

                  <h4 className="font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mt-4">
                    Getting-Up Fee (Schedule 6 Item 2):
                  </h4>
                  <p className="text-justify indent-4">
                    Where a notice of trial or hearing date has been served, or the matter is set down for hearing, an additional <strong>Getting-Up Fee</strong> equal to <strong>33.33% (1/3)</strong> of the allowed instruction fee shall be allowed to the advocate preparing for trial.
                  </p>
                </div>

                <div className="mt-12 pt-4 border-t border-slate-200 dark:border-zinc-800 flex justify-between text-[11px] font-mono text-slate-500 font-sans">
                  <span>KENYA GAZETTE SUPPLEMENT NO. 64</span>
                  <span>PAGE 2 OF 6</span>
                </div>
              </div>
            )}

            {currentPage === 3 && (
              <div className="space-y-6 text-sm">
                <div className="text-center font-bold font-sans uppercase tracking-wider text-sm mb-4">
                  SCHEDULE 5 — CIVIL LITIGATION IN SUBORDINATE (MAGISTRATE) COURTS
                </div>

                <p className="text-justify indent-6">
                  Instruction fees in civil suits in Subordinate Courts governed by the Civil Procedure Rules:
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-sans border-collapse border border-slate-300 dark:border-zinc-700">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-zinc-800">
                        <th className="border border-slate-300 dark:border-zinc-700 p-2 text-left">Claim Value (Kshs)</th>
                        <th className="border border-slate-300 dark:border-zinc-700 p-2 text-left">Magistrate Scale Formula</th>
                        <th className="border border-slate-300 dark:border-zinc-700 p-2 text-left">Minimum Fee</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2">Up to 100,000</td>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2 font-mono">Kshs 20,000 fixed</td>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2 font-mono">Kshs 30,000</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2">100,001 to 500,000</td>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2 font-mono">Kshs 30,000 + 5.0% of excess over 100k</td>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2 font-mono">Kshs 30,000</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2">500,001 to 1,000,000</td>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2 font-mono">Kshs 50,000 + 3.0% of excess over 500k</td>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2 font-mono">Kshs 50,000</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2">Over 1,000,000</td>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2 font-mono">Kshs 65,000 + 2.0% of excess over 1M</td>
                        <td className="border border-slate-300 dark:border-zinc-700 p-2 font-mono">Kshs 65,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="space-y-4 font-sans text-xs">
                  <h4 className="font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Statutory Itemized Folio Scale Rates (Schedule 6 Item 6):
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg">
                      <div className="font-bold text-slate-900 dark:text-white">Drawing Pleadings / Affidavits</div>
                      <div className="font-mono text-slate-600 dark:text-slate-400 mt-1">Kshs 500 per folio (100 words)</div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg">
                      <div className="font-bold text-slate-900 dark:text-white">Copying Documents</div>
                      <div className="font-mono text-slate-600 dark:text-slate-400 mt-1">Kshs 50 per folio (100 words)</div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg">
                      <div className="font-bold text-slate-900 dark:text-white">Court Attendance Rate</div>
                      <div className="font-mono text-slate-600 dark:text-slate-400 mt-1">Kshs 2,500 per hour</div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg">
                      <div className="font-bold text-slate-900 dark:text-white">Office Conference & Attendances</div>
                      <div className="font-mono text-slate-600 dark:text-slate-400 mt-1">Kshs 1,500 per hour</div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-4 border-t border-slate-200 dark:border-zinc-800 flex justify-between text-[11px] font-mono text-slate-500 font-sans">
                  <span>KENYA GAZETTE SUPPLEMENT NO. 64</span>
                  <span>PAGE 3 OF 6</span>
                </div>
              </div>
            )}

            {currentPage === 4 && (
              <div className="space-y-6 text-sm">
                <div className="text-center font-bold font-sans uppercase tracking-wider text-sm mb-4">
                  TAXATION OF COSTS & TAXING OFFICER'S DISCRETIONARY POWERS
                </div>

                <div className="space-y-4 font-sans text-xs">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                      1. General Principles of Taxation (Paragraph 11)
                    </h3>
                    <p className="text-justify indent-4 leading-relaxed">
                      On every taxation, the Taxing Officer shall allow all such costs, charges, and expenses as appear to him to have been necessary or proper for the attainment of justice or for defending the rights of any party, but, save as against the party who incurred them, no costs shall be allowed which appear to the Taxing Officer to have been incurred through over-caution, negligence, or mistake.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                      2. Certificate of Urgency & Injunction Applications
                    </h3>
                    <p className="text-justify indent-4 leading-relaxed">
                      In applications for injunctions, stay of execution, or certificated urgent motions, the Taxing Officer may increase the instruction fee by up to <strong>50%</strong> to reflect the specialized skill, urgency, and novelty of legal issues involved.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                      3. Value Added Tax (VAT 16%) Treatment
                    </h3>
                    <p className="text-justify indent-4 leading-relaxed">
                      Pursuant to the Value Added Tax Act, 16% VAT is chargeable on all taxable legal fees (instruction fees, getting-up fees, and itemized folios) and shall be added to the taxed subtotal before adding non-taxable court disbursements.
                    </p>
                  </div>
                </div>

                <div className="mt-12 pt-4 border-t border-slate-200 dark:border-zinc-800 flex justify-between text-[11px] font-mono text-slate-500 font-sans">
                  <span>KENYA GAZETTE SUPPLEMENT NO. 64</span>
                  <span>PAGE 4 OF 6</span>
                </div>
              </div>
            )}

            {currentPage >= 5 && (
              <div className="space-y-6 text-sm">
                <div className="text-center font-bold font-sans uppercase tracking-wider text-sm mb-4">
                  SCHEDULE 1 & SCHEDULE 2 — CONVEYANCING & CORPORATE FINANCE
                </div>

                <div className="space-y-4 font-sans text-xs">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                      Schedule 1: Sales, Purchases & Charges Scale
                    </h3>
                    <p className="text-justify indent-4 leading-relaxed">
                      For advocate representing Vendor or Purchaser in sales of land: Minimum fee Kshs 35,000 for value up to Kshs 1,000,000. Over Kshs 1,000,000, 2.0% on first Kshs 5M, 1.5% on next Kshs 5M, 1.0% on next Kshs 10M, and 0.75% on excess over Kshs 20M.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                      Schedule 2: Debentures & Company Securities
                    </h3>
                    <p className="text-justify indent-4 leading-relaxed">
                      For preparing and registering corporate debentures and commercial loan securities: Scale charged on total principal sum secured, minimum fee Kshs 50,000.
                    </p>
                  </div>
                </div>

                <div className="mt-12 pt-4 border-t border-slate-200 dark:border-zinc-800 flex justify-between text-[11px] font-mono text-slate-500 font-sans">
                  <span>KENYA GAZETTE SUPPLEMENT NO. 64</span>
                  <span>PAGE {currentPage} OF 6</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE MATH SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Kenya Legal Remuneration Math Simulator
                </h3>
                <p className="text-xs text-slate-500">
                  Computes exact instruction fees, getting-up fees, itemized folios, 16% VAT, and court disbursements per L.N. 64/1962 & L.N. 35/2014.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700">
                  VAT: 16% Statutory Rate
                </span>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Claim Amount */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Claim Value (Kshs)
                </label>
                <input
                  type="number"
                  value={simClaimValue}
                  onChange={(e) => setSimClaimValue(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              {/* Court Schedule Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Court Jurisdiction & Scale
                </label>
                <select
                  value={simCourt}
                  onChange={(e) => setSimCourt(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-900 dark:text-white font-medium"
                >
                  <option value="schedule_6_high_court">Schedule 6 — High Court / ELC / ELRC / Court of Appeal</option>
                  <option value="schedule_5_magistrate">Schedule 5 — Magistrate / Subordinate Court</option>
                </select>
              </div>

              {/* Options Checkboxes */}
              <div className="space-y-3 pt-4">
                <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simIsDefendant}
                    onChange={(e) => setSimIsDefendant(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-zinc-700"
                  />
                  <span>Representing Defendant (85% Scale Rate)</span>
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
            </div>

            {/* Calculations Breakdown Card */}
            <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-xl p-6 border border-slate-200 dark:border-zinc-700/80 space-y-4">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                Taxation Breakdown & Formula Applied
              </h4>

              <div className="text-xs text-slate-700 dark:text-slate-300 font-mono bg-white dark:bg-zinc-800 p-3 rounded-lg border border-slate-200 dark:border-zinc-700">
                <strong>Formula:</strong> {simResult.formula}
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
                  <div className="text-xs text-slate-500 font-medium">16% VAT Subtotal</div>
                  <div className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
                    Kshs {simResult.vat_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                  <div className="text-xs text-slate-500 font-medium">Grand Total Taxed Bill</div>
                  <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    Kshs {simResult.grand_total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SCHEDULES QUICK LOOKUP INDEX */}
      {activeTab === 'schedules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Schedule 1 — Conveyancing & Property</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Covers sales, purchases, land transfers, mortgages, charges, and lease agreements.
            </p>
            <div className="text-xs font-mono bg-slate-50 dark:bg-zinc-800 p-3 rounded-lg border border-slate-200 dark:border-zinc-700">
              Minimum fee: Kshs 35,000 for sales up to Kshs 1,000,000.
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Schedule 6 — Superior Courts Litigation</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              High Court, ELC, ELRC, Court of Appeal, Supreme Court contentious proceedings.
            </p>
            <div className="text-xs font-mono bg-slate-50 dark:bg-zinc-800 p-3 rounded-lg border border-slate-200 dark:border-zinc-700">
              Minimum fee: Kshs 75,000 (Plaintiff) / Kshs 50,000 (Defendant).
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
