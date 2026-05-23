import React, { useState } from 'react';
import { useMockData } from '../../context/MockDataContext';
import { PermissionCheckboxGrid } from '../../components/admin/PermissionCheckboxGrid';
import { maskUserField } from '../../utils/masking';
import { STATUS_LABELS } from '../../constants/permissions';
import { DEFAULT_ADMIN_PERMISSIONS } from '../../constants/permissions';
import {
  Users,
  Plus,
  ShieldAlert,
  CheckCircle2,
  UserCheck,
  ShieldCheck,
  Eye,
  Pencil,
  KeyRound,
  UserX,
  ClipboardList,
  X,
} from 'lucide-react';

const emptyCitizen = { name: '', email: '', nik: '', password: '' };
const emptyAdmin = { name: '', email: '', nik: '', password: '', permissions: [...DEFAULT_ADMIN_PERMISSIONS] };

const StatusBadge = ({ status }) => {
  const colors = {
    ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    INACTIVE: 'bg-slate-100 text-slate-600 border-slate-200',
    SUSPENDED: 'bg-rose-50 text-rose-700 border-rose-200',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border ${colors[status] || colors.INACTIVE}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
};

export const AdminUsers = () => {
  const {
    users,
    currentUser,
    hasPermission,
    isSuperAdmin,
    createCitizen,
    createAdmin,
    updateUser,
    deactivateUser,
    resetUserPassword,
    updateAdminPermissions,
    getUserComplaints,
  } = useMockData();

  const [tab, setTab] = useState('citizen');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyCitizen);
  const [resetPwd, setResetPwd] = useState('');
  const [forceReset, setForceReset] = useState(false);

  const superAdmin = isSuperAdmin();
  const canView = hasPermission('user.view');
  const canCreate = hasPermission('user.create');
  const canUpdate = hasPermission('user.update');
  const canDelete = hasPermission('user.delete');

  if (!canView) {
    return (
      <div className="bg-rose-50 border border-rose-100 rounded-2xl p-8 text-center text-sm text-rose-700">
        Anda tidak memiliki izin <code className="font-mono text-xs">user.view</code> untuk mengakses halaman ini.
      </div>
    );
  }

  const citizenUsers = users.filter((u) => u.role === 'Masyarakat' && !u.deleted_at);
  const adminUsers = users.filter((u) => (u.role === 'Admin' || u.role === 'Super Admin') && !u.deleted_at);

  const list = tab === 'citizen' ? citizenUsers : adminUsers;
  const filtered = list.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.nik && u.nik.includes(search))
  );

  const openCreate = () => {
    setError('');
    setForm(tab === 'citizen' ? { ...emptyCitizen } : { ...emptyAdmin });
    setModal('create');
  };

  const openEdit = (user) => {
    setError('');
    setForm({
      id: user.id,
      name: user.name,
      email: user.email,
      nik: user.nik || '',
      status: user.status,
      permissions: user.permissions || [...DEFAULT_ADMIN_PERMISSIONS],
    });
    setModal('edit');
  };

  const openDetail = (user) => {
    setForm({ ...user });
    setModal('detail');
  };

  const openPermissions = (user) => {
    setForm({ id: user.id, name: user.name, permissions: [...(user.permissions || DEFAULT_ADMIN_PERMISSIONS)] });
    setModal('permissions');
  };

  const openReset = (user) => {
    setResetPwd('');
    setForceReset(false);
    setForm({ id: user.id, name: user.name });
    setModal('reset');
  };

  const handleCreate = (e) => {
    e.preventDefault();
    setError('');
    const result =
      tab === 'citizen'
        ? createCitizen(form)
        : createAdmin(form.name, form.email, form.password, form.permissions, form.nik);
    if (result.success) {
      setSuccess(tab === 'citizen' ? 'Warga berhasil ditambahkan.' : 'Admin berhasil ditambahkan.');
      setModal(null);
    } else {
      setError(result.message);
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    setError('');
    const result = updateUser(form.id, {
      name: form.name,
      email: form.email,
      nik: form.nik,
      status: form.status,
    });
    if (result.success) {
      setSuccess('Data user berhasil diperbarui.');
      setModal(null);
    } else {
      setError(result.message);
    }
  };

  const handlePermissions = (e) => {
    e.preventDefault();
    const result = updateAdminPermissions(form.id, form.permissions);
    if (result.success) {
      setSuccess('Hak akses admin berhasil diperbarui.');
      setModal(null);
    } else {
      setError(result.message);
    }
  };

  const handleReset = (e) => {
    e.preventDefault();
    const result = resetUserPassword(form.id, resetPwd, forceReset);
    if (result.success) {
      setSuccess('Password berhasil direset. Notifikasi email terkirim (simulasi).');
      setModal(null);
    } else {
      setError(result.message);
    }
  };

  const handleDeactivate = (user) => {
    if (!window.confirm(`Nonaktifkan akun ${user.name}?`)) return;
    const result = deactivateUser(user.id);
    if (result.success) setSuccess(`Akun ${user.name} dinonaktifkan.`);
    else setError(result.message);
  };

  const detailComplaints = modal === 'detail' && form.id ? getUserComplaints(form.id) : [];

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-500" />
          <div>
            <h3 className="font-extrabold text-sm text-slate-800">Manajemen User</h3>
            <p className="text-[11px] text-slate-400 font-medium">CRUD warga & admin, RBAC, reset password</p>
          </div>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={openCreate}
            className="self-start sm:self-auto bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Tambah {tab === 'citizen' ? 'Warga' : 'Admin'}
          </button>
        )}
      </div>

      <div className="flex gap-2 border-b border-slate-100 pb-1">
        {['citizen', 'admin'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-t-lg text-xs font-bold transition-colors ${
              tab === t ? 'bg-white border border-b-0 border-slate-200 text-brand-700' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t === 'citizen' ? 'Masyarakat' : 'Admin & Staf'}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Cari nama, email, atau NIK..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-hidden focus:border-brand-500"
      />

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          {success}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="md:hidden divide-y divide-slate-100">
          {filtered.map((user) => (
            <UserRowMobile
              key={user.id}
              user={user}
              superAdmin={superAdmin}
              currentUser={currentUser}
              canUpdate={canUpdate}
              canDelete={canDelete}
              onDetail={() => openDetail(user)}
              onEdit={() => openEdit(user)}
              onReset={() => openReset(user)}
              onPermissions={() => openPermissions(user)}
              onDeactivate={() => handleDeactivate(user)}
              isAdminTab={tab === 'admin'}
            />
          ))}
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-4 px-6">Nama</th>
                <th className="py-4 px-4">Email</th>
                <th className="py-4 px-4">NIK</th>
                <th className="py-4 px-4">Status</th>
                {tab === 'admin' && <th className="py-4 px-4">Role</th>}
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map((user) => (
                <UserRowDesktop
                  key={user.id}
                  user={user}
                  superAdmin={superAdmin}
                  currentUser={currentUser}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                  onDetail={() => openDetail(user)}
                  onEdit={() => openEdit(user)}
                  onReset={() => openReset(user)}
                  onPermissions={() => openPermissions(user)}
                  onDeactivate={() => handleDeactivate(user)}
                  isAdminTab={tab === 'admin'}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal onClose={() => { setModal(null); setError(''); }}>
          {modal === 'create' && (
            <UserForm
              title={tab === 'citizen' ? 'Tambah Warga' : 'Tambah Admin'}
              form={form}
              setForm={setForm}
              onSubmit={handleCreate}
              showPassword
              showPermissions={tab === 'admin'}
              isSuperAdmin={superAdmin}
            />
          )}
          {modal === 'edit' && (
            <UserForm
              title="Edit User"
              form={form}
              setForm={setForm}
              onSubmit={handleEdit}
              showStatus
              isSuperAdmin={superAdmin}
            />
          )}
          {modal === 'permissions' && superAdmin && (
            <form onSubmit={handlePermissions} className="flex flex-col gap-4">
              <h4 className="font-bold text-sm">Hak Akses — {form.name}</h4>
              <PermissionCheckboxGrid
                selected={form.permissions}
                onChange={(p) => setForm({ ...form, permissions: p })}
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setModal(null)} className="px-3 py-2 text-xs font-bold text-slate-600">Batal</button>
                <button type="submit" className="px-4 py-2 bg-brand-500 text-white text-xs font-bold rounded-lg">Simpan Permission</button>
              </div>
            </form>
          )}
          {modal === 'reset' && (
            <form onSubmit={handleReset} className="flex flex-col gap-4">
              <h4 className="font-bold text-sm">Reset Password — {form.name}</h4>
              <input
                type="password"
                value={resetPwd}
                onChange={(e) => setResetPwd(e.target.value)}
                placeholder="Password baru (min 8, 1 angka, 1 huruf besar)"
                className="border border-slate-200 rounded-lg px-3 py-2 text-xs w-full"
                required
              />
              <label className="flex items-center gap-2 text-xs text-slate-600">
                <input type="checkbox" checked={forceReset} onChange={(e) => setForceReset(e.target.checked)} />
                Force reset (wajib ganti saat login berikutnya)
              </label>
              <p className="text-[10px] text-slate-400">Aksi ini tercatat di audit log & notifikasi email (simulasi).</p>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setModal(null)} className="px-3 py-2 text-xs font-bold text-slate-600">Batal</button>
                <button type="submit" className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5" /> Reset
                </button>
              </div>
            </form>
          )}
          {modal === 'detail' && (
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-sm">Detail User — {form.name}</h4>
              <dl className="grid grid-cols-2 gap-2 text-xs">
                <dt className="text-slate-400">Email</dt>
                <dd className="font-semibold">{maskUserField(form.email, 'email', superAdmin)}</dd>
                <dt className="text-slate-400">NIK</dt>
                <dd className="font-semibold font-mono">{maskUserField(form.nik, 'nik', superAdmin) || '—'}</dd>
                <dt className="text-slate-400">Status</dt>
                <dd><StatusBadge status={form.status} /></dd>
                <dt className="text-slate-400">Email Verified</dt>
                <dd>{form.email_verified ? 'Ya' : 'Belum'}</dd>
              </dl>
              <div>
                <h5 className="text-[10px] font-bold uppercase text-slate-400 mb-2 flex items-center gap-1">
                  <ClipboardList className="w-3.5 h-3.5" /> Riwayat Laporan ({detailComplaints.length})
                </h5>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {detailComplaints.length === 0 ? (
                    <p className="text-xs text-slate-400">Belum ada laporan.</p>
                  ) : (
                    detailComplaints.map((c) => (
                      <div key={c.id} className="text-xs bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                        <span className="font-bold">{c.ticket_number}</span> — {c.title}
                        <span className="text-slate-400 ml-2">({c.status})</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 relative">
      <button type="button" onClick={onClose} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-slate-100 text-slate-400">
        <X className="w-5 h-5" />
      </button>
      {children}
    </div>
  </div>
);

const UserForm = ({ title, form, setForm, onSubmit, showPassword, showPermissions, showStatus, isSuperAdmin }) => (
  <form onSubmit={onSubmit} className="flex flex-col gap-3 mt-2">
    <h4 className="font-bold text-sm pr-8">{title}</h4>
    <Field label="Nama" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
    <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
    <Field label="NIK (16 digit)" value={form.nik} onChange={(v) => setForm({ ...form, nik: v.replace(/\D/g, '').slice(0, 16) })} />
    {showPassword && (
      <Field label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} required />
    )}
    {showStatus && (
      <label className="flex flex-col gap-1 text-xs">
        <span className="text-[9px] uppercase font-bold text-slate-400">Status</span>
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="border border-slate-200 rounded-lg px-3 py-2">
          <option value="ACTIVE">Aktif</option>
          <option value="INACTIVE">Nonaktif</option>
          <option value="SUSPENDED">Ditangguhkan</option>
        </select>
      </label>
    )}
    {showPermissions && (
      <PermissionCheckboxGrid selected={form.permissions} onChange={(p) => setForm({ ...form, permissions: p })} />
    )}
    {!isSuperAdmin && (form.email || form.nik) && (
      <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
        Data sensitif (email/NIK) ditampilkan tersensor untuk admin biasa.
      </p>
    )}
    <div className="flex justify-end gap-2 pt-2">
      <button type="submit" className="px-4 py-2 bg-brand-500 text-white text-xs font-bold rounded-lg">Simpan</button>
    </div>
  </form>
);

const Field = ({ label, value, onChange, type = 'text', required }) => (
  <label className="flex flex-col gap-1 text-xs">
    <span className="text-[9px] uppercase font-bold text-slate-400">{label}</span>
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="border border-slate-200 rounded-lg px-3 py-2 focus:outline-hidden focus:border-brand-500"
    />
  </label>
);

const ActionButtons = ({ user, currentUser, canUpdate, canDelete, superAdmin, isAdminTab, onDetail, onEdit, onReset, onPermissions, onDeactivate }) => {
  const isSelf = user.id === currentUser?.id;
  const isSuper = user.role === 'Super Admin';
  return (
    <div className="flex items-center gap-1 justify-end flex-wrap">
      <IconBtn icon={Eye} title="Detail" onClick={onDetail} />
      {canUpdate && !isSuper && <IconBtn icon={Pencil} title="Edit" onClick={onEdit} />}
      {canUpdate && <IconBtn icon={KeyRound} title="Reset Password" onClick={onReset} />}
      {isAdminTab && superAdmin && user.role === 'Admin' && (
        <IconBtn icon={ShieldCheck} title="Kelola Permission" onClick={onPermissions} />
      )}
      {canDelete && !isSelf && !isSuper && (
        <IconBtn icon={UserX} title="Nonaktifkan" onClick={onDeactivate} danger />
      )}
    </div>
  );
};

const IconBtn = ({ icon: Icon, title, onClick, danger }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`p-1.5 rounded-lg border transition-colors ${
      danger
        ? 'border-slate-150 text-slate-400 hover:text-rose-600 hover:bg-rose-50'
        : 'border-slate-150 text-slate-500 hover:bg-slate-100'
    }`}
  >
    <Icon className="w-4 h-4" />
  </button>
);

const UserRowDesktop = ({ user, superAdmin, ...props }) => (
  <tr className="hover:bg-slate-50/50">
    <td className="py-4 px-6 font-bold text-slate-900">{user.name}</td>
    <td className="py-4 px-4">{maskUserField(user.email, 'email', superAdmin)}</td>
    <td className="py-4 px-4 font-mono">{maskUserField(user.nik, 'nik', superAdmin) || '—'}</td>
    <td className="py-4 px-4"><StatusBadge status={user.status} /></td>
    {props.isAdminTab && (
      <td className="py-4 px-4">
        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
          {user.role === 'Super Admin' ? <ShieldCheck className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
          {user.role}
        </span>
      </td>
    )}
    <td className="py-4 px-6"><ActionButtons user={user} superAdmin={superAdmin} {...props} /></td>
  </tr>
);

const UserRowMobile = ({ user, superAdmin, ...props }) => (
  <div className="p-4 flex flex-col gap-2">
    <div className="flex justify-between items-start">
      <div>
        <p className="font-bold text-sm text-slate-800">{user.name}</p>
        <p className="text-xs text-slate-500">{maskUserField(user.email, 'email', superAdmin)}</p>
      </div>
      <StatusBadge status={user.status} />
    </div>
    <ActionButtons user={user} superAdmin={superAdmin} {...props} />
  </div>
);
