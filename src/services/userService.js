import { apiRequest, toServiceResult } from './apiClient';
import { mapUser } from './mappers';

/** @param {Record<string, unknown>} [params] */
export const listUsers = (params) =>
  toServiceResult(async () => {
    const { data } = await apiRequest('/users', { params: { per_page: 100, ...params } });
    const items = Array.isArray(data) ? data : data?.items ?? [];
    return { success: true, users: items.map(mapUser) };
  });

/** @param {string} id */
export const getUser = (id) =>
  toServiceResult(async () => {
    const { data } = await apiRequest(`/users/${id}`);
    return { success: true, user: mapUser(data) };
  });

/** @param {Record<string, unknown>} payload */
export const createCitizen = (payload) =>
  toServiceResult(async () => {
    const { data } = await apiRequest('/users/citizens', {
      method: 'POST',
      body: {
        name: payload.name,
        email: payload.email,
        nik: payload.nik,
        password: payload.password,
      },
    });
    return { success: true, user: mapUser(data) };
  });

/**
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @param {string[]} permissions
 * @param {string} [nik]
 */
export const createAdmin = (name, email, password, permissions, nik = '') =>
  toServiceResult(async () => {
    const { data } = await apiRequest('/users/admins', {
      method: 'POST',
      body: { name, email, password, permissions, nik: nik || undefined },
    });
    return { success: true, user: mapUser(data) };
  });

/** @param {string} id @param {Record<string, unknown>} payload */
export const updateUser = (id, payload) =>
  toServiceResult(async () => {
    const { data } = await apiRequest(`/users/${id}`, {
      method: 'PATCH',
      body: payload,
    });
    return { success: true, user: mapUser(data) };
  });

/** @param {string} id */
export const deactivateUser = (id) =>
  toServiceResult(async () => {
    await apiRequest(`/users/${id}`, { method: 'DELETE' });
    return { success: true };
  });

/**
 * @param {string} id
 * @param {string} newPassword
 * @param {boolean} [forceReset]
 */
export const resetUserPassword = (id, newPassword, forceReset = false) =>
  toServiceResult(async () => {
    await apiRequest(`/users/${id}/reset-password`, {
      method: 'POST',
      body: { password: newPassword, force_reset: forceReset },
    });
    return { success: true };
  });

/** @param {string} adminId @param {string[]} permissions */
export const updateAdminPermissions = (adminId, permissions) =>
  toServiceResult(async () => {
    const { data } = await apiRequest(`/users/${adminId}/permissions`, {
      method: 'PUT',
      body: { permissions },
    });
    return { success: true, user: mapUser(data) };
  });
