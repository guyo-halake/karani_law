import React from 'react';
import { BookOpen, Scale, CheckCircle } from 'lucide-react';

export const RemunerationGuideView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-navy-900/60 p-4 rounded-xl border border-navy-800 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" /> Advocates Remuneration Order Tariff Reference
          </h2>
          <p className="text-xs text-slate-400">Ref: Kenya Law LN 64/1962 (ed. 2022) / 2014 Amendment Order</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <div className="bg-navy-900/40 p-4 rounded-xl border border-navy-800 space-y-3">
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-1.5 border-b border-navy-800 pb-2">
            <Scale className="w-4 h-4 text-amber-400" /> Schedule 6 — High Court & Court of Appeal
          </h3>

          <div className="space-y-2 text-slate-300">
            <div className="flex justify-between py-1 border-b border-navy-800/60">
              <span>Up to Kshs 500,000</span>
              <span className="font-mono font-bold text-amber-400">Kshs 45,000 (Min 75,000 floor)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-navy-800/60">
              <span>Kshs 500,001 - 1,000,000</span>
              <span className="font-mono font-bold text-amber-400">Kshs 75,000</span>
            </div>
            <div className="flex justify-between py-1 border-b border-navy-800/60">
              <span>Kshs 1,000,001 - 5,000,000</span>
              <span className="font-mono font-bold text-amber-400">75,000 + 1.75% of excess over 1M</span>
            </div>
            <div className="flex justify-between py-1 border-b border-navy-800/60">
              <span>Kshs 5,000,001 - 10,000,000</span>
              <span className="font-mono font-bold text-amber-400">145,000 + 1.5% of excess over 5M</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Over Kshs 20,000,000</span>
              <span className="font-mono font-bold text-amber-400">320,000 + 0.75% of excess over 20M</span>
            </div>
          </div>
        </div>

        <div className="bg-navy-900/40 p-4 rounded-xl border border-navy-800 space-y-3">
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-1.5 border-b border-navy-800 pb-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> Itemized Work & Folio Prescribed Rates
          </h3>

          <div className="space-y-2 text-slate-300">
            <div className="flex justify-between py-1 border-b border-navy-800/60">
              <span>Drawing Pleadings & Affidavits</span>
              <span className="font-mono font-bold text-slate-100">Kshs 500 / folio</span>
            </div>
            <div className="flex justify-between py-1 border-b border-navy-800/60">
              <span>Copying Bundles & Documents</span>
              <span className="font-mono font-bold text-slate-100">Kshs 50 / folio</span>
            </div>
            <div className="flex justify-between py-1 border-b border-navy-800/60">
              <span>Court Attendance (Per Hour)</span>
              <span className="font-mono font-bold text-slate-100">Kshs 2,500 / hr</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Getting-Up Fee</span>
              <span className="font-mono font-bold text-amber-400">33.33% (1/3) of Instruction Fee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
