import { Router } from "express";
import { protect } from "../middleware/auth.midleware.js";
import RegionRouter from "./region.routes.js";
import DistrictRouter from "./district.routes.js";
import NeighborhoodRouter from "./neighborhood.routes.js";
import ZoneRouter from "./zone.routes.js";
import AddressRouter from "./address.routes.js";
import DataOfficerRouter from "./data-officer.routes.js";

const AdminRouter = Router();

// Require authentication for all administrative resources
AdminRouter.use(protect);

AdminRouter.use("/regions", RegionRouter);
AdminRouter.use("/districts", DistrictRouter);
AdminRouter.use("/neighborhoods", NeighborhoodRouter);
AdminRouter.use("/zones", ZoneRouter);
AdminRouter.use("/addresses", AddressRouter);
AdminRouter.use("/data-officers", DataOfficerRouter);

export default AdminRouter;
