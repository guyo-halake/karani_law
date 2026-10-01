import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://hhkbypvdwikxdlwivmrn.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhoa2J5cHZkd2lreGRsd2l2bXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NTg2NTUsImV4cCI6MjEwNTAzNDY1NX0.WBtSdlFX-DFG_Rfaf_19GU7meTBSvDUTzkosft-hjlc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface SystemRole {
  id: string;
  name: string;
  code: 'Admin' | 'Developer' | 'Advocate';
  hasAllPermissions: boolean;
  description: string;
}

export const DB_SYSTEM_ROLES: SystemRole[] = [
  {
    id: 'role-admin',
    name: 'Admin',
    code: 'Admin',
    hasAllPermissions: true,
    description: 'Full system administrative access, billing approvals, user role management & taxation master rights.'
  },
  {
    id: 'role-developer',
    name: 'Developer',
    code: 'Developer',
    hasAllPermissions: true,
    description: 'Full developer access, database migrations, Supabase storage bucket configurations & API integrations.'
  },
  {
    id: 'role-advocate',
    name: 'Advocates / Lawyers / Custom',
    code: 'Advocate',
    hasAllPermissions: false,
    description: 'Legal practice role for preparing bills of costs, client correspondence & matter filings.'
  }
];

export interface SystemUser {
  id: string;
  authUserId?: string;
  firmId?: string;
  fullName: string;
  advocateTitle: string;
  lskNo: string;
  role: 'Admin' | 'Developer' | 'Advocate';
  position: string;
  workEmail: string;
  personalEmail: string;
  phonePrimary: string;
  phoneSecondary: string;
  hasAllPermissions: boolean;
  passwordHash: string;
  avatarUrl?: string;
  barAdmissionNumber?: string;
  department?: string;
}

export const saveUserProfile = (user: SystemUser) => {
  try {
    const storedSession = localStorage.getItem('BILLSZIP_SESSION');
    if (storedSession) {
      const current = JSON.parse(storedSession);
      if (current && (current.id === user.id || current.workEmail === user.workEmail)) {
        localStorage.setItem('BILLSZIP_SESSION', JSON.stringify(user));
      }
    }
    const stored = localStorage.getItem('EXACT_USERS');
    let list: SystemUser[] = stored ? JSON.parse(stored) : [...SEEDED_USERS];
    const idx = list.findIndex(u => u.id === user.id || u.workEmail?.toLowerCase() === user.workEmail?.toLowerCase());
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...user };
    } else {
      list.push(user);
    }
    localStorage.setItem('EXACT_USERS', JSON.stringify(list));
  } catch (e) {}
  window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: user }));
};

// SEEDED USERS IN DATABASE
export const SEEDED_USERS: SystemUser[] = [
  {
    id: "usr-guyoh-admin",
    fullName: "Guyoh Alake",
    advocateTitle: "Adv. Guyoh Alake",
    lskNo: "ADMIN/2026/001",
    role: "Admin",
    position: "Senior Managing Partner & System Administrator",
    workEmail: "guyohalakeofficial@gmail.com",
    personalEmail: "guyohalakeofficial@gmail.com",
    phonePrimary: "+254 700 888 999",
    phoneSecondary: "+254 722 000 888",
    hasAllPermissions: true,
    passwordHash: "guyoh123"
  },
  {
    id: "usr-karani-admin",
    fullName: "Karani Victor",
    advocateTitle: "Adv. Karani Victor",
    lskNo: "P.105/9920",
    role: "Developer",
    position: "Senior Partner & Remuneration Lead",
    workEmail: "vickarani@gmail.com",
    personalEmail: "vickarani@gmail.com",
    phonePrimary: "+254 712 345678",
    phoneSecondary: "+254 733 987654",
    hasAllPermissions: true,
    passwordHash: "karani123"
  },
  {
    id: "usr-advocate-002",
    fullName: "Nyagah Kithinji",
    advocateTitle: "Adv. Nyagah Kithinji",
    lskNo: "P.105/1992",
    role: "Advocate",
    position: "Senior Associate Advocate",
    workEmail: "advocate@kithinjilegal.co.ke",
    personalEmail: "nkithinji@gmail.com",
    phonePrimary: "+254 722 000 111",
    phoneSecondary: "+254 733 111 222",
    hasAllPermissions: false,
    passwordHash: "lawyer123"
  },
  {
    id: "usr-p3l-admin",
    fullName: "Razak Wako",
    advocateTitle: "Razak Wako (P3L Developer)",
    lskNo: "P3L/DEV/2026/001",
    role: "Developer",
    position: "Lead Developer & System Administrator",
    workEmail: "razak.admin@p3ldev.com",
    personalEmail: "razak.admin@p3ldev.com",
    phonePrimary: "+254 700 123456",
    phoneSecondary: "+254 711 654321",
    hasAllPermissions: true,
    passwordHash: "razak123"
  }
];

export const EXACT_FIRM_INFO = {
  name: "Nyagah B. Kithinji & Co. Advocates",
  firmRegNo: "LSK/FIRM/1992/105",
  address: "Upper Hill Financial District, Mbaruk Road off Ngong Road",
  fullLocation: "Mbaruk Road off Ngong Road, Golf Course Estate, Upper Hill, Nairobi, Kenya",
  poBox: "P.O. Box 45892-00100, Nairobi, Kenya",
  email: "info@kithinjilegal.co.ke",
  taxationEmail: "taxation@kithinjilegal.co.ke",
  billingEmail: "billing@kithinjilegal.co.ke",
  phone: "+254 (0)20 271 8900 / +254 722 000 000",
  kraPin: "P051123456Z",
  bankDetails: "KCB Bank Kenya Ltd | Kilimani Branch | A/C No: 1104889922 | Swift: KCBLKENX",
  website: "www.kithinjilegal.co.ke",
  logoUrl: "/logo.png",
  user: {
    name: "Adv. Guyoh Alake",
    role: "Admin",
    lskNo: "ADMIN/2026/001",
    email: "guyohalakeofficial@gmail.com"
  }
};

export const EXACT_LOGGED_IN_USER = SEEDED_USERS[0];

// 1. CLIENTS DATABASE SCHEMA & INTERFACE
export interface ExactClientRecord {
  id: string;
  name: string;
  company: string;
  category: string;
  email: string;
  phone: string;
  phonePrimary: string;
  phoneSecondary: string;
  matters: number;
  mattersList: string[];
  code?: string;
  kraPin?: string;
  contactPerson?: string;
  activeMattersCount?: number;
  totalBilledAmount?: number;
}

export const EXACT_CLIENTS: ExactClientRecord[] = [
  {
    id: "c1",
    name: "Seyani Brothers & Co. (K) Limited",
    company: "Seyani Brothers Construction Group",
    category: "Corporate or Institutional",
    email: "info@seyani.co.ke",
    phone: "+254 720 100 200",
    phonePrimary: "+254 720 100 200",
    phoneSecondary: "+254 20 271 8800",
    matters: 2,
    mattersList: ["Seyani v Greenhills (HCCC E104/2025)", "Seyani Commercial Lease Review"],
    code: "CLI-SEYANI-001",
    kraPin: "P051234567A",
    contactPerson: "Managing Director",
    activeMattersCount: 2,
    totalBilledAmount: 31072493.28
  },
  {
    id: "c2",
    name: "Dhanya Construction Kenya Limited",
    company: "Dhanya Civil & Engineering Ltd",
    category: "Corporate or Institutional",
    email: "legal@dhanyaconstruction.co.ke",
    phone: "+254 733 400 500",
    phonePrimary: "+254 733 400 500",
    phoneSecondary: "+254 711 222 333",
    matters: 1,
    mattersList: ["Dhanya v Sunil Shah (Arb. Cause 12/2025)"],
    code: "CLI-DHANYA-002",
    kraPin: "P051987654B",
    contactPerson: "Head of Legal",
    activeMattersCount: 1,
    totalBilledAmount: 4210930.59
  },
  {
    id: "c3",
    name: "Zhenjian Chengjian Construction Africa Ltd",
    company: "Zhenjian Group International",
    category: "Corporate or Institutional",
    email: "legal@zhenjian.co.ke",
    phone: "+254 721 888 999",
    phonePrimary: "+254 721 888 999",
    phoneSecondary: "+254 700 999 111",
    matters: 1,
    mattersList: ["Zhenjian v Eighty Eight Nairobi (HCCOMM E547/2024)"],
    code: "CLI-ZHENJIAN-003",
    kraPin: "P051777888C",
    contactPerson: "Chief Legal Counsel",
    activeMattersCount: 1,
    totalBilledAmount: 405594.00
  },
  {
    id: "c4",
    name: "Eighty Eight Nairobi Limited",
    company: "88 Nairobi Luxury Towers",
    category: "Corporate or Institutional",
    email: "finance@eightyeight.co.ke",
    phone: "+254 711 900 800",
    phonePrimary: "+254 711 900 800",
    phoneSecondary: "+254 20 555 4444",
    matters: 1,
    mattersList: ["Main Suit Party Bill taxation"],
    code: "CLI-88NAIROBI-004",
    kraPin: "P051666555D",
    contactPerson: "Finance Director",
    activeMattersCount: 1,
    totalBilledAmount: 405594.00
  },
  {
    id: "c5",
    name: "Sunil Shah",
    company: "Shah Real Estate Holdings",
    category: "Individual Client",
    email: "sunil.shah@gmail.com",
    phone: "+254 722 555 444",
    phonePrimary: "+254 722 555 444",
    phoneSecondary: "+254 733 888 777",
    matters: 1,
    mattersList: ["Arbitration Hearing Respondent Defense"],
    code: "CLI-SUNIL-005",
    kraPin: "A001234567K",
    contactPerson: "Sunil Shah",
    activeMattersCount: 1,
    totalBilledAmount: 0.00
  }
];

// 2. MATTERS DATABASE SCHEMA & INTERFACE
export interface ExactMatterRecord {
  id: string;
  title: string;
  applicant: string;
  applicantRole: string;
  respondent: string;
  respondentRole: string;
  forum: string;
  status: string;
  statusClass: 'ready' | 'court' | 'pending' | 'closed';
  caseNo: string;
  filedBy: string;
  amount: number;
  itemsCount: number;
  feeNoteLink: string;
  documentLink: string;
  nextHearingDate?: string;
  matterNumber?: string;
  leadAdvocate?: string;
}

export const EXACT_MATTERS: ExactMatterRecord[] = [
  {
    id: "seyani",
    title: "Seyani Brothers & Co. (K) Ltd v Greenhills Investment Ltd",
    applicant: "Seyani Brothers & Co. (K) Ltd",
    applicantRole: "Claimant",
    respondent: "Greenhills Investment Ltd",
    respondentRole: "Respondent",
    forum: "Arbitration / High Court Commercial",
    status: "Taxation Ready",
    statusClass: "ready",
    caseNo: "HCCC E104/2025",
    filedBy: "Nyagah B. Kithinji & Co. Advocates — for the Claimant",
    amount: 30820193.28,
    itemsCount: 250,
    feeNoteLink: "BOC-2026-SEYANI-001",
    documentLink: "26.02.2026 - BILL OF COSTS - Seyani v Green Hills (1).xlsx",
    nextHearingDate: "Today @ 09:30 AM",
    matterNumber: "HCCC E104/2025",
    leadAdvocate: "Adv. Karani Victor"
  },
  {
    id: "dhanya",
    title: "Dhanya Construction Kenya Ltd v Sunil Shah",
    applicant: "Dhanya Construction Kenya Ltd",
    applicantRole: "Claimant",
    respondent: "Sunil Shah",
    respondentRole: "Respondent",
    forum: "Arbitration Tribunal",
    status: "Taxation Ready",
    statusClass: "ready",
    caseNo: "Arb. Cause No. 12 of 2025",
    filedBy: "Nyagah B. Kithinji & Co. Advocates — for the Claimant",
    amount: 3986663.93,
    itemsCount: 226,
    feeNoteLink: "BOC-2026-DHANYA-003",
    documentLink: "14.01.2026 - Bill of Costs - Dhanya v Sunil.xlsx",
    nextHearingDate: "Tomorrow @ 11:00 AM",
    matterNumber: "Arb. Cause 12/2025",
    leadAdvocate: "Adv. Guyoh Alake"
  },
  {
    id: "hccomm",
    title: "Zhenjian Chengjian Construction Africa Ltd v Eighty Eight Nairobi Ltd & Anor",
    applicant: "Zhenjian Chengjian Construction",
    applicantRole: "Plaintiff",
    respondent: "Eighty Eight Nairobi Ltd & Anor",
    respondentRole: "Defendants",
    forum: "High Court — Commercial Division",
    status: "Commercial Court",
    statusClass: "court",
    caseNo: "HCCOMM E547 of 2024",
    filedBy: "Nyagah B. Kithinji & Co. Advocates — for Defendants",
    amount: 405594.00,
    itemsCount: 19,
    feeNoteLink: "BOC-2026-ZHENJIAN-002",
    documentLink: "HCCOMM E547 of 2024 - Main Suit - 88's Party and Party Bill of Costs.xlsx",
    nextHearingDate: "06 Oct 2026 @ 02:15 PM",
    matterNumber: "HCCOMM E547/2024",
    leadAdvocate: "Adv. Nyagah Kithinji"
  }
];

// 3. FEE NOTES DATABASE SCHEMA & INTERFACE (Processed & Drafts)
export interface ExactFeeNoteRecord {
  id: string;
  billNumber: string;
  matterId: string;
  matterTitle: string;
  clientName: string;
  courtSchedule: string;
  claimValue: number;
  instructionFee: number;
  gettingUpFee: number;
  grandTotal: number;
  status: 'processed' | 'draft';
  generatedByUser: string;
  generatedByUserId: string;
  createdAt: string;
  pdfUrl: string;
  excelUrl: string;
  excelData?: any[];
  claimantName?: string;
  respondentName?: string;
  judgeName?: string;
  forumName?: string;
  approvalStatus?: 'pending' | 'approved' | 'returned';
  returnNotes?: string;
}

const INITIAL_FEE_NOTES: ExactFeeNoteRecord[] = [
  {
    id: "fn-001",
    billNumber: "BOC-2026-SEYANI-001",
    matterId: "seyani",
    matterTitle: "Seyani Brothers & Co. (K) Ltd v Greenhills Investment Ltd",
    clientName: "Seyani Brothers & Co. (K) Limited",
    courtSchedule: "Schedule 6 — High Court / Court of Appeal",
    claimValue: 221268881.47,
    instructionFee: 18500000.00,
    gettingUpFee: 6166666.67,
    grandTotal: 30820193.28,
    status: "processed",
    generatedByUser: "Karani Victor (Senior Partner)",
    generatedByUserId: "usr-karani-001",
    createdAt: "2026-02-26 10:45 AM",
    pdfUrl: "/vault/26.02.2026_BILL_OF_COSTS_Seyani.pdf",
    excelUrl: "/vault/26.02.2026_BILL_OF_COSTS_Seyani.xlsx"
  },
  {
    id: "fn-002",
    billNumber: "BOC-2026-DHANYA-003",
    matterId: "dhanya",
    matterTitle: "Dhanya Construction Kenya Ltd v Sunil Shah",
    clientName: "Dhanya Construction Kenya Limited",
    courtSchedule: "Schedule 7 — Arbitral Proceedings",
    claimValue: 3986663.93,
    instructionFee: 320000.00,
    gettingUpFee: 106666.67,
    grandTotal: 3986663.93,
    status: "processed",
    generatedByUser: "Karani Victor (Senior Partner)",
    generatedByUserId: "usr-karani-001",
    createdAt: "2026-01-14 02:15 PM",
    pdfUrl: "/vault/14.01.2026_Bill_of_Costs_Dhanya.pdf",
    excelUrl: "/vault/14.01.2026_Bill_of_Costs_Dhanya.xlsx"
  },
  {
    id: "fn-003",
    billNumber: "BOC-2026-ZHENJIAN-002",
    matterId: "hccomm",
    matterTitle: "Zhenjian Chengjian Construction Africa Ltd v Eighty Eight Nairobi Ltd",
    clientName: "Eighty Eight Nairobi Limited",
    courtSchedule: "Schedule 6 — High Court Commercial",
    claimValue: 405594.00,
    instructionFee: 75000.00,
    gettingUpFee: 25000.00,
    grandTotal: 405594.00,
    status: "processed",
    generatedByUser: "Nyagah Kithinji (Senior Associate)",
    generatedByUserId: "usr-advocate-002",
    createdAt: "2026-03-01 11:20 AM",
    pdfUrl: "/vault/HCCOMM_E547_Main_Suit_Bill.pdf",
    excelUrl: "/vault/HCCOMM_E547_Main_Suit_Bill.xlsx"
  },
  {
    id: "fn-draft-004",
    billNumber: "BOC-2026-DRAFT-004",
    matterId: "seyani",
    matterTitle: "Seyani Brothers Commercial Lease Taxation Advisory",
    clientName: "Seyani Brothers & Co. (K) Limited",
    courtSchedule: "Schedule 1 — Conveyancing & Leases",
    claimValue: 14500000.00,
    instructionFee: 217500.00,
    gettingUpFee: 0.00,
    grandTotal: 252300.00,
    status: "draft",
    generatedByUser: "Karani Victor (Senior Partner)",
    generatedByUserId: "usr-karani-001",
    createdAt: "2026-03-18 04:50 PM",
    pdfUrl: "",
    excelUrl: ""
  },
  {
    id: "fn-draft-005",
    billNumber: "BOC-2026-DRAFT-005",
    matterId: "dhanya",
    matterTitle: "Dhanya Construction Arbitrator Fee Taxation Ledger",
    clientName: "Dhanya Construction Kenya Limited",
    courtSchedule: "Schedule 7 — Arbitration",
    claimValue: 8500000.00,
    instructionFee: 145000.00,
    gettingUpFee: 48333.33,
    grandTotal: 224266.66,
    status: "draft",
    generatedByUser: "Razak Wako (P3L Developer)",
    generatedByUserId: "usr-p3l-admin",
    createdAt: "2026-03-19 09:10 AM",
    pdfUrl: "",
    excelUrl: ""
  }
];

export let EXACT_FEE_NOTES: ExactFeeNoteRecord[] = [];

export const getFeeNotes = (): ExactFeeNoteRecord[] => {
  try {
    const saved = localStorage.getItem('EXACT_FEE_NOTES');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        EXACT_FEE_NOTES = parsed;
        return parsed;
      }
    }
  } catch (e) {}
  if (!EXACT_FEE_NOTES || EXACT_FEE_NOTES.length === 0) {
    EXACT_FEE_NOTES = [...INITIAL_FEE_NOTES];
  }
  return EXACT_FEE_NOTES;
};

EXACT_FEE_NOTES = getFeeNotes();

export const persistFeeNotes = (notes: ExactFeeNoteRecord[]) => {
  EXACT_FEE_NOTES = [...notes];
  try {
    localStorage.setItem('EXACT_FEE_NOTES', JSON.stringify(notes));
  } catch (e) {}
  window.dispatchEvent(new CustomEvent('feeNotesUpdated', { detail: notes }));
};

export const saveFeeNotes = () => {
  try {
    localStorage.setItem('EXACT_FEE_NOTES', JSON.stringify(EXACT_FEE_NOTES));
  } catch (e) {}
  window.dispatchEvent(new CustomEvent('feeNotesUpdated', { detail: EXACT_FEE_NOTES }));
};

export const fetchFeeNotesFromDatabase = async (firmId?: string): Promise<ExactFeeNoteRecord[]> => {
  try {
    let query = supabase.from('fee_notes').select('*').order('created_at', { ascending: false });
    if (firmId) {
      query = query.or(`firm_id.eq.${firmId},firm_id.is.null`);
    }
    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      const records: ExactFeeNoteRecord[] = data.map((row: any) => ({
        id: row.id,
        billNumber: row.bill_number,
        matterId: row.matter_id || '',
        matterTitle: row.matter_title || 'Bill of Costs',
        clientName: row.client_name || 'Client',
        courtSchedule: row.court_schedule || '',
        claimValue: Number(row.claim_value || 0),
        instructionFee: Number(row.instruction_fee || 0),
        gettingUpFee: Number(row.getting_up_fee || 0),
        grandTotal: Number(row.grand_total || 0),
        status: row.status === 'processed' || row.status === 'issued' ? 'processed' : 'draft',
        approvalStatus: row.status === 'issued' ? 'approved' : row.status === 'draft' ? 'pending' : undefined,
        generatedByUser: row.generated_by_user || 'Advocate',
        generatedByUserId: row.generated_by_user_id || '',
        createdAt: row.created_at || new Date().toISOString(),
        pdfUrl: row.pdf_url || '',
        excelUrl: row.excel_url || '',
        excelData: row.excel_data || undefined
      }));

      // Merge remote records with any local records
      const localNotes = getFeeNotes();
      const combinedMap = new Map<string, ExactFeeNoteRecord>();
      records.forEach(r => combinedMap.set(r.id || r.billNumber, r));
      localNotes.forEach(l => {
        if (!combinedMap.has(l.id) && !combinedMap.has(l.billNumber)) {
          combinedMap.set(l.id || l.billNumber, l);
        }
      });
      const combined = Array.from(combinedMap.values());
      persistFeeNotes(combined);
      return combined;
    }
  } catch (e) {
    console.warn('fetchFeeNotesFromDatabase remote error, using local ledger:', e);
  }

  return getFeeNotes();
};

export const updateFeeNoteStatus = async (firmId: string, noteId: string, status: ExactFeeNoteRecord['status']) => {
  const { error } = await supabase.from('fee_notes').update({ status }).eq('firm_id', firmId).eq('id', noteId);
  if (error) throw error;
};

export const deleteFeeNote = async (firmId: string, noteId: string) => {
  const { error } = await supabase.from('fee_notes').delete().eq('firm_id', firmId).eq('id', noteId);
  if (error) throw error;
};

// 4. MESSAGES DATABASE SCHEMA & INTERFACE (WhatsApp, Email & Internal)
export interface ExactMessageRecord {
  id: string;
  senderName: string;
  recipientName: string;
  channel: 'whatsapp' | 'email' | 'internal';
  type: 'client' | 'internal';
  text: string;
  attachmentName?: string;
  attachmentUrl?: string;
  timestamp: string;
}

export const EXACT_MESSAGES: ExactMessageRecord[] = [
  {
    id: "msg-1",
    senderName: "Seyani Brothers (Finance)",
    recipientName: "Karani Victor",
    channel: "email",
    type: "client",
    text: "Good morning Advocates, please send the updated Bill of Costs for HCCC E104/2025.",
    attachmentName: "Taxation_Request_Form.pdf",
    attachmentUrl: "/docs/Taxation_Request_Form.pdf",
    timestamp: "2026-03-19 09:15 AM"
  },
  {
    id: "msg-2",
    senderName: "Dhanya Construction (Legal)",
    recipientName: "Karani Victor",
    channel: "whatsapp",
    type: "client",
    text: "Please confirm date for taxation hearing before the Arbitrator.",
    timestamp: "2026-03-18 03:40 PM"
  },
  {
    id: "msg-3",
    senderName: "Nyagah Kithinji",
    recipientName: "Karani Victor",
    channel: "internal",
    type: "internal",
    text: "Schedule 6 High Court ad valorem instruction fees verified for Seyani Brothers matter.",
    attachmentName: "Schedule_6_Fee_Breakdown.xlsx",
    attachmentUrl: "/docs/Schedule_6_Fee_Breakdown.xlsx",
    timestamp: "2026-03-19 08:30 AM"
  }
];

// 5. ACTIVITY LOGS / RECENTS DATABASE SCHEMA & INTERFACE
export interface ExactRecentActivityRecord {
  id: string;
  userId: string;
  userName: string;
  type: 'login' | 'bill_created' | 'message_sent' | 'file_uploaded' | 'reminder';
  title: string;
  details: string;
  timestamp: string;
}

export const EXACT_RECENTS_LOGS: ExactRecentActivityRecord[] = [
  {
    id: "rec-1",
    userId: "usr-karani-001",
    userName: "Karani Victor",
    type: "login",
    title: "System User Login",
    details: "Authenticated as Senior Partner & Admin via Advocate Portal",
    timestamp: "2026-03-19 11:04 AM"
  },
  {
    id: "rec-2",
    userId: "usr-karani-001",
    userName: "Karani Victor",
    type: "bill_created",
    title: "Bill of Costs Calculated & Processed",
    details: "Generated BOC-2026-SEYANI-001 for Kshs 30,820,193.28 under Schedule 6",
    timestamp: "2026-02-26 10:45 AM"
  },
  {
    id: "rec-3",
    userId: "usr-advocate-002",
    userName: "Nyagah Kithinji",
    type: "message_sent",
    title: "Internal Advocate Note Sent",
    details: "Sent fee breakdown verification note to Karani Victor",
    timestamp: "2026-03-19 08:30 AM"
  },
  {
    id: "rec-4",
    userId: "usr-p3l-admin",
    userName: "Razak Wako (Developer)",
    type: "file_uploaded",
    title: "Vault Spreadsheet Uploaded",
    details: "Uploaded 26.02.2026 - BILL OF COSTS - Seyani v Green Hills (1).xlsx",
    timestamp: "2026-03-01 02:00 PM"
  },
  {
    id: "rec-5",
    userId: "usr-karani-001",
    userName: "Karani Victor",
    type: "reminder",
    title: "Taxation Hearing Reminder Set",
    details: "Arbitration taxation hearing scheduled for Seyani Brothers v Greenhills",
    timestamp: "2026-03-18 05:00 PM"
  }
];

export interface ExactVaultFileRecord {
  id: string;
  filename: string;
  path: string;
  matter: string;
  client: string;
  fileType: string;
  size: string;
  updatedAt: string;
  extractedMetrics: {
    claimValue: number;
    instructionFee: number;
    gettingUpFee: number;
    itemizedFees: number;
    arbitratorCosts: number;
    grandTotal: number;
  };
  verifiedTruth: boolean;
}

export const EXACT_VAULT_FILES: ExactVaultFileRecord[] = [
  {
    id: "v1",
    filename: "26.02.2026 - BILL OF COSTS - Seyani v Green Hills (1).xlsx",
    path: "C:\\Users\\guyoh\\Desktop\\Karani Law\\files\\26.02.2026 - BILL OF COSTS - Seyani v Green Hills (1).xlsx",
    matter: "Seyani Brothers & Co. (K) Ltd v Greenhills Investment Ltd (HCCC E104/2025)",
    client: "Seyani Brothers & Co. (K) Limited",
    fileType: "Excel Spreadsheet (.xlsx)",
    size: "32.2 KB",
    updatedAt: "2026-02-26",
    extractedMetrics: {
      claimValue: 221268881.47,
      instructionFee: 18500000.00,
      gettingUpFee: 6166666.67,
      itemizedFees: 29252354.86,
      arbitratorCosts: 1567838.42,
      grandTotal: 30820193.28
    },
    verifiedTruth: true
  },
  {
    id: "v2",
    filename: "14.01.2026 - Bill of Costs - Dhanya v Sunil.xlsx",
    path: "C:\\Users\\guyoh\\Desktop\\Karani Law\\files\\14.01.2026 - Bill of Costs - Dhanya v Sunil.xlsx",
    matter: "Dhanya Construction Kenya Ltd v Sunil Shah (Arb. Cause No. 12 of 2025)",
    client: "Dhanya Construction Kenya Limited",
    fileType: "Excel Spreadsheet (.xlsx)",
    size: "27.0 KB",
    updatedAt: "2026-01-14",
    extractedMetrics: {
      claimValue: 3986663.93,
      instructionFee: 320000.00,
      gettingUpFee: 106666.67,
      itemizedFees: 3986663.93,
      arbitratorCosts: 0,
      grandTotal: 3986663.93
    },
    verifiedTruth: true
  },
  {
    id: "v3",
    filename: "HCCOMM E547 of 2024 - Main Suit - 88's Party and Party Bill of Costs.xlsx",
    path: "C:\\Users\\guyoh\\Desktop\\Karani Law\\files\\HCCOMM E547 of 2024 - Main Suit - 88's Party and Party Bill of Costs.xlsx",
    matter: "Zhenjian Chengjian Construction Africa Ltd v Eighty Eight Nairobi Ltd (HCCOMM E547/2024)",
    client: "Eighty Eight Nairobi Limited",
    fileType: "Excel Spreadsheet (.xlsx)",
    size: "13.9 KB",
    updatedAt: "2026-03-01",
    extractedMetrics: {
      claimValue: 405594.00,
      instructionFee: 75000.00,
      gettingUpFee: 25000.00,
      itemizedFees: 405594.00,
      arbitratorCosts: 0,
      grandTotal: 405594.00
    },
    verifiedTruth: true
  }
];
