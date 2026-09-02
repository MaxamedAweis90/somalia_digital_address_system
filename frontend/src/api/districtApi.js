import api from "./axios";
import { extractListFromResponse } from "@/utils/apiResponse";

/**
 * Fetch districts with optional pagination and filtering
 * @param {Object} params - Query parameters {page, limit, search, regionId}
 */
export const getDistricts = (params) => api.get("/admin/districts", { params });

/** Flat district list for selects and cascading forms */
export async function getDistrictOptions(params = {}) {
  const res = await getDistricts({ limit: 100, ...params });
  return extractListFromResponse(res);
}

/** District detail including official boundary geometry when available */
export async function getDistrictGeometry(id) {
  const res = await getDistrictById(id);
  const district = res.data?.data;
  return {
    name: district?.name || "",
    geometry: district?.geometry || null,
  };
}

export const getDistrictById = (id) => api.get(`/admin/districts/${id}`);

export const createDistrict = (data) => api.post("/admin/districts", data);

export const updateDistrict = (id, data) =>
  api.put(`/admin/districts/${id}`, data);

export const deleteDistrict = (id) => api.delete(`/admin/districts/${id}`);
