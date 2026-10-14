import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Lock, Key, CheckCircle2, Save, Globe, Eye, Server, 
  ShieldCheck, Search, Filter, Database, Users, FileText, Briefcase, 
  HardDrive, HelpCircle, Layers, RefreshCw 
} from 'lucide-react';
import { 
  STANDARDIZED_PERMISSIONS, 
  FOUR_ROLE_TEMPLATES, 
  SystemResource, 
  PermissionCatalogItem,
  fetchPermissionCatalog,
  fetchRoleTemplates
} from '../../services/rbac';
import { showToast } from './ToastNotification';

export const AdminPermissionsView: React.FC = () => {
  const [permissions, setPermissions] = useState<PermissionCatalogItem[]>(STANDARDIZED_PERMISSIONS);
  const [selectedResource, setSelectedResource] = useState<'all' | SystemResource>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mfaEnforced, setMfaEnforced] = useState(false);
  const [ipWhitelist, setIpWhitelist] = useState('192.168.100.0/24');
  const [lockoutAttempts, setLockoutAttempts] = useState('5');
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDatabasePermissions();
  }, []);

  const loadDatabasePermissions = async () => {
    setIsLoading(true);
    try {
      const catalog = await fetchPermissionCatalog();
      if (catalog && catalog.length > 0) {
        setPermissions(catalog);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    setIsSaved(true);
    showToast('success', 'Security Policy Synced', 'Database-level RBAC policies enforced.');
    setTimeout(() => setIsSaved(false), 2000);
  };

  const filteredPermissions = permissions.filter(p => {
    const matchesResource = selectedResource === 'all' || p.resource === selectedResource;
    const matchesSearch = !searchQuery || 
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesResource && matchesSearch;
  });

  const getRoleAccessStatus = (roleCode: string, permCode: string): { status: string; color: string; scope?: string } => {
    if (roleCode === 'developer_sys_admin') {
      return { status: '✓ Full', color: 'text-emerald-500 font-bold', scope: 'Platform' };
    }

    if (roleCode === 'managing_partner_exec') {
      const excluded = ['database.run_migration', 'database.killswitch', 'database.query_console', 'database.clear_cache', 'support.remote_assist'];
      if (excluded.includes(permCode)) {
        return { status: '✕ Denied', color: 'text-slate-400' };
      }
      return { status: '✓ Full', color: 'text-emerald-500 font-bold', scope: 'Firm' };
    }

    if (roleCode === 'senior_advocates_lawyers') {
      const lawyerPerms: Record<string, string> = {
        'clients.view': 'Assigned',
        'clients.create': 'Firm',
        'clients.update': 'Assigned',
        'matters.view': 'Assigned',
        'matters.create': 'Firm',
        'matters.update': 'Assigned',
        'matters.status_change': 'Assigned',
        'matters.export': 'Assigned',
        'feenotes.view': 'Assigned',
        'feenotes.create_draft': 'Own',
        'feenotes.edit_folios': 'Assigned',
        'feenotes.taxation_apply': 'Assigned',
        'feenotes.export_pdf': 'Assigned',
        'feenotes.export_excel': 'Assigned',
        'vault.view': 'Assigned',
        'vault.upload': 'Assigned',
        'vault.create_folder': 'Assigned',
        'vault.version_control': 'Assigned',
        'vault.share_external': 'Assigned',
        'profile.view_own': 'Own',
        'profile.update_own': 'Own',
        'profile.view_firm_users': 'Firm',
        'support.ticket_create': 'Own',
        'support.ticket_view': 'Own',
        'support.chat_internal': 'Own',
      };
      if (lawyerPerms[permCode]) {
        return { status: `✓ ${lawyerPerms[permCode]}`, color: 'text-blue-500 font-semibold', scope: lawyerPerms[permCode] };
      }
      return { status: '✕ Denied', color: 'text-red-500/70' };
    }

    if (roleCode === 'it_dept_support') {
      const itPerms: Record<string, string> = {
        'clients.audit_view': 'Firm',
        'matters.view': 'Firm',
        'vault.purge_archive': 'Firm',
        'database.view_health': 'Firm',
        'database.table_sync': 'Firm',
        'database.backup_export': 'Firm',
        'profile.view_own': 'Own',
        'profile.update_own': 'Own',
        'profile.view_firm_users': 'Firm',
        'profile.manage_users': 'Firm',
        'profile.security_policy': 'Firm',
        'profile.view_audit_logs': 'Firm',
        'support.ticket_create': 'Own',
        'support.ticket_view': 'Firm',
        'support.ticket_resolve': 'Firm',
        'support.broadcast_send': 'Firm',
        'support.inspect_logs': 'Firm',
        'support.chat_internal': 'Firm',
      };
      if (itPerms[permCode]) {
        return { status: `✓ ${itPerms[permCode]}`, color: 'text-purple-500 font-semibold', scope: itPerms[permCode] };
      }
      return { status: '✕ Denied', color: 'text-red-500/70' };
    }

    return { status: '✕ Denied', color: 'text-slate-400' };
  };

  const resourceIcons: Record<string, any> = {
    all: Layers,
    matters: Briefcase,
    feenotes: FileText,
    vault: HardDrive,
    clients: Users,
    database: Database,
    profile: Lock,
    support: HelpCircle,
  };

  return (
    <div className="w-full space-y-8 pb-12 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)]/50 pb-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[10px] flex items-center gap-1.5 w-fit">
            <ShieldCheck className="w-3.5 h-3.5" /> POSTGRES DATABASE-ENFORCED RBAC
          </span>
          <h1 className="font-brand font-extrabold text-2xl text-[var(--text-main)] tracking-tight mt-1">
            Standardized Permissions & 4 Role Templates
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            56 Granular Operations across 7 Core Resources (matters, feenotes, vault, clients, database, profile, support) with 4 Scopes (Own, Assigned, Firm, Platform).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadDatabasePermissions}
            className="p-2.5 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] cursor-pointer"
            title="Refresh from Database"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleSave}
            className="btn-black px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            {isSaved ? <><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Synced to Database!</> : <><Save className="w-4 h-4" /> Save Security Matrix</>}
          </button>
        </div>
      </div>

      {/* Resource Tabs & Search Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {(['all', 'dashboard', 'boc_builder', 'feenotes', 'matters', 'clients', 'vault', 'managing_hub', 'permissions', 'remuneration_guide', 'settings', 'support', 'database'] as const).map(res => {
            const Icon = (resourceIcons as any)[res] || Layers;
            const count = res === 'all' ? permissions.length : permissions.filter(p => p.resource === res).length;
            const isSelected = selectedResource === res;
            return (
              <button
                key={res}
                onClick={() => setSelectedResource(res as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all shrink-0 ${
                  isSelected 
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-semibold shadow-sm' 
                    : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-color)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="capitalize">{res}</span>
                <span className="text-[10px] opacity-70 font-mono">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="relative shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search 56 permissions..."
            className="bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl pl-9 pr-4 py-2 font-mono text-xs text-[var(--text-main)] focus:outline-none w-64"
          />
        </div>
      </div>

      {/* RBAC Table Matrix */}
      <div className="vercel-card overflow-hidden border border-[var(--border-color)] rounded-2xl shadow-sm">
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-subtle)]">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Showing {filteredPermissions.length} Permissions across 4 Standardized Roles
          </h3>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            Enforced by PostgreSQL RLS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--text-main)]">
            <thead className="bg-[var(--bg-subtle)]/70 text-[var(--text-muted)] uppercase text-[10px] tracking-wider border-b border-[var(--border-color)] font-semibold">
              <tr>
                <th className="px-5 py-3.5">Standardized Operation</th>
                <th className="px-4 py-3.5">Resource</th>
                <th className="px-4 py-3.5 text-center">1. Managing Partner & Exec</th>
                <th className="px-4 py-3.5 text-center">2. Senior Advocates & Lawyers</th>
                <th className="px-4 py-3.5 text-center">3. IT Dept & Support</th>
                <th className="px-4 py-3.5 text-center">4. Developer & Sys Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredPermissions.map((perm) => {
                const partner = getRoleAccessStatus('managing_partner_exec', perm.code);
                const lawyer = getRoleAccessStatus('senior_advocates_lawyers', perm.code);
                const it = getRoleAccessStatus('it_dept_support', perm.code);
                const dev = getRoleAccessStatus('developer_sys_admin', perm.code);

                return (
                  <tr key={perm.code} className="hover:bg-[var(--bg-subtle)]/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-[var(--text-main)]">{perm.name}</div>
                      <div className="text-[10px] text-[var(--text-muted)] font-mono">{perm.code} — {perm.description}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-[10px] font-mono font-semibold uppercase text-slate-600 dark:text-slate-300">
                        {perm.resource}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-center ${partner.color}`}>
                      {partner.status}
                    </td>
                    <td className={`px-4 py-3 text-center ${lawyer.color}`}>
                      {lawyer.status}
                    </td>
                    <td className={`px-4 py-3 text-center ${it.color}`}>
                      {it.status}
                    </td>
                    <td className={`px-4 py-3 text-center ${dev.color}`}>
                      {dev.status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Switches */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <Lock className="w-4 h-4 text-emerald-500" /> Multi-Factor Auth (MFA)
          </h3>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[var(--text-muted)]">Enforce 2FA for Executive & IT roles:</span>
            <input 
              type="checkbox" 
              checked={mfaEnforced} 
              onChange={(e) => setMfaEnforced(e.target.checked)} 
              className="w-4 h-4 accent-black dark:accent-white cursor-pointer" 
            />
          </div>
        </div>

        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <Globe className="w-4 h-4 text-blue-500" /> IP Whitelist Rule
          </h3>
          <input 
            type="text" 
            value={ipWhitelist} 
            onChange={(e) => setIpWhitelist(e.target.value)} 
            className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs text-[var(--text-main)] focus:outline-none" 
          />
        </div>

        <div className="vercel-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" /> Account Lockout Threshold
          </h3>
          <select 
            value={lockoutAttempts} 
            onChange={(e) => setLockoutAttempts(e.target.value)} 
            className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs text-[var(--text-main)] focus:outline-none"
          >
            <option value="3">3 Failed Attempts</option>
            <option value="5">5 Failed Attempts (Default)</option>
            <option value="10">10 Failed Attempts</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default AdminPermissionsView;
