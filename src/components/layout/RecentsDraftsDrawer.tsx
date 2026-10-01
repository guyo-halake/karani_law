import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  FileEdit,
  LogIn,
  Calculator,
  MessageSquare,
  FileText,
  Bell,
  ArrowRight,
  User,
  CheckCircle2
} from 'lucide-react';
import {
  SystemUser,
  supabase
} from '../../services/supabase';

interface RecentsDraftsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
  onNavigateToBuilder?: (note?: any, isPreview?: boolean) => void;
  currentUser?: SystemUser | null;
}

export const RecentsDraftsDrawer: React.FC<RecentsDraftsDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onNavigateToBuilder,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'recents' | 'drafts'>('recents');

  const [dbDrafts, setDbDrafts] = useState<any[]>([]);
  const [dbLogs, setDbLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUserId = currentUser?.id;
  const currentUserName = currentUser?.fullName || 'your account';

  const fetchRealtimeData = async () => {
    if (!currentUser?.firmId || !currentUserId) {
      setDbDrafts([]);
      setDbLogs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [draftsRes, logsRes] = await Promise.all([
        supabase.from('fee_notes').select('*').eq('firm_id', currentUser.firmId).eq('generated_by_user_id', currentUserId).eq('status', 'draft').order('created_at', { ascending: false }),
        supabase.from('activity_logs').select('*').eq('firm_id', currentUser.firmId).order('created_at', { ascending: false }).limit(10)
      ]);
      setDbDrafts(draftsRes.data || []);
      setDbLogs(logsRes.data || []);
    } catch (err) {
      setDbDrafts([]);
      setDbLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    void fetchRealtimeData();
    const handleRealtime = (event: Event) => {
      const detail = (event as CustomEvent<{ table?: string }>).detail;
      if (detail?.table === 'fee_notes' || detail?.table === 'activity_logs') void fetchRealtimeData();
    };
    window.addEventListener('databaseRealtimeUpdate', handleRealtime);
    return () => window.removeEventListener('databaseRealtimeUpdate', handleRealtime);
  }, [isOpen, currentUser?.firmId, currentUserId]);

  const userDrafts = dbDrafts;
  const displayLogs = dbLogs;

  if (!isOpen) return null;

  // Helper to render type icons for Recents tab
  const getRecentIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <LogIn className="w-4 h-4 text-blue-500" />;
      case 'bill_created':
        return <Calculator className="w-4 h-4 text-emerald-500" />;
      case 'message_sent':
        return <MessageSquare className="w-4 h-4 text-amber-500" />;
      case 'file_uploaded':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'reminder':
        return <Bell className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-[var(--text-muted)]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      {/* Backdrop Click to Close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Right Drawer Window */}
      <div className="relative w-full max-w-lg bg-[var(--bg-card)] border-l border-[var(--border-color)] shadow-2xl flex flex-col h-full z-10 font-sans text-xs">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between shrink-0 bg-[var(--bg-subtle)]">
          <div>
            <h2 className="font-brand font-extrabold text-base text-[var(--text-main)] flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-[var(--text-main)]" /> Recents & Drafts Drawer
            </h2>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              System Audit Logs & Personal Saved Drafts for {currentUserName}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Recents vs Drafts */}
        <div className="p-3 border-b border-[var(--border-color)] bg-[var(--bg-card)] shrink-0 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('recents')}
            className={`flex-1 py-2 px-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'recents'
                ? 'bg-[var(--btn-bg)] text-[var(--btn-text)] shadow-sm'
                : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-color)]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Recents Log
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              {displayLogs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('drafts')}
            className={`flex-1 py-2 px-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'drafts'
                ? 'bg-[var(--btn-bg)] text-[var(--btn-text)] shadow-sm'
                : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-color)]'
            }`}
          >
            <FileEdit className="w-3.5 h-3.5" />
            My Drafts
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-600 dark:text-amber-400">
              {userDrafts.length}
            </span>
          </button>
        </div>

        {/* Drawer Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--bg-subtle)]/30">
          {activeTab === 'recents' ? (
            <div className="space-y-3">
              <span className="text-[10.5px] uppercase font-mono font-bold text-[var(--text-muted)] tracking-wider block">
                System-Wide Activity Stream
              </span>

              {loading ? (
                <div className="text-center py-4 text-xs text-[var(--text-muted)]">Loading real-time logs...</div>
              ) : (
                displayLogs.map((rec: any) => (
                  <div
                    key={rec.id}
                    className="vercel-card p-3.5 space-y-1.5 hover:border-[var(--text-main)] transition-colors"
                  >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-color)]">
                        {getRecentIcon(rec.type)}
                      </div>
                      <strong className="font-bold text-xs text-[var(--text-main)]">{rec.title}</strong>
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">{rec.timestamp}</span>
                  </div>

                  <p className="text-xs text-[var(--text-muted)] leading-relaxed pl-8">
                    {rec.details}
                  </p>

                  <div className="pl-8 pt-1 flex items-center gap-1.5 text-[10.5px] text-[var(--text-muted)] font-mono">
                    <User className="w-3 h-3 text-[var(--text-muted)]" />
                    <span>Logged User: <strong>{rec.userName}</strong></span>
                  </div>
                </div>
              ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <span className="text-[10.5px] uppercase font-mono font-bold text-[var(--text-muted)] tracking-wider block">
                Draft Fee Notes for {currentUserName}
              </span>

              {loading ? (
                <div className="text-center py-4 text-xs text-[var(--text-muted)]">Loading real-time drafts...</div>
              ) : userDrafts.length === 0 ? (
                <div className="text-center py-12 text-[var(--text-muted)] space-y-2">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 opacity-60" />
                  <p className="font-semibold text-xs text-[var(--text-main)]">No pending drafts found.</p>
                  <p className="text-[11px]">All your created fee notes have been processed.</p>
                </div>
              ) : (
                userDrafts.map((draft: any) => (
                  <div
                    key={draft.id}
                    className="vercel-card p-4 space-y-3 hover:border-[var(--text-main)] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono font-bold text-[10px]">
                        DRAFT
                      </span>
                      <span className="font-mono text-[10.5px] text-[var(--text-muted)]">{draft.created_at ? new Date(draft.created_at).toLocaleString() : draft.createdAt}</span>
                    </div>

                    <div>
                      <strong className="font-bold text-xs text-[var(--text-main)] block">{draft.matterTitle || draft.bill_number || 'Draft Fee Note'}</strong>
                      <span className="text-[10.5px] text-[var(--text-muted)] block font-mono mt-0.5">
                        Client: {draft.clientName || 'N/A'} &bull; Bill: {draft.billNumber || draft.bill_number}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] flex items-center justify-between font-mono">
                      <div>
                        <span className="text-[10px] text-[var(--text-muted)] block">Calculated Total</span>
                        <strong className="text-sm font-bold text-[var(--text-main)]">
                          Kshs {(draft.grandTotal || draft.grand_total || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                        </strong>
                      </div>

                      <button
                        onClick={() => {
                          onClose();
                          if (onNavigateToBuilder) {
                            onNavigateToBuilder(draft, false);
                          } else {
                            onNavigateTab('boc');
                          }
                        }}
                        className="btn-black px-3 py-1.5 text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        Resume Draft <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-card)] text-center text-[11px] text-[var(--text-muted)] shrink-0">
          <span>BoC Builder Software 2026 &bull; Realtime Storage Connected</span>
        </div>

      </div>
    </div>
  );
};

export default RecentsDraftsDrawer;
