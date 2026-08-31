import { prisma } from "../db.js";

const settingSelect = {
  id: true,
  key: true,
  label: true,
  value: true,
  description: true,
  category: true,
  type: true,
  isSystem: true,
  createdAt: true,
  updatedAt: true,
};

function normalizeKey(key) {
  return key?.trim().toLowerCase().replace(/\s+/g, "_");
}

function validateSettingValue(type, value) {
  if (value === undefined || value === null || String(value).trim() === "") {
    throw new Error("Setting value is required");
  }

  const stringValue = String(value).trim();

  if (type === "NUMBER" && Number.isNaN(Number(stringValue))) {
    throw new Error("Setting value must be a valid number");
  }

  if (type === "BOOLEAN" && !["true", "false"].includes(stringValue.toLowerCase())) {
    throw new Error("Boolean setting value must be true or false");
  }

  if (type === "JSON") {
    try {
      JSON.parse(stringValue);
    } catch {
      throw new Error("JSON setting value must be valid JSON");
    }
  }

  return type === "BOOLEAN" ? stringValue.toLowerCase() : stringValue;
}

export const SettingsService = {
  getSettings: async () => {
    return prisma.appSetting.findMany({
      select: settingSelect,
      orderBy: [{ category: "asc" }, { label: "asc" }],
    });
  },

  getSettingByKey: async (key) => {
    const setting = await prisma.appSetting.findUnique({
      where: { key: normalizeKey(key) },
      select: settingSelect,
    });

    if (!setting) {
      throw new Error("Setting not found");
    }

    return setting;
  },

  createSetting: async ({ key, label, value, description, category, type }) => {
    if (!key?.trim() || !label?.trim()) {
      throw new Error("Setting key and label are required");
    }

    const normalizedKey = normalizeKey(key);
    const settingType = type || "STRING";
    const normalizedValue = validateSettingValue(settingType, value);

    return prisma.appSetting.create({
      data: {
        key: normalizedKey,
        label: label.trim(),
        value: normalizedValue,
        description: description?.trim() || null,
        category: category?.trim() || "general",
        type: settingType,
        isSystem: false,
      },
      select: settingSelect,
    });
  },

  updateSetting: async (id, { label, value, description, category, type }) => {
    const existing = await prisma.appSetting.findUnique({ where: { id } });

    if (!existing) {
      throw new Error("Setting not found");
    }

    const nextType = type || existing.type;
    const data = {};

    if (label !== undefined) data.label = label.trim();
    if (description !== undefined) data.description = description?.trim() || null;
    if (category !== undefined) data.category = category?.trim() || "general";
    if (type !== undefined) data.type = type;
    if (value !== undefined) data.value = validateSettingValue(nextType, value);

    return prisma.appSetting.update({
      where: { id },
      data,
      select: settingSelect,
    });
  },

  deleteSetting: async (id) => {
    const existing = await prisma.appSetting.findUnique({ where: { id } });

    if (!existing) {
      throw new Error("Setting not found");
    }

    if (existing.isSystem) {
      throw new Error("System settings cannot be deleted");
    }

    await prisma.appSetting.delete({ where: { id } });

    return { id };
  },
};
