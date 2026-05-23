import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import { History, FileText, ChevronRight, MessageSquare, Plus, Clock, RefreshCw, CheckCircle2, AlertOctagon } from 'lucide-react';

export const CitizenHistory = () => {
  const { complaints, currentUser } = useAppData();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('all');

  // Filter complaints belonging to current user
  const userComplaints = complaints.filter(c => c.user_id === currentUser?.id);

  const filteredComplaints = userComplaints.filter(c => {
    if (filterStatus === 'all') return true;
    return c.status === filterStatus;
  });

  const getStatusBadge = (status) => {
    const classes = {
      'Menunggu Verifikasi': 'bg-slate-100 text-slate-700 border-slate-200/50',
      'Diproses': 'bg-amber-50 text-amber-700 border-amber-200/50',
      'Selesai': 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
      'Ditolak': 'bg-rose-50 text-rose-700 border-rose-200/50'
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${classes[status] || classes['Menunggu Verifikasi']}`}>
        {status}
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

  return (
    <div className="p-4 flex flex-col gap-4 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-brand-500" />
          <div>
            <h2 className="font-extrabold text-base text-slate-800">Aduan Saya</h2>
            <p className="text-[10px] text-slate-400 font-medium">Daftar keluhan yang telah Anda ajukan</p>
          </div>
        </div>
        
        {/* Floating Plus Button for quickly creating a report */}
        <button 
          onClick={() => navigate('/maturcapil/create')}
          className="p-1.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 active:scale-95 transition-all shadow-xs"
          title="Buat Aduan Baru"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-150 p-0.5 bg-slate-100 rounded-xl">
        {['all', 'Menunggu Verifikasi', 'Diproses', 'Selesai'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${
              filterStatus === status 
                ? 'bg-white text-slate-800 shadow-xs' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {status === 'all' ? 'Semua' : status.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Complaint List */}
      <div className="flex flex-col gap-3 mt-1.5">
        {filteredComplaints.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-slate-400 shadow-xs">
            <FileText className="w-10 h-10 mx-auto opacity-30 mb-2" />
            <p className="text-xs font-semibold">Belum ada aduan pada kategori ini</p>
            <button
              onClick={() => navigate('/maturcapil/create')}
              className="mt-3 bg-brand-50 px-4 py-1.5 rounded-lg text-[10px] text-brand-600 font-bold hover:bg-brand-100 transition-colors"
            >
              Ajukan Aduan Sekarang
            </button>
          </div>
        ) : (
          filteredComplaints.map(comp => (
            <div 
              key={comp.id}
              onClick={() => navigate(`/maturcapil/report/${comp.id}`)}
              className="bg-white border border-slate-150/70 hover:border-slate-350 rounded-2xl p-4 flex justify-between items-center gap-3 cursor-pointer shadow-xs hover:shadow-md transition-all active:scale-[0.99]"
            >
              <div className="min-w-0 flex-grow">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] text-slate-400 font-bold">{comp.ticket_number}</span>
                  {getStatusBadge(comp.status)}
                </div>
                <h3 className="font-bold text-xs text-slate-800 truncate mt-1">{comp.title}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Diajukan pada {formatDate(comp.created_at)}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="p-1.5 bg-slate-50 border border-slate-100 rounded-full text-slate-400 hover:text-brand-500">
                  <MessageSquare className="w-4 h-4" />
                </span>
                <ChevronRight className="w-4.5 h-4.5 text-slate-400" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
