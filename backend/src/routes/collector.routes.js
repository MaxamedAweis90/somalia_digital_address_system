import { Router } from "express";
import { authorize, protect } from "../middleware/auth.midleware.js";
import {
  getCollectorAssignmentById,
  getCollectorAssignments,
  saveCollectorDraft,
  submitCollectorAssignment,
} from "../controllers/collector-assignment.controller.js";

const CollectorRouter = Router();

CollectorRouter.use(protect);
CollectorRouter.use(authorize("DATA_COLLECTOR"));

CollectorRouter.get("/assignments", getCollectorAssignments);
CollectorRouter.get("/assignments/:id", getCollectorAssignmentById);
CollectorRouter.put("/assignments/:id/draft", saveCollectorDraft);
CollectorRouter.post("/assignments/:id/submit", submitCollectorAssignment);

export default CollectorRouter;
