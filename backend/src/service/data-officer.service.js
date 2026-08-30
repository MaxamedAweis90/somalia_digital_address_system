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
  const user = await prisma.user.findUnique({
    where: { id },
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

  getDataOfficers: async () => {
    return prisma.user.findMany({
      where: { role: DATA_OFFICER_ROLE },
      select: dataOfficerSelect,
      orderBy: { name: "asc" },
    });
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
      throw new Error("Provide at least one field to update: name, email, or password");
    }

    return prisma.user.update({
      where: { id },
      data,
      select: dataOfficerSelect,
    });
  },

  deleteDataOfficer: async (id, actorId) => {
    if (id === actorId) {
      throw new Error("You cannot delete your own account");
    }

    await findDataOfficerOrThrow(id);

    await prisma.user.delete({ where: { id } });

    return { id };
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
