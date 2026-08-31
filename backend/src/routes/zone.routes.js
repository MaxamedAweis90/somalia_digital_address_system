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

ZoneRouter.get("/", authorize("SYS_ADMIN", "DATA_OFFICER", "DATA_COLLECTOR"), getZones);
ZoneRouter.get("/:id", authorize("SYS_ADMIN", "DATA_OFFICER", "DATA_COLLECTOR"), getZoneById);

ZoneRouter.post("/", authorize("SYS_ADMIN"), createZone);
ZoneRouter.put("/:id", authorize("SYS_ADMIN"), updateZone);
ZoneRouter.delete("/:id", authorize("SYS_ADMIN"), deleteZone);

export default ZoneRouter;
