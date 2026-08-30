import { DataCollectorService } from "../service/data-collector.service.js";
import { getErrorMessage } from "../utils/prisma-error.utils.js";

export const createCollector = async (req, res) => {
  try {
    const collector = await DataCollectorService.createCollector(req.user.id, req.body);
    return res.status(201).json({
      success: true,
      message: "Data collector created successfully",
      data: collector,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: getErrorMessage(error) });
  }
};

export const getCollectors = async (req, res) => {
  try {
    const collectors = await DataCollectorService.getCollectorsForOfficer(req.user.id);
    return res.status(200).json({ success: true, data: collectors });
  } catch (error) {
    return res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
};

export const getCollectorById = async (req, res) => {
  try {
    const collector = await DataCollectorService.getCollectorById(req.params.id, req.user.id);
    return res.status(200).json({ success: true, data: collector });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 403;
    return res.status(status).json({ success: false, message: getErrorMessage(error) });
  }
};

export const updateCollector = async (req, res) => {
  try {
    const collector = await DataCollectorService.updateCollector(
      req.params.id,
      req.user.id,
      req.body
    );
    return res.status(200).json({
      success: true,
      message: "Data collector updated successfully",
      data: collector,
    });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 400;
    return res.status(status).json({ success: false, message: getErrorMessage(error) });
  }
};

export const regenerateCollectorPassword = async (req, res) => {
  try {
    const result = await DataCollectorService.regeneratePassword(req.params.id, req.user.id);
    return res.status(200).json({
      success: true,
      message: "Temporary password generated",
      data: result,
    });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 400;
    return res.status(status).json({ success: false, message: getErrorMessage(error) });
  }
};
