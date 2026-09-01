import api from "./axios";

export const searchRegistry = (params) => api.get("/admin/search", { params });
