import api from "./axios";

export const getDistricts = (regionId) =>
  api.get("/admin/districts", { params: regionId ? { regionId } : undefined });

export const getDistrictById = (id) => api.get(`/admin/districts/${id}`);

export const createDistrict = (data) => api.post("/admin/districts", data);

export const updateDistrict = (id, data) => api.put(`/admin/districts/${id}`, data);

export const deleteDistrict = (id) => api.delete(`/admin/districts/${id}`);
