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

  /**
   * Get districts with optional pagination and filtering
   * @param {Object} params
   * @param {string} [params.regionId] - Filter by region
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @param {string} [params.search] - Search by name or code
   * @returns {Promise<{data: Array, pagination: Object}>} Districts and pagination info
   */
  getDistricts: async ({ regionId, page = 1, limit = 10, search } = {}) => {
    // Robust parsing
    let parsedPage = parseInt(page, 10);
    let parsedLimit = parseInt(limit, 10);

    if (isNaN(parsedPage) || parsedPage < 1) {
      parsedPage = 1;
    }
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      parsedLimit = 10;
    }

    if (parsedLimit > 100) {
      parsedLimit = 100;
    }

    const skip = (parsedPage - 1) * parsedLimit;
    const take = parsedLimit;

    // Build filter
    const where = {};
    if (regionId && typeof regionId === "string" && regionId.trim()) {
      where.regionId = regionId.trim();
    }

    if (search && typeof search === "string" && search.trim()) {
      const searchPattern = search.trim();
      where.OR = [
        { name: { contains: searchPattern, mode: "insensitive" } },
        { code: { contains: searchPattern, mode: "insensitive" } },
      ];
    }

    // Get total
    const total = await prisma.district.count({ where });

    // Get paginated data
    const districts = await prisma.district.findMany({
      where,
      select: {
        ...districtSelect,
        _count: { select: { zones: true } },
      },
      orderBy: { name: "asc" },
      skip,
      take,
    });

    return {
      data: districts,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
      },
    };
  },

  getDistrictById: async (id) => {
    if (!id || typeof id !== "string" || !id.trim()) {
      throw new Error("District ID is required");
    }

    const district = await prisma.district.findUnique({
      where: { id: id.trim() },
      select: {
        ...districtSelect,
        zones: {
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

    const existing = await prisma.district.findUnique({
      where: { id: id.trim() },
    });

    if (!existing) {
      throw new Error("District not found");
    }

    if (regionId) {
      if (typeof regionId !== "string" || !regionId.trim()) {
        throw new Error("Region ID must be a valid string");
      }
      const region = await prisma.region.findUnique({
        where: { id: regionId.trim() },
      });

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
      include: { _count: { select: { zones: true } } },
    });

    if (!district) {
      throw new Error("District not found");
    }

    if (district._count.zones > 0) {
      throw new Error(
        "Cannot delete district with existing zones. Remove zones first.",
      );
    }

    await prisma.district.delete({ where: { id: id.trim() } });

    return { id: id.trim() };
  },
};
