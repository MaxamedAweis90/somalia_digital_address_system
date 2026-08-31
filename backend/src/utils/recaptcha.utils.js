import axios from "axios";

export const verifyRecaptcha = async (recaptchaToken) => {
  if (!process.env.RECAPTCHA_SECRET_KEY) {
    console.log("reCAPTCHA bypassed: RECAPTCHA_SECRET_KEY is not set.");
    return true;
  }

  if (!recaptchaToken) return false;

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
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
    console.error("reCAPTCHA Verification Error:", error.message);
    return false;
  }
};