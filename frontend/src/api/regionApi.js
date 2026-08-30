import api from "./axios";

export const getRegions = () => api.get("/admin/regions");

export const getRegionById = (id) => api.get(`/admin/regions/${id}`);

export const createRegion = (data) => api.post("/admin/regions", data);

export const updateRegion = (id, data) => api.put(`/admin/regions/${id}`, data);

export const deleteRegion = (id) => api.delete(`/admin/regions/${id}`);
