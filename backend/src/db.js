import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { logger, maskDatabaseUrl } from "./utils/logger.js";

const connectionString = process.env.DATABASE_URL;

const pool = new pg.Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on("error", (err) => {
  logger.warn("PostgreSQL pool background connection reset", err);
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

export async function connectDatabase() {
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  await prisma.$queryRaw`SELECT 1`;
  logger.info(`Database connected (${maskDatabaseUrl(connectionString)})`);
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
  await pool.end();
}
