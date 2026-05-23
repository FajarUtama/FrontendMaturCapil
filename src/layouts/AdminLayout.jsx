import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
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
  UserCheck,
  X,
} from 'lucide-react';
import { NotificationToast } from '../components/NotificationToast';

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3.5 px-3 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
    isActive
      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10'
      : 'hover:bg-slate-800/60 hover:text-slate-100 text-slate-400'
  }`;

export const AdminLayout = () => {
  const { currentUser, logout, notifications, hasPermission } = useAppData();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    setMobileSidebarOpen(false);
    setShowNotifications(false);
  }, [location.pathname]);

  React.useEffect(() => {
    if (!currentUser || (currentUser.role !== 'Admin' && currentUser.role !== 'Super Admin')) {
      navigate('/admin/login');
    }
  }, [currentUser, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const toggleSidebar = () => {
    if (isDesktop) {
      setSidebarCollapsed((prev) => !prev);
    } else {
      setMobileSidebarOpen((prev) => !prev);
    }
  };

  if (!currentUser || (currentUser.role !== 'Admin' && currentUser.role !== 'Super Admin')) {
    return null;
  }

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard Monitoring';
    if (path.includes('complaints')) return 'Daftar Pengaduan';
    if (path.includes('users')) return 'Kelola Pengguna & Staf';
    if (path.includes('categories')) return 'Kelola Kategori Layanan';
    if (path.includes('audit-logs')) return 'Log Audit Keamanan';
    return 'LaporCapil Admin';
  };

  const showSidebarLabels = isDesktop ? !sidebarCollapsed : true;

  const SidebarNav = () => (
    <>
      <NavLink to="/admin/dashboard" className={navLinkClass} onClick={() => setMobileSidebarOpen(false)}>
        <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
        {showSidebarLabels && <span>Dashboard</span>}
      </NavLink>

      <NavLink to="/admin/complaints" className={navLinkClass} onClick={() => setMobileSidebarOpen(false)}>
        <FileSpreadsheet className="w-5 h-5 flex-shrink-0" />
        {showSidebarLabels && <span>Kelola Pengaduan</span>}
      </NavLink>

      {(hasPermission('user.view') || hasPermission('category.manage') || hasPermission('auditlog.view')) && (
        <>
          <div
            className={`mt-4 mb-1.5 px-3 text-[10px] uppercase font-bold text-slate-600 tracking-widest ${
              !showSidebarLabels && 'text-center'
            }`}
          >
            {showSidebarLabels ? 'Manajemen Sistem' : '•'}
          </div>

          {hasPermission('user.view') && (
            <NavLink to="/admin/users" className={navLinkClass} onClick={() => setMobileSidebarOpen(false)}>
              <Users className="w-5 h-5 flex-shrink-0" />
              {showSidebarLabels && <span>Manajemen User</span>}
            </NavLink>
          )}

          {hasPermission('category.manage') && (
            <NavLink to="/admin/categories" className={navLinkClass} onClick={() => setMobileSidebarOpen(false)}>
              <Tags className="w-5 h-5 flex-shrink-0" />
              {showSidebarLabels && <span>Kategori Layanan</span>}
            </NavLink>
          )}

          {hasPermission('auditlog.view') && (
            <NavLink to="/admin/audit-logs" className={navLinkClass} onClick={() => setMobileSidebarOpen(false)}>
              <History className="w-5 h-5 flex-shrink-0" />
              {showSidebarLabels && <span>Audit & Log</span>}
            </NavLink>
          )}
        </>
      )}
    </>
  );

  return (
    <div className="fixed inset-0 lg:static lg:inset-auto h-[100dvh] lg:h-screen bg-slate-50 flex text-slate-800 font-sans overflow-hidden overscroll-none">
      <NotificationToast />

      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          className="fixed inset-0 z-30 bg-slate-900/60 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-out lg:transition-[width] lg:duration-300 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'lg:w-20' : 'w-72 lg:w-64'}`}
      >
        <div className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-slate-800 shrink-0">
          <div
            className="flex items-center gap-3 overflow-hidden cursor-pointer min-w-0"
            onClick={() => {
              navigate('/admin/dashboard');
              setMobileSidebarOpen(false);
            }}
          >
            <span className="text-2xl flex-shrink-0">🏛️</span>
            {showSidebarLabels && (
              <div className="animate-fade-in min-w-0">
                <h1 className="font-bold text-sm tracking-tight text-white truncate">AdminCapil</h1>
                <p className="text-[9px] text-brand-500 font-extrabold uppercase tracking-wider">Semarang</p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            aria-label="Tutup sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {showSidebarLabels && (
          <div className="p-4 mx-4 my-3 bg-slate-800/40 rounded-xl border border-slate-800/60 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-inner">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-xs text-slate-100 truncate">{currentUser.name}</h4>
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-brand-500/10 text-brand-500 border border-brand-500/20">
                {currentUser.role === 'Super Admin' ? (
                  <ShieldCheck className="w-2.5 h-2.5" />
                ) : (
                  <UserCheck className="w-2.5 h-2.5" />
                )}
                {currentUser.role}
              </span>
            </div>
          </div>
        )}

        <nav className="flex-1 min-h-0 py-4 px-3 flex flex-col gap-1.5 overflow-y-auto overscroll-contain">
          <SidebarNav />
        </nav>

        <div className="p-3 border-t border-slate-800 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors duration-200 ${
              !showSidebarLabels && 'justify-center'
            }`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {showSidebarLabels && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        <header className="h-14 sm:h-16 shrink-0 bg-white border-b border-slate-200/80 px-3 sm:px-6 flex justify-between items-center gap-2 z-10 pt-[env(safe-area-inset-top)]">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors shrink-0"
              aria-label="Buka menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1 sm:gap-2 text-sm min-w-0">
              <span className="text-slate-400 hidden sm:inline whitespace-nowrap">Portal Pemerintah</span>
              <ChevronRight className="w-4 h-4 text-slate-400 hidden sm:block shrink-0" />
              <span className="font-semibold text-slate-800 truncate text-xs sm:text-sm">{getPageTitle()}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <button
              onClick={() => navigate('/maturcapil')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-colors"
            >
              <span>Portal Warga</span>
              <span className="text-xs">📱</span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-500 rounded-full border-2 border-white" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-[min(20rem,calc(100vw-1.5rem))] bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-30 animate-slide-up">
                  <div className="px-4 sm:px-5 py-2 border-b border-slate-100 flex justify-between items-center">
                    <span className="font-bold text-sm text-slate-800">Notifikasi Masuk</span>
                    <span className="text-[10px] bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-bold">Terbaru</span>
                  </div>
                  <div className="max-h-60 sm:max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-5 py-8 text-center text-xs text-slate-400">Tidak ada notifikasi baru</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className="px-4 sm:px-5 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 text-left"
                        >
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

        <main className="flex-1 min-h-0 p-3 sm:p-4 md:p-6 overflow-y-auto overscroll-contain w-full max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
