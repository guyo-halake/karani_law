// Republic of Kenya — The Advocates (Remuneration) Order (Legal Notice 64 of 1962)
// Consolidated up to L.N. 221 of 2023 (24th Annual Supplement)
// Official Kenya Law Digital Publication & Statutory Scale Math Engine

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Scale,
  Calculator,
  Search,
  BookOpen,
  FileText,
  Printer,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  X,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  Building,
  Gavel,
  Shield,
  HelpCircle
} from 'lucide-react';

import {
  STATUTORY_METADATA,
  STATUTORY_PARTS,
  STATUTORY_SECTIONS,
  STATUTORY_SCHEDULES_FULL,
  StatutorySection,
  StatutoryScheduleDetail
} from './statutory_order_data';

export const RemunerationGuideView: React.FC = () => {
  // Navigation & Search State
  const [tocSearch, setTocSearch] = useState('');
  const [activeSectionId, setActiveSectionId] = useState<string>('sec-1');
  const [expandedParts, setExpandedParts] = useState<{ [key: string]: boolean }>({
    part_I: true,
    part_II: true,
    part_III: true,
    schedules: true
  });
  const [activeHeaderTab, setActiveHeaderTab] = useState<'reader' | 'detail' | 'history' | 'citations' | 'related'>('reader');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  // Slide-over Math Engine Calculator State
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [calcSchedule, setCalcSchedule] = useState<string>('sched1_sale');
  const [calcValue, setCalcValue] = useState<number>(10000000);
  const [isAdvocateClient, setIsAdvocateClient] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // References for smooth scrolling
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const togglePart = (partId: string) => {
    setExpandedParts(prev => ({ ...prev, [partId]: !prev[partId] }));
  };

  const scrollToSection = (id: string) => {
    setActiveSectionId(id);
    setActiveHeaderTab('reader');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    if (!tocSearch.trim()) return STATUTORY_SECTIONS;
    const q = tocSearch.toLowerCase();
    return STATUTORY_SECTIONS.filter(
      s => s.number.toLowerCase().includes(q) ||
           s.title.toLowerCase().includes(q) ||
           s.content.toLowerCase().includes(q)
    );
  }, [tocSearch]);

  const filteredSchedules = useMemo(() => {
    if (!tocSearch.trim()) return STATUTORY_SCHEDULES_FULL;
    const q = tocSearch.toLowerCase();
    return STATUTORY_SCHEDULES_FULL.filter(
      s => s.title.toLowerCase().includes(q) ||
           s.shortTitle.toLowerCase().includes(q) ||
           s.scales.some(sc => sc.name.toLowerCase().includes(q) || sc.rules.some(r => r.toLowerCase().includes(q)))
    );
  }, [tocSearch]);

  // Real Mathematical Scale Calculator Engine
  const calculationResult = useMemo(() => {
    const val = Number(calcValue) || 0;
    let baseFee = 0;
    let formulaSteps: string[] = [];
    let statutoryRef = '';

    switch (calcSchedule) {
      case 'sched1_sale': {
        // Schedule 1 First Scale: Sales and Purchases
        statutoryRef = 'Schedule 1, First Scale (Sales & Purchases)';
        if (val <= 5000000) {
          const raw = val * 0.02;
          baseFee = Math.max(35000, raw);
          formulaSteps.push(`Tier 1 (Up to KES 5,000,000): 2% of KES ${val.toLocaleString()} = KES ${raw.toLocaleString()}`);
          if (raw < 35000) formulaSteps.push(`Statutory minimum floor applied: KES 35,000`);
        } else if (val <= 100000000) {
          const t1 = 5000000 * 0.02; // 100,000
          const rem = val - 5000000;
          const t2 = rem * 0.015;
          baseFee = t1 + t2;
          formulaSteps.push(`Tier 1 (First KES 5M @ 2%): KES ${t1.toLocaleString()}`);
          formulaSteps.push(`Tier 2 (KES ${rem.toLocaleString()} @ 1.5%): KES ${t2.toLocaleString()}`);
        } else if (val <= 250000000) {
          const t1 = 100000;
          const t2 = 95000000 * 0.015; // 1,425,000 (total = 1,525,000)
          const rem = val - 100000000;
          const t3 = rem * 0.0125;
          baseFee = t1 + t2 + t3;
          formulaSteps.push(`Tiers 1 & 2 (Up to KES 100M): KES 1,525,000`);
          formulaSteps.push(`Tier 3 (KES ${rem.toLocaleString()} @ 1.25%): KES ${t3.toLocaleString()}`);
        } else if (val <= 1000000000) {
          const prior = 1525000 + (150000000 * 0.0125); // 1,525,000 + 1,875,000 = 3,400,000
          const rem = val - 250000000;
          const t4 = rem * 0.01;
          baseFee = prior + t4;
          formulaSteps.push(`Prior Tiers (Up to KES 250M): KES 3,400,000`);
          formulaSteps.push(`Tier 4 (KES ${rem.toLocaleString()} @ 1.0%): KES ${t4.toLocaleString()}`);
        } else {
          const prior = 3400000 + (750000000 * 0.01); // 10,900,000
          const rem = val - 1000000000;
          const t5 = rem * 0.001;
          baseFee = prior + t5;
          formulaSteps.push(`Prior Tiers (Up to KES 1 Billion): KES 10,900,000`);
          formulaSteps.push(`Tier 5 (Excess KES ${rem.toLocaleString()} @ 0.1%): KES ${t5.toLocaleString()}`);
        }
        break;
      }

      case 'sched1_mortgage_grantee': {
        // Schedule 1 Second Scale: Creation of Security (Grantee Advocate)
        statutoryRef = 'Schedule 1, Second Scale, Paragraph 2(b) (Grantee Creation)';
        if (val <= 2500000) {
          const raw = val * 0.02;
          baseFee = Math.max(28000, raw);
          formulaSteps.push(`Tier 1 (Up to KES 2.5M @ 2%): KES ${raw.toLocaleString()}`);
          if (raw < 28000) formulaSteps.push(`Statutory minimum floor applied: KES 28,000`);
        } else if (val <= 5000000) {
          const t1 = 2500000 * 0.02; // 50,000
          const t2 = (val - 2500000) * 0.0175;
          baseFee = t1 + t2;
          formulaSteps.push(`Tier 1 (First KES 2.5M @ 2%): KES ${t1.toLocaleString()}`);
          formulaSteps.push(`Tier 2 (Balance @ 1.75%): KES ${t2.toLocaleString()}`);
        } else if (val <= 100000000) {
          const t12 = 50000 + (2500000 * 0.0175); // 93,750
          const t3 = (val - 5000000) * 0.01;
          baseFee = t12 + t3;
          formulaSteps.push(`Tiers 1 & 2 (Up to KES 5M): KES 93,750`);
          formulaSteps.push(`Tier 3 (Balance @ 1.0%): KES ${t3.toLocaleString()}`);
        } else if (val <= 250000000) {
          const prior = 93750 + (95000000 * 0.01); // 1,043,750
          const t4 = (val - 100000000) * 0.0075;
          baseFee = prior + t4;
          formulaSteps.push(`Prior Tiers (Up to KES 100M): KES 1,043,750`);
          formulaSteps.push(`Tier 4 (Balance @ 0.75%): KES ${t4.toLocaleString()}`);
        } else if (val <= 1000000000) {
          const prior = 1043750 + (150000000 * 0.0075); // 2,168,750
          const t5 = (val - 250000000) * 0.0015;
          baseFee = prior + t5;
          formulaSteps.push(`Prior Tiers (Up to KES 250M): KES 2,168,750`);
          formulaSteps.push(`Tier 5 (Balance @ 0.15%): KES ${t5.toLocaleString()}`);
        } else {
          const prior = 2168750 + (750000000 * 0.0015); // 3,293,750
          const t6 = (val - 1000000000) * 0.001;
          baseFee = prior + t6;
          formulaSteps.push(`Prior Tiers (Up to KES 1 Billion): KES 3,293,750`);
          formulaSteps.push(`Tier 6 (Excess Balance @ 0.1%): KES ${t6.toLocaleString()}`);
        }
        break;
      }

      case 'sched1_mortgage_grantor': {
        // Schedule 1 Second Scale, Paragraph 2(d): Grantor creation is 50% of grantee fee
        statutoryRef = 'Schedule 1, Second Scale, Paragraph 2(d) (Grantor Creation: 50%)';
        // Compute grantee fee first
        let granteeFee = 0;
        if (val <= 2500000) granteeFee = Math.max(28000, val * 0.02);
        else if (val <= 5000000) granteeFee = 50000 + (val - 2500000) * 0.0175;
        else if (val <= 100000000) granteeFee = 93750 + (val - 5000000) * 0.01;
        else if (val <= 250000000) granteeFee = 1043750 + (val - 100000000) * 0.0075;
        else if (val <= 1000000000) granteeFee = 2168750 + (val - 250000000) * 0.0015;
        else granteeFee = 3293750 + (val - 1000000000) * 0.001;

        baseFee = granteeFee * 0.5;
        formulaSteps.push(`Grantee Creation Base Scale Fee: KES ${granteeFee.toLocaleString()}`);
        formulaSteps.push(`Grantor Advocate Entitlement (50% of Grantee): KES ${baseFee.toLocaleString()}`);
        break;
      }

      case 'sched2_lease': {
        // Schedule 2: Leases at a Rack Rent
        statutoryRef = 'Schedule 2, Paragraph 1 (Preparation of Lease)';
        if (val <= 500000) {
          const raw = val * 0.15;
          baseFee = Math.max(20000, raw);
          formulaSteps.push(`Band 1 (Up to KES 500,000 @ 15%): KES ${raw.toLocaleString()}`);
          if (raw < 20000) formulaSteps.push(`Statutory minimum floor applied: KES 20,000`);
        } else if (val <= 3000000) {
          const t1 = 500000 * 0.15; // 75,000
          const t2 = (val - 500000) * 0.03;
          baseFee = t1 + t2;
          formulaSteps.push(`Band 1 (First KES 500,000 @ 15%): KES ${t1.toLocaleString()}`);
          formulaSteps.push(`Band 2 (KES ${(val - 500000).toLocaleString()} @ 3%): KES ${t2.toLocaleString()}`);
        } else {
          const prior = (500000 * 0.15) + (2500000 * 0.03); // 75,000 + 75,000 = 150,000
          const t3 = (val - 3000000) * 0.01;
          baseFee = prior + t3;
          formulaSteps.push(`Bands 1 & 2 (Up to KES 3,000,000): KES 150,000`);
          formulaSteps.push(`Band 3 (Excess KES ${(val - 3000000).toLocaleString()} @ 1%): KES ${t3.toLocaleString()}`);
        }
        break;
      }

      case 'sched6_hc_defended': {
        // Schedule 6: High Court Instruction Fee (Defended)
        statutoryRef = 'Schedule 6, Item 1(b) (High Court Defended Suit)';
        if (val <= 500000) {
          baseFee = 75000;
          formulaSteps.push(`Value up to KES 500,000: Fixed scale fee KES 75,000`);
        } else if (val <= 750000) {
          baseFee = 90000;
          formulaSteps.push(`Value KES 500,001 - 750,000: Fixed scale fee KES 90,000`);
        } else if (val <= 1000000) {
          baseFee = 120000;
          formulaSteps.push(`Value KES 750,001 - 1,000,000: Fixed scale fee KES 120,000`);
        } else if (val <= 20000000) {
          const t1 = 120000;
          const rem = val - 1000000;
          const t2 = rem * 0.02;
          baseFee = t1 + t2;
          formulaSteps.push(`Base fee for KES 1,000,000: KES 120,000`);
          formulaSteps.push(`Additional 2.0% on balance (KES ${rem.toLocaleString()}): KES ${t2.toLocaleString()}`);
        } else {
          const prior = 120000 + (19000000 * 0.02); // 120,000 + 380,000 = 500,000
          const rem = val - 20000000;
          const t3 = rem * 0.015;
          baseFee = prior + t3;
          formulaSteps.push(`Base fee for KES 20,000,000: KES 500,000`);
          formulaSteps.push(`Additional 1.5% on balance over 20M (KES ${rem.toLocaleString()}): KES ${t3.toLocaleString()}`);
        }
        break;
      }

      case 'sched7_sub_defended': {
        // Schedule 7: Subordinate Courts Higher Scale (Defended)
        statutoryRef = 'Schedule 7, Item 1 (Subordinate Court Defended Higher Scale)';
        if (val <= 50000) baseFee = 15000;
        else if (val <= 100000) baseFee = 30000;
        else if (val <= 200000) baseFee = 40000;
        else if (val <= 500000) baseFee = 65000;
        else if (val <= 1000000) baseFee = 90000;
        else if (val <= 2000000) baseFee = 120000;
        else {
          const rem = val - 2000000;
          baseFee = 120000 + (rem * 0.025);
          formulaSteps.push(`Base fee for KES 2,000,000: KES 120,000`);
          formulaSteps.push(`Additional 2.5% on balance (KES ${rem.toLocaleString()}): KES ${(rem * 0.025).toLocaleString()}`);
        }
        if (formulaSteps.length === 0) {
          formulaSteps.push(`Value KES ${val.toLocaleString()} falls in statutory band: KES ${baseFee.toLocaleString()}`);
        }
        break;
      }

      case 'sched10_probate': {
        // Schedule 10: Probate Gross Capital Value
        statutoryRef = 'Schedule 10, Item 1(a) (Probate / Administration Grant)';
        if (val <= 1000000) {
          baseFee = val * 0.05;
          formulaSteps.push(`Gross Capital Value up to KES 1,000,000: 5% of KES ${val.toLocaleString()} = KES ${baseFee.toLocaleString()}`);
        } else {
          const t1 = 1000000 * 0.05; // 50,000
          const rem = val - 1000000;
          const t2 = rem * 0.01;
          baseFee = t1 + t2;
          formulaSteps.push(`First KES 1,000,000 @ 5%: KES 50,000`);
          formulaSteps.push(`Excess over KES 1,000,000 @ 1%: KES ${t2.toLocaleString()}`);
        }
        break;
      }

      default:
        baseFee = 0;
    }

    const finalFee = isAdvocateClient ? baseFee * 1.5 : baseFee;
    if (isAdvocateClient) {
      formulaSteps.push(`Advocate & Client Statutory Uplift (+50% under Part B): KES ${(baseFee * 0.5).toLocaleString()}`);
    }

    return {
      baseFee,
      finalFee,
      statutoryRef,
      formulaSteps
    };
  }, [calcSchedule, calcValue, isAdvocateClient]);

  const openCalculatorForSchedule = (schedKey: string, initialVal?: number) => {
    setCalcSchedule(schedKey);
    if (initialVal) setCalcValue(initialVal);
    setIsCalculatorOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-[#0f172a] dark:text-[#f1f5f9] font-sans antialiased">
      {/* Top Kenya Law Metadata Masthead */}
      <header className="bg-white dark:bg-[#0d131f] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Laws of Kenya · Advocates Act (Cap. 16)
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  Latest Version (L.N. 221/2023)
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white mt-0.5">
                {STATUTORY_METADATA.title}
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {STATUTORY_METADATA.legalNotice} · {STATUTORY_METADATA.gazette}
              </p>
            </div>

            {/* Quick Action Tools */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCalculatorOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs"
                title="Open Live Scale Fee Calculator"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Statutory Calculator</span>
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                title="Print statutory text"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print</span>
              </button>

              <div className="hidden sm:flex items-center border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 px-1 py-0.5 text-xs">
                <button
                  onClick={() => setFontSize('sm')}
                  className={`px-1.5 py-0.5 rounded ${fontSize === 'sm' ? 'bg-slate-200 dark:bg-slate-700 font-bold' : 'text-slate-500'}`}
                  title="Small text"
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize('base')}
                  className={`px-1.5 py-0.5 rounded ${fontSize === 'base' ? 'bg-slate-200 dark:bg-slate-700 font-bold' : 'text-slate-500'}`}
                  title="Normal text"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('lg')}
                  className={`px-1.5 py-0.5 rounded ${fontSize === 'lg' ? 'bg-slate-200 dark:bg-slate-700 font-bold' : 'text-slate-500'}`}
                  title="Large text"
                >
                  A+
                </button>
              </div>
            </div>
          </div>

          {/* Kenya Law Style Metadata Tabs */}
          <div className="flex items-center gap-6 border-t border-slate-100 dark:border-slate-800/80 pt-2 text-xs font-medium">
            <button
              onClick={() => setActiveHeaderTab('reader')}
              className={`pb-2 border-b-2 transition-colors ${
                activeHeaderTab === 'reader'
                  ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Document Content
            </button>
            <button
              onClick={() => setActiveHeaderTab('detail')}
              className={`pb-2 border-b-2 transition-colors ${
                activeHeaderTab === 'detail'
                  ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Document Detail
            </button>
            <button
              onClick={() => setActiveHeaderTab('history')}
              className={`pb-2 border-b-2 transition-colors ${
                activeHeaderTab === 'history'
                  ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              History ({STATUTORY_METADATA.amendmentHistory.length} Amendments)
            </button>
            <button
              onClick={() => setActiveHeaderTab('citations')}
              className={`pb-2 border-b-2 transition-colors ${
                activeHeaderTab === 'citations'
                  ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Citations ({STATUTORY_METADATA.citationsCount})
            </button>
            <button
              onClick={() => setActiveHeaderTab('related')}
              className={`pb-2 border-b-2 transition-colors ${
                activeHeaderTab === 'related'
                  ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Related Documents ({STATUTORY_METADATA.relatedDocuments.length})
            </button>
          </div>
        </div>
      </header>

      {/* Tab Panels: Document Detail, History, Citations, Related */}
      {activeHeaderTab === 'detail' && (
        <section className="bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-base font-serif font-bold text-slate-900 dark:text-white mb-4">Official Document Metadata</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded border border-slate-200 dark:border-slate-700">
                <dt className="text-slate-500 dark:text-slate-400 font-medium">Citation</dt>
                <dd className="font-semibold text-slate-900 dark:text-white mt-1">{STATUTORY_METADATA.legalNotice}</dd>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded border border-slate-200 dark:border-slate-700">
                <dt className="text-slate-500 dark:text-slate-400 font-medium">Primary Enabling Act</dt>
                <dd className="font-semibold text-slate-900 dark:text-white mt-1">{STATUTORY_METADATA.primaryWork}</dd>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded border border-slate-200 dark:border-slate-700">
                <dt className="text-slate-500 dark:text-slate-400 font-medium">Commencement Date</dt>
                <dd className="font-semibold text-slate-900 dark:text-white mt-1">30 January 1962</dd>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded border border-slate-200 dark:border-slate-700">
                <dt className="text-slate-500 dark:text-slate-400 font-medium">Latest Statutory Revision</dt>
                <dd className="font-semibold text-slate-900 dark:text-white mt-1">24th Annual Supplement (L.N. 221/2023)</dd>
              </div>
            </dl>
          </div>
        </section>
      )}

      {activeHeaderTab === 'history' && (
        <section className="bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-base font-serif font-bold text-slate-900 dark:text-white mb-2">Legislative Amendment History</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Chronological record of official Legal Notices amending Legal Notice 64 of 1962 as gazetted by the Rules Committee of the High Court of Kenya.
            </p>
            <div className="max-h-72 overflow-y-auto rounded border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {STATUTORY_METADATA.amendmentHistory.map((item, idx) => (
                <div key={idx} className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-start gap-2">
                  <span className="font-mono text-slate-400 w-6 shrink-0">{idx + 1}.</span>
                  <span className="text-slate-800 dark:text-slate-200 font-mono">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeHeaderTab === 'citations' && (
        <section className="bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-base font-serif font-bold text-slate-900 dark:text-white mb-2">Key Judicial Authorities & Precedents</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Leading Superior Court decisions establishing binding legal principles on taxation of costs under the Advocates (Remuneration) Order:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <div className="font-serif font-bold text-slate-900 dark:text-white">Premchand Raichand Ltd v. Quarry Services of East Africa Ltd [1972] EA 162</div>
                <p className="mt-1 text-slate-600 dark:text-slate-300">
                  Established the governing principles for assessing instruction fees: costs should not be so low as to deter reputable practitioners nor so high as to make justice inaccessible.
                </p>
                <div className="mt-2 text-[11px] text-slate-500 font-mono">Governs Schedule 6 & 7 Instruction Fees</div>
              </div>
              <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <div className="font-serif font-bold text-slate-900 dark:text-white">Thomas James Arthur v. Nyeri Electricity Undertaking [1961] EA 492</div>
                <p className="mt-1 text-slate-600 dark:text-slate-300">
                  Defines the taxing officer's discretionary powers under paragraph 16: interference by a judge on reference under paragraph 11 is only warranted upon an error of principle.
                </p>
                <div className="mt-2 text-[11px] text-slate-500 font-mono">Governs Paragraphs 11, 16 & Schedule 6</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeHeaderTab === 'related' && (
        <section className="bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-base font-serif font-bold text-slate-900 dark:text-white mb-2">Related Statutory Frameworks</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {STATUTORY_METADATA.relatedDocuments.map((doc, idx) => (
                <div key={idx} className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
                  <div className="font-semibold text-slate-900 dark:text-white">{doc.title}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">{doc.type}</div>
                  <div className="text-slate-400 font-mono text-[11px] mt-1">{doc.ref}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Two-Column Kenya Law Document Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Kenya Law Style Table of Contents (Sticky) */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24 bg-white dark:bg-[#0d131f] rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-2xs max-h-[calc(100vh-7rem)] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Table of contents
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {filteredSections.length} secs · {filteredSchedules.length} scheds
                </span>
              </div>

              {/* Search Table of Contents Input */}
              <div className="mt-3 relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={tocSearch}
                  onChange={(e) => setTocSearch(e.target.value)}
                  placeholder="Search table of contents..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                />
                {tocSearch && (
                  <button
                    onClick={() => setTocSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Scrollable Navigation Tree */}
              <nav className="mt-3 overflow-y-auto space-y-4 pr-1 text-xs">
                {/* Part I Tree */}
                <div>
                  <button
                    onClick={() => togglePart('part_I')}
                    className="w-full flex items-center justify-between py-1 text-left font-serif font-bold text-slate-900 dark:text-slate-100 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400">{expandedParts.part_I ? '▼' : '►'}</span>
                      <span>Part I – GENERAL MATTERS</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-normal">§1–17</span>
                  </button>
                  {expandedParts.part_I && (
                    <ul className="mt-1 pl-4 space-y-1 border-l border-slate-200 dark:border-slate-800 text-[11px]">
                      {filteredSections.filter(s => s.part === 'part_I').map(s => (
                        <li key={s.number}>
                          <button
                            onClick={() => scrollToSection(`sec-${s.number}`)}
                            className={`w-full text-left py-1 px-1.5 rounded transition-colors truncate flex items-center justify-between ${
                              activeSectionId === `sec-${s.number}`
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                          >
                            <span className="truncate">{s.number}. {s.title}</span>
                            {s.engineRule && (
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0 ml-1">
                                📐
                              </span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Part II Tree */}
                <div>
                  <button
                    onClick={() => togglePart('part_II')}
                    className="w-full flex items-center justify-between py-1 text-left font-serif font-bold text-slate-900 dark:text-slate-100 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400">{expandedParts.part_II ? '▼' : '►'}</span>
                      <span>Part II – NON-CONTENTIOUS</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-normal">§18–48</span>
                  </button>
                  {expandedParts.part_II && (
                    <ul className="mt-1 pl-4 space-y-1 border-l border-slate-200 dark:border-slate-800 text-[11px]">
                      {filteredSections.filter(s => s.part === 'part_II').map(s => (
                        <li key={s.number}>
                          <button
                            onClick={() => scrollToSection(`sec-${s.number}`)}
                            className={`w-full text-left py-1 px-1.5 rounded transition-colors truncate flex items-center justify-between ${
                              activeSectionId === `sec-${s.number}`
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                          >
                            <span className="truncate">{s.number}. {s.title}</span>
                            {s.engineRule && (
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0 ml-1">
                                📐
                              </span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Part III Tree */}
                <div>
                  <button
                    onClick={() => togglePart('part_III')}
                    className="w-full flex items-center justify-between py-1 text-left font-serif font-bold text-slate-900 dark:text-slate-100 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400">{expandedParts.part_III ? '▼' : '►'}</span>
                      <span>Part III – TAXATION OF COSTS</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-normal">§49–79</span>
                  </button>
                  {expandedParts.part_III && (
                    <ul className="mt-1 pl-4 space-y-1 border-l border-slate-200 dark:border-slate-800 text-[11px]">
                      {filteredSections.filter(s => s.part === 'part_III').map(s => (
                        <li key={s.number}>
                          <button
                            onClick={() => scrollToSection(`sec-${s.number}`)}
                            className={`w-full text-left py-1 px-1.5 rounded transition-colors truncate flex items-center justify-between ${
                              activeSectionId === `sec-${s.number}`
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                          >
                            <span className="truncate">{s.number}. {s.title}</span>
                            {s.engineRule && (
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0 ml-1">
                                📐
                              </span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Schedules Tree */}
                <div>
                  <button
                    onClick={() => togglePart('schedules')}
                    className="w-full flex items-center justify-between py-1 text-left font-serif font-bold text-slate-900 dark:text-slate-100 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400">{expandedParts.schedules ? '▼' : '►'}</span>
                      <span>SCHEDULES (1 to 12)</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-normal">12 Scheds</span>
                  </button>
                  {expandedParts.schedules && (
                    <ul className="mt-1 pl-4 space-y-1 border-l border-slate-200 dark:border-slate-800 text-[11px]">
                      {filteredSchedules.map(sched => (
                        <li key={sched.scheduleNumber}>
                          <button
                            onClick={() => scrollToSection(`sched-${sched.scheduleNumber}`)}
                            className={`w-full text-left py-1 px-1.5 rounded transition-colors truncate flex items-center justify-between ${
                              activeSectionId === `sched-${sched.scheduleNumber}`
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                          >
                            <span className="truncate">Schedule {sched.scheduleNumber}: {sched.shortTitle.split(':')[1] || sched.shortTitle}</span>
                            <span className="text-[9px] font-mono text-slate-400 shrink-0">Scale</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </nav>
            </div>
          </aside>

          {/* Right Column: Clean, Minimalist, Official Statutory Reader */}
          <main className="lg:col-span-8 xl:col-span-9">
            <article className="bg-white dark:bg-[#0d131f] rounded-lg border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-2xs">
              {/* Document Masthead */}
              <div className="text-center pb-8 border-b border-slate-200 dark:border-slate-800">
                <div className="font-serif tracking-widest text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                  LAWS OF KENYA
                </div>
                <div className="font-serif tracking-wider text-sm font-semibold uppercase text-slate-700 dark:text-slate-300 mt-1">
                  ADVOCATES ACT
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white mt-2">
                  THE ADVOCATES (REMUNERATION) ORDER
                </h1>
                <div className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400 mt-2">
                  LEGAL NOTICE 64 OF 1962
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Published in Kenya Gazette Vol. LXIV—No. 5 on 30 January 1962 · Commenced on 30 January 1962
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 italic mt-1">
                  [As consolidated with all amendments up to Legal Notice 221 of 2023]
                </div>
              </div>

              {/* Reading Size Utility Wrapper */}
              <div className={`mt-8 space-y-12 ${
                fontSize === 'sm' ? 'text-xs leading-relaxed' :
                fontSize === 'lg' ? 'text-base leading-relaxed' :
                'text-sm leading-relaxed'
              }`}>
                {/* Part I: General Matters */}
                <section>
                  <div className="pb-3 mb-6 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                      Part I
                    </span>
                    <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-900 dark:text-white">
                      GENERAL MATTERS
                    </h2>
                  </div>

                  <div className="space-y-8">
                    {STATUTORY_SECTIONS.filter(s => s.part === 'part_I').map(sec => (
                      <div
                        key={sec.number}
                        id={`sec-${sec.number}`}
                        className={`p-4 rounded-md transition-colors ${
                          activeSectionId === `sec-${sec.number}`
                            ? 'bg-slate-50 dark:bg-slate-800/40 border-l-3 border-slate-900 dark:border-white'
                            : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-serif font-bold text-slate-900 dark:text-white">
                              {sec.number}. {sec.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {sec.engineRule && (
                              <button
                                onClick={() => {
                                  if (sec.number === '7') openCalculatorForSchedule('sched1_sale');
                                  else setIsCalculatorOpen(true);
                                }}
                                className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                                title="View calculation rule in engine"
                              >
                                <span>📐</span>
                                <span className="hidden sm:inline font-sans">{sec.engineRule.rule}</span>
                              </button>
                            )}
                            <button
                              onClick={() => copyText(`${sec.number}. ${sec.title}\n${sec.content}`, `sec-${sec.number}`)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                              title="Copy section citation"
                            >
                              {copiedId === `sec-${sec.number}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Statutory Body Text with proper formatting */}
                        <div className="mt-3 text-slate-800 dark:text-slate-200 whitespace-pre-line font-serif leading-relaxed">
                          {sec.content}
                        </div>

                        {sec.notes && (
                          <div className="mt-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                            {sec.notes}
                          </div>
                        )}

                        {sec.engineRule && (
                          <div className="mt-3 p-2.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs">
                            <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                              <span>📐 Karani Engine Statutory Rule:</span>
                              <span className="font-mono text-slate-700 dark:text-slate-300">{sec.engineRule.formula}</span>
                            </div>
                            <div className="text-slate-600 dark:text-slate-400 mt-0.5">
                              {sec.engineRule.description}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* Part II: Non-Contentious Matters */}
                <section className="pt-8 border-t border-slate-200 dark:border-slate-800">
                  <div className="pb-3 mb-6 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                      Part II
                    </span>
                    <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-900 dark:text-white">
                      NON-CONTENTIOUS MATTERS
                    </h2>
                  </div>

                  <div className="space-y-8">
                    {STATUTORY_SECTIONS.filter(s => s.part === 'part_II').map(sec => (
                      <div
                        key={sec.number}
                        id={`sec-${sec.number}`}
                        className={`p-4 rounded-md transition-colors ${
                          activeSectionId === `sec-${sec.number}`
                            ? 'bg-slate-50 dark:bg-slate-800/40 border-l-3 border-slate-900 dark:border-white'
                            : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-serif font-bold text-slate-900 dark:text-white">
                              {sec.number}. {sec.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {sec.engineRule && (
                              <button
                                onClick={() => {
                                  if (sec.number === '18' || sec.number === '29') openCalculatorForSchedule('sched1_sale');
                                  else if (sec.number === '33' || sec.number === '34') openCalculatorForSchedule('sched1_mortgage_grantee');
                                  else if (sec.number === '45') openCalculatorForSchedule('sched2_lease');
                                  else setIsCalculatorOpen(true);
                                }}
                                className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                                title="View calculation rule in engine"
                              >
                                <span>📐</span>
                                <span className="hidden sm:inline font-sans">{sec.engineRule.rule}</span>
                              </button>
                            )}
                            <button
                              onClick={() => copyText(`${sec.number}. ${sec.title}\n${sec.content}`, `sec-${sec.number}`)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                              title="Copy section citation"
                            >
                              {copiedId === `sec-${sec.number}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 text-slate-800 dark:text-slate-200 whitespace-pre-line font-serif leading-relaxed">
                          {sec.content}
                        </div>

                        {sec.notes && (
                          <div className="mt-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                            {sec.notes}
                          </div>
                        )}

                        {sec.engineRule && (
                          <div className="mt-3 p-2.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs">
                            <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                              <span>📐 Karani Engine Statutory Rule:</span>
                              <span className="font-mono text-slate-700 dark:text-slate-300">{sec.engineRule.formula}</span>
                            </div>
                            <div className="text-slate-600 dark:text-slate-400 mt-0.5">
                              {sec.engineRule.description}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* Part III: Taxation of Costs */}
                <section className="pt-8 border-t border-slate-200 dark:border-slate-800">
                  <div className="pb-3 mb-6 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                      Part III
                    </span>
                    <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-900 dark:text-white">
                      TAXATION OF COSTS IN CONTENTIOUS AND OTHER MATTERS
                    </h2>
                  </div>

                  <div className="space-y-8">
                    {STATUTORY_SECTIONS.filter(s => s.part === 'part_III').map(sec => (
                      <div
                        key={sec.number}
                        id={`sec-${sec.number}`}
                        className={`p-4 rounded-md transition-colors ${
                          activeSectionId === `sec-${sec.number}`
                            ? 'bg-slate-50 dark:bg-slate-800/40 border-l-3 border-slate-900 dark:border-white'
                            : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-serif font-bold text-slate-900 dark:text-white">
                              {sec.number}. {sec.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {sec.engineRule && (
                              <button
                                onClick={() => {
                                  if (sec.number === '50' || sec.number === '50A') openCalculatorForSchedule('sched6_hc_defended');
                                  else if (sec.number === '51') openCalculatorForSchedule('sched7_sub_defended');
                                  else setIsCalculatorOpen(true);
                                }}
                                className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                                title="View calculation rule in engine"
                              >
                                <span>📐</span>
                                <span className="hidden sm:inline font-sans">{sec.engineRule.rule}</span>
                              </button>
                            )}
                            <button
                              onClick={() => copyText(`${sec.number}. ${sec.title}\n${sec.content}`, `sec-${sec.number}`)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                              title="Copy section citation"
                            >
                              {copiedId === `sec-${sec.number}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 text-slate-800 dark:text-slate-200 whitespace-pre-line font-serif leading-relaxed">
                          {sec.content}
                        </div>

                        {sec.notes && (
                          <div className="mt-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                            {sec.notes}
                          </div>
                        )}

                        {sec.engineRule && (
                          <div className="mt-3 p-2.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs">
                            <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                              <span>📐 Karani Engine Statutory Rule:</span>
                              <span className="font-mono text-slate-700 dark:text-slate-300">{sec.engineRule.formula}</span>
                            </div>
                            <div className="text-slate-600 dark:text-slate-400 mt-0.5">
                              {sec.engineRule.description}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* Schedules 1 through 12 */}
                <section className="pt-8 border-t border-slate-200 dark:border-slate-800">
                  <div className="pb-3 mb-6 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                      Statutory Scales
                    </span>
                    <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-900 dark:text-white">
                      SCHEDULES 1 TO 12
                    </h2>
                  </div>

                  <div className="space-y-12">
                    {STATUTORY_SCHEDULES_FULL.map(sched => (
                      <div
                        key={sched.scheduleNumber}
                        id={`sched-${sched.scheduleNumber}`}
                        className="p-5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-3">
                          <div>
                            <span className="text-xs font-mono text-slate-400 font-medium">
                              {sched.category} · {sched.legalRef}
                            </span>
                            <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 dark:text-white">
                              {sched.title}
                            </h3>
                          </div>
                          <button
                            onClick={() => {
                              if (sched.scheduleNumber === 1) openCalculatorForSchedule('sched1_sale');
                              else if (sched.scheduleNumber === 2) openCalculatorForSchedule('sched2_lease');
                              else if (sched.scheduleNumber === 6) openCalculatorForSchedule('sched6_hc_defended');
                              else if (sched.scheduleNumber === 7) openCalculatorForSchedule('sched7_sub_defended');
                              else if (sched.scheduleNumber === 10) openCalculatorForSchedule('sched10_probate');
                              else setIsCalculatorOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0"
                          >
                            <Calculator className="w-3.5 h-3.5" />
                            <span>Test in Engine</span>
                          </button>
                        </div>

                        {/* Scales within Schedule */}
                        <div className="mt-4 space-y-6">
                          {sched.scales.map((scale, sIdx) => (
                            <div key={sIdx} className="bg-white dark:bg-slate-800/80 p-4 rounded border border-slate-200 dark:border-slate-700">
                              <h4 className="font-serif font-bold text-slate-900 dark:text-white text-sm">
                                {scale.name}
                              </h4>

                              <div className="mt-2 space-y-1.5 font-mono text-xs text-slate-700 dark:text-slate-300">
                                {scale.rules.map((r, rIdx) => (
                                  <div key={rIdx} className="p-1.5 bg-slate-50 dark:bg-slate-900/60 rounded border border-slate-100 dark:border-slate-800 whitespace-pre-line">
                                    {r}
                                  </div>
                                ))}
                              </div>

                              {scale.notes && (
                                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 italic">
                                  Note: {scale.notes}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Official Kenya Law Repository Footer */}
              <footer className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      National Council for Law Reporting (Kenya Law) · ISO 9001:2015 Certified
                    </p>
                    <p className="mt-0.5">
                      Except for material expressly stated under Creative Commons, contents are in public domain.
                    </p>
                  </div>
                  <div className="text-right text-[11px] font-mono">
                    The Advocates (Remuneration) Order (Legal Notice 64 of 1962)
                  </div>
                </div>
              </footer>
            </article>
          </main>
        </div>
      </div>

      {/* Slide-over Statutory Scale Math Engine Calculator Drawer */}
      {isCalculatorOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsCalculatorOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-[#0d131f] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-slate-900 dark:text-white" />
                  <h3 className="font-serif font-bold text-slate-900 dark:text-white text-base">
                    Statutory Scale Calculator
                  </h3>
                </div>
                <button
                  onClick={() => setIsCalculatorOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-5 flex-1 overflow-y-auto space-y-5 text-xs">
                {/* Select Statutory Scale */}
                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                    Statutory Scale / Transaction
                  </label>
                  <select
                    value={calcSchedule}
                    onChange={(e) => setCalcSchedule(e.target.value)}
                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="sched1_sale">Schedule 1: Conveyance (Sale / Purchase)</option>
                    <option value="sched1_mortgage_grantee">Schedule 1: Mortgage / Charge (Grantee Creation)</option>
                    <option value="sched1_mortgage_grantor">Schedule 1: Mortgage / Charge (Grantor Creation: 50%)</option>
                    <option value="sched2_lease">Schedule 2: Lease at Rack Rent (Lessor)</option>
                    <option value="sched6_hc_defended">Schedule 6: High Court Instruction Fee (Defended)</option>
                    <option value="sched7_sub_defended">Schedule 7: Subordinate Court (Defended)</option>
                    <option value="sched10_probate">Schedule 10: Probate / Estate Administration</option>
                  </select>
                  <p className="mt-1 text-[11px] text-slate-500 font-mono">
                    Ref: {calculationResult.statutoryRef}
                  </p>
                </div>

                {/* Input: Consideration / Capital Value */}
                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                    Consideration / Subject Matter Value (KES)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400">
                      KES
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="50000"
                      value={calcValue}
                      onChange={(e) => setCalcValue(Number(e.target.value))}
                      className="w-full pl-12 pr-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                    <span className="text-slate-400">Presets:</span>
                    <button
                      onClick={() => setCalcValue(2500000)}
                      className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-slate-900"
                    >
                      2.5M
                    </button>
                    <button
                      onClick={() => setCalcValue(10000000)}
                      className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-slate-900"
                    >
                      10M
                    </button>
                    <button
                      onClick={() => setCalcValue(50000000)}
                      className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-slate-900"
                    >
                      50M
                    </button>
                    <button
                      onClick={() => setCalcValue(150000000)}
                      className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-slate-900"
                    >
                      150M
                    </button>
                  </div>
                </div>

                {/* Advocate & Client Uplift Checkbox */}
                <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAdvocateClient}
                      onChange={(e) => setIsAdvocateClient(e.target.checked)}
                      className="mt-0.5 rounded text-slate-900 focus:ring-0"
                    />
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        Advocate and Client Basis (+50%)
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Statutory 50% uplift under Schedule 6 Part B / Schedule 7 Part B / Schedule 10 Part B.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Calculation Breakdown Result Box */}
                <div className="p-4 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 space-y-3">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">
                      Statutory Minimum Prescribed Fee
                    </span>
                    <div className="text-2xl font-serif font-bold mt-0.5">
                      KES {Math.round(calculationResult.finalFee).toLocaleString()}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 dark:border-slate-200 space-y-1.5 font-mono text-[11px]">
                    <div className="text-slate-400 dark:text-slate-600 font-sans font-semibold">
                      Statutory Tier Computation:
                    </div>
                    {calculationResult.formulaSteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-slate-500">•</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      const text = `Statutory Fee: KES ${Math.round(calculationResult.finalFee).toLocaleString()}\nReference: ${calculationResult.statutoryRef}\nBreakdown:\n${calculationResult.formulaSteps.join('\n')}`;
                      copyText(text, 'calc-result');
                    }}
                    className="w-full mt-2 py-1.5 px-3 rounded text-center text-xs font-semibold bg-slate-800 dark:bg-slate-100 hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    {copiedId === 'calc-result' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied Breakdown!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Statutory Calculation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-500">
                Governed by Paragraph 3 of the Order: no advocate may charge less than this scale fee.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemunerationGuideView;
