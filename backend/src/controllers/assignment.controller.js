import { AssignmentService } from "../service/assignment.service.js";
import { AuditLogService } from "../service/auditLog.service.js";
import { getErrorMessage } from "../utils/prisma-error.utils.js";

export const createAssignment = async (req, res) => {
  try {
    const assignment = await AssignmentService.createAssignment(
      req.body,
      req.user.id
    );

    await AuditLogService.logSafe({
      userId: req.user.id,
      action: `Created Parent Assignment (${assignment.type}) for officer ${assignment.assignedTo?.name || assignment.assignedToId}`,
      actionType: "CREATE",
      entityId: assignment.id,
    });

    return res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      data: assignment,
    });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const createChildAssignment = async (req, res) => {
  try {
    const parentId = req.params.parentId;
    const child = await AssignmentService.createChildAssignment(
      parentId,
      req.user.id,
      req.body
    );

    await AuditLogService.logSafe({
      userId: req.user.id,
      action: `Delegated Child Assignment (${child.type}) under parent ${parentId} to collector ${child.assignedTo?.name || child.assignedToId}`,
      actionType: "CREATE",
      entityId: child.id,
    });

    return res.status(201).json({
      success: true,
      message: "Child assignment created successfully",
      data: child,
    });
  } catch (error) {
    const status = error.message.includes("not found")
      ? 404
      : error.message.includes("permission") || error.message.includes("access")
      ? 403
      : 400;

    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const getAssignments = async (req, res) => {
  try {
    const assignments = await AssignmentService.getAssignments();

    return res.status(200).json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const getMyAssignments = async (req, res) => {
  try {
    const assignments = await AssignmentService.getOfficerParentAssignments(req.user.id);

    return res.status(200).json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const getAssignmentById = async (req, res) => {
  try {
    const assignment = await AssignmentService.getAssignmentById(
      req.params.id,
      req.user
    );

    return res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    const status = error.message.includes("not found")
      ? 404
      : error.message.includes("access")
        ? 403
        : 400;

    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const saveAssignmentDraft = async (req, res) => {
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
    const status = error.message.includes("not found")
      ? 404
      : error.message.includes("access")
        ? 403
        : 400;

    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const submitAssignment = async (req, res) => {
  try {
    const assignment = await AssignmentService.submitChildAssignment(
      req.params.id,
      req.user.id
    );

    await AuditLogService.logSafe({
      userId: req.user.id,
      action: `Submitted Assignment ${assignment.id} for review`,
      actionType: "UPDATE",
      entityId: assignment.id,
    });

    return res.status(200).json({
      success: true,
      message: "Assignment submitted for approval",
      data: assignment,
    });
  } catch (error) {
    const status = error.message.includes("not found")
      ? 404
      : error.message.includes("access")
        ? 403
        : 400;

    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const approveAssignment = async (req, res) => {
  try {
    const result = await AssignmentService.approveAssignment(
      req.params.id,
      req.user.id
    );

    const message =
      result.createdAddresses?.length
        ? "Assignment approved and addresses registered"
        : "Assignment approved and zones created";

    await AuditLogService.logSafe({
      userId: req.user.id,
      action: `Super Admin approved Assignment ${req.params.id} (${message})`,
      actionType: "UPDATE",
      entityId: req.params.id,
    });

    return res.status(200).json({
      success: true,
      message,
      data: result,
    });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const rejectAssignment = async (req, res) => {
  try {
    const assignment = await AssignmentService.rejectAssignment(
      req.params.id,
      req.user.id,
      req.body.rejectionReason
    );

    await AuditLogService.logSafe({
      userId: req.user.id,
      action: `Super Admin rejected Assignment ${req.params.id}: ${req.body.rejectionReason || "No reason given"}`,
      actionType: "UPDATE",
      entityId: req.params.id,
    });

    return res.status(200).json({
      success: true,
      message: "Assignment rejected",
      data: assignment,
    });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const result = await AssignmentService.deleteAssignment(req.params.id);

    await AuditLogService.logSafe({
      userId: req.user.id,
      action: `Super Admin revoked Assignment ${req.params.id} and ${result.childCount} collector task(s)`,
      actionType: "DELETE",
      entityId: req.params.id,
    });

    return res.status(200).json({
      success: true,
      message: "Assignment revoked successfully",
      data: result,
    });
  } catch (error) {
    const status = error.message.includes("not found")
      ? 404
      : error.message.includes("cannot be revoked")
        ? 400
        : 400;
    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};
