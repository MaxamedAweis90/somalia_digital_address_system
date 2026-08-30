import crypto from "crypto";

export const generateOtpCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export const hashOtp = (code) => {
  return crypto.createHash("sha256").update(code).digest("hex");
};

export const verifyOtpHash = (code, hash) => {
  return hashOtp(code) === hash;
};