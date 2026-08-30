import { prisma } from "../db.js";
import { comparePassword, hashPassword } from "../utils/hash.utils.js";
import { generateToken } from "../utils/jwt.utils.js";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
};

export const AuthService = {
  registerUser: async ({ name, email, password, role }) => {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "DATA_OFFICER",
      },
      select: publicUserSelect,
    });

    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    return { user: newUser, token };
  },

  // Halkan la saxay: destructured { email, password } si uu object-ka req.body u qaato
  loginUser: async ({ email, password }) => {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      throw new Error("Invalid Password and Email");
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  },

  getUserProfile: async (userId) => {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: publicUserSelect,
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },
};