import { prisma } from "../db.js";
import { validateStatus } from "../utils/validation.utils.js";

const regionSummarySelect = {
  id: true,
  name: true,
  code: true,
};

const districtSelect = {
  id: true,
  regionId: true,
  name: true,
  code: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  region: {
    select: regionSummarySelect,
  },
};

export const DistrictService = {
  createDistrict: async ({ regionId, name, code, status }) => {
    if (!regionId || !name?.trim() || !code?.trim()) {
      throw new Error("Region, name, and code are required");
    }

    validateStatus(status);

    const region = await prisma.region.findUnique({ where: { id: regionId } });

    if (!region) {
      throw new Error("Region not found");
    }

    return prisma.district.create({
      data: {
        regionId,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        status: status || "ACTIVE",
      },
      select: districtSelect,
    });
  },

  getDistricts: async (regionId) => {
    return prisma.district.findMany({
      where: regionId ? { regionId } : undefined,
      select: {
        ...districtSelect,
        _count: { select: { neighborhoods: true } },
      },
      orderBy: { name: "asc" },
    });
  },

  getDistrictById: async (id) => {
    if (!id || typeof id !== "string" || !id.trim()) {
      throw new Error("District ID is required");
    }

    const district = await prisma.district.findUnique({
      where: { id: id.trim() },
      select: {
        ...districtSelect,
        neighborhoods: {
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

    if (!district) {
      throw new Error("District not found");
    }

    return district;
  },

  updateDistrict: async (id, { regionId, name, code, status }) => {
    if (!id || typeof id !== "string" || !id.trim()) {
      throw new Error("District ID is required");
    }

    const existing = await prisma.district.findUnique({ where: { id: id.trim() } });

    if (!existing) {
      throw new Error("District not found");
    }

    if (regionId) {
      if (typeof regionId !== "string" || !regionId.trim()) {
        throw new Error("Region ID must be a valid string");
      }
      const region = await prisma.region.findUnique({ where: { id: regionId.trim() } });

      if (!region) {
        throw new Error("Region not found");
      }
    }

    validateStatus(status);

    return prisma.district.update({
      where: { id: id.trim() },
      data: {
        ...(regionId !== undefined && { regionId: regionId.trim() }),
        ...(name !== undefined && { name: name.trim() }),
        ...(code !== undefined && { code: code.trim().toUpperCase() }),
        ...(status !== undefined && { status }),
      },
      select: districtSelect,
    });
  },

  deleteDistrict: async (id) => {
    if (!id || typeof id !== "string" || !id.trim()) {
      throw new Error("District ID is required");
    }

    const district = await prisma.district.findUnique({
      where: { id: id.trim() },
      include: { _count: { select: { neighborhoods: true } } },
    });

    if (!district) {
      throw new Error("District not found");
    }

    if (district._count.neighborhoods > 0) {
      throw new Error(
        "Cannot delete district with existing neighborhoods. Remove neighborhoods first."
      );
    }

    await prisma.district.delete({ where: { id: id.trim() } });

    return { id: id.trim() };
  },
};
