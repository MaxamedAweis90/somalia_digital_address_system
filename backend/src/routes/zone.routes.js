import { Router } from "express";
import { authorize } from "../middleware/auth.midleware.js";
import {
  createZone,
  deleteZone,
  getZoneById,
  getZones,
  updateZone,
} from "../controllers/zone.controller.js";

const ZoneRouter = Router();

// Read operations: Available to both SYS_ADMIN and DATA_OFFICER
ZoneRouter.get("/", authorize("SYS_ADMIN", "DATA_OFFICER"), getZones);
ZoneRouter.get("/:id", authorize("SYS_ADMIN", "DATA_OFFICER"), getZoneById);

// Write operations: Strictly restricted to SYS_ADMIN
ZoneRouter.post("/", authorize("SYS_ADMIN"), createZone);
ZoneRouter.patch("/:id", authorize("SYS_ADMIN"), updateZone);
ZoneRouter.delete("/:id", authorize("SYS_ADMIN"), deleteZone);

export default ZoneRouter;