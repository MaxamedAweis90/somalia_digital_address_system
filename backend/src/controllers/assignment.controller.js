import { AssignmentService } from "../service/assignment.service.js";
import { getErrorMessage } from "../utils/prisma-error.utils.js";

export const createAssignment = async (req, res) => {
  try {
    const assignment = await AssignmentService.createAssignment(
      req.body,
      req.user.id
    );

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
      req.body,
      req.user.id
    );

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
    const assignments = await AssignmentService.getMyAssignments(req.user.id);

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
    const assignment = await AssignmentService.saveDraft(
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
    const assignment = await AssignmentService.submitAssignment(
      req.params.id,
      req.user.id
    );

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

    return res.status(200).json({
      success: true,
      message: "Assignment approved and zones created",
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
