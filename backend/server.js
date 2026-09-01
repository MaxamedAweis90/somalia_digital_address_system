import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import CentralRouter from "./src/routes/index.js";
import { applySanitizers } from "./src/middleware/sanitize.middleware.js";
import { globalRateLimiter } from "./src/middleware/rateLimiter.middleware.js";
import { requestLogger } from "./src/middleware/requestLogger.middleware.js";
import { connectDatabase, disconnectDatabase } from "./src/db.js";
import { logger } from "./src/utils/logger.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Prisma house numbers are BigInt; Express JSON cannot serialize them by default.
BigInt.prototype.toJSON = function toJSON() {
  return this.toString();
};

app.use(helmet());

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "https://sdas-portal.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        (process.env.FRONTEND_URL && origin.startsWith(process.env.FRONTEND_URL))
      ) {
        return callback(null, true);
      }
      return callback(null, origin);
    },
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

app.use((err, req, res, next) => {
  logger.error("Unhandled request error", {
    method: req.method,
    path: req.originalUrl,
    message: err?.message || "Unknown error",
  });

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.statusCode || 500).json({
    message: err.message || "Internal server error",
  });
});

async function startServer() {
  try {
    await connectDatabase();

    const server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
    });

    const shutdown = async (signal) => {
      logger.info(`${signal} received. Shutting down...`);
      server.close(async () => {
        try {
          await disconnectDatabase();
          logger.info("Database disconnected");
          process.exit(0);
        } catch (error) {
          logger.error("Failed to disconnect database during shutdown", error);
          process.exit(1);
        }
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
}

startServer();
