import api from "./axios";

/**
 * Fetch regions with optional pagination and filtering
 * @param {Object} params - Query parameters {page, limit, search}
 */
export const getRegions = (params) => api.get("/admin/regions", { params });

/** Fetch up to 100 regions for form dropdowns */
export const getRegionOptions = () => getRegions({ page: 1, limit: 100 });

export const getRegionById = (id) => api.get(`/admin/regions/${id}`);

export const createRegion = (data) => api.post("/admin/regions", data);

export const updateRegion = (id, data) => api.put(`/admin/regions/${id}`, data);

export const deleteRegion = (id) => api.delete(`/admin/regions/${id}`);
