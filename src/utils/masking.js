export const maskEmail = (email) => {
  if (!email || !email.includes('@')) return '***@***';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local.slice(0, 2)}${'*'.repeat(Math.min(local.length - 2, 4))}@${domain}`;
};

export const maskNik = (nik) => {
  if (!nik || nik.length !== 16) return '****';
  return `${nik.slice(0, 4)}${'*'.repeat(8)}${nik.slice(-4)}`;
};

export const maskUserField = (value, field, isSuperAdmin) => {
  if (isSuperAdmin || !value) return value;
  if (field === 'email') return maskEmail(value);
  if (field === 'nik') return maskNik(value);
  return value;
};
