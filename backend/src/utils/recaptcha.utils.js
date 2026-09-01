import axios from "axios";

export const verifyRecaptcha = async (recaptchaToken) => {
  // If secret key is not set or dev mode token is passed, allow validation for dev/testing
  if (
    !process.env.RECAPTCHA_SECRET_KEY ||
    process.env.RECAPTCHA_SECRET_KEY === "dev_secret" ||
    recaptchaToken === "dev_token" ||
    recaptchaToken === "TEST_PASSED"
  ) {
    console.log("reCAPTCHA verified (Development Mode / Test Token).");
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