import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  Briefcase,
  TrendingUp,
  Filter,
  ChevronDown,
  ChevronUp,
  Plus,
  UserPlus,
  Calculator,
  FileText,
  DollarSign,
  ChevronRight,
  Sparkles,
  FileCode,
  Eye,
  EyeOff,
  FileEdit,
  Users,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  Building2,
  Award,
  Activity,
  X,
  Save,
  Check,
  Sliders,
  ExternalLink,
  Layers,
  Calendar,
  MessageSquare,
  KeyRound,
  Trash2,
  Edit3
} from 'lucide-react';

import { 
  SystemUser, 
  ExactFeeNoteRecord, 
  ExactClientRecord, 
  fetchFeeNotesFromDatabase, 
  updateFeeNoteStatus,
  getFeeNotes,
  persistFeeNotes,
  EXACT_MATTERS,
  EXACT_CLIENTS
} from '../../services/supabase';
import { 
  createImportedFeeNote, 
  fetchMatters, 
  fetchClients, 
  fetchFirmUsers, 
  createFirmUser, 
  updateFirmUser 
} from '../../services/data';
import { getActivityLogs, logSystemActivity, ActivityLogItem } from '../../services/activityLogger';
import { sendEmail } from '../../services/email';
import { 
  RoleTemplate, 
  fetchRoleTemplates, 
  getLocalUserRoleAssignments, 
  saveLocalUserRoleAssignments, 
  assignRoleToUser,
  DEFAULT_ROLE_TEMPLATES 
} from '../../services/rbac';
import { 
  calculate_schedule_1_conveyancing,
  calculate_schedule_2_debentures,
  calculate_schedule_3_probate,
  calculate_schedule_4_ip,
  calculate_schedule_5_subordinate,
  calculate_schedule_6_high_court,
  calculate_schedule_7_secondary,
  calculate_schedule_8_tribunals,
  calculate_schedule_9_arbitration,
  calculate_schedule_10_criminal,
  calculate_schedule_11_itemized
} from '../../engine/remuneration_engine';

import * as XLSX from 'xlsx';
import { showToast } from '../admin/ToastNotification';

interface DashboardViewProps {
  onNavigateTab: (tab: string, targetUserId?: string) => void;
  onNavigateToBuilder?: (arg1?: any, arg2?: any) => void;
  onOpenRecents?: () => void;
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

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onNavigateToBuilder,
  onOpenRecents,
  currentUser,
}) => {
  const [selectedBarIndex, setSelectedBarIndex] = useState(0);
  const [showPortfolioGraph, setShowPortfolioGraph] = useState<boolean>(() => {
    return localStorage.getItem('BILLSZIP_SHOW_GRAPH') === 'true';
  });

  // Dynamic Real-time Fee Notes & Matters State
  const [feeNotes, setFeeNotes] = useState<ExactFeeNoteRecord[]>([]);
  const [matters, setMatters] = useState<Awaited<ReturnType<typeof fetchMatters>>>([]);
  const [clients, setClients] = useState<ExactClientRecord[]>([]);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [roleTemplates, setRoleTemplates] = useState<RoleTemplate[]>(DEFAULT_ROLE_TEMPLATES);
  const [userRoleMap, setUserRoleMap] = useState<Record<string, string>>({});
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(() => getActivityLogs());

  // Main Executive Tab State: 'bills' | 'users_permissions' | 'clients'
  const [executiveActiveTab, setExecutiveActiveTab] = useState<'bills' | 'users_permissions' | 'clients'>('users_permissions');
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [roleDropdownUser, setRoleDropdownUser] = useState<string | null>(null);

  // Matter Table Checkbox Selection State
  const [selectedMatterIds, setSelectedMatterIds] = useState<string[]>([]);

  // Modals for Actions
  const [managingUser, setManagingUser] = useState<SystemUser | null>(null);
  const [messagingUser, setMessagingUser] = useState<SystemUser | null>(null);
  const [messageText, setMessageText] = useState('');

  // Add New User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newCompanyEmail, setNewCompanyEmail] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [newPersonalEmail, setNewPersonalEmail] = useState('');
  const [newFirstPassword, setNewFirstPassword] = useState('');
  const [newConfirmPassword, setNewConfirmPassword] = useState('');
  const [newAdvocateTitle, setNewAdvocateTitle] = useState('');
  const [newPosition, setNewPosition] = useState('Senior Advocate');
  const [newRoleTemplate, setNewRoleTemplate] = useState('senior_advocates_lawyers');
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  // Load Fee Notes (Firm-Wide Shared Ledger)
  useEffect(() => {
    const firmId = currentUser?.firmId || 'firm-001';
    const loadFeeNotes = () => {
      fetchFeeNotesFromDatabase(firmId)
        .then(notes => {
          if (notes && notes.length > 0) setFeeNotes(notes);
          else setFeeNotes(getFeeNotes());
        })
        .catch(() => setFeeNotes(getFeeNotes()));
    };
    void loadFeeNotes();
    const handleRealtime = (event: Event) => {
      const detail = (event as CustomEvent<{ table?: string }>).detail;
      if (detail?.table === 'fee_notes') void loadFeeNotes();
    };
    window.addEventListener('databaseRealtimeUpdate', handleRealtime);
    window.addEventListener('feeNotesUpdated', loadFeeNotes);
    return () => {
      window.removeEventListener('databaseRealtimeUpdate', handleRealtime);
      window.removeEventListener('feeNotesUpdated', loadFeeNotes);
    };
  }, [currentUser?.firmId]);

  // Load Matters (Firm-Wide Shared Pipeline)
  useEffect(() => {
    const firmId = currentUser?.firmId || 'firm-001';
    const loadMatters = () => {
      fetchMatters(firmId)
        .then(m => {
          if (m && m.length > 0) setMatters(m);
          else setMatters(EXACT_MATTERS);
        })
        .catch(() => setMatters(EXACT_MATTERS));
    };
    void loadMatters();
    const handleRealtime = (event: Event) => {
      const detail = (event as CustomEvent<{ table?: string }>).detail;
      if (detail?.table === 'matters') void loadMatters();
    };
    window.addEventListener('databaseRealtimeUpdate', handleRealtime);
    return () => window.removeEventListener('databaseRealtimeUpdate', handleRealtime);
  }, [currentUser?.firmId]);

  // Load Executive Data (Users, Clients, Role Templates & Audit Logs)
  useEffect(() => {
    const firmId = currentUser?.firmId || 'firm-001';

    const loadExecutiveData = async () => {
      try {
        const [loadedUsers, loadedClients, loadedTemplates] = await Promise.all([
          fetchFirmUsers(firmId),
          fetchClients(firmId),
          fetchRoleTemplates()
        ]);
        setUsers(loadedUsers || []);
        setClients(loadedClients && loadedClients.length > 0 ? loadedClients : EXACT_CLIENTS);
        setRoleTemplates(loadedTemplates && loadedTemplates.length > 0 ? loadedTemplates : DEFAULT_ROLE_TEMPLATES);

        const localMap = getLocalUserRoleAssignments();
        const initialMap: Record<string, string> = { ...localMap };
        (loadedUsers || []).forEach((u: SystemUser) => {
          if (!initialMap[u.id]) {
            if (u.role === 'Developer') initialMap[u.id] = 'developer_sys_admin';
            else if (u.role === 'Admin') initialMap[u.id] = 'managing_partner_exec';
            else initialMap[u.id] = 'senior_advocates_lawyers';
          }
        });
        setUserRoleMap(initialMap);
      } catch (e) {
        setClients(EXACT_CLIENTS);
        setRoleTemplates(DEFAULT_ROLE_TEMPLATES);
      }
    };

    void loadExecutiveData();

    const refreshActivity = () => setActivityLogs(getActivityLogs());
    window.addEventListener('activityLogsUpdated', refreshActivity);
    window.addEventListener('storage', refreshActivity);
    window.addEventListener('permissionsUpdated', loadExecutiveData);

    const handleRealtime = (event: Event) => {
      const detail = (event as CustomEvent<{ table?: string }>).detail;
      if (['users', 'clients', 'permissions', 'activity_logs', 'fee_notes'].includes(detail?.table || '')) {
        void loadExecutiveData();
        refreshActivity();
      }
    };
    window.addEventListener('databaseRealtimeUpdate', handleRealtime);

    return () => {
      window.removeEventListener('activityLogsUpdated', refreshActivity);
      window.removeEventListener('storage', refreshActivity);
      window.removeEventListener('permissionsUpdated', loadExecutiveData);
      window.removeEventListener('databaseRealtimeUpdate', handleRealtime);
    };
  }, [currentUser?.firmId]);

  // Determine if the current active role is Managing Partner, Developer, or Admin
  const isExecutive = 
    currentUser?.role === 'Admin' || 
    currentUser?.role === 'Developer' || 
    (currentUser?.role as any) === 'Managing Partner' || 
    (currentUser?.role as any) === 'ManagingPartner' ||
    userRoleMap[currentUser?.id || ''] === 'managing_partner_exec' ||
    userRoleMap[currentUser?.id || ''] === 'developer_sys_admin';

  // Excel Import State
  const [showExcelImport, setShowExcelImport] = useState(false);
  const [excelData, setExcelData] = useState<any[]>([]);
  const [excelFileName, setExcelFileName] = useState('');
  const [parsedMeta, setParsedMeta] = useState<{
    claimantName?: string;
    respondentName?: string;
    judgeName?: string;
    matterTitle?: string;
    forumName?: string;
    grandTotal?: number;
    courtSchedule?: string;
  }>({});

  const isDuplicate = feeNotes.some(fn => 
    fn.matterTitle === excelFileName.replace('.xlsx', '') || 
    (fn.excelUrl && fn.excelUrl.includes(excelFileName))
  );

  const formatExcelDate = (val: any) => {
    if (val === null || val === undefined || val === '') return '';
    if (typeof val === 'number' && val > 25000 && val < 65000) {
      const d = new Date(Math.round((val - 25569) * 86400 * 1000));
      const day = String(d.getUTCDate()).padStart(2, '0');
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const year = d.getUTCFullYear();
      return `${day}/${month}/${year}`;
    }
    return String(val).trim();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        if (buffer) {
          const wb = XLSX.read(buffer, { type: 'array' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const allRows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true });

          let headerRowIndex = -1;
          for (let i = 0; i < Math.min(15, allRows.length); i++) {
            const row = allRows[i];
            if (row && row.some(cell => typeof cell === 'string' && cell.trim().toUpperCase().includes('DATE'))) {
              headerRowIndex = i;
              break;
            }
          }

          const metaRows = headerRowIndex !== -1 ? allRows.slice(0, headerRowIndex) : [];
          const rawDataRows = headerRowIndex !== -1 ? allRows.slice(headerRowIndex + 1) : allRows;

          let forumName = '';
          let matterTitle = '';
          let claimantName = '';
          let respondentName = '';
          let judgeName = '';
          let courtSchedule = 'Schedule 6 — High Court / Arbitration';

          const metaLines: string[] = [];
          metaRows.forEach(r => {
            (r || []).forEach(c => {
              if (c) {
                String(c).split(/[\r\n]+/).forEach(l => {
                  const trimmed = l.trim();
                  if (trimmed) metaLines.push(trimmed);
                });
              }
            });
          });

          for (const line of metaLines) {
            const u = line.toUpperCase();
            if (u.includes('REPUBLIC OF KENYA') || u.includes('ARBITRATION ACT') || u.includes('HIGH COURT') || u.includes('COMMERCIAL AND')) {
              forumName = line;
            } else if (u.includes('DISPUTE') || u.includes('CONTRACT FOR') || u.includes('CIVIL CASE')) {
              matterTitle = line;
            } else if (u.includes('CLAIMANT') || u.includes('PLAINTIFF')) {
              const cleaned = line.replace(/[\.\s…\-_]*(CLAIMANT|PLAINTIFF).*$/i, '').replace(/^(BETWEEN\s*)/i, '').trim();
              if (cleaned) claimantName = cleaned;
            } else if (u.includes('RESPONDENT') || u.includes('DEFENDANT')) {
              const cleaned = line.replace(/[\.\s…\-_]*(RESPONDENT|DEFENDANT|1ST DEFENDANT).*$/i, '').replace(/^(AND\s*|VERSUS\s*)/i, '').trim();
              if (cleaned) respondentName = cleaned;
            } else if (u.includes('BEFORE') || u.includes('ARCH.') || u.includes('HON.') || u.includes('JUSTICE') || u.includes('FCIARB') || u.includes('MCIARB')) {
              judgeName = line;
            }
          }

          let calculatedGrandTotal = 0;
          const rowsFormatted = rawDataRows
            .filter(r => r && r.length > 0 && r.some((c: any) => c !== null && c !== undefined && String(c).trim() !== ''))
            .map((r, i) => {
              const dateVal = formatExcelDate(r[0]);
              const itemNo = r[1] !== undefined && r[1] !== null && String(r[1]).trim() !== '' ? String(r[1]).trim() : String(i + 1);
              const particulars = r[2] !== undefined && r[2] !== null ? String(r[2]).trim() : '';

              // Intelligently parse amounts from columns (supporting standard 8-column layout & custom 4/5-column layout)
              let folios = '';
              let taxedOff = '';
              let profitCosts = 0;
              let disbursements = 0;

              // Check if standard profit costs exist in column 5 or 6
              const col3Num = typeof r[3] === 'number' ? r[3] : parseFloat(String(r[3] || '').replace(/[^0-9.-]/g, ''));
              const col4Num = typeof r[4] === 'number' ? r[4] : parseFloat(String(r[4] || '').replace(/[^0-9.-]/g, ''));
              const col5Num = typeof r[5] === 'number' ? r[5] : parseFloat(String(r[5] || '').replace(/[^0-9.-]/g, ''));
              const col6Num = typeof r[6] === 'number' ? r[6] : parseFloat(String(r[6] || '').replace(/[^0-9.-]/g, ''));
              const col7Num = typeof r[7] === 'number' ? r[7] : parseFloat(String(r[7] || '').replace(/[^0-9.-]/g, ''));

              if (!isNaN(col5Num) && col5Num > 0) {
                profitCosts = col5Num;
                if (!isNaN(col6Num) && col6Num > 0) disbursements = col6Num;
                folios = r[3] !== undefined ? String(r[3]).trim() : '';
                taxedOff = r[4] !== undefined ? String(r[4]).trim() : '';
              } else if (!isNaN(col6Num) && col6Num > 0) {
                disbursements = col6Num;
                folios = r[3] !== undefined ? String(r[3]).trim() : '';
                taxedOff = r[4] !== undefined ? String(r[4]).trim() : '';
              } else if (!isNaN(col3Num) && col3Num > 0) {
                // In 4-column sheets, column 3 holds the direct fee amount (e.g. 452500, 294125, 650, 34950)
                profitCosts = col3Num;
                if (!isNaN(col4Num) && col4Num > 0) disbursements = col4Num;
              } else if (!isNaN(col4Num) && col4Num > 0) {
                profitCosts = col4Num;
              } else if (!isNaN(col7Num) && col7Num > 0) {
                profitCosts = col7Num;
              }

              const lineTotal = profitCosts + disbursements;
              calculatedGrandTotal += lineTotal;

              return [
                dateVal,
                itemNo,
                particulars,
                folios || (col3Num && profitCosts !== col3Num ? String(col3Num) : ''),
                taxedOff || '',
                profitCosts > 0 ? profitCosts.toFixed(2) : '',
                disbursements > 0 ? disbursements.toFixed(2) : '',
                lineTotal > 0 ? lineTotal.toFixed(2) : ''
              ];
            });

          setExcelData(rowsFormatted);
          setParsedMeta({
            claimantName,
            respondentName,
            judgeName,
            matterTitle,
            forumName,
            courtSchedule,
            grandTotal: calculatedGrandTotal
          });
        }
      } catch (err) {
        showToast('error', 'Parse Error', 'Failed to parse the Excel document. Ensure it matches BOC standard format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirmSave = async () => {
    const firmId = currentUser?.firmId || 'firm-001';
    const userId = currentUser?.id || 'usr-karani-001';
    const userName = currentUser?.fullName || 'Advocate';
    const totalAmount = parsedMeta.grandTotal || 0;
    const billNumber = `BOC-IMP-${Date.now().toString().slice(-6)}`;

    const newImportedNote: ExactFeeNoteRecord = {
      id: 'fn-import-' + Date.now(),
      matterId: 'm1',
      matterTitle: parsedMeta.matterTitle || excelFileName.replace('.xlsx', ''),
      clientName: parsedMeta.claimantName || 'Imported Corporate Client',
      claimantName: parsedMeta.claimantName || '',
      respondentName: parsedMeta.respondentName || '',
      judgeName: parsedMeta.judgeName || '',
      forumName: parsedMeta.forumName || '',
      billNumber,
      courtSchedule: parsedMeta.courtSchedule || 'Schedule 6 — High Court / Arbitration',
      claimValue: 0,
      instructionFee: totalAmount * 0.7,
      gettingUpFee: totalAmount * 0.1,
      grandTotal: totalAmount,
      status: 'processed',
      approvalStatus: 'approved',
      generatedByUser: userName,
      generatedByUserId: userId,
      createdAt: new Date().toISOString(),
      pdfUrl: '',
      excelUrl: '',
      excelData
    };

    try {
      await createImportedFeeNote(
        firmId,
        userId,
        {
          matterTitle: parsedMeta.matterTitle || excelFileName.replace('.xlsx', ''),
          clientName: parsedMeta.claimantName || 'Imported Corporate Client',
          claimantName: parsedMeta.claimantName,
          respondentName: parsedMeta.respondentName,
          judgeName: parsedMeta.judgeName,
          forumName: parsedMeta.forumName,
          courtSchedule: parsedMeta.courtSchedule || 'Schedule 6 — High Court / Arbitration',
        },
        totalAmount,
        [],
        excelData
      );
    } catch (err) {
      console.warn('Remote sync non-fatal:', err);
    }

    // Always commit to persistent storage immediately
    const existing = getFeeNotes();
    const updatedList = [newImportedNote, ...existing.filter((n: ExactFeeNoteRecord) => n.billNumber !== billNumber && n.id !== newImportedNote.id)];
    persistFeeNotes(updatedList);
    setFeeNotes(updatedList);

    setShowExcelImport(false);
    setExcelData([]);
    setExcelFileName('');
    setParsedMeta({});
    showToast('success', 'Import Complete', `Successfully imported ${excelFileName} (KES ${totalAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}) into billing ledger.`);
  };

  // Quick Quote Estimator State
  const [showBocCalc, setShowBocCalc] = useState(true);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [qqCategory, setQqCategory] = useState('high_court_plaintiff');
  const [qqValue, setQqValue] = useState<number | ''>('');

  const getQuickQuoteFee = () => {
    const val = Number(qqValue) || 0;
    
    switch(qqCategory) {
      case 'sch1_purchaser': return calculate_schedule_1_conveyancing(val, 'purchaser').raw_calculated_fee;
      case 'sch1_vendor': return calculate_schedule_1_conveyancing(val, 'vendor').raw_calculated_fee;
      case 'sch2_lender': return calculate_schedule_2_debentures(val, 'lender').raw_calculated_fee;
      case 'sch2_borrower': return calculate_schedule_2_debentures(val, 'borrower').raw_calculated_fee;
      case 'sch3_probate': return calculate_schedule_3_probate(val).raw_calculated_fee;
      case 'sch4_ip_tm': return calculate_schedule_4_ip('trademark_reg').raw_calculated_fee;
      case 'sch4_ip_opp': return calculate_schedule_4_ip('opposition').raw_calculated_fee;
      case 'sch5_subordinate': return calculate_schedule_5_subordinate(val).raw_calculated_fee;
      case 'high_court_plaintiff': return calculate_schedule_6_high_court(val, false).raw_calculated_fee;
      case 'high_court_defendant': return calculate_schedule_6_high_court(val, true).raw_calculated_fee;
      case 'sch7_secondary': return calculate_schedule_7_secondary().raw_calculated_fee;
      case 'sch8_tribunals': return calculate_schedule_8_tribunals().raw_calculated_fee;
      case 'sch9_arbitration': return calculate_schedule_9_arbitration(val).raw_calculated_fee;
      case 'sch10_criminal': return calculate_schedule_10_criminal().raw_calculated_fee;
      case 'sch11_itemized': return calculate_schedule_11_itemized().raw_calculated_fee;
      default: return 0;
    }
  };

  // User Actions
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

  const handleOpenNote = (note: ExactFeeNoteRecord) => {
    if (onNavigateToBuilder) {
      onNavigateToBuilder(note, false);
    } else {
      onNavigateTab('boc');
    }
  };

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

  // Add User Submission
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newCompanyEmail.trim() || !newFirstPassword) {
      showToast('error', 'Missing Fields', 'Please fill in full name, company email, and password.');
      return;
    }
    if (newFirstPassword !== newConfirmPassword) {
      showToast('error', 'Password Mismatch', 'First password and confirmation do not match.');
      return;
    }

    setIsSubmittingUser(true);
    const firmId = currentUser?.firmId || 'firm-001';

    try {
      const created = await createFirmUser(firmId, {
        fullName: newFullName.trim(),
        advocateTitle: newAdvocateTitle.trim() || `Adv. ${newFullName.trim()}`,
        workEmail: newCompanyEmail.trim(),
        personalEmail: newPersonalEmail.trim() || newCompanyEmail.trim(),
        phonePrimary: newPhoneNumber.trim(),
        position: newPosition || 'Senior Advocate',
        role: newRoleTemplate === 'developer_sys_admin' ? 'Developer' : newRoleTemplate === 'managing_partner_exec' ? 'Admin' : 'Advocate',
        passwordHash: newFirstPassword.trim() || 'pass123'
      });

      setUsers(prev => [created, ...prev]);

      const newMap = { ...userRoleMap, [created.id]: newRoleTemplate };
      setUserRoleMap(newMap);
      saveLocalUserRoleAssignments(newMap);

      const targetTpl = roleTemplates.find(t => t.code === newRoleTemplate);
      if (targetTpl) {
        await assignRoleToUser(created.id, targetTpl.id, currentUser?.id);
      }

      // Dispatch Onboarding Email with Credentials
      const portalUrl = window.location.origin;
      const username = newUsername.trim() || newCompanyEmail.split('@')[0];
      const emailBody = `Welcome to Nyagah Kithinji & Co Systems.\n\nYou have been given access to our Fee Notes building platform. Use the following information to login and update your password on success:\n\n=========================================\nPORTAL URL: ${portalUrl}\nUSERNAME: ${username}\nUSER EMAIL: ${newCompanyEmail.trim()}\nTEMPORARY PASSWORD: ${newFirstPassword || 'pass123'}\n=========================================\n\nClick here to sign in: ${portalUrl}\n\nYours faithfully,\nNyagah B. Kithinji & Co. Advocates`;

      try {
        await sendEmail({
          to: [newCompanyEmail.trim()],
          subject: 'Welcome to Nyagah Kithinji & Co Systems — Fee Notes Platform Access',
          body: emailBody,
          category: 'internal',
        });
      } catch (err) {}

      logSystemActivity(
        currentUser?.fullName || 'Managing Partner',
        `invited new advocate ${created.fullName} (${created.workEmail})`,
        'permission',
        'bg-emerald-500'
      );
      window.dispatchEvent(new CustomEvent('activityLogsUpdated'));

      showToast('success', 'User Registered', `${created.fullName} added to firm database with ${targetTpl?.name || newRoleTemplate}.`);
      setShowAddUserModal(false);
      setNewFullName('');
      setNewUsername('');
      setNewCompanyEmail('');
      setNewPhoneNumber('');
      setNewPersonalEmail('');
      setNewFirstPassword('');
      setNewConfirmPassword('');
      setNewAdvocateTitle('');
    } catch (err: any) {
      showToast('error', 'Registration Failed', err.message || 'Unable to register user.');
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const userName = currentUser?.advocateTitle || currentUser?.fullName || 'Advocate';

  // Dynamic Computations
  const pendingTaxationsCount = matters.filter(
    (m) => m.status.toLowerCase().includes('taxation') || m.status.toLowerCase().includes('ready')
  ).length;

  const processedTodayCount = feeNotes.filter(
    (fn) => fn.status === 'processed'
  ).length;

  const untaxedDraftsCount = feeNotes.filter(
    (fn) => fn.status === 'draft'
  ).length;

  const totalMattersCount = matters.length;

  const totalPortfolioValue = matters.reduce(
    (sum, m) => sum + (m.amount || 0), 0
  );

  // Realtime Revenue & Billings Calculations
  const totalBilled = feeNotes.reduce((sum, fn) => sum + (fn.grandTotal || 0), 0);
  const processedNotes = feeNotes.filter(fn => fn.status === 'processed');
  const totalApproved = processedNotes.reduce((sum, fn) => sum + (fn.grandTotal || 0), 0);
  const draftNotes = feeNotes.filter(fn => fn.status === 'draft');
  const totalDraft = draftNotes.reduce((sum, fn) => sum + (fn.grandTotal || 0), 0);

  // Group by client and sort by highest billed amount (Real Dynamic Top Billed Clients)
  const clientBillingMap: Record<string, { total: number; count: number; category: string }> = {};
  feeNotes.forEach(fn => {
    const client = fn.clientName || 'General Corporate Client';
    if (!clientBillingMap[client]) {
      const match = clients.find(c => c.name.toLowerCase() === client.toLowerCase());
      clientBillingMap[client] = { total: 0, count: 0, category: match?.category || 'Corporate or Institutional' };
    }
    clientBillingMap[client].total += fn.grandTotal || 0;
    clientBillingMap[client].count += 1;
  });
  const sortedClients = Object.entries(clientBillingMap).sort((a, b) => b[1].total - a[1].total);

  // Helper to retrieve a user's role template and permissions
  const getUserTemplate = (userId: string, userRole?: string) => {
    const code = userRoleMap[userId] || (userRole === 'Developer' ? 'developer_sys_admin' : userRole === 'Admin' ? 'managing_partner_exec' : 'senior_advocates_lawyers');
    return roleTemplates.find(t => t.code === code) || roleTemplates[0] || DEFAULT_ROLE_TEMPLATES[0];
  };

  return (
    <div className="space-y-12 sm:space-y-14 pb-12">
      
      {/* EXCEL IMPORT COMMAND CENTER */}
      {showExcelImport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-5xl my-8 max-h-[90vh] overflow-y-auto overflow-x-hidden flex flex-col relative">
            <button
              onClick={() => { setShowExcelImport(false); setExcelData([]); setExcelFileName(''); }}
              className="absolute top-6 right-6 p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-red-500 hover:border-red-500 transition-all cursor-pointer"
            >
              Cancel
            </button>
            
            <h2 className="font-brand font-extrabold text-2xl text-[var(--text-main)] mb-2 flex items-center gap-2">
              <FileText className="w-6 h-6 text-emerald-500" />
              Import Excel Bill of Costs
            </h2>
            <p className="text-xs text-[var(--text-muted)] font-mono mb-6">
              Upload your .xlsx file to parse all rows and save exactly as written.
            </p>

            {!excelFileName ? (
              <div className="border-2 border-dashed border-[var(--border-color)] rounded-2xl p-12 flex flex-col items-center justify-center bg-[var(--bg-subtle)] hover:bg-[var(--bg-main)] transition-colors relative">
                <FileText className="w-12 h-12 text-slate-400 mb-4" />
                <p className="text-sm font-bold text-[var(--text-main)]">Click to Browse or Drag & Drop</p>
                <p className="text-xs text-[var(--text-muted)] font-mono mt-1">Supports .xlsx files only</p>
                <input 
                  type="file" 
                  accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" 
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            ) : (
              <div className="space-y-6">
                {isDuplicate && (
                  <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-amber-700 dark:text-amber-500">Duplicate File Detected</h4>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        A bill of costs from this exact file seems to already exist in the database. You can still save it if you wish to create a duplicate copy.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {excelFileName}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] font-sans">
                      <strong className="text-[var(--text-main)]">Matter:</strong> {parsedMeta.matterTitle || 'Extracted Matter'}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
                      {parsedMeta.claimantName && <span><strong>Claimant:</strong> {parsedMeta.claimantName}</span>}
                      {parsedMeta.respondentName && <span><strong>Respondent:</strong> {parsedMeta.respondentName}</span>}
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono pt-1">
                      <span className="text-slate-600 font-semibold">{excelData.length} bill items parsed</span>
                      <span className="text-emerald-600 font-bold">Grand Total: Kshs {(parsedMeta.grandTotal || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleConfirmSave}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-500/20 cursor-pointer shrink-0"
                  >
                    Confirm & Save to Database
                  </button>
                </div>

                <div className="border border-[var(--border-color)] rounded-xl overflow-hidden bg-[var(--bg-main)]">
                  <div className="max-h-[50vh] overflow-y-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[var(--bg-subtle)] sticky top-0 border-b border-[var(--border-color)]">
                        <tr>
                          <th className="py-2 px-4 font-bold text-[var(--text-muted)]">Row</th>
                          <th className="py-2 px-4 font-bold text-[var(--text-muted)]">Content Preview</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-color)]">
                        {excelData.slice(0, 100).map((row, idx) => (
                          <tr key={idx} className="hover:bg-[var(--bg-subtle)]/50 transition-colors">
                            <td className="py-2 px-4 text-slate-400 w-16">{idx + 1}</td>
                            <td className="py-2 px-4 text-[var(--text-main)] truncate max-w-2xl">
                              {row.map((cell: any) => String(cell)).join(' | ')}
                            </td>
                          </tr>
                        ))}
                        {excelData.length > 100 && (
                          <tr>
                            <td colSpan={2} className="py-3 text-center text-slate-400 italic">
                              ...and {excelData.length - 100} more rows
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW USER TO FIRM DATABASE */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="p-6 sm:p-8 w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl border border-[var(--border-color)] shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-brand font-bold text-base text-slate-900 dark:text-white">
                    Add a New User to Database
                  </h3>
                  <p className="text-xs text-slate-500 font-sans">
                    Register advocate, assign permissions template, and dispatch portal invitation.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddUserModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Username / Handle:
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs">@</span>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={e => setNewUsername(e.target.value)}
                      placeholder="dre"
                      className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Full Legal Name: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newFullName}
                    onChange={e => setNewFullName(e.target.value)}
                    placeholder="e.g. Victor Karani"
                    className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Company Work Email: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newCompanyEmail}
                    onChange={e => setNewCompanyEmail(e.target.value)}
                    placeholder="advocate@karanilaw.co.ke"
                    className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Phone Number:
                  </label>
                  <input
                    type="text"
                    value={newPhoneNumber}
                    onChange={e => setNewPhoneNumber(e.target.value)}
                    placeholder="+254 712 345678"
                    className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                    First Password (Temporary): <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={newFirstPassword}
                    onChange={e => setNewFirstPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Confirm First Password: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={newConfirmPassword}
                    onChange={e => setNewConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Assign Role Template:
                  </label>
                  <select
                    value={newRoleTemplate}
                    onChange={e => setNewRoleTemplate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
                  >
                    {roleTemplates.map(t => (
                      <option key={t.code} value={t.code}>
                        {t.name} ({t.permissions.length} perms)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Firm Position / Department:
                  </label>
                  <input
                    type="text"
                    value={newPosition}
                    onChange={e => setNewPosition(e.target.value)}
                    placeholder="e.g. Senior Counsel / Litigation"
                    className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUser}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSubmittingUser ? 'Registering...' : 'Register User & Assign Role'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FULL-PAGE ADVOCATE PROFILE & PERSONNEL DOSSIER COMMAND CENTER */}
      {/* ========================================================================= */}
      {managingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 animate-fadeIn">
          <div className="modulix-card w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-3xl border border-[var(--border-color)] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            
            {/* Dossier Header Bar */}
            <div className="p-6 border-b border-[var(--border-color)] bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              {/* Hero Identity */}
              <div className="flex items-center gap-4">
                {managingUser.avatarUrl ? (
                  <img
                    src={managingUser.avatarUrl}
                    alt={managingUser.fullName}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 dark:border-zinc-700 shadow-md shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 dark:from-zinc-800 dark:to-zinc-900 text-white border-2 border-white/20 dark:border-zinc-700 flex items-center justify-center font-brand font-bold text-xl shadow-md shrink-0">
                    {managingUser.fullName.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                )}
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
                    onNavigateTab('permissions', targetId);
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
                        {roleTemplates.find(t => t.code === (userRoleMap[managingUser.id] || 'senior_advocates_lawyers'))?.permissions.length || 26} Permissions Granted
                      </div>
                    </div>
                  </div>

                  {/* Capabilities Tags - All Permissions */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">
                      Granted Permissions ({roleTemplates.find(t => t.code === (userRoleMap[managingUser.id] || 'senior_advocates_lawyers'))?.permissions.length || 0}):
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

              {/* Section 4: Recent Activity */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-color)]">
                  <Activity className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
                  <h4 className="font-brand font-bold text-sm text-slate-900 dark:text-white">
                    4. Recent Activity
                  </h4>
                </div>

                <div className="space-y-2">
                  {activityLogs.slice(0, 3).map(act => (
                    <div key={act.id} className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-[var(--border-color)] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2 h-2 rounded-full ${act.badgeColor || 'bg-emerald-500'}`} />
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white">{managingUser.fullName}</span>
                          <span className="text-slate-500 mx-1.5">&middot;</span>
                          <span className="text-slate-600 dark:text-zinc-300">{act.action || act.actionDescription}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">{act.timeAgo || 'Recent'}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Dossier Footer Bar */}
            <div className="p-5 border-t border-[var(--border-color)] bg-[var(--bg-subtle)] flex items-center justify-end gap-4">
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

      {/* MODAL: SEND DIRECT NOTE */}
      {messagingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="p-6 w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-[var(--border-color)] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="font-brand font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-600" /> Send Note to {messagingUser.fullName}
              </h3>
              <button onClick={() => setMessagingUser(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <textarea
                rows={3}
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                placeholder="Type your message / directive..."
                className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
              <button onClick={() => setMessagingUser(null)} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900">
                Cancel
              </button>
              <button onClick={handleSendMessage} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs">
                Send Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Header & Action Chips */}
      <div className="flex flex-col gap-6 pb-6 border-b border-[var(--border-color)]/60">
        <div>
          <h1 className="font-brand font-extrabold text-2xl sm:text-3xl lg:text-4xl text-slate-900 dark:text-white tracking-tight">
            Hey, {userName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1.5 font-sans">
            Welcome to Nyagah B. Kithinji & Co. Advocates
          </p>
        </div>

        {/* Action Chips (Horizontal Row) */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigateTab('boc')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold flex items-center gap-2 transition-colors shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Fee Note
          </button>
          
          <button
            onClick={() => setShowExcelImport(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold flex items-center gap-2 transition-colors shadow-sm shadow-emerald-500/20 cursor-pointer"
          >
            <FileText className="w-4 h-4" /> Import Excel Bill
          </button>

          <button
            onClick={() => onNavigateTab('clients')}
            className="px-4 py-2 bg-[var(--bg-subtle)] hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-[var(--border-color)] rounded-full text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-emerald-500" /> Add Client
          </button>

          <button
            onClick={() => onOpenRecents ? onOpenRecents() : onNavigateTab('vault')}
            className="px-4 py-2 bg-[var(--bg-subtle)] hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-[var(--border-color)] rounded-full text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            title="Open Draft Fee Notes & Recent Files"
          >
            <Clock className="w-4 h-4 text-amber-500" /> Drafts / Recents
          </button>
        </div>
      </div>

      {/* Main 12-Column Modulix Dashboard Grid Layout */}
      <div className="grid grid-cols-12 gap-6 lg:gap-8">
        
        {/* LEFT MAIN CONTENT (8 Columns) */}
        <div className="col-span-12 lg:col-span-8 space-y-6 lg:space-y-8">
          
          {/* Top Section: If Executive -> Show Real Dynamic "Revenue & Billings", "Today's Schedule (Blank)", and "Pending and Drafts" Cards */}
          {isExecutive ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Card 1: Revenue & Billings + Minimalist Top Billed Clients (7 cols) */}
              <div className="md:col-span-7 modulix-card p-5 space-y-4 border border-[var(--border-color)] bg-white dark:bg-zinc-900 shadow-xs">
                
                {/* Header Strip */}
                <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-color)]/60">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-brand font-bold text-sm text-slate-900 dark:text-white">
                        Revenue & Billings
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                        {feeNotes.length} fee notes recorded • <span className="text-emerald-600 font-bold">{processedNotes.length} Approved</span> • <span className="text-amber-600 font-bold">{draftNotes.length} Draft</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metric Strip: Total Billed, Approved, Pending Drafts */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-[var(--border-color)]/60">
                    <span className="text-[9.5px] font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-wider block font-semibold">
                      Total Billed
                    </span>
                    <p className="text-base sm:text-lg font-extrabold font-mono text-slate-900 dark:text-white mt-0.5 truncate">
                      KES {(totalBilled / 1000000).toFixed(2)}M
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30">
                    <span className="text-[9.5px] font-mono text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block font-bold">
                      Approved
                    </span>
                    <p className="text-base sm:text-lg font-extrabold font-mono text-emerald-700 dark:text-emerald-300 mt-0.5 truncate">
                      KES {(totalApproved / 1000000).toFixed(2)}M
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30">
                    <span className="text-[9.5px] font-mono text-amber-700 dark:text-amber-400 uppercase tracking-wider block font-bold">
                      Pending Drafts
                    </span>
                    <p className="text-base sm:text-lg font-extrabold font-mono text-amber-700 dark:text-amber-300 mt-0.5 truncate">
                      KES {(totalDraft / 1000000).toFixed(2)}M
                    </p>
                  </div>
                </div>

                {/* Minimalist Top Billed Clients */}
                <div className="pt-2 border-t border-[var(--border-color)]/60 space-y-1.5">
                  <div className="flex items-center justify-between text-[10.5px] font-mono">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">Top Billed Clients</span>
                    <button onClick={() => onNavigateTab('clients')} className="text-blue-600 hover:underline cursor-pointer">
                      Browse Clients ({clients.length})
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {sortedClients.slice(0, 3).map(([clientName, clientData], idx) => (
                      <div 
                        key={clientName} 
                        onClick={() => onNavigateTab('clients')}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/40 border border-[var(--border-color)]/60 flex items-center justify-between gap-2 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono font-bold text-[10.5px] text-blue-600 dark:text-blue-400 shrink-0">
                            #{idx + 1}
                          </span>
                          <div className="min-w-0 truncate">
                            <span className="font-semibold text-slate-900 dark:text-white block truncate">{clientName}</span>
                            <span className="text-[9.5px] text-slate-400 font-mono">{clientData.count} bills • {clientData.category}</span>
                          </div>
                        </div>

                        <span className="font-mono font-bold text-xs text-slate-900 dark:text-emerald-400 shrink-0">
                          KES {clientData.total.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 2 & 3: Today's Schedule (Blank) & Pending and Drafts (5 cols) */}
              <div className="md:col-span-5 flex flex-col gap-4">
                
                {/* Card 2: Today's Schedule (Blank & Minimalist) */}
                <div className="modulix-card p-4 flex-1 flex flex-col justify-between border border-[var(--border-color)] bg-white dark:bg-zinc-900 shadow-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[var(--border-color)]/60">
                      <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h3 className="font-brand font-bold text-xs text-slate-900 dark:text-white">Today</h3>
                        <span className="text-[9.5px] font-mono text-slate-400">0 events scheduled</span>
                      </div>
                    </div>

                    <div className="py-5 text-center border border-dashed border-[var(--border-color)] rounded-xl bg-[var(--bg-subtle)]">
                      <Calendar className="w-5 h-5 text-slate-300 dark:text-zinc-600 mx-auto mb-1" />
                      <p className="text-[11px] text-slate-400 font-sans px-2">
                        Docket is clear for today.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigateTab('matters')}
                    className="w-full mt-2 py-1.5 text-[10.5px] font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 border border-[var(--border-color)] rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>View All Matters</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Card 3: Pending & Drafts */}
                <div 
                  onClick={() => onNavigateTab('feenotes')}
                  className="modulix-card p-4 border border-amber-500/20 bg-amber-50/20 dark:bg-amber-950/10 shadow-xs cursor-pointer hover:border-amber-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="font-brand font-bold text-xs text-slate-900 dark:text-white">Pending & Drafts</h4>
                        <span className="text-[10px] font-mono text-amber-600 font-semibold">{untaxedDraftsCount} Draft Fee Notes</span>
                      </div>
                    </div>
                    <span className="font-mono font-extrabold text-sm text-amber-700 dark:text-amber-400">
                      KES {(totalDraft / 1000000).toFixed(2)}M
                    </span>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            /* Standard 3 Stat Cards for Regular Advocates */
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
              
              <div
                onClick={() => onNavigateTab('matters')}
                className="modulix-card-interactive p-5 space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold font-sans text-slate-900 dark:text-white">Claim Overview</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div className="min-w-0">
                    <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight truncate">
                      Kshs {(totalPortfolioValue / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-1">
                      {totalMattersCount} Active Causes
                    </p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => onNavigateTab('matters')}
                className="modulix-card-interactive p-5 space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold font-sans text-slate-900 dark:text-white">Pending Taxation</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <p className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                      {pendingTaxationsCount}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Ready for Court</span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                onClick={() => onNavigateTab('feenotes')}
                className="modulix-card-interactive p-5 space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold font-sans text-slate-900 dark:text-white">Processed Fee Notes</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <p className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                      {processedTodayCount}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-1">
                      <span>{untaxedDraftsCount} Untaxed / Drafts</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Quick Quote Estimator Widget (Minimalist Theme) */}
          {showBocCalc ? (
            <div className="modulix-card p-5 sm:p-6 bg-[var(--bg-card)] border border-[var(--border-color)]/60">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-emerald-500" />
                <h3 className="font-brand font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">BOC Calc</h3>
                
                <div className="ml-auto flex items-center gap-3">
                  <button 
                    onClick={() => setShowBocCalc(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                    title="Hide Calculator"
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-end gap-4 lg:gap-6 animate-fade-in pt-2">
                <div className="w-full sm:w-1/3">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1.5">Matter Type</label>
                  <select 
                    value={qqCategory}
                    onChange={(e) => setQqCategory(e.target.value)}
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-400 transition-colors"
                  >
                    <option value="sch1_purchaser">Schedule 1: Conveyancing (Purchaser)</option>
                    <option value="sch1_vendor">Schedule 1: Conveyancing (Vendor)</option>
                    <option value="sch2_lender">Schedule 2: Debentures (Lender)</option>
                    <option value="sch2_borrower">Schedule 2: Debentures (Borrower)</option>
                    <option value="sch3_probate">Schedule 3: Probate</option>
                    <option value="sch4_ip_tm">Schedule 4: Trademarks (Registration)</option>
                    <option value="sch4_ip_opp">Schedule 4: Trademarks (Opposition)</option>
                    <option value="sch5_subordinate">Schedule 5: Magistrate Court</option>
                    <option value="high_court_plaintiff">Schedule 6: High Court (Plaintiff)</option>
                    <option value="high_court_defendant">Schedule 6: High Court (Defendant)</option>
                    <option value="sch7_secondary">Schedule 7: Secondary Scale (Default)</option>
                    <option value="sch8_tribunals">Schedule 8: Tribunals (Default)</option>
                    <option value="sch9_arbitration">Schedule 9: Arbitration</option>
                    <option value="sch10_criminal">Schedule 10: Criminal Retainer</option>
                    <option value="sch11_itemized">Schedule 11: Base Folio Rate</option>
                  </select>
                </div>
                
                <div className="w-full sm:w-1/3">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1.5">Claim / Property Value (Kshs)</label>
                  <input 
                    type="number"
                    value={qqValue}
                    onChange={(e) => setQqValue(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Enter value..."
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-400 transition-colors font-mono"
                    disabled={['sch4_ip_tm', 'sch4_ip_opp', 'sch7_secondary', 'sch8_tribunals', 'sch10_criminal', 'sch11_itemized'].includes(qqCategory)}
                  />
                </div>

                <div className="w-full sm:w-1/3 sm:text-right pt-2 sm:pt-0">
                  <span className="text-[10px] font-['Inter'] text-slate-400 uppercase tracking-widest block mb-1">Base Instruction Fee</span>
                  <div className="text-2xl sm:text-3xl font-['Sora'] text-slate-900 dark:text-white tracking-tight">
                    {`Kshs ${getQuickQuoteFee().toLocaleString('en-KE', { minimumFractionDigits: 2 })}`}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <button 
                onClick={() => setShowBocCalc(true)}
                className="p-2.5 bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-xl text-slate-400 hover:text-emerald-500 transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                title="Show BOC Calc"
              >
                <Eye className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Show BOC Calc</span>
              </button>
            </div>
          )}

          {/* Center Main Section: If Executive -> Show Multi-Tab Nav Container (Bills, Users & Permissions Matrix, Clients); If Advocate -> Show Upcoming Court Filings */}
          {isExecutive ? (
            <div className="modulix-card p-0 overflow-hidden border border-[var(--border-color)] bg-white dark:bg-zinc-900 shadow-xs">
              
              {/* iOS / iPhone Style Minimalist Segmented Pill Navigation Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border-color)] px-5 py-3 bg-[var(--bg-subtle)]/60 gap-3">
                
                {/* Segmented Control Pill Group */}
                <div className="inline-flex p-1 rounded-xl bg-slate-200/70 dark:bg-zinc-800 border border-[var(--border-color)]/50 shrink-0">
                  {[
                    { id: 'bills' as const, label: 'Bills of Costs', count: feeNotes.length },
                    { id: 'users_permissions' as const, label: 'Users & Permissions', count: users.length },
                    { id: 'clients' as const, label: 'Client Accounts', count: clients.length },
                  ].map(tab => {
                    const isActive = executiveActiveTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setExecutiveActiveTab(tab.id)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs font-bold' 
                            : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                          isActive 
                            ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white font-bold' 
                            : 'bg-slate-300/50 dark:bg-zinc-700/50 text-slate-600 dark:text-zinc-400'
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {executiveActiveTab === 'users_permissions' && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setShowAddUserModal(true)}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-black dark:hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New User</span>
                    </button>
                    <button
                      onClick={() => onNavigateTab('permissions')}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-[var(--border-color)] hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Permissions Studio</span>
                    </button>
                  </div>
                )}
              </div>

              {/* TAB 1: BILLS OF COSTS REGISTER */}
              {executiveActiveTab === 'bills' && (
                <div className="divide-y divide-[var(--border-color)]/60">
                  {feeNotes.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      No fee notes registered in the firm database.
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
                        <tbody className="divide-y divide-[var(--border-color)]/60 font-sans">
                          {feeNotes.map((note) => {
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

              {/* TAB 2: CLEAN MINIMALIST USERS & PERMISSIONS MATRIX */}
              {executiveActiveTab === 'users_permissions' && (
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border-color)] text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider bg-[var(--bg-subtle)]">
                        <th className="py-2.5 px-3.5 w-44 min-w-[160px]">Advocate / User</th>
                        <th className="py-2.5 px-3 w-40 min-w-[150px]">Contact Details</th>
                        <th className="py-2.5 px-3 w-36 min-w-[130px]">Role Template</th>
                        <th className="py-2.5 px-3 w-auto min-w-[320px]">Granted Permissions</th>
                        <th className="py-2.5 px-3.5 w-36 min-w-[130px] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]/60 font-sans">
                      {users.map((user) => {
                        const roleCode = userRoleMap[user.id] || (user.role === 'Developer' ? 'developer_sys_admin' : user.role === 'Admin' ? 'managing_partner_exec' : 'senior_advocates_lawyers');
                        const tpl = roleTemplates.find(t => t.code === roleCode) || roleTemplates[0];
                        const initials = user.fullName.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase();
                        const isFullAccess = roleCode === 'developer_sys_admin' || roleCode === 'managing_partner_exec';

                        return (
                          <tr key={user.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                            {/* 1. Advocate / User Column (Compact & Clean) */}
                            <td className="py-2 px-3.5">
                              <div className="flex items-center gap-2.5">
                                {user.avatarUrl ? (
                                  <img 
                                    src={user.avatarUrl} 
                                    alt={user.fullName} 
                                    className="w-7 h-7 rounded-lg object-cover border border-[var(--border-color)] shrink-0" 
                                  />
                                ) : (
                                  <div className="w-7 h-7 rounded-lg flex items-center justify-center font-brand font-bold text-[11px] bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-[var(--border-color)] shrink-0">
                                    {initials}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 dark:text-white truncate text-[11.5px] leading-snug">
                                    {user.fullName}
                                  </div>
                                  <div className="text-[10px] text-slate-400 truncate leading-tight">
                                    {user.advocateTitle !== user.fullName ? (user.advocateTitle || user.position || user.role) : (user.position || user.role)}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* 2. Contact Details Column */}
                            <td className="py-2 px-3 font-mono text-[10.5px]">
                              <div className="text-slate-800 dark:text-zinc-200 truncate flex items-center gap-1.5 leading-snug">
                                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{user.workEmail || user.personalEmail}</span>
                              </div>
                              <div className="text-slate-400 text-[9.5px] mt-0.5 flex items-center gap-1.5 leading-tight">
                                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{user.phonePrimary || '+254 700 000 000'}</span>
                              </div>
                            </td>

                            {/* 3. Role Template Column (Minimalist Dropdown - No Loud Colors) */}
                            <td className="py-2 px-3">
                              <div className="relative inline-block">
                                <button
                                  onClick={() => setRoleDropdownUser(roleDropdownUser === user.id ? null : user.id)}
                                  className="text-[11px] font-medium text-slate-800 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded-lg border border-[var(--border-color)] bg-slate-50/50 dark:bg-zinc-800/40 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
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
                                            ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white font-bold'
                                            : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50 text-slate-700 dark:text-zinc-300'
                                        }`}
                                      >
                                        <div className="font-medium">{t.name}</div>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* 4. Granted Permissions Column (Wide & Beautifully Formatted) */}
                            <td className="py-2 px-3">
                              <div className="space-y-1">
                                <span className="font-mono text-slate-700 dark:text-zinc-300 font-bold text-[10.5px] block leading-tight">
                                  {isFullAccess 
                                    ? `Full Access (${tpl?.permissions.length || 68} Permissions)` 
                                    : `${tpl?.permissions.length || 45} Permissions Granted`
                                  }
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {(tpl?.permissions || []).slice(0, 6).map(p => (
                                    <span key={p.code} className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-[9.5px] font-mono text-slate-600 dark:text-zinc-400 border border-[var(--border-color)]/60">
                                      {p.code}
                                    </span>
                                  ))}
                                  {(tpl?.permissions.length || 0) > 6 && (
                                    <span className="px-1.5 py-0.2 rounded bg-slate-200/60 dark:bg-zinc-700/60 text-[9.5px] font-mono text-slate-500 font-semibold">
                                      +{(tpl?.permissions.length || 0) - 6} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* 5. Actions Column (iOS Minimalist Buttons) */}
                            <td className="py-2 px-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5 text-xs">
                                <button
                                  onClick={() => {
                                    setMessagingUser(user);
                                    setMessageText('');
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                                  title={`Send note to ${user.fullName}`}
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => setManagingUser(user)}
                                  className="px-2 py-1 text-[10.5px] font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
                                >
                                  Manage
                                </button>

                                <button
                                  onClick={() => onNavigateTab('permissions', user.id)}
                                  className="px-2 py-1 text-[10.5px] font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-black dark:hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                                >
                                  <Lock className="w-3 h-3" />
                                  <span>Permissions</span>
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
              {executiveActiveTab === 'clients' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
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
                    <tbody className="divide-y divide-[var(--border-color)]/60 font-sans">
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
                            {client.activeMattersCount ?? 0}
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
          ) : (
            /* Upcoming Court Filings & Taxations Table for Regular Advocates */
            <div className="modulix-card p-0 overflow-hidden">
              <div className="p-5 flex items-center justify-between border-b border-slate-200/70">
                <div>
                  <h3 className="font-brand font-bold text-base text-slate-900 dark:text-white">
                    Upcoming Court Filings & Taxations
                  </h3>
                  <p className="text-xs text-slate-500">Live Active Causes Registered in Database</p>
                </div>
                <button
                  onClick={() => onNavigateTab('matters')}
                  className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:border-blue-500 cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5 text-blue-600" />
                  <span>View Matters</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="modulix-table-header">
                      <th className="py-3 px-5">
                        <input 
                          type="checkbox" 
                          className="rounded cursor-pointer" 
                          checked={selectedMatterIds.length > 0 && selectedMatterIds.length === matters.length}
                          onChange={() => {
                            if (selectedMatterIds.length === matters.length) setSelectedMatterIds([]);
                            else setSelectedMatterIds(matters.map(m => m.id));
                          }}
                          title="Select All / Clear All"
                        />
                      </th>
                      <th className="py-3 px-4">Cause / Matter ID</th>
                      <th className="py-3 px-4">Client / Title</th>
                      <th className="py-3 px-4">Claim Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/70 dark:divide-zinc-800 text-xs">
                    {matters.map((m) => {
                      const isChecked = selectedMatterIds.includes(m.id);
                      return (
                        <tr
                          key={m.id}
                          onClick={() => onNavigateTab('matters')}
                          className={`hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer ${
                            isChecked ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''
                          }`}
                        >
                          <td className="py-3.5 px-5" onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="checkbox" 
                              className="rounded cursor-pointer" 
                              checked={isChecked}
                              onChange={() => {
                                setSelectedMatterIds(prev => 
                                  prev.includes(m.id) ? prev.filter(mId => mId !== m.id) : [...prev, m.id]
                                );
                              }}
                            />
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                            {m.caseNo}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-zinc-200">
                            {m.title}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-blue-400">
                            Kshs {m.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              m.statusClass === 'ready'
                                ? 'badge-green'
                                : 'badge-blue'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                m.statusClass === 'ready' ? 'bg-emerald-500' : 'bg-blue-500'
                              }`}></span>
                              {m.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={(e) => { e.stopPropagation(); onNavigateTab('matters'); }} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); onNavigateTab('matters'); }} className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors cursor-pointer">
                                <FileEdit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT AUXILIARY COLUMN (4 Columns): If Executive -> Show Recent Activity; If Advocate -> Show Fee Notes & Billing History */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {isExecutive ? (
            <div className="modulix-card space-y-4 border border-[var(--border-color)] bg-white dark:bg-zinc-900 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]/70">
                <h3 className="font-brand font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-slate-700 dark:text-zinc-300" /> Recent Activity
                </h3>
              </div>

              {/* Dynamic Live Activity Log Feed (Top 5 Real Events by default) */}
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {activityLogs.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No audit logs recorded yet.
                  </div>
                ) : (
                  (showAllActivities ? activityLogs : activityLogs.slice(0, 5)).map((log) => (
                    <div 
                      key={log.id} 
                      className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-zinc-800/40 border border-[var(--border-color)]/60 flex items-start gap-2.5 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${log.badgeColor || 'bg-emerald-500'}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11.5px] text-slate-800 dark:text-zinc-200 font-sans leading-snug">
                          <strong className="text-slate-900 dark:text-white font-semibold">{log.advocateName}</strong>{' '}
                          {log.action || log.actionDescription || 'performed audit event'}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {log.timeAgo || 'Just now'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {activityLogs.length > 5 && (
                <button
                  onClick={() => setShowAllActivities(!showAllActivities)}
                  className="w-full py-1.5 text-[11px] font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-[var(--border-color)] rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-center"
                >
                  {showAllActivities ? 'Show Less' : `Load More (${activityLogs.length - 5} more)`}
                </button>
              )}
            </div>
          ) : (
            <div className="modulix-card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
                <div>
                  <h3 className="font-brand font-bold text-base text-slate-900 dark:text-white">
                    Fee Notes & Billing History
                  </h3>
                  <p className="text-[11px] text-slate-500">{feeNotes.length} fee notes recorded</p>
                </div>
                <button
                  onClick={() => onNavigateTab('feenotes')}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  View All →
                </button>
              </div>

              <div className="space-y-3">
                {feeNotes.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No fee notes registered yet.
                  </div>
                ) : (
                  feeNotes.slice(0, 8).map((fn) => (
                    <div
                      key={fn.id}
                      onClick={() => onNavigateTab('feenotes')}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200/80 dark:border-zinc-700/80 hover:border-blue-500 transition-all cursor-pointer group flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-700 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0 shadow-xs group-hover:border-blue-500 transition-colors">
                        <FileText className="w-5 h-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors" title={fn.clientName || fn.matterTitle}>
                            {fn.clientName || fn.matterTitle}
                          </p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                            fn.status === 'processed'
                              ? 'badge-green'
                              : 'badge-blue'
                          }`}>
                            {fn.status === 'processed' ? 'Processed' : 'Draft'}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate font-mono">
                          Ref: {fn.billNumber}
                        </p>

                        <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200/60 dark:border-zinc-700/60 text-[10.5px]">
                          <span className="font-mono font-bold text-slate-900 dark:text-blue-400">
                            Kshs {(fn.grandTotal || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-slate-400 font-mono">
                            {fn.createdAt ? fn.createdAt.split('T')[0] : 'Recent'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DashboardView;
