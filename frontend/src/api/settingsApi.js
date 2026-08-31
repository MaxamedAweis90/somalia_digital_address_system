import api from "./axios";

export const getSettings = () => api.get("/admin/settings");

export const getSettingByKey = (key) => api.get(`/admin/settings/key/${key}`);

export const createSetting = (data) => api.post("/admin/settings", data);

export const updateSetting = (id, data) => api.put(`/admin/settings/${id}`, data);

export const deleteSetting = (id) => api.delete(`/admin/settings/${id}`);
