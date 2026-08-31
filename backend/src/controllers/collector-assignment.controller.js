import { AssignmentService } from "../service/assignment.service.js";
import { AuditLogService } from "../service/auditLog.service.js";
import { getErrorMessage } from "../utils/prisma-error.utils.js";

function accessStatus(error) {
  if (error.message.includes("not found")) return 404;
  if (error.message.includes("access")) return 403;
  return 400;
}

export const getCollectorAssignments = async (req, res) => {
  try {
    const assignments = await AssignmentService.getCollectorAssignments(req.user.id);
    return res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    return res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
};

export const getCollectorAssignmentById = async (req, res) => {
  try {
    const assignment = await AssignmentService.getAssignmentById(req.params.id, req.user);
    return res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    return res.status(accessStatus(error)).json({ success: false, message: getErrorMessage(error) });
  }
};

export const saveCollectorDraft = async (req, res) => {
  try {
    const assignment = await AssignmentService.saveCollectorDraft(
      req.params.id,
      req.body.payload,
      req.user.id
    );
    return res.status(200).json({
      success: true,
      message: "Draft saved successfully",
      data: assignment,
    });
  } catch (error) {
    return res.status(accessStatus(error)).json({ success: false, message: getErrorMessage(error) });
  }
};

export const submitCollectorAssignment = async (req, res) => {
  try {
    const assignment = await AssignmentService.submitChildAssignment(req.params.id, req.user.id);

    await AuditLogService.logSafe({
      userId: req.user.id,
      action: `Collector submitted child assignment ${req.params.id} to officer for review`,
      actionType: "UPDATE",
      entityId: req.params.id,
    });

    return res.status(200).json({
      success: true,
      message: "Assignment submitted to your data officer",
      data: assignment,
    });
  } catch (error) {
    return res.status(accessStatus(error)).json({ success: false, message: getErrorMessage(error) });
  }
};
