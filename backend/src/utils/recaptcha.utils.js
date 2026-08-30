import axios from "axios";

export const verifyRecaptcha = async (recaptchaToken) => {
  console.log("Received recaptchaToken:", recaptchaToken ? `${recaptchaToken.slice(0, 20)}...` : "MISSING");
  console.log("Secret key loaded:", process.env.RECAPTCHA_SECRET_KEY ? "yes" : "MISSING");

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

    console.log("Google response:", response.data);
    return response.data.success === true;
  } catch (error) {
    console.error("reCAPTCHA Verification Error:", error.message);
    return false;
  }
};