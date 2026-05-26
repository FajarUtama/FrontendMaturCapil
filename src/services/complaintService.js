import { apiRequest, toServiceResult } from './apiClient';
import { mapComplaint } from './mappers';
import { photosToUploadBlobs } from '../utils/fileHelpers';
import { uploadBatch } from './uploadService';

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
    let photoUrls = [];
    if (blobs.length > 0) {
      const uploadRes = await uploadBatch(blobs, 'complaints');
      if (!uploadRes.success) return uploadRes;
      photoUrls = uploadRes.urls || [];
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
        photos: photoUrls,
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
    let evidenceUrls = [];
    if (blobs.length > 0) {
      const uploadRes = await uploadBatch(blobs, 'evidence_after');
      if (!uploadRes.success) return uploadRes;
      evidenceUrls = uploadRes.urls || [];
    }
    const { data } = await apiRequest(`/complaints/${id}/close`, {
      method: 'POST',
      body: {
        resolution_note: resolutionNote,
        evidence_after_photos: evidenceUrls,
      },
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
