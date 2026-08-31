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
      reg.name.toLowerCase() === normalizedName || reg.code === normalizedCode,
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
        `"${name}" is not a recognized official administrative region of Somalia. Only the 18 official regions are permitted.`,
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

  /**
   * Get regions with optional pagination and search
   * @param {Object} params
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @param {string} [params.search] - Search by name or code
   * @returns {Promise<{data: Array, pagination: Object}>}
   */
  getRegions: async ({ page = 1, limit = 10, search } = {}) => {
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

    if (search && typeof search === "string" && search.trim()) {
      const searchPattern = search.trim();
      where.OR = [
        { name: { contains: searchPattern, mode: "insensitive" } },
        { code: { contains: searchPattern, mode: "insensitive" } },
      ];
    }

    // Get total
    const total = await prisma.region.count({ where });

    // Get paginated data
    const regions = await prisma.region.findMany({
      where,
      select: {
        ...regionSelect,
        _count: { select: { districts: true } },
      },
      orderBy: { name: "asc" },
      skip,
      take,
    });

    return {
      data: regions,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
      },
    };
  },

  getRegionById: async (id) => {
    if (!id || typeof id !== "string" || !id.trim()) {
      throw new Error("Region ID is required");
    }

    const region = await prisma.region.findUnique({
      where: { id: id.trim() },
      select: {
        ...regionSelect,
        districts: {
          select: {
            id: true,
            name: true,
            code: true,
            status: true,
            _count: {
              select: {
                zones: true,
                addresses: true,
              },
            },
            zones: {
              select: {
                id: true,
                name: true,
                code: true,
                status: true,
                _count: {
                  select: {
                    zoneBlocks: true,
                    addresses: true,
                  },
                },
                zoneBlocks: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                    status: true,
                    _count: {
                      select: { addresses: true },
                    },
                    addresses: {
                      select: {
                        id: true,
                        addressCode: true,
                        streetName: true,
                        description: true,
                        status: true,
                        createdAt: true,
                      },
                      orderBy: { addressCode: "asc" },
                    },
                  },
                  orderBy: { name: "asc" },
                },
              },
              orderBy: { name: "asc" },
            },
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
    if (!id || typeof id !== "string" || !id.trim()) {
      throw new Error("Region ID is required");
    }

    const existing = await prisma.region.findUnique({
      where: { id: id.trim() },
    });

    if (!existing) {
      throw new Error("Region not found");
    }

    if (name || code) {
      const checkName = name || existing.name;
      const checkCode = code || existing.code;
      if (!isValidSomaliRegion(checkName, checkCode)) {
        throw new Error(
          `"${checkName}" is not a recognized official administrative region of Somalia.`,
        );
      }
    }

    validateStatus(status);

    return prisma.region.update({
      where: { id: id.trim() },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(code !== undefined && { code: code.trim().toUpperCase() }),
        ...(status !== undefined && { status }),
      },
      select: regionSelect,
    });
  },

  deleteRegion: async (id) => {
    if (!id || typeof id !== "string" || !id.trim()) {
      throw new Error("Region ID is required");
    }

    const region = await prisma.region.findUnique({
      where: { id: id.trim() },
      include: { _count: { select: { districts: true } } },
    });

    if (!region) {
      throw new Error("Region not found");
    }

    if (region._count.districts > 0) {
      throw new Error(
        "Cannot delete region with existing districts. Remove districts first.",
      );
    }

    await prisma.region.delete({ where: { id: id.trim() } });

    return { id: id.trim() };
  },
};
