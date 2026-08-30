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

  const collectorOne = await withRetry(() =>
    prisma.user.upsert({
      where: { email: "collector1@somalia.gov.so" },
      update: { role: "DATA_COLLECTOR", supervisorId: officerUser.id },
      create: {
        name: "Amina Collector",
        email: "collector1@somalia.gov.so",
        password: hashedPassword,
        role: "DATA_COLLECTOR",
        supervisorId: officerUser.id,
      },
    })
  );

  const collectorTwo = await withRetry(() =>
    prisma.user.upsert({
      where: { email: "collector2@somalia.gov.so" },
      update: { role: "DATA_COLLECTOR", supervisorId: officerUser.id },
      create: {
        name: "Hassan Collector",
        email: "collector2@somalia.gov.so",
        password: hashedPassword,
        role: "DATA_COLLECTOR",
        supervisorId: officerUser.id,
      },
    })
  );
  console.log("✅ Data Collectors seeded:", collectorOne.email, collectorTwo.email);

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

  const defaultSettings = [
    {
      key: "system_name",
      label: "System Name",
      value: "Somalia Digital Address System",
      description: "Official name displayed across the portal.",
      category: "general",
      type: "STRING",
    },
    {
      key: "support_email",
      label: "Support Email",
      value: "support@somalia.gov.so",
      description: "Contact email for registry support.",
      category: "general",
      type: "STRING",
    },
    {
      key: "dac_house_number_pad",
      label: "DAC House Number Padding",
      value: "4",
      description: "Number of digits used for the house segment in DAC codes.",
      category: "addressing",
      type: "NUMBER",
    },
    {
      key: "public_lookup_enabled",
      label: "Public Address Lookup",
      value: "true",
      description: "Allow citizens to search addresses on the public portal.",
      category: "addressing",
      type: "BOOLEAN",
    },
    {
      key: "default_map_latitude",
      label: "Default Map Latitude",
      value: "2.0469",
      description: "Default map center latitude (Mogadishu).",
      category: "maps",
      type: "NUMBER",
    },
    {
      key: "default_map_longitude",
      label: "Default Map Longitude",
      value: "45.3186",
      description: "Default map center longitude (Mogadishu).",
      category: "maps",
      type: "NUMBER",
    },
    {
      key: "maintenance_mode",
      label: "Maintenance Mode",
      value: "false",
      description: "When enabled, non-admin users see a maintenance notice.",
      category: "system",
      type: "BOOLEAN",
    },
  ];

  for (const setting of defaultSettings) {
    await withRetry(() =>
      prisma.appSetting.upsert({
        where: { key: setting.key },
        update: {
          label: setting.label,
          description: setting.description,
          category: setting.category,
          type: setting.type,
        },
        create: {
          ...setting,
          isSystem: true,
        },
      })
    );
  }

  console.log(`✅ ${defaultSettings.length} system settings seeded.`);

  const banaadir = await withRetry(() =>
    prisma.region.findUnique({ where: { code: "BND" } })
  );

  if (banaadir) {
    const district = await withRetry(() =>
      prisma.district.upsert({
        where: { code: "HOD" },
        update: { name: "Hodan", status: "ACTIVE", regionId: banaadir.id },
        create: {
          name: "Hodan",
          code: "HOD",
          status: "ACTIVE",
          regionId: banaadir.id,
        },
      })
    );

    const zoneGeometry = {
      type: "Polygon",
      coordinates: [
        [
          [45.308, 2.038],
          [45.328, 2.038],
          [45.328, 2.056],
          [45.308, 2.056],
          [45.308, 2.038],
        ],
      ],
    };

    const existingZone = await withRetry(() =>
      prisma.zone.findUnique({ where: { code: "TLX" } })
    );

    const zoneId = existingZone?.id || "seed-zone-taleex";

    if (existingZone) {
      await withRetry(() =>
        prisma.$executeRaw`
          UPDATE zones
          SET
            district_id = ${district.id},
            name = 'Taleex',
            status = 'ACTIVE'::"Status",
            geometry = ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(zoneGeometry)}), 4326),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${zoneId}
        `
      );
    } else {
      await withRetry(() =>
        prisma.$executeRaw`
          INSERT INTO zones (
            id,
            district_id,
            name,
            code,
            status,
            geometry,
            created_at,
            updated_at
          )
          VALUES (
            ${zoneId},
            ${district.id},
            'Taleex',
            'TLX',
            'ACTIVE'::"Status",
            ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(zoneGeometry)}), 4326),
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
        `
      );
    }

    const zoneBlockGeometry = {
      type: "Polygon",
      coordinates: [
        [
          [45.312, 2.042],
          [45.322, 2.042],
          [45.322, 2.052],
          [45.312, 2.052],
          [45.312, 2.042],
        ],
      ],
    };

    const existingZoneBlock = await withRetry(() =>
      prisma.zoneBlock.findUnique({ where: { code: "Z01" } })
    );

    const zoneBlockId = existingZoneBlock?.id || "seed-zone-block-z01";

    if (existingZoneBlock) {
      await withRetry(() =>
        prisma.$executeRaw`
          UPDATE zone_blocks
          SET
            zone_id = ${zoneId},
            name = 'Block 01',
            status = 'ACTIVE'::"Status",
            geometry = ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(zoneBlockGeometry)}), 4326),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${zoneBlockId}
        `
      );
    } else {
      await withRetry(() =>
        prisma.$executeRaw`
          INSERT INTO zone_blocks (
            id,
            zone_id,
            name,
            code,
            status,
            geometry,
            created_at,
            updated_at
          )
          VALUES (
            ${zoneBlockId},
            ${zoneId},
            'Block 01',
            'Z01',
            'ACTIVE'::"Status",
            ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(zoneBlockGeometry)}), 4326),
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
        `
      );
    }

    await withRetry(() =>
      prisma.assignment.upsert({
        where: { id: "seed-assignment-define-zone-blocks" },
        update: {
          type: "DEFINE_ZONE_BLOCKS",
          tier: "PARENT",
          status: "ASSIGNED",
          zoneId,
          zoneBlockId: null,
          assignedToId: officerUser.id,
          assignedById: adminUser.id,
          payload: { zoneBlocks: [] },
          notes: "Define remaining zone blocks inside the Taleex zone boundary.",
        },
        create: {
          id: "seed-assignment-define-zone-blocks",
          type: "DEFINE_ZONE_BLOCKS",
          tier: "PARENT",
          status: "ASSIGNED",
          zoneId,
          assignedToId: officerUser.id,
          assignedById: adminUser.id,
          payload: { zoneBlocks: [] },
          notes: "Define remaining zone blocks inside the Taleex zone boundary.",
        },
      })
    );

    await withRetry(() =>
      prisma.assignment.upsert({
        where: { id: "seed-child-define-zone-blocks-east" },
        update: {
          type: "DEFINE_ZONE_BLOCKS",
          tier: "CHILD",
          status: "ASSIGNED",
          parentAssignmentId: "seed-assignment-define-zone-blocks",
          zoneId,
          assignedToId: collectorOne.id,
          assignedById: officerUser.id,
          mergeOrder: 1,
          payload: { zoneBlocks: [] },
          notes: "East sector zone block boundaries.",
        },
        create: {
          id: "seed-child-define-zone-blocks-east",
          type: "DEFINE_ZONE_BLOCKS",
          tier: "CHILD",
          status: "ASSIGNED",
          parentAssignmentId: "seed-assignment-define-zone-blocks",
          zoneId,
          assignedToId: collectorOne.id,
          assignedById: officerUser.id,
          mergeOrder: 1,
          payload: { zoneBlocks: [] },
          notes: "East sector zone block boundaries.",
        },
      })
    );

    await withRetry(() =>
      prisma.assignment.upsert({
        where: { id: "seed-assignment-register-addresses" },
        update: {
          type: "REGISTER_ADDRESSES",
          tier: "PARENT",
          status: "ASSIGNED",
          zoneId,
          zoneBlockId,
          assignedToId: officerUser.id,
          assignedById: adminUser.id,
          payload: { addresses: [] },
          notes: "Register sample residential addresses inside Block 01.",
        },
        create: {
          id: "seed-assignment-register-addresses",
          type: "REGISTER_ADDRESSES",
          tier: "PARENT",
          status: "ASSIGNED",
          zoneId,
          zoneBlockId,
          assignedToId: officerUser.id,
          assignedById: adminUser.id,
          payload: { addresses: [] },
          notes: "Register sample residential addresses inside Block 01.",
        },
      })
    );

    console.log("✅ Demo zone, zone block, collectors, and assignments seeded for Hodan / Taleex.");
  }
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error.message || error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
