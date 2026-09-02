import api from "./axios";
import { extractListFromResponse } from "@/utils/apiResponse";

export const getZoneBlocks = (zoneId) =>
  api.get("/admin/zone-blocks", { params: zoneId ? { zoneId } : {} });

/** Flat zone-block list for selects */
export async function getZoneBlockOptions(zoneId) {
  const res = await getZoneBlocks(zoneId);
  return extractListFromResponse(res);
}

export const getZoneBlockById = (id) => api.get(`/admin/zone-blocks/${id}`);

export const createZoneBlock = (data) => api.post("/admin/zone-blocks", data);

export const updateZoneBlock = (id, data) => api.put(`/admin/zone-blocks/${id}`, data);

export const deleteZoneBlock = (id) => api.delete(`/admin/zone-blocks/${id}`);
