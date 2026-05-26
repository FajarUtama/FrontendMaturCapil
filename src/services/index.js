/**
 * Layer integrasi backend MaturCapil.
 * UI tetap memakai context; saat BE siap, implementasi context memanggil modul ini.
 * @see docs/API_SPEC_BACKEND.md — spesifikasi lengkap untuk tim BE
 */

export { ApiError, apiRequest, toServiceResult, unwrapApiBody } from './apiClient';
export * as authService from './authService';
export * as complaintService from './complaintService';
export * as userService from './userService';
export * as categoryService from './categoryService';
export * as auditService from './auditService';
export * as uploadService from './uploadService';
export * from './mappers';
