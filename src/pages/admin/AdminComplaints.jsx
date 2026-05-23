import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMockData } from '../../context/MockDataContext';
import { 
  Search, 
  Tag, 
  MapPin, 
  FileDown, 
  Filter, 
  ChevronRight, 
  Eye, 
  Trash2,
  AlertTriangle,
  ArrowRight,
  TrendingDown
} from 'lucide-react';

export const AdminComplaints = () => {
  const { complaints, categories } = useMockData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  // Filter complaints
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.user_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || c.category_id === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || c.priority === selectedPriority;
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status) => {
    const classes = {
      'Menunggu Verifikasi': 'bg-slate-100 text-slate-700 border-slate-200',
      'Diproses': 'bg-amber-50 text-amber-700 border-amber-200',
      'Selesai': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Ditolak': 'bg-rose-50 text-rose-700 border-rose-200'
    };
    return (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${classes[status] || classes['Menunggu Verifikasi']}`}>
        {status}
      </span>
    );
  };

  const getPriorityBadge = (p) => {
    const classes = {
      'Tinggi': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      'Sedang': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      'Rendah': 'bg-slate-500/10 text-slate-500 border-slate-500/20'
    };
    return (
      <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold border ${classes[p] || classes['Sedang']}`}>
        {p}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // CSV Spreadsheet Export Engine
  const handleExportCSV = () => {
    // CSV Header row
    const headers = ['Nomor Tiket', 'Nama Pelapor', 'Judul Aduan', 'Kategori', 'Status', 'Prioritas', 'Tanggal Masuk', 'Alamat/Lokasi'];
    
    // Rows mapping
    const rows = filteredComplaints.map(c => {
      const cat = categories.find(cat => cat.id === c.category_id);
      return [
        c.ticket_number,
        c.user_name,
        `"${c.title.replace(/"/g, '""')}"`,
        cat ? cat.name : c.category_id,
        c.status,
        c.priority,
        new Date(c.created_at).toLocaleDateString('id-ID'),
        `"${c.address.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    // File download trigger
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rekap-laporan-maturcapil-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-5 font-sans">
      
      {/* Search and Advanced Filters Control Area */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-brand-500" />
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">Filter Data Pengaduan</h3>
              <p className="text-[11px] text-slate-400 font-medium">Saring data aduan warga dengan parameter dinamis</p>
            </div>
          </div>
          
          <button
            onClick={handleExportCSV}
            className="self-start md:self-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <FileDown className="w-4.5 h-4.5" />
            Ekspor Rekap (CSV)
          </button>
        </div>

        {/* Filters Selectors Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-hidden focus:bg-white transition-all shadow-xs"
            />
          </div>

          {/* Category */}
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl px-3 py-2.5 text-xs text-slate-750 focus:outline-hidden focus:bg-white transition-all shadow-xs"
          >
            <option value="all">Semua Kategori</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Status */}
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl px-3 py-2.5 text-xs text-slate-750 focus:outline-hidden focus:bg-white transition-all shadow-xs"
          >
            <option value="all">Semua Status</option>
            <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
            <option value="Diproses">Diproses</option>
            <option value="Selesai">Selesai</option>
            <option value="Ditolak">Ditolak</option>
          </select>

          {/* Priority */}
          <select 
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl px-3 py-2.5 text-xs text-slate-750 focus:outline-hidden focus:bg-white transition-all shadow-xs"
          >
            <option value="all">Semua Prioritas</option>
            <option value="Tinggi">Tinggi</option>
            <option value="Sedang">Sedang</option>
            <option value="Rendah">Rendah</option>
          </select>
        </div>
      </div>

      {/* Complaints Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-4 px-6">Tiket</th>
                <th className="py-4 px-4">Nama Pelapor</th>
                <th className="py-4 px-4">Judul Aduan</th>
                <th className="py-4 px-4">Kategori</th>
                <th className="py-4 px-4 text-center">Prioritas</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-4">Tanggal</th>
                <th className="py-4 px-6 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Tidak ada data aduan yang cocok dengan filter aktif.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((comp) => {
                  const cat = categories.find(cat => cat.id === comp.category_id);
                  return (
                    <tr key={comp.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">{comp.ticket_number}</td>
                      <td className="py-4 px-4 font-semibold text-slate-800">{comp.user_name}</td>
                      <td className="py-4 px-4 max-w-xs truncate" title={comp.title}>{comp.title}</td>
                      <td className="py-4 px-4 font-medium text-slate-500">{cat ? cat.code : comp.category_id}</td>
                      <td className="py-4 px-4 text-center">{getPriorityBadge(comp.priority)}</td>
                      <td className="py-4 px-4 text-center">{getStatusBadge(comp.status)}</td>
                      <td className="py-4 px-4 text-slate-500 font-semibold">{formatDate(comp.created_at)}</td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => navigate(`/admin/complaints/${comp.id}`)}
                          className="inline-flex items-center gap-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Periksa
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Stats */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-150 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <span>Menampilkan {filteredComplaints.length} dari total {complaints.length} aduan</span>
          <span>Dispendukcapil Semarang</span>
        </div>
      </div>
    </div>
  );
};
