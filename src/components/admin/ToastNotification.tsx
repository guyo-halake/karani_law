import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

let toastListener: ((toast: ToastMessage) => void) | null = null;

export const showToast = (
  type: ToastMessage['type'],
  title: string,
  message?: string,
  duration: number = 4000
) => {
  const toast: ToastMessage = {
    id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    title,
    message,
    duration,
  };
  if (toastListener) toastListener(toast);
};

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', icon: '#10b981', text: '#065f46' },
  error: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', icon: '#ef4444', text: '#991b1b' },
  warning: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', icon: '#f59e0b', text: '#92400e' },
  info: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)', icon: '#3b82f6', text: '#1e40af' },
};

const DARK_COLORS = {
  success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', icon: '#34d399', text: '#a7f3d0' },
  error: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', icon: '#f87171', text: '#fecaca' },
  warning: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', icon: '#fbbf24', text: '#fde68a' },
  info: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', icon: '#60a5fa', text: '#bfdbfe' },
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<(ToastMessage & { exiting?: boolean })[]>([]);
  const isDark = document.body.classList.contains('dark-mode');

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
  }, []);

  useEffect(() => {
    toastListener = (toast) => {
      setToasts(prev => [...prev, toast]);
      if (toast.duration && toast.duration > 0) {
        setTimeout(() => removeToast(toast.id), toast.duration);
      }
    };
    return () => { toastListener = null; };
  }, [removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '400px', width: '100%', pointerEvents: 'none' }}>
      {toasts.map(toast => {
        const Icon = ICONS[toast.type];
        const colors = isDark ? DARK_COLORS[toast.type] : COLORS[toast.type];

        return (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: '14px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
              animation: toast.exiting ? 'toastSlideOut 0.3s ease-in forwards' : 'toastSlideIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
              transform: toast.exiting ? undefined : 'translateX(100%)',
              opacity: toast.exiting ? undefined : 0,
            }}
          >
            <Icon style={{ width: 20, height: 20, color: colors.icon, flexShrink: 0, marginTop: 1 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: colors.text, margin: 0, lineHeight: 1.4 }}>
                {toast.title}
              </p>
              {toast.message && (
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6875rem', color: colors.text, margin: '4px 0 0', opacity: 0.8, lineHeight: 1.4 }}>
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', color: colors.icon, opacity: 0.6, flexShrink: 0 }}
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>
        );
      })}

      <style>{`
        @keyframes toastSlideIn {
          from { transform: translateX(110%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes toastSlideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(110%); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
