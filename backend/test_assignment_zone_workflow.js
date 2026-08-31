import "dotenv/config";
import assert from "node:assert/strict";
import { prisma } from "./src/db.js";
import { AssignmentService } from "./src/service/assignment.service.js";
import { ZoneBlockService } from "./src/service/zone-block.service.js";
import { ZoneService } from "./src/service/zone.service.js";

const polygon = (west, south, east, north) => ({
  type: "Polygon",
  coordinates: [[[west, south], [east, south], [east, north], [west, north], [west, south]]],
});

async function run() {
  const suffix = Date.now().toString();
  const regionCode = `TWR-${suffix}`;
  const districtCode = `TWR-D-${suffix}`;
  const zoneCode = `TWR-Z-${suffix}`;
  const secondZoneCode = `TWR-X-${suffix}`;

  const admin = await prisma.user.findFirst({ where: { role: "SYS_ADMIN" } });
  const officer = await prisma.user.findFirst({ where: { role: "DATA_OFFICER" } });
  assert(admin, "A system admin is required");
  assert(officer, "A data officer is required");

  const collectors = await Promise.all(
    ["one", "two", "three"].map((name) =>
      prisma.user.upsert({
        where: { email: `zone-workflow-${name}-${suffix}@example.test` },
        update: { role: "DATA_COLLECTOR", supervisorId: officer.id },
        create: {
          name: `Zone Workflow Collector ${name}`,
          email: `zone-workflow-${name}-${suffix}@example.test`,
          password: "test-password",
          role: "DATA_COLLECTOR",
          supervisorId: officer.id,
        },
      })
    )
  );

  let region;
  let district;
  let zone;
  let secondZone;
  const blockIds = [];
  const parentIds = [];

  try {
    region = await prisma.region.create({ data: { name: "Workflow Test Region", code: regionCode } });
    district = await prisma.district.create({
      data: { name: "Workflow Test District", code: districtCode, regionId: region.id },
    });
    zone = await ZoneService.createZone({
      districtId: district.id,
      name: "Workflow Test Zone",
      code: zoneCode,
      geometry: polygon(44, 2, 44.2, 2.2),
    });
    secondZone = await ZoneService.createZone({
      districtId: district.id,
      name: "Workflow Other Zone",
      code: secondZoneCode,
      geometry: polygon(45, 2, 45.2, 2.2),
    });

    const blocks = await Promise.all([
      ZoneBlockService.createZoneBlock({
        zoneId: zone.id,
        name: "Workflow Block One",
        code: `${zoneCode}-B1`,
        geometry: polygon(44.01, 2.01, 44.05, 2.05),
      }),
      ZoneBlockService.createZoneBlock({
        zoneId: zone.id,
        name: "Workflow Block Two",
        code: `${zoneCode}-B2`,
        geometry: polygon(44.06, 2.01, 44.1, 2.05),
      }),
      ZoneBlockService.createZoneBlock({
        zoneId: zone.id,
        name: "Workflow Block Three",
        code: `${zoneCode}-B3`,
        geometry: polygon(44.11, 2.01, 44.15, 2.05),
      }),
      ZoneBlockService.createZoneBlock({
        zoneId: secondZone.id,
        name: "Workflow Foreign Block",
        code: `${secondZoneCode}-B1`,
        geometry: polygon(45.01, 2.01, 45.05, 2.05),
      }),
    ]);
    blockIds.push(...blocks.map((block) => block.id));

    const [blockOne, blockTwo, blockThree, foreignBlock] = blocks;
    const parent = await AssignmentService.createAssignment(
      {
        type: "REGISTER_ADDRESSES",
        zoneId: zone.id,
        assignedToId: officer.id,
        expectedCollectorCount: 2,
      },
      admin.id
    );
    parentIds.push(parent.id);
    assert.equal(parent.zoneBlockId, null);

    await assert.rejects(
      () =>
        AssignmentService.createChildAssignment(
          parent.id,
          officer.id,
          { assignedToId: collectors[0].id, zoneBlockId: foreignBlock.id }
        ),
      /does not belong to the assigned zone/
    );

    const childOne = await AssignmentService.createChildAssignment(
      parent.id,
      officer.id,
      { assignedToId: collectors[0].id, zoneBlockId: blockOne.id }
    );
    const childTwo = await AssignmentService.createChildAssignment(
      parent.id,
      officer.id,
      { assignedToId: collectors[1].id, zoneBlockId: blockTwo.id }
    );
    assert.equal(childOne.zoneBlockId, blockOne.id);
    assert.equal(childTwo.zoneBlockId, blockTwo.id);

    await assert.rejects(
      () =>
        AssignmentService.createChildAssignment(
          parent.id,
          officer.id,
          { assignedToId: collectors[1].id, zoneBlockId: blockOne.id }
        ),
      /already been assigned/
    );
    await assert.rejects(
      () =>
        AssignmentService.createChildAssignment(
          parent.id,
          officer.id,
          { assignedToId: collectors[2].id, zoneBlockId: blockThree.id }
        ),
      /limited to 2/
    );

    const drafts = [
      {
        child: childOne,
        collector: collectors[0],
        latitude: 2.02,
        longitude: 44.02,
        streetName: "Workflow Street One",
      },
      {
        child: childTwo,
        collector: collectors[1],
        latitude: 2.02,
        longitude: 44.07,
        streetName: "Workflow Street Two",
      },
    ];
    for (const draft of drafts) {
      await AssignmentService.saveCollectorDraft(
        draft.child.id,
        {
          addresses: [
            {
              streetName: draft.streetName,
              description: "Workflow test address",
              latitude: draft.latitude,
              longitude: draft.longitude,
            },
          ],
        },
        draft.collector.id
      );
      await AssignmentService.submitChildAssignment(draft.child.id, draft.collector.id);
      await AssignmentService.approveChildAssignment(draft.child.id, officer.id);
    }

    const merged = await AssignmentService.getAssignmentById(parent.id, officer);
    assert.equal(merged.status, "READY_FOR_REVIEW");
    assert.equal(merged.payload.addresses.length, 2);
    assert.deepEqual(
      new Set(merged.payload.addresses.map((address) => address.zoneBlockId)),
      new Set([blockOne.id, blockTwo.id])
    );

    await AssignmentService.submitParentToAdmin(parent.id, officer.id);
    const result = await AssignmentService.approveAssignment(parent.id, admin.id);
    assert.equal(result.createdAddresses.length, 2);
    assert.match(result.createdAddresses[0].addressCode, /-0001$/);
    assert.match(result.createdAddresses[1].addressCode, /-0001$/);

    console.log("Zone workflow service tests passed.");
  } finally {
    if (parentIds.length) {
      await prisma.assignment.deleteMany({ where: { parentAssignmentId: { in: parentIds } } });
      await prisma.assignment.deleteMany({ where: { id: { in: parentIds } } });
    }
    if (blockIds.length) {
      await prisma.address.deleteMany({ where: { zoneBlockId: { in: blockIds } } });
      await prisma.zoneBlock.deleteMany({ where: { id: { in: blockIds } } });
    }
    if (zone || secondZone) {
      await prisma.zone.deleteMany({
        where: { id: { in: [zone?.id, secondZone?.id].filter(Boolean) } },
      });
    }
    if (district) await prisma.district.delete({ where: { id: district.id } });
    if (region) await prisma.region.delete({ where: { id: region.id } });
    await prisma.user.deleteMany({
      where: { id: { in: collectors.map((collector) => collector.id) } },
    });
  }
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
