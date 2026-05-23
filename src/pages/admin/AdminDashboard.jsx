import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar
} from 'recharts';
import { 
  ClipboardList, 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  MapPin,
  TrendingUp,
  Tags
} from 'lucide-react';

export const AdminDashboard = () => {
  const { complaints, categories } = useAppData();
  const navigate = useNavigate();
  const [selectedMapDistrict, setSelectedMapDistrict] = useState(null);

  // Compute counters
  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'Menunggu Verifikasi').length;
  const processed = complaints.filter(c => c.status === 'Diproses').length;
  const resolved = complaints.filter(c => c.status === 'Selesai').length;

  // Chart Data 1: Trend Laporan Harian (Mocked based on pre-populated + active ones)
  const chartTrendData = [
    { tanggal: '17 Mei', Laporan: 3 },
    { tanggal: '18 Mei', Laporan: 5 },
    { tanggal: '19 Mei', Laporan: 2 },
    { tanggal: '20 Mei', Laporan: 8 },
    { tanggal: '21 Mei', Laporan: 4 },
    { tanggal: '22 Mei', Laporan: 6 },
    { tanggal: '23 Mei', Laporan: complaints.length } // current live count
  ];

  // Chart Data 2: Kategori Breakdown
  const categoryCounts = categories.map(cat => {
    const count = complaints.filter(c => c.category_id === cat.id).length;
    return { name: cat.code, value: count || 0, fullname: cat.name };
  });

  const COLORS = ['#dc2626', '#2563eb', '#16a34a', '#d97706', '#0284c7', '#4b5563'];

  // Chart Data 3: Priority Breakdown
  const priorityData = [
    { name: 'Tinggi', Jumlah: complaints.filter(c => c.priority === 'Tinggi').length },
    { name: 'Sedang', Jumlah: complaints.filter(c => c.priority === 'Sedang').length },
    { name: 'Rendah', Jumlah: complaints.filter(c => c.priority === 'Rendah').length }
  ];

  // Active Unresolved Complaints for Map Pins
  const mapComplaints = complaints.filter(c => c.status !== 'Selesai' && c.status !== 'Ditolak');

  // New incoming complaints (Verification Queue)
  const verificationQueue = complaints.filter(c => c.status === 'Menunggu Verifikasi').slice(0, 4);

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Overview Stats Counters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Total */}
        <div className="bg-white border border-slate-205 shadow-xs rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Aduan Masuk</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{total}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Seluruh laporan tercatat</p>
          </div>
          <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-500">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white border border-slate-205 shadow-xs rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Menunggu Verifikasi</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{pending}</h3>
            <p className="text-[10px] text-amber-600/70 mt-0.5">Membutuhkan persetujuan</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-amber-550">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Processed */}
        <div className="bg-white border border-slate-205 shadow-xs rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Aduan Diproses</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{processed}</h3>
            <p className="text-[10px] text-blue-650/70 mt-0.5">Sedang dalam penanganan</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            <RefreshCw className="w-6 h-6" />
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white border border-slate-205 shadow-xs rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Selesai Ditangani</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{resolved}</h3>
            <p className="text-[10px] text-emerald-650/70 mt-0.5">Telah diperbaiki & ditutup</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Charts & Visualizations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Area Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 lg:col-span-2 shadow-xs flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-brand-500" />
              <h4 className="font-extrabold text-sm text-slate-800">Tren Pengaduan Warga</h4>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md">7 Hari Terakhir</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLapor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="tanggal" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: 11 }} />
                <Area type="monotone" dataKey="Laporan" stroke="#dc2626" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLapor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Tags className="w-4.5 h-4.5 text-brand-500" />
            <h4 className="font-extrabold text-sm text-slate-800">Distribusi Kategori Layanan</h4>
          </div>

          <div className="h-64 w-full flex flex-col justify-center items-center relative">
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={categoryCounts}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${value} Laporan`, `${props.payload.fullname}`]} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Absolute Center Text */}
            <div className="absolute text-center">
              <h3 className="text-xl font-black text-slate-800">{complaints.length}</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Aduan</p>
            </div>
          </div>

          {/* Custom Custom Legend Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-slate-50 pt-3">
            {categoryCounts.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-[10px] font-bold text-slate-600 truncate" title={entry.fullname}>{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map & Queue Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive Map Visual Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 lg:col-span-2 shadow-xs flex flex-col gap-4">
          <div>
            <h4 className="font-extrabold text-sm text-slate-800">Peta Sebaran Laporan Aktif</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Plot koordinat laporan warga Semarang yang belum diselesaikan</p>
          </div>

          {/* Map Grid Canvas */}
          <div className="relative h-72 bg-blue-50/20 border border-slate-100 rounded-xl overflow-hidden p-4 flex flex-col justify-between">
            {/* Grid Lines Mock */}
            <div className="absolute inset-0 grid grid-cols-10 grid-rows-6 gap-0 pointer-events-none opacity-20">
              {Array.from({ length: 60 }).map((_, i) => (
                <div key={i} className="border border-slate-350" />
              ))}
            </div>

            {/* Clickable map pins absolute */}
            {mapComplaints.map((comp) => {
              // Custom map scaling positioning based on latitude and longitude margins
              // Semarang coordinates roughly: Lat -6.95 to -7.06, Lng 110.34 to 110.46
              const latMin = -7.07;
              const latMax = -6.94;
              const lngMin = 110.33;
              const lngMax = 110.47;

              const top = ((comp.latitude - latMax) / (latMin - latMax)) * 100;
              const left = ((comp.longitude - lngMin) / (lngMax - lngMin)) * 100;

              return (
                <button
                  key={comp.id}
                  onClick={() => setSelectedMapDistrict(comp)}
                  className={`absolute p-1 -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer hover:scale-125 transition-all shadow-md group ${
                    comp.priority === 'Tinggi' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                  }`}
                  style={{ top: `${top}%`, left: `${left}%` }}
                >
                  <MapPin className="w-4 h-4" />
                  
                  {/* Floating tooltip */}
                  <div className="hidden group-hover:block absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded-md whitespace-nowrap z-20 shadow-lg border border-slate-700">
                    {comp.ticket_number} - {comp.title.slice(0, 15)}...
                  </div>
                </button>
              );
            })}

            {/* Map info Card Overlay */}
            {selectedMapDistrict ? (
              <div className="absolute bottom-3 left-3 right-3 bg-slate-900/95 border border-slate-800 text-white rounded-xl p-3 shadow-xl backdrop-blur-md flex items-center justify-between z-10 animate-slide-up">
                <div className="min-w-0 pr-4">
                  <span className="text-[8px] font-extrabold bg-brand-500 text-white px-2 py-0.5 rounded-sm uppercase">{selectedMapDistrict.ticket_number}</span>
                  <h5 className="font-bold text-xs mt-1 truncate">{selectedMapDistrict.title}</h5>
                  <p className="text-[9px] text-slate-400 truncate mt-0.5">📍 {selectedMapDistrict.address}</p>
                </div>
                <button 
                  onClick={() => navigate(`/admin/complaints/${selectedMapDistrict.id}`)}
                  className="flex-shrink-0 bg-brand-500 hover:bg-brand-600 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                >
                  Periksa
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="absolute bottom-3 left-3 bg-white/80 border border-slate-200/50 text-slate-500 rounded-lg py-1.5 px-3 text-[10px] font-semibold backdrop-blur-xs">
                💡 Sorot pin merah/oranye untuk melihat info detail.
              </div>
            )}
          </div>
        </div>

        {/* Verification Queue (List of new reports) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
          <div>
            <h4 className="font-extrabold text-sm text-slate-800">Antrean Verifikasi</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Laporan masuk baru yang memerlukan validasi segera</p>
          </div>

          <div className="flex flex-col gap-3 flex-grow justify-start">
            {verificationQueue.length === 0 ? (
              <div className="my-auto text-center text-xs text-slate-400 py-10">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 opacity-40 mb-2 animate-bounce" />
                Semua laporan terverifikasi!
              </div>
            ) : (
              verificationQueue.map((comp) => (
                <div 
                  key={comp.id}
                  onClick={() => navigate(`/admin/complaints/${comp.id}`)}
                  className="p-3 border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 rounded-xl flex items-center justify-between cursor-pointer transition-all hover:translate-x-1"
                >
                  <div className="min-w-0 pr-3">
                    <span className="text-[8px] font-bold text-slate-400">{comp.ticket_number}</span>
                    <h5 className="font-bold text-xs text-slate-800 truncate mt-0.5">{comp.title}</h5>
                    <span className="text-[9px] font-semibold text-slate-400">{comp.user_name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))
            )}
          </div>

          {verificationQueue.length > 0 && (
            <button 
              onClick={() => navigate('/admin/complaints?status=Menunggu Verifikasi')}
              className="w-full text-center py-2 border border-slate-100 hover:border-slate-200 rounded-xl text-[10px] font-bold text-brand-600 hover:bg-slate-50 transition-colors"
            >
              Lihat Semua Antrean ({pending})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
