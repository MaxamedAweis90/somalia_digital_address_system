import { ZoneService } from "../service/zone.service.js";
import { getErrorMessage } from "../utils/prisma-error.utils.js";

export const createZone = async (req, res) => {
  try {
    const zone = await ZoneService.createZone(req.body);

    return res.status(201).json({
      success: true,
      message: "Zone created successfully",
      data: zone,
    });
  } catch (error) {
    let status = 400;
    if (error.message.includes("not found")) {
      status = 404;
    } else if (error.message.includes("already exists")) {
      status = 409;
    }
    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const getZones = async (req, res) => {
  try {
    const result = await ZoneService.getZones(req.query);

    return res.status(200).json({
      success: true,
      data: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const getZoneById = async (req, res) => {
  try {
    const zone = await ZoneService.getZoneById(req.params.id);

    return res.status(200).json({
      success: true,
      data: zone,
    });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const updateZone = async (req, res) => {
  try {
    const zone = await ZoneService.updateZone(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: "Zone updated successfully",
      data: zone,
    });
  } catch (error) {
    let status = 400;
    if (error.message.includes("not found")) {
      status = 404;
    } else if (error.message.includes("already exists")) {
      status = 409;
    }
    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const deleteZone = async (req, res) => {
  try {
    const result = await ZoneService.deleteZone(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Zone deleted successfully",
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