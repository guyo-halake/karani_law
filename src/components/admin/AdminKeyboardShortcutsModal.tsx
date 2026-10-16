import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface AdminKeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminKeyboardShortcutsModal: React.FC<AdminKeyboardShortcutsModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + K', desc: 'Open Global Command Palette (search projects, clients, actions)' },
    { key: '?', desc: 'Toggle this Keyboard Shortcuts Map' },
    { key: '1 - 8', desc: 'Instant switch between navigation tabs (1=Dash, 2=Projects, 3=CRM, 4=Finance...)' },
    { key: 'Esc', desc: 'Close any active modal, drawer, or search palette' },
    { key: 'R', desc: 'Refresh live telemetry (battery, fibre, thermal readings)' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-4 font-sans">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
              Keyboard Shortcuts Map
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5 font-mono text-xs">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between gap-3">
              <span className="font-sans text-xs text-zinc-700 dark:text-zinc-300">{s.desc}</span>
              <kbd className="px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-[11px] shrink-0 shadow-xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold text-xs cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
