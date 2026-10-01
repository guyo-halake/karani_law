import {
  supabase,
  ExactClientRecord,
  ExactMatterRecord,
  ExactVaultFileRecord,
  SystemUser,
  EXACT_CLIENTS,
  EXACT_MATTERS,
  EXACT_VAULT_FILES,
  SEEDED_USERS,
  EXACT_MESSAGES,
  getFeeNotes,
  persistFeeNotes,
  ExactFeeNoteRecord,
  saveUserProfile,
} from './supabase';

const mapClient = (row: any): ExactClientRecord => ({
  id: row.id,
  name: row.name,
  company: row.company || '',
  category: row.client_type === 'individual' ? 'Individual Client' : 'Corporate or Institutional',
  email: row.email || '',
  phone: row.phone_primary || row.phone || '',
  phonePrimary: row.phone_primary || row.phone || '',
  phoneSecondary: row.phone_secondary || '',
  matters: 0,
  mattersList: [],
  code: row.id,
  kraPin: row.kra_pin || '',
  contactPerson: row.contact_person || '',
});

const mapMatter = (row: any): ExactMatterRecord => ({
  id: row.id,
  title: row.title,
  applicant: row.applicant || '',
  applicantRole: row.applicant_role || 'Claimant',
  respondent: row.respondent || '',
  respondentRole: row.respondent_role || 'Respondent',
  forum: row.forum || '',
  status: row.status || 'open',
  statusClass: row.status === 'closed' ? 'closed' : row.status === 'in_taxation' ? 'court' : row.status === 'taxation_ready' ? 'ready' : 'pending',
  caseNo: row.cause_number || '',
  filedBy: row.assigned_advocate_id || '',
  amount: Number(row.claim_value || 0),
  itemsCount: 0,
  feeNoteLink: row.fee_note_link || '',
  documentLink: row.excel_link || row.pdf_link || '',
  matterNumber: row.cause_number || '',
  leadAdvocate: row.assigned_advocate_id || '',
});

export async function fetchClients(firmId: string): Promise<ExactClientRecord[]> {
  try {
    const { data, error } = await supabase.from('clients').select('*').eq('firm_id', firmId).order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      return data.map(mapClient);
    }
  } catch (e) {}
  return EXACT_CLIENTS;
}

export async function createClient(firmId: string, input: Pick<ExactClientRecord, 'name' | 'company' | 'email' | 'phonePrimary' | 'phoneSecondary' | 'category'>): Promise<ExactClientRecord> {
  try {
    const { data, error } = await supabase.from('clients').insert({
      firm_id: firmId,
      name: input.name,
      company: input.company || null,
      client_type: input.category === 'Individual Client' ? 'individual' : 'corporate',
      email: input.email,
      phone_primary: input.phonePrimary,
      phone_secondary: input.phoneSecondary || null,
    }).select('*').single();
    if (!error && data) return mapClient(data);
  } catch (e) {}

  const newRecord: ExactClientRecord = {
    id: `c-${Date.now()}`,
    name: input.name,
    company: input.company || '',
    category: input.category,
    email: input.email,
    phone: input.phonePrimary,
    phonePrimary: input.phonePrimary,
    phoneSecondary: input.phoneSecondary || '',
    matters: 0,
    mattersList: [],
    code: `CLI-${Date.now()}`
  };
  EXACT_CLIENTS.unshift(newRecord);
  return newRecord;
}

export async function deleteClient(firmId: string, clientId: string): Promise<void> {
  try {
    await supabase.from('clients').delete().eq('firm_id', firmId).eq('id', clientId);
  } catch (e) {}
  const idx = EXACT_CLIENTS.findIndex(c => c.id === clientId);
  if (idx !== -1) EXACT_CLIENTS.splice(idx, 1);
}

export async function fetchMatters(firmId: string): Promise<ExactMatterRecord[]> {
  try {
    const { data, error } = await supabase.from('matters').select('*').eq('firm_id', firmId).order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      return data.map(mapMatter);
    }
  } catch (e) {}
  return EXACT_MATTERS;
}

export async function createMatter(firmId: string, input: Partial<ExactMatterRecord>): Promise<ExactMatterRecord> {
  try {
    const { data, error } = await supabase.from('matters').insert({
      firm_id: firmId,
      title: input.title,
      cause_number: input.caseNo || null,
      forum: input.forum || null,
      applicant: input.applicant || null,
      applicant_role: input.applicantRole || 'Claimant',
      respondent: input.respondent || null,
      respondent_role: input.respondentRole || 'Respondent',
      claim_value: input.amount || 0,
      status: 'open',
    }).select('*').single();
    if (!error && data) return mapMatter(data);
  } catch (e) {}

  const newMatter: ExactMatterRecord = {
    id: `m-${Date.now()}`,
    title: input.title || 'Untitled Matter',
    applicant: input.applicant || '',
    applicantRole: input.applicantRole || 'Claimant',
    respondent: input.respondent || '',
    respondentRole: input.respondentRole || 'Respondent',
    forum: input.forum || 'High Court — Commercial',
    status: 'open',
    statusClass: 'pending',
    caseNo: input.caseNo || '',
    filedBy: input.filedBy || '',
    amount: input.amount || 0,
    itemsCount: 0,
    feeNoteLink: '',
    documentLink: ''
  };
  EXACT_MATTERS.unshift(newMatter);
  return newMatter;
}

export async function updateMatter(firmId: string, matterId: string, input: Partial<ExactMatterRecord>): Promise<ExactMatterRecord> {
  try {
    const { data, error } = await supabase.from('matters').update({
      title: input.title,
      cause_number: input.caseNo,
      forum: input.forum,
      applicant: input.applicant,
      applicant_role: input.applicantRole,
      respondent: input.respondent,
      respondent_role: input.respondentRole,
      claim_value: input.amount,
    }).eq('firm_id', firmId).eq('id', matterId).select('*').single();
    if (!error && data) return mapMatter(data);
  } catch (e) {}

  const idx = EXACT_MATTERS.findIndex(m => m.id === matterId);
  if (idx !== -1) {
    EXACT_MATTERS[idx] = { ...EXACT_MATTERS[idx], ...input };
    return EXACT_MATTERS[idx];
  }
  return input as ExactMatterRecord;
}

export async function deleteMatter(firmId: string, matterId: string): Promise<void> {
  try {
    await supabase.from('matters').delete().eq('firm_id', firmId).eq('id', matterId);
  } catch (e) {}
  const idx = EXACT_MATTERS.findIndex(m => m.id === matterId);
  if (idx !== -1) EXACT_MATTERS.splice(idx, 1);
}

const mapDocument = (row: any): ExactVaultFileRecord => ({
  id: row.id,
  filename: row.name,
  path: row.storage_path,
  matter: row.matters?.title || row.matter_id || '',
  client: row.matters?.clients?.name || '',
  fileType: row.mime_type || 'application/octet-stream',
  size: `${Math.max(1, Math.round(Number(row.file_size || 0) / 1024))} KB`,
  updatedAt: row.created_at || '',
  extractedMetrics: {
    claimValue: 0,
    instructionFee: 0,
    gettingUpFee: 0,
    itemizedFees: 0,
    arbitratorCosts: 0,
    grandTotal: 0,
  },
  verifiedTruth: true,
});

export async function fetchDocuments(firmId: string): Promise<ExactVaultFileRecord[]> {
  try {
    const { data, error } = await supabase.from('documents').select('*, matters(title, clients(name))').eq('firm_id', firmId).order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      return data.map(mapDocument);
    }
  } catch (e) {}
  return EXACT_VAULT_FILES;
}

export async function uploadDocument(firmId: string, userId: string, file: File, matterId?: string): Promise<ExactVaultFileRecord> {
  const documentId = crypto.randomUUID();
  const storagePath = `${firmId}/${documentId}/${file.name}`;
  const { error: uploadError } = await supabase.storage.from('legal-vault').upload(storagePath, file, { upsert: false });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase.from('documents').insert({
    id: documentId,
    firm_id: firmId,
    matter_id: matterId || null,
    name: file.name,
    storage_path: storagePath,
    file_size: file.size,
    mime_type: file.type || 'application/octet-stream',
    created_by: userId,
  }).select('*, matters(title, clients(name))').single();
  if (error) {
    await supabase.storage.from('legal-vault').remove([storagePath]);
    throw error;
  }
  return mapDocument(data);
}

export async function createDocumentDownloadUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage.from('legal-vault').createSignedUrl(storagePath, 300);
  if (error) throw error;
  return data.signedUrl;
}

export async function deleteDocument(firmId: string, documentId: string, storagePath: string): Promise<void> {
  const { error: storageError } = await supabase.storage.from('legal-vault').remove([storagePath]);
  if (storageError) throw storageError;
  const { error } = await supabase.from('documents').delete().eq('firm_id', firmId).eq('id', documentId);
  if (error) throw error;
}

export interface FirmMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  text: string;
  channel: 'whatsapp' | 'email' | 'internal';
  createdAt: string;
}

export async function fetchFirmUsers(firmId: string = 'firm-001'): Promise<SystemUser[]> {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('EXACT_USERS') : null;
  let localUsers: SystemUser[] = stored ? JSON.parse(stored) : [...SEEDED_USERS];

  // Guarantee all base SEEDED_USERS are included
  SEEDED_USERS.forEach(su => {
    if (!localUsers.some(u => u.id === su.id || u.workEmail.toLowerCase() === su.workEmail.toLowerCase())) {
      localUsers.push(su);
    }
  });

  const mergedMap = new Map<string, SystemUser>();
  localUsers.forEach(u => mergedMap.set(u.id, u));

  try {
    const { data, error } = await supabase.from('users').select('*').order('full_name');
    if (!error && data && data.length > 0) {
      data.forEach((row: any) => {
        const existing = mergedMap.get(row.id) || Array.from(mergedMap.values()).find(u => u.workEmail?.toLowerCase() === (row.email || '').toLowerCase());
        const dbUser: SystemUser = {
          id: row.id,
          authUserId: row.auth_user_id || undefined,
          firmId: row.firm_id || firmId,
          fullName: row.full_name,
          advocateTitle: row.full_name.startsWith('Adv.') ? row.full_name : `Adv. ${row.full_name}`,
          lskNo: row.lsk_no || '',
          role: row.role === 'admin' ? 'Admin' : row.role === 'developer' ? 'Developer' : 'Advocate',
          position: row.position || row.role,
          workEmail: row.email,
          personalEmail: row.email,
          phonePrimary: row.phone_primary || '',
          phoneSecondary: row.phone_secondary || '',
          hasAllPermissions: row.role === 'admin' || row.role === 'developer',
          passwordHash: existing?.passwordHash || row.password_hash || '',
          avatarUrl: row.avatar_url || undefined,
        };
        mergedMap.set(dbUser.id, dbUser);
      });
    }
  } catch (e) {}

  return Array.from(mergedMap.values());
}

export async function createFirmUser(firmId: string, user: Partial<SystemUser>): Promise<SystemUser> {
  const newId = `usr-${Date.now()}`;
  const newUser: SystemUser = {
    id: newId,
    firmId,
    fullName: user.fullName || 'Advocate Staff',
    advocateTitle: user.advocateTitle || `Adv. ${user.fullName || 'Staff'}`,
    lskNo: user.lskNo || '',
    role: user.role || 'Advocate',
    position: user.position || 'Advocate',
    workEmail: user.workEmail || '',
    personalEmail: user.personalEmail || user.workEmail || '',
    phonePrimary: user.phonePrimary || '',
    phoneSecondary: user.phoneSecondary || '',
    hasAllPermissions: user.role === 'Admin' || user.role === 'Developer',
    passwordHash: user.passwordHash || '',
  };

  saveUserProfile(newUser);

  try {
    const record = {
      firm_id: firmId,
      full_name: newUser.fullName,
      email: newUser.workEmail,
      phone_primary: newUser.phonePrimary,
      phone_secondary: newUser.phoneSecondary,
      position: newUser.position,
      role: newUser.role.toLowerCase(),
      lsk_no: newUser.lskNo,
      is_active: true,
    };
    const { data, error } = await supabase.from('users').insert([record]).select().single();
    if (!error && data) {
      newUser.id = data.id;
      saveUserProfile(newUser);
    }
  } catch (e) {
    console.warn('Supabase users insert notice:', e);
  }

  try {
    window.dispatchEvent(new CustomEvent('databaseRealtimeUpdate', { detail: { table: 'users' } }));
    window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: newUser }));
  } catch (e) {}

  return newUser;
}

export async function updateFirmUser(firmId: string, user: SystemUser): Promise<SystemUser> {
  try {
    await supabase.from('users').update({
      full_name: user.fullName,
      email: user.workEmail,
      phone_primary: user.phonePrimary,
      phone_secondary: user.phoneSecondary,
      position: user.position,
      role: user.role.toLowerCase(),
      lsk_no: user.lskNo,
    }).eq('id', user.id);
  } catch (e) {}
  saveUserProfile(user);
  return user;
}

export async function deleteFirmUser(firmId: string, userId: string): Promise<void> {
  try {
    await supabase.from('users').delete().eq('id', userId);
  } catch (e) {}
  try {
    const stored = localStorage.getItem('EXACT_USERS');
    if (stored) {
      const list: SystemUser[] = JSON.parse(stored);
      const updated = list.filter(u => u.id !== userId);
      localStorage.setItem('EXACT_USERS', JSON.stringify(updated));
    }
  } catch (e) {}
  try {
    window.dispatchEvent(new CustomEvent('databaseRealtimeUpdate', { detail: { table: 'users' } }));
  } catch (e) {}
}

export async function fetchMessages(firmId: string, userId: string, recipientId: string): Promise<FirmMessage[]> {
  try {
    const { data, error } = await supabase.from('messages').select('*').eq('firm_id', firmId)
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${userId})`)
      .order('created_at', { ascending: true });
    if (!error && data && data.length > 0) {
      return data.map((row: any) => ({
        id: row.id,
        senderId: row.sender_id,
        senderName: row.sender_name,
        recipientId: row.recipient_id,
        recipientName: row.recipient_name,
        text: row.message_text,
        channel: row.channel || 'internal',
        createdAt: row.created_at,
      }));
    }
  } catch (e) {}
  return EXACT_MESSAGES.map(m => ({
    id: m.id,
    senderId: m.senderName,
    senderName: m.senderName,
    recipientId: m.recipientName,
    recipientName: m.recipientName,
    text: m.text,
    channel: m.channel,
    createdAt: m.timestamp,
  }));
}

export async function sendMessage(firmId: string, sender: SystemUser, recipientId: string, recipientName: string, text: string): Promise<FirmMessage> {
  const { data, error } = await supabase.from('messages').insert({
    firm_id: firmId,
    sender_id: sender.id,
    sender_name: sender.fullName,
    recipient_id: recipientId,
    recipient_name: recipientName,
    channel: 'internal',
    message_type: 'internal',
    message_text: text,
  }).select('*').single();
  if (error) throw error;
  return {
    id: data.id,
    senderId: data.sender_id,
    senderName: data.sender_name,
    recipientId: data.recipient_id,
    recipientName: data.recipient_name,
    text: data.message_text,
    channel: data.channel,
    createdAt: data.created_at,
  };
}

export async function createImportedFeeNote(
  firmId: string,
  userId: string,
  metadata: { matterTitle: string; clientName: string; claimantName?: string; respondentName?: string; judgeName?: string; forumName?: string; courtSchedule?: string },
  totalAmount: number,
  items: Array<{ description?: string; claimedAmount?: number }>,
  excelData?: any[]
) {
  const billNumber = `BOC-IMPORT-${Date.now().toString().slice(-8)}`;
  let recordId = `fn-imp-${Date.now()}`;

  try {
    const { data, error } = await supabase.from('fee_notes').insert({
      firm_id: firmId,
      bill_number: billNumber,
      matter_title: metadata.matterTitle,
      client_name: metadata.claimantName || metadata.clientName,
      court_schedule: metadata.courtSchedule || 'Schedule 6 — High Court / Arbitration',
      grand_total: totalAmount,
      status: 'processed',
      generated_by_user_id: userId,
      generated_by_user: metadata.claimantName || metadata.clientName || 'Advocate',
    }).select('*').single();

    if (!error && data) {
      recordId = data.id;
      if (items.length > 0) {
        try {
          await supabase.from('fee_note_items').insert(items.map((item, index) => ({
            fee_note_id: data.id,
            item_number: index + 1,
            description: item.description || `Imported item ${index + 1}`,
            claimed_amount: item.claimedAmount || 0,
          })));
        } catch (itemErr) {
          console.warn('fee_note_items error:', itemErr);
        }
      }
    }
  } catch (e) {
    console.warn('Supabase remote fee_notes insert notice:', e);
  }

  // Commit to local storage ledger immediately
  const newNote: ExactFeeNoteRecord = {
    id: recordId,
    billNumber,
    matterId: 'm1',
    matterTitle: metadata.matterTitle,
    clientName: metadata.claimantName || metadata.clientName,
    claimantName: metadata.claimantName,
    respondentName: metadata.respondentName,
    judgeName: metadata.judgeName,
    forumName: metadata.forumName,
    courtSchedule: metadata.courtSchedule || 'Schedule 6 — High Court / Arbitration',
    claimValue: 0,
    instructionFee: totalAmount * 0.7,
    gettingUpFee: totalAmount * 0.1,
    grandTotal: totalAmount,
    status: 'processed',
    generatedByUser: metadata.claimantName || metadata.clientName || 'Advocate',
    generatedByUserId: userId,
    createdAt: new Date().toISOString(),
    pdfUrl: '',
    excelUrl: '',
    excelData
  };

  const existing = getFeeNotes();
  persistFeeNotes([newNote, ...existing.filter(n => n.billNumber !== billNumber && n.id !== recordId)]);
  return newNote;
}

export async function fetchCollectedAmount(firmId: string): Promise<number> {
  const { data, error } = await supabase.from('payments').select('amount').eq('firm_id', firmId).eq('status', 'confirmed');
  if (error) throw error;
  return (data || []).reduce((total: number, payment: any) => total + Number(payment.amount || 0), 0);
}

export interface PermissionItem {
  id: string;
  name: string;
  role: string;
  email: string;
  canCreateFeeNotes: boolean;
  clientVisibility: 'all' | 'assigned';
  canExportData: boolean;
  canDeleteMatter: boolean;
  lastChanged?: string;
}

export async function fetchPermissionItems(firmId: string): Promise<PermissionItem[]> {
  const users = await fetchFirmUsers(firmId);
  let overrides: any[] = [];
  let assignments: any[] = [];
  let templatePermissions: any[] = [];

  try {
    const [overridesResult, assignmentsResult, templatePermissionsResult] = await Promise.all([
      supabase.from('user_permission_overrides').select('*'),
      supabase.from('user_role_assignments').select('*'),
      supabase.from('role_template_permissions').select('*'),
    ]);
    if (!overridesResult.error && overridesResult.data) overrides = overridesResult.data;
    if (!assignmentsResult.error && assignmentsResult.data) assignments = assignmentsResult.data;
    if (!templatePermissionsResult.error && templatePermissionsResult.data) templatePermissions = templatePermissionsResult.data;
  } catch (e) {}

  const granted = (userId: string, code: string) => {
    const override = overrides.find((item: any) => item.user_id === userId && item.permission_code === code);
    if (override) return override.effect === 'grant';
    return assignments.some((assignment: any) => assignment.user_id === userId && templatePermissions.some((permission: any) => permission.role_template_id === assignment.role_template_id && permission.permission_code === code));
  };
  const visibility = (userId: string) => {
    const override = overrides.find((item: any) => item.user_id === userId && item.permission_code === 'client.view');
    return override?.scope === 'assigned' ? 'assigned' : 'all';
  };
  return users.map(user => ({
    id: user.id,
    name: user.advocateTitle || user.fullName,
    role: user.position || user.role,
    email: user.workEmail,
    canCreateFeeNotes: user.hasAllPermissions || user.role === 'Admin' || user.role === 'Developer' || granted(user.id, 'fee_note.create'),
    clientVisibility: (user.hasAllPermissions ? 'all' : visibility(user.id)) as 'all' | 'assigned',
    canExportData: user.hasAllPermissions || user.role === 'Admin' || user.role === 'Developer' || granted(user.id, 'fee_note.export'),
    canDeleteMatter: user.hasAllPermissions || user.role === 'Admin' || user.role === 'Developer' || granted(user.id, 'matter.delete'),
  }));
}

export async function savePermissionOverride(firmId: string, targetUserId: string, actorUserId: string, permissionCode: string, effect: 'grant' | 'deny', scope = 'firm') {
  try {
    await supabase.from('user_permission_overrides').upsert({ user_id: targetUserId, permission_code: permissionCode, effect, scope, changed_by: actorUserId }, { onConflict: 'user_id,permission_code' });
    await supabase.from('permission_audit_logs').insert({ firm_id: firmId, target_user_id: targetUserId, actor_user_id: actorUserId, permission_code: permissionCode, action: `${effect}:${scope}` });
  } catch (e) {}
}

export async function assignRoleTemplate(firmId: string, targetUserId: string, actorUserId: string, templateName: string) {
  try {
    const codeMap: Record<string, string> = { 'Senior Partner': 'managing_partner', Associate: 'associate', 'Junior / Intern': 'legal_assistant' };
    const code = codeMap[templateName] || templateName.toLowerCase().replace(/\s+/g, '_');
    const { data: template } = await supabase.from('role_templates').select('id').eq('code', code).or(`firm_id.is.null,firm_id.eq.${firmId}`).limit(1).single();
    if (template?.id) {
      await supabase.from('user_role_assignments').upsert({ user_id: targetUserId, role_template_id: template.id, assigned_by: actorUserId }, { onConflict: 'user_id,role_template_id' });
    }
  } catch (e) {}
}

export async function fetchMatterRelatedData(firmId: string, matterId: string) {
  try {
    const [matterResult, feeNotesResult, documentsResult] = await Promise.all([
      supabase.from('matters').select('client_id').eq('firm_id', firmId).eq('id', matterId).single(),
      supabase.from('fee_notes').select('*').eq('firm_id', firmId).eq('matter_id', matterId).order('created_at', { ascending: false }),
      supabase.from('documents').select('*, matters(title, clients(name))').eq('firm_id', firmId).eq('matter_id', matterId).order('created_at', { ascending: false }),
    ]);

    const clientResult = matterResult.data?.client_id
      ? await supabase.from('clients').select('*').eq('firm_id', firmId).eq('id', matterResult.data.client_id).maybeSingle()
      : { data: null, error: null };

    if (!matterResult.error && (feeNotesResult.data?.length || documentsResult.data?.length || clientResult.data)) {
      return {
        client: clientResult.data ? mapClient(clientResult.data) : null,
        feeNotes: feeNotesResult.data || [],
        documents: documentsResult.data || [],
      };
    }
  } catch (e) {}

  const fallbackMatter = EXACT_MATTERS.find(m => m.id === matterId);
  const fallbackClient = EXACT_CLIENTS.find(c => fallbackMatter && c.name.toLowerCase().includes(fallbackMatter.applicant.toLowerCase().slice(0, 5))) || EXACT_CLIENTS[0];
  const fallbackFeeNotes = getFeeNotes().filter(fn => fn.matterId === matterId);
  const fallbackDocuments = EXACT_VAULT_FILES.filter(v => v.id === matterId || v.matter.toLowerCase().includes(matterId.toLowerCase()));

  return {
    client: fallbackClient || null,
    feeNotes: fallbackFeeNotes,
    documents: fallbackDocuments,
  };
}