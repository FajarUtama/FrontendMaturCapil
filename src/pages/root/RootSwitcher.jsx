import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck, ArrowRight, Smartphone, Laptop } from 'lucide-react';

export const RootSwitcher = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans text-slate-200">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      {/* Hero Header */}
      <div className="text-center mb-12 relative z-10 max-w-xl">
        <span className="text-6xl animate-bounce" style={{ animationDuration: '4s' }}>🏛️</span>
        <h1 className="text-3xl md:text-4xl font-black text-white mt-4 tracking-tight leading-none">
          MaturCapil <span className="text-brand-500 font-medium">Semarang</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-2.5 max-w-md mx-auto leading-relaxed">
          Sistem Pengaduan Masyarakat Terpadu Dinas Kependudukan dan Pencatatan Sipil Kota Semarang. Silakan pilih portal layanan di bawah ini.
        </p>
      </div>

      {/* Gateway Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl relative z-10">
        
        {/* Citizen Portal (Masyarakat) Card */}
        <div 
          onClick={() => navigate('/maturcapil')}
          className="bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-brand-500/50 rounded-3xl p-8 flex flex-col gap-6 cursor-pointer shadow-xl hover:shadow-brand-500/5 group transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-brand-500/10 border border-brand-500/20 rounded-2xl flex items-center justify-center text-brand-500">
              <Smartphone className="w-6 h-6" />
            </div>
            <span className="text-[10px] bg-brand-500/10 border border-brand-500/20 text-brand-500 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Mobile-First
            </span>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white group-hover:text-brand-500 transition-colors">Portal Warga (Masyarakat)</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Ajukan aduan, lacak status berkas adminduk secara real-time, cetak bukti lapor, dan chat interaktif dengan admin dinas.
            </p>
          </div>

          <div className="border-t border-slate-800/80 pt-4 text-xs text-slate-500 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Pembuatan & tracking aduan online</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Bukti cetak pdf surat pengajuan</span>
            </div>
          </div>

          <span className="mt-auto text-xs font-bold text-slate-400 group-hover:text-white flex items-center gap-1 transition-all">
            Masuk Portal Warga
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>

        {/* Government Portal (Admin) Card */}
        <div 
          onClick={() => navigate('/admin')}
          className="bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 rounded-3xl p-8 flex flex-col gap-6 cursor-pointer shadow-xl hover:shadow-blue-500/5 group transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500">
              <Laptop className="w-6 h-6" />
            </div>
            <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-550 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Desktop-First
            </span>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white group-hover:text-blue-500 transition-colors">Dashboard Monitor (Pemerintah)</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Verifikasi berkas aduan, kelola admin dinas, update status tindakan, cetak lembar dinas resmi, dan analisa grafik statistik laporan.
            </p>
          </div>

          <div className="border-t border-slate-800/80 pt-4 text-xs text-slate-500 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-500" />
              <span>Verifikasi, tolak, & selesaikan laporan</span>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-500" />
              <span>Role-based UI: Admin & Super Admin</span>
            </div>
          </div>

          <span className="mt-auto text-xs font-bold text-slate-400 group-hover:text-white flex items-center gap-1 transition-all">
            Masuk Dashboard Dinas
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-16 text-center text-[10px] text-slate-550 font-bold uppercase tracking-widest relative z-10">
        <p>© 2026 Dispendukcapil Pemerintah Kota Semarang. All Rights Reserved.</p>
      </div>
    </div>
  );
};
