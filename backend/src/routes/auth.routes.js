import { Router } from "express";
import { getMe, loginUser, logoutUser, registerUser } from "../controllers/auth.controller.js";

const AuthRouter = Router();

AuthRouter.post('/register', registerUser)

AuthRouter.post('/login', loginUser)

AuthRouter.post('/logout', logoutUser)

AuthRouter.get('/me', getMe)

export default AuthRouter;