import api from "./axios";

/**
 * Fetch data collectors with optional pagination and search
 * @param {Object} params - Query parameters {page, limit, search}
 */
export const getDataCollectors = (params) =>
  api.get("/admin/data-collectors", { params });

export const getDataCollectorById = (id) =>
  api.get(`/admin/data-collectors/${id}`);

export const createDataCollector = (data) =>
  api.post("/admin/data-collectors", data);

export const updateDataCollector = (id, data) =>
  api.put(`/admin/data-collectors/${id}`, data);

export const deleteDataCollector = (id) =>
  api.delete(`/admin/data-collectors/${id}`);

export const regenerateDataCollectorPassword = (id) =>
  api.post(`/admin/data-collectors/${id}/regenerate-password`);
