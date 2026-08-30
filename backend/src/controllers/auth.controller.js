import { AuthService } from "../service/auth.service.js";
import { clearAuthCookie, sethAuthCookie } from "../utils/cookies.utils.js"

export const registerUser = async (req, res) => {

    try {

        const { name, email, password } = req.body;

        const { user, token } = await AuthService.registerUser({ name, email, password });
        sethAuthCookie(res, token);

        return res.status(201).json({ succes: true, message: "User Created Succefully", user })


    } catch (err) {

        return res.status(400).json({ success: false, message: err.message });


    }

}

export const loginUser = async (req, res) => {
  try {
    console.log("REQ BODY DATA:", req.body);

    const { email, password } = req.body || {};

    const { user, token } = await AuthService.loginUser({ email, password });
    sethAuthCookie(res, token);

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

export const logoutUser = (req, res) => {

    clearAuthCookie(res);

    return res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const getMe = async (req, res) => {
    try {

        const user = await AuthService.getUserProfile(req.user.id);

        return res.status(200).json({ success: true, user });

    } catch (error) {

        return res.status(404).json({ success: false, message: error.message });
    }
};