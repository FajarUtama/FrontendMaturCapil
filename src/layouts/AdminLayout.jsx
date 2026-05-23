import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useMockData } from '../context/MockDataContext';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  Users, 
  Tags, 
  History, 
  LogOut, 
  Bell, 
  Menu, 
  ChevronRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { NotificationToast } from '../components/NotificationToast';

export const AdminLayout = () => {
  const { currentUser, logout, notifications } = useMockData();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  // If user is not logged in as Admin or Super Admin, redirect to Admin login
  React.useEffect(() => {
    if (!currentUser || (currentUser.role !== 'Admin' && currentUser.role !== 'Super Admin')) {
      navigate('/admin/login');
    }
  }, [currentUser, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (!currentUser || (currentUser.role !== 'Admin' && currentUser.role !== 'Super Admin')) {
    return null;
  }

  // Get Page Title from Location
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard Monitoring';
    if (path.includes('complaints')) return 'Daftar Pengaduan';
    if (path.includes('users')) return 'Kelola Pengguna & Staf';
    if (path.includes('categories')) return 'Kelola Kategori Layanan';
    if (path.includes('audit-logs')) return 'Log Audit Keamanan';
    return 'LaporCapil Admin';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans">
      {/* Global Notification Toast */}
      <NotificationToast />

      {/* Sidebar */}
      <aside 
        className={`bg-slate-900 text-slate-300 transition-all duration-300 border-r border-slate-800 flex flex-col z-20 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Sidebar Brand */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
            <span className="text-2xl flex-shrink-0">🏛️</span>
            {sidebarOpen && (
              <div className="animate-fade-in">
                <h1 className="font-bold text-sm tracking-tight text-white">AdminCapil</h1>
                <p className="text-[9px] text-brand-500 font-extrabold uppercase tracking-wider">Semarang</p>
              </div>
            )}
          </div>
        </div>

        {/* User Info Capsule */}
        {sidebarOpen && (
          <div className="p-4 mx-4 my-3 bg-slate-800/40 rounded-xl border border-slate-800/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-inner">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-xs text-slate-100 truncate">{currentUser.name}</h4>
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-brand-500/10 text-brand-500 border border-brand-500/20">
                {currentUser.role === 'Super Admin' ? <ShieldCheck className="w-2.5 h-2.5" /> : <UserCheck className="w-2.5 h-2.5" />}
                {currentUser.role}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-grow py-4 px-3 flex flex-col gap-1.5 overflow-y-auto">
          <NavLink 
            to="/admin/dashboard"
            className={({ isActive }) => `flex items-center gap-3.5 px-3 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
              isActive 
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10' 
                : 'hover:bg-slate-800/60 hover:text-slate-100 text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Dashboard</span>}
          </NavLink>

          <NavLink 
            to="/admin/complaints"
            className={({ isActive }) => `flex items-center gap-3.5 px-3 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
              isActive 
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10' 
                : 'hover:bg-slate-800/60 hover:text-slate-100 text-slate-400'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Kelola Pengaduan</span>}
          </NavLink>

          {/* Super Admin Sections */}
          {currentUser.role === 'Super Admin' && (
            <>
              <div className={`mt-4 mb-1.5 px-3 text-[10px] uppercase font-bold text-slate-600 tracking-widest ${!sidebarOpen && 'text-center'}`}>
                {sidebarOpen ? 'Super Admin' : '•'}
              </div>

              <NavLink 
                to="/admin/users"
                className={({ isActive }) => `flex items-center gap-3.5 px-3 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isActive 
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10' 
                    : 'hover:bg-slate-800/60 hover:text-slate-100 text-slate-400'
                }`}
              >
                <Users className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>Kelola Pengguna</span>}
              </NavLink>

              <NavLink 
                to="/admin/categories"
                className={({ isActive }) => `flex items-center gap-3.5 px-3 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isActive 
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10' 
                    : 'hover:bg-slate-800/60 hover:text-slate-100 text-slate-400'
                }`}
              >
                <Tags className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>Kategori Layanan</span>}
              </NavLink>

              <NavLink 
                to="/admin/audit-logs"
                className={({ isActive }) => `flex items-center gap-3.5 px-3 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isActive 
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10' 
                    : 'hover:bg-slate-800/60 hover:text-slate-100 text-slate-400'
                }`}
              >
                <History className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>Audit Log</span>}
              </NavLink>
            </>
          )}
        </nav>

        {/* Footer Logout */}
        <div className="p-3 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors duration-200 ${
              !sidebarOpen && 'justify-center'
            }`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main Body */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Header Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400">Portal Pemerintah</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-800">{getPageTitle()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Citizens Shortcut Button */}
            <button 
              onClick={() => navigate('/maturcapil')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-colors"
            >
              <span>Portal Warga</span>
              <span className="text-xs">📱</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-500 rounded-full border-2 border-white" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-30 animate-slide-up">
                  <div className="px-5 py-2 border-b border-slate-100 flex justify-between items-center">
                    <span className="font-bold text-sm text-slate-800">Notifikasi Masuk</span>
                    <span className="text-[10px] bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-bold">Terbaru</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-5 py-8 text-center text-xs text-slate-400">
                        Tidak ada notifikasi baru
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="px-5 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 text-left">
                          <p className="font-bold text-xs text-slate-800">{n.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                          <span className="text-[9px] text-slate-400 mt-1 block">{n.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Pane */}
        <main className="flex-grow p-6 overflow-y-auto max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
