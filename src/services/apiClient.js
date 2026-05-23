import { getApiBaseUrl, API_TIMEOUT_MS } from '../config/env';
import { getAccessToken, clearAuthTokens } from '../config/authStorage';

export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {number} status
   * @param {Record<string, string[]>} [errors]
   * @param {*} [body]
   */
  constructor(message, status, errors, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.body = body;
    this.needsEmailVerification =
      body?.needs_email_verification ?? body?.needsEmailVerification ?? false;
  }
}

/**
 * @param {Response} res
 * @param {*} parsed
 */
const buildApiError = (res, parsed) => {
  const message =
    parsed?.message ||
    parsed?.error ||
    (typeof parsed === 'string' ? parsed : null) ||
    res.statusText ||
    `Request gagal (${res.status})`;
  return new ApiError(message, res.status, parsed?.errors, parsed);
};

/**
 * @param {*} body
 * @returns {import('./types').ApiResult & Record<string, unknown>}
 */
export const unwrapApiBody = (body) => {
  if (body == null) return { success: true };
  if (typeof body.success === 'boolean') {
    if (body.success) {
      return {
        success: true,
        message: body.message,
        data: body.data ?? body.result ?? body.payload,
        ...spreadMeta(body),
      };
    }
    return {
      success: false,
      message: body.message || 'Permintaan gagal.',
      errors: body.errors,
      needsEmailVerification: body.needsEmailVerification ?? body.needs_email_verification,
      ...spreadMeta(body),
    };
  }
  return { success: true, data: body };
};

/** Ambil field tambahan selain success/message/data/errors */
const spreadMeta = (body) => {
  const skip = new Set(['success', 'message', 'data', 'result', 'payload', 'errors']);
  return Object.fromEntries(Object.entries(body).filter(([k]) => !skip.has(k)));
};

/**
 * @param {string} path - path relatif, mis. `/auth/login`
 * @param {Object} [options]
 * @param {'GET'|'POST'|'PUT'|'PATCH'|'DELETE'} [options.method]
 * @param {Record<string, string|number|boolean|undefined|null>} [options.params]
 * @param {unknown} [options.body]
 * @param {FormData} [options.formData]
 * @param {Record<string, string>} [options.headers]
 * @param {boolean} [options.auth] - default true, sisipkan Bearer token
 * @param {boolean} [options.unwrap] - default true, parse envelope API
 */
export async function apiRequest(path, options = {}) {
  const {
    method = 'GET',
    params,
    body,
    formData,
    headers: extraHeaders = {},
    auth = true,
    unwrap = true,
  } = options;

  const url = new URL(`${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
    });
  }

  /** @type {Record<string, string>} */
  const headers = { Accept: 'application/json', ...extraHeaders };
  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  /** @type {RequestInit} */
  const init = { method, headers, signal: AbortSignal.timeout(API_TIMEOUT_MS) };

  if (formData) {
    init.body = formData;
  } else if (body !== undefined && method !== 'GET') {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  const res = await fetch(url.toString(), init);
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const parsed = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (res.status === 401 && auth) {
    clearAuthTokens();
  }

  if (!res.ok) {
    throw buildApiError(res, parsed);
  }

  if (!unwrap) return parsed;

  const result = unwrapApiBody(parsed);
  if (!result.success) {
    throw new ApiError(result.message, res.status, result.errors, parsed);
  }
  return result;
}

/**
 * Bungkus apiRequest → bentuk `{ success, message, data, ... }` seperti mock.
 * Tidak melempar pada failure — cocok untuk dipanggil dari context.
 * @param {() => Promise<*>} fn
 * @returns {Promise<import('./types').ApiResult>}
 */
export async function toServiceResult(fn) {
  try {
    const result = await fn();
    if (result && typeof result === 'object' && 'success' in result) return result;
    return { success: true, data: result?.data ?? result };
  } catch (err) {
    if (err instanceof ApiError) {
      return {
        success: false,
        message: err.message,
        errors: err.errors,
        needsEmailVerification: err.needsEmailVerification,
      };
    }
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Terjadi kesalahan jaringan.',
    };
  }
}
