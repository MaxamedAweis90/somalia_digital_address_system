import { prisma } from "../db.js";
import { validateStatus } from "../utils/validation.utils.js";

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
