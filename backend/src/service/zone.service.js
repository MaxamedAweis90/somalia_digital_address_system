import { prisma } from "../db.js";
import { validateStatus } from "../utils/validation.utils.js";

const zoneSelect = {
  id: true,
  neighborhoodId: true,
  name: true,
  code: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  neighborhood: {
    select: {
      id: true,
      name: true,
      code: true,
      districtId: true,
      district: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  },
};

export const ZoneService = {
  createZone: async ({ neighborhoodId, name, code, status }) => {
    if (!neighborhoodId || !name?.trim() || !code?.trim()) {
      throw new Error("Neighborhood ID, name, and code are required");
    }

    validateStatus(status);

    const neighborhood = await prisma.neighborhood.findUnique({
      where: { id: neighborhoodId },
    });

    if (!neighborhood) {
      throw new Error("Neighborhood not found");
    }

    const formattedCode = code.trim().toUpperCase();

    // Check if zone code already exists
    const existingCode = await prisma.zone.findUnique({
      where: { code: formattedCode },
    });

    if (existingCode) {
      throw new Error("Zone code already exists");
    }

    return prisma.zone.create({
      data: {
        neighborhoodId,
        name: name.trim(),
        code: formattedCode,
        status: status || "ACTIVE",
      },
      select: zoneSelect,
    });
  },

  getZones: async (query = {}) => {
    const { neighborhoodId, status, search, page = 1, limit = 20 } = query;

    const pageNumber = Math.max(1, parseInt(page) || 1);
    const limitNumber = Math.max(1, parseInt(limit) || 20);
    const skip = (pageNumber - 1) * limitNumber;

    const where = {
      ...(neighborhoodId && { neighborhoodId }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { code: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const items = await prisma.zone.findMany({
      where,
      skip,
      take: limitNumber,
      orderBy: { name: "asc" },
      select: {
        ...zoneSelect,
        _count: {
          select: { addresses: true },
        },
      },
    });
    const total = await prisma.zone.count({ where });

    return {
      items,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    };
  },

  getZoneById: async (id) => {
    if (!id) {
      throw new Error("Zone ID is required");
    }

    const zone = await prisma.zone.findUnique({
      where: { id },
      select: {
        ...zoneSelect,
        addresses: {
          select: {
            id: true,
            addressCode: true,
            houseNumber: true,
            streetName: true,
            description: true,
            location: true,
            status: true,
          },
          orderBy: { addressCode: "asc" },
        },
        _count: {
          select: { addresses: true },
        },
      },
    });

    if (!zone) {
      throw new Error("Zone not found");
    }

    // Convert BigInt inside addresses to string for serialization
    if (zone.addresses) {
      zone.addresses = zone.addresses.map(addr => ({
        ...addr,
        houseNumber: addr.houseNumber.toString(),
      }));
    }

    return zone;
  },

  updateZone: async (id, { neighborhoodId, name, code, status }) => {
    const existing = await prisma.zone.findUnique({ where: { id } });

    if (!existing) {
      throw new Error("Zone not found");
    }

    if (neighborhoodId) {
      const neighborhood = await prisma.neighborhood.findUnique({
        where: { id: neighborhoodId },
      });

      if (!neighborhood) {
        throw new Error("Neighborhood not found");
      }
    }

    if (code !== undefined) {
      const formattedCode = code.trim().toUpperCase();
      if (formattedCode !== existing.code) {
        const existingCode = await prisma.zone.findUnique({
          where: { code: formattedCode },
        });

        if (existingCode) {
          throw new Error("Zone code already exists");
        }
      }
    }

    validateStatus(status);

    return prisma.zone.update({
      where: { id },
      data: {
        ...(neighborhoodId !== undefined && { neighborhoodId }),
        ...(name !== undefined && { name: name.trim() }),
        ...(code !== undefined && { code: code.trim().toUpperCase() }),
        ...(status !== undefined && { status }),
      },
      select: zoneSelect,
    });
  },

  deleteZone: async (id) => {
    const zone = await prisma.zone.findUnique({
      where: { id },
      include: {
        _count: { select: { addresses: true } },
      },
    });

    if (!zone) {
      throw new Error("Zone not found");
    }

    if (zone._count.addresses > 0) {
      throw new Error(
        "Cannot delete zone with existing addresses. Remove addresses first."
      );
    }

    await prisma.zone.delete({ where: { id } });

    return { id };
  },
};