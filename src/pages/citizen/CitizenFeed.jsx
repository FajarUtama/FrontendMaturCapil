import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockData } from '../../context/MockDataContext';
import { Search, MapPin, Eye, Calendar, Tag, CheckCircle2, RefreshCw, ClipboardList, Clock } from 'lucide-react';

export const CitizenFeed = () => {
  const { complaints, categories } = useMockData();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Stats computation
  const totalReports = complaints.length;
  const processedReports = complaints.filter(c => c.status === 'Diproses').length;
  const resolvedReports = complaints.filter(c => c.status === 'Selesai').length;

  // Filter complaints
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || c.category_id === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Anonymize Name (e.g. Budi Santoso -> B**i S**t**o)
  const anonymizeName = (name) => {
    if (!name) return 'Anonim';
    const parts = name.split(' ');
    return parts.map(p => {
      if (p.length <= 2) return p;
      return p.charAt(0) + '*'.repeat(p.length - 2) + p.charAt(p.length - 1);
    }).join(' ');
  };

  const getStatusBadge = (status) => {
    const classes = {
      'Menunggu Verifikasi': 'bg-slate-100 text-slate-700 border-slate-200/50',
      'Diproses': 'bg-amber-50 text-amber-700 border-amber-200/50',
      'Selesai': 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
      'Ditolak': 'bg-rose-50 text-rose-700 border-rose-200/50'
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${classes[status] || classes['Menunggu Verifikasi']}`}>
        {status === 'Selesai' && <CheckCircle2 className="w-3 h-3" />}
        {status === 'Diproses' && <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} />}
        {status === 'Menunggu Verifikasi' && <Clock className="w-3 h-3" />}
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-5 md:gap-6 animate-fade-in">
      
      {/* Hero Section */}
      <div className="bg-linear-to-tr from-brand-700 to-brand-500 rounded-2xl p-5 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10 text-9xl select-none pointer-events-none">
          🏛️
        </div>
        <span className="text-[10px] uppercase font-extrabold tracking-widest bg-white/20 px-2 py-0.5 rounded-md">
          Portal Pelayanan
        </span>
        <h2 className="text-xl md:text-3xl font-bold mt-2 leading-tight">Matur, Dispendukcapil Semarang!</h2>
        <p className="text-xs md:text-sm text-brand-50/80 mt-1 max-w-xl">
          Sampaikan aduan Anda mengenai administrasi kependudukan di Semarang secara langsung, cepat, dan transparan.
        </p>
        <button 
          onClick={() => navigate('/maturcapil/create')}
          className="mt-4 md:mt-6 bg-white text-brand-700 font-bold text-xs md:text-sm px-4 py-2 md:px-5 md:py-2.5 rounded-xl shadow-md hover:bg-slate-50 active:scale-95 transition-all"
        >
          Buat Laporan Baru
        </button>
      </div>

      {/* Mini Stats Grid */}
      <div className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-white p-3 rounded-2xl border border-slate-100 text-center shadow-xs">
          <ClipboardList className="w-5 h-5 mx-auto text-slate-500" />
          <h5 className="font-extrabold text-lg text-slate-800 mt-1">{totalReports}</h5>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Aduan</p>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-100 text-center shadow-xs">
          <RefreshCw className="w-5 h-5 mx-auto text-amber-500" />
          <h5 className="font-extrabold text-lg text-slate-800 mt-1">{processedReports}</h5>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Diproses</p>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-100 text-center shadow-xs">
          <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-500" />
          <h5 className="font-extrabold text-lg text-slate-800 mt-1">{resolvedReports}</h5>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Selesai</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari laporan (e.g. KTP, KK, TKT-xxxx)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200/80 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-hidden focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-all shadow-xs"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0 scrollbar-none">
          <button 
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-colors ${
              selectedCategory === 'all' 
                ? 'bg-slate-800 text-white' 
                : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Semua Kategori
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-colors ${
                selectedCategory === cat.id 
                  ? 'bg-slate-800 text-white' 
                  : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat.code}
            </button>
          ))}
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap gap-1.5 md:gap-2">
          {['all', 'Menunggu Verifikasi', 'Diproses', 'Selesai'].map(status => (
            <button 
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition-colors ${
                selectedStatus === status 
                  ? 'bg-brand-50 border-brand-200 text-brand-700' 
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {status === 'all' ? 'Semua Status' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints Feed List */}
      <div className="flex flex-col gap-4 md:gap-5">
        <h4 className="font-bold text-xs md:text-sm text-slate-400 uppercase tracking-widest">Aduan Publik Terkini</h4>
        
        <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-5">
        {filteredComplaints.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-slate-400 shadow-xs">
            <ClipboardList className="w-10 h-10 mx-auto opacity-30 mb-2" />
            <p className="text-xs font-medium">Tidak ada laporan yang cocok</p>
          </div>
        ) : (
          filteredComplaints.map(comp => (
            <div 
              key={comp.id} 
              onClick={() => navigate(`/maturcapil/report/${comp.id}`)}
              className="bg-white border border-slate-200/60 hover:border-slate-300 rounded-2xl p-4 flex flex-col gap-3 shadow-xs hover:shadow-md cursor-pointer transition-all active:scale-[0.99]"
            >
              {/* Header Info */}
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold tracking-tight">{comp.ticket_number}</span>
                  <h3 className="font-bold text-xs text-slate-800 line-clamp-1 mt-0.5">{comp.title}</h3>
                </div>
                {getStatusBadge(comp.status)}
              </div>

              {/* Description */}
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {comp.description}
              </p>

              {/* Before/After Evidence (If Resolved) */}
              {comp.status === 'Selesai' && comp.photos.length > 0 && comp.evidence_after_photos.length > 0 && (
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <div className="relative">
                    <img 
                      src={comp.photos[0]} 
                      alt="Sebelum" 
                      className="w-full h-20 object-cover rounded-lg border border-slate-200"
                    />
                    <span className="absolute bottom-1 left-1 text-[8px] bg-slate-900/75 text-white font-bold px-1.5 py-0.5 rounded-sm uppercase">Sebelum</span>
                  </div>
                  <div className="relative">
                    <img 
                      src={comp.evidence_after_photos[0]} 
                      alt="Sesudah" 
                      className="w-full h-20 object-cover rounded-lg border border-slate-200"
                    />
                    <span className="absolute bottom-1 left-1 text-[8px] bg-emerald-700/85 text-white font-bold px-1.5 py-0.5 rounded-sm uppercase">Selesai</span>
                  </div>
                </div>
              )}

              {/* Just One Photo if not resolved */}
              {comp.status !== 'Selesai' && comp.photos.length > 0 && (
                <img 
                  src={comp.photos[0]} 
                  alt="Aduan Bukti" 
                  className="w-full h-32 object-cover rounded-xl border border-slate-200"
                />
              )}

              {/* Footer Info */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[10px] text-slate-400 font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[9px]">
                    {comp.user_name.charAt(0)}
                  </span>
                  <span>{anonymizeName(comp.user_name)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="max-w-[120px] truncate">{comp.address.split(',')[0]}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDate(comp.created_at).split(',')[0]}</span>
                </div>
              </div>
            </div>
          ))
        )}
        </div>
      </div>
    </div>
  );
};
