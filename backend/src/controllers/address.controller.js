import { AddressService } from "../service/address.service.js";
import { AuditLogService } from "../service/auditLog.service.js";
import { getErrorMessage } from "../utils/prisma-error.utils.js";
import { getSettingValue } from "../utils/settings.utils.js";

export const previewNextAddressCode = async (req, res) => {
  try {
    const preview = await AddressService.previewNextCode(req.query.zoneBlockId);

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

    await AuditLogService.logSafe({
      userId: req.user?.id,
      action: `Created Address: ${address.addressCode} (${address.streetName})`,
      actionType: "CREATE",
      entityId: address.id,
    });

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
    const { page, limit, search, districtId, zoneId, zoneBlockId } = req.query;

    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;

    const result = await AddressService.getAddresses({
      page: isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage,
      limit: isNaN(parsedLimit) || parsedLimit < 1 ? 10 : parsedLimit,
      search,
      districtId,
      zoneId,
      zoneBlockId,
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

    await AuditLogService.logSafe({
      userId: req.user?.id,
      action: `Updated Address: ${address.addressCode} (${address.streetName})`,
      actionType: "UPDATE",
      entityId: address.id,
    });

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

    await AuditLogService.logSafe({
      userId: req.user?.id,
      action: `Deleted Address: ${result.addressCode || req.params.id}`,
      actionType: "DELETE",
      entityId: req.params.id,
    });

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
