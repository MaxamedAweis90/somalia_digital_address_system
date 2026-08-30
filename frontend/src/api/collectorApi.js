import api from "./axios";

export const getCollectorAssignments = () => api.get("/collector/assignments");

export const getCollectorAssignmentById = (id) => api.get(`/collector/assignments/${id}`);

export const saveCollectorDraft = (id, payload) =>
  api.put(`/collector/assignments/${id}/draft`, { payload });

export const submitCollectorAssignment = (id) =>
  api.post(`/collector/assignments/${id}/submit`);
