import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockData } from '../../context/MockDataContext';
import { User, LogOut, Phone, ShieldCheck, MapPin, ExternalLink, BookOpen, AlertCircle } from 'lucide-react';

export const CitizenProfile = () => {
  const { currentUser, logout, complaints } = useMockData();
  const navigate = useNavigate();

  // Redirect to login if not logged in
  React.useEffect(() => {
    if (!currentUser) {
      navigate('/maturcapil/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  // Filter complaints
  const userComplaints = complaints.filter(c => c.user_id === currentUser.id);
  const total = userComplaints.length;
  const selesai = userComplaints.filter(c => c.status === 'Selesai').length;
  const proses = userComplaints.filter(c => c.status === 'Diproses').length;
  const pending = userComplaints.filter(c => c.status === 'Menunggu Verifikasi').length;

  const handleLogout = () => {
    logout();
    navigate('/maturcapil');
  };

  return (
    <div className="p-4 flex flex-col gap-5 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <User className="w-5 h-5 text-brand-500" />
        <div>
          <h2 className="font-extrabold text-base text-slate-800">Profil Saya</h2>
          <p className="text-[10px] text-slate-400 font-medium">Informasi akun dan riwayat aktivitas Anda</p>
        </div>
      </div>

      {/* User Card */}
      <div className="bg-white border border-slate-200/85 rounded-2xl p-5 shadow-xs flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-brand-500 text-white font-extrabold text-2xl flex items-center justify-center border-4 border-brand-50 shadow-inner">
          {currentUser.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h3 className="font-extrabold text-sm text-slate-800">{currentUser.name}</h3>
          <p className="text-xs text-slate-400 font-medium truncate">{currentUser.email}</p>
          <span className="inline-flex mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            Warga Kota Semarang
          </span>
        </div>
      </div>

      {/* Summary Grid Stats */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <h4 className="font-extrabold text-xs text-slate-700 mb-3 uppercase tracking-wider text-[10px]">Statistik Pengaduan Anda</h4>
        
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
            <h5 className="font-extrabold text-sm text-slate-800">{total}</h5>
            <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Total</p>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
            <h5 className="font-extrabold text-sm text-slate-800">{pending}</h5>
            <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Verifikasi</p>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
            <h5 className="font-extrabold text-sm text-slate-800">{proses}</h5>
            <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Proses</p>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
            <h5 className="font-extrabold text-sm text-emerald-600">{selesai}</h5>
            <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Selesai</p>
          </div>
        </div>
      </div>

      {/* Administrative Support list */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col">
        <div className="bg-slate-50 border-b border-slate-100 px-4 py-2.5">
          <h4 className="font-bold text-[10px] text-slate-500 uppercase tracking-wider">Kontak & Layanan Darurat</h4>
        </div>
        
        <div className="flex flex-col text-xs text-slate-600">
          <a 
            href="tel:112" 
            className="flex items-center justify-between p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Phone className="w-4.5 h-4.5 text-brand-500" />
              <div>
                <span className="font-bold block text-slate-850">Call Center Semarang (112)</span>
                <span className="text-[10px] text-slate-450 mt-0.5">Layanan darurat bebas pulsa pemprov</span>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>

          <a 
            href="https://maps.google.com/?q=Dispendukcapil+Kota+Semarang" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center justify-between p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-4.5 h-4.5 text-brand-500" />
              <div>
                <span className="font-bold block text-slate-850">Kantor Dispendukcapil Semarang</span>
                <span className="text-[10px] text-slate-450 mt-0.5">Jl. Kanguru Raya No.3, Gayamsari</span>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>

          <button 
            type="button"
            onClick={() => alert('Sistem LaporCapil mendukung file gambar JPG/PNG (maks 5MB) dan secara otomatis mengompresnya saat pengiriman untuk kecepatan loading.')}
            className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-4.5 h-4.5 text-brand-500" />
              <div>
                <span className="font-bold block text-slate-850">Petunjuk Penggunaan Aplikasi</span>
                <span className="text-[10px] text-slate-450 mt-0.5">Pelajari syarat dan ketentuan kompresi berkas</span>
              </div>
            </div>
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleLogout}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        Keluar Dari Akun
      </button>
    </div>
  );
};
