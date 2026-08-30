import { Router } from "express";
import { authorize } from "../middleware/auth.midleware.js";
import {
  createDistrict,
  deleteDistrict,
  getDistrictById,
  getDistricts,
  updateDistrict,
} from "../controllers/district.controller.js";

const DistrictRouter = Router();

// Read operations: Available to both SYS_ADMIN and DATA_OFFICER for lookups & address forms
DistrictRouter.get("/", authorize("SYS_ADMIN", "DATA_OFFICER"), getDistricts);
DistrictRouter.get("/:id", authorize("SYS_ADMIN", "DATA_OFFICER"), getDistrictById);

// Write operations: Strictly restricted to SYS_ADMIN (Super Admin)
DistrictRouter.post("/", authorize("SYS_ADMIN"), createDistrict);
DistrictRouter.put("/:id", authorize("SYS_ADMIN"), updateDistrict);
DistrictRouter.delete("/:id", authorize("SYS_ADMIN"), deleteDistrict);

export default DistrictRouter;
