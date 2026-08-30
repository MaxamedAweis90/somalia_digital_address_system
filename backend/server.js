import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import CentralRouter from "./src/routes/index.js";
import { applySanitizers } from "./src/middleware/sanitize.middleware.js";
import { globalRateLimiter } from "./src/middleware/rateLimiter.middleware.js";
import { requestLogger } from "./src/middleware/requestLogger.middleware.js";
import {
  errorHandler,
  notFoundHandler,
} from "./src/middleware/errorHandler.middleware.js";
import { isDevelopment } from "./src/utils/env.utils.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

app.use(requestLogger);

app.use("/api/v1", globalRateLimiter);
app.use(applySanitizers);

app.use("/api/v1", CentralRouter);

app.get("/", (req, res) => {
  res.status(200).send("API is running...");
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Error details exposed: ${isDevelopment() ? "yes" : "no"}`);
});
