/**
 * Normalisasi response API → bentuk yang dipakai komponen (mock-compatible).
 */

/** @param {Record<string, unknown>} raw @returns {import('./types').AppUser} */
export const mapUser = (raw) => ({
  id: raw.id,
  name: raw.name,
  email: raw.email,
  role: raw.role,
  nik: raw.nik ?? '',
  status: raw.status ?? 'ACTIVE',
  email_verified: raw.email_verified ?? raw.emailVerified ?? false,
  email_verified_at: raw.email_verified_at ?? raw.emailVerifiedAt ?? null,
  permissions: raw.permissions ?? [],
  created_at: raw.created_at ?? raw.createdAt,
  deleted_at: raw.deleted_at ?? raw.deletedAt ?? null,
  deleted_by: raw.deleted_by ?? raw.deletedBy ?? null,
});

/** @param {Record<string, unknown>} raw @returns {import('./types').Complaint} */
export const mapComplaint = (raw) => ({
  id: raw.id,
  ticket_number: raw.ticket_number ?? raw.ticketNumber,
  user_id: raw.user_id ?? raw.userId,
  user_name: raw.user_name ?? raw.userName,
  title: raw.title,
  description: raw.description,
  category_id: raw.category_id ?? raw.categoryId,
  status: raw.status,
  priority: raw.priority,
  latitude: raw.latitude,
  longitude: raw.longitude,
  address: raw.address,
  created_at: raw.created_at ?? raw.createdAt,
  photos: raw.photos ?? [],
  evidence_after_photos: raw.evidence_after_photos ?? raw.evidenceAfterPhotos ?? [],
  resolution_note: raw.resolution_note ?? raw.resolutionNote ?? '',
  resolved_at: raw.resolved_at ?? raw.resolvedAt ?? null,
});

export const mapCategory = (raw) => ({
  id: raw.id,
  name: raw.name,
  code: raw.code,
  description: raw.description ?? '',
  is_active: raw.is_active ?? raw.isActive ?? true,
  deleted_at: raw.deleted_at ?? raw.deletedAt ?? null,
  deleted_by: raw.deleted_by ?? raw.deletedBy ?? null,
});

export const mapAuditLog = (raw) => ({
  id: raw.id,
  user_id: raw.user_id ?? raw.userId,
  user_name: raw.user_name ?? raw.userName,
  action: raw.action,
  table_name: raw.table_name ?? raw.tableName,
  record_id: raw.record_id ?? raw.recordId,
  detail: raw.detail,
  ip_address: raw.ip_address ?? raw.ipAddress,
  created_at: raw.created_at ?? raw.createdAt,
});
