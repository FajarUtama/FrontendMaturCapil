export const validateNik = (nik) => {
  if (!nik) return 'NIK wajib diisi.';
  if (!/^\d+$/.test(nik)) return 'NIK hanya boleh berisi angka.';
  if (nik.length !== 16) return 'NIK harus 16 digit.';
  return null;
};

export const validatePassword = (password) => {
  if (!password || password.length < 8) return 'Password minimal 8 karakter.';
  if (!/[0-9]/.test(password)) return 'Password harus mengandung minimal 1 angka.';
  if (!/[A-Z]/.test(password)) return 'Password harus mengandung minimal 1 huruf besar.';
  return null;
};
