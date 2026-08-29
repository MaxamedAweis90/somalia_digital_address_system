import { Router } from "express";
import {
  createNeighborhood,
  deleteNeighborhood,
  getNeighborhoodById,
  getNeighborhoods,
  updateNeighborhood,
} from "../controllers/neighborhood.controller.js";

const NeighborhoodRouter = Router();

NeighborhoodRouter.post("/", createNeighborhood);
NeighborhoodRouter.get("/", getNeighborhoods);
NeighborhoodRouter.get("/:id", getNeighborhoodById);
NeighborhoodRouter.put("/:id", updateNeighborhood);
NeighborhoodRouter.delete("/:id", deleteNeighborhood);

export default NeighborhoodRouter;
