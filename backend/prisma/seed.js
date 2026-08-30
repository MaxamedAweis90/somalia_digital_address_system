import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/utils/hash.utils.js";

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL),
});

const SOMALI_OFFICIAL_REGIONS = [
  { name: "Awdal", code: "AWD" },
  { name: "Bakool", code: "BKL" },
  { name: "Banaadir", code: "BND" },
  { name: "Bari", code: "BAR" },
  { name: "Bay", code: "BAY" },
  { name: "Galguduud", code: "GLG" },
  { name: "Gedo", code: "GED" },
  { name: "Hiiraan", code: "HIR" },
  { name: "Jubbada Dhexe", code: "JDX" },
  { name: "Jubbada Hoose", code: "JHS" },
  { name: "Mudug", code: "MDG" },
  { name: "Nugaal", code: "NGL" },
  { name: "Sanaag", code: "SNG" },
  { name: "Shabeellaha Dhexe", code: "SDX" },
  { name: "Shabeellaha Hoose", code: "SHS" },
  { name: "Sool", code: "SOL" },
  { name: "Togdheer", code: "TGD" },
  { name: "Woqooyi Galbeed", code: "WQG" },
];

async function withRetry(operation, { retries = 3, delayMs = 2_000 } = {}) {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === retries || error.code !== "ETIMEDOUT") {
        throw error;
      }

      console.log(`Connection timed out. Retrying (${attempt}/${retries})...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

async function main() {
  console.log("🌱 Seeding database with Admin users and official Somali regions...");

  const hashedPassword = await hashPassword("Password123!");

  // 1. Seed Super Admin
  const adminUser = await withRetry(() =>
    prisma.user.upsert({
      where: { email: "admin@somalia.gov.so" },
      update: { role: "SYS_ADMIN" },
      create: {
        name: "Ahmed Admin",
        email: "admin@somalia.gov.so",
        password: hashedPassword,
        role: "SYS_ADMIN",
      },
    })
  );
  console.log("✅ Admin user seeded:", adminUser.email);

  // 2. Seed Data Officer
  const officerUser = await withRetry(() =>
    prisma.user.upsert({
      where: { email: "officer@somalia.gov.so" },
      update: { role: "DATA_OFFICER" },
      create: {
        name: "Farah Data Officer",
        email: "officer@somalia.gov.so",
        password: hashedPassword,
        role: "DATA_OFFICER",
      },
    })
  );
  console.log("✅ Data Officer user seeded:", officerUser.email);

  // 3. Seed 18 Official Somali Regions
  let createdCount = 0;
  for (const reg of SOMALI_OFFICIAL_REGIONS) {
    await withRetry(() =>
      prisma.region.upsert({
        where: { code: reg.code },
        update: { name: reg.name, status: "ACTIVE" },
        create: {
          name: reg.name,
          code: reg.code,
          status: "ACTIVE",
        },
      })
    );
    createdCount += 1;
  }
  console.log(`✅ ${createdCount} official Somali regions successfully seeded.`);
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error.message || error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
