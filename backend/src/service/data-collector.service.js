import { prisma } from "../db.js";
import { hashPassword } from "../utils/hash.utils.js";
import { generateSecurePassword } from "../utils/password-generator.utils.js";
import {
  validateEmail,
  validateName,
  validatePassword,
} from "../utils/user-validation.utils.js";
import { assertUserRole } from "../utils/assignment-access.utils.js";

const DATA_COLLECTOR_ROLE = "DATA_COLLECTOR";

const collectorSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  supervisorId: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
};

async function findCollectorForOfficer(id, officerId) {
  const collector = await prisma.user.findUnique({
    where: { id },
    select: collectorSelect,
  });

  if (!collector || collector.role !== DATA_COLLECTOR_ROLE) {
    throw new Error("Data collector not found");
  }

  if (collector.supervisorId !== officerId) {
    throw new Error("You do not have access to this collector");
  }

  return collector;
}

export const DataCollectorService = {
  createCollector: async (officerId, { name, email, password }) => {
    await assertUserRole(officerId, "DATA_OFFICER");

    const validName = validateName(name);
    const validEmail = validateEmail(email);
    const validPassword = validatePassword(password);

    const existingUser = await prisma.user.findUnique({
      where: { email: validEmail },
    });

    if (existingUser) {
      throw new Error("An account with this email address already exists");
    }

    return prisma.user.create({
      data: {
        name: validName,
        email: validEmail,
        password: await hashPassword(validPassword),
        role: DATA_COLLECTOR_ROLE,
        supervisorId: officerId,
      },
      select: collectorSelect,
    });
  },

  getCollectorsForOfficer: async (officerId) => {
    await assertUserRole(officerId, "DATA_OFFICER");

    return prisma.user.findMany({
      where: {
        role: DATA_COLLECTOR_ROLE,
        supervisorId: officerId,
      },
      select: collectorSelect,
      orderBy: { name: "asc" },
    });
  },

  getCollectorById: async (id, officerId) => {
    return findCollectorForOfficer(id, officerId);
  },

  updateCollector: async (id, officerId, { name, email, password }) => {
    await findCollectorForOfficer(id, officerId);

    const data = {};

    if (name !== undefined) {
      data.name = validateName(name);
    }

    if (email !== undefined) {
      const validEmail = validateEmail(email);
      const existingUser = await prisma.user.findUnique({
        where: { email: validEmail },
      });

      if (existingUser && existingUser.id !== id) {
        throw new Error("An account with this email address already exists");
      }

      data.email = validEmail;
    }

    if (password !== undefined && password !== null && password !== "") {
      data.password = await hashPassword(validatePassword(password));
    }

    if (!Object.keys(data).length) {
      throw new Error(
        "Provide at least one field to update: name, email, or password",
      );
    }

    return prisma.user.update({
      where: { id },
      data,
      select: collectorSelect,
    });
  },

  regeneratePassword: async (id, officerId) => {
    const collector = await findCollectorForOfficer(id, officerId);
    const temporaryPassword = generateSecurePassword(12);

    await prisma.user.update({
      where: { id },
      data: {
        password: await hashPassword(temporaryPassword),
      },
    });

    return { collector, temporaryPassword };
  },

  /**
   * Get all data collectors with optional pagination
   * @param {Object} params
   * @param {number} [params.page=1] - Page number (1-indexed)
   * @param {number} [params.limit=10] - Items per page
   * @param {string} [params.search] - Optional search query (name or email)
   * @returns {Promise<{data: Array, pagination: Object}>} Collectors and pagination metadata
   */
  getAllCollectors: async ({ page = 1, limit = 10, search } = {}) => {
    // Robust parsing to prevent NaN/invalid inputs
    let parsedPage = parseInt(page, 10);
    let parsedLimit = parseInt(limit, 10);

    if (isNaN(parsedPage) || parsedPage < 1) {
      parsedPage = 1;
    }
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      parsedLimit = 10;
    }

    // Enforce reasonable limits
    if (parsedLimit > 100) {
      parsedLimit = 100;
    }

    const skip = (parsedPage - 1) * parsedLimit;
    const take = parsedLimit;

    // Build filter criteria
    const where = { role: DATA_COLLECTOR_ROLE };

    if (search && typeof search === "string" && search.trim()) {
      const searchPattern = search.trim();
      where.OR = [
        { name: { contains: searchPattern, mode: "insensitive" } },
        { email: { contains: searchPattern, mode: "insensitive" } },
        {
          supervisor: {
            OR: [
              { name: { contains: searchPattern, mode: "insensitive" } },
              { email: { contains: searchPattern, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    // Get total count
    const total = await prisma.user.count({ where });

    // Get paginated data
    const collectors = await prisma.user.findMany({
      where,
      select: {
        ...collectorSelect,
        supervisor: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { name: "asc" },
      skip,
      take,
    });

    return {
      data: collectors,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
      },
    };
  },

  createCollectorAdmin: async ({ name, email, password, supervisorId }) => {
    if (!supervisorId) {
      throw new Error("Supervising data officer is required");
    }

    await assertUserRole(supervisorId, "DATA_OFFICER");

    const validName = validateName(name);
    const validEmail = validateEmail(email);
    const validPassword = validatePassword(password);

    const existingUser = await prisma.user.findUnique({
      where: { email: validEmail },
    });

    if (existingUser) {
      throw new Error("An account with this email address already exists");
    }

    return prisma.user.create({
      data: {
        name: validName,
        email: validEmail,
        password: await hashPassword(validPassword),
        role: DATA_COLLECTOR_ROLE,
        supervisorId,
      },
      select: {
        ...collectorSelect,
        supervisor: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  },

  getCollectorByIdAdmin: async (id) => {
    if (!id || typeof id !== "string" || !id.trim()) {
      throw new Error("Collector ID is required");
    }

    const collector = await prisma.user.findUnique({
      where: { id: id.trim() },
      select: {
        ...collectorSelect,
        supervisor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!collector || collector.role !== DATA_COLLECTOR_ROLE) {
      throw new Error("Data collector not found");
    }

    return collector;
  },

  updateCollectorAdmin: async (id, { name, email, password, supervisorId }) => {
    if (!id || typeof id !== "string" || !id.trim()) {
      throw new Error("Collector ID is required");
    }

    const cleanId = id.trim();
    const existingCollector = await prisma.user.findUnique({
      where: { id: cleanId },
    });

    if (!existingCollector || existingCollector.role !== DATA_COLLECTOR_ROLE) {
      throw new Error("Data collector not found");
    }

    const data = {};

    if (supervisorId !== undefined) {
      if (!supervisorId) {
        throw new Error("Supervising data officer is required");
      }
      await assertUserRole(supervisorId, "DATA_OFFICER");
      data.supervisorId = supervisorId;
    }

    if (name !== undefined) {
      data.name = validateName(name);
    }

    if (email !== undefined) {
      const validEmail = validateEmail(email);
      const existingUser = await prisma.user.findUnique({
        where: { email: validEmail },
      });

      if (existingUser && existingUser.id !== cleanId) {
        throw new Error("An account with this email address already exists");
      }

      data.email = validEmail;
    }

    if (password !== undefined && password !== null && password !== "") {
      data.password = await hashPassword(validatePassword(password));
    }

    if (!Object.keys(data).length) {
      throw new Error(
        "Provide at least one field to update: name, email, password, or supervisorId",
      );
    }

    return prisma.user.update({
      where: { id: cleanId },
      data,
      select: {
        ...collectorSelect,
        supervisor: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  },

  deleteCollectorAdmin: async (id) => {
    if (!id || typeof id !== "string" || !id.trim()) {
      throw new Error("Collector ID is required");
    }

    const cleanId = id.trim();
    const collector = await prisma.user.findUnique({
      where: { id: cleanId },
    });

    if (!collector || collector.role !== DATA_COLLECTOR_ROLE) {
      throw new Error("Data collector not found");
    }

    let activeAssignmentsCount = 0;
    try {
      activeAssignmentsCount = await prisma.assignment.count({
        where: {
          assignedToId: cleanId,
          status: { notIn: ["APPROVED", "REJECTED"] },
        },
      });
    } catch {
      activeAssignmentsCount = 0;
    }

    if (activeAssignmentsCount > 0) {
      throw new Error("Cannot delete data collector with active assignments");
    }

    await prisma.user.delete({ where: { id: cleanId } });

    return { id: cleanId };
  },

  regeneratePasswordAdmin: async (id) => {
    if (!id || typeof id !== "string" || !id.trim()) {
      throw new Error("Collector ID is required");
    }

    const cleanId = id.trim();
    const collector = await prisma.user.findUnique({
      where: { id: cleanId },
      select: {
        ...collectorSelect,
        supervisor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!collector || collector.role !== DATA_COLLECTOR_ROLE) {
      throw new Error("Data collector not found");
    }

    const temporaryPassword = generateSecurePassword(12);

    await prisma.user.update({
      where: { id: cleanId },
      data: {
        password: await hashPassword(temporaryPassword),
      },
    });

    return { collector, temporaryPassword };
  },
};
