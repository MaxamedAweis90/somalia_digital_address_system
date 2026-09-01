import 'dotenv/config';
import pkg from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';

const { PrismaClient, UserRole, Status } = pkg;

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 Seeding started...');

  const defaultPassword = 'Password123!';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  // 1. Seed Users
  const adminUser = await prisma.user.upsert({
    where: { email: 'somaliadigitaladdress@gmail.com' },
    update: { name: 'Super Admin', role: UserRole.SYS_ADMIN },
    create: {
      email: 'somaliadigitaladdress@gmail.com',
      name: 'Super Admin',
      password: hashedPassword,
      role: UserRole.SYS_ADMIN,
    },
  });

  const officerUser = await prisma.user.upsert({
    where: { email: 'officer@sdas.gov.so' },
    update: { name: 'Field Officer', role: UserRole.DATA_OFFICER },
    create: {
      email: 'officer@sdas.gov.so',
      name: 'Field Officer',
      password: hashedPassword,
      role: UserRole.DATA_OFFICER,
    },
  });

  console.log(`✅ Users seeded: ${adminUser.email}, ${officerUser.email}`);

  // 2. Seed District
  const district = await prisma.district.upsert({
    where: { code: 'HOD' },
    update: { name: 'Hodan' },
    create: {
      code: 'HOD',
      name: 'Hodan',
      status: Status.ACTIVE,
    },
  });

  // 3. Seed Zone
  let zone = await prisma.zone.findUnique({ where: { code: 'HOD-TLX' } });
  if (!zone) {
    zone = await prisma.zone.create({
      data: {
        code: 'HOD-TLX',
        name: 'Taleex',
        districtId: district.id,
        status: Status.ACTIVE,
      },
    });
  } else {
    zone = await prisma.zone.update({
      where: { code: 'HOD-TLX' },
      data: { name: 'Taleex', districtId: district.id },
    });
  }

  // 4. Seed Zone Block
  let zoneBlock = await prisma.zoneBlock.findUnique({ where: { code: 'HOD-TLX-Z01' } });
  if (!zoneBlock) {
    // create using raw SQL due to Unsupported("geometry")
    await prisma.$executeRawUnsafe(`
      INSERT INTO zone_blocks (id, zone_id, name, code, status, geometry, created_at, updated_at)
      VALUES (
        gen_random_uuid()::text,
        $1,
        'Zone 01 Block A',
        'HOD-TLX-Z01',
        'ACTIVE',
        ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[45.3181, 2.0469], [45.3281, 2.0469], [45.3281, 2.0569], [45.3181, 2.0569], [45.3181, 2.0469]]]}'),
        NOW(),
        NOW()
      )
    `, zone.id);
    zoneBlock = await prisma.zoneBlock.findUnique({ where: { code: 'HOD-TLX-Z01' } });
  } else {
    await prisma.$executeRawUnsafe(`
      UPDATE zone_blocks 
      SET geometry = ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[45.3181, 2.0469], [45.3281, 2.0469], [45.3281, 2.0569], [45.3181, 2.0569], [45.3181, 2.0469]]]}')
      WHERE id = $1
    `, zoneBlock.id);
  }

  console.log(`✅ Hierarchy seeded: District(${district.code}) -> Zone(${zone.code}) -> Block(${zoneBlock.code})`);

  // 5. Seed Addresses
  const addressesToSeed = [
    { code: 'HOD-TLX-Z01-0001', street: 'Wadada Maka Al Mukarama', num: 1 },
    { code: 'HOD-TLX-Z01-0002', street: 'Wadada Maka Al Mukarama', num: 2 },
    { code: 'HOD-TLX-Z01-0003', street: 'Wadada Tarbuunka', num: 3 },
  ];

  for (const addr of addressesToSeed) {
    await prisma.address.upsert({
      where: { addressCode: addr.code },
      update: {
        streetName: addr.street,
        houseNumber: addr.num,
        districtId: district.id,
        zoneId: zone.id,
        zoneBlockId: zoneBlock.id,
      },
      create: {
        addressCode: addr.code,
        houseNumber: addr.num,
        streetName: addr.street,
        description: 'Seeded test address',
        location: '{"latitude": 2.0469, "longitude": 45.3181}',
        districtId: district.id,
        zoneId: zone.id,
        zoneBlockId: zoneBlock.id,
        status: Status.ACTIVE,
      },
    });
  }

  console.log(`✅ Addresses seeded: ${addressesToSeed.map(a => a.code).join(', ')}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });