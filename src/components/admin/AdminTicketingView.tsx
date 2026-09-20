import React, { useState } from 'react';
import { HelpCircle, User, MessageSquare, Clock, CheckCircle2, AlertTriangle, Send, Download, Tag, CornerDownRight } from 'lucide-react';

export const AdminTicketingView: React.FC = () => {
  const [tickets, setTickets] = useState([
    {
      id: 'TCK-1001',
      user: 'Adv. Karani Victor',
      email: 'karani.victor@kithinjilegal.co.ke',
      subject: 'Bill of Costs PDF export layout scaling on A4 paper',
      priority: 'High',
      status: 'Open',
      time: '15 mins ago',
      assignedTo: 'Razak Wako (P3L Admin)'
    },
    {
      id: 'TCK-1002',
      user: 'Seyani Brothers Legal Dept',
      email: 'legal@seyani.co.ke',
      subject: 'Supabase storage vault file download permissions inquiry',
      priority: 'Normal',
      status: 'In Progress',
      time: '2 hours ago',
      assignedTo: 'Razak Wako (P3L Admin)'
    },
    {
      id: 'TCK-1003',
      user: 'Dhanya Construction',
      email: 'legal@dhanya.co.ke',
      subject: 'Arbitration Schedule 7 calculation tier verification',
      priority: 'Low',
      status: 'Resolved',
      time: '1 day ago',
      assignedTo: 'Razak Wako (P3L Admin)'
    }
  ]);

  const [selectedTicket, setSelectedTicket] = useState<any | null>(tickets[0]);
  const [replyText, setReplyText] = useState('');

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    alert(`✓ Resolution reply sent to ${selectedTicket.email} for ticket ${selectedTicket.id}!`);
    setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, status: 'Resolved' } : t));
    setReplyText('');
  };

  return (
    <div className="w-full space-y-8 pb-12 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)]/50 pb-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-bold text-[10px]">
            ADMIN CONTROL PANEL
          </span>
          <h1 className="font-brand font-extrabold text-2xl text-[var(--text-main)] tracking-tight mt-1">
            Ticketing & Helpdesk Control Center
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            11 Master Features for Managing Incoming Support Tickets, Triage, SLA Warnings & Resolution Replies
          </p>
        </div>

        <button
          onClick={() => alert('Exporting Ticket Analytics & Audit Logs...')}
          className="btn-outline px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" /> Export Ticket Report
        </button>
      </div>

      {/* Ticket List & Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Ticket Queue */}
        <div className="vercel-card overflow-hidden flex flex-col h-[550px]">
          <div className="p-3.5 border-b border-[var(--border-color)] bg-[var(--bg-subtle)] font-bold text-xs flex items-center justify-between">
            <span className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-500" /> Ticket Queue ({tickets.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-color)]">
            {tickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className={`p-3.5 cursor-pointer transition-colors space-y-1.5 ${
                  selectedTicket?.id === t.id ? 'bg-[var(--bg-subtle)] font-semibold' : 'hover:bg-[var(--bg-subtle)]/50'
                }`}
              >
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-[var(--text-main)]">{t.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold ${
                    t.status === 'Open' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                    t.status === 'In Progress' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  }`}>
                    {t.status}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-[var(--text-main)] truncate">{t.subject}</h4>
                <div className="flex items-center justify-between text-[10.5px] text-[var(--text-muted)] font-mono">
                  <span>{t.user}</span>
                  <span>{t.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Ticket Resolution Detail */}
        {selectedTicket && (
          <div className="lg:col-span-2 vercel-card p-6 flex flex-col justify-between h-[550px]">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <div>
                  <span className="font-mono font-bold text-amber-500 text-xs">{selectedTicket.id}</span>
                  <h3 className="font-bold text-base text-[var(--text-main)] mt-0.5">{selectedTicket.subject}</h3>
                </div>
                <div className="text-right font-mono text-[11px]">
                  <p><strong className="text-[var(--text-muted)]">Assigned:</strong> {selectedTicket.assignedTo}</p>
                  <p><strong className="text-[var(--text-muted)]">Priority:</strong> {selectedTicket.priority}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] space-y-1">
                <span className="font-bold text-xs text-[var(--text-main)] block">{selectedTicket.user} &lt;{selectedTicket.email}&gt;</span>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed font-sans">
                  "Hello P3L Support Team, please assist with this ticket item. We need resolution regarding legal report styling and export."
                </p>
              </div>
            </div>

            {/* Resolution Form */}
            <form onSubmit={handleSendReply} className="space-y-3 pt-4 border-t border-[var(--border-color)]">
              <label className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider block">
                Send P3L Admin Resolution Reply:
              </label>
              <textarea
                rows={4}
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type resolution reply to send to user email..."
                className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-main)] focus:outline-none"
              />
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-emerald-500 font-mono font-semibold">SLA Status: 100% On Track</span>
                <button type="submit" className="btn-black px-5 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                  <Send className="w-3.5 h-3.5" /> Dispatch Resolution
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminTicketingView;
