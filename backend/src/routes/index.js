import { Router } from "express";
import AuthRouter from "./auth.routes.js";
import AdminRouter from "./admin.routes.js";
import AuditLogRouter from "./auditLog.routes.js";
import PublicAddressRouter from "./public-address.routes.js";

const CentralRouter = Router();

CentralRouter.use('/auth', AuthRouter);
CentralRouter.use('/admin', AdminRouter);
CentralRouter.use('/audit-logs', AuditLogRouter);
CentralRouter.use('/addresses', PublicAddressRouter);

export default CentralRouter;

