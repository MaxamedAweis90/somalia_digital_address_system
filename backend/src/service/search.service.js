import { prisma } from "../db.js";

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 20;

function parseLimit(value) {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

function buildTextFilter(query, fields) {
  const pattern = query.trim();
  return {
    OR: fields.map((field) => ({
      [field]: { contains: pattern, mode: "insensitive" },
    })),
  };
}

function mapRegion(item) {
  return {
    id: item.id,
    type: "region",
    title: item.name,
    subtitle: item.code,
    path: `/admin/regions/view/${item.id}`,
  };
}

function mapDistrict(item) {
  return {
    id: item.id,
    type: "district",
    title: item.name,
    subtitle: [item.code, item.region?.name].filter(Boolean).join(" · "),
    path: `/admin/districts/edit/${item.id}`,
  };
}

function mapZone(item) {
  return {
    id: item.id,
    type: "zone",
    title: item.name,
    subtitle: [item.code, item.district?.name].filter(Boolean).join(" · "),
    path: `/admin/zones/view/${item.id}`,
  };
}

function mapZoneBlock(item) {
  return {
    id: item.id,
    type: "zone_block",
    title: item.name,
    subtitle: [item.code, item.zone?.name, item.zone?.district?.name]
      .filter(Boolean)
      .join(" · "),
    path: `/admin/zone-blocks/view/${item.id}`,
  };
}

function mapAddress(item) {
  return {
    id: item.id,
    type: "address",
    title: item.addressCode,
    subtitle: [item.streetName, item.zoneBlock?.name, item.zone?.name]
      .filter(Boolean)
      .join(" · "),
    path: `/admin/addresses/view/${item.id}`,
  };
}

function mapStaff(item) {
  const isOfficer = item.role === "DATA_OFFICER";
  return {
    id: item.id,
    type: isOfficer ? "data_officer" : "data_collector",
    title: item.name,
    subtitle: [item.email, isOfficer ? "Data Officer" : "Data Collector"].join(" · "),
    path: isOfficer
      ? `/admin/data-officers/edit/${item.id}`
      : `/admin/data-collectors/${item.id}`,
  };
}

export const SearchService = {
  searchRegistry: async ({ query, limit = DEFAULT_LIMIT } = {}) => {
    const trimmed = typeof query === "string" ? query.trim() : "";
    if (!trimmed) {
      return {
        query: "",
        results: {
          regions: [],
          districts: [],
          zones: [],
          zoneBlocks: [],
          addresses: [],
          staff: [],
        },
        totals: {
          regions: 0,
          districts: 0,
          zones: 0,
          zoneBlocks: 0,
          addresses: 0,
          staff: 0,
        },
      };
    }

    const take = parseLimit(limit);
    const where = buildTextFilter(trimmed, ["name", "code"]);

    const [
      regions,
      regionTotal,
      districts,
      districtTotal,
      zones,
      zoneTotal,
      zoneBlocks,
      zoneBlockTotal,
      addresses,
      addressTotal,
      staff,
      staffTotal,
    ] = await Promise.all([
      prisma.region.findMany({
        where,
        select: { id: true, name: true, code: true },
        orderBy: { name: "asc" },
        take,
      }),
      prisma.region.count({ where }),
      prisma.district.findMany({
        where,
        select: {
          id: true,
          name: true,
          code: true,
          region: { select: { name: true } },
        },
        orderBy: { name: "asc" },
        take,
      }),
      prisma.district.count({ where }),
      prisma.zone.findMany({
        where,
        select: {
          id: true,
          name: true,
          code: true,
          district: { select: { name: true } },
        },
        orderBy: { name: "asc" },
        take,
      }),
      prisma.zone.count({ where }),
      prisma.zoneBlock.findMany({
        where,
        select: {
          id: true,
          name: true,
          code: true,
          zone: {
            select: {
              name: true,
              district: { select: { name: true } },
            },
          },
        },
        orderBy: { name: "asc" },
        take,
      }),
      prisma.zoneBlock.count({ where }),
      prisma.address.findMany({
        where: {
          OR: [
            { addressCode: { contains: trimmed, mode: "insensitive" } },
            { streetName: { contains: trimmed, mode: "insensitive" } },
            { description: { contains: trimmed, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          addressCode: true,
          streetName: true,
          zone: { select: { name: true } },
          zoneBlock: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take,
      }),
      prisma.address.count({
        where: {
          OR: [
            { addressCode: { contains: trimmed, mode: "insensitive" } },
            { streetName: { contains: trimmed, mode: "insensitive" } },
            { description: { contains: trimmed, mode: "insensitive" } },
          ],
        },
      }),
      prisma.user.findMany({
        where: {
          role: { in: ["DATA_OFFICER", "DATA_COLLECTOR"] },
          OR: [
            { name: { contains: trimmed, mode: "insensitive" } },
            { email: { contains: trimmed, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, email: true, role: true },
        orderBy: { name: "asc" },
        take,
      }),
      prisma.user.count({
        where: {
          role: { in: ["DATA_OFFICER", "DATA_COLLECTOR"] },
          OR: [
            { name: { contains: trimmed, mode: "insensitive" } },
            { email: { contains: trimmed, mode: "insensitive" } },
          ],
        },
      }),
    ]);

    return {
      query: trimmed,
      results: {
        regions: regions.map(mapRegion),
        districts: districts.map(mapDistrict),
        zones: zones.map(mapZone),
        zoneBlocks: zoneBlocks.map(mapZoneBlock),
        addresses: addresses.map(mapAddress),
        staff: staff.map(mapStaff),
      },
      totals: {
        regions: regionTotal,
        districts: districtTotal,
        zones: zoneTotal,
        zoneBlocks: zoneBlockTotal,
        addresses: addressTotal,
        staff: staffTotal,
      },
    };
  },
};
