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
    if (!id || typeof id !== "string" || !id.trim()) {
      throw new Error("Neighborhood ID is required");
    }

    const neighborhood = await prisma.neighborhood.findUnique({
      where: { id: id.trim() },
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
    if (!id || typeof id !== "string" || !id.trim()) {
      throw new Error("Neighborhood ID is required");
    }

    const existing = await prisma.neighborhood.findUnique({ where: { id: id.trim() } });

    if (!existing) {
      throw new Error("Neighborhood not found");
    }

    if (districtId) {
      if (typeof districtId !== "string" || !districtId.trim()) {
        throw new Error("District ID must be a valid string");
      }
      const district = await prisma.district.findUnique({
        where: { id: districtId.trim() },
      });

      if (!district) {
        throw new Error("District not found");
      }
    }

    validateStatus(status);

    return prisma.neighborhood.update({
      where: { id: id.trim() },
      data: {
        ...(districtId !== undefined && { districtId: districtId.trim() }),
        ...(name !== undefined && { name: name.trim() }),
        ...(code !== undefined && { code: code.trim().toUpperCase() }),
        ...(status !== undefined && { status }),
      },
      select: neighborhoodSelect,
    });
  },

  deleteNeighborhood: async (id) => {
    if (!id || typeof id !== "string" || !id.trim()) {
      throw new Error("Neighborhood ID is required");
    }

    const neighborhood = await prisma.neighborhood.findUnique({
      where: { id: id.trim() },
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

    await prisma.neighborhood.delete({ where: { id: id.trim() } });

    return { id: id.trim() };
  },
};
