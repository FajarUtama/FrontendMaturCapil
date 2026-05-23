import React, { useState } from 'react';
import { useMockData } from '../../context/MockDataContext';
import { Tags, Plus, Trash2, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const AdminCategories = () => {
  const { categories, addCategory, deleteCategory } = useMockData();

  // Input states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !code) {
      setError('Harap lengkapi nama dan kode kategori.');
      return;
    }

    const result = addCategory(name, code);
    if (result.success) {
      setSuccess(`Kategori "${name}" [${code.toUpperCase()}] berhasil ditambahkan.`);
      setName('');
      setCode('');
      setShowAddForm(false);
    } else {
      setError('Gagal menambahkan kategori.');
    }
  };

  const handleDelete = (id, catName) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus kategori "${catName}"?`)) {
      deleteCategory(id);
      alert(`Kategori "${catName}" telah dihapus.`);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Header and Toggle Form */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Tags className="w-5 h-5 text-brand-500" />
          <div>
            <h3 className="font-extrabold text-sm text-slate-800">Kelola Kategori Layanan</h3>
            <p className="text-[11px] text-slate-400 font-medium">Atur jenis dokumen dan klasifikasi aduan masyarakat</p>
          </div>
        </div>

        <button
          onClick={() => { setShowAddForm(!showAddForm); setError(''); setSuccess(''); }}
          className="self-start sm:self-auto bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Tambah Kategori Baru
        </button>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4 animate-slide-down">
          <h4 className="font-extrabold text-xs text-slate-800 border-b border-slate-100 pb-2">Formulir Kategori Kependudukan</h4>
          
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <p className="font-semibold">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase font-bold text-slate-400">Nama Lengkap Kategori *</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Surat Keterangan Kematian"
                className="bg-slate-50 border border-slate-205 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-brand-500 focus:bg-white transition-colors"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase font-bold text-slate-400">Kode Unik Kategori (Maks 3 Karakter) *</label>
              <input 
                type="text" 
                value={code} 
                onChange={(e) => setCode(e.target.value)} 
                placeholder="e.g. MAT"
                maxLength={3}
                className="bg-slate-50 border border-slate-205 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-brand-500 focus:bg-white transition-colors uppercase"
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
              Simpan Kategori
            </button>
          </div>
        </form>
      )}

      {/* Success Banner */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs px-4 py-3 rounded-xl flex items-center gap-2.5 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p className="font-semibold">{success}</p>
        </div>
      )}

      {/* Categories Grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white border border-slate-200 hover:border-slate-350 p-4 rounded-2xl flex justify-between items-center shadow-xs transition-colors group">
            <div className="min-w-0 pr-3">
              <span className="inline-block text-[8px] font-black bg-slate-100 text-slate-550 border border-slate-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
                Kode: {cat.code}
              </span>
              <h4 className="font-bold text-xs text-slate-800 mt-1 truncate" title={cat.name}>{cat.name}</h4>
            </div>
            
            <button
              onClick={() => handleDelete(cat.id, cat.name)}
              className="p-1.5 bg-slate-50 border border-slate-150 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all opacity-70 group-hover:opacity-100 cursor-pointer"
              title="Hapus Kategori"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
