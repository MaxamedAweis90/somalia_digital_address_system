import { Router } from "express";
import AuthRouter from "./auth.routes.js";
import AdminRouter from "./admin.routes.js";
import AuditLogRouter from "./auditLog.routes.js";

const CentralRouter = Router();

CentralRouter.use('/auth', AuthRouter);
CentralRouter.use('/admin', AdminRouter);
CentralRouter.use('/audit-logs', AuditLogRouter);

export default CentralRouter;

