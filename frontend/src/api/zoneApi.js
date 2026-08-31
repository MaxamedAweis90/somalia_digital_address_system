import api from "./axios";

export const getZones = (districtId) =>
  api.get("/admin/zones", { params: districtId ? { districtId } : {} });

export const getZoneById = (id) => api.get(`/admin/zones/${id}`);

export const createZone = (data) => api.post("/admin/zones", data);

export const updateZone = (id, data) => api.put(`/admin/zones/${id}`, data);

export const deleteZone = (id) => api.delete(`/admin/zones/${id}`);
