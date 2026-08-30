import { SettingsService } from "../service/settings.service.js";
import { getErrorMessage } from "../utils/prisma-error.utils.js";

export const getSettings = async (req, res) => {
  try {
    const settings = await SettingsService.getSettings();

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const getSettingByKey = async (req, res) => {
  try {
    const setting = await SettingsService.getSettingByKey(req.params.key);

    return res.status(200).json({
      success: true,
      data: setting,
    });
  } catch (error) {
    const status = error.message === "Setting not found" ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const createSetting = async (req, res) => {
  try {
    const setting = await SettingsService.createSetting(req.body);

    return res.status(201).json({
      success: true,
      message: "Setting created successfully",
      data: setting,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const updateSetting = async (req, res) => {
  try {
    const setting = await SettingsService.updateSetting(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: "Setting updated successfully",
      data: setting,
    });
  } catch (error) {
    const status = error.message === "Setting not found" ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const deleteSetting = async (req, res) => {
  try {
    const result = await SettingsService.deleteSetting(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Setting deleted successfully",
      data: result,
    });
  } catch (error) {
    const status = error.message === "Setting not found" ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};
