import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, HelpCircle } from 'lucide-react';

interface AccessDeniedViewProps {
  title?: string;
  resourceName?: string;
  permissionCode?: string;
  description?: string;
  onNavigateHome?: () => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  title = 'Access Restricted',
  resourceName = 'This Section',
  permissionCode,
  description = 'Your assigned role or advocate permission policy does not allow access to this module.',
  onNavigateHome
}) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="vercel-card max-w-lg w-full p-8 text-center space-y-5 border border-amber-500/20 bg-amber-500/[0.02]">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400 shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-mono font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>RBAC Security Policy Active</span>
          </div>

          <h2 className="font-brand font-bold text-2xl text-[var(--text-main)] tracking-tight">
            {title}
          </h2>

          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
            {description} You currently do not have permission to view or manage <strong className="text-[var(--text-main)] font-semibold">{resourceName}</strong>.
          </p>
        </div>

        {permissionCode && (
          <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-left flex items-center justify-between text-xs font-mono">
            <span className="text-[var(--text-muted)]">Required Permission:</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 text-amber-400 font-bold dark:bg-zinc-800">
              {permissionCode}
            </span>
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="btn-black w-full sm:w-auto px-5 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Dashboard
            </button>
          )}

          <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5 justify-center mt-2 sm:mt-0">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>To request access, contact your Managing Partner.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedView;
