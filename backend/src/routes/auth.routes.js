import express from "express";
import {
  registerUser,
  loginUser,
  verifyLoginOtp,
  resendOtp,
  logoutUser,
  getMe,
  getAuthConfig,
} from "../controllers/auth.controller.js";
import { protect as requireAuth } from "../middleware/auth.midleware.js";

import {
  otpVerifyLimiter,
  loginLimiter,
  resendLimiter,
} from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

router.get("/config", getAuthConfig);
router.post("/register", registerUser);
router.post("/login", loginLimiter, loginUser);
router.post("/verify-otp", otpVerifyLimiter, verifyLoginOtp);
router.post("/resend-otp", resendLimiter, resendOtp);
router.post("/logout", logoutUser);
router.get("/me", requireAuth, getMe);

export default router;