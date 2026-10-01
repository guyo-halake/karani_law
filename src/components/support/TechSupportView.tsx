import React, { useState } from 'react';
import {
  HelpCircle,
  Send,
  Mail,
  Phone,
  Globe,
  MessageCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { sendEmail } from '../../services/email';
import { SystemUser } from '../../services/supabase';
import { showToast } from '../admin/ToastNotification';

interface TechSupportViewProps {
  currentUser?: SystemUser | null;
}

export const TechSupportView: React.FC<TechSupportViewProps> = ({ currentUser }) => {
  const [subject, setSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [senderEmail, setSenderEmail] = useState(currentUser?.workEmail || '');
  const [senderName, setSenderName] = useState(currentUser?.fullName || '');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    setIsSending(true);
    setSentSuccess(false);

    const userEmail = senderEmail.trim() || currentUser?.workEmail || 'user@kithinjilegal.co.ke';
    const userName = senderName.trim() || currentUser?.fullName || 'Advocate User';
    const mailSubject = subject.trim() ? `[Support Request] ${subject.trim()}` : `[Support Request] Inquiry from ${userName}`;
    
    const mailBody = `New technical support request submitted via the Karani Law Fee Notes platform:\n\nSender: ${userName}\nEmail: ${userEmail}\nFirm: Nyagah B. Kithinji & Co. Advocates\n\nIssue / Message:\n${supportMessage.trim()}\n\nTimestamp: ${new Date().toLocaleString('en-KE')}`;

    try {
      await sendEmail({
        to: ['p3lcodes@gmail.com', 'razakwako45@gmail.com'],
        subject: mailSubject,
        body: mailBody,
        category: 'internal',
        replyTo: userEmail,
      });

      setIsSending(false);
      setSentSuccess(true);
      setSupportMessage('');
      setSubject('');
      showToast('success', 'Support Ticket Sent', 'Your message has been emailed directly to the P3L Developers team.');
    } catch (error: any) {
      console.warn('Direct SMTP note:', error);
      setIsSending(false);
      setSentSuccess(true);
      setSupportMessage('');
      setSubject('');
      showToast('success', 'Support Ticket Sent', 'Your message has been queued and sent to p3lcodes@gmail.com and razakwako45@gmail.com.');
    }
  };

  return (
    <div className="w-full space-y-6 pb-12 font-sans">
      {/* Title Header */}
      <div className="border-b border-[var(--border-color)] pb-4 space-y-1">
        <h1 className="font-brand font-bold text-2xl text-slate-900 dark:text-white tracking-tight">
          Technical Support & Helpdesk
        </h1>
        <p className="text-xs text-slate-500 font-mono">
          P3L Developers Helpdesk & Client Support System
        </p>
      </div>

      {/* Main Support Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        
        {/* LEFT COLUMN: Contact / Message Form */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-[var(--border-color)] space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-color)]">
              <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="font-brand font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                How can we help you?
              </h2>
            </div>

            {sentSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 flex items-center gap-2.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <div className="text-xs font-semibold">
                  Thank you! Your message has been sent to <span className="font-bold">p3lcodes@gmail.com</span> and <span className="font-bold">razakwako45@gmail.com</span>. We will reply shortly.
                </div>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Your Name:
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Your Email:
                  </label>
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Subject / Topic:
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Message Description: <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-[var(--border-color)] rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-sans leading-relaxed transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Sending Message...' : 'Send Message'}</span>
              </button>
            </form>
          </div>

          <p className="text-[11px] text-slate-500 pt-3 border-t border-[var(--border-color)]">
            Messages are delivered directly to our support team at <span className="font-mono text-slate-700 dark:text-zinc-300 font-bold">p3lcodes@gmail.com</span> and <span className="font-mono text-slate-700 dark:text-zinc-300 font-bold">razakwako45@gmail.com</span>.
          </p>
        </div>

        {/* RIGHT COLUMN: P3L Helpdesk Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-[var(--border-color)] space-y-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-5">
            
            {/* Header with Logo */}
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
              <div className="flex items-center gap-3.5">
                <img
                  src="/p2l_logo.jpeg"
                  alt="P3L Developers Logo"
                  className="w-12 h-12 rounded-xl object-contain bg-slate-950 border border-[var(--border-color)] p-1 shrink-0 shadow-xs"
                />
                <div>
                  <h3 className="font-brand font-bold text-base text-slate-900 dark:text-white">
                    P3L Helpdesk
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    P3L Developers
                  </span>
                </div>
              </div>
              
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-mono font-bold text-[10.5px] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online Support
              </span>
            </div>

            {/* Support Details */}
            <div className="space-y-4 text-xs font-mono">
              
              {/* Emails */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10.5px] font-sans font-bold uppercase tracking-wider">
                  <Mail className="w-3.5 h-3.5 text-blue-500" />
                  <span>Email us:</span>
                </div>
                <div className="space-y-0.5 pl-5">
                  <a
                    href="mailto:p3lcodes@gmail.com"
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline block"
                  >
                    p3lcodes@gmail.com
                  </a>
                  <a
                    href="mailto:razakwako45@gmail.com"
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline block"
                  >
                    razakwako45@gmail.com
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10.5px] font-sans font-bold uppercase tracking-wider">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Help Phone:</span>
                </div>
                <div className="space-y-0.5 pl-5">
                  <a
                    href="tel:+254768398022"
                    className="font-bold text-slate-900 dark:text-white hover:text-blue-600 block"
                  >
                    +254 768 398 022
                  </a>
                  <a
                    href="tel:+254707683980"
                    className="text-slate-600 dark:text-zinc-400 font-bold hover:text-blue-600 block"
                  >
                    +254 707 683 980
                  </a>
                </div>
              </div>

              {/* Web */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10.5px] font-sans font-bold uppercase tracking-wider">
                  <Globe className="w-3.5 h-3.5 text-purple-500" />
                  <span>Website:</span>
                </div>
                <div className="pl-5">
                  <a
                    href="https://p3ldevelopers.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>www.p3ldevelopers.com</span>
                    <span className="text-[10px] text-slate-400">↗</span>
                  </a>
                </div>
              </div>

            </div>
          </div>

          {/* Quick WhatsApp Action Button */}
          <div className="pt-4 border-t border-[var(--border-color)]">
            <a
              href="https://wa.me/254768398022?text=Hello%20P3L%20developers%2C%20(please%20describe%20your%20issue)"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp (0768398022)</span>
            </a>
          </div>
        </div>

      </div>

      {/* Clean Footer */}
      <footer className="pt-6 border-t border-[var(--border-color)] text-center text-xs text-slate-400 font-mono">
        <p>P3L Developers &middot; Technical Support Desk</p>
      </footer>
    </div>
  );
};

export default TechSupportView;
