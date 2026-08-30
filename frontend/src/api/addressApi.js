import api from "./axios";

export const getAddresses = (params) => api.get("/admin/addresses", { params });

export const getAddressById = (id) => api.get(`/admin/addresses/${id}`);

export const previewAddressCode = (zoneId) =>
  api.get("/admin/addresses/preview", { params: { zoneId } });

export const createAddress = (data) => api.post("/admin/addresses", data);

export const updateAddress = (id, data) => api.put(`/admin/addresses/${id}`, data);

export const deleteAddress = (id) => api.delete(`/admin/addresses/${id}`);

export const lookupAddressByCode = (code) =>
  api.get(`/addresses/lookup/${encodeURIComponent(code)}`);
