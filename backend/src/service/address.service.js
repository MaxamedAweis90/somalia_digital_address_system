import { prisma } from "../db.js";
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
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
  neighborhood: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
  zone: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
};

const formatAddress = (address) => {
  if (!address) return null;
  return {
    ...address,
    houseNumber: address.houseNumber.toString(),
  };
};

const validateHierarchy = async (districtId, neighborhoodId, zoneId) => {
  const zone = await prisma.zone.findUnique({
    where: { id: zoneId },
    include: {
      neighborhood: {
        include: {
          district: true,
        },
      },
    },
  });

  if (!zone) {
    throw new Error("Zone not found");
  }

  if (zone.neighborhoodId !== neighborhoodId) {
    throw new Error("Selected zone does not belong to the selected neighborhood");
  }

  if (zone.neighborhood.districtId !== districtId) {
    throw new Error("Selected neighborhood does not belong to the selected district");
  }

  return {
    districtCode: zone.neighborhood.district.code,
    neighborhoodCode: zone.neighborhood.code,
    zoneCode: zone.code,
  };
};

export const AddressService = {
  createAddress: async ({
    districtId,
    neighborhoodId,
    zoneId,
    houseNumber,
    streetName,
    description,
    status,
    location,
  }) => {
    if (
      !districtId ||
      !neighborhoodId ||
      !zoneId ||
      houseNumber === undefined ||
      houseNumber === null ||
      !streetName?.trim() ||
      !description?.trim() ||
      !location?.trim()
    ) {
      throw new Error(
        "District, neighborhood, zone, house number, street name, description, and location are required"
      );
    }

    validateStatus(status);

    const numericHouseNumber = parseInt(houseNumber);
    if (isNaN(numericHouseNumber) || numericHouseNumber <= 0) {
      throw new Error("House number must be a positive integer");
    }

    // Validate geographic hierarchy and get codes for DAC generation
    const codes = await validateHierarchy(districtId, neighborhoodId, zoneId);

    // Generate automatic addressCode (DAC)
    const padNumber = String(numericHouseNumber).padStart(4, "0");
    const addressCode = `${codes.districtCode.toUpperCase()}-${codes.neighborhoodCode.toUpperCase()}-${codes.zoneCode.toUpperCase()}-${padNumber}`;

    // Verify addressCode uniqueness
    const existingAddress = await prisma.address.findUnique({
      where: { addressCode },
    });

    if (existingAddress) {
      throw new Error("An address with this addressCode already exists");
    }

    const address = await prisma.address.create({
      data: {
        districtId,
        neighborhoodId,
        zoneId,
        addressCode,
        houseNumber: BigInt(numericHouseNumber),
        streetName: streetName.trim(),
        description: description.trim(),
        status: status || "ACTIVE",
        location: location.trim(),
      },
      select: addressSelect,
    });

    return formatAddress(address);
  },

  getAddresses: async (query = {}) => {
    const {
      districtId,
      neighborhoodId,
      zoneId,
      addressCode,
      streetName,
      status,
      search,
      page = 1,
      limit = 20,
    } = query;

    const pageNumber = Math.max(1, parseInt(page) || 1);
    const limitNumber = Math.max(1, parseInt(limit) || 20);
    const skip = (pageNumber - 1) * limitNumber;

    const where = {
      ...(districtId && { districtId }),
      ...(neighborhoodId && { neighborhoodId }),
      ...(zoneId && { zoneId }),
      ...(status && { status }),
      ...(addressCode && { addressCode: { contains: addressCode, mode: "insensitive" } }),
      ...(streetName && { streetName: { contains: streetName, mode: "insensitive" } }),
      ...(search && {
        OR: [
          { addressCode: { contains: search, mode: "insensitive" } },
          { streetName: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const items = await prisma.address.findMany({
      where,
      skip,
      take: limitNumber,
      orderBy: { addressCode: "asc" },
      select: addressSelect,
    });
    const total = await prisma.address.count({ where });

    return {
      items: items.map(formatAddress),
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    };
  },

  getAddressById: async (id) => {
    if (!id) {
      throw new Error("Address ID is required");
    }

    const address = await prisma.address.findUnique({
      where: { id },
      select: addressSelect,
    });

    if (!address) {
      throw new Error("Address not found");
    }

    return formatAddress(address);
  },

  updateAddress: async (
    id,
    {
      districtId,
      neighborhoodId,
      zoneId,
      houseNumber,
      streetName,
      description,
      status,
      location,
    }
  ) => {
    const existing = await prisma.address.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error("Address not found");
    }

    validateStatus(status);

    const mergedDistrictId = districtId || existing.districtId;
    const mergedNeighborhoodId = neighborhoodId || existing.neighborhoodId;
    const mergedZoneId = zoneId || existing.zoneId;
    const mergedHouseNumber =
      houseNumber !== undefined && houseNumber !== null
        ? parseInt(houseNumber)
        : Number(existing.houseNumber);

    if (isNaN(mergedHouseNumber) || mergedHouseNumber <= 0) {
      throw new Error("House number must be a positive integer");
    }

    let addressCode = existing.addressCode;

    // If any part of the hierarchy or the house number changes, validate and regenerate DAC
    if (
      districtId ||
      neighborhoodId ||
      zoneId ||
      (houseNumber !== undefined && houseNumber !== null)
    ) {
      const codes = await validateHierarchy(
        mergedDistrictId,
        mergedNeighborhoodId,
        mergedZoneId
      );

      const padNumber = String(mergedHouseNumber).padStart(4, "0");
      addressCode = `${codes.districtCode.toUpperCase()}-${codes.neighborhoodCode.toUpperCase()}-${codes.zoneCode.toUpperCase()}-${padNumber}`;

      if (addressCode !== existing.addressCode) {
        const existingAddress = await prisma.address.findUnique({
          where: { addressCode },
        });

        if (existingAddress) {
          throw new Error("An address with this addressCode already exists");
        }
      }
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        districtId: mergedDistrictId,
        neighborhoodId: mergedNeighborhoodId,
        zoneId: mergedZoneId,
        addressCode,
        houseNumber: BigInt(mergedHouseNumber),
        ...(streetName !== undefined && { streetName: streetName.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(status !== undefined && { status }),
        ...(location !== undefined && { location: location.trim() }),
      },
      select: addressSelect,
    });

    return formatAddress(address);
  },

  deleteAddress: async (id) => {
    const address = await prisma.address.findUnique({
      where: { id },
    });

    if (!address) {
      throw new Error("Address not found");
    }

    await prisma.address.delete({
      where: { id },
    });

    return { id };
  },
};
