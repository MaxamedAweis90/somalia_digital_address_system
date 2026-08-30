import api from "./axios";

export const getDashboardSummary = () => api.get("/admin/dashboard");
