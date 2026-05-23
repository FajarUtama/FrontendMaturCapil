import { apiRequest, toServiceResult } from './apiClient';
import { mapAuditLog } from './mappers';

/** @param {Record<string, unknown>} [params] */
export const listAuditLogs = (params) =>
  toServiceResult(async () => {
    const { data } = await apiRequest('/audit-logs', { params });
    const items = Array.isArray(data) ? data : data?.items ?? [];
    return { success: true, auditLogs: items.map(mapAuditLog) };
  });

/** @param {Record<string, unknown>} [params] — filter yang sama dengan list */
export const exportAuditLogsCsv = (params) =>
  apiRequest('/audit-logs/export', {
    params,
    unwrap: false,
    headers: { Accept: 'text/csv' },
  });
