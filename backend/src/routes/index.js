import { Router } from "express";
import AuthRouter from "./auth.routes.js";
import AdminRouter from "./admin.routes.js";

const CentralRouter = Router();

CentralRouter.use('/auth', AuthRouter);
CentralRouter.use('/admin', AdminRouter);

export default CentralRouter;

