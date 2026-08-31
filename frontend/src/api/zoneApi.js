import api from "./axios";

/**
 * Fetch zones with optional pagination and filtering
 * @param {Object} params - Query parameters {page, limit, search, districtId}
 */
export const getZones = (params) => api.get("/admin/zones", { params });

export const getZoneById = (id) => api.get(`/admin/zones/${id}`);

export const createZone = (data) => api.post("/admin/zones", data);

export const updateZone = (id, data) => api.put(`/admin/zones/${id}`, data);

export const deleteZone = (id) => api.delete(`/admin/zones/${id}`);
