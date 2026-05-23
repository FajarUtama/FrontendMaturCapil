export const PERMISSIONS = [
  { code: 'dashboard.view', name: 'Lihat Dashboard', group: 'Dashboard' },
  { code: 'complaint.verify', name: 'Verifikasi Aduan', group: 'Pengaduan' },
  { code: 'complaint.reject', name: 'Tolak Aduan', group: 'Pengaduan' },
  { code: 'complaint.close', name: 'Tutup Aduan', group: 'Pengaduan' },
  { code: 'complaint.export', name: 'Ekspor Aduan', group: 'Pengaduan' },
  { code: 'user.view', name: 'Lihat User', group: 'User' },
  { code: 'user.create', name: 'Tambah User', group: 'User' },
  { code: 'user.update', name: 'Edit User', group: 'User' },
  { code: 'user.delete', name: 'Nonaktifkan User', group: 'User' },
  { code: 'category.manage', name: 'Kelola Kategori', group: 'Kategori' },
  { code: 'auditlog.view', name: 'Lihat Audit Log', group: 'Keamanan' },
];

export const ALL_PERMISSION_CODES = PERMISSIONS.map((p) => p.code);

export const DEFAULT_ADMIN_PERMISSIONS = [
  'dashboard.view',
  'complaint.verify',
  'complaint.reject',
  'complaint.close',
  'complaint.export',
];

export const ACCOUNT_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
};

export const STATUS_LABELS = {
  ACTIVE: 'Aktif',
  INACTIVE: 'Nonaktif',
  SUSPENDED: 'Ditangguhkan',
};
