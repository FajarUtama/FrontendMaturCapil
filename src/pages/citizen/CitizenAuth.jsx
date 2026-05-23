import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import {
  Mail,
  User,
  ArrowRight,
  CheckCircle,
  ShieldAlert,
  CreditCard,
  ArrowLeft,
  RefreshCw,
  Info,
} from 'lucide-react';
import { PasswordField } from '../../components/auth/PasswordField';
import { DEMO_ACCOUNTS } from '../../constants/demoAccounts';
import { OTP_LENGTH, OTP_RESEND_COOLDOWN_MS } from '../../constants/emailVerification';

export const CitizenAuth = () => {
  const {
    login,
    registerCitizenStart,
    registerCitizenVerify,
    resendRegistrationOtp,
    currentUser,
  } = useAppData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/maturcapil';

  const [activeTab, setActiveTab] = useState('login');
  const [registerStep, setRegisterStep] = useState('form');

  const [name, setName] = useState('');
  const [nik, setNik] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [otp, setOtp] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [demoOtpHint, setDemoOtpHint] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (currentUser) navigate(redirect);
  }, [currentUser, navigate, redirect]);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const t = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const resetRegister = () => {
    setRegisterStep('form');
    setOtp('');
    setPendingEmail('');
    setDemoOtpHint('');
    setResendCooldown(0);
    setError('');
  };

  const fillDemoCitizen = () => {
    setEmail(DEMO_ACCOUNTS.citizen.email);
    setPassword(DEMO_ACCOUNTS.citizen.password);
    setPasswordConfirm(DEMO_ACCOUNTS.citizen.password);
    setError('');
    setActiveTab('login');
    resetRegister();
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Harap lengkapi email dan password.');
      return;
    }
    setIsLoading(true);
    (async () => {
      const result = await login(email, password, 'citizen');
      setIsLoading(false);
      if (result.success) navigate(redirect);
      else setError(result.message);
    })();
  };

  const handleRegisterForm = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    (async () => {
      const result = await registerCitizenStart({
        name,
        nik,
        email,
        password,
        passwordConfirm,
      });
      setIsLoading(false);
      if (result.success) {
        setPendingEmail(result.email);
        setDemoOtpHint(result.demoOtp || '');
        setRegisterStep('otp');
        setResendCooldown(Math.ceil(OTP_RESEND_COOLDOWN_MS / 1000));
        setOtp('');
      } else {
        setError(result.message);
      }
    })();
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');
    if (otp.length !== OTP_LENGTH) {
      setError(`Masukkan kode OTP ${OTP_LENGTH} digit.`);
      return;
    }
    setIsLoading(true);
    (async () => {
      const result = await registerCitizenVerify(pendingEmail, otp);
      setIsLoading(false);
      if (result.success) navigate(redirect);
      else setError(result.message);
    })();
  };

  const handleResendOtp = async () => {
    setError('');
    const result = await resendRegistrationOtp(pendingEmail);
    if (result.success) {
      setDemoOtpHint(result.demoOtp || '');
      setResendCooldown(Math.ceil(OTP_RESEND_COOLDOWN_MS / 1000));
      setError('');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="p-6 flex flex-col justify-center min-h-[70vh] animate-fade-in">
      <div className="text-center mb-6">
        <span className="text-4xl">🏛️</span>
        <h2 className="text-xl font-bold text-slate-800 mt-3">MaturCapil Semarang</h2>
        <p className="text-xs text-slate-400 mt-1">Sistem Pengaduan Layanan Adminduk Mandiri</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden p-6">
        {registerStep === 'form' && (
          <div className="flex border-b border-slate-150 mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setError('');
                resetRegister();
              }}
              className={`flex-1 pb-3 text-xs font-bold transition-all border-b-2 ${
                activeTab === 'login'
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-slate-400'
              }`}
            >
              Masuk Akun
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setError('');
              }}
              className={`flex-1 pb-3 text-xs font-bold transition-all border-b-2 ${
                activeTab === 'register'
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-slate-400'
              }`}
            >
              Daftar Baru
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs px-4 py-3 rounded-xl flex items-center gap-2.5">
            <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {activeTab === 'login' && registerStep === 'form' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Field label="Alamat Email" icon={Mail}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className={inputClass}
                autoComplete="email"
              />
            </Field>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="labelClass">Password</label>
                <button
                  type="button"
                  onClick={() =>
                    alert('Fitur reset password disimulasikan. Hubungi admin Dispendukcapil.')
                  }
                  className="text-[10px] text-brand-600 font-bold hover:underline"
                >
                  Lupa?
                </button>
              </div>
              <PasswordField
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <SubmitButton loading={isLoading} label="Masuk Portal" />
          </form>
        )}

        {activeTab === 'register' && registerStep === 'form' && (
          <form onSubmit={handleRegisterForm} className="flex flex-col gap-4">
            <div className="bg-sky-50 border border-sky-100 rounded-xl px-3 py-2.5 flex gap-2 text-[10px] text-sky-800 leading-relaxed">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                NIK wajib unik (16 digit angka). Email harus diverifikasi OTP. Sebelum verifikasi, Anda hanya
                dapat membuat <strong>1 laporan</strong>.
              </p>
            </div>

            <Field label="Nama Lengkap (sesuai KTP)" icon={User} required>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap"
                className={inputClass}
                required
              />
            </Field>

            <Field label="NIK (16 digit)" icon={CreditCard} required>
              <input
                type="text"
                inputMode="numeric"
                value={nik}
                onChange={(e) => setNik(e.target.value.replace(/\D/g, '').slice(0, 16))}
                placeholder="3374012345678901"
                className={`${inputClass} font-mono tracking-wider`}
                maxLength={16}
                required
              />
              <p className="text-[9px] text-slate-400 mt-0.5">{nik.length}/16 digit</p>
            </Field>

            <Field label="Alamat Email" icon={Mail} required>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className={inputClass}
                autoComplete="email"
                required
              />
            </Field>

            <div className="flex flex-col gap-1">
              <label className="labelClass">Password</label>
              <PasswordField
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <p className="text-[9px] text-slate-400">Min. 8 karakter, 1 angka, 1 huruf besar</p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="labelClass">Konfirmasi Password</label>
              <PasswordField
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <label className="flex items-start gap-2 text-[10px] text-slate-500 cursor-pointer">
              <input type="checkbox" required className="mt-0.5 rounded border-slate-300 text-brand-500" />
              <span>
                Saya menyatakan data yang diisi benar dan setuju dengan ketentuan layanan MaturCapil Semarang.
              </span>
            </label>

            <SubmitButton loading={isLoading} label="Lanjut — Verifikasi Email" />
          </form>
        )}

        {activeTab === 'register' && registerStep === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => {
                setRegisterStep('form');
                setError('');
              }}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-semibold w-fit"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke formulir
            </button>

            <div className="text-center">
              <h3 className="font-bold text-sm text-slate-800">Verifikasi Email</h3>
              <p className="text-xs text-slate-500 mt-1">
                Kode OTP dikirim ke <span className="font-semibold text-slate-700">{pendingEmail}</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-2">Berlaku 5 menit · Maks. kirim ulang 3x</p>
            </div>

            {demoOtpHint && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-center">
                <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">Demo OTP</p>
                <p className="text-lg font-mono font-black text-amber-900 tracking-[0.3em]">{demoOtpHint}</p>
              </div>
            )}

            <Field label={`Kode OTP (${OTP_LENGTH} digit)`} required>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH))}
                placeholder="000000"
                className={`${inputClass} text-center text-lg font-mono tracking-[0.4em]`}
                maxLength={OTP_LENGTH}
                required
              />
            </Field>

            <SubmitButton loading={isLoading} label="Verifikasi & Aktifkan Akun" />

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0}
              className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-600 py-2 disabled:opacity-40"
            >
              <RefreshCw className="w-4 h-4" />
              {resendCooldown > 0 ? `Kirim ulang (${resendCooldown}s)` : 'Kirim ulang OTP'}
            </button>
          </form>
        )}

        <div className="mt-6 border-t border-slate-100 pt-4 flex gap-2 items-start text-[10px] text-slate-400">
          <CheckCircle className="w-3.5 h-3.5 text-brand-500/50 shrink-0 mt-0.5" />
          <p>Data NIK disimpan aman dan ditampilkan tersensor bagi admin biasa.</p>
        </div>
      </div>

      {activeTab === 'login' && registerStep === 'form' && (
        <div className="mt-6 p-4 bg-slate-50 border border-slate-200/60 rounded-xl">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wide text-center mb-2">
            Isi otomatis (demo)
          </p>
          <button
            type="button"
            onClick={fillDemoCitizen}
            className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:border-brand-300 hover:bg-brand-50 rounded-xl text-xs font-bold text-slate-700 transition-colors"
          >
            👤 Isi akun warga demo
          </button>
          <p className="text-[9px] text-slate-400 text-center mt-2">
            {DEMO_ACCOUNTS.citizen.email} · {DEMO_ACCOUNTS.citizen.password}
          </p>
        </div>
      )}
    </div>
  );
};

const labelClass = 'text-[10px] uppercase font-bold text-slate-400 tracking-wider';
const inputClass =
  'w-full bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-brand-500/10 transition-all';

const Field = ({ label, icon: Icon, children, required }) => (
  <div className="flex flex-col gap-1">
    <label className={labelClass}>
      {label}
      {required && ' *'}
    </label>
    {Icon ? (
      <div className="relative">
        <Icon className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
        {children}
      </div>
    ) : (
      children
    )}
  </div>
);

const SubmitButton = ({ loading, label }) => (
  <button
    type="submit"
    disabled={loading}
    className="mt-1 w-full bg-brand-500 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-600 active:scale-98 transition-all disabled:opacity-50 shadow-md shadow-brand-500/10"
  >
    {loading ? (
      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    ) : (
      <>
        {label}
        <ArrowRight className="w-4 h-4" />
      </>
    )}
  </button>
);
