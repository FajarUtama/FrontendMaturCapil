import { apiRequest, toServiceResult } from './apiClient';

const FOLDER_VALUES = new Set(['complaints', 'evidence_after', 'documents']);

const normalizeFolder = (folder) =>
  FOLDER_VALUES.has(folder) ? folder : 'documents';

/**
 * Upload banyak file (maks 3) ke backend.
 * Endpoint: POST /uploads/batch?folder=...
 *
 * @param {(Blob|File)[]} files
 * @param {'complaints'|'evidence_after'|'documents'} folder
 */
export const uploadBatch = (files, folder = 'documents') =>
  toServiceResult(async () => {
    const fd = new FormData();
    files.forEach((file, index) => {
      fd.append('files', file, `file-${index}.jpg`);
    });

    const { data } = await apiRequest('/uploads/batch', {
      method: 'POST',
      params: { folder: normalizeFolder(folder) },
      formData: fd,
    });

    const items = Array.isArray(data) ? data : data?.items ?? [];
    return {
      success: true,
      files: items,
      urls: items.map((x) => x.url).filter(Boolean),
    };
  });

