import { Router } from "express";
import {
  createRegion,
  deleteRegion,
  getRegionById,
  getRegions,
  updateRegion,
} from "../controllers/region.controller.js";

const RegionRouter = Router();

RegionRouter.post("/", createRegion);
RegionRouter.get("/", getRegions);
RegionRouter.get("/:id", getRegionById);
RegionRouter.put("/:id", updateRegion);
RegionRouter.delete("/:id", deleteRegion);

export default RegionRouter;
