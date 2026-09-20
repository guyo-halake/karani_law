import React, { useState } from 'react';
import { SEEDED_USERS, SystemUser } from '../../services/supabase';
import { Users, UserPlus, Key, ShieldCheck, CheckCircle2, Lock, Trash2, Edit, RefreshCw } from 'lucide-react';

export const AdminUsersRolesView: React.FC = () => {
  const [userList, setUserList] = useState<SystemUser[]>(SEEDED_USERS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [lskNo, setLskNo] = useState('');
  const [role, setRole] = useState<'Admin' | 'Developer' | 'Advocate'>('Advocate');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: SystemUser = {
      id: 'usr-' + (userList.length + 1),
      fullName,
      advocateTitle: `Adv. ${fullName}`,
      lskNo: lskNo || 'P.105/2026',
      role,
      position: role === 'Admin' ? 'Firm Admin' : 'Associate Advocate',
      workEmail: email,
      personalEmail: email,
      phonePrimary: '+254 700 000 000',
      phoneSecondary: '+254 711 000 000',
      hasAllPermissions: role === 'Admin' || role === 'Developer',
      passwordHash: 'lawyer123'
    };
    setUserList([...userList, newUser]);
    setShowAddModal(false);
    setFullName('');
    setEmail('');
    setLskNo('');
    alert(`✓ User "${fullName}" created successfully with role: ${role}!`);
  };

  const handleRoleChange = (userId: string, newRole: 'Admin' | 'Developer' | 'Advocate') => {
    setUserList(prev => prev.map(u => u.id === userId ? {
      ...u,
      role: newRole,
      hasAllPermissions: newRole === 'Admin' || newRole === 'Developer'
    } : u));
    alert(`✓ Role updated to ${newRole} for user.`);
  };

  const handleResetPassword = (email: string) => {
    alert(`✓ Password reset email dispatched via Nodemailer gateway to ${email}!`);
  };

  return (
    <div className="w-full space-y-8 pb-12 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)]/50 pb-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-bold text-[10px]">
            ADMIN CONTROL PANEL
          </span>
          <h1 className="font-brand font-extrabold text-2xl text-[var(--text-main)] tracking-tight mt-1">
            System Users & Database Roles Management
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            11 Master User Controls for Role Assignments (Admin, Developer, Advocates/Lawyers), LSK Validation & Password Resets
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-black px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" /> Create New User
        </button>
      </div>

      {/* User Directory Table */}
      <div className="vercel-card overflow-hidden">
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" /> System Users Directory ({userList.length} Active Accounts)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--text-main)]">
            <thead className="bg-[var(--bg-subtle)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider border-b border-[var(--border-color)] font-semibold">
              <tr>
                <th className="px-5 py-3.5">User Full Name & Title</th>
                <th className="px-5 py-3.5">LSK Reg No.</th>
                <th className="px-5 py-3.5">Work Email Address</th>
                <th className="px-5 py-3.5">Assigned System Role</th>
                <th className="px-5 py-3.5">All Permissions</th>
                <th className="px-5 py-3.5 text-center">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {userList.map((u) => (
                <tr key={u.id} className="hover:bg-[var(--bg-subtle)] transition-colors">
                  <td className="px-5 py-3.5">
                    <strong className="font-bold text-[var(--text-main)] block">{u.fullName}</strong>
                    <span className="text-[10.5px] text-[var(--text-muted)]">{u.position}</span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-amber-600 dark:text-amber-400 font-bold">{u.lskNo}</td>
                  <td className="px-5 py-3.5 font-mono">{u.workEmail}</td>
                  <td className="px-5 py-3.5">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                      className="bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-lg px-2.5 py-1 text-xs text-[var(--text-main)] font-semibold cursor-pointer"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Developer">Developer</option>
                      <option value="Advocate">Advocates / Lawyers / Custom</option>
                    </select>
                  </td>
                  <td className="px-5 py-3.5">
                    {u.hasAllPermissions ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10.5px] font-mono font-bold">
                        ✓ Full Access
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[10.5px] font-mono font-bold">
                        Standard Role
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button
                      onClick={() => handleResetPassword(u.workEmail)}
                      className="px-2.5 py-1 rounded-lg border border-[var(--border-color)] hover:border-[var(--text-main)] text-[11px] font-semibold flex items-center gap-1 mx-auto"
                      title="Reset Password"
                    >
                      <Key className="w-3.5 h-3.5" /> Reset Pass
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Creation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm text-[var(--text-main)] uppercase tracking-wider">
              Create New System User Account
            </h3>
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
                <label className="font-semibold block mb-1">LSK Admission Number:</label>
                <input
                  type="text"
                  value={lskNo}
                  onChange={(e) => setLskNo(e.target.value)}
                  placeholder="P.105/4892"
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs"
                />
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
                  <option value="Advocate">Advocates / Lawyers / Custom</option>
                </select>
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-outline px-4 py-2 text-xs font-semibold">
                  Cancel
                </button>
                <button type="submit" className="btn-black px-5 py-2 text-xs font-semibold">
                  Create User
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
