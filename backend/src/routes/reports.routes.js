import { Router } from "express";
import { protect, authorize } from "../middleware/auth.midleware.js";
import {
  getExecutiveSummary,
  getCollectionProgress,
  getDistrictPerformance,
  getCollectorPerformance,
  getAssignmentLifecycle,
  getSpatialValidationReport,
  getAddressStatistics,
  getDataQualityReport,
  getTrendAnalytics,
  exportReportData,
} from "../controllers/reports.controller.js";

const ReportsRouter = Router();

// Protect and restrict to SYS_ADMIN
ReportsRouter.use(protect);
ReportsRouter.use(authorize("SYS_ADMIN"));

ReportsRouter.get("/summary", getExecutiveSummary);
ReportsRouter.get("/collection-progress", getCollectionProgress);
ReportsRouter.get("/districts", getDistrictPerformance);
ReportsRouter.get("/collectors", getCollectorPerformance);
ReportsRouter.get("/assignments", getAssignmentLifecycle);
ReportsRouter.get("/spatial", getSpatialValidationReport);
ReportsRouter.get("/addresses", getAddressStatistics);
ReportsRouter.get("/data-quality", getDataQualityReport);
ReportsRouter.get("/trends", getTrendAnalytics);
ReportsRouter.get("/export/:format", exportReportData);

export default ReportsRouter;
