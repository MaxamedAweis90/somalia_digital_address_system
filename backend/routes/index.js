import { Router } from "express";
import AuthRouter from "./auth.routes.js";

const CentralRouter = Router();

CentralRouter.use('/auth', AuthRouter);

export default CentralRouter;

