import { Router } from "express";
import { authorize, protect } from "../middleware/auth.midleware.js";
import {
  approveChildAssignment,
  createChildAssignment,
  deleteChildAssignment,
  getOfficerAssignmentById,
  getOfficerAssignments,
  getParentChildren,
  getReviewQueue,
  mergeParentAssignment,
  rejectChildAssignment,
  submitParentToAdmin,
} from "../controllers/officer-assignment.controller.js";
import {
  createCollector,
  getCollectorById,
  getCollectors,
  regenerateCollectorPassword,
  updateCollector,
} from "../controllers/data-collector.controller.js";

const OfficerRouter = Router();

OfficerRouter.use(protect);
OfficerRouter.use(authorize("DATA_OFFICER"));

OfficerRouter.get("/assignments", getOfficerAssignments);
OfficerRouter.get("/assignments/reviews", getReviewQueue);
OfficerRouter.get("/assignments/:parentId/children", getParentChildren);
OfficerRouter.post("/assignments/:parentId/children", createChildAssignment);
OfficerRouter.post("/assignments/:parentId/merge", mergeParentAssignment);
OfficerRouter.post("/assignments/:parentId/submit", submitParentToAdmin);
OfficerRouter.get("/assignments/:id", getOfficerAssignmentById);
OfficerRouter.delete("/assignments/children/:childId", deleteChildAssignment);
OfficerRouter.post("/assignments/children/:childId/approve", approveChildAssignment);
OfficerRouter.post("/assignments/children/:childId/reject", rejectChildAssignment);

OfficerRouter.get("/collectors", getCollectors);
OfficerRouter.post("/collectors", createCollector);
OfficerRouter.get("/collectors/:id", getCollectorById);
OfficerRouter.put("/collectors/:id", updateCollector);
OfficerRouter.post("/collectors/:id/regenerate-password", regenerateCollectorPassword);

export default OfficerRouter;
