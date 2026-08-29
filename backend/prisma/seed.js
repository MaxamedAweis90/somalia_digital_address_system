import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Abuur Pg Pool iyo Prisma Adapter
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await hashPassword('Password123!');

  const user = await prisma.user.upsert({
    where: { email: 'admin@somalia.gov.so' },
    update: {},
    create: {
      name: "ahmed",
      email: 'admin@somalia.gov.so',
      password: hashedPassword,
      updatedAt: new Date(),
    },
  });

  console.log('✅ Seed Data Successfully Loaded! Admin User created:', user.email);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
    await prisma.$disconnect();
  });