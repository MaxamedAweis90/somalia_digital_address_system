import { DataOfficerService } from "../service/data-officer.service.js";
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

export const createDataOfficer = async (req, res) => {
  try {
    const dataOfficer = await DataOfficerService.createDataOfficer(req.body);

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
    const dataOfficers = await DataOfficerService.getDataOfficers();

    return res.status(200).json({
      success: true,
      data: dataOfficers,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const getDataOfficerById = async (req, res) => {
  try {
    const dataOfficer = await DataOfficerService.getDataOfficerById(
      req.params.id
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
      req.body
    );

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
      req.user.id
    );

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
