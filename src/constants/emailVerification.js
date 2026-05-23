export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 menit
export const OTP_MAX_RESEND = 3;
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 60 detik

export const generateOtp = () =>
  String(Math.floor(100000 + Math.random() * 900000));
