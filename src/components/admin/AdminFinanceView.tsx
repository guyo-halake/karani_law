import React, { useState } from 'react';
import { 
  DollarSign, TrendingUp, CreditCard, ArrowUpRight, 
  ArrowDownRight, CheckCircle2, Clock, Calendar, 
  FileText, Download, ShieldCheck, Plus, Briefcase, Building
} from 'lucide-react';

interface AdminFinanceViewProps {
  showToast: (msg: string) => void;
}

export const AdminFinanceView: React.FC<AdminFinanceViewProps> = ({ showToast }) => {
  const [activeFinanceTab, setActiveFinanceTab] = useState<'retainers' | 'personal_income' | 'expenses'>('retainers');

  // Client contracts
  const clientContracts = [
    { client: 'Rosemary Wakonyo', project: 'Fresh Fity POS', location: 'Ruiru Town', type: 'Setup + Monthly Support', fee: 'KES 3,500/mo', paidToDate: 'KES 63,500', status: 'Up to Date' },
    { client: 'Sarah Guyatu Rashid', project: 'Sayara Aesthetics', location: 'Nairobi', type: 'Setup + % Commission', fee: '% Commission', paidToDate: 'KES 48,200', status: 'Up to Date' },
    { client: 'SUVPlanet Kenya', project: 'SUVPlanet Marketplace', location: 'Nairobi', type: 'Listing Ads & Upkeep', fee: 'KES 400/2mo', paidToDate: 'KES 6,700', status: 'Up to Date' },
    { client: 'Adv. Nyagah B. Kithinji', project: 'Karani Law & BillsZip', location: 'Upper Hill', type: 'Milestone Retainer', fee: 'Stage Retainer', paidToDate: 'Milestones Active', status: 'Stage 4 UAT' }
  ];

  // Guyo's Real 9-to-5 & Internship Career Incomes from CV
  const personalIncomes = [
    {
      company: 'Muthokinju Paints & Cement Headquarters',
      role: 'IT Support Intern',
      period: 'January 2026 – May 2026',
      rate: 'KES 30,000 / month',
      totalEarned: 'KES 150,000',
      status: 'Completed',
      notes: 'User support, network maintenance, CCTV, Active Directory, on-prem & cloud server monitoring.'
    },
    {
      company: 'AO Technologies Group, Nairobi',
      role: 'DevOps & Infrastructure Intern',
      period: 'May 2026 – August 2026',
      rate: 'Internship Stipend',
      totalEarned: 'Stipend Settled',
      status: 'Completed',
      notes: 'Azure resource groups, RBAC permissions, CI/CD pipeline automation (GitHub Actions, GitLab).'
    },
    {
      company: 'Mobit Solutions (Remote)',
      role: 'Software Developer',
      period: 'November 2025 – May 2026',
      rate: 'Developer Contract',
      totalEarned: 'Contract Settled',
      status: 'Completed',
      notes: 'React, TypeScript, MySQL backend, Safaricom Daraja (STK Push, Paybill) & Twilio integration.'
    },
    {
      company: 'Mount Kenya University (MKU)',
      role: 'Management Information Systems (MIS) Attachee',
      period: 'January 2025 – May 2025',
      rate: 'Attachee Credit',
      totalEarned: 'Academic Sign-off',
      status: 'Completed',
      notes: 'Network switches, routers, and VLMS virtual learning student portal rollout.'
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            Finance &amp; Personal Incomes
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Client retainers, project setup payments, and Guyo's 9-to-5 career earnings
          </p>
        </div>

        {/* M-Pesa Receiving Line & Bank info */}
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-zinc-500">M-Pesa Receiving Line:</span>
            <strong className="text-emerald-700 dark:text-emerald-400 font-bold">0768 141 129</strong>
          </div>
          <p className="text-[10px] text-zinc-500 font-sans">
            Payments auto-sweep into personal bank account
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Client Retainers Settled</span>
          <p className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">KES 118,400</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Fresh Fity + Sayara + SUVPlanet</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Career 9-to-5 Incomes</span>
          <p className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">KES 150,000+</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Muthokinju (30k/mo) + AO Tech + Mobit</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Infrastructure Overhead</span>
          <p className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">KES 8,500/mo</p>
          <p className="text-xs text-zinc-500 font-medium">Adrian AK Fiber (6.5k) + Battery upkeep</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold gap-6">
        <button
          onClick={() => setActiveFinanceTab('retainers')}
          className={`pb-3 border-b-2 cursor-pointer transition-colors ${
            activeFinanceTab === 'retainers' ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold' : 'border-transparent text-zinc-400 hover:text-zinc-600'
          }`}
        >
          Client Retainers &amp; Setup (KES)
        </button>
        <button
          onClick={() => setActiveFinanceTab('personal_income')}
          className={`pb-3 border-b-2 cursor-pointer transition-colors ${
            activeFinanceTab === 'personal_income' ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold' : 'border-transparent text-zinc-400 hover:text-zinc-600'
          }`}
        >
          Personal 9-to-5 Career Earnings (Muthokinju &amp; Tech Jobs)
        </button>
      </div>

      {/* Tab 1: Client Retainers */}
      {activeFinanceTab === 'retainers' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4 font-mono text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="font-bold font-sans text-sm text-zinc-900 dark:text-white">
              Active Client Retainer Ledger
            </h3>
            <span className="text-zinc-400 text-[11px]">Payable to 0768141129 / Bank</span>
          </div>

          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-[10px] text-zinc-400 uppercase">
                <tr>
                  <th className="p-3">Client Name</th>
                  <th className="p-3">Project &amp; Location</th>
                  <th className="p-3">Agreement</th>
                  <th className="p-3">Agreed Fee</th>
                  <th className="p-3">Total Paid</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-sans">
                {clientContracts.map((c, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                    <td className="p-3 font-semibold text-zinc-900 dark:text-white">{c.client}</td>
                    <td className="p-3 text-zinc-500">{c.project} &middot; {c.location}</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">{c.type}</td>
                    <td className="p-3 font-mono font-bold text-zinc-900 dark:text-white">{c.fee}</td>
                    <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">{c.paidToDate}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-600 font-bold">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Personal 9-to-5 Career Earnings */}
      {activeFinanceTab === 'personal_income' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
              Guyo's Personal 9-to-5 Career Incomes
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Work history, internships, and developer employment from CV
            </p>
          </div>

          <div className="space-y-3 font-sans text-xs">
            {personalIncomes.map((job, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-amber-500" />
                    <strong className="text-sm text-zinc-900 dark:text-white">{job.company}</strong>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                      {job.role}
                    </span>
                  </div>
                  <p className="text-zinc-500 text-[11px] font-mono">{job.period}</p>
                  <p className="text-zinc-600 dark:text-zinc-400 text-xs">{job.notes}</p>
                </div>

                <div className="text-right font-mono shrink-0">
                  <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 block">{job.totalEarned}</span>
                  <span className="text-[10px] text-zinc-400">{job.rate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
