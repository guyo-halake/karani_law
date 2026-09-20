import React, { useState } from 'react';
import { EXACT_CLIENTS, SEEDED_USERS, SystemUser } from '../../services/supabase';
import {
  Search,
  Send,
  User,
  Paperclip,
  Users,
  Building2,
  MessageSquareOff
} from 'lucide-react';

export const MessagesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'clients' | 'internal'>('clients');
  const [selectedId, setSelectedId] = useState<string>(EXACT_CLIENTS[0].id);
  const [search, setSearch] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [sentMessages, setSentMessages] = useState<Record<string, Array<{ text: string; time: string }>>>({});

  // Filter clients and internal users by search
  const filteredClients = EXACT_CLIENTS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredInternal = SEEDED_USERS.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.workEmail.toLowerCase().includes(search.toLowerCase()) ||
    u.position.toLowerCase().includes(search.toLowerCase())
  );

  const activeContact = activeTab === 'clients'
    ? EXACT_CLIENTS.find(c => c.id === selectedId) || EXACT_CLIENTS[0]
    : SEEDED_USERS.find(u => u.id === selectedId) || SEEDED_USERS[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const newMsg = {
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setSentMessages(prev => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), newMsg]
    }));

    setMessageInput('');
  };

  const activeMessages = sentMessages[selectedId] || [];

  return (
    <div className="space-y-4 h-[calc(100vh-140px)] min-h-[550px] flex flex-col">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-[var(--border-color)]/50 pb-3 shrink-0">
        <div>
          <h1 className="font-brand font-extrabold text-2xl text-[var(--text-main)] tracking-tight">
            Messages & Communications
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Client Messaging & Internal Law Firm Advocates Directory
          </p>
        </div>

        {/* Tab Navigation Controls: Clients vs Internal */}
        <div className="flex items-center gap-1.5 bg-[var(--bg-subtle)] p-1 rounded-xl border border-[var(--border-color)] text-xs shrink-0">
          <button
            onClick={() => {
              setActiveTab('clients');
              setSelectedId(EXACT_CLIENTS[0].id);
            }}
            className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'clients'
                ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs border border-[var(--border-color)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Clients
            <span className="px-1.5 py-0.2 rounded-full bg-[var(--border-color)] font-mono text-[10px]">
              {EXACT_CLIENTS.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('internal');
              setSelectedId(SEEDED_USERS[0].id);
            }}
            className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'internal'
                ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs border border-[var(--border-color)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Internal Lawyers
            <span className="px-1.5 py-0.2 rounded-full bg-[var(--border-color)] font-mono text-[10px]">
              {SEEDED_USERS.length}
            </span>
          </button>
        </div>
      </div>

      {/* Full Screen Grid Layout */}
      <div className="vercel-card flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 text-xs">
        
        {/* Left Directory Sidebar */}
        <div className="border-r border-[var(--border-color)] bg-[var(--bg-subtle)]/50 flex flex-col h-full min-w-0">
          <div className="p-3 border-b border-[var(--border-color)]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[var(--text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={activeTab === 'clients' ? "Search clients..." : "Search advocates..."}
                className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[var(--text-main)] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-color)]">
            {activeTab === 'clients' ? (
              filteredClients.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`p-3.5 cursor-pointer transition-colors flex items-center gap-3 ${
                    selectedId === c.id ? 'bg-[var(--bg-card)] font-semibold border-l-4 border-l-black dark:border-l-white' : 'hover:bg-[var(--bg-card)]/50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <strong className="text-[var(--text-main)] truncate block">{c.name}</strong>
                    <span className="text-[10.5px] text-[var(--text-muted)] truncate block">{c.email}</span>
                  </div>
                </div>
              ))
            ) : (
              filteredInternal.map((u) => (
                <div
                  key={u.id}
                  onClick={() => setSelectedId(u.id)}
                  className={`p-3.5 cursor-pointer transition-colors flex items-center gap-3 ${
                    selectedId === u.id ? 'bg-[var(--bg-card)] font-semibold border-l-4 border-l-black dark:border-l-white' : 'hover:bg-[var(--bg-card)]/50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                    {u.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <strong className="text-[var(--text-main)] truncate block">{u.fullName}</strong>
                      <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-[var(--border-color)] text-[var(--text-muted)]">
                        {u.role}
                      </span>
                    </div>
                    <span className="text-[10.5px] text-[var(--text-muted)] truncate block">{u.position}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Active Messaging Area */}
        <div className="md:col-span-2 flex flex-col h-full bg-[var(--bg-card)]">
          {/* Active Contact Header */}
          <div className="p-3.5 border-b border-[var(--border-color)] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[var(--text-main)]">
                {'name' in activeContact ? activeContact.name : activeContact.fullName}
              </h3>
              <p className="text-[10.5px] text-[var(--text-muted)] font-mono">
                {'email' in activeContact ? activeContact.email : (activeContact as SystemUser).workEmail}
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[10.5px] font-mono font-semibold">
              {activeTab === 'clients' ? 'Client Contact' : (activeContact as SystemUser).position}
            </span>
          </div>

          {/* Conversation Window */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center justify-center space-y-4">
            {activeMessages.length === 0 ? (
              <div className="text-center space-y-2 max-w-sm">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)]">
                  <MessageSquareOff className="w-6 h-6" />
                </div>
                <h4 className="font-brand font-bold text-sm text-[var(--text-main)]">No messages available.</h4>
                <p className="text-xs text-[var(--text-muted)]">
                  There are no past messages with this {'name' in activeContact ? 'client' : 'advocate'}. Send a message below to start communicating.
                </p>
              </div>
            ) : (
              <div className="w-full space-y-3 self-stretch my-auto">
                {activeMessages.map((m, idx) => (
                  <div key={idx} className="flex flex-col items-end">
                    <span className="text-[10px] text-[var(--text-muted)] mb-1 font-mono">You • {m.time}</span>
                    <div className="p-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black text-xs leading-relaxed max-w-md rounded-tr-none">
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message Input Bar */}
          <form onSubmit={handleSend} className="p-3 border-t border-[var(--border-color)] flex items-center gap-2">
            <button
              type="button"
              className="p-2 rounded-xl border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] cursor-pointer"
              title="Attach File"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={`Type message to ${'name' in activeContact ? activeContact.name : activeContact.fullName}...`}
              className="flex-1 bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-main)] focus:outline-none"
            />
            <button
              type="submit"
              className="btn-black px-4 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default MessagesView;
