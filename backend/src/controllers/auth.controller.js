import { AuthService } from "../service/auth.service.js";
import { clearAuthCookie, sethAuthCookie } from "../utils/cookies.utils.js";
import { verifyRecaptcha } from "../utils/recaptcha.utils.js";
import { sendOtpEmail, sendLoginSuccessEmail } from "../utils/email.utils.js";
import { getDeviceInfo } from "../utils/device.utils.js";
import { generateToken } from "../utils/jwt.utils.js";

// -----------------------------------------------------------------------
// POST /auth/register
// -----------------------------------------------------------------------
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    const { user, token } = await AuthService.registerUser({ name, email, password });
    sethAuthCookie(res, token);

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
// POST /auth/login
// -----------------------------------------------------------------------
export const loginUser = async (req, res) => {
  try {
    const { email, password, recaptchaToken } = req.body || {};

    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
      return res.status(400).json({
        success: false,
        message: "reCAPTCHA verification failed or expired. Please try again.",
      });
    }

    const user = await AuthService.validateCredentials({ email, password });
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    sethAuthCookie(res, token);

    const { password: _pw, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: safeUser,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// -----------------------------------------------------------------------
// POST /auth/verify-otp
// Step 2: verify the code, create the real session, and notify the user
// of the new sign-in (with device/browser/IP info) by email.
// -----------------------------------------------------------------------
export const verifyLoginOtp = async (req, res) => {
  try {
    const { email, code } = req.body || {};

    const { user, token } = await AuthService.verifyLoginOtp({ email, code });
    sethAuthCookie(res, token);

    const { browser, os, device, ip } = getDeviceInfo(req);

    // Fire-and-forget: don't block the login response on the notification email.
    sendLoginSuccessEmail(user.email, {
      name: user.name,
      device,
      os,
      browser,
      ip,
      time: new Date().toLocaleString("en-GB", { timeZone: "Africa/Mogadishu" }),
    }).catch((err) => console.error("Failed to send login-success email:", err));

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user,
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
// Rate-limited resend of a fresh OTP for a pending login.
// -----------------------------------------------------------------------
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body || {};
    const result = await AuthService.resendLoginOtp(email);

    if (result.code) {
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
  clearAuthCookie(res);
  return res.status(200).json({ success: true, message: "Logged out successfully" });
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