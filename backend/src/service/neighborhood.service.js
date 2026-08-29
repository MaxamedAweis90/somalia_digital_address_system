import { prisma } from "../db.js";
import { validateStatus } from "../utils/validation.utils.js";

const neighborhoodSelect = {
  id: true,
  districtId: true,
  name: true,
  code: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  district: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
};

export const NeighborhoodService = {
  createNeighborhood: async ({ districtId, name, code, status }) => {
    if (!districtId || !name?.trim() || !code?.trim()) {
      throw new Error("District, name, and code are required");
    }

    const district = await prisma.district.findUnique({
      where: { id: districtId },
    });

    if (!district) {
      throw new Error("District not found");
    }

    validateStatus(status);

    return prisma.neighborhood.create({
      data: {
        districtId,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        status: status || "ACTIVE",
      },
      select: neighborhoodSelect,
    });
  },

  getNeighborhoods: async (districtId) => {
    return prisma.neighborhood.findMany({
      where: districtId ? { districtId } : undefined,
      select: neighborhoodSelect,
      orderBy: { name: "asc" },
    });
  },

  getNeighborhoodById: async (id) => {
    const neighborhood = await prisma.neighborhood.findUnique({
      where: { id },
      select: {
        ...neighborhoodSelect,
        _count: { select: { zones: true, addresses: true } },
      },
    });

    if (!neighborhood) {
      throw new Error("Neighborhood not found");
    }

    return neighborhood;
  },

  updateNeighborhood: async (id, { districtId, name, code, status }) => {
    const existing = await prisma.neighborhood.findUnique({ where: { id } });

    if (!existing) {
      throw new Error("Neighborhood not found");
    }

    if (districtId) {
      const district = await prisma.district.findUnique({
        where: { id: districtId },
      });

      if (!district) {
        throw new Error("District not found");
      }
    }

    validateStatus(status);

    return prisma.neighborhood.update({
      where: { id },
      data: {
        ...(districtId !== undefined && { districtId }),
        ...(name !== undefined && { name: name.trim() }),
        ...(code !== undefined && { code: code.trim().toUpperCase() }),
        ...(status !== undefined && { status }),
      },
      select: neighborhoodSelect,
    });
  },

  deleteNeighborhood: async (id) => {
    const neighborhood = await prisma.neighborhood.findUnique({
      where: { id },
      include: {
        _count: { select: { zones: true, addresses: true } },
      },
    });

    if (!neighborhood) {
      throw new Error("Neighborhood not found");
    }

    if (neighborhood._count.zones > 0 || neighborhood._count.addresses > 0) {
      throw new Error(
        "Cannot delete neighborhood with existing zones or addresses. Remove them first."
      );
    }

    await prisma.neighborhood.delete({ where: { id } });

    return { id };
  },
};
