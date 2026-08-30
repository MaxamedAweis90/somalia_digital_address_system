import { prisma } from "../db.js";
import { validateStatus } from "../utils/validation.utils.js";

export const SOMALI_OFFICIAL_REGIONS = [
  { name: "Awdal", code: "AWD" },
  { name: "Bakool", code: "BKL" },
  { name: "Banaadir", code: "BND" },
  { name: "Bari", code: "BAR" },
  { name: "Bay", code: "BAY" },
  { name: "Galguduud", code: "GLG" },
  { name: "Gedo", code: "GED" },
  { name: "Hiiraan", code: "HIR" },
  { name: "Jubbada Dhexe", code: "JDX" },
  { name: "Jubbada Hoose", code: "JHS" },
  { name: "Mudug", code: "MDG" },
  { name: "Nugaal", code: "NGL" },
  { name: "Sanaag", code: "SNG" },
  { name: "Shabeellaha Dhexe", code: "SDX" },
  { name: "Shabeellaha Hoose", code: "SHS" },
  { name: "Sool", code: "SOL" },
  { name: "Togdheer", code: "TGD" },
  { name: "Woqooyi Galbeed", code: "WQG" },
];

const isValidSomaliRegion = (name, code) => {
  const normalizedName = name.trim().toLowerCase();
  const normalizedCode = code.trim().toUpperCase();

  return SOMALI_OFFICIAL_REGIONS.some(
    (reg) =>
      reg.name.toLowerCase() === normalizedName ||
      reg.code === normalizedCode
  );
};

const regionSelect = {
  id: true,
  name: true,
  code: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

export const RegionService = {
  createRegion: async ({ name, code, status }) => {
    if (!name?.trim() || !code?.trim()) {
      throw new Error("Name and code are required");
    }

    if (!isValidSomaliRegion(name, code)) {
      throw new Error(
        `"${name}" is not a recognized official administrative region of Somalia. Only the 18 official regions are permitted.`
      );
    }

    validateStatus(status);

    return prisma.region.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        status: status || "ACTIVE",
      },
      select: regionSelect,
    });
  },

  getRegions: async () => {
    return prisma.region.findMany({
      select: {
        ...regionSelect,
        _count: { select: { districts: true } },
      },
      orderBy: { name: "asc" },
    });
  },

  getRegionById: async (id) => {
    const region = await prisma.region.findUnique({
      where: { id },
      select: {
        ...regionSelect,
        districts: {
          select: {
            id: true,
            name: true,
            code: true,
            status: true,
          },
          orderBy: { name: "asc" },
        },
      },
    });

    if (!region) {
      throw new Error("Region not found");
    }

    return region;
  },

  updateRegion: async (id, { name, code, status }) => {
    const existing = await prisma.region.findUnique({ where: { id } });

    if (!existing) {
      throw new Error("Region not found");
    }

    if (name || code) {
      const checkName = name || existing.name;
      const checkCode = code || existing.code;
      if (!isValidSomaliRegion(checkName, checkCode)) {
        throw new Error(
          `"${checkName}" is not a recognized official administrative region of Somalia.`
        );
      }
    }

    validateStatus(status);

    return prisma.region.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(code !== undefined && { code: code.trim().toUpperCase() }),
        ...(status !== undefined && { status }),
      },
      select: regionSelect,
    });
  },

  deleteRegion: async (id) => {
    const region = await prisma.region.findUnique({
      where: { id },
      include: { _count: { select: { districts: true } } },
    });

    if (!region) {
      throw new Error("Region not found");
    }

    if (region._count.districts > 0) {
      throw new Error(
        "Cannot delete region with existing districts. Remove districts first."
      );
    }

    await prisma.region.delete({ where: { id } });

    return { id };
  },
};
