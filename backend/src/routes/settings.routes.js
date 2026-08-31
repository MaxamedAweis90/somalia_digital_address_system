import { Router } from "express";
import { authorize } from "../middleware/auth.midleware.js";
import {
  createSetting,
  deleteSetting,
  getSettingByKey,
  getSettings,
  updateSetting,
} from "../controllers/settings.controller.js";

const SettingsRouter = Router();

SettingsRouter.get("/", authorize("SYS_ADMIN", "DATA_OFFICER"), getSettings);
SettingsRouter.get("/key/:key", authorize("SYS_ADMIN", "DATA_OFFICER"), getSettingByKey);

SettingsRouter.post("/", authorize("SYS_ADMIN"), createSetting);
SettingsRouter.put("/:id", authorize("SYS_ADMIN"), updateSetting);
SettingsRouter.delete("/:id", authorize("SYS_ADMIN"), deleteSetting);

export default SettingsRouter;
