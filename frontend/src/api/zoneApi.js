import api from "./axios";

export const getZones = (neighborhoodId) =>
  api.get("/admin/zones", {
    params: neighborhoodId ? { neighborhoodId } : undefined,
  });

export const getZoneByIdApi = (id) => api.get(`/admin/zones/${id}`);

export const createZone = (data) => api.post("/admin/zones", data);

export const updateZone = (id, data) => api.put(`/admin/zones/${id}`, data);

export const deleteZone = (id) => api.delete(`/admin/zones/${id}`);
