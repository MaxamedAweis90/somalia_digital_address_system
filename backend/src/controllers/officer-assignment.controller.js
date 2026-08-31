import { AssignmentService } from "../service/assignment.service.js";
import { getErrorMessage } from "../utils/prisma-error.utils.js";

function accessStatus(error) {
  if (error.message.includes("not found")) return 404;
  if (error.message.includes("access")) return 403;
  return 400;
}

export const getOfficerAssignments = async (req, res) => {
  try {
    const assignments = await AssignmentService.getOfficerParentAssignments(req.user.id);
    return res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    return res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
};

export const getReviewQueue = async (req, res) => {
  try {
    const assignments = await AssignmentService.getOfficerReviewQueue(req.user.id);
    return res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    return res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
};

export const getParentChildren = async (req, res) => {
  try {
    const children = await AssignmentService.getParentChildren(req.params.parentId, req.user.id);
    return res.status(200).json({ success: true, data: children });
  } catch (error) {
    return res.status(accessStatus(error)).json({ success: false, message: getErrorMessage(error) });
  }
};

export const createChildAssignment = async (req, res) => {
  try {
    const child = await AssignmentService.createChildAssignment(
      req.params.parentId,
      req.user.id,
      req.body
    );
    return res.status(201).json({
      success: true,
      message: "Child assignment created successfully",
      data: child,
    });
  } catch (error) {
    return res.status(accessStatus(error)).json({ success: false, message: getErrorMessage(error) });
  }
};

export const deleteChildAssignment = async (req, res) => {
  try {
    const result = await AssignmentService.deleteChildAssignment(req.params.childId, req.user.id);
    return res.status(200).json({
      success: true,
      message: "Child assignment deleted",
      data: result,
    });
  } catch (error) {
    return res.status(accessStatus(error)).json({ success: false, message: getErrorMessage(error) });
  }
};

export const approveChildAssignment = async (req, res) => {
  try {
    const assignment = await AssignmentService.approveChildAssignment(
      req.params.childId,
      req.user.id
    );
    return res.status(200).json({
      success: true,
      message: "Child assignment approved",
      data: assignment,
    });
  } catch (error) {
    return res.status(accessStatus(error)).json({ success: false, message: getErrorMessage(error) });
  }
};

export const rejectChildAssignment = async (req, res) => {
  try {
    const assignment = await AssignmentService.rejectChildAssignment(
      req.params.childId,
      req.user.id,
      req.body.rejectionReason
    );
    return res.status(200).json({
      success: true,
      message: "Child assignment rejected",
      data: assignment,
    });
  } catch (error) {
    return res.status(accessStatus(error)).json({ success: false, message: getErrorMessage(error) });
  }
};

export const mergeParentAssignment = async (req, res) => {
  try {
    const assignment = await AssignmentService.mergeParentAssignment(
      req.params.parentId,
      req.user.id
    );
    return res.status(200).json({
      success: true,
      message: "Child work merged into parent assignment",
      data: assignment,
    });
  } catch (error) {
    return res.status(accessStatus(error)).json({ success: false, message: getErrorMessage(error) });
  }
};

export const submitParentToAdmin = async (req, res) => {
  try {
    const assignment = await AssignmentService.submitParentToAdmin(
      req.params.parentId,
      req.user.id
    );
    return res.status(200).json({
      success: true,
      message: "Assignment submitted to admin for approval",
      data: assignment,
    });
  } catch (error) {
    return res.status(accessStatus(error)).json({ success: false, message: getErrorMessage(error) });
  }
};

export const getOfficerAssignmentById = async (req, res) => {
  try {
    const assignment = await AssignmentService.getAssignmentById(req.params.id, req.user);
    return res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    return res.status(accessStatus(error)).json({ success: false, message: getErrorMessage(error) });
  }
};
