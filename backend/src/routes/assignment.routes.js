import { Router } from "express";
import { authorize } from "../middleware/auth.midleware.js";
import {
  approveAssignment,
  createAssignment,
  getAssignmentById,
  getAssignments,
  rejectAssignment,
} from "../controllers/assignment.controller.js";

const AssignmentRouter = Router();

AssignmentRouter.get("/", authorize("SYS_ADMIN"), getAssignments);

AssignmentRouter.post("/", authorize("SYS_ADMIN"), createAssignment);

AssignmentRouter.get(
  "/:id",
  authorize("SYS_ADMIN", "DATA_OFFICER"),
  getAssignmentById
);

AssignmentRouter.post("/:id/approve", authorize("SYS_ADMIN"), approveAssignment);

AssignmentRouter.post("/:id/reject", authorize("SYS_ADMIN"), rejectAssignment);

export default AssignmentRouter;
