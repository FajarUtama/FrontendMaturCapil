import { apiRequest, toServiceResult } from './apiClient';
import { mapComplaint } from './mappers';
import { photosToUploadBlobs } from '../utils/fileHelpers';

const buildComplaintFormData = (payload) => {
  const fd = new FormData();
  fd.append('title', payload.title);
  fd.append('description', payload.description);
  fd.append('category_id', payload.categoryId);
  fd.append('priority', payload.priority || 'Sedang');
  fd.append('latitude', String(payload.latitude));
  fd.append('longitude', String(payload.longitude));
  fd.append('address', payload.address);

  const blobs = photosToUploadBlobs(payload.photos || []);
  blobs.forEach((blob, index) => {
    fd.append('photos[]', blob, `photo-${index}.jpg`);
  });
  return fd;
};

const buildCloseFormData = (resolutionNote, photos = []) => {
  const fd = new FormData();
  fd.append('resolution_note', resolutionNote);
  const blobs = photosToUploadBlobs(photos);
  blobs.forEach((blob, index) => {
    fd.append('evidence_after[]', blob, `evidence-${index}.jpg`);
  });
  return fd;
};

/** @param {Record<string, unknown>} [params] */
export const listComplaints = (params) =>
  toServiceResult(async () => {
    const { data } = await apiRequest('/complaints', { params: { per_page: 100, ...params } });
    const items = Array.isArray(data) ? data : data?.items ?? [];
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
  listComplaints({ user_id: userId });

/**
 * @param {import('./types').CreateComplaintPayload} payload
 */
export const createComplaint = (payload) =>
  toServiceResult(async () => {
    const blobs = photosToUploadBlobs(payload.photos || []);
    if (blobs.length > 0) {
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
      },
    });
    return { success: true, complaint: mapComplaint(data), message, ...meta };
  });

export const updateComplaintStatus = (id, status, note) =>
  toServiceResult(async () => {
    const { data } = await apiRequest(`/complaints/${id}/status`, {
      method: 'PATCH',
      body: { status, note },
    });
    return { success: true, complaint: mapComplaint(data) };
  });

export const closeComplaint = (id, resolutionNote, evidenceAfterPhotos = []) =>
  toServiceResult(async () => {
    const blobs = photosToUploadBlobs(evidenceAfterPhotos);
    if (blobs.length > 0) {
      const { data } = await apiRequest(`/complaints/${id}/close`, {
        method: 'POST',
        formData: buildCloseFormData(resolutionNote, evidenceAfterPhotos),
      });
      return { success: true, complaint: mapComplaint(data) };
    }
    const { data } = await apiRequest(`/complaints/${id}/close`, {
      method: 'POST',
      body: { resolution_note: resolutionNote },
    });
    return { success: true, complaint: mapComplaint(data) };
  });

export const listChatMessages = (complaintId) =>
  toServiceResult(async () => {
    const { data } = await apiRequest(`/complaints/${complaintId}/chats`);
    return { success: true, chats: Array.isArray(data) ? data : data?.items ?? [] };
  });

export const sendChatMessage = (complaintId, message) =>
  toServiceResult(async () => {
    const { data } = await apiRequest(`/complaints/${complaintId}/chats`, {
      method: 'POST',
      body: { message },
    });
    return { success: true, chat: data };
  });

export const listStatusLogs = (complaintId) =>
  toServiceResult(async () => {
    const { data } = await apiRequest(`/complaints/${complaintId}/status-logs`);
    return { success: true, logs: Array.isArray(data) ? data : data?.items ?? [] };
  });
