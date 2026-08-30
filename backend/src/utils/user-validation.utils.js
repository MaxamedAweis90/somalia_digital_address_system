const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export function validateName(name, { required = true } = {}) {
  const trimmed = name?.trim();

  if (!trimmed) {
    if (required) {
      throw new Error("Full name is required");
    }
    return undefined;
  }

  if (trimmed.length < 2) {
    throw new Error("Full name must be at least 2 characters");
  }

  if (trimmed.length > 100) {
    throw new Error("Full name must be 100 characters or fewer");
  }

  return trimmed;
}

export function validateEmail(email, { required = true } = {}) {
  const trimmed = email?.trim().toLowerCase();

  if (!trimmed) {
    if (required) {
      throw new Error("Email address is required");
    }
    return undefined;
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    throw new Error("Please enter a valid email address");
  }

  if (trimmed.length > 255) {
    throw new Error("Email address must be 255 characters or fewer");
  }

  return trimmed;
}

export function validatePassword(password, { required = true } = {}) {
  if (!password) {
    if (required) {
      throw new Error("Password is required");
    }
    return undefined;
  }

  if (typeof password !== "string") {
    throw new Error("Password must be a text value");
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
    );
  }

  if (password.length > 128) {
    throw new Error("Password must be 128 characters or fewer");
  }

  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    throw new Error("Password must contain at least one letter and one number");
  }

  return password;
}
