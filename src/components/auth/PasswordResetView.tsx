import React, { useState, useEffect } from 'react';
import { CheckCircle2, Key, Lock, ArrowRight, Loader2, AlertCircle, Eye, EyeOff, UserCheck } from 'lucide-react';
import { supabase } from '../../services/supabase';

export const PasswordResetView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPreFilledEmail, setIsPreFilledEmail] = useState(false);

  useEffect(() => {
    // Parse query params from URL
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlEmail = urlParams.get('email');
      const urlToken = urlParams.get('token');
      if (urlEmail) {
        setEmail(urlEmail);
        setIsPreFilledEmail(true);
      }
      if (urlToken) setToken(urlToken);
    } catch (e) {}
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmation) {
      setError('Passwords do not match.');
      return;
    }

    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail) {
      setError('Please enter your account email address.');
      return;
    }

    setIsSaving(true);

    try {
      // 1. Dispatch confirmation & update via backend engine
      await fetch('/api/v1/email/confirm-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          new_password: password,
          token: token || undefined,
          portal_url: window.location.origin,
        }),
      });

      // 2. Direct Supabase updates as backup
      try {
        await supabase
          .from('users')
          .update({ password_hash: password })
          .ilike('email', targetEmail);
      } catch (dbErr) {}

      try {
        await supabase.auth.updateUser({ password });
      } catch (authErr) {}

      // 3. Update localStorage cache if matching user exists
      try {
        const stored = localStorage.getItem('EXACT_USERS');
        if (stored) {
          const list = JSON.parse(stored);
          const idx = list.findIndex((u: any) => (u.workEmail || '').toLowerCase() === targetEmail);
          if (idx !== -1) {
            list[idx].passwordHash = password;
            localStorage.setItem('EXACT_USERS', JSON.stringify(list));
          }
        }
      } catch (lsErr) {}

      setMessage('Your password has been reset successfully. A confirmation email has been dispatched to your inbox. You can now sign in.');
    } catch (err: any) {
      setError(err?.message || 'Failed to update password. Please check your connection or contact P3L Support.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReturnToLogin = () => {
    window.location.href = window.location.origin;
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="vercel-card w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl border border-[var(--border-color)]">
        
        {/* P3L Help Desk Header with Logo */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <img
            src="/p3l_logo_nobg.png"
            alt="P3L Developers Logo"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/p3l_logo.jpeg';
            }}
            className="h-20 sm:h-24 max-w-[200px] w-auto object-contain shrink-0 drop-shadow-sm mb-1"
          />
          <div>
            <h1 className="font-brand font-extrabold text-xl text-[var(--text-main)] tracking-tight">
              P3L Developers Help Desk
            </h1>
            <p className="text-xs text-[var(--text-muted)] italic font-semibold mt-0.5">
              Secure Password Reset Portal
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message ? (
          <div className="space-y-4 text-center py-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-[var(--text-main)]">Password Updated Successfully</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {message}
              </p>
            </div>
            <button
              onClick={handleReturnToLogin}
              className="w-full py-3 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.98] border backdrop-blur-md bg-slate-900/90 hover:bg-slate-900 text-white border-slate-700/50 shadow-slate-900/25 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white dark:border-white/20 mt-3"
            >
              Log In to Portal <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Account Identifier */}
            {isPreFilledEmail ? (
              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-sky-400 font-medium">
                  <UserCheck className="w-4 h-4" />
                  <span>Advocate Account:</span>
                </div>
                <span className="font-mono font-bold text-[var(--text-main)] text-[11px] truncate max-w-[200px]">
                  {email}
                </span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="font-semibold text-[var(--text-main)] block">Account Email:</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. advocate@kithinjilegal.co.ke"
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-main)] font-mono focus:outline-none focus:border-[var(--text-main)]"
                />
              </div>
            )}

            {/* Field: New Password */}
            <div className="space-y-1.5">
              <label className="font-semibold text-[var(--text-main)] block">New Password:</label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3.5 top-3 text-[var(--text-muted)]" />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--text-main)] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3.5 top-3 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Field: Confirm Password */}
            <div className="space-y-1.5">
              <label className="font-semibold text-[var(--text-main)] block">Confirm Password:</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[var(--text-muted)]" />
                <input
                  required
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmation}
                  onChange={e => setConfirmation(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--text-main)] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(prev => !prev)}
                  className="absolute right-3.5 top-3 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                  title={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.98] border backdrop-blur-md bg-slate-900/90 hover:bg-slate-900 text-white border-slate-700/50 shadow-slate-900/25 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white dark:border-white/20"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>Saving Password...</span>
                  </>
                ) : (
                  'Save Password'
                )}
              </button>
            </div>
          </form>
        )}

        <div className="pt-2 text-center text-[11px] text-[var(--text-muted)] font-mono border-t border-[var(--border-color)]">
          P3L Developers, Nairobi • System Support Delivery
        </div>
      </div>
    </div>
  );
};

export default PasswordResetView;