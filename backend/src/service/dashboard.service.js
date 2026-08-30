import { prisma } from "../db.js";

const recentAddressSelect = {
  id: true,
  addressCode: true,
  streetName: true,
  status: true,
  createdAt: true,
  district: { select: { name: true } },
  neighborhood: { select: { name: true } },
  zone: { select: { name: true } },
};

function serializeAddress(address) {
  return {
    ...address,
    districtName: address.district?.name,
    neighborhoodName: address.neighborhood?.name,
    zoneName: address.zone?.name,
    district: undefined,
    neighborhood: undefined,
    zone: undefined,
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

function buildActivityFromZone(zone) {
  return {
    type: "ZONE_CREATED",
    title: "Zone created",
    description: `${zone.name} (${zone.code}) was added to the registry.`,
    timestamp: zone.createdAt,
  };
}

function buildActivityFromNeighborhood(neighborhood) {
  return {
    type: "NEIGHBORHOOD_CREATED",
    title: "Neighborhood added",
    description: `${neighborhood.name} (${neighborhood.code}) was registered.`,
    timestamp: neighborhood.createdAt,
  };
}

export const DashboardService = {
  getSummary: async () => {
    const [
      regionCount,
      districtCount,
      neighborhoodCount,
      zoneCount,
      addressCount,
      recentAddresses,
      recentZones,
      recentNeighborhoods,
    ] = await Promise.all([
      prisma.region.count(),
      prisma.district.count(),
      prisma.neighborhood.count(),
      prisma.zone.count(),
      prisma.address.count(),
      prisma.address.findMany({
        select: recentAddressSelect,
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.zone.findMany({
        select: { id: true, name: true, code: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.neighborhood.findMany({
        select: { id: true, name: true, code: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const recentActivity = [
      ...recentAddresses.map(buildActivityFromAddress),
      ...recentZones.map(buildActivityFromZone),
      ...recentNeighborhoods.map(buildActivityFromNeighborhood),
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 8);

    return {
      counts: {
        regions: regionCount,
        districts: districtCount,
        neighborhoods: neighborhoodCount,
        zones: zoneCount,
        addresses: addressCount,
      },
      recentAddresses: recentAddresses.map(serializeAddress),
      recentActivity,
    };
  },
};
