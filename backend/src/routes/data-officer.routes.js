import { Router } from "express";
import { authorize } from "../middleware/auth.midleware.js";
import {
  createDataOfficer,
  deleteDataOfficer,
  getDataOfficerById,
  getDataOfficers,
  regenerateDataOfficerPassword,
  updateDataOfficer,
} from "../controllers/data-officer.controller.js";

const DataOfficerRouter = Router();

DataOfficerRouter.use(authorize("SYS_ADMIN"));

DataOfficerRouter.post("/", createDataOfficer);
DataOfficerRouter.get("/", getDataOfficers);
DataOfficerRouter.post("/:id/regenerate-password", regenerateDataOfficerPassword);
DataOfficerRouter.get("/:id", getDataOfficerById);
DataOfficerRouter.put("/:id", updateDataOfficer);
DataOfficerRouter.delete("/:id", deleteDataOfficer);

export default DataOfficerRouter;
