import { prisma } from "../db.js";

export async function getSettingValue(key, fallback = null) {
  const setting = await prisma.appSetting.findUnique({
    where: { key: key.trim().toLowerCase() },
    select: { value: true, type: true },
  });

  if (!setting) {
    return fallback;
  }

  if (setting.type === "BOOLEAN") {
    return setting.value.toLowerCase() === "true";
  }

  if (setting.type === "NUMBER") {
    const numeric = Number(setting.value);
    return Number.isNaN(numeric) ? fallback : numeric;
  }

  return setting.value;
}
