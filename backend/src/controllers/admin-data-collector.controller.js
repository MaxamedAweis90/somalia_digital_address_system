import { DataCollectorService } from "../service/data-collector.service.js";
import { AuditLogService } from "../service/auditLog.service.js";
import {
  getErrorMessage,
  getHttpStatus,
} from "../utils/prisma-error.utils.js";

function sendError(res, error) {
  return res.status(getHttpStatus(error)).json({
    success: false,
    message: getErrorMessage(error),
  });
}

export const createDataCollector = async (req, res) => {
  try {
    const collector = await DataCollectorService.createCollectorAdmin(req.body);

    await AuditLogService.logSafe({
      userId: req.user.id,
      action: `Created data collector account for ${collector.name} (${collector.email})`,
      actionType: "CREATE",
      entityId: collector.id,
    });

    return res.status(201).json({
      success: true,
      message: "Data collector created successfully",
      data: collector,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const getDataCollectors = async (req, res) => {
  try {
    const collectors = await DataCollectorService.getAllCollectors();

    return res.status(200).json({
      success: true,
      data: collectors,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const getDataCollectorById = async (req, res) => {
  try {
    const collector = await DataCollectorService.getCollectorByIdAdmin(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      data: collector,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const updateDataCollector = async (req, res) => {
  try {
    const collector = await DataCollectorService.updateCollectorAdmin(
      req.params.id,
      req.body
    );

    await AuditLogService.logSafe({
      userId: req.user.id,
      action: `Updated data collector account: ${collector.name} (${collector.email})`,
      actionType: "UPDATE",
      entityId: collector.id,
    });

    return res.status(200).json({
      success: true,
      message: "Data collector updated successfully",
      data: collector,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const deleteDataCollector = async (req, res) => {
  try {
    const result = await DataCollectorService.deleteCollectorAdmin(
      req.params.id
    );

    await AuditLogService.logSafe({
      userId: req.user.id,
      action: `Deleted data collector account with ID ${req.params.id}`,
      actionType: "DELETE",
      entityId: req.params.id,
    });

    return res.status(200).json({
      success: true,
      message: "Data collector deleted successfully",
      data: result,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const regenerateDataCollectorPassword = async (req, res) => {
  try {
    const result = await DataCollectorService.regeneratePasswordAdmin(
      req.params.id
    );

    await AuditLogService.logSafe({
      userId: req.user.id,
      action: `Regenerated temporary password for data collector: ${result.collector.name} (${result.collector.email})`,
      actionType: "UPDATE",
      entityId: result.collector.id,
    });

    return res.status(200).json({
      success: true,
      message: "Temporary password generated",
      data: result,
    });
  } catch (error) {
    return sendError(res, error);
  }
};
