import { prisma } from "../db.js";

const recentAddressSelect = {
  id: true,
  addressCode: true,
  streetName: true,
  status: true,
  createdAt: true,
  district: { select: { name: true } },
  zone: { select: { name: true } },
  zoneBlock: { select: { name: true } },
};

function serializeAddress(address) {
  return {
    ...address,
    districtName: address.district?.name,
    zoneName: address.zone?.name,
    zoneBlockName: address.zoneBlock?.name,
    district: undefined,
    zone: undefined,
    zoneBlock: undefined,
  };
}

function buildActivityFromAddress(address) {
  return {
    type: "ADDRESS_CREATED",
    title: "New address registered",
    description: `${address.addressCode} was added to the registry.`,
    timestamp: address.createdAt,
  };
}

function buildActivityFromZoneBlock(zoneBlock) {
  return {
    type: "ZONE_BLOCK_CREATED",
    title: "Zone block created",
    description: `${zoneBlock.name} (${zoneBlock.code}) was added to the registry.`,
    timestamp: zoneBlock.createdAt,
  };
}

function buildActivityFromZone(zone) {
  return {
    type: "ZONE_CREATED",
    title: "Zone added",
    description: `${zone.name} (${zone.code}) was registered.`,
    timestamp: zone.createdAt,
  };
}

export const DashboardService = {
  getSummary: async () => {
    const [
      regionCount,
      districtCount,
      zoneCount,
      zoneBlockCount,
      addressCount,
      recentAddresses,
      recentZoneBlocks,
      recentZones,
    ] = await Promise.all([
      prisma.region.count(),
      prisma.district.count(),
      prisma.zone.count(),
      prisma.zoneBlock.count(),
      prisma.address.count(),
      prisma.address.findMany({
        select: recentAddressSelect,
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.zoneBlock.findMany({
        select: { id: true, name: true, code: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.zone.findMany({
        select: { id: true, name: true, code: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const recentActivity = [
      ...recentAddresses.map(buildActivityFromAddress),
      ...recentZoneBlocks.map(buildActivityFromZoneBlock),
      ...recentZones.map(buildActivityFromZone),
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 8);

    return {
      counts: {
        regions: regionCount,
        districts: districtCount,
        zones: zoneCount,
        zoneBlocks: zoneBlockCount,
        addresses: addressCount,
      },
      recentAddresses: recentAddresses.map(serializeAddress),
      recentActivity,
    };
  },
};
