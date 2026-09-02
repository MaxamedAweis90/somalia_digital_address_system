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

const DISTRICTS_BY_REGION = {
  AWD: [
    { name: "Baki", code: "SO1102" },
    { name: "Borama", code: "SO1101" },
    { name: "Lughaye", code: "SO1103" },
    { name: "Zeylac", code: "SO1104" },
  ],
  BKL: [
    { name: "Ceel Barde", code: "SO2502" },
    { name: "Rab Dhuure", code: "SO2505" },
    { name: "Tayeeglow", code: "SO2503" },
    { name: "Waajid", code: "SO2504" },
    { name: "Xudur", code: "SO2501" },
  ],
  BND: [
    { name: "Bondhere", code: "SO2201" },
    { name: "Cabdulasis", code: "SO2202" },
    { name: "Daynile", code: "SO2203" },
    { name: "Dharkenley", code: "SO2204" },
    { name: "Hamar Jabjab", code: "SO2205" },
    { name: "Hamar Weyne", code: "SO2206" },
    { name: "Hawl Wadaag", code: "SO2207" },
    { name: "Heliwa", code: "SO2208" },
    { name: "Hodan", code: "SO2209" },
    { name: "Kahda", code: "SO2210" },
    { name: "Karaan", code: "SO2211" },
    { name: "Shangaani", code: "SO2212" },
    { name: "Shibis", code: "SO2213" },
    { name: "Unspecified", code: "SO2200" },
    { name: "Waaberi", code: "SO2214" },
    { name: "Wadajir (Medina)", code: "SO2215" },
    { name: "Wardhigley", code: "SO2216" },
    { name: "Yaaqshid", code: "SO2217" },
  ],
  BAR: [
    { name: "Bandarbeyla", code: "SO1602" },
    { name: "Bossaso", code: "SO1601" },
    { name: "Caluula", code: "SO1603" },
    { name: "Iskushuban", code: "SO1604" },
    { name: "Qandala", code: "SO1605" },
    { name: "Qardho", code: "SO1606" },
  ],
  BAY: [
    { name: "Baydhaba", code: "SO2401" },
    { name: "Buur Hakaba", code: "SO2402" },
    { name: "Diinsoor", code: "SO2403" },
    { name: "Qansax Dheere", code: "SO2404" },
  ],
  GLG: [
    { name: "Cabudwaaq", code: "SO1902" },
    { name: "Cadaado", code: "SO1903" },
    { name: "Ceel Buur", code: "SO1904" },
    { name: "Ceel Dheer", code: "SO1905" },
    { name: "Dhuusamarreeb", code: "SO1901" },
  ],
  GED: [
    { name: "Baardheere", code: "SO2602" },
    { name: "Belet Xaawo", code: "SO2603" },
    { name: "Ceel Waaq", code: "SO2604" },
    { name: "Doolow", code: "SO2605" },
    { name: "Garbahaarey", code: "SO2601" },
    { name: "Luuq", code: "SO2606" },
  ],
  HIR: [
    { name: "Belet Weyne", code: "SO2001" },
    { name: "Bulo Burto", code: "SO2002" },
    { name: "Jalalaqsi", code: "SO2003" },
  ],
  JHS: [
    { name: "Afmadow", code: "SO2802" },
    { name: "Badhaadhe", code: "SO2803" },
    { name: "Jamaame", code: "SO2804" },
    { name: "Kismaayo", code: "SO2801" },
  ],
  SHS: [
    { name: "Afgooye", code: "SO2302" },
    { name: "Baraawe", code: "SO2303" },
    { name: "Kurtunwaarey", code: "SO2304" },
    { name: "Marka", code: "SO2301" },
    { name: "Qoryooley", code: "SO2305" },
    { name: "Sablaale", code: "SO2306" },
    { name: "Wanla Weyn", code: "SO2307" },
  ],
  JDX: [
    { name: "Bu'aale", code: "SO2701" },
    { name: "Jilib", code: "SO2702" },
    { name: "Saakow", code: "SO2703" },
  ],
  SDX: [
    { name: "Adan Yabaal", code: "SO2102" },
    { name: "Balcad", code: "SO2103" },
    { name: "Cadale", code: "SO2104" },
    { name: "Jowhar", code: "SO2101" },
  ],
  MDG: [
    { name: "Gaalkacyo", code: "SO1801" },
    { name: "Galdogob", code: "SO1802" },
    { name: "Hobyo", code: "SO1803" },
    { name: "Jariiban", code: "SO1804" },
    { name: "Xarardheere", code: "SO1805" },
  ],
  NGL: [
    { name: "Burtinle", code: "SO1702" },
    { name: "Eyl", code: "SO1703" },
    { name: "Garoowe", code: "SO1701" },
  ],
  SNG: [
    { name: "Ceel Afweyn", code: "SO1502" },
    { name: "Ceerigaabo", code: "SO1501" },
    { name: "Laasqoray", code: "SO1503" },
  ],
  SOL: [
    { name: "Caynabo", code: "SO1402" },
    { name: "Laas Caanood", code: "SO1401" },
    { name: "Taleex", code: "SO1403" },
    { name: "Xudun", code: "SO1404" },
  ],
  TGD: [
    { name: "Burco", code: "SO1301" },
    { name: "Buuhoodle", code: "SO1302" },
    { name: "Owdweyne", code: "SO1303" },
    { name: "Sheikh", code: "SO1304" },
  ],
  WQG: [
    { name: "Berbera", code: "SO1202" },
    { name: "Gebiley", code: "SO1203" },
    { name: "Hargeysa", code: "SO1201" },
  ],
};

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

const DISTRICT_BOUNDARY_URL =
  "https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/SOM/ADM2/geoBoundaries-SOM-ADM2_simplified.geojson";

function normalizeDistrictName(name) {
  return name.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function matchDistrictFeature(features, districtName) {
  const normalized = normalizeDistrictName(districtName);
  const exact = features.find(
    (feature) => normalizeDistrictName(feature.properties.shapeName) === normalized
  );
  if (exact) return exact;

  const firstToken = districtName.split(/[\s(]/)[0].toUpperCase();
  return features.find((feature) => {
    const shapeName = feature.properties.shapeName.toUpperCase();
    return shapeName.startsWith(firstToken) || firstToken.startsWith(shapeName.slice(0, 4));
  });
}

async function importDistrictBoundaries() {
  console.log("🗺️ Importing official Somalia district boundaries...");

  const response = await fetch(DISTRICT_BOUNDARY_URL);
  if (!response.ok) {
    throw new Error(`Failed to download district boundaries (${response.status})`);
  }

  const geojson = await response.json();
  const features = geojson.features || [];
  const districts = await prisma.district.findMany({
    select: { id: true, name: true, code: true },
  });

  let matched = 0;
  const unmatched = [];

  for (const district of districts) {
    const feature = matchDistrictFeature(features, district.name);
    if (!feature) {
      unmatched.push(district.name);
      continue;
    }

    await prisma.$executeRaw`
      UPDATE districts
      SET geometry = ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(feature.geometry)}), 4326)
      WHERE id = ${district.id}
    `;
    matched += 1;
  }

  console.log(`✅ District boundaries imported for ${matched}/${districts.length} districts.`);
  if (unmatched.length) {
    console.log(`⚠️ No boundary match for: ${unmatched.join(", ")}`);
  }
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

  // 3. Seed 18 official Somali regions and all 91 districts
  let regionCount = 0;
  let districtCount = 0;
  for (const reg of SOMALI_OFFICIAL_REGIONS) {
    const region = await withRetry(() =>
      upsertRegion(reg.code, {
        name: reg.name,
        status: "ACTIVE",
      })
    );

    regionCount += 1;
    for (const district of DISTRICTS_BY_REGION[reg.code] || []) {
      await withRetry(() =>
        upsertDistrict(district.code, {
          name: district.name,
          status: "ACTIVE",
          regionId: region.id,
        })
      );
      districtCount += 1;
    }
  }
  console.log(`✅ ${regionCount} official Somali regions successfully seeded.`);
  console.log(`✅ ${districtCount} districts successfully seeded.`);

  await withRetry(() => importDistrictBoundaries());
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error.message || error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
