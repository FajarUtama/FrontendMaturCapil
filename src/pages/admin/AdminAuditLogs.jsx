import React, { useState } from 'react';
import { useMockData } from '../../context/MockDataContext';
import { History, FileDown, Search, ShieldCheck, Lock } from 'lucide-react';

const ACTION_LABELS = {
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  VERIFY_COMPLAINT: 'Verifikasi Aduan',
  REJECT_COMPLAINT: 'Tolak Aduan',
  CLOSE_COMPLAINT: 'Tutup Aduan',
  UPDATE_STATUS: 'Update Status',
  CREATE_USER: 'Buat User',
  UPDATE_USER: 'Edit User',
  DEACTIVATE_USER: 'Nonaktifkan User',
  RESET_PASSWORD: 'Reset Password',
  PERMISSION_CHANGE: 'Ubah Permission',
  CREATE_CATEGORY: 'Buat Kategori',
  UPDATE_CATEGORY: 'Edit Kategori',
  DELETE_CATEGORY: 'Hapus Kategori',
};

export const AdminAuditLogs = () => {
  const { auditLogs, hasPermission } = useMockData();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  if (!hasPermission('auditlog.view')) {
    return (
      <div className="bg-rose-50 border border-rose-100 rounded-2xl p-8 text-center text-sm text-rose-700">
        Anda tidak memiliki izin <code className="font-mono text-xs">auditlog.view</code>.
        <p className="text-xs mt-2 text-rose-500">Menu Audit & Log khusus Super Admin atau admin dengan hak akses ini.</p>
      </div>
    );
  }

  const actionTypes = [...new Set(auditLogs.map((l) => l.action))].sort();

  const filteredLogs = [...auditLogs]
    .reverse()
    .filter((log) => {
      const matchAction = actionFilter === 'all' || log.action === actionFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        log.user_name.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.detail.toLowerCase().includes(q) ||
        log.record_id.toLowerCase().includes(q) ||
        (log.ip_address && log.ip_address.includes(q));
      return matchAction && matchSearch;
    });

  const getActionColor = (action) => {
    if (action.includes('REJECT') || action.includes('DEACTIVATE') || action.includes('DELETE')) {
      return 'bg-rose-50 border-rose-200 text-rose-700';
    }
    if (action.includes('CLOSE') || action.includes('CREATE')) return 'bg-emerald-50 border-emerald-200 text-emerald-700';
    if (action.includes('VERIFY') || action.includes('UPDATE') || action.includes('PERMISSION')) {
      return 'bg-amber-50 border-amber-200 text-amber-700';
    }
    if (action.includes('LOGIN') || action.includes('LOGOUT') || action.includes('RESET')) {
      return 'bg-blue-50 border-blue-200 text-blue-700';
    }
    return 'bg-slate-50 border-slate-200 text-slate-700';
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  const handleExportCSV = () => {
    const headers = ['ID Log', 'Petugas', 'Aksi', 'Tabel', 'ID Record', 'IP', 'Keterangan', 'Waktu'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.user_name,
      l.action,
      l.table_name,
      l.record_id,
      l.ip_address || '',
      `"${l.detail.replace(/"/g, '""')}"`,
      new Date(l.created_at).toLocaleString('id-ID'),
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit-logs-maturcapil-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-5 font-sans">
      <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2 text-xs text-amber-800">
        <Lock className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          <strong>Immutable Audit Log</strong> — Rekaman tidak dapat diedit atau dihapus oleh admin biasa. Semua login, reset password, CRUD user, dan perubahan permission tercatat otomatis.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-brand-500" />
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">Audit & Log Keamanan</h3>
              <p className="text-[11px] text-slate-400 font-medium">Riwayat aktivitas sistem — khusus Super Admin</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleExportCSV}
            className="self-start sm:self-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 active:scale-95 shadow-xs"
          >
            <FileDown className="w-4 h-4" />
            Ekspor CSV
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari staf, aksi, IP, detail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-hidden focus:bg-white"
            />
          </div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:min-w-[180px]"
          >
            <option value="all">Semua Aksi</option>
            {actionTypes.map((a) => (
              <option key={a} value={a}>
                {ACTION_LABELS[a] || a}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="md:hidden divide-y divide-slate-100">
          {filteredLogs.length === 0 ? (
            <p className="py-12 text-center text-xs text-slate-400">Tidak ada log yang cocok.</p>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start gap-2">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border ${getActionColor(log.action)}`}>
                    {ACTION_LABELS[log.action] || log.action}
                  </span>
                  <span className="text-[10px] text-slate-400">{formatDate(log.created_at)}</span>
                </div>
                <p className="font-bold text-xs text-slate-800">{log.user_name}</p>
                <p className="text-xs text-slate-600">{log.detail}</p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {log.table_name} / {log.record_id}
                  {log.ip_address && ` · IP ${log.ip_address}`}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-4">Operator</th>
                <th className="py-4 px-4">Aksi</th>
                <th className="py-4 px-4">Target</th>
                <th className="py-4 px-4">IP</th>
                <th className="py-4 px-4">Deskripsi</th>
                <th className="py-4 px-6">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada rekaman log audit yang cocok.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-4 px-6 font-bold text-slate-400">{log.id}</td>
                    <td className="py-4 px-4 font-bold text-slate-800">{log.user_name}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border ${getActionColor(log.action)}`}>
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-semibold">
                      {log.table_name} ({log.record_id})
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-500">{log.ip_address || '—'}</td>
                    <td className="py-4 px-4 text-slate-600 max-w-sm leading-relaxed">{log.detail}</td>
                    <td className="py-4 px-6 text-slate-500 font-semibold whitespace-nowrap">{formatDate(log.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 px-4 sm:px-6 py-3 border-t border-slate-150 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            {filteredLogs.length} rekaman · log terenkripsi & anti-tamper
          </span>
          <span>Dispendukcapil Semarang</span>
        </div>
      </div>
    </div>
  );
};
