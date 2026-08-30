import validator from "validator";

export const sanitizeString = (input) => {
  if (!input || typeof input !== "string") return null;
  
  // Strip HTML tags and escape dangerous characters
  let cleanStr = validator.escape(input.trim());
  return cleanStr;
};

export const sanitizeEmail = (email) => {
  if (!email || typeof email !== "string") return null;
  
  const trimmed = email.trim().toLowerCase();
  return validator.isEmail(trimmed) ? trimmed : null;
};