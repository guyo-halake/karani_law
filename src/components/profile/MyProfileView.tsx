import React from 'react';
import { SystemUser, EXACT_LOGGED_IN_USER } from '../../services/supabase';
import {
  User,
  Briefcase,
  Mail,
  Phone,
  CheckCircle2
} from 'lucide-react';

interface MyProfileViewProps {
  currentUser?: SystemUser | null;
}

export const MyProfileView: React.FC<MyProfileViewProps> = ({ currentUser }) => {
  // Dynamically resolve currently logged in session user
  const u: SystemUser = currentUser || (() => {
    const saved = localStorage.getItem('BILLSZIP_SESSION');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return EXACT_LOGGED_IN_USER;
  })();

  return (
    <div className="w-full space-y-8 pb-12">
      {/* Profile Summary Card */}
      <div className="vercel-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar with fallback */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-gray-900 to-gray-700 text-white dark:from-gray-100 dark:to-gray-300 dark:text-black flex items-center justify-center font-bold text-3xl shadow-xl border-2 border-[var(--border-color)]">
              <User className="w-12 h-12" />
            </div>
            <span className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-black absolute -bottom-1 -right-1" title="Active Session" />
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="font-brand font-extrabold text-2xl sm:text-3xl text-[var(--text-main)] tracking-tight">
                  {u.fullName}
                </h1>
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 font-mono mt-0.5">
                  LSK Admission No: {u.lskNo || 'P.105/9920'}
                </p>
              </div>

              <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold font-mono self-center sm:self-start">
                {u.role}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium">
              {u.position}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[var(--border-color)] text-xs">
          
          {/* Work Credentials */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
              <Briefcase className="w-4 h-4 text-[var(--text-muted)]" /> Practice Information
            </h3>

            <div className="space-y-3.5">
              <div>
                <span className="text-[var(--text-muted)] block text-[11px] uppercase font-semibold">Advocate Full Name:</span>
                <p className="font-bold text-base text-[var(--text-main)]">{u.fullName}</p>
              </div>

              <div>
                <span className="text-[var(--text-muted)] block text-[11px] uppercase font-semibold">LSK Admission Number:</span>
                <p className="font-mono font-bold text-sm text-[var(--text-main)]">{u.lskNo || 'P.105/9920'}</p>
              </div>

              <div>
                <span className="text-[var(--text-muted)] block text-[11px] uppercase font-semibold">Position:</span>
                <p className="text-xs sm:text-sm text-[var(--text-main)] font-semibold">{u.position}</p>
              </div>

              <div>
                <span className="text-[var(--text-muted)] block text-[11px] uppercase font-semibold">LSK Practising Status:</span>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" /> Active Unconditional Practising Certificate
                </p>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
              <Mail className="w-4 h-4 text-[var(--text-muted)]" /> Contact & Phone Numbers
            </h3>

            <div className="space-y-3.5">
              <div>
                <span className="text-[var(--text-muted)] block text-[11px] uppercase font-semibold">Official Work Email:</span>
                <p className="font-mono font-bold text-sm text-[var(--text-main)]">{u.workEmail}</p>
              </div>

              <div>
                <span className="text-[var(--text-muted)] block text-[11px] uppercase font-semibold">Personal Email:</span>
                <p className="font-mono text-xs sm:text-sm text-[var(--text-main)]">{u.personalEmail}</p>
              </div>

              <div>
                <span className="text-[var(--text-muted)] block text-[11px] uppercase font-semibold">Telephone Numbers:</span>
                <div className="font-mono font-semibold text-xs sm:text-sm text-[var(--text-main)] space-y-1 mt-1">
                  <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[var(--text-muted)]" /> Direct: {u.phonePrimary}</p>
                  <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[var(--text-muted)]" /> Mobile: {u.phoneSecondary}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* MODERN FOOTER Strictly matching user specification */}
      <footer className="pt-8 border-t border-[var(--border-color)] text-center space-y-1 text-xs text-[var(--text-muted)]">
        <p className="font-semibold text-[var(--text-main)]">
          BoC Builder Software 2026. All rights reserved.
        </p>
        <p className="text-[11px]">
          Developed by <span className="font-bold text-[var(--text-main)]">© P3L Developers</span>, Nairobi
        </p>
      </footer>
    </div>
  );
};

export default MyProfileView;
