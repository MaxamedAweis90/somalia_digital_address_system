import { Router } from "express";
import { authorize } from "../middleware/auth.midleware.js";
import {
  createRegion,
  deleteRegion,
  getRegionById,
  getRegions,
  updateRegion,
} from "../controllers/region.controller.js";

const RegionRouter = Router();

// Read operations: Available to both SYS_ADMIN and DATA_OFFICER for cascading dropdowns
RegionRouter.get("/", authorize("SYS_ADMIN", "DATA_OFFICER"), getRegions);
RegionRouter.get("/:id", authorize("SYS_ADMIN", "DATA_OFFICER"), getRegionById);

// Write operations: Strictly restricted to SYS_ADMIN
RegionRouter.post("/", authorize("SYS_ADMIN"), createRegion);
RegionRouter.put("/:id", authorize("SYS_ADMIN"), updateRegion);
RegionRouter.delete("/:id", authorize("SYS_ADMIN"), deleteRegion);

export default RegionRouter;
