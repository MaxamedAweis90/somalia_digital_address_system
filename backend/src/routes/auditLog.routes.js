import { Router } from "express";
import { getAuditLogsController } from "../controllers/auditLog.controller.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.midleware.js";

const AuditLogRouter = Router();

// Secure GET /api/v1/audit-logs
AuditLogRouter.get("/", authenticateToken, requireAdmin, getAuditLogsController);

export default AuditLogRouter;
