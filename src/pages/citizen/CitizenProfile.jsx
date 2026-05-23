import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import {
  User,
  LogOut,
  Phone,
  ShieldCheck,
  MapPin,
  ExternalLink,
  BookOpen,
  AlertCircle,
  Mail,
  RefreshCw,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { OTP_LENGTH, OTP_RESEND_COOLDOWN_MS } from '../../constants/emailVerification';

export const CitizenProfile = () => {
  const {
    currentUser,
    logout,
    complaints,
    sendEmailVerificationOtp,
    resendEmailVerificationOtp,
    verifyCurrentUserEmail,
  } = useAppData();
  const navigate = useNavigate();

  const [otpStep, setOtpStep] = useState('idle');
  const [otp, setOtp] = useState('');
  const [demoOtpHint, setDemoOtpHint] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!currentUser) {
      navigate('/maturcapil/login');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const t = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  if (!currentUser) return null;

  const userComplaints = complaints.filter((c) => c.user_id === currentUser.id);
  const total = userComplaints.length;
  const selesai = userComplaints.filter((c) => c.status === 'Selesai').length;
  const proses = userComplaints.filter((c) => c.status === 'Diproses').length;
  const pending = userComplaints.filter((c) => c.status === 'Menunggu Verifikasi').length;
  const emailVerified = currentUser.email_verified;

  const handleLogout = () => {
    logout();
    navigate('/maturcapil');
  };

  const handleSendOtp = async () => {
    setVerifyError('');
    const result = await sendEmailVerificationOtp();
    if (result.success) {
      setDemoOtpHint(result.demoOtp || '');
      setOtpStep('otp');
      setOtp('');
      setResendCooldown(Math.ceil(OTP_RESEND_COOLDOWN_MS / 1000));
    } else {
      setVerifyError(result.message);
    }
  };

  const handleResendOtp = async () => {
    setVerifyError('');
    const result = await resendEmailVerificationOtp();
    if (result.success) {
      setDemoOtpHint(result.demoOtp || '');
      setResendCooldown(Math.ceil(OTP_RESEND_COOLDOWN_MS / 1000));
    } else {
      setVerifyError(result.message);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setVerifyError('');
    if (otp.length !== OTP_LENGTH) {
      setVerifyError(`Masukkan kode OTP ${OTP_LENGTH} digit.`);
      return;
    }
    setVerifyLoading(true);
    (async () => {
      const result = await verifyCurrentUserEmail(otp);
      setVerifyLoading(false);
      if (result.success) {
        setOtpStep('idle');
        setOtp('');
        setDemoOtpHint('');
      } else {
        setVerifyError(result.message);
      }
    })();
  };

  return (
    <div className="p-4 flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <User className="w-5 h-5 text-brand-500" />
        <div>
          <h2 className="font-extrabold text-base text-slate-800">Profil Saya</h2>
          <p className="text-[10px] text-slate-400 font-medium">Informasi akun dan riwayat aktivitas Anda</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200/85 rounded-2xl p-5 shadow-xs flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-brand-500 text-white font-extrabold text-2xl flex items-center justify-center border-4 border-brand-50 shadow-inner">
          {currentUser.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-extrabold text-sm text-slate-800">{currentUser.name}</h3>
          <p className="text-xs text-slate-400 font-medium truncate">{currentUser.email}</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
              Warga Kota Semarang
            </span>
            {emailVerified ? (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                <CheckCircle2 className="w-3 h-3" /> Email terverifikasi
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-100">
                <Mail className="w-3 h-3" /> Email belum diverifikasi
              </span>
            )}
          </div>
        </div>
      </div>

      {!emailVerified && (
        <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs text-slate-800">Verifikasi Email</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                Tanpa verifikasi, Anda hanya dapat membuat <strong>1 laporan</strong>. Setelah verifikasi, laporan
                tanpa batas.
              </p>
            </div>
          </div>

          {verifyError && (
            <div className="text-xs px-3 py-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              {verifyError}
            </div>
          )}

          {otpStep === 'idle' && (
            <button
              type="button"
              onClick={handleSendOtp}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs py-2.5 rounded-xl transition-colors"
            >
              Kirim Kode OTP ke Email
            </button>
          )}

          {otpStep === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3">
              <p className="text-[10px] text-slate-500 text-center">
                Kode dikirim ke <span className="font-semibold">{currentUser.email}</span>
              </p>

              {demoOtpHint && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-center">
                  <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">Demo OTP</p>
                  <p className="text-lg font-mono font-black text-amber-900 tracking-[0.3em]">{demoOtpHint}</p>
                </div>
              )}

              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH))}
                placeholder="000000"
                className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl px-4 py-2.5 text-center text-lg font-mono tracking-[0.4em] text-slate-700 focus:outline-hidden"
                maxLength={OTP_LENGTH}
              />

              <button
                type="submit"
                disabled={verifyLoading}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs py-2.5 rounded-xl disabled:opacity-50"
              >
                {verifyLoading ? 'Memverifikasi...' : 'Verifikasi Email'}
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0}
                className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-600 py-1 disabled:opacity-40"
              >
                <RefreshCw className="w-4 h-4" />
                {resendCooldown > 0 ? `Kirim ulang (${resendCooldown}s)` : 'Kirim ulang OTP'}
              </button>
            </form>
          )}
        </div>
      )}

      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <h4 className="font-extrabold text-xs text-slate-700 mb-3 uppercase tracking-wider text-[10px]">
          Statistik Pengaduan Anda
        </h4>

        <div className="grid grid-cols-4 gap-2">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
            <h5 className="font-extrabold text-sm text-slate-800">{total}</h5>
            <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Total</p>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
            <h5 className="font-extrabold text-sm text-slate-800">{pending}</h5>
            <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Verifikasi</p>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
            <h5 className="font-extrabold text-sm text-slate-800">{proses}</h5>
            <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Proses</p>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
            <h5 className="font-extrabold text-sm text-emerald-600">{selesai}</h5>
            <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Selesai</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col">
        <div className="bg-slate-50 border-b border-slate-100 px-4 py-2.5">
          <h4 className="font-bold text-[10px] text-slate-500 uppercase tracking-wider">Kontak & Layanan Darurat</h4>
        </div>

        <div className="flex flex-col text-xs text-slate-600">
          <a
            href="tel:112"
            className="flex items-center justify-between p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Phone className="w-4.5 h-4.5 text-brand-500" />
              <div>
                <span className="font-bold block text-slate-850">Call Center Semarang (112)</span>
                <span className="text-[10px] text-slate-450 mt-0.5">Layanan darurat bebas pulsa pemprov</span>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>

          <a
            href="https://maps.google.com/?q=Dispendukcapil+Kota+Semarang"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-4.5 h-4.5 text-brand-500" />
              <div>
                <span className="font-bold block text-slate-850">Kantor Dispendukcapil Semarang</span>
                <span className="text-[10px] text-slate-450 mt-0.5">Jl. Kanguru Raya No.3, Gayamsari</span>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>

          <button
            type="button"
            onClick={() =>
              alert(
                'Sistem LaporCapil mendukung file gambar JPG/PNG (maks 5MB) dan secara otomatis mengompresnya saat pengiriman untuk kecepatan loading.'
              )
            }
            className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-4.5 h-4.5 text-brand-500" />
              <div>
                <span className="font-bold block text-slate-850">Petunjuk Penggunaan Aplikasi</span>
                <span className="text-[10px] text-slate-450 mt-0.5">Pelajari syarat dan ketentuan kompresi berkas</span>
              </div>
            </div>
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        Keluar Dari Akun
      </button>
    </div>
  );
};
