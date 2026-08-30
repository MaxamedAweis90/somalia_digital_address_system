import { prisma } from "../db.js";
import { comparePassword, hashPassword } from "../utils/hash.utils.js";
import { generateToken } from "../utils/jwt.utils.js";
import { sanitizeEmail } from "../utils/sanitize.utils.js";
import { generateOtpCode, hashOtp, verifyOtpHash } from "../utils/otp.utils.js";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
};

const OTP_TTL_MS = 10 * 60 * 1000; // code expires 10 minutes after creation
const MAX_ATTEMPTS = 5; // wrong-code attempts allowed before a code is burned
const RESEND_COOLDOWN_MS = 45 * 1000; // minimum gap between resend requests
const RESEND_WINDOW_MS = 10 * 60 * 1000; // rolling window for the resend cap
const MAX_RESENDS_PER_WINDOW = 4; // max resends allowed within that window

export const AuthService = {
  // ---------------------------------------------------------------------
  // Registration
  // ---------------------------------------------------------------------
  registerUser: async ({ name, email, password, role }) => {
    if (!name?.trim()) {
      throw new Error("Name is required");
    }
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedRole = role ? String(role).toUpperCase() : "DATA_OFFICER";

    if (!["SYS_ADMIN", "DATA_OFFICER"].includes(normalizedRole)) {
      throw new Error("Invalid role must be SYS_ADMIN or DATA_OFFICER");
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: normalizedRole,
      },
      select: publicUserSelect,
    });

    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    return { user: newUser, token };
  },

  // ---------------------------------------------------------------------
  // Login — Step 1: credentials only. No session/token issued here.
  // ---------------------------------------------------------------------
  validateCredentials: async ({ email, password }) => {
    const cleanEmail = sanitizeEmail(email);
    const rawPassword = password ? String(password) : null;

    if (!cleanEmail || !rawPassword) {
      throw new Error("A valid email and password are required.");
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user || !(await comparePassword(rawPassword, user.password))) {
      throw new Error("Invalid email or password.");
    }

    return user;
  },

  // ---------------------------------------------------------------------
  // Login — Step 1b: create and store an OTP, return the plaintext code
  // so the controller can email it. Invalidates any earlier pending code.
  // ---------------------------------------------------------------------
  createLoginOtp: async (userId) => {
    const code = generateOtpCode();
    const model = prisma.loginOtp || prisma.loginOtps;

    await model.updateMany({
      where: { userId, consumed: false },
      data: { consumed: true },
    });

    await model.create({
      data: {
        userId,
        codeHash: hashOtp(code),
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    });

    return code;
  },

  // ---------------------------------------------------------------------
  // Login — Step 2: verify the OTP and finalize the session.
  // ---------------------------------------------------------------------
  verifyLoginOtp: async ({ email, code }) => {
    const cleanEmail = sanitizeEmail(email);
    if (!cleanEmail || !code) {
      throw new Error("Email and verification code are required.");
    }

    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) {
      throw new Error("Invalid email or verification code.");
    }

    const model = prisma.loginOtp || prisma.loginOtps;

    const otpRecord = await model.findFirst({
      where: { userId: user.id, consumed: false },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      throw new Error("No pending verification code. Please sign in again.");
    }

    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      await model.update({
        where: { id: otpRecord.id },
        data: { consumed: true },
      });
      throw new Error("Too many incorrect attempts. Please sign in again.");
    }

    if (otpRecord.expiresAt < new Date()) {
      throw new Error("This code has expired. Please sign in again to get a new one.");
    }

    if (!verifyOtpHash(String(code).trim(), otpRecord.codeHash)) {
      await model.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      throw new Error("Incorrect verification code.");
    }

    await model.update({
      where: { id: otpRecord.id },
      data: { consumed: true },
    });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const { password: _pw, ...safeUser } = user;

    return { user: safeUser, token };
  },

  // ---------------------------------------------------------------------
  // Login — Resend: rate-limited re-issue of a fresh OTP.
  // Always resolves (never throws "user not found") to avoid leaking
  // whether an email is registered — except for rate-limit errors.
  // ---------------------------------------------------------------------
  resendLoginOtp: async (email) => {
    const cleanEmail = sanitizeEmail(email);
    if (!cleanEmail) {
      throw new Error("A valid email is required.");
    }

    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) {
      return { code: null, cooldownMs: RESEND_COOLDOWN_MS };
    }

    const model = prisma.loginOtp || prisma.loginOtps;
    const windowStart = new Date(Date.now() - RESEND_WINDOW_MS);
    const recentCodes = await model.findMany({
      where: { userId: user.id, createdAt: { gte: windowStart } },
      orderBy: { createdAt: "desc" },
    });

    if (recentCodes.length > 0) {
      const msSinceLast = Date.now() - recentCodes[0].createdAt.getTime();
      if (msSinceLast < RESEND_COOLDOWN_MS) {
        const waitMs = RESEND_COOLDOWN_MS - msSinceLast;
        const err = new Error(`Please wait ${Math.ceil(waitMs / 1000)}s before requesting another code.`);
        err.cooldownMs = waitMs;
        throw err;
      }
    }

    if (recentCodes.length >= MAX_RESENDS_PER_WINDOW) {
      throw new Error("Too many code requests. Please try signing in again in a few minutes.");
    }

    const code = generateOtpCode();

    await model.updateMany({
      where: { userId: user.id, consumed: false },
      data: { consumed: true },
    });

    await model.create({
      data: {
        userId: user.id,
        codeHash: hashOtp(code),
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    });

    return { code, cooldownMs: RESEND_COOLDOWN_MS, name: user.name, email: user.email };
  },

  // ---------------------------------------------------------------------
  // Profile
  // ---------------------------------------------------------------------
  getUserProfile: async (userId) => {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const cleanedId = String(userId).trim();
    if (!cleanedId) {
      throw new Error("User ID must be a valid string");
    }

    const user = await prisma.user.findUnique({
      where: { id: cleanedId },
      select: publicUserSelect,
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },
};