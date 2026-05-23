import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockData } from '../../context/MockDataContext';
import { Lock, Mail, ShieldAlert, ArrowRight, ShieldCheck } from 'lucide-react';

export const AdminLogin = () => {
  const { login, currentUser } = useMockData();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in as admin, redirect to admin dashboard
  React.useEffect(() => {
    if (currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Super Admin')) {
      navigate('/admin/dashboard');
    }
  }, [currentUser, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Harap isi semua bidang input.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = login(email, password, 'admin');
      setIsLoading(false);

      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setError(result.message);
      }
    }, 600);
  };

  // Direct login credentials injector for testing
  const handleQuickLogin = (roleType) => {
    if (roleType === 'admin') {
      setEmail('admin@maturcapil.id');
      setPassword('password');
    } else {
      setEmail('superadmin@maturcapil.id');
      setPassword('password');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Graphic elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      {/* Main Card */}
      <div className="bg-slate-800/50 border border-slate-700/60 rounded-3xl w-full max-w-md shadow-2xl p-8 backdrop-blur-md flex flex-col gap-6 relative z-10">
        
        {/* Brand */}
        <div className="text-center">
          <span className="text-5xl">🏛️</span>
          <h1 className="text-xl font-black text-white mt-3 tracking-wide">PORTAL PEMERINTAH</h1>
          <p className="text-xs text-brand-500 font-extrabold tracking-widest uppercase mt-0.5">Dispendukcapil Semarang</p>
        </div>

        {/* Info Banner */}
        <div className="bg-slate-800 border border-slate-700/40 px-4 py-3 rounded-2xl flex gap-2.5 items-start">
          <ShieldCheck className="w-5 h-5 text-brand-500 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-[10px] font-bold text-slate-350 block uppercase tracking-wider">Akses Khusus Petugas</span>
            <p className="text-[10.5px] text-slate-450 mt-0.5 leading-normal">
              Gunakan kredensial resmi Anda untuk memproses, memverifikasi, dan menyelesaikan dokumen aduan warga Semarang.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs px-4 py-3 rounded-xl flex items-center gap-2.5 animate-slide-up">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email Dinas</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-500" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staf@semarangkota.go.id" 
                className="w-full bg-slate-900 border border-slate-700/80 focus:border-brand-500 focus:bg-slate-950 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-550 focus:outline-hidden transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-500" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-slate-900 border border-slate-700/80 focus:border-brand-500 focus:bg-slate-950 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-550 focus:outline-hidden transition-all"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="mt-2 w-full bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 cursor-pointer shadow-lg shadow-brand-650/15"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Masuk Sistem
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Quick Injector */}
        <div className="border-t border-slate-700/50 pt-4 mt-2">
          <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest text-center">💡 Demo Quick Login (Click to fill):</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLogin('admin')}
              className="py-2 px-3 border border-slate-700 hover:border-slate-500 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-[10px] font-semibold transition-colors"
            >
              💼 Staf Admin
            </button>
            <button
              onClick={() => handleQuickLogin('superadmin')}
              className="py-2 px-3 border border-slate-700 hover:border-slate-500 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-[10px] font-semibold transition-colors"
            >
              👑 Super Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
