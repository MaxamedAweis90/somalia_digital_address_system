import "dotenv/config";
import { prisma } from "../backend/src/db.js";
import { AssignmentService } from "../backend/src/service/assignment.service.js";

async function runTests() {
  console.log("🚀 Starting Assignment Service Parallel Collector Tests...\n");

  // 1. Get or create test admin, officer
  const admin = await prisma.user.findFirst({ where: { role: "SYS_ADMIN" } });
  if (!admin) throw new Error("No admin user found");

  const officer = await prisma.user.findFirst({ where: { role: "DATA_OFFICER" } });
  if (!officer) throw new Error("No data officer user found");

  // Create or fetch 3 test collectors
  const collector1 = await prisma.user.upsert({
    where: { email: "testcollector1@somalia.gov.so" },
    update: { role: "DATA_OFFICER" },
    create: {
      name: "Collector 1",
      email: "testcollector1@somalia.gov.so",
      password: "password123",
      role: "DATA_OFFICER",
    },
  });

  const collector2 = await prisma.user.upsert({
    where: { email: "testcollector2@somalia.gov.so" },
    update: { role: "DATA_OFFICER" },
    create: {
      name: "Collector 2",
      email: "testcollector2@somalia.gov.so",
      password: "password123",
      role: "DATA_OFFICER",
    },
  });

  const collector3 = await prisma.user.upsert({
    where: { email: "testcollector3@somalia.gov.so" },
    update: { role: "DATA_OFFICER" },
    create: {
      name: "Collector 3",
      email: "testcollector3@somalia.gov.so",
      password: "password123",
      role: "DATA_OFFICER",
    },
  });

  // Fetch or create a test region, district, neighborhood
  const region = await prisma.region.upsert({
    where: { code: "TST" },
    update: {},
    create: { name: "Test Region", code: "TST" },
  });

  const district = await prisma.district.upsert({
    where: { code: "TST-DST" },
    update: {},
    create: { name: "Test District", code: "TST-DST", regionId: region.id },
  });

  const neighborhood = await prisma.neighborhood.upsert({
    where: { code: "TST-NH" },
    update: {},
    create: { name: "Test Neighborhood", code: "TST-NH", districtId: district.id },
  });

  // -------------------------------------------------------------
  // Test 1: Validation of expectedCollectorCount
  // -------------------------------------------------------------
  console.log("Testing validation of expectedCollectorCount...");
  const invalidCases = [0, 51, 1.5, "abc", null, undefined];
  for (const val of invalidCases) {
    try {
      await AssignmentService.createAssignment(
        {
          neighborhoodId: neighborhood.id,
          assignedToId: officer.id,
          expectedCollectorCount: val,
        },
        admin.id
      );
      console.error(`❌ FAILED: expected error for value ${val} but succeeded`);
      process.exit(1);
    } catch (err) {
      console.log(`  ✓ Rejected invalid expectedCollectorCount (${val}): ${err.message}`);
    }
  }

  // -------------------------------------------------------------
  // Test 2: Valid Creation (min=1, max=50, valid=2)
  // -------------------------------------------------------------
  console.log("\nTesting valid creation (expectedCollectorCount = 2)...");
  const parentAssignment = await AssignmentService.createAssignment(
    {
      neighborhoodId: neighborhood.id,
      assignedToId: officer.id,
      expectedCollectorCount: 2,
      notes: "Parallel assignment test",
    },
    admin.id
  );

  if (parentAssignment.expectedCollectorCount !== 2) {
    throw new Error("expectedCollectorCount not stored correctly");
  }
  console.log(`  ✓ Parent assignment created with ID: ${parentAssignment.id}, expectedCollectorCount: 2`);

  // -------------------------------------------------------------
  // Test 3: Delegation to Collector 1
  // -------------------------------------------------------------
  console.log("\nDelegating Collector 1...");
  const child1 = await AssignmentService.createChildAssignment(
    parentAssignment.id,
    { assignedToId: collector1.id, notes: "East sector" },
    officer.id
  );
  console.log(`  ✓ Child 1 created for Collector 1 (ID: ${child1.id})`);

  // -------------------------------------------------------------
  // Test 4: Same Collector Duplicate Delegation Rejection
  // -------------------------------------------------------------
  console.log("\nAttempting duplicate delegation of Collector 1...");
  try {
    await AssignmentService.createChildAssignment(
      parentAssignment.id,
      { assignedToId: collector1.id, notes: "Duplicate assignment" },
      officer.id
    );
    console.error("❌ FAILED: Duplicate collector assignment was allowed!");
    process.exit(1);
  } catch (err) {
    console.log(`  ✓ Rejected duplicate collector assignment: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Test 5: Delegation to Collector 2 (reaching limit 2/2)
  // -------------------------------------------------------------
  console.log("\nDelegating Collector 2...");
  const child2 = await AssignmentService.createChildAssignment(
    parentAssignment.id,
    { assignedToId: collector2.id, notes: "West sector" },
    officer.id
  );
  console.log(`  ✓ Child 2 created for Collector 2 (ID: ${child2.id})`);

  // -------------------------------------------------------------
  // Test 6: Delegation over limit (Collector 3)
  // -------------------------------------------------------------
  console.log("\nAttempting delegation over limit (Collector 3)...");
  try {
    await AssignmentService.createChildAssignment(
      parentAssignment.id,
      { assignedToId: collector3.id, notes: "Over limit sector" },
      officer.id
    );
    console.error("❌ FAILED: Delegation over limit was allowed!");
    process.exit(1);
  } catch (err) {
    console.log(`  ✓ Rejected delegation over limit: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Test 7: Verify parent assignment response counts
  // -------------------------------------------------------------
  console.log("\nVerifying parent assignment progress data...");
  const updatedParent = await AssignmentService.getAssignmentById(parentAssignment.id, admin);
  console.log(`  ✓ Delegated count: ${updatedParent.delegatedCount}/${updatedParent.expectedCollectorCount}`);
  console.log(`  ✓ Children count in payload: ${updatedParent.children.length}`);

  if (updatedParent.delegatedCount !== 2) {
    throw new Error(`Expected delegatedCount=2, got ${updatedParent.delegatedCount}`);
  }

  console.log("\n🎉 ALL BACKEND ASSIGNMENT TESTS PASSED SUCCESSFULLY!");
}

runTests()
  .catch((err) => {
    console.error("\n❌ Test execution failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
