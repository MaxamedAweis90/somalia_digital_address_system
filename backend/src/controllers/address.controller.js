import { AddressService } from "../service/address.service.js";
import { getErrorMessage } from "../utils/prisma-error.utils.js";

export const createAddress = async (req, res) => {
  try {
    const address = await AddressService.createAddress(req.body);

    return res.status(201).json({
      success: true,
      message: "Address created successfully",
      data: address,
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

export const getAddresses = async (req, res) => {
  try {
    const result = await AddressService.getAddresses(req.query);

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

export const getAddressById = async (req, res) => {
  try {
    const address = await AddressService.getAddressById(req.params.id);

    return res.status(200).json({
      success: true,
      data: address,
    });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const address = await AddressService.updateAddress(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: address,
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

export const deleteAddress = async (req, res) => {
  try {
    const result = await AddressService.deleteAddress(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
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
