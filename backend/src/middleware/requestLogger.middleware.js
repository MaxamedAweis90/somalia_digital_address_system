import { shouldExposeErrors } from "../utils/env.utils.js";

function formatTimestamp() {
  return new Date().toISOString();
}

export function requestLogger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const line = `[${formatTimestamp()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;

    if (res.statusCode >= 500) {
      console.error(`[ERROR] ${line}`);
      if (shouldExposeErrors() && res.locals.error) {
        console.error(res.locals.error.stack || res.locals.error);
      }
    } else if (res.statusCode >= 400) {
      console.warn(`[WARN]  ${line}`);
      if (shouldExposeErrors() && res.locals.errorMessage) {
        console.warn(`        → ${res.locals.errorMessage}`);
      }
    } else {
      console.log(`[HTTP]  ${line}`);
    }
  });

  next();
}
