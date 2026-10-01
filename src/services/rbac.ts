import { supabase } from './supabase';

export type SystemResource = 
  | 'dashboard'
  | 'boc_builder'
  | 'feenotes'
  | 'matters'
  | 'clients'
  | 'vault'
  | 'managing_hub'
  | 'permissions'
  | 'remuneration_guide'
  | 'settings'
  | 'support'
  | 'database';

export type PermissionScope = 'Own' | 'Assigned' | 'Firm' | 'Platform';
export type RoleTemplateCode = string;
export type RiskLevel = 'Standard' | 'Elevated' | 'Critical';

export interface PermissionCatalogItem {
  code: string;
  resource: SystemResource;
  action: string;
  name: string;
  description: string;
  allowedScopes: PermissionScope[];
  riskLevel?: RiskLevel;
  targetComponent?: string;
  isCustom?: boolean;
}

export interface RoleTemplate {
  id: string;
  code: RoleTemplateCode;
  name: string;
  description: string;
  isSystem: boolean;
  permissionsCount?: number;
  permissions: {
    code: string;
    scope: PermissionScope;
  }[];
}

export interface UserEffectivePermission {
  code: string;
  resource: SystemResource;
  action: string;
  name: string;
  description: string;
  scope: PermissionScope;
  source: 'role_template' | 'override_grant';
  isGranted: boolean;
  riskLevel?: RiskLevel;
  targetComponent?: string;
  overrideEffect?: 'grant' | 'deny';
  overrideReason?: string;
  overrideExpiresAt?: string | null;
}

export interface UserRoleAssignment {
  userId: string;
  roleTemplateId: string;
  roleCode: RoleTemplateCode;
  roleName: string;
}

export interface UserPermissionOverride {
  id: string;
  userId: string;
  permissionCode: string;
  effect: 'grant' | 'deny';
  scope: PermissionScope;
  reason: string;
  expiresAt?: string | null;
  createdAt?: string;
}

// Complete Standardized Permissions Catalog mapped directly to Sidebar Pages & Mini-Page Features
export const STANDARDIZED_PERMISSIONS: PermissionCatalogItem[] = [
  // =========================================================================
  // 1.1. DASHBOARD (home) — DashboardView.tsx
  // =========================================================================
  {
    code: 'dashboard.view',
    resource: 'dashboard',
    action: 'view',
    name: 'Access Dashboard Main Page',
    description: 'Access the main advocate dashboard and navigation portal.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'Sidebar (Dashboard) & DashboardView.tsx',
  },
  {
    code: 'dashboard.view_metrics',
    resource: 'dashboard',
    action: 'view_metrics',
    name: 'View Overview & Metric Cards',
    description: 'Inspect real-time revenue billed, active court matters count, total clients, and pending fee note taxations.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'DashboardView.tsx (Top Metric Cards)',
  },
  {
    code: 'dashboard.scale_calculator',
    resource: 'dashboard',
    action: 'scale_calculator',
    name: 'Use Live Remuneration Scale Calculator',
    description: 'Perform on-the-fly calculations for Advocates Remuneration Order (Schedules 1 through 13).',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'DashboardView.tsx (Scale Calculator Widget)',
  },
  {
    code: 'dashboard.upcoming_dockets',
    resource: 'dashboard',
    action: 'upcoming_dockets',
    name: 'View Upcoming Court Dockets & Causes',
    description: 'Inspect upcoming court dates, forums, assigned advocate, and hearing countdowns.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'DashboardView.tsx (Court Dockets Table)',
  },
  {
    code: 'dashboard.recent_activity',
    resource: 'dashboard',
    action: 'recent_activity',
    name: 'View Recent Fee Notes Activity Strip',
    description: 'Inspect quick status previews of recent fee notes (Approved, Draft, In Court).',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'DashboardView.tsx (Recent Activity Strip)',
  },
  {
    code: 'dashboard.quick_triggers',
    resource: 'dashboard',
    action: 'quick_triggers',
    name: 'Access Quick Navigation Triggers',
    description: 'Direct jump action buttons to New BOC Builder, Fee Notes list, and Matter Registry.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'DashboardView.tsx (Quick Action Buttons)',
  },

  // =========================================================================
  // 1.2. BOC BUILDER (boc) — FeeNoteBuilderView.tsx
  // =========================================================================
  {
    code: 'boc.view',
    resource: 'boc_builder',
    action: 'view',
    name: 'Access Bill of Costs Builder',
    description: 'Open the statutory Bill of Costs & Fee Note computation engine.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'Sidebar (BOC Builder) & FeeNoteBuilderView.tsx',
  },
  {
    code: 'boc.matter_form',
    resource: 'boc_builder',
    action: 'matter_form',
    name: 'Configure Court & Matter Information',
    description: 'Set Forum / Jurisdiction (High Court, Court of Appeal, Subordinate, Tribunal, Arbitration), cause number, and dispute parties.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'FeeNoteBuilderView.tsx (Court & Matter Form)',
  },
  {
    code: 'boc.scale_engine',
    resource: 'boc_builder',
    action: 'scale_engine',
    name: 'Configure Statutory Scale & Instruction Fee',
    description: 'Select Schedule 1 to 13, set subject value/claim amount, and apply statutory formula calculation.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'FeeNoteBuilderView.tsx (Scale Selector & Subject Value)',
  },
  {
    code: 'boc.getting_up_fee',
    resource: 'boc_builder',
    action: 'getting_up_fee',
    name: 'Toggle & Configure Getting-Up Fee',
    description: 'Apply the statutory 1/3rd Getting-up fee rule to qualifying litigation matters.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'FeeNoteBuilderView.tsx (Getting-up Toggle)',
  },
  {
    code: 'boc.itemized_work',
    resource: 'boc_builder',
    action: 'itemized_work',
    name: 'Add & Manage Itemized Work & Attendances',
    description: 'Add custom work descriptions, dates, amounts, and quick-preset statutory attendances.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'FeeNoteBuilderView.tsx (Itemized Work Sub-Engine)',
  },
  {
    code: 'boc.disbursements',
    resource: 'boc_builder',
    action: 'disbursements',
    name: 'Add Third-Party Disbursements & Expenses',
    description: 'Add court filing fees, process service receipts, travel expenses, and arbitrator costs.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'FeeNoteBuilderView.tsx (Disbursements Sub-Engine)',
  },
  {
    code: 'boc.live_preview',
    resource: 'boc_builder',
    action: 'live_preview',
    name: 'Inspect Live Fee Note & Taxation Summary',
    description: 'View real-time breakdown of instruction fee, getting-up fee, itemized attendances, disbursements, and 16% VAT.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'FeeNoteBuilderView.tsx (Live Preview Panel)',
  },
  {
    code: 'boc.export_pdf',
    resource: 'boc_builder',
    action: 'export_pdf',
    name: 'Export Fee Note to Sealed PDF',
    description: 'Export official Bill of Costs to formatted PDF with firm letterhead, coat of arms, seal, and signature block.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'FeeNoteBuilderView.tsx (Export PDF Button)',
  },
  {
    code: 'boc.export_excel',
    resource: 'boc_builder',
    action: 'export_excel',
    name: 'Export Fee Note to Excel Spreadsheet',
    description: 'Export itemized mathematical computation sheet to Excel format for court registry inspection.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'FeeNoteBuilderView.tsx (Export Excel Button)',
  },
  {
    code: 'boc.save_database',
    resource: 'boc_builder',
    action: 'save_database',
    name: 'Save Fee Note to Database / Vault',
    description: 'Persist draft and final fee note records into firm cloud database and document vault.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'FeeNoteBuilderView.tsx (Save Fee Note Button)',
  },
  {
    code: 'boc.change_signage',
    resource: 'boc_builder',
    action: 'change_signage',
    name: 'Change Signage, Stamp & Advocate Sign-off',
    description: 'Update advocate signatory name, title, and uploaded firm seal image.',
    allowedScopes: ['Firm', 'Platform'],
    riskLevel: 'Elevated',
    targetComponent: 'FeeNoteBuilderView.tsx (Change Signage Modal)',
  },

  // =========================================================================
  // 1.3. FEE NOTES (feenotes) — FeeNotesListView.tsx
  // =========================================================================
  {
    code: 'feenotes.view',
    resource: 'feenotes',
    action: 'view',
    name: 'Access Fee Notes Data Table',
    description: 'Browse the firm-wide ledger of saved Bills of Costs and statutory fee notes.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'Sidebar (Fee Notes) & FeeNotesListView.tsx',
  },
  {
    code: 'feenotes.filter_search',
    resource: 'feenotes',
    action: 'filter_search',
    name: 'Filter & Search Fee Notes',
    description: 'Filter bills by status (All, Approved / Processed, Pending Drafts, In Taxation) and search by bill number, client, or matter.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'FeeNotesListView.tsx (Status Tabs & Search Input)',
  },
  {
    code: 'feenotes.preview_bill',
    resource: 'feenotes',
    action: 'preview_bill',
    name: 'View Full Legal Fee Note (Eye Icon)',
    description: 'Open full-page legal fee note preview modal with complete statutory taxation breakdown.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'FeeNotesListView.tsx (Eye Icon Action)',
  },
  {
    code: 'feenotes.download_pdf',
    resource: 'feenotes',
    action: 'download_pdf',
    name: 'Download Verified PDF Invoice (Download Icon)',
    description: 'Directly download the verified PDF Bill of Costs invoice for filing or client delivery.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'FeeNotesListView.tsx (Download Icon Action)',
  },
  {
    code: 'feenotes.edit',
    resource: 'feenotes',
    action: 'edit',
    name: 'Open Pre-filled in BOC Builder (Edit Icon)',
    description: 'Load an existing saved fee note back into BOC Builder pre-filled for revision.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'FeeNotesListView.tsx (Edit Icon Action)',
  },
  {
    code: 'feenotes.delete',
    resource: 'feenotes',
    action: 'delete',
    name: 'Delete Fee Note Permanently (Delete Icon)',
    description: 'Permanently remove a fee note record from the firm database.',
    allowedScopes: ['Firm', 'Platform'],
    riskLevel: 'Critical',
    targetComponent: 'FeeNotesListView.tsx (Delete Icon Action)',
  },
  {
    code: 'feenotes.view_summary_banner',
    resource: 'feenotes',
    action: 'view_summary_banner',
    name: 'View Fee Notes Summary Banner & Total Value',
    description: 'Inspect the aggregate total billing value and active fee note count summary.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'FeeNotesListView.tsx (Top Summary Banner)',
  },

  // =========================================================================
  // 1.4. MY MATTERS (matters) — MattersView.tsx
  // =========================================================================
  {
    code: 'matters.view',
    resource: 'matters',
    action: 'view',
    name: 'Access My Matters Registry',
    description: 'Browse court litigation matters, arbitration proceedings, and dispute registries.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'Sidebar (My Matters) & MattersView.tsx',
  },
  {
    code: 'matters.tree_filters',
    resource: 'matters',
    action: 'tree_filters',
    name: 'Use Sub-Tree Guide Filters',
    description: 'Filter matters by High Court Commercial Division, Subordinate Court, and Arbitration Tribunal.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'Sidebar (My Matters Sub-Tree) & MattersView.tsx',
  },
  {
    code: 'matters.switch_views',
    resource: 'matters',
    action: 'switch_views',
    name: 'Switch Display Layouts (List vs Grid)',
    description: 'Toggle between structured List table view and visual Grid / Card layout.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'MattersView.tsx (View Switcher Controls)',
  },
  {
    code: 'matters.create',
    resource: 'matters',
    action: 'create',
    name: 'Create New Matter (New Matter Modal)',
    description: 'Open New Matter modal and save a new case file into the database with cause no, forum, and claim value.',
    allowedScopes: ['Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'MattersView.tsx (New Matter Button & Modal)',
  },
  {
    code: 'matters.edit',
    resource: 'matters',
    action: 'edit',
    name: 'Edit Matter Details (Edit Modal)',
    description: 'Update case title, cause number, forum, parties, and claim value in real time.',
    allowedScopes: ['Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'MattersView.tsx (Edit Matter Modal)',
  },
  {
    code: 'matters.delete',
    resource: 'matters',
    action: 'delete',
    name: 'Delete Court Matter Record',
    description: 'Permanently remove a litigation or arbitration matter from the firm database.',
    allowedScopes: ['Firm', 'Platform'],
    riskLevel: 'Critical',
    targetComponent: 'MattersView.tsx (Delete Matter Action)',
  },
  {
    code: 'matters.direct_boc',
    resource: 'matters',
    action: 'direct_boc',
    name: 'Launch Direct Pre-linked BOC Generator',
    description: 'Instantly launch a new Bill of Costs pre-populated with the selected matter details.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'MattersView.tsx (Generate BOC Action)',
  },

  // =========================================================================
  // 1.5. MY CLIENTS (clients) — ClientsView.tsx
  // =========================================================================
  {
    code: 'clients.view',
    resource: 'clients',
    action: 'view',
    name: 'Access My Clients Directory',
    description: 'Browse individual and corporate client directory.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'Sidebar (My Clients) & ClientsView.tsx',
  },
  {
    code: 'clients.filter_search',
    resource: 'clients',
    action: 'filter_search',
    name: 'Search & Filter Client Records',
    description: 'Filter clients by Corporate / Institutional vs Individual, and search by name, KRA PIN, email, or phone.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'ClientsView.tsx (Category Filter & Search Input)',
  },
  {
    code: 'clients.create',
    resource: 'clients',
    action: 'create',
    name: 'Register New Client (New Client Modal)',
    description: 'Register a new individual or corporate client entity into the database.',
    allowedScopes: ['Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'ClientsView.tsx (New Client Button & Modal)',
  },
  {
    code: 'clients.portfolio',
    resource: 'clients',
    action: 'portfolio',
    name: 'View Client Portfolio & Revenue',
    description: 'Inspect all active matters and total billed revenue tied to a specific client.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'ClientsView.tsx (Client Portfolio Drawer)',
  },
  {
    code: 'clients.edit',
    resource: 'clients',
    action: 'edit',
    name: 'Edit Client Records (Edit Modal)',
    description: 'Update client contact person, KRA PIN, billing address, phone, and email.',
    allowedScopes: ['Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'ClientsView.tsx (Edit Client Modal)',
  },
  {
    code: 'clients.delete',
    resource: 'clients',
    action: 'delete',
    name: 'Delete Client Record',
    description: 'Permanently remove a client record from the firm database.',
    allowedScopes: ['Firm', 'Platform'],
    riskLevel: 'Critical',
    targetComponent: 'ClientsView.tsx (Delete Client Action)',
  },

  // =========================================================================
  // 1.6. DOCUMENT VAULT (vault) — DocumentVaultView.tsx
  // =========================================================================
  {
    code: 'vault.view',
    resource: 'vault',
    action: 'view',
    name: 'Access Document Vault Explorer',
    description: 'Browse legal filings, evidence documents, and cloud storage repository.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'Sidebar (Document Vault) & DocumentVaultView.tsx',
  },
  {
    code: 'vault.filter_search',
    resource: 'vault',
    action: 'filter_search',
    name: 'Filter & Search Stored Documents',
    description: 'Filter files by category (Fee Notes, Pleadings, Affidavits, Court Orders, Taxation Rulings) and search by filename, case, or client.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'DocumentVaultView.tsx (Category Filter & Search Input)',
  },
  {
    code: 'vault.upload',
    resource: 'vault',
    action: 'upload',
    name: 'Upload Legal Documents & Pleadings',
    description: 'Upload case files, fee note receipts, and evidence with matter tagging and size tracking.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'DocumentVaultView.tsx (Upload Document Modal)',
  },
  {
    code: 'vault.in_browser_viewer',
    resource: 'vault',
    action: 'in_browser_viewer',
    name: 'Open In-Browser PDF & Excel Inspector',
    description: 'Preview and inspect PDF filings and Excel calculation sheets directly in the browser.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'DocumentVaultView.tsx (Document Viewer Modal)',
  },
  {
    code: 'vault.download',
    resource: 'vault',
    action: 'download',
    name: 'Download Stored Filings & Receipts',
    description: 'Download verified court documents, pleadings, and fee note records to local device.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'DocumentVaultView.tsx (Download Action)',
  },
  {
    code: 'vault.delete',
    resource: 'vault',
    action: 'delete',
    name: 'Delete Vault Documents',
    description: 'Permanently remove obsolete documents and evidence files from vault storage.',
    allowedScopes: ['Firm', 'Platform'],
    riskLevel: 'Critical',
    targetComponent: 'DocumentVaultView.tsx (Delete File Action)',
  },

  // =========================================================================
  // 2.1. EXECUTIVE HUB (managing_hub) — ManagingPartnerHubView.tsx
  // =========================================================================
  {
    code: 'managing_hub.view',
    resource: 'managing_hub',
    action: 'view',
    name: 'Access Executive Hub',
    description: 'Open the Managing Partner executive hub for firm-wide financial and personnel oversight.',
    allowedScopes: ['Firm', 'Platform'],
    riskLevel: 'Elevated',
    targetComponent: 'Sidebar (Executive Hub) & ManagingPartnerHubView.tsx',
  },
  {
    code: 'managing_hub.financial_kpis',
    resource: 'managing_hub',
    action: 'financial_kpis',
    name: 'View Executive Financial KPIs & Revenue Share',
    description: 'Inspect aggregate firm billings (Total Billed vs. Approved vs. Pending Drafts) and top client revenue share breakdown.',
    allowedScopes: ['Firm', 'Platform'],
    riskLevel: 'Elevated',
    targetComponent: 'ManagingPartnerHubView.tsx (Financial KPI Cards)',
  },
  {
    code: 'managing_hub.view_roster',
    resource: 'managing_hub',
    action: 'view_roster',
    name: 'View Advocates & Staff Roster',
    description: 'Inspect active advocate list, assigned role archetypes, LSK numbers, and live permissions counts.',
    allowedScopes: ['Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'ManagingPartnerHubView.tsx (Advocates Roster Table)',
  },
  {
    code: 'managing_hub.add_user',
    resource: 'managing_hub',
    action: 'add_user',
    name: 'Add New User to Database (Add User Modal)',
    description: 'Register advocate accounts, assign permission templates, and dispatch portal invitations.',
    allowedScopes: ['Firm', 'Platform'],
    riskLevel: 'Elevated',
    targetComponent: 'ManagingPartnerHubView.tsx (Add New User Modal)',
  },
  {
    code: 'managing_hub.view_dossier',
    resource: 'managing_hub',
    action: 'view_dossier',
    name: 'View Advocate Dossier & Profile Modal',
    description: 'Open full advocate dossier to inspect effective access rights, active overrides, linked matters, and contact information.',
    allowedScopes: ['Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'ManagingPartnerHubView.tsx (Advocate Dossier Modal)',
  },
  {
    code: 'managing_hub.send_notes',
    resource: 'managing_hub',
    action: 'send_notes',
    name: 'Dispatch Direct Notes & Notifications',
    description: 'Send direct internal notifications and executive notes to firm advocates.',
    allowedScopes: ['Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'ManagingPartnerHubView.tsx (Send Note Modal)',
  },
  {
    code: 'managing_hub.reassign_roles',
    resource: 'managing_hub',
    action: 'reassign_roles',
    name: 'Quick Role Template Reassignment',
    description: 'Change advocate assigned role templates (Managing Partner, Senior Associate, Junior Associate, Pupil/Intern, Accountant).',
    allowedScopes: ['Firm', 'Platform'],
    riskLevel: 'Elevated',
    targetComponent: 'ManagingPartnerHubView.tsx (Role Reassignment Dropdown)',
  },

  // =========================================================================
  // 2.2. PERMISSIONS & TEMPLATES (managing_permissions) — AdvocatePermissionsView.tsx
  // =========================================================================
  {
    code: 'permissions.view',
    resource: 'permissions',
    action: 'view',
    name: 'Access Permissions & Templates Studio',
    description: 'Open the granular permission matrix and role archetype studio.',
    allowedScopes: ['Firm', 'Platform'],
    riskLevel: 'Elevated',
    targetComponent: 'Sidebar (Permissions & Templates) & AdvocatePermissionsView.tsx',
  },
  {
    code: 'permissions.advocate_control',
    resource: 'permissions',
    action: 'advocate_control',
    name: 'Inspect Advocate Effective Rights & Metrics',
    description: 'Select advocates to inspect base template rights, explicit overrides (+Grants / -Denials), and effective active access.',
    allowedScopes: ['Firm', 'Platform'],
    riskLevel: 'Elevated',
    targetComponent: 'AdvocatePermissionsView.tsx (Advocate Control Strip)',
  },
  {
    code: 'permissions.override',
    resource: 'permissions',
    action: 'override',
    name: 'Configure Explicit Permission Overrides',
    description: 'Add or revoke granular permission grants and denials for individual advocates.',
    allowedScopes: ['Firm', 'Platform'],
    riskLevel: 'Critical',
    targetComponent: 'AdvocatePermissionsView.tsx (Permission Matrix Toggles)',
  },
  {
    code: 'permissions.manage_templates',
    resource: 'permissions',
    action: 'manage_templates',
    name: 'Create & Modify Role Archetype Templates',
    description: 'Create new role archetypes and update base permission bundles for firm positions.',
    allowedScopes: ['Firm', 'Platform'],
    riskLevel: 'Critical',
    targetComponent: 'AdvocatePermissionsView.tsx (Role Templates Studio)',
  },

  // =========================================================================
  // 3.1. REMUNERATION GUIDE (guide) — RemunerationGuideView.tsx
  // =========================================================================
  {
    code: 'guide.view',
    resource: 'remuneration_guide',
    action: 'view',
    name: 'Access Remuneration Guide Digest',
    description: 'Explore the full statutory scale digest for Kenya Advocates Remuneration Order (Schedules 1 to 13).',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'Sidebar (Remuneration Guide) & RemunerationGuideView.tsx',
  },
  {
    code: 'guide.calculator',
    resource: 'remuneration_guide',
    action: 'calculator',
    name: 'Use Interactive Statutory Rate Calculator',
    description: 'Input custom claim values to inspect step-by-step formula breakdowns, thresholds, and statutory percentage additions.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'RemunerationGuideView.tsx (Interactive Calculator Panel)',
  },
  {
    code: 'guide.quick_reference',
    resource: 'remuneration_guide',
    action: 'quick_reference',
    name: 'Access Statutory Quick Reference Cards',
    description: 'Inspect Getting-up fee 1/3rd rules, VAT compliance requirements, and statutory drafting minimum tariffs.',
    allowedScopes: ['Own', 'Assigned', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'RemunerationGuideView.tsx (Quick Reference Cards)',
  },

  // =========================================================================
  // 3.2. FIRM SETTINGS (settings) — ProfileSettingsView.tsx
  // =========================================================================
  {
    code: 'settings.view',
    resource: 'settings',
    action: 'view',
    name: 'Access Firm Settings & Configuration',
    description: 'Open firm profile, branding, and billing configurations.',
    allowedScopes: ['Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'Sidebar (Firm Settings) & ProfileSettingsView.tsx',
  },
  {
    code: 'settings.branding',
    resource: 'settings',
    action: 'branding',
    name: 'Configure Firm Branding & Identity',
    description: 'Update official law firm name, LSK Firm Registration number, logo upload, and signage image manager.',
    allowedScopes: ['Firm', 'Platform'],
    riskLevel: 'Elevated',
    targetComponent: 'ProfileSettingsView.tsx (Branding Section)',
  },
  {
    code: 'settings.location',
    resource: 'settings',
    action: 'location',
    name: 'Manage Official Physical Address & Location',
    description: 'Update office physical location, Upper Hill address, and P.O. Box.',
    allowedScopes: ['Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'ProfileSettingsView.tsx (Location Section)',
  },
  {
    code: 'settings.taxation_banking',
    resource: 'settings',
    action: 'taxation_banking',
    name: 'Configure Firm KRA PIN, VAT & Bank Details',
    description: 'Manage firm KRA PIN, 16% VAT toggle, and official bank accounts (Bank name, Kilimani branch, Account number, Swift code).',
    allowedScopes: ['Firm', 'Platform'],
    riskLevel: 'Elevated',
    targetComponent: 'ProfileSettingsView.tsx (Taxation & Banking Section)',
  },
  {
    code: 'settings.security_notifications',
    resource: 'settings',
    action: 'security_notifications',
    name: 'Configure Notification & Security Preferences',
    description: 'Configure email dispatch notifications, session timeouts, and portal security controls.',
    allowedScopes: ['Firm', 'Platform'],
    riskLevel: 'Elevated',
    targetComponent: 'ProfileSettingsView.tsx (Security & Notifications Section)',
  },

  // =========================================================================
  // 3.3. SUPPORT & HELP (support) — TechSupportView.tsx
  // =========================================================================
  {
    code: 'support.view',
    resource: 'support',
    action: 'view',
    name: 'Access Support & Help Desk',
    description: 'Open the engineering support and diagnostics portal.',
    allowedScopes: ['Own', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'Sidebar (Support & Help) & TechSupportView.tsx',
  },
  {
    code: 'support.whatsapp',
    resource: 'support',
    action: 'whatsapp',
    name: 'Access Direct WhatsApp Developer Link',
    description: 'Direct trigger to contact engineering lead on WhatsApp (+254 768 398 022).',
    allowedScopes: ['Own', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'TechSupportView.tsx (WhatsApp Direct Action)',
  },
  {
    code: 'support.submit_ticket',
    resource: 'support',
    action: 'submit_ticket',
    name: 'Submit Support Tickets & Bug Reports',
    description: 'Submit technical issues, scale adjustment requests, and bug reports to developer team.',
    allowedScopes: ['Own', 'Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'TechSupportView.tsx (Ticket Submission Form)',
  },
  {
    code: 'support.diagnostics',
    resource: 'support',
    action: 'diagnostics',
    name: 'View Live Firm System Diagnostics',
    description: 'Inspect real-time status indicators for database sync, calculation engine, and cloud storage.',
    allowedScopes: ['Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'TechSupportView.tsx (System Diagnostics Section)',
  },

  // =========================================================================
  // 4. DATABASE & SYSTEM AUDIT (database)
  // =========================================================================
  {
    code: 'database.view_health',
    resource: 'database',
    action: 'view_health',
    name: 'View Database Health & Connections',
    description: 'Monitor PostgreSQL connection pools, API latency, and real-time replication status.',
    allowedScopes: ['Firm', 'Platform'],
    riskLevel: 'Standard',
    targetComponent: 'System Diagnostics Console',
  },
  {
    code: 'database.backup_export',
    resource: 'database',
    action: 'backup_export',
    name: 'Export PostgreSQL Database Backup Snapshot',
    description: 'Generate encrypted database dumps containing all firm matters, fee notes, and clients.',
    allowedScopes: ['Platform'],
    riskLevel: 'Critical',
    targetComponent: 'Admin Database Backup Panel',
  },
];

// Helper to construct exact role template permission lists
const ALL_PERMS = STANDARDIZED_PERMISSIONS.map(p => ({ code: p.code, scope: 'Platform' as PermissionScope }));

const MANAGING_PARTNER_PERMS = STANDARDIZED_PERMISSIONS
  .filter(p => !['database.backup_export'].includes(p.code))
  .map(p => ({ code: p.code, scope: 'Firm' as PermissionScope }));

const SENIOR_ADVOCATE_CODES = [
  'dashboard.view', 'dashboard.view_metrics', 'dashboard.scale_calculator', 'dashboard.upcoming_dockets', 'dashboard.recent_activity', 'dashboard.quick_triggers',
  'boc.view', 'boc.matter_form', 'boc.scale_engine', 'boc.getting_up_fee', 'boc.itemized_work', 'boc.disbursements', 'boc.live_preview', 'boc.export_pdf', 'boc.export_excel', 'boc.save_database',
  'feenotes.view', 'feenotes.filter_search', 'feenotes.preview_bill', 'feenotes.download_pdf', 'feenotes.edit', 'feenotes.view_summary_banner',
  'matters.view', 'matters.tree_filters', 'matters.switch_views', 'matters.create', 'matters.edit', 'matters.direct_boc',
  'clients.view', 'clients.filter_search', 'clients.create', 'clients.portfolio', 'clients.edit',
  'vault.view', 'vault.filter_search', 'vault.upload', 'vault.in_browser_viewer', 'vault.download',
  'guide.view', 'guide.calculator', 'guide.quick_reference',
  'settings.view',
  'support.view', 'support.whatsapp', 'support.submit_ticket'
];

const SENIOR_ADVOCATE_PERMS = SENIOR_ADVOCATE_CODES.map(code => ({
  code,
  scope: (['clients.create', 'matters.create'].includes(code) ? 'Firm' : 'Assigned') as PermissionScope
}));

const FINANCE_MGR_CODES = [
  'dashboard.view', 'dashboard.view_metrics', 'dashboard.scale_calculator', 'dashboard.recent_activity',
  'boc.view', 'boc.live_preview', 'boc.export_pdf', 'boc.export_excel', 'boc.save_database',
  'feenotes.view', 'feenotes.filter_search', 'feenotes.preview_bill', 'feenotes.download_pdf', 'feenotes.edit', 'feenotes.delete', 'feenotes.view_summary_banner',
  'matters.view', 'matters.switch_views',
  'clients.view', 'clients.filter_search', 'clients.portfolio',
  'vault.view', 'vault.filter_search', 'vault.in_browser_viewer', 'vault.download',
  'managing_hub.financial_kpis',
  'guide.view', 'guide.calculator', 'guide.quick_reference',
  'settings.view', 'settings.taxation_banking',
  'support.view', 'support.submit_ticket'
];

const FINANCE_MGR_PERMS = FINANCE_MGR_CODES.map(code => ({
  code,
  scope: 'Firm' as PermissionScope
}));

const LEGAL_ASSISTANT_CODES = [
  'dashboard.view', 'dashboard.scale_calculator', 'dashboard.upcoming_dockets', 'dashboard.recent_activity',
  'boc.view', 'boc.matter_form', 'boc.scale_engine', 'boc.getting_up_fee', 'boc.itemized_work', 'boc.disbursements', 'boc.live_preview', 'boc.save_database',
  'feenotes.view', 'feenotes.filter_search', 'feenotes.preview_bill', 'feenotes.download_pdf', 'feenotes.view_summary_banner',
  'matters.view', 'matters.tree_filters', 'matters.switch_views', 'matters.direct_boc',
  'clients.view', 'clients.filter_search',
  'vault.view', 'vault.filter_search', 'vault.upload', 'vault.in_browser_viewer', 'vault.download',
  'guide.view', 'guide.calculator', 'guide.quick_reference',
  'support.view', 'support.submit_ticket'
];

const LEGAL_ASSISTANT_PERMS = LEGAL_ASSISTANT_CODES.map(code => ({
  code,
  scope: 'Assigned' as PermissionScope
}));

export const DEFAULT_ROLE_TEMPLATES: RoleTemplate[] = [
  {
    id: 'tpl-managing-partner',
    code: 'managing_partner_exec',
    name: 'Managing Partner & Executive',
    description: 'Full executive oversight, financial authority, user management, and firm-wide legal operations',
    isSystem: true,
    permissionsCount: MANAGING_PARTNER_PERMS.length,
    permissions: MANAGING_PARTNER_PERMS
  },
  {
    id: 'tpl-senior-advocate',
    code: 'senior_advocates_lawyers',
    name: 'Senior Advocates & Lead Counsel',
    description: 'Litigation case handling, statutory bill drafting, client representation, and evidence management',
    isSystem: true,
    permissionsCount: SENIOR_ADVOCATE_PERMS.length,
    permissions: SENIOR_ADVOCATE_PERMS
  },
  {
    id: 'tpl-finance-mgr',
    code: 'finance_billing_mgr',
    name: 'Finance & Billing Manager',
    description: 'Fee note reconciliation, VAT / KRA invoice generation, settlement receipting, and financial audits',
    isSystem: true,
    permissionsCount: FINANCE_MGR_PERMS.length,
    permissions: FINANCE_MGR_PERMS
  },
  {
    id: 'tpl-legal-assistant',
    code: 'legal_assistant_intern',
    name: 'Legal Assistant & Pupil / Intern',
    description: 'Court docket filing, document uploads, bill drafting, attendance logging, and legal research',
    isSystem: true,
    permissionsCount: LEGAL_ASSISTANT_PERMS.length,
    permissions: LEGAL_ASSISTANT_PERMS
  },
  {
    id: 'tpl-developer-admin',
    code: 'developer_sys_admin',
    name: 'Lead Developer & System Administrator',
    description: 'Full unconstrained platform control, database migrations, security audit logs, and technical diagnostics',
    isSystem: true,
    permissionsCount: ALL_PERMS.length,
    permissions: ALL_PERMS
  }
];

export const FOUR_ROLE_TEMPLATES: RoleTemplate[] = DEFAULT_ROLE_TEMPLATES;

// LocalStorage helpers for rich persistence
const LOCAL_TEMPLATES_KEY = 'karani_law_role_templates_v3';
const LOCAL_OVERRIDES_KEY = 'karani_law_user_overrides_v3';
const LOCAL_USER_ROLES_KEY = 'karani_law_user_roles_v3';
const LOCAL_CATALOG_KEY = 'karani_law_permission_catalog_v3';

export function getLocalPermissionCatalog(): PermissionCatalogItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_CATALOG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return STANDARDIZED_PERMISSIONS;
}

export function saveLocalPermissionCatalog(catalog: PermissionCatalogItem[]): void {
  try {
    localStorage.setItem(LOCAL_CATALOG_KEY, JSON.stringify(catalog));
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('permissionsUpdated'));
  } catch (e) {}
}

export function getLocalTemplates(): RoleTemplate[] {
  try {
    const raw = localStorage.getItem(LOCAL_TEMPLATES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEFAULT_ROLE_TEMPLATES;
}

export function saveLocalTemplates(templates: RoleTemplate[]): void {
  try {
    localStorage.setItem(LOCAL_TEMPLATES_KEY, JSON.stringify(templates));
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('permissionsUpdated'));
  } catch (e) {}
}

export function getLocalOverrides(): Record<string, UserPermissionOverride[]> {
  try {
    const raw = localStorage.getItem(LOCAL_OVERRIDES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {};
}

export function saveLocalOverrides(overrides: Record<string, UserPermissionOverride[]>): void {
  try {
    localStorage.setItem(LOCAL_OVERRIDES_KEY, JSON.stringify(overrides));
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('permissionsUpdated'));
  } catch (e) {}
}

export function getLocalUserRoleAssignments(): Record<string, string> {
  try {
    const raw = localStorage.getItem(LOCAL_USER_ROLES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {};
}

export function saveLocalUserRoleAssignments(map: Record<string, string>): void {
  try {
    localStorage.setItem(LOCAL_USER_ROLES_KEY, JSON.stringify(map));
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('permissionsUpdated'));
  } catch (e) {}
}

// Service functions to interact with Supabase database & local cache
export async function fetchPermissionCatalog(): Promise<PermissionCatalogItem[]> {
  try {
    const { data, error } = await supabase
      .from('permission_catalog')
      .select('*')
      .order('resource', { ascending: true })
      .order('code', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map(item => ({
        code: item.code,
        resource: item.resource as SystemResource,
        action: item.action,
        name: item.name,
        description: item.description || '',
        allowedScopes: (item.allowed_scopes || ['Own', 'Assigned', 'Firm', 'Platform']) as PermissionScope[],
        riskLevel: item.risk_level || (item.code.includes('delete') ? 'Critical' : 'Standard'),
        targetComponent: item.target_component || ''
      }));
    }
  } catch (err) {
    console.warn('Using local fallback permission catalog:', err);
  }
  return getLocalPermissionCatalog();
}

export async function savePermissionCatalogItem(item: PermissionCatalogItem): Promise<PermissionCatalogItem> {
  const current = getLocalPermissionCatalog();
  const index = current.findIndex(p => p.code === item.code);
  let updatedList: PermissionCatalogItem[];
  if (index >= 0) {
    updatedList = current.map((p, i) => i === index ? item : p);
  } else {
    updatedList = [...current, item];
  }
  saveLocalPermissionCatalog(updatedList);

  try {
    await supabase.from('permission_catalog').upsert({
      code: item.code,
      resource: item.resource,
      action: item.action,
      name: item.name,
      description: item.description,
      allowed_scopes: item.allowedScopes
    });
  } catch (e) {
    console.warn('DB permission_catalog upsert non-fatal:', e);
  }

  return item;
}

export async function deletePermissionCatalogItem(code: string): Promise<boolean> {
  const current = getLocalPermissionCatalog();
  const updatedList = current.filter(p => p.code !== code);
  saveLocalPermissionCatalog(updatedList);

  try {
    await supabase.from('permission_catalog').delete().eq('code', code);
  } catch (e) {
    console.warn('DB permission_catalog delete non-fatal:', e);
  }

  return true;
}

export async function fetchRoleTemplates(): Promise<RoleTemplate[]> {
  try {
    const { data, error } = await supabase
      .from('role_templates')
      .select('*, role_template_permissions(permission_code, scope)');

    if (!error && data && data.length > 0) {
      return data.map(row => ({
        id: row.id,
        code: row.code as RoleTemplateCode,
        name: row.name,
        description: row.description || '',
        isSystem: row.is_system || false,
        permissionsCount: row.role_template_permissions?.length || 0,
        permissions: row.role_template_permissions?.map((p: any) => ({
          code: p.permission_code,
          scope: p.scope as PermissionScope
        })) || []
      }));
    }
  } catch (err) {
    console.warn('Using local fallback role templates:', err);
  }
  return getLocalTemplates();
}

export async function saveRoleTemplateToDb(template: RoleTemplate): Promise<RoleTemplate> {
  const current = getLocalTemplates();
  const index = current.findIndex(t => t.id === template.id || t.code === template.code);
  let updatedList: RoleTemplate[];
  if (index >= 0) {
    updatedList = current.map((t, i) => i === index ? template : t);
  } else {
    updatedList = [...current, template];
  }
  saveLocalTemplates(updatedList);

  try {
    await supabase.from('role_templates').upsert({
      id: template.id.startsWith('tpl-') ? undefined : template.id,
      code: template.code,
      name: template.name,
      description: template.description,
      is_system: template.isSystem,
      updated_at: new Date().toISOString()
    });
  } catch (e) {
    console.warn('DB template sync non-fatal:', e);
  }

  return template;
}

export async function fetchUserOverrides(userId: string): Promise<UserPermissionOverride[]> {
  try {
    const { data, error } = await supabase
      .from('user_permission_overrides')
      .select('*')
      .eq('user_id', userId);

    if (!error && data && data.length > 0) {
      return data.map(row => ({
        id: row.id,
        userId: row.user_id,
        permissionCode: row.permission_code,
        effect: row.effect,
        scope: row.scope,
        reason: row.reason,
        expiresAt: row.expires_at,
        createdAt: row.created_at
      }));
    }
  } catch (err) {
    console.warn('Using local fallback overrides:', err);
  }
  const localMap = getLocalOverrides();
  return localMap[userId] || [];
}

export async function assignRoleToUser(userId: string, roleTemplateId: string, assignedById?: string): Promise<boolean> {
  const map = getLocalUserRoleAssignments();
  map[userId] = roleTemplateId;
  saveLocalUserRoleAssignments(map);

  try {
    await supabase.from('user_role_assignments').delete().eq('user_id', userId);
    await supabase.from('user_role_assignments').insert({
      user_id: userId,
      role_template_id: roleTemplateId,
      assigned_by: assignedById || null,
      created_at: new Date().toISOString()
    });
  } catch (e) {
    console.warn('DB user_role_assignments non-fatal:', e);
  }

  return true;
}

export async function setUserPermissionOverride(
  userId: string,
  permissionCode: string,
  effect: 'grant' | 'deny',
  scope: PermissionScope = 'Firm',
  reason: string = '',
  expiresAt: string | null = null,
  changedById?: string
): Promise<boolean> {
  const map = getLocalOverrides();
  const list = map[userId] || [];
  const filtered = list.filter(o => o.permissionCode !== permissionCode);
  const newOverride: UserPermissionOverride = {
    id: 'ovr-' + Math.random().toString(36).substring(2, 9),
    userId,
    permissionCode,
    effect,
    scope,
    reason,
    expiresAt,
    createdAt: new Date().toISOString()
  };
  map[userId] = [...filtered, newOverride];
  saveLocalOverrides(map);

  try {
    await supabase.from('user_permission_overrides').upsert({
      user_id: userId,
      permission_code: permissionCode,
      effect,
      scope,
      reason,
      expires_at: expiresAt,
      changed_by: changedById || null,
      created_at: new Date().toISOString()
    }, { onConflict: 'user_id,permission_code' });
  } catch (e) {
    console.warn('DB user_permission_overrides non-fatal:', e);
  }

  return true;
}

export async function deleteUserOverride(userId: string, permissionCode: string): Promise<boolean> {
  const map = getLocalOverrides();
  if (map[userId]) {
    map[userId] = map[userId].filter(o => o.permissionCode !== permissionCode);
    saveLocalOverrides(map);
  }

  try {
    await supabase
      .from('user_permission_overrides')
      .delete()
      .eq('user_id', userId)
      .eq('permission_code', permissionCode);
  } catch (e) {
    console.warn('DB delete override non-fatal:', e);
  }

  return true;
}

export async function resetUserOverrides(userId: string): Promise<boolean> {
  const map = getLocalOverrides();
  delete map[userId];
  saveLocalOverrides(map);

  try {
    await supabase
      .from('user_permission_overrides')
      .delete()
      .eq('user_id', userId);
  } catch (e) {
    console.warn('DB reset overrides non-fatal:', e);
  }

  return true;
}

// Calculate effective permissions combining Template + Overrides
export function calculateEffectivePermissions(
  template: RoleTemplate,
  overrides: UserPermissionOverride[],
  catalog: PermissionCatalogItem[] = getLocalPermissionCatalog()
): UserEffectivePermission[] {
  const templatePermMap = new Map<string, PermissionScope>();
  template.permissions.forEach(p => templatePermMap.set(p.code, p.scope));

  const overrideMap = new Map<string, UserPermissionOverride>();
  overrides.forEach(o => overrideMap.set(o.permissionCode, o));

  return catalog.map(catItem => {
    const isTemplateGranted = templatePermMap.has(catItem.code);
    const templateScope = templatePermMap.get(catItem.code) || 'Firm';
    const override = overrideMap.get(catItem.code);

    let isGranted = isTemplateGranted;
    let source: 'role_template' | 'override_grant' = 'role_template';
    let scope: PermissionScope = templateScope;

    if (override) {
      if (override.effect === 'grant') {
        isGranted = true;
        source = 'override_grant';
        scope = override.scope;
      } else if (override.effect === 'deny') {
        isGranted = false;
        source = 'role_template';
        scope = override.scope;
      }
    }

    return {
      code: catItem.code,
      resource: catItem.resource,
      action: catItem.action,
      name: catItem.name,
      description: catItem.description,
      riskLevel: catItem.riskLevel || 'Standard',
      targetComponent: catItem.targetComponent || '',
      scope,
      source,
      isGranted,
      overrideEffect: override?.effect,
      overrideReason: override?.reason,
      overrideExpiresAt: override?.expiresAt
    };
  });
}

// Active Runtime Permission Evaluator for UI enforcement
export function hasPermission(
  user: { id?: string; role?: string; hasAllPermissions?: boolean; workEmail?: string; username?: string; personalEmail?: string } | null | undefined,
  permissionCode: string
): boolean {
  if (!user) return false;

  const overridesMap = getLocalOverrides();
  
  // Resolve user overrides using all possible identifiers
  const userOverrides = 
    (user.id && overridesMap[user.id]) ||
    (user.workEmail && overridesMap[user.workEmail]) ||
    (user.username && overridesMap[user.username]) ||
    (user.personalEmail && overridesMap[user.personalEmail]) ||
    [];

  // 1. Explicit User Override takes absolute top priority (Explicit Deny or Grant)
  const override = userOverrides.find(o => o.permissionCode === permissionCode);
  if (override) {
    return override.effect === 'grant';
  }

  // 2. Lead Developer & Root Admin default full access if not explicitly denied
  if (user.role === 'Developer' || (user.role === 'Admin' && user.hasAllPermissions)) {
    return true;
  }

  // 3. Match against user assigned role template
  const roleMap = getLocalUserRoleAssignments();
  const assignedCode = 
    (user.id && roleMap[user.id]) ||
    (user.workEmail && roleMap[user.workEmail]) ||
    (user.username && roleMap[user.username]) ||
    (
      user.role === 'Admin' ? 'managing_partner_exec' :
      user.role === 'Advocate' ? 'senior_advocates_lawyers' : 'legal_assistant_intern'
    );

  const templates = getLocalTemplates();
  const template = templates.find(t => t.id === assignedCode || t.code === assignedCode) || templates.find(t => t.code === 'senior_advocates_lawyers') || templates[0];

  if (!template) return false;
  return template.permissions.some(p => p.code === permissionCode);
}

// React Hook for active reactive UI updates whenever permissions change
export function useRBAC(user: { id?: string; role?: string; hasAllPermissions?: boolean; workEmail?: string; username?: string; personalEmail?: string } | null | undefined) {
  const [tick, setTick] = (typeof window !== 'undefined' ? (window as any).__React?.useState || [0, () => {}] : [0, () => {}]);

  // Hook body handled in components
  return {
    can: (code: string) => hasPermission(user, code),
    hasPermission: (code: string) => hasPermission(user, code)
  };
}


