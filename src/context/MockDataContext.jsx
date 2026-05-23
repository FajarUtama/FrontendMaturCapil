import React, { createContext, useState, useEffect, useContext } from 'react';

const MockDataContext = createContext();

// Mock Categories
const INITIAL_CATEGORIES = [
  { id: 'ktp', name: 'Kartu Tanda Penduduk (KTP)', code: 'KTP' },
  { id: 'kk', name: 'Kartu Keluarga (KK)', code: 'KK' },
  { id: 'kia', name: 'Kartu Identitas Anak (KIA)', code: 'KIA' },
  { id: 'akta', name: 'Akta Kelahiran / Kematian', code: 'AKT' },
  { id: 'pindah', name: 'Surat Pindah (SKPWNI)', code: 'PDH' },
  { id: 'layanan', name: 'Pelayanan Kantor Capil / Kecamatan', code: 'LYN' }
];

// Mock Users
const INITIAL_USERS = [
  { id: 'usr-1', name: 'Budi Santoso', email: 'citizen@maturcapil.id', password: 'password', role: 'Masyarakat', created_at: '2026-05-01T08:00:00Z' },
  { id: 'usr-2', name: 'Siti Aminah', email: 'admin@maturcapil.id', password: 'password', role: 'Admin', created_at: '2026-05-01T08:00:00Z' },
  { id: 'usr-3', name: 'Hendra Wijaya', email: 'superadmin@maturcapil.id', password: 'password', role: 'Super Admin', created_at: '2026-05-01T08:00:00Z' },
  { id: 'usr-4', name: 'Amiruddin', email: 'amir@maturcapil.id', password: 'password', role: 'Admin', created_at: '2026-05-10T08:00:00Z' }
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
  { id: 'audit-1', user_id: 'usr-2', user_name: 'Siti Aminah', action: 'VERIFY_COMPLAINT', table_name: 'complaints', record_id: 'comp-1', detail: 'Verifikasi pengaduan KTP-el Budi Santoso', created_at: '2026-05-15T08:20:00Z' },
  { id: 'audit-2', user_id: 'usr-2', user_name: 'Siti Aminah', action: 'CLOSE_COMPLAINT', table_name: 'complaints', record_id: 'comp-1', detail: 'Penyelesaian pengaduan KTP-el Budi Santoso', created_at: '2026-05-17T14:20:00Z' },
  { id: 'audit-3', user_id: 'usr-2', user_name: 'Siti Aminah', action: 'REJECT_COMPLAINT', table_name: 'complaints', record_id: 'comp-4', detail: 'Penolakan pengaduan KIA online karena server maintenance', created_at: '2026-05-19T08:30:00Z' }
];

export const MockDataProvider = ({ children }) => {
  // Load state from local storage or set initial mock data
  const [users, setUsers] = useState(() => {
    const data = localStorage.getItem('mc_users');
    return data ? JSON.parse(data) : INITIAL_USERS;
  });

  const [complaints, setComplaints] = useState(() => {
    const data = localStorage.getItem('mc_complaints');
    return data ? JSON.parse(data) : INITIAL_COMPLAINTS;
  });

  const [categories, setCategories] = useState(() => {
    const data = localStorage.getItem('mc_categories');
    return data ? JSON.parse(data) : INITIAL_CATEGORIES;
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

  // Helper: Clear notification
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // 1. Auth: Login
  const login = (email, password, portalType) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return { success: false, message: 'Email tidak terdaftar.' };
    }
    
    if (user.password !== password) {
      return { success: false, message: 'Password salah.' };
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
    triggerNotification('Login Berhasil', `Selamat datang kembali, ${user.name}!`, 'success');
    return { success: true, user };
  };

  // 2. Auth: Register
  const register = (name, email, password) => {
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { success: false, message: 'Email sudah terdaftar.' };
    }

    const newUser = {
      id: `usr-${users.length + 1}`,
      name,
      email,
      password,
      role: 'Masyarakat',
      created_at: new Date().toISOString()
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    triggerNotification('Registrasi Berhasil', 'Akun Anda berhasil dibuat. Silakan ajukan pengaduan.', 'success');
    return { success: true, user: newUser };
  };

  // 3. Auth: Logout
  const logout = () => {
    setCurrentUser(null);
    triggerNotification('Log Out', 'Anda telah keluar dari sistem.', 'info');
  };

  // 4. Create Complaint
  const createComplaint = (data) => {
    if (!currentUser) return { success: false, message: 'Harus login terlebih dahulu.' };

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
  const addCategory = (name, code) => {
    if (!currentUser || currentUser.role !== 'Super Admin') return { success: false };
    const id = name.toLowerCase().replace(/\s+/g, '-');
    const newCat = { id, name, code: code.toUpperCase() };
    setCategories(prev => [...prev, newCat]);
    return { success: true };
  };

  const deleteCategory = (id) => {
    if (!currentUser || currentUser.role !== 'Super Admin') return { success: false };
    setCategories(prev => prev.filter(c => c.id !== id));
    return { success: true };
  };

  // 9. Super Admin: Manage Admins
  const createAdmin = (name, email, password) => {
    if (!currentUser || currentUser.role !== 'Super Admin') return { success: false, message: 'Unauthorized' };
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return { success: false, message: 'Email sudah terdaftar.' };

    const newAdmin = {
      id: `usr-${users.length + 1}`,
      name,
      email,
      password,
      role: 'Admin',
      created_at: new Date().toISOString()
    };

    setUsers(prev => [...prev, newAdmin]);
    return { success: true };
  };

  const deleteAdmin = (adminId) => {
    if (!currentUser || currentUser.role !== 'Super Admin') return { success: false };
    // Prevent self delete
    if (adminId === currentUser.id) return { success: false, message: 'Tidak dapat menghapus akun Anda sendiri.' };
    setUsers(prev => prev.filter(u => u.id !== adminId));
    return { success: true };
  };

  return (
    <MockDataContext.Provider value={{
      users,
      complaints,
      categories,
      statusLogs,
      chats,
      auditLogs,
      currentUser,
      notifications,
      login,
      register,
      logout,
      createComplaint,
      updateComplaintStatus,
      closeComplaint,
      addChatMessage,
      triggerNotification,
      removeNotification,
      addCategory,
      deleteCategory,
      createAdmin,
      deleteAdmin
    }}>
      {children}
    </MockDataContext.Provider>
  );
};

export const useMockData = () => useContext(MockDataContext);
