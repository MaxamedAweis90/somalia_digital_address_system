import api from "./axios";

export const getDataOfficers = () => api.get("/admin/data-officers");

export const getDataOfficerById = (id) => api.get(`/admin/data-officers/${id}`);

export const createDataOfficer = (data) => api.post("/admin/data-officers", data);

export const updateDataOfficer = (id, data) =>
  api.put(`/admin/data-officers/${id}`, data);

export const deleteDataOfficer = (id) => api.delete(`/admin/data-officers/${id}`);

export const regenerateDataOfficerPassword = (id) =>
  api.post(`/admin/data-officers/${id}/regenerate-password`);
