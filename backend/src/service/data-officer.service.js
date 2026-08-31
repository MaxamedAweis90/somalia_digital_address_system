import { prisma } from "../db.js";
import { hashPassword } from "../utils/hash.utils.js";
import { generateSecurePassword } from "../utils/password-generator.utils.js";
import {
  validateEmail,
  validateName,
  validatePassword,
} from "../utils/user-validation.utils.js";

const DATA_OFFICER_ROLE = "DATA_OFFICER";

const dataOfficerSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
};

async function findDataOfficerOrThrow(id) {
  if (!id || typeof id !== "string" || !id.trim()) {
    throw new Error("Data officer ID is required");
  }

  const user = await prisma.user.findUnique({
    where: { id: id.trim() },
    select: dataOfficerSelect,
  });

  if (!user) {
    throw new Error("Data officer not found");
  }

  if (user.role !== DATA_OFFICER_ROLE) {
    throw new Error("This account is not a data officer");
  }

  return user;
}

export const DataOfficerService = {
  createDataOfficer: async ({ name, email, password }) => {
    const validName = validateName(name);
    const validEmail = validateEmail(email);
    const validPassword = validatePassword(password);

    const existingUser = await prisma.user.findUnique({
      where: { email: validEmail },
    });

    if (existingUser) {
      throw new Error("An account with this email address already exists");
    }

    const hashedPassword = await hashPassword(validPassword);

    return prisma.user.create({
      data: {
        name: validName,
        email: validEmail,
        password: hashedPassword,
        role: DATA_OFFICER_ROLE,
      },
      select: dataOfficerSelect,
    });
  },

  /**
   * Get data officers with optional pagination and search
   * @param {Object} params
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @param {string} [params.search] - Search by name or email
   * @returns {Promise<{data: Array, pagination: Object}>}
   */
  getDataOfficers: async ({ page = 1, limit = 10, search } = {}) => {
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
    const where = { role: DATA_OFFICER_ROLE };

    if (search && typeof search === "string" && search.trim()) {
      const searchPattern = search.trim();
      where.OR = [
        { name: { contains: searchPattern, mode: "insensitive" } },
        { email: { contains: searchPattern, mode: "insensitive" } },
      ];
    }

    // Get total
    const total = await prisma.user.count({ where });

    // Get paginated data
    const officers = await prisma.user.findMany({
      where,
      select: dataOfficerSelect,
      orderBy: { name: "asc" },
      skip,
      take,
    });

    return {
      data: officers,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
      },
    };
  },

  getDataOfficerById: async (id) => {
    return findDataOfficerOrThrow(id);
  },

  updateDataOfficer: async (id, { name, email, password }) => {
    await findDataOfficerOrThrow(id);

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

    if (Object.keys(data).length === 0) {
      throw new Error(
        "Provide at least one field to update: name, email, or password",
      );
    }

    return prisma.user.update({
      where: { id },
      data,
      select: dataOfficerSelect,
    });
  },

  deleteDataOfficer: async (id, actorId) => {
    if (!id || typeof id !== "string" || !id.trim()) {
      throw new Error("Data officer ID is required");
    }
    if (!actorId || typeof actorId !== "string" || !actorId.trim()) {
      throw new Error("Actor ID is required");
    }
    if (id.trim() === actorId.trim()) {
      throw new Error("You cannot delete your own account");
    }

    await findDataOfficerOrThrow(id);

    await prisma.user.delete({ where: { id: id.trim() } });

    return { id: id.trim() };
  },

  regeneratePassword: async (id) => {
    const officer = await findDataOfficerOrThrow(id);
    const temporaryPassword = generateSecurePassword(12);

    await prisma.user.update({
      where: { id },
      data: {
        password: await hashPassword(temporaryPassword),
      },
    });

    return {
      officer,
      temporaryPassword,
    };
  },
};
