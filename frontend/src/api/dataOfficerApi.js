import api from "./axios";

/**
 * Fetch data officers with optional pagination and filtering
 * @param {Object} params - Query parameters {page, limit, search}
 */
export const getDataOfficers = (params) =>
  api.get("/admin/data-officers", { params });

export const getDataOfficerById = (id) => api.get(`/admin/data-officers/${id}`);

export const createDataOfficer = (data) =>
  api.post("/admin/data-officers", data);

export const updateDataOfficer = (id, data) =>
  api.put(`/admin/data-officers/${id}`, data);

export const deleteDataOfficer = (id) =>
  api.delete(`/admin/data-officers/${id}`);

export const regenerateDataOfficerPassword = (id) =>
  api.post(`/admin/data-officers/${id}/regenerate-password`);
