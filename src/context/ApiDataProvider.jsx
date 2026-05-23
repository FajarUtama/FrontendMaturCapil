import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getAccessToken, clearAuthTokens } from '../config/authStorage';
import { isMockApi } from '../config/env';
import { hasPermission as checkPermission, isSuperAdmin, getEffectivePermissions } from '../utils/rbac';
import * as authService from '../services/authService';
import * as complaintService from '../services/complaintService';
import * as categoryService from '../services/categoryService';
import * as userService from '../services/userService';
import * as auditService from '../services/auditService';
import { mapUser } from '../services/mappers';

const ApiDataContext = createContext(null);

const mergeByComplaintId = (prev, complaintId, key, items) => {
  const rest = prev.filter((x) => x.complaint_id !== complaintId);
  return [...rest, ...items];
};

export const ApiDataProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statusLogs, setStatusLogs] = useState([]);
  const [chats, setChats] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const triggerNotification = useCallback((title, message, type = 'info') => {
    const id = `notif-${Date.now()}`;
    setNotifications((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const refreshCategories = useCallback(async () => {
    const isAdmin = currentUser && currentUser.role !== 'Masyarakat';
    const result = await categoryService.listCategories(
      isAdmin ? { include_inactive: true } : { active_only: true }
    );
    if (result.success) setCategories(result.categories);
  }, [currentUser]);

  const refreshComplaints = useCallback(async () => {
    const result = await complaintService.listComplaints();
    if (result.success) setComplaints(result.complaints);
  }, []);

  const refreshUsers = useCallback(async () => {
    if (!currentUser || !checkPermission(currentUser, 'user.view')) return;
    const result = await userService.listUsers({ per_page: 100 });
    if (result.success) setUsers(result.users);
  }, [currentUser]);

  const refreshAuditLogs = useCallback(async () => {
    if (!currentUser || !checkPermission(currentUser, 'auditlog.view')) return;
    const result = await auditService.listAuditLogs({ per_page: 100 });
    if (result.success) setAuditLogs(result.auditLogs);
  }, [currentUser]);

  const refreshAllForUser = useCallback(
    async (user) => {
      await Promise.all([
        categoryService.listCategories(
          user?.role === 'Masyarakat' ? { active_only: true } : { include_inactive: true }
        ).then((r) => r.success && setCategories(r.categories)),
        complaintService.listComplaints().then((r) => r.success && setComplaints(r.complaints)),
        user && checkPermission(user, 'user.view')
          ? userService.listUsers({ per_page: 100 }).then((r) => r.success && setUsers(r.users))
          : Promise.resolve(),
        user && checkPermission(user, 'auditlog.view')
          ? auditService.listAuditLogs({ per_page: 100 }).then((r) => r.success && setAuditLogs(r.auditLogs))
          : Promise.resolve(),
      ]);
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = getAccessToken();
      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }
      const me = await authService.getMe();
      if (cancelled) return;
      if (me.success && me.user) {
        setCurrentUser(me.user);
        await refreshAllForUser(me.user);
      } else {
        clearAuthTokens();
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshAllForUser]);

  const login = async (email, password, portalType) => {
    const result = await authService.login(portalType, email, password);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      await refreshAllForUser(result.user);
      triggerNotification('Login Berhasil', `Selamat datang kembali, ${result.user.name}!`, 'success');
    }
    return result;
  };

  const logout = async () => {
    await authService.logout();
    clearAuthTokens();
    setCurrentUser(null);
    setUsers([]);
    setComplaints([]);
    setCategories([]);
    setStatusLogs([]);
    setChats([]);
    setAuditLogs([]);
    triggerNotification('Log Out', 'Anda telah keluar dari sistem.', 'info');
  };

  const registerCitizenStart = async (payload) =>
    authService.registerCitizenStart(payload);

  const registerCitizenVerify = async (email, otpCode) => {
    const result = await authService.registerCitizenVerify(email, otpCode);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      await refreshAllForUser(result.user);
      triggerNotification(
        'Email Terverifikasi',
        'Akun berhasil dibuat. Anda dapat membuat laporan tanpa batas.',
        'success'
      );
    }
    return result;
  };

  const resendRegistrationOtp = (email) => authService.resendRegistrationOtp(email);

  const sendEmailVerificationOtp = async () => {
    const result = await authService.sendEmailVerificationOtp();
    if (result.success) {
      triggerNotification('OTP Terkirim', result.message || 'Kode verifikasi dikirim.', 'info');
    }
    return result;
  };

  const resendEmailVerificationOtp = () => authService.resendEmailVerificationOtp();

  const verifyCurrentUserEmail = async (otpCode) => {
    const result = await authService.verifyCurrentUserEmail(otpCode);
    if (result.success) {
      const user = result.user ? mapUser(result.user) : { ...currentUser, email_verified: true };
      setCurrentUser(user);
      triggerNotification('Email Terverifikasi', 'Anda dapat membuat laporan tanpa batas.', 'success');
    }
    return result;
  };

  const loadComplaintExtras = useCallback(async (complaintId) => {
    const [logsRes, chatsRes] = await Promise.all([
      complaintService.listStatusLogs(complaintId),
      complaintService.listChatMessages(complaintId),
    ]);
    if (logsRes.success) {
      setStatusLogs((prev) => mergeByComplaintId(prev, complaintId, 'logs', logsRes.logs));
    }
    if (chatsRes.success) {
      setChats((prev) => mergeByComplaintId(prev, complaintId, 'chats', chatsRes.chats));
    }
  }, []);

  const createComplaint = async (data) => {
    if (!currentUser) return { success: false, message: 'Harus login terlebih dahulu.' };
    const result = await complaintService.createComplaint({
      title: data.title,
      description: data.description,
      categoryId: data.categoryId,
      priority: data.priority,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      photos: data.photos,
    });
    if (result.needsEmailVerification) return result;
    if (result.success) {
      await refreshComplaints();
      const ticket = result.complaint?.ticket_number || '';
      triggerNotification('Aduan Diajukan', `Aduan ${ticket} berhasil dikirim.`, 'success');
    }
    return result;
  };

  const updateComplaintStatus = async (complaintId, status, note) => {
    const result = await complaintService.updateComplaintStatus(complaintId, status, note);
    if (result.success) {
      setComplaints((prev) =>
        prev.map((c) => (c.id === complaintId ? { ...c, ...result.complaint } : c))
      );
      await loadComplaintExtras(complaintId);
      const comp = complaints.find((c) => c.id === complaintId);
      triggerNotification(
        'Status Laporan Berubah',
        `Laporan #${comp?.ticket_number || complaintId} kini berstatus: ${status}.`,
        status === 'Ditolak' ? 'error' : 'info'
      );
    }
    return result;
  };

  const closeComplaint = async (complaintId, note, afterPhotos) => {
    const result = await complaintService.closeComplaint(complaintId, note, afterPhotos);
    if (result.success) {
      setComplaints((prev) =>
        prev.map((c) => (c.id === complaintId ? { ...c, ...result.complaint } : c))
      );
      await loadComplaintExtras(complaintId);
      triggerNotification('Laporan Selesai', 'Laporan telah diselesaikan.', 'success');
    }
    return result;
  };

  const addChatMessage = async (complaintId, message, senderId) => {
    const result = await complaintService.sendChatMessage(complaintId, message);
    if (result.success) {
      await loadComplaintExtras(complaintId);
    }
    return result;
  };

  const addCategory = async (name, code, description = '') => {
    const result = await categoryService.createCategory({ name, code, description });
    if (result.success) await refreshCategories();
    return result;
  };

  const updateCategory = async (id, data) => {
    const result = await categoryService.updateCategory(id, data);
    if (result.success) await refreshCategories();
    return result;
  };

  const deleteCategory = async (id) => {
    const result = await categoryService.deleteCategory(id);
    if (result.success) await refreshCategories();
    return result;
  };

  const createCitizen = async (data) => {
    const result = await userService.createCitizen(data);
    if (result.success) await refreshUsers();
    return result;
  };

  const createAdmin = async (name, email, password, permissions, nik = '') => {
    const result = await userService.createAdmin(name, email, password, permissions, nik);
    if (result.success) await refreshUsers();
    return result;
  };

  const updateUser = async (userId, data) => {
    const result = await userService.updateUser(userId, data);
    if (result.success) {
      await refreshUsers();
      if (currentUser?.id === userId && result.user) setCurrentUser(result.user);
    }
    return result;
  };

  const deactivateUser = async (userId) => {
    const result = await userService.deactivateUser(userId);
    if (result.success) await refreshUsers();
    return result;
  };

  const resetUserPassword = async (userId, newPassword, forceReset = false) => {
    const result = await userService.resetUserPassword(userId, newPassword, forceReset);
    return result;
  };

  const updateAdminPermissions = async (adminId, permissions) => {
    const result = await userService.updateAdminPermissions(adminId, permissions);
    if (result.success) await refreshUsers();
    return result;
  };

  const getUserComplaints = (userId) => complaints.filter((c) => c.user_id === userId);

  const activeCategories = useMemo(
    () => categories.filter((c) => c.is_active && !c.deleted_at),
    [categories]
  );

  const value = {
    loading,
    isApiMode: !isMockApi(),
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
    register: registerCitizenStart,
    registerCitizenStart,
    registerCitizenVerify,
    resendRegistrationOtp,
    sendEmailVerificationOtp,
    resendEmailVerificationOtp,
    verifyCurrentUserEmail,
    getRegistrationOtpInfo: () => null,
    logout,
    createComplaint,
    updateComplaintStatus,
    closeComplaint,
    addChatMessage,
    loadComplaintExtras,
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
    deleteAdmin: deactivateUser,
    getUserComplaints,
    refreshComplaints,
    hasPermission: (perm) => checkPermission(currentUser, perm),
    isSuperAdmin: () => isSuperAdmin(currentUser),
    getEffectivePermissions: () => getEffectivePermissions(currentUser),
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-sm text-slate-500">
        <span className="w-5 h-5 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mr-2" />
        Memuat data...
      </div>
    );
  }

  return <ApiDataContext.Provider value={value}>{children}</ApiDataContext.Provider>;
};

export const useApiData = () => {
  const ctx = useContext(ApiDataContext);
  if (!ctx) throw new Error('useApiData harus dipakai di dalam ApiDataProvider');
  return ctx;
};
