import { prisma } from "../db.js";
import { ZoneService } from "../service/zone.service.js";
import { AddressService } from "../service/address.service.js";
import { AuthService } from "../service/auth.service.js";

async function withRetry(operation, { retries = 5, delayMs = 3_000 } = {}) {
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

async function runTests() {
  console.log("🚀 Starting integration tests...");

  // Setup test environment
  let testRegion, testDistrict, testNeighborhood, testZone, testAddress;

  try {
    // 0. Pre-test cleanup of any leftover records from prior interrupted runs
    console.log("🧹 Running pre-test database cleanup...");
    await withRetry(async () => {
      await prisma.address.deleteMany({
        where: {
          addressCode: { startsWith: "TST-DST-TST-NHB-TST-ZN1-" }
        }
      });
      await prisma.zone.deleteMany({
        where: {
          code: "TST-ZN1"
        }
      });
      await prisma.neighborhood.deleteMany({
        where: {
          code: "TST-NHB"
        }
      });
      await prisma.district.deleteMany({
        where: {
          code: { in: ["TST-DST", "WRG-DST"] }
        }
      });
      await prisma.region.deleteMany({
        where: {
          code: "TST-REG"
        }
      });
    });
    console.log("🧹 Pre-test cleanup completed.");

    // 1. Setup parent entities
    console.log("📦 Setting up test database entities...");
    testRegion = await withRetry(() =>
      prisma.region.upsert({
        where: { code: "TST-REG" },
        update: {},
        create: { name: "Test Region", code: "TST-REG", status: "ACTIVE" },
      })
    );

    testDistrict = await withRetry(() =>
      prisma.district.upsert({
        where: { code: "TST-DST" },
        update: {},
        create: {
          name: "Test District",
          code: "TST-DST",
          regionId: testRegion.id,
          status: "ACTIVE",
        },
      })
    );

    testNeighborhood = await withRetry(() =>
      prisma.neighborhood.upsert({
        where: { code: "TST-NHB" },
        update: {},
        create: {
          name: "Test Neighborhood",
          code: "TST-NHB",
          districtId: testDistrict.id,
          status: "ACTIVE",
        },
      })
    );

    console.log("✅ Base models set up.");

    // 2. Zone Service Tests
    console.log("\n🧪 Running Zone Service Tests...");

    // Create successfully
    testZone = await ZoneService.createZone({
      neighborhoodId: testNeighborhood.id,
      name: "Test Zone A",
      code: "TST-ZN1",
      status: "ACTIVE",
    });
    console.log("✅ Zone created successfully:", testZone.code);

    // Duplicate code check
    try {
      await ZoneService.createZone({
        neighborhoodId: testNeighborhood.id,
        name: "Test Zone B",
        code: "TST-ZN1",
      });
      throw new Error("FAIL: Duplicate zone code was allowed");
    } catch (err) {
      if (err.message.includes("already exists")) {
        console.log("✅ Zone duplicate code validation works.");
      } else {
        throw err;
      }
    }

    // Invalid neighborhood check
    try {
      await ZoneService.createZone({
        neighborhoodId: "nonexistent-id",
        name: "Test Zone C",
        code: "TST-ZN2",
      });
      throw new Error("FAIL: Invalid neighborhood ID was allowed");
    } catch (err) {
      if (err.message.includes("not found")) {
        console.log("✅ Zone invalid neighborhood validation works.");
      } else {
        throw err;
      }
    }

    // Get list
    const zonesList = await ZoneService.getZones({
      neighborhoodId: testNeighborhood.id,
    });
    if (zonesList.items.length > 0) {
      console.log(`✅ Get zones list works (found ${zonesList.items.length} items).`);
    } else {
      throw new Error("FAIL: Get zones returned empty list");
    }

    // Get by ID
    const fetchedZone = await ZoneService.getZoneById(testZone.id);
    if (fetchedZone.id === testZone.id) {
      console.log("✅ Get zone by ID works.");
    } else {
      throw new Error("FAIL: Fetched zone ID mismatch");
    }

    // Update Zone
    const updatedZone = await ZoneService.updateZone(testZone.id, {
      name: "Updated Zone Name",
    });
    if (updatedZone.name === "Updated Zone Name") {
      console.log("✅ Update zone name works.");
    } else {
      throw new Error("FAIL: Update zone did not apply change");
    }

    // 3. Address Service Tests
    console.log("\n🧪 Running Address Service Tests...");

    // Create successfully
    testAddress = await AddressService.createAddress({
      districtId: testDistrict.id,
      neighborhoodId: testNeighborhood.id,
      zoneId: testZone.id,
      houseNumber: 15,
      streetName: "Maka Al Mukarama Rd",
      description: "Near the main junction",
      location: "POINT(45.34 2.04)",
      status: "ACTIVE",
    });
    console.log("✅ Address created successfully. DAC:", testAddress.addressCode);

    // Verify DAC format (TST-DST -> TST-NHB -> TST-ZN1 -> 0015)
    // Wait, the codes of parents are TST-DST, TST-NHB, TST-ZN1 (upper). Let's verify.
    const expectedDAC = `TST-DST-TST-NHB-TST-ZN1-0015`;
    if (testAddress.addressCode === expectedDAC) {
      console.log("✅ DAC Generation formula matches exactly.");
    } else {
      throw new Error(`FAIL: DAC mismatch. Expected ${expectedDAC}, got ${testAddress.addressCode}`);
    }

    // Verify BigInt Serialization (houseNumber must be a string)
    if (typeof testAddress.houseNumber === "string") {
      console.log("✅ BigInt serialization check passed. houseNumber is a string:", testAddress.houseNumber);
    } else {
      throw new Error("FAIL: houseNumber is not serialized as a string");
    }

    // Invalid Hierarchy check (wrong district for neighborhood)
    let wrongDistrict;
    try {
      wrongDistrict = await prisma.district.create({
        data: { name: "Wrong District", code: "WRG-DST", regionId: testRegion.id },
      });

      await AddressService.createAddress({
        districtId: wrongDistrict.id,
        neighborhoodId: testNeighborhood.id,
        zoneId: testZone.id,
        houseNumber: 20,
        streetName: "Wrong St",
        description: "Invalid hierarchy test",
        location: "POINT(0 0)",
      });

      throw new Error("FAIL: Address creation with wrong hierarchy was allowed");
    } catch (err) {
      if (err.message.includes("does not belong to")) {
        console.log("✅ Address hierarchy validation works.");
      } else {
        throw err;
      }
    } finally {
      if (wrongDistrict) {
        await prisma.district.delete({ where: { id: wrongDistrict.id } });
      }
    }

    // Duplicate address check (same DAC)
    try {
      await AddressService.createAddress({
        districtId: testDistrict.id,
        neighborhoodId: testNeighborhood.id,
        zoneId: testZone.id,
        houseNumber: 15,
        streetName: "Duplicate Maka Rd",
        description: "Duplicate",
        location: "POINT(45.34 2.04)",
      });
      throw new Error("FAIL: Duplicate address creation allowed");
    } catch (err) {
      if (err.message.includes("already exists")) {
        console.log("✅ Address duplicate validation works.");
      } else {
        throw err;
      }
    }

    // Get list with filters
    const addressList = await AddressService.getAddresses({
      zoneId: testZone.id,
    });
    if (addressList.items.length > 0) {
      console.log(`✅ Get addresses list works (found ${addressList.items.length} items).`);
    } else {
      throw new Error("FAIL: Address listing failed");
    }

    // Get by ID
    const fetchedAddress = await AddressService.getAddressById(testAddress.id);
    if (fetchedAddress.id === testAddress.id) {
      console.log("✅ Get address by ID works.");
    } else {
      throw new Error("FAIL: Address fetch by ID mismatch");
    }

    // Update Address (change house number)
    const updatedAddress = await AddressService.updateAddress(testAddress.id, {
      houseNumber: 99,
    });
    const expectedNewDAC = `TST-DST-TST-NHB-TST-ZN1-0099`;
    if (updatedAddress.addressCode === expectedNewDAC && updatedAddress.houseNumber === "99") {
      console.log("✅ Update address houseNumber and auto-DAC regeneration works.");
    } else {
      throw new Error(`FAIL: Address update failed. Got DAC: ${updatedAddress.addressCode}`);
    }

    // Deletion block test for Zone with Addresses
    try {
      await ZoneService.deleteZone(testZone.id);
      throw new Error("FAIL: Allowed deletion of Zone with existing addresses");
    } catch (err) {
      if (err.message.includes("existing addresses")) {
        console.log("✅ Zone deletion block works (addresses exist).");
      } else {
        throw err;
      }
    }

    // 4. User findUnique error test cases
    console.log("\n🧪 Running User findUnique fix validation...");

    try {
      await AuthService.getUserProfile(undefined);
      throw new Error("FAIL: Allowed getUserProfile with undefined userId");
    } catch (err) {
      if (err.message.includes("User ID is required")) {
        console.log("✅ User ID missing check validation works.");
      } else {
        throw err;
      }
    }

    try {
      await AuthService.loginUser(undefined, "pwd");
      throw new Error("FAIL: Allowed loginUser with undefined email");
    } catch (err) {
      if (err.message.includes("Email and password are required")) {
        console.log("✅ User email missing check validation works.");
      } else {
        throw err;
      }
    }

    // 5. Cleanup
    console.log("\n🧹 Cleaning up test database records...");
    await prisma.address.delete({ where: { id: testAddress.id } });
    console.log("✅ Test Address deleted.");

    await ZoneService.deleteZone(testZone.id);
    console.log("✅ Test Zone deleted.");

    await prisma.neighborhood.delete({ where: { id: testNeighborhood.id } });
    await prisma.district.delete({ where: { id: testDistrict.id } });
    await prisma.region.delete({ where: { id: testRegion.id } });
    console.log("✅ Test hierarchy deleted.");

    console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉\n");
  } catch (error) {
    console.error("\n❌ Test execution failed:", error);
    // Cleanup as much as possible
    try {
      if (testAddress) await prisma.address.deleteMany({ where: { id: testAddress.id } });
      if (testZone) await prisma.zone.deleteMany({ where: { id: testZone.id } });
      if (testNeighborhood) await prisma.neighborhood.deleteMany({ where: { id: testNeighborhood.id } });
      if (testDistrict) await prisma.district.deleteMany({ where: { id: testDistrict.id } });
      if (testRegion) await prisma.region.deleteMany({ where: { id: testRegion.id } });
    } catch (cleanError) {
      console.error("Cleanup error:", cleanError.message);
    }
    process.exit(1);
  }

  process.exit(0);
}

runTests();
