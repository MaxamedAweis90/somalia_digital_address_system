import { DistrictService } from "../service/district.service.js";
import { AuditLogService } from "../service/auditLog.service.js";
import { getErrorMessage } from "../utils/prisma-error.utils.js";

export const createDistrict = async (req, res) => {
  try {
    const district = await DistrictService.createDistrict(req.body);

    await AuditLogService.logSafe({
      userId: req.user?.id,
      action: `Created District: ${district.name} (${district.code})`,
      actionType: "CREATE",
      entityId: district.id,
    });

    return res.status(201).json({
      success: true,
      message: "District created successfully",
      data: district,
    });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const getDistricts = async (req, res) => {
  try {
    const { page, limit, search, regionId } = req.query;

    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;

    const result = await DistrictService.getDistricts({
      regionId,
      page: isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage,
      limit: isNaN(parsedLimit) || parsedLimit < 1 ? 10 : parsedLimit,
      search,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const getDistrictById = async (req, res) => {
  try {
    const district = await DistrictService.getDistrictById(req.params.id);

    return res.status(200).json({
      success: true,
      data: district,
    });
  } catch (error) {
    const status = error.message === "District not found" ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const updateDistrict = async (req, res) => {
  try {
    const district = await DistrictService.updateDistrict(
      req.params.id,
      req.body,
    );

    await AuditLogService.logSafe({
      userId: req.user?.id,
      action: `Updated District: ${district.name} (${district.code})`,
      actionType: "UPDATE",
      entityId: district.id,
    });

    return res.status(200).json({
      success: true,
      message: "District updated successfully",
      data: district,
    });
  } catch (error) {
    const status = error.message === "District not found" ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const deleteDistrict = async (req, res) => {
  try {
    const result = await DistrictService.deleteDistrict(req.params.id);

    await AuditLogService.logSafe({
      userId: req.user?.id,
      action: `Deleted District: ${result.name || req.params.id}`,
      actionType: "DELETE",
      entityId: req.params.id,
    });

    return res.status(200).json({
      success: true,
      message: "District deleted successfully",
      data: result,
    });
  } catch (error) {
    const status = error.message === "District not found" ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};
