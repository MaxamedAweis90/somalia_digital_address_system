import api from "./axios";
import { extractListFromResponse } from "@/utils/apiResponse";

/**
 * Fetch zones with optional pagination and filtering
 * @param {Object} params - Query parameters {page, limit, search, districtId}
 */
export const getZones = (params) => api.get("/admin/zones", { params });

/** Flat zone list for selects; accepts `{ districtId }` or a district id string */
export async function getZoneOptions(params = {}) {
  const normalized =
    typeof params === "string" ? { districtId: params } : params;
  const res = await getZones({ limit: 100, ...normalized });
  return extractListFromResponse(res);
}

export const getZoneById = (id) => api.get(`/admin/zones/${id}`);

export const createZone = (data) => api.post("/admin/zones", data);

export const updateZone = (id, data) => api.put(`/admin/zones/${id}`, data);

export const deleteZone = (id) => api.delete(`/admin/zones/${id}`);
