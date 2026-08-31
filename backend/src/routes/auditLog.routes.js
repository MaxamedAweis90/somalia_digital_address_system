import { Router } from "express";
import {
  getAuditLogsController,
  getActivitySummaryController,
} from "../controllers/auditLog.controller.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.midleware.js";

const AuditLogRouter = Router();

// Secure GET /api/v1/audit-logs/activity-summary (Daily counts for calendar heatmap)
AuditLogRouter.get("/activity-summary", authenticateToken, requireAdmin, getActivitySummaryController);

// Secure GET /api/v1/audit-logs (Paginated audit logs with search, action, and date filters)
AuditLogRouter.get("/", authenticateToken, requireAdmin, getAuditLogsController);

export default AuditLogRouter;
