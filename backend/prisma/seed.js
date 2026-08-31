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

async function upsertUser(email, data) {
  const existing = await prisma.user.findFirst({ where: { email } });
  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data,
    });
  }
  return prisma.user.create({
    data: { email, ...data },
  });
}

async function upsertRegion(code, data) {
  const existing = await prisma.region.findFirst({ where: { code } });
  if (existing) {
    return prisma.region.update({
      where: { id: existing.id },
      data,
    });
  }
  return prisma.region.create({
    data: { code, ...data },
  });
}

async function upsertDistrict(code, data) {
  const existing = await prisma.district.findFirst({ where: { code } });
  if (existing) {
    return prisma.district.update({
      where: { id: existing.id },
      data,
    });
  }
  return prisma.district.create({
    data: { code, ...data },
  });
}

async function upsertSetting(key, data) {
  const existing = await prisma.appSetting.findFirst({ where: { key } });
  if (existing) {
    return prisma.appSetting.update({
      where: { id: existing.id },
      data,
    });
  }
  return prisma.appSetting.create({
    data: { key, ...data },
  });
}

async function upsertAssignment(id, data) {
  const existing = await prisma.assignment.findUnique({ where: { id } });
  if (existing) {
    return prisma.assignment.update({
      where: { id },
      data,
    });
  }
  return prisma.assignment.create({
    data: { id, ...data },
  });
}

async function main() {
  console.log("🌱 Seeding database with Admin users and official Somali regions...");

  const hashedPassword = await hashPassword("Password123!");

  // 1. Seed Super Admin
  const adminUser = await withRetry(() =>
    upsertUser("admin@somalia.gov.so", {
      name: "Ahmed Admin",
      password: hashedPassword,
      role: "SYS_ADMIN",
    })
  );
  console.log("✅ Admin user seeded:", adminUser.email);

  // 2. Seed Data Officer
  const officerUser = await withRetry(() =>
    upsertUser("officer@somalia.gov.so", {
      name: "Farah Data Officer",
      password: hashedPassword,
      role: "DATA_OFFICER",
    })
  );
  console.log("✅ Data Officer user seeded:", officerUser.email);

  const collectorOne = await withRetry(() =>
    upsertUser("collector1@somalia.gov.so", {
      name: "Amina Collector",
      password: hashedPassword,
      role: "DATA_COLLECTOR",
      supervisorId: officerUser.id,
    })
  );

  const collectorTwo = await withRetry(() =>
    upsertUser("collector2@somalia.gov.so", {
      name: "Hassan Collector",
      password: hashedPassword,
      role: "DATA_COLLECTOR",
      supervisorId: officerUser.id,
    })
  );
  console.log("✅ Data Collectors seeded:", collectorOne.email, collectorTwo.email);

  // 3. Seed 18 Official Somali Regions
  let createdCount = 0;
  for (const reg of SOMALI_OFFICIAL_REGIONS) {
    await withRetry(() =>
      upsertRegion(reg.code, {
        name: reg.name,
        status: "ACTIVE",
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

  try {
    for (const setting of defaultSettings) {
      await withRetry(() =>
        upsertSetting(setting.key, {
          label: setting.label,
          value: setting.value,
          description: setting.description,
          category: setting.category,
          type: setting.type,
          isSystem: true,
        })
      );
    }
    console.log(`✅ ${defaultSettings.length} system settings seeded.`);
  } catch (err) {
    console.log("Settings seeding notice (optional table):", err.message);
  }

  try {
    const banaadir = await withRetry(() =>
      prisma.region.findFirst({ where: { code: "BND" } })
    );

    if (banaadir) {
      const district = await withRetry(() =>
        upsertDistrict("HOD", {
          name: "Hodan",
          status: "ACTIVE",
          regionId: banaadir.id,
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
        prisma.zone.findFirst({ where: { code: "TLX" } })
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
        prisma.zoneBlock.findFirst({ where: { code: "Z01" } })
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
        upsertAssignment("seed-assignment-define-zone-blocks", {
          type: "DEFINE_ZONE_BLOCKS",
          tier: "PARENT",
          status: "ASSIGNED",
          zoneId,
          zoneBlockId: null,
          assignedToId: officerUser.id,
          assignedById: adminUser.id,
          payload: { zoneBlocks: [] },
          notes: "Define remaining zone blocks inside the Taleex zone boundary.",
        })
      );

      await withRetry(() =>
        upsertAssignment("seed-child-define-zone-blocks-east", {
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
        })
      );

      await withRetry(() =>
        upsertAssignment("seed-assignment-register-addresses", {
          type: "REGISTER_ADDRESSES",
          tier: "PARENT",
          status: "ASSIGNED",
          zoneId,
          zoneBlockId,
          assignedToId: officerUser.id,
          assignedById: adminUser.id,
          payload: { addresses: [] },
          notes: "Register sample residential addresses inside Block 01.",
        })
      );

      console.log("✅ Demo zone, zone block, collectors, and assignments seeded for Hodan / Taleex.");
    }
  } catch (err) {
    console.log("Spatial seeding notice (optional):", err.message);
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
