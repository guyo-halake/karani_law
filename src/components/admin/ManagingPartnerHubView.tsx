import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Clock, Users, FileText, ChevronRight, ChevronDown, ChevronUp,
  ArrowUpRight, Search, Eye, Share2, AlertTriangle, Briefcase, ShieldCheck, 
  Calendar, CheckCircle2, Download, Building2, UserCheck, RefreshCw, ExternalLink,
  Lock, Settings, MessageSquare, Edit3, X, Save, Phone, Mail, Award, Plus,
  UserPlus, KeyRound, Send, Check, CheckCheck, Activity, Shield, Sparkles
} from 'lucide-react';
import { 
  ExactFeeNoteRecord, fetchFeeNotesFromDatabase, updateFeeNoteStatus, SystemUser, saveUserProfile
} from '../../services/supabase';
import { fetchClients, fetchFirmUsers, fetchMatters, PermissionItem, fetchPermissionItems, createFirmUser, updateFirmUser } from '../../services/data';
import { getActivityLogs, logSystemActivity } from '../../services/activityLogger';
import { showToast } from './ToastNotification';
import { sendEmail } from '../../services/email';
import { 
  RoleTemplate, 
  fetchRoleTemplates, 
  assignRoleToUser,
  getLocalUserRoleAssignments,
  saveLocalUserRoleAssignments,
  DEFAULT_ROLE_TEMPLATES
} from '../../services/rbac';

interface ManagingPartnerHubViewProps {
  onNavigateTab: (tab: string, targetUserId?: string) => void;
  onNavigateToBuilder?: (note?: any, isPreview?: boolean) => void;
  currentUser?: SystemUser | null;
}

const ROLE_COLORS: Record<string, string> = {
  'managing_partner_exec': 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  'senior_advocates_lawyers': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  'finance_billing_mgr': 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
  'legal_assistant_intern': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  'it_dept_support': 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
  'developer_sys_admin': 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20'
};

export const ManagingPartnerHubView: React.FC<ManagingPartnerHubViewProps> = ({ 
  onNavigateTab, 
  onNavigateToBuilder,
  currentUser 
}) => {
  const [feeNotes, setFeeNotes] = useState<ExactFeeNoteRecord[]>([]);
  const [matters, setMatters] = useState<Awaited<ReturnType<typeof fetchMatters>>>([]);
  const [clients, setClients] = useState<Awaited<ReturnType<typeof fetchClients>>>([]);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [roleTemplates, setRoleTemplates] = useState<RoleTemplate[]>(DEFAULT_ROLE_TEMPLATES);
  const [userRoleMap, setUserRoleMap] = useState<Record<string, string>>({});
  
  const [activeTab, setActiveTab] = useState<'bills' | 'users_permissions' | 'clients'>('bills');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'processed' | 'draft'>('all');
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);

  // Modals for Actions
  const [managingUser, setManagingUser] = useState<SystemUser | null>(null);
  const [messagingUser, setMessagingUser] = useState<SystemUser | null>(null);
  const [messageText, setMessageText] = useState('');
  const [roleDropdownUser, setRoleDropdownUser] = useState<string | null>(null);

  // Add New User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [isManualRegistration, setIsManualRegistration] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [newPersonalEmail, setNewPersonalEmail] = useState('');
  const [newCompanyEmail, setNewCompanyEmail] = useState('');
  const [newFirstPassword, setNewFirstPassword] = useState('');
  const [newConfirmPassword, setNewConfirmPassword] = useState('');
  const [newAdvocateTitle, setNewAdvocateTitle] = useState('');
  const [newPosition, setNewPosition] = useState('Senior Advocate');
  const [newLskNo, setNewLskNo] = useState('');
  const [newRoleTemplate, setNewRoleTemplate] = useState('senior_advocates_lawyers');
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  useEffect(() => {
    const firmId = currentUser?.firmId || 'firm-001';
    const loadHub = async () => {
      try {
        const [loadedFees, loadedMatters, loadedClients, loadedUsers, loadedTemplates] = await Promise.all([
          fetchFeeNotesFromDatabase(firmId),
          fetchMatters(firmId),
          fetchClients(firmId),
          fetchFirmUsers(firmId),
          fetchRoleTemplates()
        ]);
        setFeeNotes(loadedFees);
        setMatters(loadedMatters);
        setClients(loadedClients);
        setUsers(loadedUsers);
        setRoleTemplates(loadedTemplates);

        const localMap = getLocalUserRoleAssignments();
        const initialMap: Record<string, string> = { ...localMap };
        loadedUsers.forEach(u => {
          if (!initialMap[u.id]) {
            if (u.role === 'Developer') initialMap[u.id] = 'developer_sys_admin';
            else if (u.role === 'Admin') initialMap[u.id] = 'managing_partner_exec';
            else initialMap[u.id] = 'senior_advocates_lawyers';
          }
        });
        setUserRoleMap(initialMap);
      } catch (error) {
        showToast('error', 'Executive data unavailable', 'Unable to load live firm data.');
      }
    };
    void loadHub();
    const handleRealtime = (event: Event) => {
      const detail = (event as CustomEvent<{ table?: string }>).detail;
      if (['fee_notes', 'matters', 'clients', 'users'].includes(detail?.table || '')) void loadHub();
    };
    window.addEventListener('databaseRealtimeUpdate', handleRealtime);
    return () => {
      window.removeEventListener('databaseRealtimeUpdate', handleRealtime);
    };
  }, [currentUser?.firmId]);

  // Personalized Greeting
  const currentHour = new Date().getHours();
  const greetingTime = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';
  const advocateName = currentUser?.advocateTitle || currentUser?.fullName || 'Adv. Guyoh Alake';

  // 1. Realtime Revenue & Billings Calculations
  const totalBilled = feeNotes.reduce((sum, fn) => sum + (fn.grandTotal || 0), 0);
  const processedNotes = feeNotes.filter(fn => fn.status === 'processed');
  const totalApproved = processedNotes.reduce((sum, fn) => sum + (fn.grandTotal || 0), 0);
  const draftNotes = feeNotes.filter(fn => fn.status === 'draft');
  const totalDraft = draftNotes.reduce((sum, fn) => sum + (fn.grandTotal || 0), 0);

  // Top Billed Clients from Real-Time Fee Notes & Ledgers
  const clientBillingMap: Record<string, { total: number; count: number; category: string }> = {};
  feeNotes.forEach(fn => {
    const client = fn.clientName || 'General Client';
    if (!clientBillingMap[client]) {
      const match = clients.find(c => c.name.toLowerCase() === client.toLowerCase());
      clientBillingMap[client] = { total: 0, count: 0, category: match?.category || 'Corporate Client' };
    }
    clientBillingMap[client].total += fn.grandTotal || 0;
    clientBillingMap[client].count += 1;
  });
  const sortedClients = Object.entries(clientBillingMap).sort((a, b) => b[1].total - a[1].total);

  // 3. Real Recent Activity Stream
  const activityList = getActivityLogs().slice(0, 6).map(a => ({
    id: a.id,
    user: a.advocateName,
    role: a.advocateRole,
    action: a.action || a.actionDescription || 'updated taxation record',
    time: a.timeAgo || 'Just now',
    badgeColor: a.badgeColor || 'bg-emerald-500',
    type: a.type
  }));

  // 4. Filtered Fee Notes
  const filteredNotes = feeNotes.filter(fn => {
    const matchesStatus = statusFilter === 'all' || fn.status === statusFilter;
    const matchesSearch = 
      fn.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fn.matterTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fn.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fn.generatedByUser.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Action: Mark Processed
  const handleToggleProcess = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'processed' ? 'draft' : 'processed';
    if (!currentUser?.firmId) return;
    try {
      await updateFeeNoteStatus(currentUser.firmId, id, nextStatus);
      setFeeNotes(prev => prev.map(fn => fn.id === id ? { ...fn, status: nextStatus } : fn));
      showToast('success', 'Status Updated', `Bill of Costs #${id} marked as ${nextStatus}.`);
    } catch (error: any) {
      showToast('error', 'Status update failed', error.message || 'Unable to update bill status.');
    }
  };

  // Action: Open in Builder
  const handleOpenNote = (note: ExactFeeNoteRecord) => {
    if (onNavigateToBuilder) {
      onNavigateToBuilder(note, false);
    } else {
      onNavigateTab('boc');
    }
  };

  // Action: Change User Role Template directly
  const handleChangeUserRole = async (userId: string, templateCode: string) => {
    const targetTpl = roleTemplates.find(t => t.code === templateCode);
    if (!targetTpl) return;

    setUserRoleMap(prev => {
      const next = { ...prev, [userId]: templateCode };
      saveLocalUserRoleAssignments(next);
      return next;
    });
    setRoleDropdownUser(null);

    await assignRoleToUser(userId, targetTpl.id, currentUser?.id);
    const targetUser = users.find(u => u.id === userId);
    showToast('success', 'Role Template Updated', `Assigned "${targetTpl.name}" to ${targetUser?.fullName || 'user'}.`);
    logSystemActivity(
      currentUser?.fullName || 'Managing Partner',
      `updated role for ${targetUser?.fullName} -> ${targetTpl.name}`,
      'permission',
      'bg-blue-500'
    );
  };

  // Action: Save Managed User Profile
  const handleSaveManagedUser = async () => {
    if (!managingUser) return;
    const firmId = currentUser?.firmId || 'firm-001';
    try {
      await updateFirmUser(firmId, managingUser);
      setUsers(prev => prev.map(u => u.id === managingUser.id ? managingUser : u));
      setManagingUser(null);
      showToast('success', 'User Profile Saved', `Updated details for ${managingUser.fullName}.`);
      logSystemActivity(
        currentUser?.fullName || 'Managing Partner',
        `updated full profile and credentials for ${managingUser.fullName}`,
        'permission',
        'bg-blue-500'
      );
    } catch (e: any) {
      showToast('error', 'Save Failed', e.message || 'Unable to update user details.');
    }
  };

  // Action: Send Quick Invitation (with Credentials)
  const handleSendQuickInvitation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newFullName.trim() || !newCompanyEmail.trim() || !newFirstPassword) {
      showToast('error', 'Missing Information', 'Please provide full name, company email, and initial password.');
      return;
    }
    if (newFirstPassword !== newConfirmPassword) {
      showToast('error', 'Password Mismatch', 'The passwords entered do not match.');
      return;
    }

    setIsSubmittingUser(true);
    const firmId = currentUser?.firmId || 'firm-001';

    try {
      // 1. Create User in Database
      const newUser = await createFirmUser(firmId, {
        fullName: newFullName.trim(),
        advocateTitle: newAdvocateTitle.trim() || `Adv. ${newFullName.trim()}`,
        workEmail: newCompanyEmail.trim(),
        personalEmail: newPersonalEmail.trim() || newCompanyEmail.trim(),
        phonePrimary: newPhoneNumber.trim(),
        position: newPosition || 'Senior Advocate',
        role: 'Advocate',
        lskNo: newLskNo.trim(),
        passwordHash: newFirstPassword.trim() || 'pass123',
      });

      // 2. Assign Role Template
      const targetTpl = roleTemplates.find(t => t.code === newRoleTemplate) || roleTemplates[0];
      await assignRoleToUser(newUser.id, targetTpl.id, currentUser?.id);
      setUserRoleMap(prev => ({ ...prev, [newUser.id]: newRoleTemplate }));

      // 3. Send Onboarding Email with Credentials
      const portalUrl = window.location.origin;
      const username = newUsername.trim() || newCompanyEmail.split('@')[0];
      const emailBody = `Welcome to Nyagah Kithinji & Co Systems.\n\nYou have been given access to our Fee Notes building platform. Use the following information to login and update your password on success. Please remember this is a one-time password use, make sure to update your password.\n\n=========================================\nPORTAL URL: ${portalUrl}\nUSERNAME: ${username}\nUSER EMAIL: ${newCompanyEmail.trim()}\nTEMPORARY PASSWORD: ${newFirstPassword || 'pass123'}\n=========================================\n\nClick the link below to accept your invitation and sign in:\n${portalUrl}\n\nYours faithfully,\nNyagah B. Kithinji & Co. Advocates`;

      try {
        await sendEmail({
          to: [newCompanyEmail.trim()],
          subject: 'Welcome to Nyagah Kithinji & Co Systems — Fee Notes Platform Access',
          body: emailBody,
          category: 'internal',
        });
      } catch (err) {
        console.warn('Email dispatch note:', err);
      }

      setUsers(prev => [newUser, ...prev.filter(u => u.id !== newUser.id)]);
      logSystemActivity(
        currentUser?.fullName || 'Managing Partner',
        `invited new advocate ${newUser.fullName} (${newUser.workEmail})`,
        'permission',
        'bg-emerald-500'
      );
      showToast('success', 'Invitation Dispatched', `User ${newUser.fullName} added to database and invitation email sent!`);

      // Reset form
      setShowAddUserModal(false);
      setIsManualRegistration(false);
      setNewUsername('');
      setNewFullName('');
      setNewPhoneNumber('');
      setNewPersonalEmail('');
      setNewCompanyEmail('');
      setNewFirstPassword('');
      setNewConfirmPassword('');
      setNewAdvocateTitle('');
      setNewLskNo('');
    } catch (err: any) {
      showToast('error', 'Creation Failed', err.message || 'Unable to register user.');
    } finally {
      setIsSubmittingUser(false);
    }
  };

  // Action: Manual Registration (Save & Invite without raw credentials)
  const handleSaveAndInviteManual = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newFullName.trim() || !newCompanyEmail.trim()) {
      showToast('error', 'Missing Information', 'Please provide at least full name and company email.');
      return;
    }

    setIsSubmittingUser(true);
    const firmId = currentUser?.firmId || 'firm-001';

    try {
      const targetTpl = roleTemplates.find(t => t.code === newRoleTemplate) || roleTemplates[0];

      // 1. Create User in Database
      const newUser = await createFirmUser(firmId, {
        fullName: newFullName.trim(),
        advocateTitle: newAdvocateTitle.trim() || `Adv. ${newFullName.trim()}`,
        workEmail: newCompanyEmail.trim(),
        personalEmail: newPersonalEmail.trim() || newCompanyEmail.trim(),
        phonePrimary: newPhoneNumber.trim(),
        position: newPosition.trim() || 'Senior Advocate',
        role: targetTpl.code === 'managing_partner_exec' ? 'Admin' : targetTpl.code === 'developer_sys_admin' ? 'Developer' : 'Advocate',
        lskNo: newLskNo.trim(),
        passwordHash: newFirstPassword.trim() || 'pass123',
      });

      // 2. Assign Role Template
      await assignRoleToUser(newUser.id, targetTpl.id, currentUser?.id);
      setUserRoleMap(prev => ({ ...prev, [newUser.id]: newRoleTemplate }));

      // 3. Send Official Onboarding Email (without credentials)
      const portalUrl = window.location.origin;
      const emailBody = `Welcome to Nyagah Kithinji & Co Systems.\n\nYour advocate account has been successfully provisioned on the Fee Notes & Taxation Management Platform with the role archetype "${targetTpl.name}".\n\n=========================================\nPORTAL URL: ${portalUrl}\nACCOUNT EMAIL: ${newCompanyEmail.trim()}\nPOSITION: ${newPosition.trim() || 'Senior Advocate'}\nLSK ROLL NO: ${newLskNo.trim() || 'N/A'}\n=========================================\n\nPlease sign in with your firm credentials or authenticate via single sign-on:\n${portalUrl}\n\nYours faithfully,\nNyagah B. Kithinji & Co. Advocates`;

      try {
        await sendEmail({
          to: [newCompanyEmail.trim()],
          subject: 'Welcome to Nyagah Kithinji & Co Systems — Account Provisioned',
          body: emailBody,
          category: 'internal',
        });
      } catch (err) {
        console.warn('Email dispatch note:', err);
      }

      setUsers(prev => [newUser, ...prev.filter(u => u.id !== newUser.id)]);
      logSystemActivity(
        currentUser?.fullName || 'Managing Partner',
        `registered user ${newUser.fullName} with template ${targetTpl.name}`,
        'permission',
        'bg-purple-500'
      );
      showToast('success', 'User Registered', `Account for ${newUser.fullName} registered and welcome notice dispatched!`);

      // Reset form
      setShowAddUserModal(false);
      setIsManualRegistration(false);
      setNewUsername('');
      setNewFullName('');
      setNewPhoneNumber('');
      setNewPersonalEmail('');
      setNewCompanyEmail('');
      setNewFirstPassword('');
      setNewConfirmPassword('');
      setNewAdvocateTitle('');
      setNewLskNo('');
    } catch (err: any) {
      showToast('error', 'Registration Failed', err.message || 'Unable to register user.');
    } finally {
      setIsSubmittingUser(false);
    }
  };

  // Action: Send Direct Note/Message
  const handleSendMessage = () => {
    if (!messagingUser || !messageText.trim()) return;
    showToast('success', 'Message Dispatched', `Direct notification sent to ${messagingUser.fullName}.`);
    logSystemActivity(
      currentUser?.fullName || 'Managing Partner',
      `sent note to ${messagingUser.fullName}: "${messageText.slice(0, 30)}..."`,
      'permission',
      'bg-purple-500'
    );
    setMessagingUser(null);
    setMessageText('');
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Top Header & Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
              Executive Oversight
            </span>
            <span className="inline-flex items-center gap-1 text-[10.5px] font-mono text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </span>
          </div>
          <h1 className="font-brand font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">
            {greetingTime}, {advocateName}
          </h1>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Firm financial summaries, court docket schedule, and advocate operations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigateTab('managing_permissions')}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Permissions & Templates</span>
          </button>

          <button
            onClick={() => onNavigateTab('boc')}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>New Bill of Costs</span>
          </button>
        </div>
      </div>

      {/* 3 Overview Metric Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Card 1: Revenue & Billings (5 cols) */}
        <div className="lg:col-span-5 modulix-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-brand font-bold text-sm text-slate-900 dark:text-white">Revenue & Billings</h3>
                <span className="text-[10px] font-mono text-slate-400">{feeNotes.length} fee notes recorded</span>
              </div>
            </div>
            <span className="text-[10.5px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg">
              {processedNotes.length} Approved &bull; {draftNotes.length} Draft
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1 border-t border-[var(--border-color)]/60">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Total Billed</span>
              <span className="text-base font-mono font-black text-slate-900 dark:text-white mt-0.5 block">
                KES {(totalBilled / 1000000).toFixed(2)}M
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Approved</span>
              <span className="text-base font-mono font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                KES {(totalApproved / 1000000).toFixed(2)}M
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Pending Drafts</span>
              <span className="text-base font-mono font-black text-amber-600 dark:text-amber-400 mt-0.5 block">
                KES {(totalDraft / 1000000).toFixed(2)}M
              </span>
            </div>
          </div>

          {/* Top Billed Clients Breakdown (Realtime) */}
          <div className="pt-2 border-t border-[var(--border-color)]/60 space-y-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Top Billed Clients
            </span>
            <div className="space-y-1.5">
              {sortedClients.slice(0, 3).map(([clientName, stats], idx) => (
                <div key={clientName} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/40 border border-[var(--border-color)]/40 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[10.5px] font-mono font-bold text-blue-600 dark:text-blue-400">#{idx + 1}</span>
                    <div className="truncate">
                      <span className="font-semibold text-slate-900 dark:text-white block truncate">{clientName}</span>
                      <span className="text-[9.5px] font-mono text-slate-400">{stats.count} bills &bull; {stats.category}</span>
                    </div>
                  </div>
                  <div className="font-mono text-xs font-black text-slate-900 dark:text-white shrink-0">
                    KES {stats.total.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Today's Schedule (Blank & Minimalist as Requested) (3 cols) */}
        <div className="lg:col-span-3 modulix-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-brand font-bold text-sm text-slate-900 dark:text-white">Today's Schedule</h3>
                <span className="text-[10px] font-mono text-slate-400">0 events scheduled</span>
              </div>
            </div>

            {/* Clean Minimalist Blank State */}
            <div className="py-10 text-center space-y-2 border border-dashed border-[var(--border-color)] rounded-xl bg-[var(--bg-subtle)]">
              <Calendar className="w-6 h-6 text-slate-300 dark:text-zinc-600 mx-auto" />
              <p className="text-xs text-slate-500 font-sans max-w-xs mx-auto px-4">
                No hearings or docket events scheduled for today. Docket is clear.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('matters')}
            className="w-full mt-3 py-2 text-[11px] font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-[var(--border-color)] rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>View All Matters</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Real Recent Activity (4 cols) */}
        <div className="lg:col-span-4 modulix-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-brand font-bold text-sm text-slate-900 dark:text-white">Recent Activity</h3>
                  <span className="text-[10px] font-mono text-slate-400">Firm-wide audit logs</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {activityList.map((act) => (
                <div key={act.id} className="flex items-start gap-2.5 py-2 border-b border-[var(--border-color)]/40 last:border-none">
                  <div className={`w-2 h-2 rounded-full ${act.badgeColor} mt-1.5 shrink-0`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-800 dark:text-zinc-200 leading-snug">
                      <span className="font-bold text-slate-900 dark:text-white">{act.user}</span> {act.action}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Main Tabbed Operations Container */}
      <div className="modulix-card p-0 overflow-hidden">
        
        {/* Navigation Tabs Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border-color)] px-5 py-3 bg-[var(--bg-subtle)] gap-3">
          <div className="flex items-center gap-2">
            {[
              { id: 'bills' as const, label: 'Bills of Costs Register', icon: FileText, count: feeNotes.length },
              { id: 'users_permissions' as const, label: 'Users & Permissions Matrix', icon: Users, count: users.length },
              { id: 'clients' as const, label: 'Client Accounts', icon: Building2, count: clients.length },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs font-bold' 
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                    isActive ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white' : 'bg-slate-200/60 dark:bg-zinc-700/60 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {activeTab === 'users_permissions' && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  setShowAddUserModal(true);
                  setIsManualRegistration(false);
                }}
                className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New User</span>
              </button>
              <button
                onClick={() => onNavigateTab('managing_permissions')}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Open Permissions & Templates Studio</span>
              </button>
            </div>
          )}
        </div>

        {/* TAB 1: BILLS OF COSTS REGISTER */}
        {activeTab === 'bills' && (
          <div className="divide-y divide-[var(--border-color)]/60">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No fee notes found matching your filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border-color)] text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider bg-[var(--bg-subtle)]">
                      <th className="py-3 px-5">Bill Number</th>
                      <th className="py-3 px-4">Matter & Client</th>
                      <th className="py-3 px-4">Advocate</th>
                      <th className="py-3 px-4">Court / Schedule</th>
                      <th className="py-3 px-4 text-right">Grand Total (KES)</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]/60">
                    {filteredNotes.map((note) => {
                      const isProcessed = note.status === 'processed';
                      const isExpanded = expandedNoteId === note.id;

                      return (
                        <React.Fragment key={note.id}>
                          <tr className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                            <td className="py-3.5 px-5 font-mono font-bold text-slate-900 dark:text-white">
                              {note.billNumber}
                            </td>
                            <td className="py-3.5 px-4 max-w-xs">
                              <span className="font-semibold text-slate-900 dark:text-white block truncate" title={note.matterTitle}>
                                {note.matterTitle}
                              </span>
                              <span className="text-[11px] text-slate-500 block truncate">
                                {note.clientName}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-zinc-300">
                              {note.generatedByUser}
                            </td>
                            <td className="py-3.5 px-4 text-[11px] text-slate-500">
                              {note.courtSchedule}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-black text-right text-slate-900 dark:text-white">
                              {note.grandTotal.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold capitalize ${
                                isProcessed 
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                              }`}>
                                {note.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setExpandedNoteId(isExpanded ? null : note.id)}
                                  className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                                  title="View Item Breakdown"
                                >
                                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  onClick={() => handleOpenNote(note)}
                                  className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Open</span>
                                </button>
                                <button
                                  onClick={() => handleToggleProcess(note.id, note.status)}
                                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                                    isProcessed
                                      ? 'bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-800'
                                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  }`}
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>{isProcessed ? 'Reopen' : 'Approve'}</span>
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expanded Items Breakdown */}
                          {isExpanded && (
                            <tr className="bg-[var(--bg-subtle)]">
                              <td colSpan={7} className="px-5 py-3">
                                <div className="p-3 bg-white dark:bg-zinc-900 border border-[var(--border-color)] rounded-xl space-y-2">
                                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-500 pb-1 border-b border-[var(--border-color)]">
                                    <span>Item Breakdown</span>
                                    <span>Fee Amount</span>
                                  </div>
                                  <div className="space-y-1 text-xs">
                                    <div className="flex justify-between py-1 border-b border-dashed border-slate-100 dark:border-zinc-800">
                                      <span className="text-slate-700 dark:text-zinc-300">1. Instruction Fee</span>
                                      <span className="font-mono font-semibold">KES {(note.instructionFee || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-dashed border-slate-100 dark:border-zinc-800">
                                      <span className="text-slate-700 dark:text-zinc-300">2. Getting Up Fee</span>
                                      <span className="font-mono font-semibold">KES {(note.gettingUpFee || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between py-1 pt-2 font-bold">
                                      <span className="text-slate-900 dark:text-white">Total Amount</span>
                                      <span className="font-mono text-emerald-600 dark:text-emerald-400">KES {note.grandTotal.toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MODERN USERS AND PERMISSIONS TABLE */}
        {activeTab === 'users_permissions' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider bg-[var(--bg-subtle)]">
                  <th className="py-3 px-5">Advocate / User</th>
                  <th className="py-3 px-4">Contact Details</th>
                  <th className="py-3 px-4">Role Template</th>
                  <th className="py-3 px-4">Granted Permissions</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/60">
                {users.map((user) => {
                  const roleCode = userRoleMap[user.id] || (user.role === 'Developer' ? 'developer_sys_admin' : user.role === 'Admin' ? 'managing_partner_exec' : 'senior_advocates_lawyers');
                  const tpl = roleTemplates.find(t => t.code === roleCode) || roleTemplates[0];
                  const roleBadgeColor = ROLE_COLORS[roleCode] || 'bg-slate-500/10 text-slate-600 border-slate-500/20';
                  const isDevOrExec = roleCode === 'developer_sys_admin' || roleCode === 'managing_partner_exec';

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                      {/* 1. Username Column */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-zinc-300 shrink-0">
                            {user.fullName.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {user.fullName}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {user.advocateTitle || user.position || user.role}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Contact Column */}
                      <td className="py-3.5 px-4 text-[11px] text-slate-600 dark:text-zinc-400">
                        <div className="font-mono">{user.workEmail}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{user.phonePrimary || '+254 700 000 000'}</div>
                      </td>

                      {/* 3. Role Dropdown Column */}
                      <td className="py-3.5 px-4">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setRoleDropdownUser(roleDropdownUser === user.id ? null : user.id)}
                            className="text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                          >
                            <span>{tpl?.name || user.role}</span>
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                          </button>

                          {roleDropdownUser === user.id && (
                            <div className="absolute left-0 top-full mt-1.5 w-64 p-1.5 z-40 bg-white dark:bg-zinc-900 border border-[var(--border-color)] rounded-xl shadow-xl space-y-1">
                              {roleTemplates.map(t => (
                                <button
                                  key={t.code}
                                  onClick={() => handleChangeUserRole(user.id, t.code)}
                                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                                    roleCode === t.code
                                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-bold'
                                      : 'hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200'
                                  }`}
                                >
                                  <div className="font-medium">{t.name}</div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 4. Granted Permissions Column */}
                      <td className="py-3.5 px-4 text-xs max-w-md">
                        {isDevOrExec ? (
                          <div className="space-y-1">
                            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-[11px] block">
                              Full Access ({tpl?.permissions.length || 56} Permissions)
                            </span>
                            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
                              {tpl?.permissions.map(p => (
                                <span key={p.code} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-[9.5px] font-mono text-slate-700 dark:text-zinc-300">
                                  {p.code}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="font-mono text-blue-600 dark:text-blue-400 font-bold text-[11px] block">
                              {tpl?.permissions.length || 26} Permissions Granted
                            </span>
                            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
                              {tpl?.permissions.map(p => (
                                <span key={p.code} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-[9.5px] font-mono text-slate-700 dark:text-zinc-300">
                                  {p.code}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* 5. Actions Column */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-3 text-xs">
                          <button
                            onClick={() => {
                              setMessagingUser(user);
                              setMessageText('');
                            }}
                            className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                            title={`Send note to ${user.fullName}`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setManagingUser(user)}
                            className="text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer"
                          >
                            Manage User
                          </button>

                          <button
                            onClick={() => onNavigateTab('managing_permissions', user.id)}
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 font-semibold cursor-pointer"
                          >
                            Permissions
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: CLIENT ACCOUNTS */}
        {activeTab === 'clients' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider bg-[var(--bg-subtle)]">
                  <th className="py-3 px-5">Client Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4 font-mono text-center">Active Matters</th>
                  <th className="py-3 px-4 font-mono text-right">Total Billed</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/60">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-5">
                      <span className="font-bold text-slate-900 dark:text-white block">{client.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{client.code} &middot; Pin: {client.kraPin}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                        {client.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-800 dark:text-zinc-200 block">{client.contactPerson}</span>
                      <span className="text-[10px] font-mono text-slate-400">{client.email}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-center text-slate-900 dark:text-white">
                      {client.activeMattersCount}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-right text-emerald-600 dark:text-emerald-400">
                      KES {(client.totalBilledAmount ?? 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => onNavigateTab('clients')}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
                      >
                        View Account
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD NEW USER TO DATABASE */}
      {/* ========================================================================= */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="modulix-card p-6 sm:p-8 w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl border border-[var(--border-color)] shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-brand font-bold text-lg text-slate-900 dark:text-white">
                    Add a New User to Database
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Register advocate, assign permissions template, and dispatch portal invitation.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowAddUserModal(false);
                  setIsManualRegistration(false);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Invitation Stage */}
            <form onSubmit={isManualRegistration ? handleSaveAndInviteManual : handleSendQuickInvitation} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Username / Handle:
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs">@</span>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={e => setNewUsername(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Full Legal Name: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newFullName}
                    onChange={e => setNewFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Phone Number:
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={newPhoneNumber}
                      onChange={e => setNewPhoneNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Personal Email:
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      value={newPersonalEmail}
                      onChange={e => setNewPersonalEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="text-xs">
                <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Company Work Email: <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={newCompanyEmail}
                    onChange={e => setNewCompanyEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Password Fields for Quick Send Invitation */}
              {!isManualRegistration && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                  <div>
                    <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      First Password (Temporary): <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={newFirstPassword}
                        onChange={e => setNewFirstPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Confirm First Password: <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={newConfirmPassword}
                        onChange={e => setNewConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Toggle to Manual Registration */}
              <div className="pt-2 border-t border-[var(--border-color)]/60">
                <button
                  type="button"
                  onClick={() => setIsManualRegistration(!isManualRegistration)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>
                    {isManualRegistration 
                      ? 'Switch to Quick Password Invitation Mode' 
                      : 'Continue with manual registration & role assignment'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isManualRegistration ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Extended Manual Registration Fields */}
              {isManualRegistration && (
                <div className="p-4 bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-2xl space-y-4 animate-fadeIn text-xs">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 pb-1 border-b border-[var(--border-color)] flex items-center justify-between">
                    <span>Statutory & RBAC Configuration</span>
                    <span className="text-purple-600 dark:text-purple-400">Database Role Assignment</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Advocate Honorific Title:
                      </label>
                      <input
                        type="text"
                        value={newAdvocateTitle}
                        onChange={e => setNewAdvocateTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                        LSK Roll / Admission Number:
                      </label>
                      <input
                        type="text"
                        value={newLskNo}
                        onChange={e => setNewLskNo(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] bg-white dark:bg-zinc-900 font-mono text-xs text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Firm Position / Designation:
                      </label>
                      <input
                        type="text"
                        value={newPosition}
                        onChange={e => setNewPosition(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Assigned Role Template:
                      </label>
                      <select
                        value={newRoleTemplate}
                        onChange={e => setNewRoleTemplate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] bg-white dark:bg-zinc-900 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                      >
                        {roleTemplates.map(t => (
                          <option key={t.code} value={t.code}>
                            {t.name} ({t.permissions.length} perms)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Capabilities Preview */}
                  <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-[var(--border-color)] space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-700 dark:text-zinc-300">
                        Selected Role Package: {roleTemplates.find(t => t.code === newRoleTemplate)?.name}
                      </span>
                      <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                        {roleTemplates.find(t => t.code === newRoleTemplate)?.permissions.length || 0} Capabilities Active
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-500">
                      {roleTemplates.find(t => t.code === newRoleTemplate)?.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUserModal(false);
                    setIsManualRegistration(false);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                {!isManualRegistration ? (
                  <button
                    type="submit"
                    disabled={isSubmittingUser}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingUser ? 'Dispatching...' : 'Send Invitation'}</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmittingUser}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSubmittingUser ? 'Registering...' : 'Save User & Dispatch Welcome'}</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: FULL-PAGE ADVOCATE PROFILE & PERSONNEL DOSSIER COMMAND CENTER */}
      {/* ========================================================================= */}
      {managingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 animate-fadeIn">
          <div className="modulix-card w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-3xl border border-[var(--border-color)] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            
            {/* Dossier Header Bar */}
            <div className="p-6 border-b border-[var(--border-color)] bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              {/* Hero Identity */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 dark:from-zinc-800 dark:to-zinc-900 text-white border-2 border-white/20 dark:border-zinc-700 flex items-center justify-center font-brand font-bold text-xl shadow-md shrink-0">
                  {managingUser.fullName.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="font-brand font-bold text-lg text-slate-900 dark:text-white">
                      {managingUser.advocateTitle || managingUser.fullName}
                    </h2>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold">
                      Active Account
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono flex items-center gap-2 flex-wrap">
                    <span>ID: {managingUser.id}</span>
                    <span className="text-slate-300">•</span>
                    <span>{managingUser.position || managingUser.role}</span>
                    {managingUser.lskNo && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="text-purple-600 dark:text-purple-400 font-bold">LSK: {managingUser.lskNo}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    const targetId = managingUser.id;
                    setManagingUser(null);
                    onNavigateTab('managing_permissions', targetId);
                  }}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Permissions Studio</span>
                </button>

                <button
                  onClick={() => {
                    const u = managingUser;
                    setManagingUser(null);
                    setMessagingUser(u);
                    setMessageText('');
                  }}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send Note</span>
                </button>

                <button
                  onClick={() => setManagingUser(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Dossier Body (Scrollable Multi-Section CV) */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
              
              {/* Section 1: Professional & Legal Identity */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-color)]">
                  <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-brand font-bold text-sm text-slate-900 dark:text-white">
                    1. Professional & Legal Identity
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Full Legal Name:
                    </label>
                    <input
                      type="text"
                      value={managingUser.fullName}
                      onChange={e => setManagingUser({ ...managingUser, fullName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 font-bold text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Advocate Honorific Title:
                    </label>
                    <input
                      type="text"
                      value={managingUser.advocateTitle || ''}
                      onChange={e => setManagingUser({ ...managingUser, advocateTitle: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                      LSK Roll / Admission No:
                    </label>
                    <input
                      type="text"
                      value={managingUser.lskNo || ''}
                      onChange={e => setManagingUser({ ...managingUser, lskNo: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 font-mono text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Firm Position / Practice Title:
                    </label>
                    <input
                      type="text"
                      value={managingUser.position || ''}
                      onChange={e => setManagingUser({ ...managingUser, position: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Department / Practice Group:
                    </label>
                    <input
                      type="text"
                      value={managingUser.department || 'Commercial & Civil Litigation'}
                      onChange={e => setManagingUser({ ...managingUser, department: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Contact Coordinates */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-color)]">
                  <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="font-brand font-bold text-sm text-slate-900 dark:text-white">
                    2. Contact Coordinates & Work Profile
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Work Company Email:
                    </label>
                    <input
                      type="email"
                      value={managingUser.workEmail}
                      onChange={e => setManagingUser({ ...managingUser, workEmail: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 font-mono text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Personal Direct Email:
                    </label>
                    <input
                      type="email"
                      value={managingUser.personalEmail || ''}
                      onChange={e => setManagingUser({ ...managingUser, personalEmail: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 font-mono text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Primary Phone Number:
                    </label>
                    <input
                      type="text"
                      value={managingUser.phonePrimary || ''}
                      onChange={e => setManagingUser({ ...managingUser, phonePrimary: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 font-mono text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Secondary Contact / Mobile:
                    </label>
                    <input
                      type="text"
                      value={managingUser.phoneSecondary || ''}
                      onChange={e => setManagingUser({ ...managingUser, phoneSecondary: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 font-mono text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Role Template & Authorization Matrix */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h4 className="font-brand font-bold text-sm text-slate-900 dark:text-white">
                      3. Role Template & Access Authorization
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Active RBAC Engine
                  </span>
                </div>

                <div className="p-4 bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-2xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Assigned Role Template:
                      </label>
                      <select
                        value={userRoleMap[managingUser.id] || (managingUser.role === 'Admin' ? 'managing_partner_exec' : managingUser.role === 'Developer' ? 'developer_sys_admin' : 'senior_advocates_lawyers')}
                        onChange={e => handleChangeUserRole(managingUser.id, e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-white dark:bg-zinc-900 font-bold text-xs text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                      >
                        {roleTemplates.map(t => (
                          <option key={t.code} value={t.code}>
                            {t.name} ({t.permissions.length} perms)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {roleTemplates.find(t => t.code === (userRoleMap[managingUser.id] || 'senior_advocates_lawyers'))?.permissions.length || 26} Statutory Capabilities
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Enterprise Role Policy Applied
                      </div>
                    </div>
                  </div>

                  {/* Capabilities Tags - All Permissions */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">
                      All Granted Permissions ({roleTemplates.find(t => t.code === (userRoleMap[managingUser.id] || 'senior_advocates_lawyers'))?.permissions.length || 0}):
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                      {roleTemplates.find(t => t.code === (userRoleMap[managingUser.id] || 'senior_advocates_lawyers'))?.permissions.map(p => (
                        <span key={p.code} className="px-2 py-0.5 rounded-lg bg-white dark:bg-zinc-900 border border-[var(--border-color)] text-[10px] font-mono text-slate-800 dark:text-zinc-200 flex items-center gap-1 shadow-2xs">
                          <span className="text-emerald-500 font-bold">✓</span>
                          <span>{p.code}</span>
                          <span className="text-[8.5px] px-1 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 font-sans">{p.scope}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Recent Activities & Audit Trail */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-color)]">
                  <Activity className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <h4 className="font-brand font-bold text-sm text-slate-900 dark:text-white">
                    4. Operational Activities & Audit Trail
                  </h4>
                </div>

                <div className="space-y-2">
                  {activityList.slice(0, 3).map(act => (
                    <div key={act.id} className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-[var(--border-color)] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2 h-2 rounded-full ${act.badgeColor}`} />
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white">{managingUser.fullName}</span>
                          <span className="text-slate-500 mx-1.5">&middot;</span>
                          <span className="text-slate-600 dark:text-zinc-300">{act.action}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">{act.time}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Dossier Footer Bar */}
            <div className="p-5 border-t border-[var(--border-color)] bg-[var(--bg-subtle)] flex items-center justify-between gap-4">
              <div className="text-[11px] text-slate-500 font-mono hidden sm:block">
                All changes synchronize to the database in real-time.
              </div>
              <div className="flex items-center gap-2.5 ml-auto">
                <button
                  onClick={() => setManagingUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Close Dossier
                </button>
                <button
                  onClick={handleSaveManagedUser}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DIRECT MESSAGE TO ADVOCATE */}
      {/* ========================================================================= */}
      {messagingUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="modulix-card p-6 w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-[var(--border-color)] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-brand font-bold text-base text-slate-900 dark:text-white">
                    Direct Note to {messagingUser.fullName}
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setMessagingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Message Content:
              </label>
              <textarea
                rows={4}
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                placeholder="e.g. Please review the updated Bill of Costs for Seyani Brothers before filing tomorrow morning..."
                className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-color)]">
              <button
                onClick={() => setMessagingUser(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Dispatch Note
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManagingPartnerHubView;
