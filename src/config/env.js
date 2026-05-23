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
