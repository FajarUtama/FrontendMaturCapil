import { apiRequest, toServiceResult } from './apiClient';
import { setAuthTokens, clearAuthTokens } from '../config/authStorage';
import { mapUser } from './mappers';

/**
 * Auth & registrasi warga — path disesuaikan dengan kontrak BE Anda.
 * @module services/authService
 */

/**
 * @param {'citizen'|'admin'} portalType
 * @param {string} email
 * @param {string} password
 */
export const login = (portalType, email, password) =>
  toServiceResult(async () => {
    const { data, ...meta } = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password, portal: portalType },
      auth: false,
    });
    const user = mapUser(data.user ?? data);
    if (data.access_token ?? data.accessToken) {
      setAuthTokens({
        accessToken: data.access_token ?? data.accessToken,
        refreshToken: data.refresh_token ?? data.refreshToken,
      });
    }
    return { success: true, user, ...meta };
  });

export const logout = () => {
  clearAuthTokens();
  return toServiceResult(() =>
    apiRequest('/auth/logout', { method: 'POST' }).catch(() => ({ success: true }))
  );
};

export const getMe = () =>
  toServiceResult(async () => {
    const { data } = await apiRequest('/auth/me');
    return { success: true, user: mapUser(data) };
  });

/**
 * @param {{ name: string, nik: string, email: string, password: string, passwordConfirm: string }} payload
 */
export const registerCitizenStart = (payload) =>
  toServiceResult(async () => {
    const { data, message } = await apiRequest('/auth/register', {
      method: 'POST',
      body: {
        name: payload.name,
        nik: payload.nik,
        email: payload.email,
        password: payload.password,
        password_confirmation: payload.passwordConfirm,
      },
      auth: false,
    });
    return {
      success: true,
      email: data?.email ?? payload.email.trim().toLowerCase(),
      message: message || 'Kode OTP telah dikirim ke email Anda.',
    };
  });

/**
 * @param {string} email
 * @param {string} otpCode
 */
export const registerCitizenVerify = (email, otpCode) =>
  toServiceResult(async () => {
    const { data, ...meta } = await apiRequest('/auth/register/verify-otp', {
      method: 'POST',
      body: { email, otp: otpCode },
      auth: false,
    });
    const user = mapUser(data.user ?? data);
    if (data.access_token ?? data.accessToken) {
      setAuthTokens({
        accessToken: data.access_token ?? data.accessToken,
        refreshToken: data.refresh_token ?? data.refreshToken,
      });
    }
    return { success: true, user, ...meta };
  });

/** @param {string} email */
export const resendRegistrationOtp = (email) =>
  toServiceResult(async () => {
    const { message } = await apiRequest('/auth/register/resend-otp', {
      method: 'POST',
      body: { email },
      auth: false,
    });
    return { success: true, message: message || 'OTP baru telah dikirim.' };
  });

export const sendEmailVerificationOtp = () =>
  toServiceResult(async () => {
    const { message } = await apiRequest('/auth/email/send-otp', { method: 'POST' });
    return { success: true, message: message || 'OTP dikirim ke email Anda.' };
  });

export const resendEmailVerificationOtp = () =>
  toServiceResult(async () => {
    const { message } = await apiRequest('/auth/email/resend-otp', { method: 'POST' });
    return { success: true, message: message || 'OTP baru telah dikirim.' };
  });

/** @param {string} otpCode */
export const verifyCurrentUserEmail = (otpCode) =>
  toServiceResult(async () => {
    const { data, message } = await apiRequest('/auth/email/verify', {
      method: 'POST',
      body: { otp: otpCode },
    });
    const user = data?.user ? mapUser(data.user) : undefined;
    return { success: true, user, message };
  });
