import api from "./axios";

export const getAssignments = () => api.get("/admin/assignments");

export const getMyAssignments = () => api.get("/officer/assignments");

export const getAssignmentById = (id) => api.get(`/admin/assignments/${id}`);

export const createAssignment = (data) => api.post("/admin/assignments", data);

export const delegateChildAssignment = (parentId, data) =>
  api.post(`/officer/assignments/${parentId}/children`, data);

export const saveAssignmentDraft = (id, payload) =>
  api.put(`/collector/assignments/${id}/draft`, { payload });

export const submitAssignment = (id) => api.post(`/collector/assignments/${id}/submit`);

export const approveAssignment = (id) => api.post(`/admin/assignments/${id}/approve`);

export const rejectAssignment = (id, rejectionReason) =>
  api.post(`/admin/assignments/${id}/reject`, { rejectionReason });

export const deleteAssignment = (id) => api.delete(`/admin/assignments/${id}`);
