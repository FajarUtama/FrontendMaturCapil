import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import { ComplaintMapView } from '../../components/map/ComplaintMapView';
import { CHAT_POLL_INTERVAL_MS } from '../../config/env';
import {
  ArrowLeft,
  MapPin,
  Tag,
  Clock,
  MessageSquare,
  Send,
  Printer,
  CheckCircle2,
  XCircle,
  FileText,
  BadgeAlert,
  User,
  Upload,
  X
} from 'lucide-react';

export const AdminComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    complaints,
    categories,
    statusLogs,
    chats,
    currentUser,
    updateComplaintStatus,
    closeComplaint,
    addChatMessage,
    loadComplaintExtras,
    isApiMode,
  } = useAppData();

  const [chatMessage, setChatMessage] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [verifyNote, setVerifyNote] = useState('');

  // Resolution uploader states
  const [resNote, setResNote] = useState('');
  const [afterPhotos, setAfterPhotos] = useState([]);
  const [resError, setResError] = useState('');

  // Print preview state
  const [showPrintModal, setShowPrintModal] = useState(false);

  const messagesEndRef = useRef(null);

  // Find complaint
  const complaint = complaints.find(c => c.id === id);

  // Guard
  useEffect(() => {
    if (!complaint) {
      navigate('/admin/complaints');
    }
  }, [complaint, navigate]);

  useEffect(() => {
    if (!id) return;
    loadComplaintExtras(id);
    if (!isApiMode) return undefined;
    const timer = setInterval(() => loadComplaintExtras(id), CHAT_POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [id, isApiMode, loadComplaintExtras]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, id]);

  if (!complaint || !currentUser) return null;

  const category = categories.find(cat => cat.id === complaint.category_id);
  const logs = statusLogs.filter(log => log.complaint_id === complaint.id);
  const complaintChats = chats.filter(chat => chat.complaint_id === complaint.id);

  // Chat message send handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const msg = chatMessage;
    setChatMessage('');
    await addChatMessage(complaint.id, msg, currentUser.id);
  };

  const handleApprove = async () => {
    const note = verifyNote.trim() || 'Aduan disetujui untuk diproses lebih lanjut oleh Operator Pelayanan.';
    await updateComplaintStatus(complaint.id, 'Diproses', note);
    setVerifyNote('');
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectNote.trim()) return;
    await updateComplaintStatus(complaint.id, 'Ditolak', `Aduan ditolak. Alasan: ${rejectNote}`);
    setRejectNote('');
    setShowRejectForm(false);
  };

  // Resolution upload handler
  const handleAfterPhotoUpload = (e) => {
    setResError('');
    const files = Array.from(e.target.files);

    if (afterPhotos.length + files.length > 1) {
      setResError('Hanya diperlukan 1 foto bukti perbaikan.');
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        setResError('Ukuran file melebihi 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAfterPhotos([reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resNote.trim()) {
      setResError('Mohon isi catatan tindakan penyelesaian.');
      return;
    }

    await closeComplaint(complaint.id, resNote, afterPhotos);
    setResNote('');
    setAfterPhotos([]);
  };

  const triggerPrint = () => {
    window.print();
  };

  const getStatusBadge = (status) => {
    const classes = {
      'Menunggu Verifikasi': 'bg-slate-100 text-slate-700 border-slate-200',
      'Diproses': 'bg-amber-50 text-amber-700 border-amber-200',
      'Selesai': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Ditolak': 'bg-rose-50 text-rose-700 border-rose-200'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${classes[status] || classes['Menunggu Verifikasi']}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6 font-sans print:p-0 print:bg-white">

      {/* Back button and document actions (Hidden in print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-150 pb-3 print:hidden">
        <button
          onClick={() => navigate('/admin/complaints')}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-bold text-xs shrink-0"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
          Daftar Pengaduan
        </button>

        <button
          onClick={() => setShowPrintModal(true)}
          className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs transition-all active:scale-95 shadow-sm"
        >
          <Printer className="w-4 h-4 shrink-0" />
          <span className="text-center">Cetak Dokumen Surat Pengajuan</span>
        </button>
      </div>

      {/* Grid: Left Column (Complaint details & action form) & Right Column (Logs & Chats) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Detail card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4 print:border-0 print:shadow-none">

            <div className="flex justify-between items-start gap-2 flex-wrap">
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold tracking-widest uppercase">{complaint.ticket_number}</span>
                <h3 className="font-extrabold text-base text-slate-800 mt-0.5">{complaint.title}</h3>
              </div>
              {getStatusBadge(complaint.status)}
            </div>

            {/* Badges metadata info */}
            <div className="grid grid-cols-2 gap-3 border-y border-slate-100 py-3 text-[11px] font-semibold text-slate-500">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-slate-450" />
                <span>Kategori: {category?.name || complaint.category_id}</span>
              </div>
              <div className="flex items-center gap-2">
                <BadgeAlert className="w-4 h-4 text-slate-450" />
                <span>Prioritas: {complaint.priority}</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <User className="w-4 h-4 text-slate-450" />
                <span>Diajukan Oleh: <span className="font-bold text-slate-850">{complaint.user_name}</span></span>
              </div>
            </div>

            {/* Address */}
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-150/60">
                <MapPin className="w-4.5 h-4.5 text-brand-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold block text-[10px] uppercase text-slate-450 tracking-wider">Lokasi Kejadian</span>
                  <p className="mt-0.5 leading-normal">{complaint.address}</p>
                  <span className="text-[9.5px] text-slate-400 font-semibold block mt-1">
                    Koord: {complaint.latitude.toFixed(4)}, {complaint.longitude.toFixed(4)}
                  </span>
                </div>
              </div>
              <ComplaintMapView latitude={complaint.latitude} longitude={complaint.longitude} />
            </div>

            {/* Description */}
            <div className="mt-1">
              <span className="font-bold block text-[10px] uppercase text-slate-455 tracking-wider">Isi Laporan Pengaduan</span>
              <p className="text-xs text-slate-600 leading-relaxed mt-1.5 whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-100">{complaint.description}</p>
            </div>

            {/* Image Attachments Before */}
            {complaint.photos && complaint.photos.length > 0 && (
              <div className="mt-1">
                <span className="font-bold block text-[10px] uppercase text-slate-455 tracking-wider mb-2">Foto Lampiran Bukti Warga</span>
                <div className="flex gap-3 flex-wrap">
                  {complaint.photos.map((photo, idx) => (
                    <a key={idx} href={photo} target="_blank" rel="noreferrer" className="block relative group overflow-hidden border border-slate-205 rounded-xl">
                      <img src={photo} alt="Bukti" className="w-32 h-24 object-cover group-hover:scale-105 transition-transform" />
                      <span className="absolute inset-0 bg-black/40 text-white flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">Zoom 🔍</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Image & note After (If Solved) */}
            {complaint.status === 'Selesai' && (
              <div className="mt-2 bg-emerald-50/80 border border-emerald-100 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-bold text-[10px] uppercase tracking-wider">Catatan Penyelesaian Pemerintah</span>
                </div>
                <p className="text-xs text-emerald-700 leading-relaxed font-semibold">
                  {complaint.resolution_note || 'Laporan telah berhasil ditangani oleh staf operator pelayanan.'}
                </p>
                {complaint.evidence_after_photos && complaint.evidence_after_photos.length > 0 && (
                  <div className="mt-1">
                    <span className="text-[10px] font-bold text-emerald-600 block mb-1.5">Bukti Penyelesaian Lapangan:</span>
                    <img
                      src={complaint.evidence_after_photos[0]}
                      alt="Sebelum/Sesudah"
                      className="w-full max-w-md h-48 object-cover rounded-lg border border-emerald-250/50 shadow-inner"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Verification & Resolution Cockpit Actions form (Hidden in print) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4 print:hidden">
            <h4 className="font-extrabold text-xs text-slate-800 border-b border-slate-100 pb-2.5 uppercase tracking-wider text-[10px]">Tindakan Birokrasi Pelayanan</h4>

            {/* Mode 1: Menunggu Verifikasi */}
            {complaint.status === 'Menunggu Verifikasi' && (
              <div className="flex flex-col gap-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Laporan warga ini baru masuk. Mohon lakukan verifikasi validitas berkas di lapangan atau server. Jika valid, klik setujui untuk mengubah status ke <span className="font-bold">Diproses</span>. Jika tidak valid, masukkan catatan dan klik tolak.
                </p>

                {showRejectForm ? (
                  <form onSubmit={handleRejectSubmit} className="flex flex-col gap-3 p-4 bg-rose-50/50 rounded-xl border border-rose-100 animate-slide-down">
                    <span className="text-[10px] font-bold text-rose-700 uppercase">Alasan Penolakan Laporan *</span>
                    <textarea
                      placeholder="Tuliskan catatan detail penolakan (e.g. Berkas sudah lengkap di database kami, harap upload foto KTP dengan jelas)..."
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      rows={2}
                      className="w-full bg-white border border-slate-200 focus:border-rose-500 rounded-lg p-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-hidden leading-normal"
                      required
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowRejectForm(false)}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold text-xs rounded-lg transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Tolak Laporan
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      placeholder="Tulis catatan persetujuan verifikasi (opsional)..."
                      value={verifyNote}
                      onChange={(e) => setVerifyNote(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-205 focus:border-brand-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-hidden transition-all shadow-xs"
                    />

                    <div className="flex gap-3">
                      <button
                        onClick={handleApprove}
                        className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-brand-550/15 cursor-pointer active:scale-98"
                      >
                        <CheckCircle2 className="w-4.5 h-4.5" />
                        Setujui Laporan (Proses)
                      </button>
                      <button
                        onClick={() => setShowRejectForm(true)}
                        className="py-3 px-6 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
                      >
                        <XCircle className="w-4.5 h-4.5" />
                        Tolak
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mode 2: Diproses */}
            {complaint.status === 'Diproses' && (
              <form onSubmit={handleResolveSubmit} className="flex flex-col gap-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Laporan aduan dalam masa perbaikan/pengerjaan staf. Tutup laporan ini dengan mengunggah foto penyelesaian adminduk (misal scan KTP terbit baru) dan catatan penyelesaian resmi.
                </p>

                {resError && (
                  <span className="text-[10px] text-rose-600 font-bold block">{resError}</span>
                )}

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Catatan Penyelesaian Dinas *</span>
                  <textarea
                    placeholder="Tuliskan detail perbaikan yang telah dilakukan staf (e.g. blangko KTP-el telah disuplai ke kecamatan, KTP baru atas nama warga bersangkutan sudah dicetak)..."
                    value={resNote}
                    onChange={(e) => setResNote(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl p-3 text-xs text-slate-700 placeholder-slate-400 focus:outline-hidden transition-all shadow-xs leading-relaxed"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Foto Bukti Penyelesaian (Maks 1 Foto, @5MB)</span>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {/* Preview box */}
                    {afterPhotos.map((photo, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl border border-slate-200 overflow-hidden">
                        <img src={photo} alt="Penyelesaian" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setAfterPhotos([])}
                          className="absolute top-1 right-1 p-1 bg-slate-900/80 text-white rounded-full hover:bg-slate-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {/* Uploader button */}
                    {afterPhotos.length === 0 && (
                      <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 hover:border-brand-500 bg-slate-50 hover:bg-white flex flex-col justify-center items-center gap-1 cursor-pointer transition-colors shadow-xs">
                        <Upload className="w-5 h-5 text-slate-400" />
                        <span className="text-[9px] text-slate-450 font-bold">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAfterPhotoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 cursor-pointer active:scale-98"
                >
                  <CheckCircle2 className="w-4.5 h-4.5" />
                  Selesaikan & Tutup Aduan Warga
                </button>
              </form>
            )}

            {/* Mode 3 & 4: Selesai / Ditolak */}
            {(complaint.status === 'Selesai' || complaint.status === 'Ditolak') && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center text-xs text-slate-500 font-semibold">
                Laporan ini sudah bersifat final ({complaint.status}) dan diarsipkan.
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6 print:hidden">

          {/* Timeline Logs history */}
          <div className="bg-white border border-slate-205 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
            <h4 className="font-extrabold text-xs text-slate-800 border-b border-slate-50 pb-2">Log Audit Riwayat Aduan</h4>

            <div className="relative border-l border-slate-200 pl-4 ml-2 flex flex-col gap-5 py-1">
              {logs.map((log) => (
                <div key={log.id} className="relative">
                  <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full border border-white bg-slate-400" />
                  <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold">
                    <span>{new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>{new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <h5 className="font-bold text-[11px] text-slate-800 mt-0.5">{log.status}</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{log.note}</p>
                  <span className="text-[8px] text-slate-400 mt-0.5 block italic">Oleh: {log.changed_by}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chat box */}
          <div className="bg-white border border-slate-205 rounded-2xl shadow-xs overflow-hidden flex flex-col h-[680px]">
            {/* Header */}
            <div className="bg-slate-900 px-4 py-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-500" />
                <h4 className="font-bold text-xs">Hubungi Pelapor (Warga)</h4>
              </div>
              <span className="text-[8px] bg-slate-800 text-slate-350 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Internal Chat</span>
            </div>

            {/* Messages */}
            <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-3 bg-slate-50/50">
              {complaintChats.length === 0 ? (
                <div className="my-auto text-center text-slate-400 text-xs py-10 font-semibold">
                  Belum ada pesan terkirim. Kirim pesan pengingat ke warga.
                </div>
              ) : (
                complaintChats.map((chat) => {
                  const isMe = chat.sender_id === currentUser.id;
                  return (
                    <div key={chat.id} className={`flex flex-col max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                      <span className="text-[9px] text-slate-400 font-bold mb-0.5 px-1">{chat.sender_name}</span>
                      <div className={`p-2.5 rounded-2xl text-[11px] leading-relaxed ${isMe
                          ? 'bg-slate-900 text-white rounded-tr-xs shadow-xs'
                          : 'bg-white border border-slate-150 text-slate-700 rounded-tl-xs shadow-xs'
                        }`}>
                        {chat.message}
                      </div>
                      <span className="text-[8px] text-slate-400 mt-0.5 px-1">
                        {new Date(chat.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Send input */}
            <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-150 bg-white flex gap-2 items-center">
              <input
                type="text"
                placeholder="Ketik pesan balas warga..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-grow bg-slate-50 border border-slate-205 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-brand-500 focus:bg-white transition-all placeholder-slate-450"
              />
              <button
                type="submit"
                className="p-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl active:scale-95 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Printable official document layout container */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs print:relative print:bg-white print:p-0 print:inset-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] print:max-h-full print:shadow-none print:rounded-none">
            {/* Toolbar (Hidden during print) */}
            <div className="bg-slate-800 text-white px-5 py-3 flex justify-between items-center print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-500" />
                <h4 className="font-bold text-sm">Pratinjau Surat Dokumen Dinas Resmi</h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={triggerPrint}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak (Print)
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-350 hover:text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Document body printable */}
            <div className="p-10 overflow-y-auto bg-white flex flex-col gap-6 text-slate-800 font-serif print:overflow-visible">

              {/* Kop Surat */}
              <div className="flex items-center gap-4 border-b-4 border-double border-slate-950 pb-4 text-center">
                <span className="text-5xl">🏛️</span>
                <div className="flex-grow">
                  <h3 className="font-bold text-base uppercase leading-tight">Pemerintah Kota Semarang</h3>
                  <h2 className="font-extrabold text-lg uppercase leading-tight tracking-wide">Dinas Kependudukan dan Pencatatan Sipil</h2>
                  <p className="text-[10px] font-sans font-semibold text-slate-500 mt-1 italic">
                    Jl. Kanguru Raya No. 3, Gayamsari, Kota Semarang. Telp: (024) 6706700, Fax: (024) 6706701
                  </p>
                </div>
              </div>

              {/* Subject */}
              <div className="text-center my-2">
                <h3 className="font-bold text-base underline uppercase">Surat Tanda Penerimaan Pengaduan</h3>
                <p className="text-xs font-sans font-bold mt-1 text-slate-500">Nomor Registrasi Laporan: {complaint.ticket_number}</p>
              </div>

              {/* Body */}
              <div className="text-xs leading-relaxed flex flex-col gap-3 font-sans">
                <p>
                  Dinas Kependudukan dan Pencatatan Sipil Kota Semarang menerangkan bahwa pada hari
                  <span className="font-bold"> {new Date(complaint.created_at).toLocaleDateString('id-ID', { weekday: 'long' })}</span>, tanggal
                  <span className="font-bold"> {new Date(complaint.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>,
                  telah diterima pengaduan resmi terkait pelayanan publik Dispendukcapil dengan rincian berikut:
                </p>

                {/* Identity table */}
                <table className="w-full border-collapse my-2 border border-slate-205">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="w-1/3 py-2 px-3 bg-slate-50 font-bold">Nama Pelapor</td>
                      <td className="py-2 px-3">{complaint.user_name}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="w-1/3 py-2 px-3 bg-slate-50 font-bold">Kategori Layanan</td>
                      <td className="py-2 px-3">{category?.name}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="w-1/3 py-2 px-3 bg-slate-50 font-bold">Prioritas Aduan</td>
                      <td className="py-2 px-3 font-semibold">{complaint.priority}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="w-1/3 py-2 px-3 bg-slate-50 font-bold">Lokasi Aduan</td>
                      <td className="py-2 px-3">{complaint.address}</td>
                    </tr>
                    <tr>
                      <td className="w-1/3 py-2 px-3 bg-slate-50 font-bold">Status Saat Ini</td>
                      <td className="py-2 px-3 font-bold">{complaint.status}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Detail Description */}
                <div className="mt-2">
                  <h4 className="font-bold text-xs uppercase border-b border-slate-200 pb-1 mb-1.5 text-slate-700">Isi Pengaduan Warga:</h4>
                  <p className="bg-slate-55 p-3 rounded-lg border border-slate-100 italic whitespace-pre-line leading-relaxed">
                    "{complaint.description}"
                  </p>
                </div>

                {/* Attachment photo indicator */}
                {complaint.photos && complaint.photos.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1">
                    <h4 className="font-bold text-xs uppercase text-slate-700">Lampiran Foto Bukti Warga:</h4>
                    <div className="flex gap-2">
                      {complaint.photos.map((photo, idx) => (
                        <img
                          key={idx}
                          src={photo}
                          alt="Lampiran Dokumen"
                          className="w-32 h-24 object-cover border border-slate-300 rounded-md"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Signature block */}
              <div className="mt-8 flex justify-between items-center text-xs font-sans">
                <div className="text-center">
                  <p className="text-slate-400">Verifikasi Barcode Dinas</p>
                  <div className="w-20 h-20 border border-slate-200 mt-1 mx-auto flex items-center justify-center bg-slate-50 text-[8px] font-mono text-slate-400">
                    QR CODE MOCKUP
                  </div>
                </div>
                <div className="text-center pr-6">
                  <p>Semarang, {new Date(complaint.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="font-bold mt-1">Petugas Layanan Capil,</p>
                  <div className="h-12 flex items-center justify-center font-serif text-slate-350 italic">
                    (Digital Signature)
                  </div>
                  <p className="font-bold border-t border-slate-400 pt-1">Dispendukcapil Kota Semarang</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
