import { Router } from "express";
import { authorize } from "../middleware/auth.midleware.js";
import {
  createAddress,
  deleteAddress,
  getAddressById,
  getAddresses,
  previewNextAddressCode,
  updateAddress,
} from "../controllers/address.controller.js";

const AddressRouter = Router();

AddressRouter.get(
  "/preview",
  authorize("SYS_ADMIN", "DATA_OFFICER"),
  previewNextAddressCode
);
AddressRouter.get("/", authorize("SYS_ADMIN", "DATA_OFFICER"), getAddresses);
AddressRouter.get("/:id", authorize("SYS_ADMIN", "DATA_OFFICER"), getAddressById);

AddressRouter.post("/", authorize("SYS_ADMIN", "DATA_OFFICER"), createAddress);
AddressRouter.put("/:id", authorize("SYS_ADMIN", "DATA_OFFICER"), updateAddress);
AddressRouter.delete("/:id", authorize("SYS_ADMIN", "DATA_OFFICER"), deleteAddress);

export default AddressRouter;
