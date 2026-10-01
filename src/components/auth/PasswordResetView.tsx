import React, { useState } from 'react';
import { CheckCircle2, Key, Lock } from 'lucide-react';
import { supabase } from '../../services/supabase';

export const PasswordResetView: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmation) {
      setError('Passwords do not match.');
      return;
    }
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setMessage('Password updated. You can now sign in with your new password.');
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex items-center justify-center p-4">
      <div className="vercel-card w-full max-w-md p-6 sm:p-8 space-y-5">
        <div className="text-center space-y-2">
          <Lock className="w-8 h-8 mx-auto text-amber-500" />
          <h1 className="font-brand font-extrabold text-xl">Set a new password</h1>
          <p className="text-xs text-[var(--text-muted)]">Choose a password for your Karani Law account.</p>
        </div>
        {error && <p className="p-3 rounded-xl bg-red-500/10 text-red-500 text-xs">{error}</p>}
        {message ? (
          <div className="space-y-3 text-center text-emerald-600 text-sm"><CheckCircle2 className="w-8 h-8 mx-auto" /><p>{message}</p></div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <label className="block space-y-1.5"><span className="font-semibold">New password</span><span className="relative block"><Key className="w-4 h-4 absolute left-3 top-3 text-[var(--text-muted)]" /><input required type="password" value={password} onChange={event => setPassword(event.target.value)} className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl pl-10 pr-3 py-2.5" /></span></label>
            <label className="block space-y-1.5"><span className="font-semibold">Confirm password</span><input required type="password" value={confirmation} onChange={event => setConfirmation(event.target.value)} className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2.5" /></label>
            <button className="btn-black w-full py-3 font-semibold">Update Password</button>
          </form>
        )}
      </div>
    </div>
  );
};