import api from "./axios";

export const login = (email, password) =>
  api.post("/auth/login", { email, password });

export const logout = () => api.post("/auth/logout");

export const getMe = () => api.get("/auth/me");

export const register = (name, email, password, role) =>
  api.post("/auth/register", { name, email, password, role });
