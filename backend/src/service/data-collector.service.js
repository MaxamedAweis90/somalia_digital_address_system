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
      throw new Error("Provide at least one field to update: name, email, or password");
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

  getAllCollectors: async () => {
    return prisma.user.findMany({
      where: { role: DATA_COLLECTOR_ROLE },
      select: {
        ...collectorSelect,
        supervisor: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { name: "asc" },
    });
  },
};
