/**
 * Provider mock (localStorage). Integrasi BE: panggil modul di `src/services/`
 * dari ApiDataProvider atau ganti implementasi fungsi di sini.
 * @see src/services/index.js
 */
import React, { createContext, useState, useEffect, useContext } from 'react';
import { DEFAULT_ADMIN_PERMISSIONS, ACCOUNT_STATUS } from '../constants/permissions';
import { DEMO_PASSWORD, syncDemoUserPasswords, verifyDemoPassword } from '../constants/demoAccounts';
import {
  generateOtp,
  OTP_EXPIRY_MS,
  OTP_MAX_RESEND,
  OTP_RESEND_COOLDOWN_MS,
} from '../constants/emailVerification';
import { validateNik, validatePassword } from '../utils/validation';
import { hasPermission as checkPermission, isSuperAdmin, getEffectivePermissions } from '../utils/rbac';

const MockDataContext = createContext();

const normalizeUser = (user) => ({
  ...user,
  nik: user.nik || '',
  status: user.status || ACCOUNT_STATUS.ACTIVE,
  email_verified: user.email_verified ?? user.role !== 'Masyarakat',
  permissions:
    user.permissions ||
    (user.role === 'Admin' ? [...DEFAULT_ADMIN_PERMISSIONS] : []),
  deleted_at: user.deleted_at || null,
  deleted_by: user.deleted_by || null,
});

const normalizeCategory = (cat) => ({
  ...cat,
  description: cat.description || '',
  is_active: cat.is_active !== false,
  deleted_at: cat.deleted_at || null,
  deleted_by: cat.deleted_by || null,
});

// Mock Categories
const INITIAL_CATEGORIES = [
  { id: 'ktp', name: 'Kartu Tanda Penduduk (KTP)', code: 'KTP', description: 'Pengaduan terkait KTP-el', is_active: true },
  { id: 'kk', name: 'Kartu Keluarga (KK)', code: 'KK', description: 'Pengaduan terkait KK', is_active: true },
  { id: 'kia', name: 'Kartu Identitas Anak (KIA)', code: 'KIA', description: 'Pengaduan terkait KIA', is_active: true },
  { id: 'akta', name: 'Akta Kelahiran / Kematian', code: 'AKT', description: 'Pengaduan akta kelahiran/kematian', is_active: true },
  { id: 'pindah', name: 'Surat Pindah (SKPWNI)', code: 'PDH', description: 'Pengaduan surat pindah domisili', is_active: true },
  { id: 'layanan', name: 'Pelayanan Kantor Capil / Kecamatan', code: 'LYN', description: 'Pelayanan dan sikap petugas', is_active: true },
];

// Mock Users
const INITIAL_USERS = [
  {
    id: 'usr-1',
    name: 'Budi Santoso',
    email: 'citizen@maturcapil.id',
    password: DEMO_PASSWORD,
    role: 'Masyarakat',
    nik: '3374012345678901',
    status: ACCOUNT_STATUS.ACTIVE,
    email_verified: true,
    created_at: '2026-05-01T08:00:00Z',
  },
  {
    id: 'usr-2',
    name: 'Siti Aminah',
    email: 'admin@maturcapil.id',
    password: DEMO_PASSWORD,
    role: 'Admin',
    nik: '3374023456789012',
    status: ACCOUNT_STATUS.ACTIVE,
    email_verified: true,
    permissions: [...DEFAULT_ADMIN_PERMISSIONS],
    created_at: '2026-05-01T08:00:00Z',
  },
  {
    id: 'usr-3',
    name: 'Hendra Wijaya',
    email: 'superadmin@maturcapil.id',
    password: DEMO_PASSWORD,
    role: 'Super Admin',
    nik: '3374034567890123',
    status: ACCOUNT_STATUS.ACTIVE,
    email_verified: true,
    created_at: '2026-05-01T08:00:00Z',
  },
  {
    id: 'usr-4',
    name: 'Amiruddin',
    email: 'amir@maturcapil.id',
    password: DEMO_PASSWORD,
    role: 'Admin',
    nik: '3374045678901234',
    status: ACCOUNT_STATUS.ACTIVE,
    email_verified: true,
    permissions: ['dashboard.view', 'complaint.verify', 'complaint.close', 'user.view'],
    created_at: '2026-05-10T08:00:00Z',
  },
];

// Mock Complaints
const INITIAL_COMPLAINTS = [
  {
    id: 'comp-1',
    ticket_number: 'TKT-2026-0001',
    user_id: 'usr-1',
    user_name: 'Budi Santoso',
    title: 'Keterlambatan Pencetakan KTP-el Baru',
    description: 'Saya sudah melakukan perekaman KTP-el sejak 3 bulan lalu di Kecamatan Pedurungan, namun hingga saat ini petugas menyatakan blangko kosong terus. Mohon bantuan percepatannya karena sangat saya butuhkan untuk melamar pekerjaan.',
    category_id: 'ktp',
    status: 'Selesai',
    priority: 'Tinggi',
    latitude: -7.0041,
    longitude: 110.4578,
    address: 'Kecamatan Pedurungan, Kota Semarang',
    created_at: '2026-05-15T08:12:00Z',
    photos: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'],
    evidence_after_photos: ['https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=400&q=80'],
    resolution_note: 'Blangko KTP-el telah disuplai ke Kecamatan Pedurungan. KTP atas nama Budi Santoso telah dicetak dan diserahkan langsung oleh staf Capil.',
    resolved_at: '2026-05-17T14:20:00Z'
  },
  {
    id: 'comp-2',
    ticket_number: 'TKT-2026-0002',
    user_id: 'usr-1',
    user_name: 'Budi Santoso',
    title: 'Kesalahan Nama pada Kartu Keluarga (KK)',
    description: 'Ada kesalahan pengetikan nama anak kedua saya di Kartu Keluarga yang baru diterbitkan. Tertulis "Muhammad Rian", padahal yang benar sesuai akta adalah "Muhammad Ryan". Saya ingin mengajukan pembetulan secara online.',
    category_id: 'kk',
    status: 'Diproses',
    priority: 'Sedang',
    latitude: -6.9822,
    longitude: 110.4091,
    address: 'Jl. Mugas Candi, Kel. Mugassari, Kec. Semarang Selatan',
    created_at: '2026-05-20T09:30:00Z',
    photos: ['https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=400&q=80'],
    evidence_after_photos: [],
    resolution_note: '',
    resolved_at: null
  },
  {
    id: 'comp-3',
    ticket_number: 'TKT-2026-0003',
    user_id: 'usr-1',
    user_name: 'Budi Santoso',
    title: 'Sikap Petugas Loket Akta Kelahiran Kurang Sopan',
    description: 'Pada tanggal 22 Mei jam 10 pagi, petugas loket 3 pengurusan Akta Kelahiran di Kantor Dispendukcapil Kanguru bersikap sangat acuh dan ketus ketika saya menanyakan dokumen persyaratan tambahan. Mohon dilakukan pembinaan.',
    category_id: 'layanan',
    status: 'Menunggu Verifikasi',
    priority: 'Rendah',
    latitude: -6.9925,
    longitude: 110.4431,
    address: 'Kantor Dispendukcapil Jl. Kanguru Raya No.3, Kota Semarang',
    created_at: '2026-05-22T10:15:00Z',
    photos: [],
    evidence_after_photos: [],
    resolution_note: '',
    resolved_at: null
  },
  {
    id: 'comp-4',
    ticket_number: 'TKT-2026-0004',
    user_id: 'usr-1',
    user_name: 'Budi Santoso',
    title: 'Pendaftaran KIA Online Selalu Error',
    description: 'Saya mencoba mendaftarkan Kartu Identitas Anak (KIA) lewat aplikasi SI DUKCAPIL Semarang, namun saat upload akta kelahiran selalu muncul warning "Internal Server Error". Sudah saya coba selama 3 hari berturut-turut.',
    category_id: 'kia',
    status: 'Ditolak',
    priority: 'Sedang',
    latitude: -6.9667,
    longitude: 110.4167,
    address: 'Kel. Tanjung Mas, Kec. Semarang Utara',
    created_at: '2026-05-18T11:00:00Z',
    photos: [],
    evidence_after_photos: [],
    resolution_note: 'Mohon maaf, setelah kami cek log server, terjadi maintenance singkat pada tanggal tersebut. Silakan lakukan pengunggahan ulang berkas Anda karena sistem sudah kembali normal.',
    resolved_at: '2026-05-19T08:30:00Z'
  }
];

// Mock Status Logs
const INITIAL_STATUS_LOGS = [
  { id: 'log-1', complaint_id: 'comp-1', status: 'Menunggu Verifikasi', note: 'Laporan berhasil dibuat oleh masyarakat.', changed_by: 'Budi Santoso', created_at: '2026-05-15T08:12:00Z' },
  { id: 'log-2', complaint_id: 'comp-1', status: 'Diproses', note: 'Laporan diverifikasi oleh admin dan surat pengajuan cetak diajukan.', changed_by: 'Siti Aminah', created_at: '2026-05-15T08:20:00Z' },
  { id: 'log-3', complaint_id: 'comp-1', status: 'Selesai', note: 'KTP fisik selesai dicetak dan diserahkan. Laporan ditutup.', changed_by: 'Siti Aminah', created_at: '2026-05-17T14:20:00Z' },

  { id: 'log-4', complaint_id: 'comp-2', status: 'Menunggu Verifikasi', note: 'Laporan berhasil dibuat oleh masyarakat.', changed_by: 'Budi Santoso', created_at: '2026-05-20T09:30:00Z' },
  { id: 'log-5', complaint_id: 'comp-2', status: 'Diproses', note: 'Admin memverifikasi berkas dan meneruskan ke tim operator KK.', changed_by: 'Siti Aminah', created_at: '2026-05-21T09:00:00Z' },

  { id: 'log-6', complaint_id: 'comp-3', status: 'Menunggu Verifikasi', note: 'Laporan berhasil dibuat oleh masyarakat.', changed_by: 'Budi Santoso', created_at: '2026-05-22T10:15:00Z' },

  { id: 'log-7', complaint_id: 'comp-4', status: 'Menunggu Verifikasi', note: 'Laporan berhasil dibuat oleh masyarakat.', changed_by: 'Budi Santoso', created_at: '2026-05-18T11:00:00Z' },
  { id: 'log-8', complaint_id: 'comp-4', status: 'Ditolak', note: 'Pengaduan ditolak. Sistem sempat maintenance, silakan kirim ulang laporan.', changed_by: 'Siti Aminah', created_at: '2026-05-19T08:30:00Z' }
];

// Mock Chats
const INITIAL_CHATS = [
  { id: 'chat-1', complaint_id: 'comp-1', sender_id: 'usr-1', sender_name: 'Budi Santoso', message: 'Selamat pagi admin, apakah berkas saya sudah bisa dicek?', created_at: '2026-05-15T08:15:00Z' },
  { id: 'chat-2', complaint_id: 'comp-1', sender_id: 'usr-2', sender_name: 'Siti Aminah', message: 'Pagi Pak Budi. Sedang kami verifikasi ke Kecamatan Pedurungan ya. Mohon ditunggu.', created_at: '2026-05-15T08:21:00Z' },
  { id: 'chat-3', complaint_id: 'comp-1', sender_id: 'usr-1', sender_name: 'Budi Santoso', message: 'Baik, terima kasih respon cepatnya.', created_at: '2026-05-15T08:30:00Z' },
  { id: 'chat-4', complaint_id: 'comp-1', sender_id: 'usr-2', sender_name: 'Siti Aminah', message: 'KTP Anda sudah tercetak. Bisa diambil di loket pelayanan kecamatan. Terima kasih.', created_at: '2026-05-17T14:21:00Z' },

  { id: 'chat-5', complaint_id: 'comp-2', sender_id: 'usr-1', sender_name: 'Budi Santoso', message: 'Halo admin, berkas perbaikan akta nama anak saya sudah saya upload di form pengaduan.', created_at: '2026-05-20T09:35:00Z' },
  { id: 'chat-6', complaint_id: 'comp-2', sender_id: 'usr-2', sender_name: 'Siti Aminah', message: 'Halo Pak Budi, kami lihat fotonya sudah jelas. Kami sedang memproses pencetakan KK yang baru.', created_at: '2026-05-21T09:05:00Z' }
];

// Mock Audit Logs
const INITIAL_AUDIT_LOGS = [
  { id: 'audit-1', user_id: 'usr-2', user_name: 'Siti Aminah', action: 'LOGIN', table_name: 'sessions', record_id: 'usr-2', detail: 'Login admin dari Chrome / 192.168.1.10', ip_address: '192.168.1.10', created_at: '2026-05-15T08:00:00Z' },
  { id: 'audit-2', user_id: 'usr-2', user_name: 'Siti Aminah', action: 'VERIFY_COMPLAINT', table_name: 'complaints', record_id: 'comp-1', detail: 'Verifikasi pengaduan KTP-el Budi Santoso', ip_address: '192.168.1.10', created_at: '2026-05-15T08:20:00Z' },
  { id: 'audit-3', user_id: 'usr-2', user_name: 'Siti Aminah', action: 'CLOSE_COMPLAINT', table_name: 'complaints', record_id: 'comp-1', detail: 'Penyelesaian pengaduan KTP-el Budi Santoso', ip_address: '192.168.1.10', created_at: '2026-05-17T14:20:00Z' },
  { id: 'audit-4', user_id: 'usr-2', user_name: 'Siti Aminah', action: 'REJECT_COMPLAINT', table_name: 'complaints', record_id: 'comp-4', detail: 'Penolakan pengaduan KIA online karena server maintenance', ip_address: '192.168.1.10', created_at: '2026-05-19T08:30:00Z' },
  { id: 'audit-5', user_id: 'usr-3', user_name: 'Hendra Wijaya', action: 'PERMISSION_CHANGE', table_name: 'admin_permissions', record_id: 'usr-4', detail: 'Mengubah hak akses admin Amiruddin', ip_address: '192.168.1.5', created_at: '2026-05-20T09:00:00Z' },
  { id: 'audit-6', user_id: 'usr-3', user_name: 'Hendra Wijaya', action: 'RESET_PASSWORD', table_name: 'users', record_id: 'usr-1', detail: 'Reset password warga Budi Santoso (force reset)', ip_address: '192.168.1.5', created_at: '2026-05-21T11:00:00Z' },
];

export const MockDataProvider = ({ children }) => {
  // Load state from local storage or set initial mock data
  const [users, setUsers] = useState(() => {
    const data = localStorage.getItem('mc_users');
    const parsed = data ? JSON.parse(data) : INITIAL_USERS;
    return syncDemoUserPasswords(parsed.map(normalizeUser));
  });

  const [complaints, setComplaints] = useState(() => {
    const data = localStorage.getItem('mc_complaints');
    return data ? JSON.parse(data) : INITIAL_COMPLAINTS;
  });

  const [categories, setCategories] = useState(() => {
    const data = localStorage.getItem('mc_categories');
    const parsed = data ? JSON.parse(data) : INITIAL_CATEGORIES;
    return parsed.map(normalizeCategory);
  });

  const [statusLogs, setStatusLogs] = useState(() => {
    const data = localStorage.getItem('mc_status_logs');
    return data ? JSON.parse(data) : INITIAL_STATUS_LOGS;
  });

  const [chats, setChats] = useState(() => {
    const data = localStorage.getItem('mc_chats');
    return data ? JSON.parse(data) : INITIAL_CHATS;
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const data = localStorage.getItem('mc_audit_logs');
    return data ? JSON.parse(data) : INITIAL_AUDIT_LOGS;
  });

  // Current logged in user (persisted in session/local storage)
  const [currentUser, setCurrentUser] = useState(() => {
    const user = localStorage.getItem('mc_current_user');
    return user ? JSON.parse(user) : null;
  });

  // Toast Notifications list
  const [notifications, setNotifications] = useState([]);

  // Pending registrasi + OTP verifikasi email (mock)
  const [emailVerifications, setEmailVerifications] = useState(() => {
    const data = localStorage.getItem('mc_email_verifications');
    return data ? JSON.parse(data) : {};
  });

  // Sync to local storage when state changes
  useEffect(() => {
    localStorage.setItem('mc_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('mc_complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('mc_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('mc_status_logs', JSON.stringify(statusLogs));
  }, [statusLogs]);

  useEffect(() => {
    localStorage.setItem('mc_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('mc_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('mc_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('mc_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('mc_email_verifications', JSON.stringify(emailVerifications));
  }, [emailVerifications]);

  // Helper: Trigger Notification Toast
  const triggerNotification = (title, message, type = 'info') => {
    const newNotif = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      type,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Helper: append immutable audit log
  const appendAuditLog = (action, tableName, recordId, detail, ipAddress = '127.0.0.1', actor = currentUser) => {
    if (!actor) return;
    const entry = {
      id: `audit-${Date.now()}`,
      user_id: actor.id,
      user_name: actor.name,
      action,
      table_name: tableName,
      record_id: recordId,
      detail,
      ip_address: ipAddress,
      created_at: new Date().toISOString(),
    };
    setAuditLogs((prev) => [...prev, entry]);
  };

  const hasPermission = (permissionCode) => checkPermission(currentUser, permissionCode);

  const syncCurrentUser = (updatedUser) => {
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // 1. Auth: Login
  const login = (email, password, portalType) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return { success: false, message: 'Email tidak terdaftar.' };
    }
    
    const passwordOk =
      user.password === password || verifyDemoPassword(user.email, password);
    if (!passwordOk) {
      return { success: false, message: 'Password salah.' };
    }
    if (verifyDemoPassword(user.email, password) && user.password !== password) {
      setUsers((prev) =>
        syncDemoUserPasswords(
          prev.map((u) =>
            u.id === user.id ? { ...u, password: DEMO_PASSWORD } : u
          )
        )
      );
    }

    if (user.status === ACCOUNT_STATUS.INACTIVE || user.status === ACCOUNT_STATUS.SUSPENDED) {
      return { success: false, message: 'Akun dinonaktifkan. Hubungi administrator.' };
    }

    // Role verification based on portalType
    if (portalType === 'admin') {
      if (user.role !== 'Admin' && user.role !== 'Super Admin') {
        return { success: false, message: 'Akses ditolak. Anda bukan Administrator.' };
      }
    } else {
      if (user.role !== 'Masyarakat') {
        return { success: false, message: 'Gunakan Portal Admin untuk masuk ke akun ini.' };
      }
    }

    setCurrentUser(user);
    if (portalType === 'admin') {
      appendAuditLog('LOGIN', 'sessions', user.id, 'Login admin dari browser simulasi', '127.0.0.1', user);
    }
    triggerNotification('Login Berhasil', `Selamat datang kembali, ${user.name}!`, 'success');
    return { success: true, user };
  };

  const createEmailOtpEntry = (email, pendingUser) => {
    const otp = generateOtp();
    const entry = {
      otp,
      expiresAt: Date.now() + OTP_EXPIRY_MS,
      resendCount: 0,
      lastResendAt: Date.now(),
      pendingUser,
      verifiedAt: null,
    };
    setEmailVerifications((prev) => ({ ...prev, [email.toLowerCase()]: entry }));
    return otp;
  };

  // 2a. Registrasi warga — langkah 1: validasi & kirim OTP
  const registerCitizenStart = ({ name, nik, email, password, passwordConfirm }) => {
    const trimmedEmail = email?.trim().toLowerCase();
    if (!name?.trim() || !trimmedEmail || !password) {
      return { success: false, message: 'Harap lengkapi semua kolom wajib.' };
    }
    const nikError = validateNik(nik);
    if (nikError) return { success: false, message: nikError };
    const pwdError = validatePassword(password);
    if (pwdError) return { success: false, message: pwdError };
    if (password !== passwordConfirm) {
      return { success: false, message: 'Konfirmasi password tidak cocok.' };
    }
    if (users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
      return { success: false, message: 'Email sudah terdaftar.' };
    }
    if (users.some((u) => u.nik === nik)) {
      return { success: false, message: 'NIK sudah digunakan. Tidak dapat mendaftar.' };
    }

    const pendingUser = {
      name: name.trim(),
      nik,
      email: trimmedEmail,
      password,
      role: 'Masyarakat',
    };
    const demoOtp = createEmailOtpEntry(trimmedEmail, pendingUser);
    triggerNotification('OTP Terkirim', `Kode verifikasi dikirim ke ${trimmedEmail} (simulasi).`, 'info');
    return {
      success: true,
      email: trimmedEmail,
      demoOtp,
      message: 'Kode OTP telah dikirim ke email Anda. Berlaku 5 menit.',
    };
  };

  // 2b. Kirim ulang OTP registrasi
  const resendRegistrationOtp = (email) => {
    const key = email?.toLowerCase();
    const entry = emailVerifications[key];
    if (!entry?.pendingUser) {
      return { success: false, message: 'Sesi registrasi tidak ditemukan. Ulangi dari awal.' };
    }
    if (entry.resendCount >= OTP_MAX_RESEND) {
      return { success: false, message: 'Batas kirim ulang OTP (3x) telah habis.' };
    }
    const elapsed = Date.now() - entry.lastResendAt;
    if (elapsed < OTP_RESEND_COOLDOWN_MS) {
      const waitSec = Math.ceil((OTP_RESEND_COOLDOWN_MS - elapsed) / 1000);
      return { success: false, message: `Tunggu ${waitSec} detik sebelum kirim ulang OTP.` };
    }
    const otp = generateOtp();
    setEmailVerifications((prev) => ({
      ...prev,
      [key]: {
        ...entry,
        otp,
        expiresAt: Date.now() + OTP_EXPIRY_MS,
        resendCount: entry.resendCount + 1,
        lastResendAt: Date.now(),
      },
    }));
    triggerNotification('OTP Dikirim Ulang', 'Kode baru telah dikirim (simulasi).', 'info');
    return { success: true, demoOtp: otp, message: 'OTP baru telah dikirim.' };
  };

  // 2c. Registrasi warga — langkah 2: verifikasi OTP & buat akun
  const registerCitizenVerify = (email, otpCode) => {
    const key = email?.toLowerCase();
    const entry = emailVerifications[key];
    if (!entry?.pendingUser) {
      return { success: false, message: 'Sesi registrasi tidak ditemukan.' };
    }
    if (Date.now() > entry.expiresAt) {
      return { success: false, message: 'OTP kedaluwarsa. Silakan kirim ulang atau daftar lagi.' };
    }
    if (entry.otp !== String(otpCode).trim()) {
      return { success: false, message: 'Kode OTP salah.' };
    }
    if (users.some((u) => u.email.toLowerCase() === key)) {
      return { success: false, message: 'Email sudah terdaftar.' };
    }
    if (users.some((u) => u.nik === entry.pendingUser.nik)) {
      return { success: false, message: 'NIK sudah digunakan.' };
    }

    const newUser = normalizeUser({
      id: `usr-${Date.now()}`,
      name: entry.pendingUser.name,
      email: key,
      password: entry.pendingUser.password,
      nik: entry.pendingUser.nik,
      role: 'Masyarakat',
      status: ACCOUNT_STATUS.ACTIVE,
      email_verified: true,
      email_verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setEmailVerifications((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    triggerNotification('Email Terverifikasi', 'Akun berhasil dibuat. Anda dapat membuat laporan tanpa batas.', 'success');
    return { success: true, user: newUser };
  };

  // Verifikasi email untuk user yang sudah login tapi belum verifikasi
  const verifyCurrentUserEmail = (otpCode) => {
    if (!currentUser) return { success: false, message: 'Harus login terlebih dahulu.' };
    const key = currentUser.email.toLowerCase();
    const entry = emailVerifications[key];
    if (!entry) {
      return { success: false, message: 'Tidak ada OTP aktif. Minta kode baru dari halaman profil.' };
    }
    if (Date.now() > entry.expiresAt) {
      return { success: false, message: 'OTP kedaluwarsa.' };
    }
    if (entry.otp !== String(otpCode).trim()) {
      return { success: false, message: 'Kode OTP salah.' };
    }
    const updated = normalizeUser({
      ...currentUser,
      email_verified: true,
      email_verified_at: new Date().toISOString(),
    });
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    setCurrentUser(updated);
    setEmailVerifications((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    triggerNotification('Email Terverifikasi', 'Anda dapat membuat laporan tanpa batas.', 'success');
    return { success: true };
  };

  const sendEmailVerificationOtp = () => {
    if (!currentUser) return { success: false, message: 'Harus login.' };
    if (currentUser.email_verified) {
      return { success: false, message: 'Email sudah terverifikasi.' };
    }
    const demoOtp = createEmailOtpEntry(currentUser.email.toLowerCase(), null);
    triggerNotification('OTP Terkirim', `Kode verifikasi dikirim ke ${currentUser.email} (simulasi).`, 'info');
    return { success: true, demoOtp, message: 'OTP dikirim ke email Anda.' };
  };

  const resendEmailVerificationOtp = () => {
    if (!currentUser) return { success: false, message: 'Harus login.' };
    const key = currentUser.email.toLowerCase();
    const entry = emailVerifications[key];
    if (!entry) {
      return { success: false, message: 'Tidak ada OTP aktif. Minta kode baru terlebih dahulu.' };
    }
    if (entry.resendCount >= OTP_MAX_RESEND) {
      return { success: false, message: 'Batas kirim ulang OTP (3x) telah habis.' };
    }
    const elapsed = Date.now() - entry.lastResendAt;
    if (elapsed < OTP_RESEND_COOLDOWN_MS) {
      const waitSec = Math.ceil((OTP_RESEND_COOLDOWN_MS - elapsed) / 1000);
      return { success: false, message: `Tunggu ${waitSec} detik sebelum kirim ulang OTP.` };
    }
    const otp = generateOtp();
    setEmailVerifications((prev) => ({
      ...prev,
      [key]: {
        ...entry,
        otp,
        expiresAt: Date.now() + OTP_EXPIRY_MS,
        resendCount: entry.resendCount + 1,
        lastResendAt: Date.now(),
      },
    }));
    triggerNotification('OTP Dikirim Ulang', 'Kode baru telah dikirim (simulasi).', 'info');
    return { success: true, demoOtp: otp, message: 'OTP baru telah dikirim.' };
  };

  /** @deprecated gunakan registerCitizenStart + registerCitizenVerify */
  const register = (name, email, password) =>
    registerCitizenStart({
      name,
      nik: '',
      email,
      password,
      passwordConfirm: password,
    });

  // 3. Auth: Logout
  const logout = () => {
    if (currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Super Admin')) {
      appendAuditLog('LOGOUT', 'sessions', currentUser.id, 'Logout admin');
    }
    setCurrentUser(null);
    triggerNotification('Log Out', 'Anda telah keluar dari sistem.', 'info');
  };

  // 4. Create Complaint
  const createComplaint = (data) => {
    if (!currentUser) return { success: false, message: 'Harus login terlebih dahulu.' };

    if (!currentUser.email_verified) {
      const userReportCount = complaints.filter((c) => c.user_id === currentUser.id).length;
      if (userReportCount >= 1) {
        return {
          success: false,
          needsEmailVerification: true,
          message:
            'Anda hanya dapat membuat 1 laporan sebelum email diverifikasi. Verifikasi email untuk melanjutkan.',
        };
      }
    }

    const ticketNumber = `TKT-${new Date().getFullYear()}-${String(complaints.length + 1).padStart(4, '0')}`;
    const newComplaint = {
      id: `comp-${complaints.length + 1}`,
      ticket_number: ticketNumber,
      user_id: currentUser.id,
      user_name: currentUser.name,
      title: data.title,
      description: data.description,
      category_id: data.categoryId,
      status: 'Menunggu Verifikasi',
      priority: data.priority || 'Sedang',
      latitude: data.latitude || -6.98,
      longitude: data.longitude || 110.42,
      address: data.address || 'Kota Semarang',
      created_at: new Date().toISOString(),
      photos: data.photos || [],
      evidence_after_photos: [],
      resolution_note: '',
      resolved_at: null
    };

    const newLog = {
      id: `log-${statusLogs.length + 1}`,
      complaint_id: newComplaint.id,
      status: 'Menunggu Verifikasi',
      note: 'Aduan berhasil diajukan oleh masyarakat.',
      changed_by: currentUser.name,
      created_at: new Date().toISOString()
    };

    setComplaints(prev => [newComplaint, ...prev]);
    setStatusLogs(prev => [...prev, newLog]);

    triggerNotification(
      'Aduan Diajukan',
      `Aduan dengan nomor tiket ${ticketNumber} berhasil dikirim.`,
      'success'
    );

    return { success: true, complaint: newComplaint };
  };

  // 5. Update Complaint Status (Admin: Verify, Process, Reject)
  const updateComplaintStatus = (complaintId, status, note) => {
    if (!currentUser || (currentUser.role !== 'Admin' && currentUser.role !== 'Super Admin')) {
      return { success: false, message: 'Hanya Admin yang dapat mengubah status.' };
    }

    setComplaints(prev => prev.map(c => {
      if (c.id === complaintId) {
        return { ...c, status };
      }
      return c;
    }));

    const newLog = {
      id: `log-${statusLogs.length + 1}`,
      complaint_id: complaintId,
      status,
      note: note || `Status diperbarui menjadi ${status}.`,
      changed_by: currentUser.name,
      created_at: new Date().toISOString()
    };

    setStatusLogs(prev => [...prev, newLog]);

    // Create Audit Log
    const newAudit = {
      id: `audit-${auditLogs.length + 1}`,
      user_id: currentUser.id,
      user_name: currentUser.name,
      action: status === 'Diproses' ? 'VERIFY_COMPLAINT' : (status === 'Ditolak' ? 'REJECT_COMPLAINT' : 'UPDATE_STATUS'),
      table_name: 'complaints',
      record_id: complaintId,
      detail: `${status === 'Diproses' ? 'Menyetujui' : (status === 'Ditolak' ? 'Menolak' : 'Memperbarui')} laporan ID ${complaintId}: ${note}`,
      created_at: new Date().toISOString()
    };
    setAuditLogs(prev => [...prev, newAudit]);

    // Trigger notification to user (simulated)
    const targetComp = complaints.find(c => c.id === complaintId);
    if (targetComp) {
      triggerNotification(
        'Status Laporan Berubah',
        `Laporan #${targetComp.ticket_number} kini berstatus: ${status}.`,
        status === 'Ditolak' ? 'error' : 'info'
      );
    }

    return { success: true };
  };

  // 6. Close Complaint (Admin: Resolve)
  const closeComplaint = (complaintId, note, afterPhotos) => {
    if (!currentUser || (currentUser.role !== 'Admin' && currentUser.role !== 'Super Admin')) {
      return { success: false, message: 'Hanya Admin yang dapat menutup laporan.' };
    }

    setComplaints(prev => prev.map(c => {
      if (c.id === complaintId) {
        return {
          ...c,
          status: 'Selesai',
          resolution_note: note,
          evidence_after_photos: afterPhotos || [],
          resolved_at: new Date().toISOString()
        };
      }
      return c;
    }));

    const newLog = {
      id: `log-${statusLogs.length + 1}`,
      complaint_id: complaintId,
      status: 'Selesai',
      note: `Aduan ditutup dengan hasil: ${note}`,
      changed_by: currentUser.name,
      created_at: new Date().toISOString()
    };

    setStatusLogs(prev => [...prev, newLog]);

    // Create Audit Log
    const newAudit = {
      id: `audit-${auditLogs.length + 1}`,
      user_id: currentUser.id,
      user_name: currentUser.name,
      action: 'CLOSE_COMPLAINT',
      table_name: 'complaints',
      record_id: complaintId,
      detail: `Menyelesaikan laporan ID ${complaintId} dengan bukti perbaikan.`,
      created_at: new Date().toISOString()
    };
    setAuditLogs(prev => [...prev, newAudit]);

    const targetComp = complaints.find(c => c.id === complaintId);
    if (targetComp) {
      triggerNotification(
        'Laporan Selesai',
        `Laporan #${targetComp.ticket_number} telah diselesaikan oleh admin.`,
        'success'
      );
    }

    return { success: true };
  };

  // 7. Chats: Add message (Realtime simulation with automatic admin bot response for demo)
  const addChatMessage = (complaintId, message, senderId) => {
    const sender = users.find(u => u.id === senderId);
    if (!sender) return;

    const newChat = {
      id: `chat-${chats.length + 1}`,
      complaint_id: complaintId,
      sender_id: senderId,
      sender_name: sender.name,
      message,
      created_at: new Date().toISOString()
    };

    setChats(prev => [...prev, newChat]);

    // Simulated Auto response from Admin/User to make the chat feel real-time and alive!
    if (sender.role === 'Masyarakat') {
      setTimeout(() => {
        const adminUser = users.find(u => u.role === 'Admin');
        const autoReply = {
          id: `chat-${Date.now()}`,
          complaint_id: complaintId,
          sender_id: adminUser.id,
          sender_name: adminUser.name,
          message: `[Auto-Respon] Terima kasih, pesan Anda telah kami terima. Pengaduan Anda sedang dicek oleh petugas. Mohon tunggu update berkas secara berkala.`,
          created_at: new Date().toISOString()
        };
        setChats(prev => [...prev, autoReply]);
        triggerNotification('Pesan Baru', `${adminUser.name} mengirim pesan di laporan Anda.`, 'info');
      }, 2500);
    }
  };

  // 8. Super Admin: Manage Categories
  const addCategory = (name, code, description = '') => {
    if (!checkPermission(currentUser, 'category.manage')) return { success: false, message: 'Unauthorized' };
    const id = name.toLowerCase().replace(/\s+/g, '-');
    if (categories.some((c) => c.id === id || c.code === code.toUpperCase())) {
      return { success: false, message: 'Kategori dengan kode/id serupa sudah ada.' };
    }
    const newCat = normalizeCategory({ id, name, code: code.toUpperCase(), description });
    setCategories((prev) => [...prev, newCat]);
    appendAuditLog('CREATE_CATEGORY', 'categories', id, `Menambah kategori ${name}`);
    return { success: true };
  };

  const updateCategory = (id, data) => {
    if (!checkPermission(currentUser, 'category.manage')) return { success: false, message: 'Unauthorized' };
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? normalizeCategory({ ...c, ...data, code: data.code?.toUpperCase() || c.code }) : c))
    );
    appendAuditLog('UPDATE_CATEGORY', 'categories', id, `Memperbarui kategori ${data.name || id}`);
    return { success: true };
  };

  const deleteCategory = (id) => {
    if (!checkPermission(currentUser, 'category.manage')) return { success: false, message: 'Unauthorized' };
    setCategories((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, is_active: false, deleted_at: new Date().toISOString(), deleted_by: currentUser?.id }
          : c
      )
    );
    appendAuditLog('DELETE_CATEGORY', 'categories', id, `Soft delete kategori ${id}`);
    return { success: true };
  };

  // 9. User Management
  const createCitizen = (data) => {
    if (!checkPermission(currentUser, 'user.create')) return { success: false, message: 'Unauthorized' };
    const nikError = validateNik(data.nik);
    if (nikError) return { success: false, message: nikError };
    const pwdError = validatePassword(data.password);
    if (pwdError) return { success: false, message: pwdError };
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, message: 'Email sudah terdaftar.' };
    }
    if (users.some((u) => u.nik === data.nik)) {
      return { success: false, message: 'NIK sudah digunakan.' };
    }
    const newUser = normalizeUser({
      id: `usr-${Date.now()}`,
      name: data.name,
      email: data.email,
      password: data.password,
      nik: data.nik,
      role: 'Masyarakat',
      status: ACCOUNT_STATUS.ACTIVE,
      email_verified: false,
      created_at: new Date().toISOString(),
    });
    setUsers((prev) => [...prev, newUser]);
    appendAuditLog('CREATE_USER', 'users', newUser.id, `Menambah warga ${newUser.name}`);
    return { success: true, user: newUser };
  };

  const createAdmin = (name, email, password, permissions = [...DEFAULT_ADMIN_PERMISSIONS], nik = '') => {
    if (!checkPermission(currentUser, 'user.create')) return { success: false, message: 'Unauthorized' };
    const pwdError = validatePassword(password);
    if (pwdError) return { success: false, message: pwdError };
    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return { success: false, message: 'Email sudah terdaftar.' };
    if (nik) {
      const nikError = validateNik(nik);
      if (nikError) return { success: false, message: nikError };
      if (users.some((u) => u.nik === nik)) return { success: false, message: 'NIK sudah digunakan.' };
    }
    const newAdmin = normalizeUser({
      id: `usr-${Date.now()}`,
      name,
      email,
      password,
      nik: nik || '',
      role: 'Admin',
      status: ACCOUNT_STATUS.ACTIVE,
      email_verified: true,
      permissions,
      created_at: new Date().toISOString(),
    });
    setUsers((prev) => [...prev, newAdmin]);
    appendAuditLog('CREATE_USER', 'users', newAdmin.id, `Menambah admin ${name}`);
    return { success: true, user: newAdmin };
  };

  const updateUser = (userId, data) => {
    if (!checkPermission(currentUser, 'user.update')) return { success: false, message: 'Unauthorized' };
    const target = users.find((u) => u.id === userId);
    if (!target) return { success: false, message: 'User tidak ditemukan.' };
    if (data.nik && data.nik !== target.nik) {
      const nikError = validateNik(data.nik);
      if (nikError) return { success: false, message: nikError };
      if (users.some((u) => u.nik === data.nik && u.id !== userId)) {
        return { success: false, message: 'NIK sudah digunakan.' };
      }
    }
    const updated = normalizeUser({ ...target, ...data });
    setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    syncCurrentUser(updated);
    appendAuditLog('UPDATE_USER', 'users', userId, `Memperbarui data user ${updated.name}`);
    return { success: true, user: updated };
  };

  const deactivateUser = (userId) => {
    if (!checkPermission(currentUser, 'user.delete')) return { success: false, message: 'Unauthorized' };
    if (userId === currentUser?.id) return { success: false, message: 'Tidak dapat menonaktifkan akun sendiri.' };
    const target = users.find((u) => u.id === userId);
    if (!target) return { success: false, message: 'User tidak ditemukan.' };
    if (target.role === 'Super Admin') return { success: false, message: 'Super Admin tidak dapat dinonaktifkan.' };
    const updated = normalizeUser({
      ...target,
      status: ACCOUNT_STATUS.INACTIVE,
      deleted_at: new Date().toISOString(),
      deleted_by: currentUser.id,
    });
    setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    appendAuditLog('DEACTIVATE_USER', 'users', userId, `Menonaktifkan user ${target.name}`);
    return { success: true };
  };

  const resetUserPassword = (userId, newPassword, forceReset = false) => {
    if (!checkPermission(currentUser, 'user.update')) return { success: false, message: 'Unauthorized' };
    const pwdError = validatePassword(newPassword);
    if (pwdError) return { success: false, message: pwdError };
    const target = users.find((u) => u.id === userId);
    if (!target) return { success: false, message: 'User tidak ditemukan.' };
    const updated = { ...target, password: newPassword };
    setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    appendAuditLog(
      'RESET_PASSWORD',
      'users',
      userId,
      `${forceReset ? 'Force reset' : 'Reset'} password ${target.name} — notifikasi email terkirim (simulasi)`
    );
    triggerNotification('Reset Password', `Password ${target.name} berhasil direset. Email notifikasi terkirim.`, 'info');
    return { success: true };
  };

  const updateAdminPermissions = (adminId, permissions) => {
    if (!isSuperAdmin(currentUser)) return { success: false, message: 'Hanya Super Admin.' };
    const target = users.find((u) => u.id === adminId);
    if (!target || target.role !== 'Admin') return { success: false, message: 'Target bukan admin.' };
    const updated = normalizeUser({ ...target, permissions });
    setUsers((prev) => prev.map((u) => (u.id === adminId ? updated : u)));
    syncCurrentUser(updated);
    appendAuditLog('PERMISSION_CHANGE', 'admin_permissions', adminId, `Mengubah hak akses admin ${target.name}`);
    return { success: true };
  };

  const deleteAdmin = (adminId) => deactivateUser(adminId);

  const getUserComplaints = (userId) => complaints.filter((c) => c.user_id === userId);

  const activeCategories = categories.filter((c) => c.is_active && !c.deleted_at);

  return (
    <MockDataContext.Provider value={{
      users,
      complaints,
      categories,
      activeCategories,
      statusLogs,
      chats,
      auditLogs,
      currentUser,
      notifications,
      login,
      register,
      registerCitizenStart,
      registerCitizenVerify,
      resendRegistrationOtp,
      sendEmailVerificationOtp,
      resendEmailVerificationOtp,
      verifyCurrentUserEmail,
      getRegistrationOtpInfo: (email) => emailVerifications[email?.toLowerCase()] || null,
      logout,
      createComplaint,
      updateComplaintStatus,
      closeComplaint,
      addChatMessage,
      triggerNotification,
      removeNotification,
      addCategory,
      updateCategory,
      deleteCategory,
      createAdmin,
      createCitizen,
      updateUser,
      deactivateUser,
      resetUserPassword,
      updateAdminPermissions,
      deleteAdmin,
      getUserComplaints,
      hasPermission,
      isSuperAdmin: () => isSuperAdmin(currentUser),
      getEffectivePermissions: () => getEffectivePermissions(currentUser),
    }}>
      {children}
    </MockDataContext.Provider>
  );
};

export const useMockData = () => useContext(MockDataContext);
