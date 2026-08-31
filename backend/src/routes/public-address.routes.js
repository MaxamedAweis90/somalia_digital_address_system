import { Router } from "express";
import { lookupAddressByCode } from "../controllers/address.controller.js";

const PublicAddressRouter = Router();

PublicAddressRouter.get("/lookup/:code", lookupAddressByCode);

export default PublicAddressRouter;
