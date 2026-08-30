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

    const neighborhoodGeometry = {
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

    const existingNeighborhood = await withRetry(() =>
      prisma.neighborhood.findUnique({ where: { code: "TLX" } })
    );

    const neighborhoodId = existingNeighborhood?.id || "seed-neighborhood-taleex";

    if (existingNeighborhood) {
      await withRetry(() =>
        prisma.$executeRaw`
          UPDATE neighborhoods
          SET
            district_id = ${district.id},
            name = 'Taleex',
            status = 'ACTIVE'::"Status",
            geometry = ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(neighborhoodGeometry)}), 4326),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${neighborhoodId}
        `
      );
    } else {
      await withRetry(() =>
        prisma.$executeRaw`
          INSERT INTO neighborhoods (
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
            ${neighborhoodId},
            ${district.id},
            'Taleex',
            'TLX',
            'ACTIVE'::"Status",
            ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(neighborhoodGeometry)}), 4326),
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
        `
      );
    }

    const zoneGeometry = {
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

    const existingZone = await withRetry(() =>
      prisma.zone.findUnique({ where: { code: "Z01" } })
    );

    const zoneId = existingZone?.id || "seed-zone-z01";

    if (existingZone) {
      await withRetry(() =>
        prisma.$executeRaw`
          UPDATE zones
          SET
            neighborhood_id = ${neighborhoodId},
            name = 'Zone 01',
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
            neighborhood_id,
            name,
            code,
            status,
            geometry,
            created_at,
            updated_at
          )
          VALUES (
            ${zoneId},
            ${neighborhoodId},
            'Zone 01',
            'Z01',
            'ACTIVE'::"Status",
            ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(zoneGeometry)}), 4326),
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
        `
      );
    }

    await withRetry(() =>
      prisma.assignment.upsert({
        where: { id: "seed-assignment-define-zones" },
        update: {
          type: "DEFINE_ZONES",
          status: "ASSIGNED",
          neighborhoodId,
          zoneId: null,
          assignedToId: officerUser.id,
          assignedById: adminUser.id,
          payload: { zones: [] },
          notes: "Define remaining zones inside the Taleex neighborhood boundary.",
        },
        create: {
          id: "seed-assignment-define-zones",
          type: "DEFINE_ZONES",
          status: "ASSIGNED",
          neighborhoodId,
          assignedToId: officerUser.id,
          assignedById: adminUser.id,
          payload: { zones: [] },
          notes: "Define remaining zones inside the Taleex neighborhood boundary.",
        },
      })
    );

    await withRetry(() =>
      prisma.assignment.upsert({
        where: { id: "seed-assignment-register-addresses" },
        update: {
          type: "REGISTER_ADDRESSES",
          status: "ASSIGNED",
          neighborhoodId,
          zoneId,
          assignedToId: officerUser.id,
          assignedById: adminUser.id,
          payload: { addresses: [] },
          notes: "Register sample residential addresses inside Zone 01.",
        },
        create: {
          id: "seed-assignment-register-addresses",
          type: "REGISTER_ADDRESSES",
          status: "ASSIGNED",
          neighborhoodId,
          zoneId,
          assignedToId: officerUser.id,
          assignedById: adminUser.id,
          payload: { addresses: [] },
          notes: "Register sample residential addresses inside Zone 01.",
        },
      })
    );

    console.log("✅ Demo neighborhood, zone, and assignments seeded for Hodan / Taleex.");
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
