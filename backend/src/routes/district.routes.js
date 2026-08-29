import { Router } from "express";
import {
  createDistrict,
  deleteDistrict,
  getDistrictById,
  getDistricts,
  updateDistrict,
} from "../controllers/district.controller.js";

const DistrictRouter = Router();

DistrictRouter.post("/", createDistrict);
DistrictRouter.get("/", getDistricts);
DistrictRouter.get("/:id", getDistrictById);
DistrictRouter.put("/:id", updateDistrict);
DistrictRouter.delete("/:id", deleteDistrict);

export default DistrictRouter;
