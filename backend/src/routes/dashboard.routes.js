import { Router } from "express";
import { authorize } from "../middleware/auth.midleware.js";
import { getDashboardSummary } from "../controllers/dashboard.controller.js";

const DashboardRouter = Router();

DashboardRouter.get(
  "/",
  authorize("SYS_ADMIN", "DATA_OFFICER"),
  getDashboardSummary
);

export default DashboardRouter;
