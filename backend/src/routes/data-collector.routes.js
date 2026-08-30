import { Router } from "express";
import { authorize } from "../middleware/auth.midleware.js";
import {
  createDataCollector,
  deleteDataCollector,
  getDataCollectorById,
  getDataCollectors,
  regenerateDataCollectorPassword,
  updateDataCollector,
} from "../controllers/admin-data-collector.controller.js";

const DataCollectorRouter = Router();

DataCollectorRouter.use(authorize("SYS_ADMIN"));

DataCollectorRouter.post("/", createDataCollector);
DataCollectorRouter.get("/", getDataCollectors);
DataCollectorRouter.post("/:id/regenerate-password", regenerateDataCollectorPassword);
DataCollectorRouter.get("/:id", getDataCollectorById);
DataCollectorRouter.put("/:id", updateDataCollector);
DataCollectorRouter.delete("/:id", deleteDataCollector);

export default DataCollectorRouter;
