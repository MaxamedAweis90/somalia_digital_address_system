import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { hashPassword } from '../src/utils/hash.utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Isticmaal DIRECT_URL ama DATABASE_URL
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("❌ DATABASE_URL ama DIRECT_URL lagama helin .env faylka!");
}

// SSL configuration-ka loo baahan yahay marka `pg` la isticmaalayo Neon DB
const pool = new pg.Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await hashPassword('Password123!');

  const user = await prisma.user.upsert({
    where: { email: 'admin@somalia.gov.so' },
    update: {},
    create: {
      name: 'Ahmed Shire',
      email: 'admin@somalia.gov.so',
      password: hashedPassword,
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