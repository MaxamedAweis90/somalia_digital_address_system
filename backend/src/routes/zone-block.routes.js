import { Router } from "express";
import { authorize } from "../middleware/auth.midleware.js";
import {
  createZoneBlock,
  deleteZoneBlock,
  getZoneBlockById,
  getZoneBlocks,
  updateZoneBlock,
} from "../controllers/zone-block.controller.js";

const ZoneBlockRouter = Router();

ZoneBlockRouter.get("/", authorize("SYS_ADMIN", "DATA_OFFICER", "DATA_COLLECTOR"), getZoneBlocks);
ZoneBlockRouter.get("/:id", authorize("SYS_ADMIN", "DATA_OFFICER", "DATA_COLLECTOR"), getZoneBlockById);

ZoneBlockRouter.post("/", authorize("SYS_ADMIN"), createZoneBlock);
ZoneBlockRouter.put("/:id", authorize("SYS_ADMIN"), updateZoneBlock);
ZoneBlockRouter.delete("/:id", authorize("SYS_ADMIN"), deleteZoneBlock);

export default ZoneBlockRouter;
