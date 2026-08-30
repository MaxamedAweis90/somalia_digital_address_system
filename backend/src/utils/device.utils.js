import { UAParser } from "ua-parser-js";

export const getDeviceInfo = (req) => {
  const parser = new UAParser(req.headers["user-agent"]);
  const result = parser.getResult();

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "Unknown IP";

  return {
    browser: result.browser.name
      ? `${result.browser.name} ${result.browser.version || ""}`.trim()
      : "Unknown browser",
    os: result.os.name
      ? `${result.os.name} ${result.os.version || ""}`.trim()
      : "Unknown OS",
    device: result.device.model || result.device.type || "Desktop",
    ip,
  };
};