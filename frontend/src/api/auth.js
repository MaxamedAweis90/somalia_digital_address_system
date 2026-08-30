import api from "./axios";

export const getAuthConfig = () => api.get("/auth/config");

export const login = (email, password, recaptchaToken) =>
  api.post("/auth/login", { email, password, recaptchaToken });

export const verifyOtp = (email, code) => api.post("/auth/verify-otp", { email, code });

export const resendOtp = (email) => api.post("/auth/resend-otp", { email });

export const logout = () => api.post("/auth/logout");

export const getMe = () => api.get("/auth/me");

export const register = (name, email, password, role) =>
  api.post("/auth/register", { name, email, password, role });
