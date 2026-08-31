import { randomUUID } from "node:crypto";
import { prisma } from "../db.js";
import { buildDac, MAX_HOUSE_NUMBER } from "../utils/dac.utils.js";
import { formatLocation, parseLocation } from "../utils/location.utils.js";
import { getSettingValue } from "../utils/settings.utils.js";
import { validateStatus } from "../utils/validation.utils.js";

const addressSelect = {
  id: true,
  addressCode: true,
  districtId: true,
  zoneId: true,
  zoneBlockId: true,
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
  zone: {
    select: { id: true, name: true, code: true },
  },
  zoneBlock: {
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

async function resolveHierarchy({ districtId, zoneId, zoneBlockId }) {
  if (!districtId || !zoneId || !zoneBlockId) {
    throw new Error("District, zone, and zone block are required");
  }

  const zoneBlock = await prisma.zoneBlock.findUnique({
    where: { id: zoneBlockId },
    include: {
      zone: {
        include: { district: true },
      },
    },
  });

  if (!zoneBlock) {
    throw new Error("Zone block not found");
  }

  if (zoneBlock.zoneId !== zoneId) {
    throw new Error("Zone block does not belong to the selected zone");
  }

  if (zoneBlock.zone.districtId !== districtId) {
    throw new Error("District does not match the selected zone block hierarchy");
  }

  return {
    district: zoneBlock.zone.district,
    zone: zoneBlock.zone,
    zoneBlock,
  };
}

async function getHouseNumberPad() {
  const pad = await getSettingValue("dac_house_number_pad", 4);
  const numeric = Number(pad);
  return Number.isInteger(numeric) && numeric > 0 ? numeric : 4;
}

async function getNextHouseNumber(zoneBlockId, client = prisma) {
  const result = await client.address.aggregate({
    where: { zoneBlockId },
    _max: { houseNumber: true },
  });

  const maxHouse = result._max.houseNumber ?? 0n;
  const nextHouse = maxHouse + 1n;

  if (nextHouse > BigInt(MAX_HOUSE_NUMBER)) {
    throw new Error(`Zone block has reached the maximum house number (${MAX_HOUSE_NUMBER})`);
  }

  return nextHouse;
}

async function createAddressRecord(
  {
    districtId,
    zoneId,
    zoneBlockId,
    streetName,
    description,
    latitude,
    longitude,
    status,
    houseNumber,
    addressCode,
  },
  client = prisma
) {
  const address = await client.address.create({
    data: {
      id: randomUUID(),
      addressCode,
      districtId,
      zoneId,
      zoneBlockId,
      houseNumber,
      streetName: streetName.trim(),
      description: description?.trim() || "",
      status: status || "ACTIVE",
      location: formatLocation(latitude, longitude),
    },
    select: addressSelect,
  });

  return serializeAddress(address);
}

export const AddressService = {
  previewNextCode: async (zoneBlockId) => {
    const zoneBlock = await prisma.zoneBlock.findUnique({
      where: { id: zoneBlockId },
      include: {
        zone: {
          include: { district: true },
        },
      },
    });

    if (!zoneBlock) {
      throw new Error("Zone block not found");
    }

    const nextHouseNumber = await getNextHouseNumber(zoneBlockId);
    const pad = await getHouseNumberPad();
    const addressCode = buildDac(
      {
        districtCode: zoneBlock.zone.district.code,
        zoneCode: zoneBlock.zone.code,
        zoneBlockCode: zoneBlock.code,
        houseNumber: nextHouseNumber.toString(),
      },
      pad
    );

    return {
      addressCode,
      houseNumber: nextHouseNumber.toString(),
      district: {
        id: zoneBlock.zone.district.id,
        name: zoneBlock.zone.district.name,
        code: zoneBlock.zone.district.code,
      },
      zone: {
        id: zoneBlock.zone.id,
        name: zoneBlock.zone.name,
        code: zoneBlock.zone.code,
      },
      zoneBlock: {
        id: zoneBlock.id,
        name: zoneBlock.name,
        code: zoneBlock.code,
      },
    };
  },

  createAddress: async ({
    districtId,
    zoneId,
    zoneBlockId,
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

    const { district, zone, zoneBlock } = await resolveHierarchy({
      districtId,
      zoneId,
      zoneBlockId,
    });

    const normalizedLocation =
      latitude !== undefined && longitude !== undefined
        ? formatLocation(latitude, longitude)
        : formatLocation(...Object.values(parseLocation(location)));

    const houseNumber = await getNextHouseNumber(zoneBlockId);
    const pad = await getHouseNumberPad();
    const addressCode = buildDac(
      {
        districtCode: district.code,
        zoneCode: zone.code,
        zoneBlockCode: zoneBlock.code,
        houseNumber: houseNumber.toString(),
      },
      pad
    );

    return createAddressRecord({
      districtId,
      zoneId,
      zoneBlockId,
      streetName,
      description,
      latitude: latitude ?? parseLocation(normalizedLocation).latitude,
      longitude: longitude ?? parseLocation(normalizedLocation).longitude,
      status,
      houseNumber,
      addressCode,
    });
  },

  createAddressFromDraft: async ({
    zoneBlockId,
    streetName,
    description,
    latitude,
    longitude,
    status = "ACTIVE",
  }) => {
    if (!streetName?.trim()) {
      throw new Error("Street name is required");
    }

    if (latitude === undefined || longitude === undefined) {
      throw new Error("GPS coordinates are required");
    }

    const zoneBlock = await prisma.zoneBlock.findUnique({
      where: { id: zoneBlockId },
      include: {
        zone: {
          include: { district: true },
        },
      },
    });

    if (!zoneBlock) {
      throw new Error("Zone block not found");
    }

    const houseNumber = await getNextHouseNumber(zoneBlockId);
    const pad = await getHouseNumberPad();
    const addressCode = buildDac(
      {
        districtCode: zoneBlock.zone.district.code,
        zoneCode: zoneBlock.zone.code,
        zoneBlockCode: zoneBlock.code,
        houseNumber: houseNumber.toString(),
      },
      pad
    );

    return createAddressRecord({
      districtId: zoneBlock.zone.districtId,
      zoneId: zoneBlock.zoneId,
      zoneBlockId,
      streetName,
      description,
      latitude,
      longitude,
      status,
      houseNumber,
      addressCode,
    });
  },

  createAddressesFromDraftBatch: async (zoneBlockId, addresses) =>
    AddressService.createAddressesFromDraftBatches([
      { zoneBlockId, addresses },
    ]),

  createAddressesFromDraftBatches: async (batches) => {
    return prisma.$transaction(async (tx) => {
      const created = [];
      const pad = await getHouseNumberPad();
      const orderedBatches = [...batches].sort((a, b) =>
        a.zoneBlockId.localeCompare(b.zoneBlockId)
      );

      for (const batch of orderedBatches) {
        await tx.$queryRaw`
          SELECT id FROM zone_blocks WHERE id = ${batch.zoneBlockId} FOR UPDATE
        `;

        const zoneBlock = await tx.zoneBlock.findUnique({
          where: { id: batch.zoneBlockId },
          include: {
            zone: {
              include: { district: true },
            },
          },
        });

        if (!zoneBlock) {
          throw new Error("Zone block not found");
        }

        let nextHouse = await getNextHouseNumber(batch.zoneBlockId, tx);

        for (const address of batch.addresses) {
          if (!address.streetName?.trim()) {
            throw new Error("Street name is required for every address");
          }

          if (address.latitude === undefined || address.longitude === undefined) {
            throw new Error("GPS coordinates are required for every address");
          }

          const addressCode = buildDac(
            {
              districtCode: zoneBlock.zone.district.code,
              zoneCode: zoneBlock.zone.code,
              zoneBlockCode: zoneBlock.code,
              houseNumber: nextHouse.toString(),
            },
            pad
          );

          const createdAddress = await createAddressRecord(
            {
              districtId: zoneBlock.zone.districtId,
              zoneId: zoneBlock.zoneId,
              zoneBlockId: batch.zoneBlockId,
              streetName: address.streetName,
              description: address.description,
              latitude: address.latitude,
              longitude: address.longitude,
              status: "ACTIVE",
              houseNumber: nextHouse,
              addressCode,
            },
            tx
          );

          created.push(createdAddress);
          nextHouse += 1n;

          if (nextHouse > BigInt(MAX_HOUSE_NUMBER)) {
            throw new Error(`Zone block has reached the maximum house number (${MAX_HOUSE_NUMBER})`);
          }
        }
      }

      return created;
    });
  },

  /**
   * Get addresses with optional pagination, filtering, and search
   * @param {Object} params
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @param {string} [params.districtId] - Filter by district
   * @param {string} [params.zoneId] - Filter by zone
   * @param {string} [params.zoneBlockId] - Filter by zone block
   * @param {string} [params.search] - Search by code, street, description, etc.
   * @returns {Promise<{data: Array, pagination: Object}>}
   */
  getAddresses: async ({
    page = 1,
    limit = 10,
    districtId,
    zoneId,
    zoneBlockId,
    search,
  } = {}) => {
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

    if (districtId) where.districtId = districtId;
    if (zoneId) where.zoneId = zoneId;
    if (zoneBlockId) where.zoneBlockId = zoneBlockId;

    if (search && typeof search === "string" && search.trim()) {
      const term = search.trim();
      where.OR = [
        { addressCode: { contains: term, mode: "insensitive" } },
        { streetName: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
        { district: { name: { contains: term, mode: "insensitive" } } },
        { zone: { name: { contains: term, mode: "insensitive" } } },
        { zoneBlock: { name: { contains: term, mode: "insensitive" } } },
      ];
    }

    // Get total count
    const total = await prisma.address.count({ where });

    // Get paginated data
    const addresses = await prisma.address.findMany({
      where,
      select: addressSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });

    return {
      data: addresses,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
      },
    };
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
      zoneId,
      zoneBlockId,
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
    const nextZoneId = zoneId ?? existing.zoneId;
    const nextZoneBlockId = zoneBlockId ?? existing.zoneBlockId;

    const { district, zone, zoneBlock } = await resolveHierarchy({
      districtId: nextDistrictId,
      zoneId: nextZoneId,
      zoneBlockId: nextZoneBlockId,
    });

    let houseNumber = existing.houseNumber;
    let addressCode = existing.addressCode;

    if (nextZoneBlockId !== existing.zoneBlockId) {
      houseNumber = await getNextHouseNumber(nextZoneBlockId);
      const pad = await getHouseNumberPad();
      addressCode = buildDac(
        {
          districtCode: district.code,
          zoneCode: zone.code,
          zoneBlockCode: zoneBlock.code,
          houseNumber: houseNumber.toString(),
        },
        pad
      );
    }

    const data = {
      districtId: nextDistrictId,
      zoneId: nextZoneId,
      zoneBlockId: nextZoneBlockId,
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
