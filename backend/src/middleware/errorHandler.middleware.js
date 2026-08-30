import { getErrorMessage } from "../utils/prisma-error.utils.js";
import { shouldExposeErrors } from "../utils/env.utils.js";

export function notFoundHandler(req, res) {
  res.locals.errorMessage = `Route not found: ${req.method} ${req.originalUrl}`;

  const payload = {
    success: false,
    message: "Route not found",
  };

  if (shouldExposeErrors()) {
    payload.details = {
      method: req.method,
      path: req.originalUrl,
    };
  }

  res.status(404).json(payload);
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  res.locals.error = err;
  res.locals.errorMessage = err.message;

  const status = err.status || err.statusCode || 500;
  const message = getErrorMessage(err);

  if (shouldExposeErrors()) {
    console.error(`[ERROR] Unhandled exception on ${req.method} ${req.originalUrl}`);
    console.error(err.stack || err);
  } else {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} → ${message}`);
  }

  const payload = {
    success: false,
    message: status >= 500 && !shouldExposeErrors() ? "Internal server error" : message,
  };

  if (shouldExposeErrors()) {
    payload.details = {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code,
    };
  }

  res.status(status).json(payload);
}
