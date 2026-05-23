import React, { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { Tags, Plus, Trash2, ShieldAlert, CheckCircle2, Pencil, X } from 'lucide-react';

export const AdminCategories = () => {
  const { categories, addCategory, updateCategory, deleteCategory, hasPermission } = useAppData();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const canManage = hasPermission('category.manage');

  if (!canManage) {
    return (
      <div className="bg-rose-50 border border-rose-100 rounded-2xl p-8 text-center text-sm text-rose-700">
        Anda tidak memiliki izin <code className="font-mono text-xs">category.manage</code>.
      </div>
    );
  }

  const activeList = categories.filter((c) => c.is_active && !c.deleted_at);
  const inactiveList = categories.filter((c) => !c.is_active || c.deleted_at);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setCode('');
    setDescription('');
    setError('');
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setName(cat.name);
    setCode(cat.code);
    setDescription(cat.description || '');
    setError('');
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !code) {
      setError('Harap lengkapi nama dan kode kategori.');
      return;
    }

    const result = editing
      ? updateCategory(editing.id, { name, code, description })
      : addCategory(name, code, description);

    if (result.success) {
      setSuccess(editing ? `Kategori "${name}" diperbarui.` : `Kategori "${name}" ditambahkan.`);
      setShowForm(false);
      setEditing(null);
    } else {
      setError(result.message || 'Gagal menyimpan kategori.');
    }
  };

  const handleDeactivate = (id, catName) => {
    if (window.confirm(`Nonaktifkan kategori "${catName}"? (soft delete)`)) {
      deleteCategory(id);
      setSuccess(`Kategori "${catName}" dinonaktifkan.`);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Tags className="w-5 h-5 text-brand-500" />
          <div>
            <h3 className="font-extrabold text-sm text-slate-800">Manajemen Kategori Layanan</h3>
            <p className="text-[11px] text-slate-400 font-medium">CRUD kategori aduan — perubahan tercatat audit log</p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="self-start sm:self-auto bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Tambah Kategori
        </button>
      </div>

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

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4 animate-slide-down relative">
          <button type="button" onClick={() => setShowForm(false)} className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
          <h4 className="font-extrabold text-xs text-slate-800 border-b border-slate-100 pb-2 pr-8">
            {editing ? 'Edit Kategori' : 'Tambah Kategori Baru'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-[9px] uppercase font-bold text-slate-400">Nama *</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2" required />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-[9px] uppercase font-bold text-slate-400">Kode (max 3) *</span>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 3))}
                maxLength={3}
                className="border border-slate-200 rounded-lg px-3 py-2 uppercase"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-xs md:col-span-1">
              <span className="text-[9px] uppercase font-bold text-slate-400">Deskripsi</span>
              <input value={description} onChange={(e) => setDescription(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2" />
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg">
              Batal
            </button>
            <button type="submit" className="px-4 py-2 bg-brand-500 text-white text-xs font-bold rounded-lg">
              {editing ? 'Simpan Perubahan' : 'Simpan Kategori'}
            </button>
          </div>
        </form>
      )}

      <div>
        <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-3">Kategori Aktif ({activeList.length})</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeList.map((cat) => (
            <CategoryCard key={cat.id} cat={cat} onEdit={() => openEdit(cat)} onDelete={() => handleDeactivate(cat.id, cat.name)} />
          ))}
        </div>
      </div>

      {inactiveList.length > 0 && (
        <div>
          <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-3">Nonaktif / Terhapus ({inactiveList.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
            {inactiveList.map((cat) => (
              <CategoryCard key={cat.id} cat={cat} inactive />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CategoryCard = ({ cat, onEdit, onDelete, inactive }) => (
  <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col gap-2 shadow-xs">
    <div className="flex justify-between items-start gap-2">
      <span className="text-[8px] font-black bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md uppercase">
        {cat.code}
      </span>
      {!inactive && (
        <div className="flex gap-1">
          <button type="button" onClick={onEdit} className="p-1.5 rounded-lg border border-slate-150 text-slate-500 hover:bg-slate-50" title="Edit">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={onDelete} className="p-1.5 rounded-lg border border-slate-150 text-slate-400 hover:text-rose-600 hover:bg-rose-50" title="Nonaktifkan">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
    <h4 className="font-bold text-sm text-slate-800">{cat.name}</h4>
    {cat.description && <p className="text-[11px] text-slate-500 line-clamp-2">{cat.description}</p>}
    {inactive && <span className="text-[9px] font-bold text-rose-500 uppercase">Nonaktif</span>}
  </div>
);
