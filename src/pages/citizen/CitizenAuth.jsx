import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMockData } from '../../context/MockDataContext';
import { Mail, Lock, User, ArrowRight, CheckCircle, ShieldAlert } from 'lucide-react';

export const CitizenAuth = () => {
  const { login, register, currentUser } = useMockData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/maturcapil';

  // Toggle active tab: 'login' | 'register'
  const [activeTab, setActiveTab] = useState('login');

  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (currentUser) {
      navigate(redirect);
    }
  }, [currentUser, navigate, redirect]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Harap lengkapi semua kolom.');
      return;
    }

    if (activeTab === 'register' && !name) {
      setError('Harap masukkan nama lengkap Anda.');
      return;
    }

    setIsLoading(true);

    // Simulate small API delay (500ms)
    setTimeout(() => {
      let result;
      if (activeTab === 'login') {
        result = login(email, password, 'citizen');
      } else {
        result = register(name, email, password);
      }

      setIsLoading(false);

      if (result.success) {
        navigate(redirect);
      } else {
        setError(result.message);
      }
    }, 500);
  };

  return (
    <div className="p-6 flex flex-col justify-center min-h-[70vh] animate-fade-in">
      {/* Brand Icon & Heading */}
      <div className="text-center mb-8">
        <span className="text-4xl">🏛️</span>
        <h2 className="text-xl font-bold text-slate-800 mt-3">MaturCapil Semarang</h2>
        <p className="text-xs text-slate-400 mt-1">Sistem Pengaduan Layanan Adminduk Mandiri</p>
      </div>

      {/* Auth Box Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden p-6">
        
        {/* Tab Toggle */}
        <div className="flex border-b border-slate-150 mb-6">
          <button 
            type="button"
            onClick={() => { setActiveTab('login'); setError(''); }}
            className={`flex-1 pb-3 text-xs font-bold transition-all border-b-2 text-center ${
              activeTab === 'login' 
                ? 'border-brand-500 text-brand-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Masuk Akun
          </button>
          <button 
            type="button"
            onClick={() => { setActiveTab('register'); setError(''); }}
            className={`flex-1 pb-3 text-xs font-bold transition-all border-b-2 text-center ${
              activeTab === 'register' 
                ? 'border-brand-500 text-brand-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Daftar Baru
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs px-4 py-3 rounded-xl flex items-center gap-2.5 animate-slide-up">
            <ShieldAlert className="w-4.5 h-4.5 flex-shrink-0" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {activeTab === 'register' && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-400" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama sesuai KTP" 
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-brand-500/10 transition-all"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Alamat Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-400" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com" 
                className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-brand-500/10 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Password</label>
              {activeTab === 'login' && (
                <button 
                  type="button" 
                  onClick={() => alert('Fitur reset password disimulasikan. Hubungi admin untuk reset password.')}
                  className="text-[10px] text-brand-600 font-bold hover:underline"
                >
                  Lupa?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-brand-500/10 transition-all"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="mt-2 w-full bg-brand-500 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-600 active:scale-98 transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-brand-500/10"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {activeTab === 'login' ? 'Masuk Portal' : 'Daftar Akun'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-6 border-t border-slate-100 pt-4 flex gap-2 items-start text-[10px] text-slate-400 leading-normal">
          <CheckCircle className="w-3.5 h-3.5 text-brand-500/50 flex-shrink-0 mt-0.5" />
          <p>
            Dengan menggunakan layanan MaturCapil, Anda setuju untuk menyampaikan data laporan secara jujur, objektif, dan dapat dipertanggungjawabkan.
          </p>
        </div>
      </div>

      {/* Demo Credentials Helper */}
      <div className="mt-6 p-4 bg-slate-50 border border-slate-200/60 rounded-xl text-[10px] text-slate-500">
        <p className="font-bold mb-1.5 text-slate-600 uppercase tracking-wide">💡 Akun Demo Masyarakat:</p>
        <p>Email: <span className="font-semibold">citizen@maturcapil.id</span></p>
        <p>Password: <span className="font-semibold">password</span></p>
      </div>
    </div>
  );
};
