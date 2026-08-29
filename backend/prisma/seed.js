import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/utils/hash.utils.js";

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL),
});

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
  const hashedPassword = await hashPassword("Password123!");

  const user = await withRetry(() =>
    prisma.user.upsert({
      where: { email: "admin@somalia.gov.so" },
      update: { role: "SYS_ADMIN" },
      create: {
        name: "ahmed",
        email: "admin@somalia.gov.so",
        password: hashedPassword,
        role: "SYS_ADMIN",
      },
    })
  );

  console.log("✅ Seed complete. Admin user:", user.email);
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error.message || error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
