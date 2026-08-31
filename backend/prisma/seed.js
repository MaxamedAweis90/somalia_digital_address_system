import 'dotenv/config';
import pkg from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';

const { PrismaClient, UserRole } = pkg;

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 User Seeding-ka waa la bilaabay...');

  const defaultPassword = 'Password123!';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@sdas.gov.so' },
    update: {
      name: 'Super Admin',
      role: UserRole.ADMIN,
    },
    create: {
      email: 'admin@sdas.gov.so',
      name: 'Super Admin',
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  });

  const officerUser = await prisma.user.upsert({
    where: { email: 'officer@sdas.gov.so' },
    update: {
      name: 'Field Officer',
      role: UserRole.FIELD_OFFICER, // Ama UserRole.USER (sida ay schema-kaaga ku taallay)
    },
    create: {
      email: 'officer@sdas.gov.so',
      name: 'Field Officer',
      password: hashedPassword,
      role: UserRole.FIELD_OFFICER,
    },
  });

  console.log(`✅ User-ka si guul leh ayaa loo seed-gareeyay: ${adminUser.email}`);
  console.log('🔑 Password-ka ku meel gaarka ah:', defaultPassword);
}

main()
  .catch((e) => {
    console.error('❌ Dhibaatada ka dhacday seeding-ka user-ka:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });