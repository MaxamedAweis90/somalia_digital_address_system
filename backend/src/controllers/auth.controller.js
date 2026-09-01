import { AuthService } from "../service/auth.service.js";
import { AuditLogService } from "../service/auditLog.service.js";
import { clearAuthCookie, sethAuthCookie } from "../utils/cookies.utils.js";
import { verifyRecaptcha } from "../utils/recaptcha.utils.js";
import { sendOtpEmail, sendLoginSuccessEmail } from "../utils/email.utils.js";
import { generateToken, verifyToken } from "../utils/jwt.utils.js";
import { getDeviceInfo } from "../utils/device.utils.js";

// -----------------------------------------------------------------------
// POST /auth/register
// -----------------------------------------------------------------------
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    const { user, token } = await AuthService.registerUser({
      name,
      email,
      password,
    });
    sethAuthCookie(res, token);

    await AuditLogService.logSafe({
      userId: user.id,
      action: `New user registration: ${user.name} (${user.email}) with role ${user.role}`,
      actionType: "CREATE",
      entityId: user.id,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// -----------------------------------------------------------------------
// POST /auth/login (Step 1: Validate credentials + reCAPTCHA -> Send OTP)
// -----------------------------------------------------------------------
export const loginUser = async (req, res) => {
  try {
    const { email, password, recaptchaToken } = req.body || {};

    // 1. Verify reCAPTCHA
    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
      return res.status(400).json({
        success: false,
        message: "reCAPTCHA verification failed or expired. Please try again.",
      });
    }

    // 2. Validate email & password credentials
    const user = await AuthService.validateCredentials({ email, password });

    // 3. Create 6-digit OTP code and save in DB
    const otpCode = await AuthService.createLoginOtp(user.id);

    // 4. Send OTP email (and log to console for dev mode access)
    await sendOtpEmail(user.email, otpCode, { name: user.name });

    await AuditLogService.logSafe({
      userId: user.id,
      action: `User initiated login and requested OTP code (${user.email})`,
      actionType: "UPDATE",
      entityId: user.id,
    });

    return res.status(200).json({
      success: true,
      requireOtp: true,
      email: user.email,
      message: "Verification code sent to your email.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// -----------------------------------------------------------------------
// POST /auth/verify-otp (Step 2: Verify OTP code -> Issue session)
// -----------------------------------------------------------------------
export const verifyLoginOtp = async (req, res) => {
  try {
    const { email, code } = req.body || {};

    const { user, token } = await AuthService.verifyLoginOtp({ email, code });
    sethAuthCookie(res, token);

    const deviceInfo = getDeviceInfo(req);
    await sendLoginSuccessEmail(user.email, {
      name: user.name,
      ...deviceInfo,
      time: new Date().toLocaleString(),
    });

    await AuditLogService.logSafe({
      userId: user.id,
      action: `User verified OTP and logged in (${user.email}) with role ${user.role}`,
      actionType: "UPDATE",
      entityId: user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user,
      token,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// -----------------------------------------------------------------------
// POST /auth/resend-otp
// -----------------------------------------------------------------------
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body || {};
    const result = await AuthService.resendLoginOtp(email);

    if (result.code && result.email) {
      await sendOtpEmail(result.email, result.code, { name: result.name });
    }

    return res.status(200).json({
      success: true,
      message: "If an account exists for this email, a new code has been sent.",
      cooldownMs: result.cooldownMs,
    });
  } catch (error) {
    return res.status(error.cooldownMs ? 429 : 400).json({
      success: false,
      message: error.message,
      cooldownMs: error.cooldownMs || null,
    });
  }
};

// -----------------------------------------------------------------------
// POST /auth/logout
// -----------------------------------------------------------------------
export const logoutUser = (req, res) => {
  const token = req.cookies?.token || req.headers?.authorization?.replace("Bearer ", "");
  if (token) {
    try {
      const decoded = verifyToken(token);
      if (decoded?.id) {
        AuditLogService.logSafe({
          userId: decoded.id,
          action: `User logged out (${decoded.email || decoded.id})`,
          actionType: "UPDATE",
          entityId: decoded.id,
        });
      }
    } catch (_) {}
  }
  clearAuthCookie(res);
  return res
    .status(200)
    .json({ success: true, message: "Logged out successfully" });
};

// -----------------------------------------------------------------------
// GET /auth/me
// -----------------------------------------------------------------------
export const getMe = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const user = await AuthService.getUserProfile(req.user.id);

    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};
