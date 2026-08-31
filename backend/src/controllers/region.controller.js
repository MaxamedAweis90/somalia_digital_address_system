import { RegionService } from "../service/region.service.js";
import { AuditLogService } from "../service/auditLog.service.js";
import { getErrorMessage } from "../utils/prisma-error.utils.js";

export const createRegion = async (req, res) => {
  try {
    const region = await RegionService.createRegion(req.body);

    await AuditLogService.logSafe({
      userId: req.user?.id,
      action: `Created Region: ${region.name} (${region.code})`,
      actionType: "CREATE",
      entityId: region.id,
    });

    return res.status(201).json({
      success: true,
      message: "Region created successfully",
      data: region,
    });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const getRegions = async (req, res) => {
  try {
    const regions = await RegionService.getRegions();

    return res.status(200).json({
      success: true,
      data: regions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const getRegionById = async (req, res) => {
  try {
    const region = await RegionService.getRegionById(req.params.id);

    return res.status(200).json({
      success: true,
      data: region,
    });
  } catch (error) {
    const status = error.message === "Region not found" ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const updateRegion = async (req, res) => {
  try {
    const region = await RegionService.updateRegion(req.params.id, req.body);

    await AuditLogService.logSafe({
      userId: req.user?.id,
      action: `Updated Region: ${region.name} (${region.code})`,
      actionType: "UPDATE",
      entityId: region.id,
    });

    return res.status(200).json({
      success: true,
      message: "Region updated successfully",
      data: region,
    });
  } catch (error) {
    const status = error.message === "Region not found" ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const deleteRegion = async (req, res) => {
  try {
    const result = await RegionService.deleteRegion(req.params.id);

    await AuditLogService.logSafe({
      userId: req.user?.id,
      action: `Deleted Region: ${result.name || req.params.id}`,
      actionType: "DELETE",
      entityId: req.params.id,
    });

    return res.status(200).json({
      success: true,
      message: "Region deleted successfully",
      data: result,
    });
  } catch (error) {
    const status = error.message === "Region not found" ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};
