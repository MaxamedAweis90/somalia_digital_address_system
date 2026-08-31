import { ZoneBlockService } from "../service/zone-block.service.js";
import { AuditLogService } from "../service/auditLog.service.js";
import { getErrorMessage } from "../utils/prisma-error.utils.js";

export const createZoneBlock = async (req, res) => {
  try {
    const zoneBlock = await ZoneBlockService.createZoneBlock(req.body);

    await AuditLogService.logSafe({
      userId: req.user?.id,
      action: `Created Zone Block: ${zoneBlock.name} (${zoneBlock.code})`,
      actionType: "CREATE",
      entityId: zoneBlock.id,
    });

    return res.status(201).json({
      success: true,
      message: "Zone block created successfully",
      data: zoneBlock,
    });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const getZoneBlocks = async (req, res) => {
  try {
    const zoneBlocks = await ZoneBlockService.getZoneBlocks(req.query.zoneId);

    return res.status(200).json({
      success: true,
      data: zoneBlocks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const getZoneBlockById = async (req, res) => {
  try {
    const zoneBlock = await ZoneBlockService.getZoneBlockById(req.params.id);

    return res.status(200).json({
      success: true,
      data: zoneBlock,
    });
  } catch (error) {
    const status = error.message === "Zone block not found" ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const updateZoneBlock = async (req, res) => {
  try {
    const zoneBlock = await ZoneBlockService.updateZoneBlock(req.params.id, req.body);

    await AuditLogService.logSafe({
      userId: req.user?.id,
      action: `Updated Zone Block: ${zoneBlock.name} (${zoneBlock.code})`,
      actionType: "UPDATE",
      entityId: zoneBlock.id,
    });

    return res.status(200).json({
      success: true,
      message: "Zone block updated successfully",
      data: zoneBlock,
    });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const deleteZoneBlock = async (req, res) => {
  try {
    const result = await ZoneBlockService.deleteZoneBlock(req.params.id);

    await AuditLogService.logSafe({
      userId: req.user?.id,
      action: `Deleted Zone Block: ${result.name || req.params.id}`,
      actionType: "DELETE",
      entityId: req.params.id,
    });

    return res.status(200).json({
      success: true,
      message: "Zone block deleted successfully",
      data: result,
    });
  } catch (error) {
    const status = error.message === "Zone block not found" ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};
