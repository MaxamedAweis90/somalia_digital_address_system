import { DistrictService } from "../service/district.service.js";
import { getErrorMessage } from "../utils/prisma-error.utils.js";

export const createDistrict = async (req, res) => {
  try {
    const district = await DistrictService.createDistrict(req.body);

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
    const districts = await DistrictService.getDistricts(req.query.regionId);

    return res.status(200).json({
      success: true,
      data: districts,
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
      req.body
    );

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
