import { NeighborhoodService } from "../service/neighborhood.service.js";
import { getErrorMessage } from "../utils/prisma-error.utils.js";

export const createNeighborhood = async (req, res) => {
  try {
    const neighborhood = await NeighborhoodService.createNeighborhood(req.body);

    return res.status(201).json({
      success: true,
      message: "Neighborhood created successfully",
      data: neighborhood,
    });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const getNeighborhoods = async (req, res) => {
  try {
    const neighborhoods = await NeighborhoodService.getNeighborhoods(
      req.query.districtId
    );

    return res.status(200).json({
      success: true,
      data: neighborhoods,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const getNeighborhoodById = async (req, res) => {
  try {
    const neighborhood = await NeighborhoodService.getNeighborhoodById(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      data: neighborhood,
    });
  } catch (error) {
    const status = error.message === "Neighborhood not found" ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const updateNeighborhood = async (req, res) => {
  try {
    const neighborhood = await NeighborhoodService.updateNeighborhood(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Neighborhood updated successfully",
      data: neighborhood,
    });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const deleteNeighborhood = async (req, res) => {
  try {
    const result = await NeighborhoodService.deleteNeighborhood(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Neighborhood deleted successfully",
      data: result,
    });
  } catch (error) {
    const status = error.message === "Neighborhood not found" ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};
