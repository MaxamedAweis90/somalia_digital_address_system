import { logger } from "../utils/logger.js";

export function requestLogger(req, res, next) {
  const startedAt = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`;

    if (res.statusCode >= 500) {
      logger.error(message);
      return;
    }

    if (res.statusCode >= 400) {
      logger.warn(message);
      return;
    }

    logger.info(message);
  });

  next();
}
