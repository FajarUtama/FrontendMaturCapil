import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useMockData } from '../context/MockDataContext';
import { Home, PlusCircle, History, User, Bell, LogOut, ShieldAlert } from 'lucide-react';
import { NotificationToast } from '../components/NotificationToast';

const navLinks = [
  { to: '/maturcapil', end: true, icon: Home, label: 'Beranda' },
  { to: '/maturcapil/create', icon: PlusCircle, label: 'Lapor' },
  { to: '/maturcapil/history', icon: History, label: 'Aduan Saya' },
  { to: '/maturcapil/profile', icon: User, label: 'Profil' },
];

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
    <div className="fixed inset-0 md:static md:inset-auto md:min-h-screen bg-slate-100 md:bg-slate-50 flex flex-col overflow-hidden overscroll-none">
      <NotificationToast />

      <header className="bg-white border-b border-slate-200 shrink-0 z-20 shadow-xs pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="px-4 md:px-6 py-3 flex justify-between items-center max-w-6xl mx-auto w-full gap-4">
          <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => navigate('/maturcapil')}>
            <span className="text-2xl">🏛️</span>
            <div>
              <h1 className="font-bold text-base md:text-lg tracking-tight text-slate-800">MaturCapil</h1>
              <p className="text-[10px] md:text-xs text-slate-400 font-semibold tracking-wider uppercase">Semarang</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map(({ to, end, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 relative shrink-0">
            <button
              onClick={() => navigate('/admin')}
              title="Pindah ke Dashboard Admin"
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
            >
              <ShieldAlert className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-500 hover:text-brand-500 rounded-full hover:bg-slate-50 relative transition-colors"
            >
              <Bell className="w-5 h-5" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-72 md:w-80 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-30 animate-slide-up">
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

            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm border-2 border-brand-500/20 hover:border-brand-500 transition-colors"
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
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-slate-50 pb-4 md:pb-8">
        <div className="max-w-6xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

      <nav className="md:hidden shrink-0 bg-white/80 backdrop-blur-md border-t border-slate-100 py-2.5 px-6 flex justify-around items-center z-20 shadow-lg pb-[max(0.625rem,env(safe-area-inset-bottom))]">
        {navLinks.map(({ to, end, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-slate-400 transition-colors duration-200 ${
                isActive ? 'text-brand-500' : 'hover:text-slate-600'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
