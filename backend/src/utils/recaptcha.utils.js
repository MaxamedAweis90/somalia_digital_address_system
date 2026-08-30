import axios from "axios";

export function isRecaptchaEnabled() {
  return process.env.NODE_ENV === "production";
}

export async function verifyRecaptcha(recaptchaToken) {
  if (!isRecaptchaEnabled()) {
    return true;
  }

  if (!recaptchaToken) {
    return false;
  }

  if (!process.env.RECAPTCHA_SECRET_KEY) {
    console.error("RECAPTCHA_SECRET_KEY is not configured");
    return false;
  }

  try {
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: recaptchaToken,
        },
      }
    );

    return response.data.success === true;
  } catch (error) {
    console.error("reCAPTCHA verification error:", error.message);
    return false;
  }
}
