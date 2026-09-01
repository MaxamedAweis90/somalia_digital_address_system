import api from "./axios";

const LIST_PARAMS = { page: 1, limit: 100 };

/**
 * Fetch districts with optional pagination and filtering
 * @param {Object} params - Query parameters {page, limit, search, regionId}
 */
export const getDistricts = (params) => api.get("/admin/districts", { params });

/** Fetch up to 100 districts for form dropdowns */
export const getDistrictOptions = () => getDistricts(LIST_PARAMS);

export const getDistrictById = (id) => api.get(`/admin/districts/${id}`);

export const createDistrict = (data) => api.post("/admin/districts", data);

export const updateDistrict = (id, data) =>
  api.put(`/admin/districts/${id}`, data);

export const deleteDistrict = (id) => api.delete(`/admin/districts/${id}`);
