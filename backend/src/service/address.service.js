import { randomUUID } from "node:crypto";
import { prisma } from "../db.js";
import { buildDac, MAX_HOUSE_NUMBER } from "../utils/dac.utils.js";
import { formatLocation, parseLocation } from "../utils/location.utils.js";
import { validateStatus } from "../utils/validation.utils.js";

const addressSelect = {
  id: true,
  addressCode: true,
  districtId: true,
  neighborhoodId: true,
  zoneId: true,
  houseNumber: true,
  streetName: true,
  description: true,
  status: true,
  location: true,
  createdAt: true,
  updatedAt: true,
  district: {
    select: { id: true, name: true, code: true },
  },
  neighborhood: {
    select: { id: true, name: true, code: true },
  },
  zone: {
    select: { id: true, name: true, code: true },
  },
};

function serializeAddress(address) {
  if (!address) return address;

  return {
    ...address,
    houseNumber: address.houseNumber?.toString(),
  };
}

async function resolveHierarchy({ districtId, neighborhoodId, zoneId }) {
  if (!districtId || !neighborhoodId || !zoneId) {
    throw new Error("District, neighborhood, and zone are required");
  }

  const zone = await prisma.zone.findUnique({
    where: { id: zoneId },
    include: {
      neighborhood: {
        include: { district: true },
      },
    },
  });

  if (!zone) {
    throw new Error("Zone not found");
  }

  if (zone.neighborhoodId !== neighborhoodId) {
    throw new Error("Zone does not belong to the selected neighborhood");
  }

  if (zone.neighborhood.districtId !== districtId) {
    throw new Error("District does not match the selected zone hierarchy");
  }

  return {
    district: zone.neighborhood.district,
    neighborhood: zone.neighborhood,
    zone,
  };
}

async function getNextHouseNumber(zoneId) {
  const result = await prisma.address.aggregate({
    where: { zoneId },
    _max: { houseNumber: true },
  });

  const maxHouse = result._max.houseNumber ?? 0n;
  const nextHouse = maxHouse + 1n;

  if (nextHouse > BigInt(MAX_HOUSE_NUMBER)) {
    throw new Error(`Zone has reached the maximum house number (${MAX_HOUSE_NUMBER})`);
  }

  return nextHouse;
}

export const AddressService = {
  previewNextCode: async (zoneId) => {
    const zone = await prisma.zone.findUnique({
      where: { id: zoneId },
      include: {
        neighborhood: {
          include: { district: true },
        },
      },
    });

    if (!zone) {
      throw new Error("Zone not found");
    }

    const nextHouseNumber = await getNextHouseNumber(zoneId);
    const addressCode = buildDac({
      districtCode: zone.neighborhood.district.code,
      neighborhoodCode: zone.neighborhood.code,
      zoneCode: zone.code,
      houseNumber: nextHouseNumber.toString(),
    });

    return {
      addressCode,
      houseNumber: nextHouseNumber.toString(),
      district: {
        id: zone.neighborhood.district.id,
        name: zone.neighborhood.district.name,
        code: zone.neighborhood.district.code,
      },
      neighborhood: {
        id: zone.neighborhood.id,
        name: zone.neighborhood.name,
        code: zone.neighborhood.code,
      },
      zone: {
        id: zone.id,
        name: zone.name,
        code: zone.code,
      },
    };
  },

  createAddress: async ({
    districtId,
    neighborhoodId,
    zoneId,
    streetName,
    description,
    location,
    status,
    latitude,
    longitude,
  }) => {
    if (!streetName?.trim()) {
      throw new Error("Street name is required");
    }

    validateStatus(status);

    const { district, neighborhood, zone } = await resolveHierarchy({
      districtId,
      neighborhoodId,
      zoneId,
    });

    const normalizedLocation =
      latitude !== undefined && longitude !== undefined
        ? formatLocation(latitude, longitude)
        : formatLocation(...Object.values(parseLocation(location)));

    const houseNumber = await getNextHouseNumber(zoneId);
    const addressCode = buildDac({
      districtCode: district.code,
      neighborhoodCode: neighborhood.code,
      zoneCode: zone.code,
      houseNumber: houseNumber.toString(),
    });

    const address = await prisma.address.create({
      data: {
        id: randomUUID(),
        addressCode,
        districtId,
        neighborhoodId,
        zoneId,
        houseNumber,
        streetName: streetName.trim(),
        description: description?.trim() || "",
        status: status || "ACTIVE",
        location: normalizedLocation,
      },
      select: addressSelect,
    });

    return serializeAddress(address);
  },

  getAddresses: async ({ districtId, neighborhoodId, zoneId, search } = {}) => {
    const where = {};

    if (districtId) where.districtId = districtId;
    if (neighborhoodId) where.neighborhoodId = neighborhoodId;
    if (zoneId) where.zoneId = zoneId;

    if (search?.trim()) {
      const term = search.trim();
      where.OR = [
        { addressCode: { contains: term, mode: "insensitive" } },
        { streetName: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
        { district: { name: { contains: term, mode: "insensitive" } } },
        { neighborhood: { name: { contains: term, mode: "insensitive" } } },
        { zone: { name: { contains: term, mode: "insensitive" } } },
      ];
    }

    const addresses = await prisma.address.findMany({
      where,
      select: addressSelect,
      orderBy: { createdAt: "desc" },
    });

    return addresses.map(serializeAddress);
  },

  getAddressById: async (id) => {
    const address = await prisma.address.findUnique({
      where: { id },
      select: addressSelect,
    });

    if (!address) {
      throw new Error("Address not found");
    }

    return serializeAddress(address);
  },

  getAddressByCode: async (addressCode) => {
    const address = await prisma.address.findUnique({
      where: { addressCode: addressCode.trim().toUpperCase() },
      select: addressSelect,
    });

    if (!address) {
      throw new Error("Address not found");
    }

    return serializeAddress(address);
  },

  updateAddress: async (
    id,
    {
      districtId,
      neighborhoodId,
      zoneId,
      streetName,
      description,
      location,
      status,
      latitude,
      longitude,
    }
  ) => {
    const existing = await prisma.address.findUnique({ where: { id } });

    if (!existing) {
      throw new Error("Address not found");
    }

    validateStatus(status);

    const nextDistrictId = districtId ?? existing.districtId;
    const nextNeighborhoodId = neighborhoodId ?? existing.neighborhoodId;
    const nextZoneId = zoneId ?? existing.zoneId;

    const { district, neighborhood, zone } = await resolveHierarchy({
      districtId: nextDistrictId,
      neighborhoodId: nextNeighborhoodId,
      zoneId: nextZoneId,
    });

    let houseNumber = existing.houseNumber;
    let addressCode = existing.addressCode;

    if (nextZoneId !== existing.zoneId) {
      houseNumber = await getNextHouseNumber(nextZoneId);
      addressCode = buildDac({
        districtCode: district.code,
        neighborhoodCode: neighborhood.code,
        zoneCode: zone.code,
        houseNumber: houseNumber.toString(),
      });
    }

    const data = {
      districtId: nextDistrictId,
      neighborhoodId: nextNeighborhoodId,
      zoneId: nextZoneId,
      houseNumber,
      addressCode,
    };

    if (streetName !== undefined) {
      if (!streetName.trim()) {
        throw new Error("Street name is required");
      }
      data.streetName = streetName.trim();
    }

    if (description !== undefined) {
      data.description = description.trim();
    }

    if (status !== undefined) {
      data.status = status;
    }

    if (latitude !== undefined && longitude !== undefined) {
      data.location = formatLocation(latitude, longitude);
    } else if (location !== undefined) {
      data.location = formatLocation(...Object.values(parseLocation(location)));
    }

    const address = await prisma.address.update({
      where: { id },
      data,
      select: addressSelect,
    });

    return serializeAddress(address);
  },

  deleteAddress: async (id) => {
    const address = await prisma.address.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!address) {
      throw new Error("Address not found");
    }

    await prisma.address.delete({ where: { id } });

    return { id };
  },
};
