import React, { useState } from 'react';
import { useMockData } from '../../context/MockDataContext';
import { History, FileDown, Search, ShieldCheck } from 'lucide-react';

export const AdminAuditLogs = () => {
  const { auditLogs } = useMockData();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logs based on search
  const filteredLogs = [...auditLogs].reverse().filter(log => {
    return log.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
           log.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
           log.record_id.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getActionColor = (action) => {
    if (action.includes('REJECT')) return 'bg-rose-50 border-rose-200 text-rose-700';
    if (action.includes('CLOSE')) return 'bg-emerald-50 border-emerald-200 text-emerald-700';
    if (action.includes('VERIFY')) return 'bg-amber-50 border-amber-200 text-amber-700';
    return 'bg-slate-50 border-slate-200 text-slate-700';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // CSV Audit log export
  const handleExportCSV = () => {
    const headers = ['ID Log', 'Petugas', 'Aksi', 'Tabel', 'ID Record', 'Keterangan', 'Waktu'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.user_name,
      l.action,
      l.table_name,
      l.record_id,
      `"${l.detail.replace(/"/g, '""')}"`,
      new Date(l.created_at).toLocaleString('id-ID')
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
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
      
      {/* Header Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-brand-500" />
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">Log Audit Sistem Keamanan</h3>
              <p className="text-[11px] text-slate-400 font-medium">Rekaman riwayat aktivitas operasional seluruh administrator</p>
            </div>
          </div>
          
          <button
            onClick={handleExportCSV}
            className="self-start sm:self-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <FileDown className="w-4.5 h-4.5" />
            Ekspor Audit Log (CSV)
          </button>
        </div>

        {/* Search bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari kata kunci audit (staf, nomor tiket, aksi)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-hidden focus:bg-white transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-4">Operator (Staf)</th>
                <th className="py-4 px-4">Tindakan</th>
                <th className="py-4 px-4">Target Database</th>
                <th className="py-4 px-4">Deskripsi Tindakan</th>
                <th className="py-4 px-6">Waktu Kejadian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada rekaman log audit yang cocok.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-400">{log.id}</td>
                    <td className="py-4 px-4 font-bold text-slate-800">{log.user_name}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-semibold">{log.table_name} ({log.record_id})</td>
                    <td className="py-4 px-4 text-slate-600 max-w-sm leading-relaxed">{log.detail}</td>
                    <td className="py-4 px-6 text-slate-500 font-semibold">{formatDate(log.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-150 flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Sistem Pencatatan Audit Terenkripsi Log & Terproteksi Tampering</span>
        </div>
      </div>
    </div>
  );
};
