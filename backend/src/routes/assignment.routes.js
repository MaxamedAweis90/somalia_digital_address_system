import { Router } from "express";
import { authorize } from "../middleware/auth.midleware.js";
import {
  approveAssignment,
  createAssignment,
  createChildAssignment,
  getAssignmentById,
  getAssignments,
  getMyAssignments,
  rejectAssignment,
  saveAssignmentDraft,
  submitAssignment,
} from "../controllers/assignment.controller.js";

const AssignmentRouter = Router();

AssignmentRouter.get(
  "/my",
  authorize("DATA_OFFICER"),
  getMyAssignments
);

AssignmentRouter.get(
  "/",
  authorize("SYS_ADMIN", "DATA_OFFICER"),
  getAssignments
);

AssignmentRouter.post(
  "/",
  authorize("SYS_ADMIN"),
  createAssignment
);

AssignmentRouter.post(
  "/:parentId/children",
  authorize("DATA_OFFICER"),
  createChildAssignment
);

AssignmentRouter.get(
  "/:id",
  authorize("SYS_ADMIN", "DATA_OFFICER"),
  getAssignmentById
);

AssignmentRouter.put(
  "/:id/draft",
  authorize("DATA_OFFICER"),
  saveAssignmentDraft
);

AssignmentRouter.post(
  "/:id/submit",
  authorize("DATA_OFFICER"),
  submitAssignment
);

AssignmentRouter.post(
  "/:id/approve",
  authorize("SYS_ADMIN"),
  approveAssignment
);

AssignmentRouter.post(
  "/:id/reject",
  authorize("SYS_ADMIN"),
  rejectAssignment
);

export default AssignmentRouter;
