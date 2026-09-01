const LEVELS = {
  error: "ERROR",
  warn: "WARN",
  info: "INFO",
  debug: "DEBUG",
};

function timestamp() {
  return new Date().toISOString();
}

function formatMessage(level, message, meta) {
  const prefix = `[${timestamp()}] ${LEVELS[level] || level}`;
  if (meta === undefined) return `${prefix} ${message}`;
  if (meta instanceof Error) {
    return `${prefix} ${message} ${meta.message}`;
  }
  if (typeof meta === "object") {
    return `${prefix} ${message} ${JSON.stringify(meta)}`;
  }
  return `${prefix} ${message} ${meta}`;
}

export const logger = {
  info(message, meta) {
    console.log(formatMessage("info", message, meta));
  },
  warn(message, meta) {
    console.warn(formatMessage("warn", message, meta));
  },
  error(message, meta) {
    console.error(formatMessage("error", message, meta));
  },
  debug(message, meta) {
    if (process.env.NODE_ENV === "production") return;
    console.log(formatMessage("debug", message, meta));
  },
};

export function maskDatabaseUrl(url) {
  if (!url) return "not configured";
  try {
    const parsed = new URL(url);
    const database = parsed.pathname.replace(/^\//, "") || "unknown";
    const host = parsed.hostname;
    return `${host}/${database}`;
  } catch {
    return "configured";
  }
}
