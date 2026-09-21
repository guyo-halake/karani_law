import React, { useState } from 'react';
import {
  HelpCircle,
  Send,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface TechProblem {
  id: number;
  category: string;
  problem: string;
  solution: string[];
}

export const SIMPLE_TECH_PROBLEMS: TechProblem[] = [
  {
    id: 1,
    category: 'Website Basics',
    problem: 'How to calculate a new Bill of Costs or Fee Note',
    solution: [
      '1. Click "Bill of Costs Builder" on the left menu.',
      '2. Select a schedule from the dropdown (e.g. Schedule 6 for High Court).',
      '3. Type your Subject Claim Value in Kshs.',
      '4. Click "Pick Item" or "Add New Item" to add your work items.',
      '5. Click "Print / Export" to view and print your finished bill.'
    ]
  },
  {
    id: 2,
    category: 'Website Basics',
    problem: 'Could not find a saved bill of cost?',
    solution: [
      '1. Open "Home Overview" or "Documentations & Storage".',
      '2. Use the top search bar to type the matter or client name.',
      '3. Click on the matter card or file row to open your saved draft.'
    ]
  },
  {
    id: 3,
    category: 'Website Basics',
    problem: 'Bill of cost not downloading as PDF',
    solution: [
      '1. Make sure pop-ups are allowed in your browser address bar.',
      '2. Click "Print / Export" in the Fee Note Builder.',
      '3. Click the black "Download / Print PDF" button.',
      '4. Select "Save as PDF" in the print destination dropdown.'
    ]
  },
  {
    id: 4,
    category: 'Website Basics',
    problem: 'How to search for a matter or case file',
    solution: [
      '1. Go to "My Matters" on the left sidebar.',
      '2. Type the cause number or matter title in the search box.',
      '3. Switch between Card, Table, or List view to see your case details.'
    ]
  },
  {
    id: 5,
    category: 'Website Basics',
    problem: 'How to send an email to a client with attachments',
    solution: [
      '1. Go to "My Clients" on the sidebar.',
      '2. Click the Email icon beside any client row.',
      '3. A Gmail-style window will pop up.',
      '4. Attach your PDF or Word document and click "Send Email".'
    ]
  },
  {
    id: 6,
    category: 'Website Basics',
    problem: 'How to switch between Light Mode and Dark Mode',
    solution: [
      '1. Click the Sun/Moon icon on the top right bar beside the notification bell.',
      '2. Your theme preference is saved automatically.'
    ]
  },
  {
    id: 7,
    category: 'Website Basics',
    problem: 'How to view and edit client contact information',
    solution: [
      '1. Click "My Clients" on the left sidebar.',
      '2. Use the search bar to find the client.',
      '3. Click the Call, Email, or WhatsApp icons to connect instantly.'
    ]
  },
  {
    id: 8,
    category: 'Website Basics',
    problem: 'How to upload files to Documentations & Storage',
    solution: [
      '1. Click "Documentations & Storage" on the left menu.',
      '2. Click the black "Upload New File" button at the top right.',
      '3. Choose your PDF, Excel, or Word file from your computer.'
    ]
  },
  {
    id: 9,
    category: 'Website Basics',
    problem: 'How to view your Advocate Profile and LSK details',
    solution: [
      '1. Click your profile avatar at the top right navbar.',
      '2. Select "View Profile".',
      '3. View your LSK practice certificate, contact details, and firm roles.'
    ]
  },
  {
    id: 10,
    category: 'Website Basics',
    problem: 'How to log out of the Karani Law Platform',
    solution: [
      '1. Click your profile avatar at the top right navbar or bottom sidebar.',
      '2. Click "Log Out" to return to the secure login screen.'
    ]
  },
  {
    id: 11,
    category: 'Troubleshooting',
    problem: 'Getting-Up fee 1/3 surcharge not adding to total',
    solution: [
      '1. Make sure "Include Getting-Up Fee (33.33%)" checkbox is checked.',
      '2. Select a contentious schedule (e.g. Schedule 6 for High Court).',
      '3. The 33.33% getting-up surcharge is calculated on the instruction fee.'
    ]
  },
  {
    id: 12,
    category: 'Troubleshooting',
    problem: 'Statutory 16% VAT not showing on bill',
    solution: [
      '1. Statutory 16% VAT is automatically added to all taxable items.',
      '2. Disbursements (court filing fees) are non-taxable and added after VAT.'
    ]
  }
];

export const TechSupportView: React.FC = () => {
  const [supportMessage, setSupportMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(1);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSupportMessage('');
      alert('✓ Your support request has been submitted to Karani Law Helpdesk. An advocate administrator will contact you shortly.');
    }, 600);
  };

  const filteredProblems = SIMPLE_TECH_PROBLEMS.filter(
    (p) =>
      p.problem.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="w-full space-y-8 pb-12 font-sans">
      {/* Title Header */}
      <div className="border-b border-[var(--border-color)] pb-4 space-y-1">
        <h1 className="font-brand font-extrabold text-2xl sm:text-3xl text-[var(--text-main)] tracking-tight">
          Welcome to Firm Technical Support & Helpdesk
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] font-mono font-semibold">
          Nyagah B. Kithinji & Co. Advocates • Legal Software Technical Support
        </p>
      </div>

      {/* TOP SECTION: Two Columns (Message Form Left + Firm Business Card Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
        
        {/* LEFT COLUMN: Quick Message Form */}
        <div className="vercel-card p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-sm text-[var(--text-main)] uppercase tracking-wider mb-3 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-500" /> How can we help you?
            </h2>

            <form onSubmit={handleSendMessage} className="space-y-3">
              <textarea
                rows={5}
                required
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Describe your technical issue, bug report, or system inquiry..."
                className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--text-main)] font-sans leading-relaxed transition-colors"
              />

              <button
                type="submit"
                disabled={isSending}
                className="btn-black w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> {isSending ? 'Sending Message...' : 'Send Message'}
              </button>
            </form>
          </div>

          <p className="text-[11px] text-[var(--text-muted)] italic leading-relaxed pt-2 border-t border-[var(--border-color)]">
            Use the text field to send a quick message to our support team and we will respond as soon as possible.
          </p>
        </div>

        {/* RIGHT COLUMN: Firm Support Card */}
        <div className="vercel-card p-6 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-black font-bold text-sm flex items-center justify-center font-mono shadow-md">
                  N
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-main)]">Advocates Support Desk</h3>
                  <span className="text-[10.5px] text-[var(--text-muted)] font-mono">Nyagah B. Kithinji & Co. Advocates</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[10px]">
                Online Support
              </span>
            </div>

            <div className="space-y-3 pt-4 text-xs font-mono">
              <div>
                <span className="text-[var(--text-muted)] text-[10px] uppercase block font-sans font-semibold">Managing Advocate Email:</span>
                <a href="mailto:vickarani@gmail.com" className="font-bold text-[var(--text-main)] hover:underline">
                  vickarani@gmail.com
                </a>
              </div>

              <div>
                <span className="text-[var(--text-muted)] text-[10px] uppercase block font-sans font-semibold">Support Desk Telephone:</span>
                <a href="tel:+254712345678" className="font-bold text-[var(--text-main)] hover:underline">
                  +254 712 345 678
                </a>
              </div>

              <div>
                <span className="text-[var(--text-muted)] text-[10px] uppercase block font-sans font-semibold">Firm Portal:</span>
                <span className="font-bold text-blue-500">
                  www.kithinjilegal.co.ke
                </span>
              </div>

              <div>
                <span className="text-[var(--text-muted)] text-[10px] uppercase block font-sans font-semibold">HQ Location:</span>
                <span className="font-bold text-[var(--text-main)]">Nairobi, Kenya</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[11px] text-[var(--text-muted)] flex items-center justify-between font-mono">
            <span>Response SLA Target:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Within 1 Hour</span>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: FAQ Accordion */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
          <div>
            <h2 className="font-brand font-bold text-base sm:text-lg text-[var(--text-main)]">
              Frequently Asked Questions & Solutions
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Simple step-by-step guides for common platform tasks and fixes
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search help topics..."
              className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[var(--text-main)] focus:outline-none"
            />
          </div>
        </div>

        {/* Simplified Accordion List */}
        <div className="space-y-3">
          {filteredProblems.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="vercel-card overflow-hidden transition-all duration-150"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-4 cursor-pointer flex items-center justify-between gap-4 hover:bg-[var(--bg-subtle)]/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-main)] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      #{item.id}
                    </span>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-mono font-semibold text-[var(--text-muted)] tracking-wider block">
                        {item.category}
                      </span>
                      <h3 className="font-bold text-xs sm:text-sm text-[var(--text-main)] truncate">
                        {item.problem}
                      </h3>
                    </div>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                  )}
                </div>

                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-[var(--border-color)] bg-[var(--bg-subtle)]/30 space-y-2 text-xs font-sans">
                    <span className="text-[10.5px] font-mono font-bold text-emerald-600 dark:text-emerald-400 block pt-3">
                      ✓ HOW TO FIX THIS:
                    </span>
                    <div className="space-y-1.5 text-[var(--text-main)] leading-relaxed pl-1 font-sans text-xs">
                      {item.solution.map((step, idx) => (
                        <p key={idx} className="bg-[var(--bg-card)] p-2.5 rounded-lg border border-[var(--border-color)]">
                          {step}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="pt-8 border-t border-[var(--border-color)] text-center space-y-1 text-xs text-[var(--text-muted)]">
        <p className="font-semibold text-[var(--text-main)]">
          BoC Builder Software 2026. All rights reserved.
        </p>
        <p className="text-[11px]">
          Designed for <span className="font-bold text-[var(--text-main)]">Nyagah B. Kithinji & Co. Advocates</span>, Nairobi
        </p>
      </footer>
    </div>
  );
};

export default TechSupportView;
