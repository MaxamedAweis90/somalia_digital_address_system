import { Router } from "express";
import { protect, authorize } from "../middleware/auth.midleware.js";
import RegionRouter from "./region.routes.js";
import DistrictRouter from "./district.routes.js";
import NeighborhoodRouter from "./neighborhood.routes.js";

const AdminRouter = Router();

AdminRouter.use(protect, authorize("SYS_ADMIN"));

AdminRouter.use("/regions", RegionRouter);
AdminRouter.use("/districts", DistrictRouter);
AdminRouter.use("/neighborhoods", NeighborhoodRouter);

export default AdminRouter;
