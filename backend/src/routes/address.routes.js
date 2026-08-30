import { Router } from "express";
import { authorize } from "../middleware/auth.midleware.js";
import {
  createAddress,
  deleteAddress,
  getAddressById,
  getAddresses,
  updateAddress,
} from "../controllers/address.controller.js";

const AddressRouter = Router();

// Address CRUD operations are accessible to both SYS_ADMIN and DATA_OFFICER
AddressRouter.post("/", authorize("SYS_ADMIN", "DATA_OFFICER"), createAddress);
AddressRouter.get("/", authorize("SYS_ADMIN", "DATA_OFFICER"), getAddresses);
AddressRouter.get("/:id", authorize("SYS_ADMIN", "DATA_OFFICER"), getAddressById);
AddressRouter.patch("/:id", authorize("SYS_ADMIN", "DATA_OFFICER"), updateAddress);
AddressRouter.delete("/:id", authorize("SYS_ADMIN", "DATA_OFFICER"), deleteAddress);

export default AddressRouter;
