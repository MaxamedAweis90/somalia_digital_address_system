import api from "./axios";

export const getNeighborhoods = (districtId) =>
  api.get("/admin/neighborhoods", { params: districtId ? { districtId } : undefined });

export const getNeighborhoodById = (id) => api.get(`/admin/neighborhoods/${id}`);

export const createNeighborhood = (data) => api.post("/admin/neighborhoods", data);

export const updateNeighborhood = (id, data) => api.put(`/admin/neighborhoods/${id}`, data);

export const deleteNeighborhood = (id) => api.delete(`/admin/neighborhoods/${id}`);
