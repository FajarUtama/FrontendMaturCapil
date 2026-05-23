import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMockData } from '../../context/MockDataContext';
import { 
  ArrowLeft, 
  MapPin, 
  Tag, 
  Clock, 
  MessageSquare, 
  Send, 
  Printer, 
  Star, 
  CheckCircle,
  FileText,
  BadgeAlert
} from 'lucide-react';

export const CitizenComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    complaints, 
    categories, 
    statusLogs, 
    chats, 
    currentUser, 
    addChatMessage 
  } = useMockData();

  const [chatMessage, setChatMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [showPrintModal, setShowPrintModal] = useState(false);

  const messagesEndRef = useRef(null);

  // Find complaint
  const complaint = complaints.find(c => c.id === id);
  
  // Guard: If complaint not found
  useEffect(() => {
    if (!complaint) {
      navigate('/maturcapil');
    }
  }, [complaint, navigate]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  if (!complaint || !currentUser) return null;

  const category = categories.find(cat => cat.id === complaint.category_id);
  const logs = statusLogs.filter(log => log.complaint_id === complaint.id);
  const complaintChats = chats.filter(chat => chat.complaint_id === complaint.id);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    addChatMessage(complaint.id, chatMessage, currentUser.id);
    setChatMessage('');
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return;
    setFeedbackSubmitted(true);
  };

  const triggerPrint = () => {
    window.print();
  };

  const getPriorityColor = (p) => {
    if (p === 'Tinggi') return 'bg-rose-550 border-rose-200 text-rose-700';
    if (p === 'Sedang') return 'bg-amber-50 border-amber-200 text-amber-700';
    return 'bg-slate-50 border-slate-200 text-slate-700';
  };

  return (
    <div className="p-4 flex flex-col gap-5 animate-slide-up print:p-0 print:bg-white">
      
      {/* Back Header - Hidden in Print */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-1 text-slate-500 hover:text-slate-700 font-bold text-xs"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
          Kembali
        </button>
        
        <button 
          onClick={() => setShowPrintModal(true)}
          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl text-[10px] font-bold transition-all active:scale-95"
        >
          <Printer className="w-3.5 h-3.5" />
          Surat Pengajuan
        </button>
      </div>

      {/* Main Complaint Detail */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-3 shadow-xs print:border-0 print:shadow-none">
        
        {/* Ticket Header */}
        <div className="flex justify-between items-start gap-2 flex-wrap">
          <div>
            <span className="text-[10px] text-slate-400 font-bold tracking-tight">{complaint.ticket_number}</span>
            <h2 className="font-extrabold text-sm text-slate-800 mt-0.5">{complaint.title}</h2>
          </div>
          <span className="inline-flex px-2 py-0.5 bg-brand-50 border border-brand-100 text-brand-700 font-bold text-[9px] rounded-md">
            {complaint.status}
          </span>
        </div>

        {/* Info badges */}
        <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-slate-500 mt-1 border-y border-slate-50 py-2">
          <div className="flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span>Kategori: {category?.name || complaint.category_id}</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1">
            <BadgeAlert className="w-3.5 h-3.5 text-slate-400" />
            <span>Prioritas: {complaint.priority}</span>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-start gap-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <MapPin className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-bold block text-[10px] uppercase text-slate-400 tracking-wider">Lokasi Kejadian</span>
            <p className="mt-0.5">{complaint.address}</p>
          </div>
        </div>

        {/* Description */}
        <div className="mt-1">
          <span className="font-bold block text-[10px] uppercase text-slate-400 tracking-wider">Deskripsi Masalah</span>
          <p className="text-xs text-slate-600 leading-relaxed mt-1 whitespace-pre-line">{complaint.description}</p>
        </div>

        {/* Image before */}
        {complaint.photos && complaint.photos.length > 0 && (
          <div className="mt-1">
            <span className="font-bold block text-[10px] uppercase text-slate-400 tracking-wider mb-1.5">Foto Lampiran Bukti</span>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {complaint.photos.map((photo, idx) => (
                <img 
                  key={idx} 
                  src={photo} 
                  alt="Bukti Aduan" 
                  className="w-24 h-24 object-cover rounded-xl border border-slate-200 flex-shrink-0"
                />
              ))}
            </div>
          </div>
        )}

        {/* Resolution section & after photo if Solved */}
        {complaint.status === 'Selesai' && (
          <div className="mt-2 bg-emerald-50/80 border border-emerald-100/60 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center gap-1 text-emerald-800">
              <CheckCircle className="w-4.5 h-4.5" />
              <span className="font-bold text-[10px] uppercase tracking-wider">Catatan Penyelesaian Admin</span>
            </div>
            <p className="text-xs text-emerald-700 leading-relaxed font-medium">
              {complaint.resolution_note || 'Aduan telah selesai ditangani oleh staf Dispendukcapil Semarang.'}
            </p>
            {complaint.evidence_after_photos && complaint.evidence_after_photos.length > 0 && (
              <div className="mt-1.5">
                <span className="text-[10px] font-bold text-emerald-600 block mb-1">Bukti Foto Hasil Perbaikan:</span>
                <img 
                  src={complaint.evidence_after_photos[0]} 
                  alt="Bukti Selesai" 
                  className="w-full h-36 object-cover rounded-lg border border-emerald-200/50"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Activity Timeline Tracker */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-3 shadow-xs print:hidden">
        <h4 className="font-extrabold text-xs text-slate-800 border-b border-slate-100 pb-2">Status & Timeline Progress</h4>
        
        <div className="relative border-l border-slate-200 pl-4 ml-2 flex flex-col gap-5 py-2">
          {logs.map((log, index) => (
            <div key={log.id} className="relative">
              {/* Timeline dot */}
              <span className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                index === logs.length - 1 ? 'bg-brand-500 scale-125' : 'bg-slate-400'
              }`} />
              
              <div className="flex justify-between items-start text-[10px] text-slate-400 font-bold">
                <span>{new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                <span>{new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
              </div>
              <h5 className="font-bold text-xs text-slate-800 mt-0.5">{log.status}</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{log.note}</p>
              <span className="text-[9px] text-slate-400 italic block mt-0.5">Oleh: {log.changed_by}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Section */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col h-[320px] print:hidden">
        {/* Chat Header */}
        <div className="bg-slate-800 px-4 py-2.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand-500" />
            <h4 className="font-bold text-xs">Pesan Pelayanan Terpadu</h4>
          </div>
          <span className="text-[9px] bg-slate-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Masyarakat & Admin</span>
        </div>

        {/* Chat message list */}
        <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-3 bg-slate-50/50">
          {complaintChats.length === 0 ? (
            <div className="my-auto text-center text-slate-400 text-xs py-10 font-semibold">
              Belum ada percakapan. Kirim pesan ke admin di bawah.
            </div>
          ) : (
            complaintChats.map((chat) => {
              const isMe = chat.sender_id === currentUser.id;
              return (
                <div key={chat.id} className={`flex flex-col max-w-[75%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                  <span className="text-[9px] text-slate-400 font-bold mb-0.5 px-1">{chat.sender_name}</span>
                  <div className={`p-2.5 rounded-2xl text-xs leading-relaxed ${
                    isMe 
                      ? 'bg-brand-500 text-white rounded-tr-xs shadow-xs' 
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

        {/* Chat input */}
        <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-150 bg-white flex gap-2 items-center">
          <input 
            type="text" 
            placeholder="Ketik pesan..."
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-brand-500 focus:bg-white transition-all placeholder-slate-400"
          />
          <button 
            type="submit"
            className="p-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl active:scale-95 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Citizen Feedback Form (Only when Status == Selesai) */}
      {complaint.status === 'Selesai' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs print:hidden">
          <h4 className="font-extrabold text-xs text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Star className="w-4.5 h-4.5 text-amber-500 fill-amber-500" />
            Evaluasi Pelayanan
          </h4>
          
          {feedbackSubmitted ? (
            <div className="text-center py-6 flex flex-col items-center gap-2 animate-scale-up">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
              <p className="text-xs font-bold text-slate-700">Terima kasih atas ulasan Anda!</p>
              <p className="text-[10px] text-slate-400">Feedback Anda membantu kami meningkatkan pelayanan.</p>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="flex flex-col gap-3 mt-3">
              <p className="text-[11px] text-slate-500">Seberapa puas Anda dengan penyelesaian aduan ini?</p>
              
              {/* Stars rating selector */}
              <div className="flex gap-1.5 my-1 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-slate-300 transition-colors hover:scale-110 active:scale-95"
                  >
                    <Star 
                      className={`w-7 h-7 ${
                        star <= (hoverRating || rating) 
                          ? 'text-amber-400 fill-amber-400' 
                          : 'text-slate-200'
                      }`} 
                    />
                  </button>
                ))}
              </div>

              <textarea
                placeholder="Berikan saran atau kritik Anda untuk layanan kami..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-hidden focus:border-brand-500 focus:bg-white transition-all placeholder-slate-400 leading-normal"
              />

              <button
                type="submit"
                disabled={rating === 0}
                className="w-full py-2.5 bg-brand-500 text-white text-xs font-bold rounded-xl hover:bg-brand-600 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-sm"
              >
                Kirim Penilaian
              </button>
            </form>
          )}
        </div>
      )}

      {/* Official Printed Document Preview Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs print:relative print:bg-white print:p-0 print:inset-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] print:max-h-full print:shadow-none print:rounded-none">
            {/* Modal Control Toolbar (Hidden during print) */}
            <div className="bg-slate-800 text-white px-5 py-3 flex justify-between items-center print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-500" />
                <h4 className="font-bold text-sm">Dokumen Surat Pengaduan Resmi</h4>
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
                  className="bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Document Printable Body */}
            <div className="p-10 overflow-y-auto bg-white flex flex-col gap-6 text-slate-800 font-serif print:overflow-visible">
              
              {/* Kop Surat (Letter Head) */}
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

              {/* Body text */}
              <div className="text-xs leading-relaxed flex flex-col gap-3 font-sans">
                <p>
                  Dinas Kependudukan dan Pencatatan Sipil Kota Semarang menerangkan bahwa pada hari 
                  <span className="font-bold"> {new Date(complaint.created_at).toLocaleDateString('id-ID', { weekday: 'long' })}</span>, tanggal 
                  <span className="font-bold"> {new Date(complaint.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>, 
                  sistem telah menerima laporan pengaduan dari masyarakat dengan rincian identitas sebagai berikut:
                </p>

                {/* Identity table */}
                <table className="w-full border-collapse my-2 border border-slate-200">
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
                  <h4 className="font-bold text-xs uppercase border-b border-slate-200 pb-1 mb-1.5 text-slate-700">Isi Pengaduan:</h4>
                  <p className="bg-slate-55 p-3 rounded-lg border border-slate-100 italic whitespace-pre-line leading-relaxed">
                    "{complaint.description}"
                  </p>
                </div>

                {/* Attachment photo indicator */}
                {complaint.photos && complaint.photos.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1">
                    <h4 className="font-bold text-xs uppercase text-slate-700">Lampiran Foto Bukti Lapangan:</h4>
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
                  <p className="text-slate-400">Scan Verifikasi Keaslian</p>
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
