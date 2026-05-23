import { ALL_PERMISSION_CODES } from '../constants/permissions';

export const isSuperAdmin = (user) => user?.role === 'Super Admin';

export const hasPermission = (user, permissionCode) => {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  if (user.role !== 'Admin') return false;
  return Array.isArray(user.permissions) && user.permissions.includes(permissionCode);
};

export const hasAnyPermission = (user, codes) => codes.some((code) => hasPermission(user, code));

export const getEffectivePermissions = (user) => {
  if (!user) return [];
  if (isSuperAdmin(user)) return ALL_PERMISSION_CODES;
  return user.permissions || [];
};
