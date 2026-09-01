import { Router } from "express";
import { authorize } from "../middleware/auth.midleware.js";
import { searchRegistry } from "../controllers/search.controller.js";

const SearchRouter = Router();

SearchRouter.get("/", authorize("SYS_ADMIN"), searchRegistry);

export default SearchRouter;
