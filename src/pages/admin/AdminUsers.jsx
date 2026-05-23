import React, { useState } from 'react';
import { useMockData } from '../../context/MockDataContext';
import { Users, Plus, Trash2, ShieldAlert, CheckCircle2, UserCheck, ShieldCheck } from 'lucide-react';

export const AdminUsers = () => {
  const { users, currentUser, createAdmin, deleteAdmin } = useMockData();

  // Form input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Filter only admin/superadmin roles
  const adminUsers = users.filter(u => u.role === 'Admin' || u.role === 'Super Admin');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password) {
      setError('Harap lengkapi seluruh kolom input.');
      return;
    }

    const result = createAdmin(name, email, password);
    if (result.success) {
      setSuccess(`Staf baru ${name} berhasil didaftarkan sebagai Admin.`);
      setName('');
      setEmail('');
      setPassword('');
      setShowAddForm(false);
    } else {
      setError(result.message || 'Gagal mendaftarkan staf.');
    }
  };

  const handleDelete = (adminId, adminName) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus akses admin untuk ${adminName}?`)) {
      const result = deleteAdmin(adminId);
      if (result && !result.success) {
        alert(result.message);
      } else {
        alert(`Akses admin untuk ${adminName} berhasil dicabut.`);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Header and Toggle Add Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-500" />
          <div>
            <h3 className="font-extrabold text-sm text-slate-800">Kelola Pengguna & Staf Dinas</h3>
            <p className="text-[11px] text-slate-400 font-medium">Atur hak akses administrasi petugas Dispendukcapil Semarang</p>
          </div>
        </div>

        <button
          onClick={() => { setShowAddForm(!showAddForm); setError(''); setSuccess(''); }}
          className="self-start sm:self-auto bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Daftarkan Admin Baru
        </button>
      </div>

      {/* Add Admin Form Block */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4 animate-slide-down">
          <h4 className="font-extrabold text-xs text-slate-800 border-b border-slate-100 pb-2">Formulir Pendaftaran Staf Pelayanan</h4>
          
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <p className="font-semibold">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase font-bold text-slate-400">Nama Lengkap Staf *</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Siti Aminah"
                className="bg-slate-50 border border-slate-205 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-brand-500 focus:bg-white transition-colors"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase font-bold text-slate-400">Email Dinas Resmi *</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="e.g. siti@semarangkota.go.id"
                className="bg-slate-50 border border-slate-205 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-brand-500 focus:bg-white transition-colors"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase font-bold text-slate-400">Password Akses *</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
                className="bg-slate-50 border border-slate-205 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-brand-500 focus:bg-white transition-colors"
                required
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-205 text-slate-600 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="px-3.5 py-2 bg-brand-500 hover:bg-brand-650 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Simpan & Daftarkan
            </button>
          </div>
        </form>
      )}

      {/* Success Notification */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs px-4 py-3 rounded-xl flex items-center gap-2.5 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p className="font-semibold">{success}</p>
        </div>
      )}

      {/* Admins Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              <th className="py-4 px-6">Nama Petugas</th>
              <th className="py-4 px-4">Email Dinas</th>
              <th className="py-4 px-4">Role / Hak Akses</th>
              <th className="py-4 px-4">Terdaftar Sejak</th>
              <th className="py-4 px-6 text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {adminUsers.map(user => {
              const isSelf = user.id === currentUser.id;
              return (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-650 font-bold flex items-center justify-center text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <span>{user.name} {isSelf && <span className="text-[9px] text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-md font-bold">Saya</span>}</span>
                  </td>
                  <td className="py-4 px-4 text-slate-550 font-semibold">{user.email}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                      user.role === 'Super Admin' 
                        ? 'bg-brand-50 text-brand-700 border-brand-200' 
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {user.role === 'Super Admin' ? <ShieldCheck className="w-2.5 h-2.5" /> : <UserCheck className="w-2.5 h-2.5" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-400">
                    {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleDelete(user.id, user.name)}
                      disabled={isSelf}
                      className="p-1.5 bg-slate-50 border border-slate-150 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all disabled:opacity-30 cursor-pointer"
                      title={isSelf ? 'Tidak dapat menghapus diri sendiri' : 'Cabut Akses Staf'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};
