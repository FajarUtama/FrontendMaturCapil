/**
 * CONTOH — belum dipakai di App.jsx.
 * Salin/expand menjadi ApiDataProvider.jsx saat BE siap, lalu sambungkan di AppDataContext.
 *
 * Pola:
 * 1. useEffect: authService.getMe() + complaintService.listComplaints() saat mount
 * 2. State React sama seperti MockDataContext (users, complaints, currentUser, ...)
 * 3. Setiap aksi UI → panggil service → update state dari response
 */
import React, { useState, useCallback } from 'react';
import * as authService from '../services/authService';
import * as complaintService from '../services/complaintService';
import { getEffectivePermissions, hasPermission, isSuperAdmin } from '../utils/rbac';

export function ApiDataProviderExample({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // TODO: bootstrap session
  // useEffect(() => { authService.getMe().then(...) }, []);

  const login = useCallback(async (email, password, portalType) => {
    const result = await authService.login(portalType, email, password);
    if (result.success) setCurrentUser(result.user);
    return result;
  }, []);

  const createComplaint = useCallback(async (payload) => {
    const result = await complaintService.createComplaint(payload);
    if (result.success && result.complaint) {
      setComplaints((prev) => [result.complaint, ...prev]);
    }
    return result;
  }, []);

  const value = {
    currentUser,
    complaints,
    loading,
    login,
    createComplaint,
    hasPermission: (perm) => hasPermission(currentUser, perm),
    isSuperAdmin: () => isSuperAdmin(currentUser),
    getEffectivePermissions: () => getEffectivePermissions(currentUser),
    // ... lengkapi sesuai MockDataContext.Provider value
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-500">Memuat data...</div>;
  }

  return <>{/* <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider> */}</>;
}
