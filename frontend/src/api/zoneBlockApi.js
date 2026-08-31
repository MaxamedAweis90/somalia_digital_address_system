import api from "./axios";

export const getZoneBlocks = (zoneId) =>
  api.get("/admin/zone-blocks", { params: zoneId ? { zoneId } : {} });

export const getZoneBlockById = (id) => api.get(`/admin/zone-blocks/${id}`);

export const createZoneBlock = (data) => api.post("/admin/zone-blocks", data);

export const updateZoneBlock = (id, data) => api.put(`/admin/zone-blocks/${id}`, data);

export const deleteZoneBlock = (id) => api.delete(`/admin/zone-blocks/${id}`);
