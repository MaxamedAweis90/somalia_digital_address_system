import { Router } from "express";
import { authorize } from "../middleware/auth.midleware.js";
import {
  createNeighborhood,
  deleteNeighborhood,
  getNeighborhoodById,
  getNeighborhoods,
  updateNeighborhood,
} from "../controllers/neighborhood.controller.js";

const NeighborhoodRouter = Router();

// Read operations: Available to both SYS_ADMIN and DATA_OFFICER for lookups & address forms
NeighborhoodRouter.get("/", authorize("SYS_ADMIN", "DATA_OFFICER"), getNeighborhoods);
NeighborhoodRouter.get("/:id", authorize("SYS_ADMIN", "DATA_OFFICER"), getNeighborhoodById);

// Write operations: Strictly restricted to SYS_ADMIN (Super Admin)
NeighborhoodRouter.post("/", authorize("SYS_ADMIN"), createNeighborhood);
NeighborhoodRouter.put("/:id", authorize("SYS_ADMIN"), updateNeighborhood);
NeighborhoodRouter.delete("/:id", authorize("SYS_ADMIN"), deleteNeighborhood);

export default NeighborhoodRouter;
