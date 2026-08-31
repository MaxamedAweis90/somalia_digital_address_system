import api from "./axios";

export const getOfficerAssignments = () => api.get("/officer/assignments");

export const getOfficerAssignmentById = (id) => api.get(`/officer/assignments/${id}`);

export const getReviewQueue = () => api.get("/officer/assignments/reviews");

export const getCollectorReviewQueue = () =>
  api.get("/officer/assignments/collector-reviews");

export const getParentChildren = (parentId) =>
  api.get(`/officer/assignments/${parentId}/children`);

export const createChildAssignment = (parentId, data) =>
  api.post(`/officer/assignments/${parentId}/children`, data);

export const deleteChildAssignment = (childId) =>
  api.delete(`/officer/assignments/children/${childId}`);

export const approveChildAssignment = (childId) =>
  api.post(`/officer/assignments/children/${childId}/approve`);

export const rejectChildAssignment = (childId, rejectionReason) =>
  api.post(`/officer/assignments/children/${childId}/reject`, { rejectionReason });

export const mergeParentAssignment = (parentId) =>
  api.post(`/officer/assignments/${parentId}/merge`);

export const submitParentToAdmin = (parentId) =>
  api.post(`/officer/assignments/${parentId}/submit`);

export const getCollectors = () => api.get("/officer/collectors");

export const createCollector = (data) => api.post("/officer/collectors", data);

export const updateCollector = (id, data) => api.put(`/officer/collectors/${id}`, data);

export const regenerateCollectorPassword = (id) =>
  api.post(`/officer/collectors/${id}/regenerate-password`);
