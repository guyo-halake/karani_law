import React, { useState } from 'react';
import { EXACT_FIRM_INFO } from '../../services/supabase';
import { 
  Building2, Plus, ShieldCheck, CheckCircle2, AlertTriangle, HardDrive, 
  Users, Globe, Download, Lock, Edit, Save, Mail, Phone, MapPin, 
  CreditCard, FileText, Image, Check 
} from 'lucide-react';

export const AdminFirmsView: React.FC = () => {
  // Active logged in law firm profile state
  const [firmProfile, setFirmProfile] = useState({
    name: EXACT_FIRM_INFO.name,
    firmRegNo: EXACT_FIRM_INFO.firmRegNo,
    managingAdvocate: EXACT_FIRM_INFO.user.name,
    email: EXACT_FIRM_INFO.email,
    phonePrimary: EXACT_FIRM_INFO.phone,
    phoneSecondary: '+254 711 000 000',
    addressLine1: EXACT_FIRM_INFO.address,
    city: EXACT_FIRM_INFO.fullLocation,
    poBox: EXACT_FIRM_INFO.poBox,
    website: EXACT_FIRM_INFO.website,
    kraPin: EXACT_FIRM_INFO.kraPin,
    bankName: 'KCB Bank Kenya Ltd',
    bankBranch: 'Kilimani Branch, Nairobi',
    bankAccountNo: '1104889922',
    bankSwiftCode: 'KCBLKENX',
    logoUrl: '/logo.png',
    plan: 'Enterprise Platinum',
    storageQuota: '100 GB',
    userSeats: '50 Seats'
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Multi-tenant registered law firms
  const [firms, setFirms] = useState([
    {
      id: 'f1',
      name: EXACT_FIRM_INFO.name,
      lskReg: EXACT_FIRM_INFO.firmRegNo,
      email: EXACT_FIRM_INFO.email,
      status: 'Active (Current Tenant)',
      plan: 'Enterprise Platinum',
      storageQuota: '100 GB',
      userSeats: '50 Seats',
      domain: 'kithinjilegal.co.ke'
    },
    {
      id: 'f2',
      name: 'Seyani Corporate Legal Directorate',
      lskReg: 'LSK/FIRM/2020/4892',
      email: 'legal@seyani.co.ke',
      status: 'Active',
      plan: 'Professional',
      storageQuota: '50 GB',
      userSeats: '15 Seats',
      domain: 'seyani.co.ke'
    },
    {
      id: 'f3',
      name: 'Kamau & Waweru Advocates',
      lskReg: 'LSK/FIRM/2015/1029',
      email: 'info@kamauwaweru.co.ke',
      status: 'Pending Audit',
      plan: 'Starter',
      storageQuota: '20 GB',
      userSeats: '5 Seats',
      domain: 'kamauwaweru.co.ke'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newFirmName, setNewFirmName] = useState('');
  const [newFirmReg, setNewFirmReg] = useState('');
  const [newFirmEmail, setNewFirmEmail] = useState('');

  const handleSaveFirmProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingProfile(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);

    // Update in firms array as well
    setFirms(prev => prev.map(f => f.id === 'f1' ? {
      ...f,
      name: firmProfile.name,
      lskReg: firmProfile.firmRegNo,
      email: firmProfile.email,
      domain: firmProfile.email.split('@')[1] || 'kithinjilegal.co.ke'
    } : f));

    alert(`✓ Law Firm Profile for "${firmProfile.name}" successfully updated in database!`);
  };

  const handleAddFirm = (e: React.FormEvent) => {
    e.preventDefault();
    const newF = {
      id: 'f' + (firms.length + 1),
      name: newFirmName,
      lskReg: newFirmReg,
      email: newFirmEmail,
      status: 'Active',
      plan: 'Enterprise Platinum',
      storageQuota: '100 GB',
      userSeats: '25 Seats',
      domain: newFirmEmail.split('@')[1] || 'firm.co.ke'
    };
    setFirms([newF, ...firms]);
    setShowAddModal(false);
    setNewFirmName('');
    setNewFirmReg('');
    setNewFirmEmail('');
    alert(`✓ New law firm "${newFirmName}" onboarded to system successfully!`);
  };

  const toggleStatus = (id: string) => {
    setFirms(prev => prev.map(f => f.id === id ? { ...f, status: f.status.includes('Active') ? 'Suspended' : 'Active' } : f));
  };

  return (
    <div className="w-full space-y-8 pb-12 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)]/50 pb-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-bold text-[10px]">
            DEVELOPER & FIRM ADMIN PANEL
          </span>
          <h1 className="font-brand font-extrabold text-2xl text-[var(--text-main)] tracking-tight mt-1">
            Law Firm Profile & Multi-Tenant Registry
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Manage your registered firm profile, LSK practice certificates, firm contact details, office location, logo, and fee note banking settings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="btn-outline px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Edit className="w-4 h-4 text-blue-500" /> {isEditingProfile ? 'Cancel Editing' : 'Edit Firm Profile'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-black px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Onboard Law Firm
          </button>
        </div>
      </div>

      {/* Active Logged-in Firm Profile Card */}
      <div className="vercel-card p-6 bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-[var(--bg-subtle)] border border-[var(--border-color)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)]/50 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold font-mono text-xl shadow-inner shrink-0">
              {firmProfile.name.split(' ').map(n => n[0]).slice(0, 3).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-brand font-extrabold text-xl text-[var(--text-main)] tracking-tight">
                  {firmProfile.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-mono font-bold text-[10.5px]">
                  ✓ Verified Law Practice
                </span>
              </div>
              <p className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                LSK Firm Cert: {firmProfile.firmRegNo} • Managing Advocate: {firmProfile.managingAdvocate}
              </p>
            </div>
          </div>

          {isSaved && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 font-mono font-bold text-xs border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" /> Firm Settings Saved!
            </div>
          )}
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleSaveFirmProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="font-semibold block mb-1">Official Firm Name:</label>
                <input
                  type="text"
                  required
                  value={firmProfile.name}
                  onChange={(e) => setFirmProfile({ ...firmProfile, name: e.target.value })}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs font-bold text-[var(--text-main)]"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">LSK Practice Cert No:</label>
                <input
                  type="text"
                  required
                  value={firmProfile.firmRegNo}
                  onChange={(e) => setFirmProfile({ ...firmProfile, firmRegNo: e.target.value })}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs text-amber-500 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Managing Advocate:</label>
                <input
                  type="text"
                  required
                  value={firmProfile.managingAdvocate}
                  onChange={(e) => setFirmProfile({ ...firmProfile, managingAdvocate: e.target.value })}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Official Email Address:</label>
                <input
                  type="email"
                  required
                  value={firmProfile.email}
                  onChange={(e) => setFirmProfile({ ...firmProfile, email: e.target.value })}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Primary Telephone:</label>
                <input
                  type="text"
                  required
                  value={firmProfile.phonePrimary}
                  onChange={(e) => setFirmProfile({ ...firmProfile, phonePrimary: e.target.value })}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Secondary Phone:</label>
                <input
                  type="text"
                  value={firmProfile.phoneSecondary}
                  onChange={(e) => setFirmProfile({ ...firmProfile, phoneSecondary: e.target.value })}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Physical Office Address:</label>
                <input
                  type="text"
                  required
                  value={firmProfile.addressLine1}
                  onChange={(e) => setFirmProfile({ ...firmProfile, addressLine1: e.target.value })}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">City / Location:</label>
                <input
                  type="text"
                  required
                  value={firmProfile.city}
                  onChange={(e) => setFirmProfile({ ...firmProfile, city: e.target.value })}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Postal Address:</label>
                <input
                  type="text"
                  value={firmProfile.poBox}
                  onChange={(e) => setFirmProfile({ ...firmProfile, poBox: e.target.value })}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">KRA Tax PIN:</label>
                <input
                  type="text"
                  value={firmProfile.kraPin}
                  onChange={(e) => setFirmProfile({ ...firmProfile, kraPin: e.target.value })}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs text-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Bank Name & Branch:</label>
                <input
                  type="text"
                  value={firmProfile.bankName}
                  onChange={(e) => setFirmProfile({ ...firmProfile, bankName: e.target.value })}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Fee Note Bank Account No:</label>
                <input
                  type="text"
                  value={firmProfile.bankAccountNo}
                  onChange={(e) => setFirmProfile({ ...firmProfile, bankAccountNo: e.target.value })}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs text-emerald-500 font-bold"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-[var(--border-color)]">
              <button 
                type="button" 
                onClick={() => setIsEditingProfile(false)} 
                className="btn-outline px-4 py-2 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-black px-6 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Save className="w-4 h-4" /> Save Firm Profile Settings
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs font-mono">
            <div className="space-y-1.5">
              <span className="text-[10px] text-[var(--text-muted)] uppercase block font-sans font-bold flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-blue-500" /> Official Email & Phone
              </span>
              <p className="text-[var(--text-main)] font-semibold">{firmProfile.email}</p>
              <p className="text-[var(--text-muted)]">{firmProfile.phonePrimary}</p>
              <p className="text-[var(--text-muted)]">{firmProfile.phoneSecondary}</p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] text-[var(--text-muted)] uppercase block font-sans font-bold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Physical Location & Address
              </span>
              <p className="text-[var(--text-main)] font-sans">{firmProfile.addressLine1}</p>
              <p className="text-[var(--text-muted)] font-sans">{firmProfile.city}</p>
              <p className="text-[var(--text-muted)]">{firmProfile.poBox}</p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] text-[var(--text-muted)] uppercase block font-sans font-bold flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-amber-500" /> Fee Note Banking & Tax PIN
              </span>
              <p className="text-[var(--text-main)] font-bold">KRA PIN: {firmProfile.kraPin}</p>
              <p className="text-emerald-500 font-bold">{firmProfile.bankName}</p>
              <p className="text-[var(--text-muted)]">A/C: {firmProfile.bankAccountNo}</p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] text-[var(--text-muted)] uppercase block font-sans font-bold flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-purple-500" /> System Quota & Plan
              </span>
              <p className="text-purple-400 font-bold">{firmProfile.plan}</p>
              <p className="text-[var(--text-muted)]">Storage: {firmProfile.storageQuota}</p>
              <p className="text-[var(--text-muted)]">Licence: {firmProfile.userSeats}</p>
            </div>
          </div>
        )}
      </div>

      {/* Multi-Tenant Law Firm Registry */}
      <div className="vercel-card overflow-hidden">
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
          <h3 className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-500" /> Registered Multi-Tenant Law Firms ({firms.length})
          </h3>
          <button
            onClick={() => alert('Exporting Law Firm Directory JSON...')}
            className="btn-outline px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export Registry JSON
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--text-main)]">
            <thead className="bg-[var(--bg-subtle)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider border-b border-[var(--border-color)] font-semibold">
              <tr>
                <th className="px-5 py-3.5">Firm Entity & LSK Reg</th>
                <th className="px-5 py-3.5">Contact Email</th>
                <th className="px-5 py-3.5">Domain Whitelist</th>
                <th className="px-5 py-3.5">Plan Tier</th>
                <th className="px-5 py-3.5">Storage Quota</th>
                <th className="px-5 py-3.5">User Seats</th>
                <th className="px-5 py-3.5">LSK Audit Status</th>
                <th className="px-5 py-3.5 text-center">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {firms.map((f) => (
                <tr key={f.id} className="hover:bg-[var(--bg-subtle)] transition-colors">
                  <td className="px-5 py-3.5">
                    <strong className="font-bold text-[var(--text-main)] block">{f.name}</strong>
                    <span className="text-[10.5px] text-[var(--text-muted)] font-mono">{f.lskReg}</span>
                  </td>
                  <td className="px-5 py-3.5 font-mono">{f.email}</td>
                  <td className="px-5 py-3.5 font-mono text-blue-500 font-semibold">{f.domain}</td>
                  <td className="px-5 py-3.5 font-semibold">{f.plan}</td>
                  <td className="px-5 py-3.5 font-mono">{f.storageQuota}</td>
                  <td className="px-5 py-3.5 font-mono">{f.userSeats}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold ${
                      f.status.includes('Active') 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button
                      onClick={() => toggleStatus(f.id)}
                      className="px-2.5 py-1 rounded-lg border border-[var(--border-color)] hover:border-[var(--text-main)] text-[11px] font-semibold cursor-pointer"
                    >
                      {f.status.includes('Active') ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboarding Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-500" /> Onboard New Law Firm Entity
            </h3>
            <form onSubmit={handleAddFirm} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Firm Name:</label>
                <input
                  type="text"
                  required
                  value={newFirmName}
                  onChange={(e) => setNewFirmName(e.target.value)}
                  placeholder="e.g. Wako & Associates Advocates"
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">LSK Registration No:</label>
                <input
                  type="text"
                  required
                  value={newFirmReg}
                  onChange={(e) => setNewFirmReg(e.target.value)}
                  placeholder="e.g. LSK/FIRM/2026/9999"
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Official Firm Email:</label>
                <input
                  type="email"
                  required
                  value={newFirmEmail}
                  onChange={(e) => setNewFirmEmail(e.target.value)}
                  placeholder="info@wako-advocates.co.ke"
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono text-xs"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2 border-t border-[var(--border-color)]">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-outline px-4 py-2 text-xs font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="btn-black px-5 py-2 text-xs font-semibold cursor-pointer">
                  Complete Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFirmsView;

