import api from "./axios";

/**
 * Fetch districts with optional pagination and filtering
 * @param {Object} params - Query parameters {page, limit, search, regionId}
 */
export const getDistricts = (params) => api.get("/admin/districts", { params });

export const getDistrictById = (id) => api.get(`/admin/districts/${id}`);

export const createDistrict = (data) => api.post("/admin/districts", data);

export const updateDistrict = (id, data) =>
  api.put(`/admin/districts/${id}`, data);

export const deleteDistrict = (id) => api.delete(`/admin/districts/${id}`);
