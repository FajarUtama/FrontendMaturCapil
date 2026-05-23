/**
 * Konfigurasi lingkungan (Vite).
 * @see https://vite.dev/guide/env-and-mode
 */

/** @returns {boolean} true = pakai MockDataContext (default) */
export const isMockApi = () => import.meta.env.VITE_USE_MOCK_API !== 'false';

/** @returns {string} Base URL backend tanpa trailing slash */
export const getApiBaseUrl = () => {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
  return base.replace(/\/$/, '');
};

export const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS) || 30_000;

/** Interval polling chat REST (ms) */
export const CHAT_POLL_INTERVAL_MS = Number(import.meta.env.VITE_CHAT_POLL_MS) || 10_000;

/** Origin server untuk file /uploads (tanpa /api/v1) */
export const getUploadsOrigin = () => {
  const explicit = import.meta.env.VITE_UPLOADS_ORIGIN;
  if (explicit) return explicit.replace(/\/$/, '');
  const api = getApiBaseUrl();
  return api.replace(/\/api\/v1\/?$/, '');
};
