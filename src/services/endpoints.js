/**
 * Referensi path API untuk tim backend.
 * Sesuaikan jika kontrak berbeda — cukup ubah di service terkait.
 */
export const API_ENDPOINTS = {
  auth: {
    login: 'POST /auth/login',
    logout: 'POST /auth/logout',
    me: 'GET /auth/me',
    register: 'POST /auth/register',
    registerVerifyOtp: 'POST /auth/register/verify-otp',
    registerResendOtp: 'POST /auth/register/resend-otp',
    emailSendOtp: 'POST /auth/email/send-otp',
    emailResendOtp: 'POST /auth/email/resend-otp',
    emailVerify: 'POST /auth/email/verify',
  },
  complaints: {
    list: 'GET /complaints',
    detail: 'GET /complaints/:id',
    create: 'POST /complaints',
    updateStatus: 'PATCH /complaints/:id/status',
    close: 'POST /complaints/:id/close',
    chats: 'GET|POST /complaints/:id/chats',
    statusLogs: 'GET /complaints/:id/status-logs',
  },
  users: {
    list: 'GET /users',
    detail: 'GET /users/:id',
    createCitizen: 'POST /users/citizens',
    createAdmin: 'POST /users/admins',
    update: 'PATCH /users/:id',
    delete: 'DELETE /users/:id',
    resetPassword: 'POST /users/:id/reset-password',
    permissions: 'PUT /users/:id/permissions',
  },
  categories: {
    list: 'GET /categories',
    create: 'POST /categories',
    update: 'PATCH /categories/:id',
    delete: 'DELETE /categories/:id',
  },
  auditLogs: {
    list: 'GET /audit-logs',
    export: 'GET /audit-logs/export',
  },
  uploads: {
    single: 'POST /uploads?folder=complaints|evidence_after|documents',
    batch: 'POST /uploads/batch?folder=complaints|evidence_after|documents',
  },
};
