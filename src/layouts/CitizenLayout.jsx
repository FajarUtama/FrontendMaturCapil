import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useMockData } from '../context/MockDataContext';
import { Home, PlusCircle, History, User, Bell, LogOut, ShieldAlert } from 'lucide-react';
import { NotificationToast } from '../components/NotificationToast';

export const CitizenLayout = () => {
  const { currentUser, logout, notifications } = useMockData();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/maturcapil');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:py-8 justify-center items-center">
      {/* Global Notification Toast */}
      <NotificationToast />

      {/* Main Mobile Screen Wrapper */}
      <div className="w-full md:max-w-md md:rounded-3xl md:shadow-2xl bg-white min-h-screen md:min-h-[850px] md:max-h-[900px] flex flex-col overflow-hidden relative border border-slate-200">
        
        {/* Header */}
        <header className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-20 flex justify-between items-center shadow-xs">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/maturcapil')}>
            <span className="text-2xl">🏛️</span>
            <div>
              <h1 className="font-bold text-base tracking-tight text-slate-800">MaturCapil</h1>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Semarang</p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative">
            {/* Admin Switcher Shortcut */}
            <button 
              onClick={() => navigate('/admin')}
              title="Pindah ke Dashboard Admin"
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
            >
              <ShieldAlert className="w-5 h-5" />
            </button>

            {/* Notification Bell */}
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-500 hover:text-brand-500 rounded-full hover:bg-slate-50 relative transition-colors"
            >
              <Bell className="w-5 h-5" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-30 animate-slide-up">
                <div className="px-4 py-1.5 border-b border-slate-100 flex justify-between items-center">
                  <span className="font-semibold text-xs text-slate-700">Notifikasi</span>
                  <span className="text-[10px] bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded-full font-bold">Terbaru</span>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-slate-400">
                      Tidak ada notifikasi baru
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="px-4 py-2 hover:bg-slate-50 border-b border-slate-50 last:border-0 text-left">
                        <p className="font-semibold text-xs text-slate-800">{n.title}</p>
                        <p className="text-[10px] text-slate-500 line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Profile Avatar & Dropdown */}
            {currentUser ? (
              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm border-2 border-brand-500/20 hover:border-brand-500 transition-colors"
                >
                  {currentUser.name.charAt(0).toUpperCase()}
                </button>

                {showDropdown && (
                  <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-30 animate-slide-up">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-semibold text-xs text-slate-800 line-clamp-1">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => navigate('/maturcapil/login')}
                className="text-xs font-semibold bg-brand-500 text-white px-3.5 py-1.5 rounded-full hover:bg-brand-600 active:scale-95 transition-all shadow-sm"
              >
                Masuk
              </button>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-grow overflow-y-auto pb-24 bg-slate-50">
          <Outlet />
        </main>

        {/* Bottom Navigation */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-100 py-2.5 px-6 flex justify-around items-center z-20 shadow-lg">
          <NavLink 
            to="/maturcapil" 
            end
            className={({ isActive }) => `flex flex-col items-center gap-1 text-slate-400 transition-colors duration-200 ${isActive ? 'text-brand-500' : 'hover:text-slate-600'}`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Beranda</span>
          </NavLink>
          
          <NavLink 
            to="/maturcapil/create" 
            className={({ isActive }) => `flex flex-col items-center gap-1 text-slate-400 transition-colors duration-200 ${isActive ? 'text-brand-500' : 'hover:text-slate-600'}`}
          >
            <PlusCircle className="w-5 h-5 animate-pulse" />
            <span className="text-[10px] font-medium">Lapor</span>
          </NavLink>
          
          <NavLink 
            to="/maturcapil/history" 
            className={({ isActive }) => `flex flex-col items-center gap-1 text-slate-400 transition-colors duration-200 ${isActive ? 'text-brand-500' : 'hover:text-slate-600'}`}
          >
            <History className="w-5 h-5" />
            <span className="text-[10px] font-medium">Aduan Saya</span>
          </NavLink>

          <NavLink 
            to="/maturcapil/profile" 
            className={({ isActive }) => `flex flex-col items-center gap-1 text-slate-400 transition-colors duration-200 ${isActive ? 'text-brand-500' : 'hover:text-slate-600'}`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Profil</span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
};
