/** Password demo seragam — dipakai di mock data & tombol autofill */
export const DEMO_PASSWORD = 'Password1';

/** Akun demo untuk pengujian cepat */
export const DEMO_ACCOUNTS = {
  citizen: {
    email: 'citizen@maturcapil.id',
    password: DEMO_PASSWORD,
    label: 'Warga (Masyarakat)',
  },
  admin: {
    email: 'admin@maturcapil.id',
    password: DEMO_PASSWORD,
    label: 'Staf Admin',
  },
  superAdmin: {
    email: 'superadmin@maturcapil.id',
    password: DEMO_PASSWORD,
    label: 'Super Admin',
  },
  adminAmir: {
    email: 'amir@maturcapil.id',
    password: DEMO_PASSWORD,
    label: 'Admin Amir',
  },
};

const DEMO_EMAILS = new Set(
  Object.values(DEMO_ACCOUNTS).map((a) => a.email.toLowerCase())
);

export const isDemoEmail = (email) => DEMO_EMAILS.has(email?.toLowerCase());

/** Sinkronkan password akun demo di localStorage (perbaiki data lama "password") */
export const syncDemoUserPasswords = (users) =>
  users.map((user) => {
    if (isDemoEmail(user.email)) {
      return { ...user, password: DEMO_PASSWORD };
    }
    return user;
  });

/** Cek password login — demo boleh Password1 atau legacy "password" */
export const verifyDemoPassword = (email, password) => {
  if (!isDemoEmail(email)) return false;
  return password === DEMO_PASSWORD || password === 'password';
};
