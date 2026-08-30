import { AddressService } from "../service/address.service.js";
import { getErrorMessage } from "../utils/prisma-error.utils.js";
import { getSettingValue } from "../utils/settings.utils.js";

export const previewNextAddressCode = async (req, res) => {
  try {
    const preview = await AddressService.previewNextCode(req.query.zoneId);

    return res.status(200).json({
      success: true,
      data: preview,
    });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const createAddress = async (req, res) => {
  try {
    const address = await AddressService.createAddress(req.body);

    return res.status(201).json({
      success: true,
      message: "Address registered successfully",
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

export const getAddresses = async (req, res) => {
  try {
    const addresses = await AddressService.getAddresses(req.query);

    return res.status(200).json({
      success: true,
      data: addresses,
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
    const status = error.message === "Address not found" ? 404 : 400;
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
    const status = error.message.includes("not found") ? 404 : 400;
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
    const status = error.message === "Address not found" ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const lookupAddressByCode = async (req, res) => {
  try {
    const enabled = await getSettingValue("public_lookup_enabled", true);
    if (!enabled) {
      return res.status(503).json({
        success: false,
        message: "Public address lookup is currently disabled",
      });
    }

    const address = await AddressService.getAddressByCode(req.params.code);

    return res.status(200).json({
      success: true,
      data: address,
    });
  } catch (error) {
    const status = error.message === "Address not found" ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};
