import { DataOfficerService } from "../service/data-officer.service.js";
import { AuditLogService } from "../service/auditLog.service.js";
import { getErrorMessage, getHttpStatus } from "../utils/prisma-error.utils.js";

function sendError(res, error) {
  return res.status(getHttpStatus(error)).json({
    success: false,
    message: getErrorMessage(error),
  });
}

export const createDataOfficer = async (req, res) => {
  try {
    const dataOfficer = await DataOfficerService.createDataOfficer(req.body);

    // Non-blocking audit log
    await AuditLogService.logSafe({
      userId: req.user.id,
      action: `Created data officer account for ${dataOfficer.name} (${dataOfficer.email})`,
      actionType: "CREATE",
      entityId: dataOfficer.id,
    });

    return res.status(201).json({
      success: true,
      message: "Data officer created successfully",
      data: dataOfficer,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const getDataOfficers = async (req, res) => {
  try {
    const { page, limit, search } = req.query;

    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;

    const result = await DataOfficerService.getDataOfficers({
      page: isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage,
      limit: isNaN(parsedLimit) || parsedLimit < 1 ? 10 : parsedLimit,
      search,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const getDataOfficerById = async (req, res) => {
  try {
    const dataOfficer = await DataOfficerService.getDataOfficerById(
      req.params.id,
    );

    return res.status(200).json({
      success: true,
      data: dataOfficer,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const updateDataOfficer = async (req, res) => {
  try {
    const dataOfficer = await DataOfficerService.updateDataOfficer(
      req.params.id,
      req.body,
    );

    // Non-blocking audit log
    await AuditLogService.logSafe({
      userId: req.user.id,
      action: `Updated data officer account: ${dataOfficer.name} (${dataOfficer.email})`,
      actionType: "UPDATE",
      entityId: dataOfficer.id,
    });

    return res.status(200).json({
      success: true,
      message: "Data officer updated successfully",
      data: dataOfficer,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const deleteDataOfficer = async (req, res) => {
  try {
    const result = await DataOfficerService.deleteDataOfficer(
      req.params.id,
      req.user.id,
    );

    // Non-blocking audit log
    await AuditLogService.logSafe({
      userId: req.user.id,
      action: `Deleted data officer account with ID ${req.params.id}`,
      actionType: "DELETE",
      entityId: req.params.id,
    });

    return res.status(200).json({
      success: true,
      message: "Data officer deleted successfully",
      data: result,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const regenerateDataOfficerPassword = async (req, res) => {
  try {
    const result = await DataOfficerService.regeneratePassword(req.params.id);

    // Non-blocking audit log
    await AuditLogService.logSafe({
      userId: req.user.id,
      action: `Regenerated temporary password for data officer: ${result.officer.name} (${result.officer.email})`,
      actionType: "UPDATE",
      entityId: result.officer.id,
    });

    return res.status(200).json({
      success: true,
      message: "Password regenerated successfully",
      data: {
        officer: result.officer,
        temporaryPassword: result.temporaryPassword,
      },
    });
  } catch (error) {
    return sendError(res, error);
  }
};
