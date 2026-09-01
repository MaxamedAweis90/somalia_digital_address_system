import { Router } from "express";
import { protect } from "../middleware/auth.midleware.js";
import RegionRouter from "./region.routes.js";
import DistrictRouter from "./district.routes.js";
import ZoneRouter from "./zone.routes.js";
import ZoneBlockRouter from "./zone-block.routes.js";
import AddressRouter from "./address.routes.js";
import DashboardRouter from "./dashboard.routes.js";
import SettingsRouter from "./settings.routes.js";
import DataOfficerRouter from "./data-officer.routes.js";
import DataCollectorRouter from "./data-collector.routes.js";
import AssignmentRouter from "./assignment.routes.js";
import AuditLogRouter from "./auditLog.routes.js";
import SearchRouter from "./search.routes.js";

const AdminRouter = Router();

AdminRouter.use(protect);

AdminRouter.use("/regions", RegionRouter);
AdminRouter.use("/districts", DistrictRouter);
AdminRouter.use("/zones", ZoneRouter);
AdminRouter.use("/zone-blocks", ZoneBlockRouter);
AdminRouter.use("/addresses", AddressRouter);
AdminRouter.use("/dashboard", DashboardRouter);
AdminRouter.use("/settings", SettingsRouter);
AdminRouter.use("/data-officers", DataOfficerRouter);
AdminRouter.use("/data-collectors", DataCollectorRouter);
AdminRouter.use("/assignments", AssignmentRouter);
AdminRouter.use("/audit-logs", AuditLogRouter);
AdminRouter.use("/search", SearchRouter);

export default AdminRouter;
