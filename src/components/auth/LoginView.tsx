import React, { useState } from 'react';
import { SEEDED_USERS, SystemUser, EXACT_FIRM_INFO } from '../../services/supabase';
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

  // Create Account Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const cleanedEmail = email.trim().toLowerCase();
      
      // Load any custom created users from localStorage
      let allUsers: SystemUser[] = [...SEEDED_USERS];
      try {
        const storedUsers = localStorage.getItem('EXACT_USERS');
        if (storedUsers) {
          const parsed = JSON.parse(storedUsers);
          if (Array.isArray(parsed)) {
            allUsers = [...allUsers, ...parsed];
          }
        }
      } catch (e) {}

      // Look up user in seeded database or registered users
      let user = allUsers.find(
        u => (u.workEmail && u.workEmail.toLowerCase() === cleanedEmail) || 
             (u.personalEmail && u.personalEmail.toLowerCase() === cleanedEmail) ||
             (u.fullName && u.fullName.toLowerCase() === cleanedEmail) ||
             (u.fullName && u.fullName.toLowerCase().includes(cleanedEmail))
      );

      // Smart Fallback mapping
      if (!user) {
        if (cleanedEmail === 'admin' || cleanedEmail.includes('admin')) {
          user = SEEDED_USERS[0];
        } else if (cleanedEmail === 'karani' || cleanedEmail.includes('victor') || cleanedEmail === 'vickarani@gmail.com') {
          user = SEEDED_USERS[0]; // Karani Victor
        } else if (cleanedEmail === 'nyagah' || cleanedEmail === 'kithinji' || cleanedEmail.includes('kithinji') || cleanedEmail === 'lawyer') {
          user = SEEDED_USERS[1]; // Nyagah Kithinji
        } else {
          // If any email entered with @, dynamically create/allow demo session
          user = {
            id: 'usr-' + Date.now(),
            fullName: cleanedEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            advocateTitle: 'Adv. ' + cleanedEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            lskNo: 'P.105/' + Math.floor(1000 + Math.random() * 9000),
            role: 'Advocate',
            position: 'Associate Advocate',
            workEmail: cleanedEmail.includes('@') ? cleanedEmail : `${cleanedEmail}@kithinjilegal.co.ke`,
            personalEmail: cleanedEmail.includes('@') ? cleanedEmail : `${cleanedEmail}@gmail.com`,
            phonePrimary: '+254 722 000 000',
            phoneSecondary: '+254 733 000 000',
            hasAllPermissions: false,
            passwordHash: password
          };
        }
      }

      // Password Validation (Accept correct hash or common demo passwords)
      const allowedPasswords = [user.passwordHash, 'admin123', 'karani123', 'lawyer123', 'password', '123456'];
      if (password && !allowedPasswords.includes(password) && user.passwordHash !== password) {
        setErrorMessage('Invalid password specified for this account. (Default demo: lawyer123 or karani123)');
        return;
      }

      // Save session
      localStorage.setItem('BILLSZIP_SESSION', JSON.stringify(user));
      onLoginSuccess(user);
    }, 400);
  };

  const handleQuickLogin = (userToLogin: SystemUser) => {
    localStorage.setItem('BILLSZIP_SESSION', JSON.stringify(userToLogin));
    onLoginSuccess(userToLogin);
  };

  const openForgotModal = () => {
    setForgotStep('options');
    setShowForgotModal(true);
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
                  placeholder="e.g. advocate@kithinjilegal.co.ke"
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
                  placeholder="Enter password"
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

          {/* Instant 1-Click Demo Logins */}
          <div className="pt-3 border-t border-[var(--border-color)] space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block text-center font-mono">
              Quick 1-Click Access
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickLogin(SEEDED_USERS[1])}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-left border border-slate-200 dark:border-zinc-700 cursor-pointer transition-colors"
              >
                <div className="font-bold text-slate-800 dark:text-white truncate">Adv. Nyagah Kithinji</div>
                <div className="text-[10px] text-slate-500 truncate">Senior Associate</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin(SEEDED_USERS[0])}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-left border border-slate-200 dark:border-zinc-700 cursor-pointer transition-colors"
              >
                <div className="font-bold text-slate-800 dark:text-white truncate">Adv. Karani Victor</div>
                <div className="text-[10px] text-slate-500 truncate">Managing Partner</div>
              </button>
            </div>
          </div>

          {/* Two Links Under Login: Forgot Password & Create Account */}
          <div className="pt-2 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={openForgotModal}
              className="text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
            >
              Forgot Password?
            </button>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="text-[var(--text-muted)] hover:text-[var(--text-main)] font-semibold transition-colors cursor-pointer"
            >
              Create an Account
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
                    onClick={() => setForgotStep('email_sent')}
                    className="btn-black py-2.5 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-emerald-400" /> Email
                  </button>
                  <button
                    onClick={() => setForgotStep('whatsapp_sent')}
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

      {/* CREATE ACCOUNT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative font-sans text-xs text-center">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-main)] p-1"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-[var(--text-main)]">Account Registration</h3>
            <p className="text-[var(--text-muted)] leading-relaxed font-semibold">
              Please contact your admin for account addition.
            </p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="btn-black w-full py-2.5 cursor-pointer mt-2"
            >
              Got it
            </button>
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
