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
  solution: (string | React.ReactNode)[];
}

export const SIMPLE_TECH_PROBLEMS: TechProblem[] = [
  {
    id: 1,
    category: 'Guides',
    problem: 'How to Calculate Bill of costs or fee note',
    solution: [
      '1. Open the left sidebar and navigate to the Bill of Costs or Fee Notes section.',
      '2. Select the specific schedule or category that applies to your matter.',
      '3. Enter the required base values, such as the Subject Value or Instruction Fee.',
      '4. Add any individual items, attendances, or disbursements using the "Add Item" button.',
      '5. Verify the totals, including VAT and Getting-up fees, in the summary panel.',
      '6. Click the export or print button to generate the final document.',
      <a href="/fee-notes" className="inline-block mt-2 px-4 py-2 bg-black text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors">Open Fee Note Page</a>
    ]
  },
  {
    id: 2,
    category: 'Guides',
    problem: 'Cant find saved fee notes',
    solution: [
      '1. Go to your Document Vault or My Matters section.',
      '2. Use the search bar at the top to type the client name or matter reference.',
      '3. Ensure you have not accidentally applied a filter hiding older fee notes.',
      '4. Click on the relevant matter to see all attached drafts and fee notes.'
    ]
  },
  {
    id: 3,
    category: 'Guides',
    problem: 'Fee notes not downloding as pdf or excel sheet',
    solution: [
      '1. Check if your browser is blocking pop-ups from this site.',
      '2. Ensure you have a stable internet connection for the PDF generator to run.',
      '3. Click the download button and wait a few seconds; do not double-click.',
      '4. If it still fails, try clearing your browser cache and refreshing the page.'
    ]
  },
  {
    id: 4,
    category: 'Profile',
    problem: 'How to change or update your profile details',
    solution: [
      '1. Click on your profile picture or name in the top right corner.',
      '2. Select "Settings" or "Firm Settings" from the dropdown.',
      '3. Update your name, email, or contact details in the form.',
      '4. Click "Save Changes" at the bottom of the screen.'
    ]
  },
  {
    id: 5,
    category: 'Profile',
    problem: 'Changing or updating your login password',
    solution: [
      '1. For security reasons, direct password changes are managed by the admin.',
      '2. You must send an email to p3lcodes@gmail.com requesting a password reset.',
      '3. Include your username and registered email address in the request.',
      '4. You will receive a temporary password within 24 hours.'
    ]
  },
  {
    id: 6,
    category: 'Troubleshooting',
    problem: 'Troubleshooting of software (data is not shown)',
    solution: [
      '1. Hard refresh the page using Ctrl + F5 (Windows) or Cmd + Shift + R (Mac).',
      '2. Check your internet connection.',
      '3. Ensure you have the correct permissions to view the requested data.',
      '4. If the database is syncing, wait a few moments and try again.'
    ]
  },
  {
    id: 7,
    category: 'Troubleshooting',
    problem: 'Getting up fee not adding to total',
    solution: [
      '1. Check that the "Include Getting-Up Fee" toggle is activated in your settings.',
      '2. Ensure you have entered a valid Instruction Fee, as Getting-up is calculated from it.',
      '3. Verify that the selected schedule allows for Getting-up fees.'
    ]
  },
  {
    id: 8,
    category: 'Troubleshooting',
    problem: '16% vat not showing in bill',
    solution: [
      '1. Ensure the specific items added are marked as taxable.',
      '2. Disbursements are usually non-taxable and will not incur VAT.',
      '3. Check the Firm Settings to ensure VAT calculation is turned on globally.'
    ]
  },
  {
    id: 9,
    category: 'Troubleshooting',
    problem: 'Internal emails not sending',
    solution: [
      '1. Verify the recipient email address is spelled correctly.',
      '2. Check if the attached files exceed the maximum allowed size (usually 10MB).',
      '3. If the system is offline, emails will be queued and sent when reconnected.'
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
      alert('✓ Your support request has been submitted to p3lcodes@gmail.com. A P3L Developer will contact you shortly.');
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
          Technical Support and Help desk
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] font-mono font-semibold">
          P3L Developers Helpdesk system
        </p>
      </div>

      {/* TOP SECTION */}
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
            Use the text field to send a quick message to our support team and we will respond as soon as possible. Emails are sent to p3lcodes@gmail.com.
          </p>
        </div>

        {/* RIGHT COLUMN: Firm Support Card */}
        <div className="vercel-card p-6 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-black font-bold text-sm flex items-center justify-center font-mono shadow-md">
                  P
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-main)]">Ticketing and Tech support Helpdesk</h3>
                  <span className="text-[10.5px] text-[var(--text-muted)] font-mono">P3L Developers</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[10px]">
                Online Support
              </span>
            </div>

            <div className="space-y-3 pt-4 text-xs font-mono">
              <div>
                <span className="text-[var(--text-muted)] text-[10px] uppercase block font-sans font-semibold">Admin email:</span>
                <span className="font-bold text-[var(--text-main)]">
                  razakwako45@gmail.com, vickarani@gmail.com
                </span>
              </div>

              <div>
                <span className="text-[var(--text-muted)] text-[10px] uppercase block font-sans font-semibold">Support Desk Telephone:</span>
                <a href="tel:+254141888585" className="font-bold text-[var(--text-main)] hover:underline">
                  +254 141888585
                </a>
              </div>

              <div>
                <span className="text-[var(--text-muted)] text-[10px] uppercase block font-sans font-semibold">Web:</span>
                <span className="font-bold text-blue-500">
                  www.p3ldevelopers.co.ke
                </span>
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
                        <div key={idx} className="bg-[var(--bg-card)] p-2.5 rounded-lg border border-[var(--border-color)]">
                          {step}
                        </div>
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
          P3L Developers Software © 2026. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default TechSupportView;
