import React, { useState } from 'react';
import { SEEDED_USERS, SystemUser } from '../../services/supabase';
import { 
  Users, UserPlus, Key, ShieldCheck, CheckCircle2, Lock, Trash2, Edit, 
  RefreshCw, Phone, Mail, Shield, Award, CheckSquare, X, Eye, EyeOff 
} from 'lucide-react';

export const AdminUsersRolesView: React.FC = () => {
  const [userList, setUserList] = useState<SystemUser[]>(SEEDED_USERS);
  const [activeTab, setActiveTab] = useState<'All' | 'Developer' | 'Admin' | 'Advocate'>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Add form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+254 700 000 000');
  const [lskNo, setLskNo] = useState('');
  const [position, setPosition] = useState('Associate Advocate');
  const [password, setPassword] = useState('lawyer123');
  const [role, setRole] = useState<'Admin' | 'Developer' | 'Advocate'>('Advocate');

  // Filter users by tab
  const filteredUsers = userList.filter(u => {
    if (activeTab === 'All') return true;
    return u.role === activeTab;
  });

  const toggleShowPassword = (userId: string) => {
    setShowPasswordMap(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: SystemUser = {
      id: 'usr-' + (userList.length + 1) + '-' + Date.now().toString().slice(-4),
      fullName,
      advocateTitle: `Adv. ${fullName}`,
      lskNo: lskNo || 'P.105/' + Math.floor(1000 + Math.random() * 9000),
      role,
      position: position || (role === 'Admin' ? 'Firm Admin' : 'Associate Advocate'),
      workEmail: email,
      personalEmail: email,
      phonePrimary: phone || '+254 700 000 000',
      phoneSecondary: '+254 711 000 000',
      hasAllPermissions: role === 'Admin' || role === 'Developer',
      passwordHash: password || 'lawyer123'
    };
    setUserList([newUser, ...userList]);
    setShowAddModal(false);
    resetForm();
    alert(`✓ User account for "${fullName}" created successfully with role: ${role}!`);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setUserList(prev => prev.map(u => u.id === editingUser.id ? {
      ...editingUser,
      advocateTitle: `Adv. ${editingUser.fullName}`
    } : u));
    setEditingUser(null);
    alert(`✓ User "${editingUser.fullName}" profile and permissions updated successfully in database!`);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to permanently delete the user account for "${userName}"?`)) {
      setUserList(prev => prev.filter(u => u.id !== userId));
      alert(`✓ User "${userName}" deleted from database.`);
    }
  };

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPhone('+254 700 000 000');
    setLskNo('');
    setPosition('Associate Advocate');
    setPassword('lawyer123');
    setRole('Advocate');
  };

  const availablePages = [
    { id: 'dashboard', label: 'Dashboard & KPIs' },
    { id: 'boc_builder', label: 'BOC Builder & Calculator' },
    { id: 'feenotes', label: 'Saved Fee Notes & Bills' },
    { id: 'matters', label: 'My Matters & Case Files' },
    { id: 'clients', label: 'My Clients Directory' },
    { id: 'documents', label: 'Document Storage Vault' },
    { id: 'guide', label: 'Remuneration Guide (11 Schedules)' },
    { id: 'firm_settings', label: 'Firm Settings' },
    { id: 'tech_support', label: 'Tech Support & Help Desk' },
    { id: 'admin_boc', label: 'Developer: BOC Scale Master' },
    { id: 'admin_firms', label: 'Developer: Multi-Tenant Firms' },
    { id: 'admin_pyengine', label: 'Developer: Python Remuneration Engine' },
    { id: 'admin_db', label: 'Developer: Database Sync & Health' },
    { id: 'admin_users', label: 'Developer: Users & Roles Matrix' },
    { id: 'admin_server', label: 'Developer: Server & Infrastructure' },
  ];

  return (
    <div className="w-full space-y-8 pb-12 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)]/50 pb-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-bold text-[10px]">
            DEVELOPER & ADMIN CONTROL PANEL
          </span>
          <h1 className="font-brand font-extrabold text-2xl text-[var(--text-main)] tracking-tight mt-1">
            Users, Roles & Database Permissions Master
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Manage all database accounts, edit passwords, phones, LSK admission numbers, and toggle granular page-level permissions.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-black px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" /> Add New System User
        </button>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('All')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'All' 
              ? 'bg-[var(--text-main)] text-[var(--bg-main)] shadow-sm' 
              : 'hover:bg-[var(--bg-subtle)] text-[var(--text-muted)]'
          }`}
        >
          <Users className="w-4 h-4" /> All Users ({userList.length})
        </button>

        <button
          onClick={() => setActiveTab('Developer')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'Developer' 
              ? 'bg-purple-600 text-white shadow-sm' 
              : 'hover:bg-[var(--bg-subtle)] text-[var(--text-muted)]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Developers ({userList.filter(u => u.role === 'Developer').length})
        </button>

        <button
          onClick={() => setActiveTab('Admin')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'Admin' 
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'hover:bg-[var(--bg-subtle)] text-[var(--text-muted)]'
          }`}
        >
          <Shield className="w-4 h-4" /> Admins ({userList.filter(u => u.role === 'Admin').length})
        </button>

        <button
          onClick={() => setActiveTab('Advocate')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'Advocate' 
              ? 'bg-emerald-600 text-white shadow-sm' 
              : 'hover:bg-[var(--bg-subtle)] text-[var(--text-muted)]'
          }`}
        >
          <Award className="w-4 h-4" /> Advocates & Staff ({userList.filter(u => u.role === 'Advocate').length})
        </button>
      </div>

      {/* User Directory Table */}
      <div className="vercel-card overflow-hidden">
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" /> Account Directory ({filteredUsers.length} Users)
          </h3>
          <span className="font-mono text-[11px] text-[var(--text-muted)]">
            Showing category: <strong className="text-[var(--text-main)]">{activeTab}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--text-main)]">
            <thead className="bg-[var(--bg-subtle)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider border-b border-[var(--border-color)] font-semibold">
              <tr>
                <th className="px-5 py-3.5">User Full Name & Position</th>
                <th className="px-5 py-3.5">LSK Reg No.</th>
                <th className="px-5 py-3.5">Contact Details (Email & Phone)</th>
                <th className="px-5 py-3.5">Password</th>
                <th className="px-5 py-3.5">System Role</th>
                <th className="px-5 py-3.5">Page Permissions</th>
                <th className="px-5 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[var(--bg-subtle)] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center font-mono shrink-0">
                        {u.fullName.split(' ').map(n => n[0]).slice(-2).join('')}
                      </div>
                      <div>
                        <strong className="font-bold text-[var(--text-main)] block">{u.fullName}</strong>
                        <span className="text-[10.5px] text-[var(--text-muted)]">{u.position}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-amber-600 dark:text-amber-400 font-bold">
                    {u.lskNo}
                  </td>
                  <td className="px-5 py-3.5 space-y-0.5 font-mono">
                    <div className="flex items-center gap-1.5 text-[var(--text-main)]">
                      <Mail className="w-3 h-3 text-[var(--text-muted)]" /> {u.workEmail}
                    </div>
                    <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-[11px]">
                      <Phone className="w-3 h-3" /> {u.phonePrimary}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-[var(--bg-subtle)] px-2 py-0.5 rounded border border-[var(--border-color)] text-[11px]">
                        {showPasswordMap[u.id] ? (u.passwordHash || 'lawyer123') : '••••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleShowPassword(u.id)}
                        className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 cursor-pointer"
                        title="Toggle password view"
                      >
                        {showPasswordMap[u.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-mono font-bold inline-flex items-center gap-1 ${
                      u.role === 'Developer'
                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                        : u.role === 'Admin'
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {u.hasAllPermissions ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10.5px] font-mono font-bold">
                        ✓ All 15 Pages Enabled
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10.5px] font-mono font-bold">
                        Standard User (9 Pages)
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setEditingUser(u)}
                        className="p-1.5 rounded-lg border border-[var(--border-color)] hover:border-blue-500 hover:text-blue-500 transition-colors cursor-pointer"
                        title="Edit User & Permissions"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id, u.fullName)}
                        className="p-1.5 rounded-lg border border-[var(--border-color)] hover:border-red-500 hover:text-red-500 transition-colors cursor-pointer text-red-400"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] w-full max-w-xl rounded-2xl p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="font-bold text-sm text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2">
                <Edit className="w-4 h-4 text-blue-500" /> Edit System User & Page Access Permissions
              </h3>
              <button 
                onClick={() => setEditingUser(null)}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Full Name:</label>
                  <input
                    type="text"
                    required
                    value={editingUser.fullName}
                    onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Position / Title:</label>
                  <input
                    type="text"
                    required
                    value={editingUser.position}
                    onChange={(e) => setEditingUser({ ...editingUser, position: e.target.value })}
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Work Email Address:</label>
                  <input
                    type="email"
                    required
                    value={editingUser.workEmail}
                    onChange={(e) => setEditingUser({ ...editingUser, workEmail: e.target.value, personalEmail: e.target.value })}
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Primary Phone Number:</label>
                  <input
                    type="text"
                    required
                    value={editingUser.phonePrimary}
                    onChange={(e) => setEditingUser({ ...editingUser, phonePrimary: e.target.value })}
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">LSK Admission Number:</label>
                  <input
                    type="text"
                    value={editingUser.lskNo}
                    onChange={(e) => setEditingUser({ ...editingUser, lskNo: e.target.value })}
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs text-amber-500 font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Account Password:</label>
                  <input
                    type="text"
                    required
                    value={editingUser.passwordHash || 'lawyer123'}
                    onChange={(e) => setEditingUser({ ...editingUser, passwordHash: e.target.value })}
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">System Role:</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => {
                    const newRole = e.target.value as any;
                    setEditingUser({ 
                      ...editingUser, 
                      role: newRole,
                      hasAllPermissions: newRole === 'Admin' || newRole === 'Developer'
                    });
                  }}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs font-bold"
                >
                  <option value="Admin">Admin (Full Administrative & System Access)</option>
                  <option value="Developer">Developer (Full Database & Infrastructure Access)</option>
                  <option value="Advocate">Advocate / Lawyer / Associate Staff</option>
                </select>
              </div>

              {/* Page Access Granular Matrix */}
              <div className="border border-[var(--border-color)] rounded-xl p-3 bg-[var(--bg-subtle)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-[var(--text-main)] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Page Access Permissions Control
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer font-mono text-[11px]">
                    <input
                      type="checkbox"
                      checked={editingUser.hasAllPermissions}
                      onChange={(e) => setEditingUser({ ...editingUser, hasAllPermissions: e.target.checked })}
                      className="accent-black dark:accent-white"
                    />
                    Grant Full Access To All Pages
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[var(--border-color)]/50">
                  {availablePages.map(page => (
                    <label key={page.id} className="flex items-center gap-2 p-1.5 rounded bg-[var(--bg-card)] border border-[var(--border-color)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingUser.hasAllPermissions || (!page.id.startsWith('admin_') && editingUser.role === 'Advocate')}
                        disabled={editingUser.hasAllPermissions}
                        className="accent-emerald-500"
                        readOnly
                      />
                      <span className={page.id.startsWith('admin_') ? 'text-purple-400 font-semibold' : 'text-[var(--text-main)]'}>
                        {page.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[var(--border-color)]">
                <button 
                  type="button" 
                  onClick={() => setEditingUser(null)} 
                  className="btn-outline px-4 py-2 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-black px-6 py-2 text-xs font-semibold cursor-pointer"
                >
                  Save User Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Creation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="font-bold text-sm text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-500" /> Create New System Account
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Full Name:</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Adv. Jane Wanjiru"
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Position / Title:</label>
                <input
                  type="text"
                  required
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Senior Commercial Partner"
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Work Email Address:</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane.wanjiru@kithinjilegal.co.ke"
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Primary Telephone Line:</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 712 345 678"
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">LSK Admission No:</label>
                  <input
                    type="text"
                    value={lskNo}
                    onChange={(e) => setLskNo(e.target.value)}
                    placeholder="P.105/4892"
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Initial Password:</label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="lawyer123"
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Assigned Role:</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  <option value="Admin">Admin (All Permissions Granted)</option>
                  <option value="Developer">Developer (All Permissions Granted)</option>
                  <option value="Advocate">Advocate / Lawyer / Associate Staff</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[var(--border-color)]">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-outline px-4 py-2 text-xs font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="btn-black px-5 py-2 text-xs font-semibold cursor-pointer">
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersRolesView;

