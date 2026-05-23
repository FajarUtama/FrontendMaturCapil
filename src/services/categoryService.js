import { apiRequest, toServiceResult } from './apiClient';
import { mapCategory } from './mappers';

export const listCategories = (params = {}) =>
  toServiceResult(async () => {
    const { data } = await apiRequest('/categories', { params });
    const items = Array.isArray(data) ? data : data?.items ?? [];
    return { success: true, categories: items.map(mapCategory) };
  });

/** @param {Record<string, unknown>} payload */
export const createCategory = (payload) =>
  toServiceResult(async () => {
    const { data } = await apiRequest('/categories', {
      method: 'POST',
      body: payload,
    });
    return { success: true, category: mapCategory(data) };
  });

/** @param {string} id @param {Record<string, unknown>} payload */
export const updateCategory = (id, payload) =>
  toServiceResult(async () => {
    const { data } = await apiRequest(`/categories/${id}`, {
      method: 'PATCH',
      body: payload,
    });
    return { success: true, category: mapCategory(data) };
  });

/** @param {string} id */
export const deleteCategory = (id) =>
  toServiceResult(async () => {
    await apiRequest(`/categories/${id}`, { method: 'DELETE' });
    return { success: true };
  });
