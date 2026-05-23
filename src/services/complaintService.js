import { apiRequest, toServiceResult } from './apiClient';
import { mapComplaint } from './mappers';

/**
 * @param {import('./types').CreateComplaintPayload} payload
 */
const buildComplaintFormData = (payload) => {
  const fd = new FormData();
  fd.append('title', payload.title);
  fd.append('description', payload.description);
  fd.append('category_id', payload.categoryId);
  fd.append('priority', payload.priority || 'Sedang');
  fd.append('latitude', String(payload.latitude));
  fd.append('longitude', String(payload.longitude));
  fd.append('address', payload.address);

  (payload.photos || []).forEach((photo, index) => {
    if (photo instanceof Blob) {
      fd.append('photos[]', photo, `photo-${index}.jpg`);
    }
  });
  return fd;
};

/** @param {Record<string, unknown>} [params] */
export const listComplaints = (params) =>
  toServiceResult(async () => {
    const { data } = await apiRequest('/complaints', { params });
    const items = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];
    return { success: true, complaints: items.map(mapComplaint) };
  });

/** @param {string} id */
export const getComplaint = (id) =>
  toServiceResult(async () => {
    const { data } = await apiRequest(`/complaints/${id}`);
    return { success: true, complaint: mapComplaint(data) };
  });

/** @param {string} userId */
export const getUserComplaints = (userId) =>
  toServiceResult(async () => {
    const { data } = await apiRequest('/complaints', { params: { user_id: userId } });
    const items = Array.isArray(data) ? data : data?.items ?? [];
    return { success: true, complaints: items.map(mapComplaint) };
  });

/**
 * @param {import('./types').CreateComplaintPayload} payload
 */
export const createComplaint = (payload) =>
  toServiceResult(async () => {
    const hasFilePhotos = (payload.photos || []).some((p) => p instanceof Blob);
    if (hasFilePhotos) {
      const { data, message } = await apiRequest('/complaints', {
        method: 'POST',
        formData: buildComplaintFormData(payload),
      });
      return { success: true, complaint: mapComplaint(data), message };
    }
    const { data, message, ...meta } = await apiRequest('/complaints', {
      method: 'POST',
      body: {
        title: payload.title,
        description: payload.description,
        category_id: payload.categoryId,
        priority: payload.priority || 'Sedang',
        latitude: payload.latitude,
        longitude: payload.longitude,
        address: payload.address,
        photos: payload.photos,
      },
    });
    return { success: true, complaint: mapComplaint(data), message, ...meta };
  });

/**
 * @param {string} id
 * @param {string} status
 * @param {string} [note]
 */
export const updateComplaintStatus = (id, status, note) =>
  toServiceResult(async () => {
    const { data } = await apiRequest(`/complaints/${id}/status`, {
      method: 'PATCH',
      body: { status, note },
    });
    return { success: true, complaint: mapComplaint(data) };
  });

/**
 * @param {string} id
 * @param {{ resolutionNote: string, evidenceAfterPhotos?: (string|Blob)[] }} payload
 */
export const closeComplaint = (id, payload) =>
  toServiceResult(async () => {
    const { data } = await apiRequest(`/complaints/${id}/close`, {
      method: 'POST',
      body: {
        resolution_note: payload.resolutionNote,
        evidence_after_photos: payload.evidenceAfterPhotos,
      },
    });
    return { success: true, complaint: mapComplaint(data) };
  });

/** @param {string} complaintId */
export const listChatMessages = (complaintId) =>
  toServiceResult(async () => {
    const { data } = await apiRequest(`/complaints/${complaintId}/chats`);
    return { success: true, chats: Array.isArray(data) ? data : data?.items ?? [] };
  });

/**
 * @param {string} complaintId
 * @param {string} message
 */
export const sendChatMessage = (complaintId, message) =>
  toServiceResult(async () => {
    const { data } = await apiRequest(`/complaints/${complaintId}/chats`, {
      method: 'POST',
      body: { message },
    });
    return { success: true, chat: data };
  });

/** @param {string} complaintId */
export const listStatusLogs = (complaintId) =>
  toServiceResult(async () => {
    const { data } = await apiRequest(`/complaints/${complaintId}/status-logs`);
    return { success: true, logs: Array.isArray(data) ? data : data?.items ?? [] };
  });
