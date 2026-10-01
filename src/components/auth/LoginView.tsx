import React, { useState } from 'react';
import { supabase, SystemUser, EXACT_FIRM_INFO } from '../../services/supabase';
import { signInWithPassword } from '../../services/auth';
import { Scale, Lock, Mail, Key, X, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: SystemUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password Modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<'options' | 'email_sent' | 'whatsapp_sent'>('options');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const authenticatedUser = await signInWithPassword(email, password);
      localStorage.setItem('BILLSZIP_SESSION', JSON.stringify(authenticatedUser));
      setIsLoading(false);
      onLoginSuccess(authenticatedUser);
      return;
    } catch (error: any) {
      setIsLoading(false);
      setErrorMessage(error?.message || 'Unable to sign in. Check your credentials and try again.');
      return;
    }
  };

  const openForgotModal = () => {
    setForgotStep('options');
    setShowForgotModal(true);
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setErrorMessage('Enter your account email first, then select Forgot Password.');
      setShowForgotModal(false);
      return;
    }
    const publicAppUrl = (import.meta as ImportMeta & { env?: { VITE_PUBLIC_APP_URL?: string } }).env?.VITE_PUBLIC_APP_URL || window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: publicAppUrl,
    });
    if (error) {
      setErrorMessage(error.message);
      setShowForgotModal(false);
      return;
    }
    setForgotStep('email_sent');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col justify-between p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md mx-auto my-auto space-y-6 pt-6">
        
        {/* Real Law Firm Logo & Firm Name Header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <img
            src="/logo.png"
            alt="Nyagah B. Kithinji & Co. Advocates Logo"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/kenya_coat_of_arms.png';
            }}
            className="h-24 max-w-[220px] w-auto object-contain shrink-0 drop-shadow-sm mb-1"
          />
          <div>
            <h1 className="font-brand font-extrabold text-xl text-[var(--text-main)] tracking-tight uppercase">
              {EXACT_FIRM_INFO.name}
            </h1>
            <p className="text-xs text-[var(--text-muted)] font-serif italic mt-0.5">
              Advocates of the High Court of Kenya
            </p>
          </div>
        </div>

        {/* Clean Login Box */}
        <div className="vercel-card p-6 sm:p-8 space-y-5 shadow-2xl">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            {/* Field 1: Email / Work ID */}
            <div className="space-y-1.5">
              <label className="font-semibold text-[var(--text-main)] block">Email or Work ID:</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[var(--text-muted)]" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--text-main)] transition-colors font-mono"
                />
              </div>
            </div>

            {/* Field 2: Password */}
            <div className="space-y-1.5">
              <label className="font-semibold text-[var(--text-main)] block">Password:</label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3.5 top-3 text-[var(--text-muted)]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--text-main)] transition-colors font-mono"
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-black w-full py-3 text-xs font-semibold flex items-center justify-center gap-2 shadow-md cursor-pointer mt-2 uppercase tracking-wider"
            >
              {isLoading ? 'Signing in...' : 'Sign In to Portal'}
            </button>
          </form>

          <div className="pt-2 flex items-center justify-start text-xs">
            <button
              type="button"
              onClick={openForgotModal}
              className="text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>
        </div>

      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative font-sans text-xs">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-main)] p-1"
            >
              <X className="w-4 h-4" />
            </button>

            {forgotStep === 'options' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                  <Lock className="w-4 h-4" />
                  <span>Password Reset Request</span>
                </div>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  Sending a password reset request to P3L support team. Would you like to receive your OTP confirmation on Email or WhatsApp?
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => void handlePasswordReset()}
                    className="btn-black py-2.5 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-emerald-400" /> Email
                  </button>
                  <button
                    onClick={() => setErrorMessage('WhatsApp password reset is not configured. Use the Email option.')}
                    className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                  >
                    <MessageSquare className="w-4 h-4" /> WhatsApp
                  </button>
                </div>
              </div>
            )}

            {forgotStep === 'email_sent' && (
              <div className="space-y-4 text-center py-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-[var(--text-main)]">Email Request Dispatched</h3>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  You will receive an email from P3L support team with instructions on how to change your password.
                </p>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="btn-black w-full py-2.5 cursor-pointer mt-2"
                >
                  Close
                </button>
              </div>
            )}

            {forgotStep === 'whatsapp_sent' && (
              <div className="space-y-4 text-center py-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-[var(--text-main)]">WhatsApp Request Dispatched</h3>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  You will receive a WhatsApp message from P3L support team with instructions on how to change your password.
                </p>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="btn-black w-full py-2.5 cursor-pointer mt-2"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER STRICTLY AS REQUESTED */}
      <footer className="py-6 text-center text-xs text-[var(--text-muted)] space-y-1 font-sans">
        <p className="font-bold text-[var(--text-main)] text-sm">BoC Builder v2-1</p>
        <p className="text-[11px] text-[var(--text-muted)]">© {EXACT_FIRM_INFO.name}</p>
        <p className="text-[11px] font-mono text-[var(--text-muted)]">2026.</p>
      </footer>
    </div>
  );
};

export default LoginView;
