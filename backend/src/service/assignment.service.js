import { prisma } from "../db.js";
import { validatePolygonGeometry } from "../utils/geojson.utils.js";
import {
  assertZoneBlocksDoNotOverlap,
  assertZoneBlocksWithinZone,
  isPointWithinZoneBlock,
} from "../utils/geo.validation.utils.js";
import {
  assertAdminParentAccess,
  assertCollectorAccess,
  assertOfficerParentAccess,
  assertSupervisedCollector,
  assertUserRole,
} from "../utils/assignment-access.utils.js";
import { AddressService } from "./address.service.js";
import { ZoneBlockService } from "./zone-block.service.js";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
};

const assignmentInclude = {
  zone: {
    include: {
      district: {
        include: {
          region: {
            select: { id: true, name: true, code: true },
          },
        },
      },
    },
  },
  zoneBlock: {
    select: {
      id: true,
      name: true,
      code: true,
      status: true,
      zoneId: true,
    },
  },
  assignedTo: { select: userSelect },
  assignedBy: { select: userSelect },
  reviewedBy: { select: userSelect },
  officerReviewedBy: { select: userSelect },
  parent: {
    select: {
      id: true,
      type: true,
      status: true,
      assignedToId: true,
    },
  },
  children: {
    include: {
      assignedTo: { select: userSelect },
    },
    orderBy: [{ mergeOrder: "asc" }, { createdAt: "asc" }],
  },
};

const COLLECTOR_EDITABLE = ["ASSIGNED", "IN_PROGRESS", "REJECTED"];
const DEFAULT_PAYLOAD = {
  DEFINE_ZONE_BLOCKS: { zoneBlocks: [] },
  REGISTER_ADDRESSES: { addresses: [] },
};

function isValidCoordinate(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizeZoneBlockPayload(payload) {
  if (!payload || typeof payload !== "object") return { zoneBlocks: [] };
  const zoneBlocks = Array.isArray(payload.zoneBlocks)
    ? payload.zoneBlocks
    : Array.isArray(payload.zones)
      ? payload.zones
      : [];
  return {
    zoneBlocks: zoneBlocks.map((zoneBlock, index) => ({
      clientId: zoneBlock.clientId || `block-${index + 1}`,
      name: zoneBlock.name?.trim() || "",
      code: zoneBlock.code?.trim().toUpperCase() || "",
      status: zoneBlock.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
      geometry: zoneBlock.geometry || null,
    })),
  };
}

function normalizeAddressPayload(payload) {
  if (!payload || typeof payload !== "object") return { addresses: [] };
  const addresses = Array.isArray(payload.addresses) ? payload.addresses : [];
  return {
    addresses: addresses.map((address, index) => ({
      clientId: address.clientId || `addr-${index + 1}`,
      streetName: address.streetName?.trim() || "",
      description: address.description?.trim() || "",
      latitude:
        address.latitude === null || address.latitude === undefined
          ? null
          : Number(address.latitude),
      longitude:
        address.longitude === null || address.longitude === undefined
          ? null
          : Number(address.longitude),
    })),
  };
}

function normalizePayload(type, payload) {
  if (type === "REGISTER_ADDRESSES") return normalizeAddressPayload(payload);
  return normalizeZoneBlockPayload(payload);
}

function validateDraftZoneBlocks(zoneBlocks, { requireGeometry = false } = {}) {
  if (!zoneBlocks.length) throw new Error("Add at least one zone block before submitting");
  const codes = new Set();
  zoneBlocks.forEach((zoneBlock, index) => {
    const label = `Zone block ${index + 1}`;
    if (!zoneBlock.name) throw new Error(`${label}: name is required`);
    if (!zoneBlock.code) throw new Error(`${label}: code is required`);
    if (codes.has(zoneBlock.code)) {
      throw new Error(`Duplicate zone block code "${zoneBlock.code}" in draft`);
    }
    codes.add(zoneBlock.code);
    if (requireGeometry) validatePolygonGeometry(zoneBlock.geometry);
    else if (zoneBlock.geometry) validatePolygonGeometry(zoneBlock.geometry);
  });
}

function validateDraftAddresses(addresses, { requireCoordinates = false } = {}) {
  addresses.forEach((address, index) => {
    const label = `Address ${index + 1}`;
    if (address.latitude !== null && !isValidCoordinate(address.latitude)) {
      throw new Error(`${label}: latitude must be a valid number`);
    }
    if (address.longitude !== null && !isValidCoordinate(address.longitude)) {
      throw new Error(`${label}: longitude must be a valid number`);
    }
  });
  if (!requireCoordinates) return;
  if (!addresses.length) throw new Error("Add at least one address before submitting");
  addresses.forEach((address, index) => {
    const label = `Address ${index + 1}`;
    if (!address.streetName) throw new Error(`${label}: street name is required`);
    if (!isValidCoordinate(address.latitude) || !isValidCoordinate(address.longitude)) {
      throw new Error(`${label}: GPS coordinates are required`);
    }
  });
}

async function assertZone(zoneId) {
  const zone = await prisma.zone.findUnique({
    where: { id: zoneId },
    select: { id: true },
  });
  if (!zone) throw new Error("Zone not found");
}

async function assertZoneBlockForAssignment(zoneBlockId) {
  const rows = await prisma.$queryRaw`
    SELECT zb.id, zb.zone_id AS "zoneId", zb.status,
      (zb.geometry IS NOT NULL) AS "hasGeometry"
    FROM zone_blocks zb WHERE zb.id = ${zoneBlockId} LIMIT 1
  `;
  const zoneBlock = rows[0];
  if (!zoneBlock) throw new Error("Zone block not found");
  if (zoneBlock.status !== "ACTIVE") {
    throw new Error("Zone block must be active to register addresses");
  }
  if (!zoneBlock.hasGeometry) {
    throw new Error(
      "Zone block must have a boundary polygon before address registration can be assigned"
    );
  }
  return zoneBlock;
}

async function assertNoCodeConflicts(zoneId, zoneBlocks) {
  const codes = zoneBlocks.map((zb) => zb.code);
  if (!codes.length) return;
  const existing = await prisma.zoneBlock.findMany({
    where: { zoneId, code: { in: codes } },
    select: { code: true },
  });
  if (existing.length) {
    throw new Error(
      `Zone block code(s) already exist in this zone: ${existing.map((z) => z.code).join(", ")}`
    );
  }
}

async function assertAddressesWithinZoneBlock(zoneBlockId, addresses) {
  for (const address of addresses) {
    const within = await isPointWithinZoneBlock({
      latitude: address.latitude,
      longitude: address.longitude,
      zoneBlockId,
    });
    if (!within) {
      throw new Error(`Address "${address.streetName}" is outside the assigned zone block boundary`);
    }
  }
}

async function validateDefineZoneBlocksSubmission(zoneId, zoneBlocks) {
  validateDraftZoneBlocks(zoneBlocks, { requireGeometry: true });
  await assertNoCodeConflicts(zoneId, zoneBlocks);
  await assertZoneBlocksWithinZone(zoneBlocks, zoneId);
  await assertZoneBlocksDoNotOverlap(zoneBlocks);
}

async function validateRegisterAddressesSubmission(zoneBlockId, addresses) {
  validateDraftAddresses(addresses, { requireCoordinates: true });
  await assertAddressesWithinZoneBlock(zoneBlockId, addresses);
}

async function syncParentStatus(parentId) {
  const children = await prisma.assignment.findMany({
    where: { parentAssignmentId: parentId },
    select: { status: true },
  });

  if (!children.length) return;

  const allApproved = children.every((child) => child.status === "APPROVED");
  const parent = await prisma.assignment.findUnique({
    where: { id: parentId },
    select: { status: true },
  });

  if (!parent || ["SUBMITTED", "APPROVED"].includes(parent.status)) return;

  await prisma.assignment.update({
    where: { id: parentId },
    data: {
      status: allApproved ? "READY_FOR_REVIEW" : "IN_PROGRESS",
    },
  });
}

async function fetchAssignment(id) {
  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: assignmentInclude,
  });
  if (!assignment) throw new Error("Assignment not found");
  return assignment;
}

function assertAssignmentAccess(assignment, user) {
  if (user.role === "SYS_ADMIN") {
    if (assignment.tier === "CHILD") {
      throw new Error("Admin should access child assignments through the parent");
    }
    return;
  }

  if (user.role === "DATA_OFFICER") {
    if (assignment.tier === "PARENT") {
      assertOfficerParentAccess(assignment, user.id);
      return;
    }
    if (assignment.parent?.assignedToId !== user.id) {
      throw new Error("You do not have access to this assignment");
    }
    return;
  }

  if (user.role === "DATA_COLLECTOR") {
    assertCollectorAccess(assignment, user.id);
    return;
  }

  throw new Error("You do not have access to this assignment");
}

export const AssignmentService = {
  createAssignment: async (
    { type = "DEFINE_ZONE_BLOCKS", zoneId, zoneBlockId, assignedToId, notes, dueAt },
    actorId
  ) => {
    if (!assignedToId) throw new Error("Data officer is required");
    await assertUserRole(assignedToId, "DATA_OFFICER");

    const assignmentType = type || "DEFINE_ZONE_BLOCKS";
    if (!["DEFINE_ZONE_BLOCKS", "REGISTER_ADDRESSES"].includes(assignmentType)) {
      throw new Error("Invalid assignment type");
    }

    let resolvedZoneId = zoneId;
    let resolvedZoneBlockId = null;
    let initialPayload = DEFAULT_PAYLOAD.DEFINE_ZONE_BLOCKS;

    if (assignmentType === "DEFINE_ZONE_BLOCKS") {
      if (!zoneId) throw new Error("Zone is required for zone block definition assignments");
      await assertZone(zoneId);
      initialPayload = DEFAULT_PAYLOAD.DEFINE_ZONE_BLOCKS;
    } else {
      if (!zoneBlockId) {
        throw new Error("Zone block is required for address registration assignments");
      }
      const zoneBlock = await assertZoneBlockForAssignment(zoneBlockId);
      resolvedZoneId = zoneBlock.zoneId;
      resolvedZoneBlockId = zoneBlock.id;
      initialPayload = DEFAULT_PAYLOAD.REGISTER_ADDRESSES;
    }

    return prisma.assignment.create({
      data: {
        type: assignmentType,
        tier: "PARENT",
        zoneId: resolvedZoneId,
        zoneBlockId: resolvedZoneBlockId,
        assignedToId,
        assignedById: actorId,
        notes: notes?.trim() || null,
        dueAt: dueAt ? new Date(dueAt) : null,
        payload: initialPayload,
      },
      include: assignmentInclude,
    });
  },

  createChildAssignment: async (
    parentId,
    officerId,
    { assignedToId, notes, dueAt, scope, mergeOrder }
  ) => {
    const parent = await fetchAssignment(parentId);
    assertOfficerParentAccess(parent, officerId);

    if (!assignedToId) throw new Error("Data collector is required");
    await assertSupervisedCollector(assignedToId, officerId);

    if (["SUBMITTED", "APPROVED"].includes(parent.status)) {
      throw new Error("This parent assignment can no longer accept new child tasks");
    }

    const initialPayload =
      parent.type === "REGISTER_ADDRESSES"
        ? DEFAULT_PAYLOAD.REGISTER_ADDRESSES
        : DEFAULT_PAYLOAD.DEFINE_ZONE_BLOCKS;

    const child = await prisma.assignment.create({
      data: {
        type: parent.type,
        tier: "CHILD",
        parentAssignmentId: parent.id,
        zoneId: parent.zoneId,
        zoneBlockId: parent.zoneBlockId,
        assignedToId,
        assignedById: officerId,
        notes: notes?.trim() || null,
        dueAt: dueAt ? new Date(dueAt) : null,
        scope: scope || null,
        mergeOrder: mergeOrder ?? null,
        payload: initialPayload,
      },
      include: assignmentInclude,
    });

    if (parent.status === "ASSIGNED" || parent.status === "REJECTED") {
      await prisma.assignment.update({
        where: { id: parent.id },
        data: { status: "IN_PROGRESS", rejectionReason: null },
      });
    }

    return child;
  },

  deleteChildAssignment: async (childId, officerId) => {
    const child = await fetchAssignment(childId);
    if (child.tier !== "CHILD" || child.parent?.assignedToId !== officerId) {
      throw new Error("You do not have access to this assignment");
    }
    if (child.status !== "ASSIGNED") {
      throw new Error("Only unstarted child assignments can be deleted");
    }

    const parentId = child.parentAssignmentId;
    await prisma.assignment.delete({ where: { id: childId } });
    await syncParentStatus(parentId);
    return { id: childId };
  },

  getAssignments: async () => {
    return prisma.assignment.findMany({
      where: { tier: "PARENT" },
      include: assignmentInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  getOfficerParentAssignments: async (officerId) => {
    return prisma.assignment.findMany({
      where: { tier: "PARENT", assignedToId: officerId },
      include: assignmentInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  getCollectorAssignments: async (collectorId) => {
    return prisma.assignment.findMany({
      where: { tier: "CHILD", assignedToId: collectorId },
      include: assignmentInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  getOfficerReviewQueue: async (officerId) => {
    return prisma.assignment.findMany({
      where: {
        tier: "CHILD",
        status: "SUBMITTED",
        parent: { assignedToId: officerId },
      },
      include: assignmentInclude,
      orderBy: { submittedAt: "asc" },
    });
  },

  getParentChildren: async (parentId, officerId) => {
    const parent = await fetchAssignment(parentId);
    assertOfficerParentAccess(parent, officerId);
    return parent.children;
  },

  getAssignmentById: async (id, user) => {
    const assignment = await fetchAssignment(id);
    assertAssignmentAccess(assignment, user);
    return assignment;
  },

  saveCollectorDraft: async (id, payload, collectorId) => {
    const assignment = await prisma.assignment.findUnique({ where: { id } });
    if (!assignment) throw new Error("Assignment not found");
    assertCollectorAccess(assignment, collectorId);
    if (!COLLECTOR_EDITABLE.includes(assignment.status)) {
      throw new Error("This assignment can no longer be edited");
    }

    const normalized = normalizePayload(assignment.type, payload);
    if (assignment.type === "REGISTER_ADDRESSES") {
      validateDraftAddresses(normalized.addresses, { requireCoordinates: false });
    } else {
      validateDraftZoneBlocks(normalized.zoneBlocks, { requireGeometry: false });
    }

    return prisma.assignment.update({
      where: { id },
      data: {
        payload: normalized,
        status: assignment.status === "ASSIGNED" ? "IN_PROGRESS" : assignment.status,
        rejectionReason: assignment.status === "REJECTED" ? null : assignment.rejectionReason,
      },
      include: assignmentInclude,
    });
  },

  submitChildAssignment: async (id, collectorId) => {
    const assignment = await prisma.assignment.findUnique({ where: { id } });
    if (!assignment) throw new Error("Assignment not found");
    assertCollectorAccess(assignment, collectorId);
    if (!COLLECTOR_EDITABLE.includes(assignment.status)) {
      throw new Error("This assignment can no longer be edited");
    }

    const normalized = normalizePayload(assignment.type, assignment.payload);
    if (assignment.type === "REGISTER_ADDRESSES") {
      if (!assignment.zoneBlockId) throw new Error("Assignment zone block is missing");
      await validateRegisterAddressesSubmission(assignment.zoneBlockId, normalized.addresses);
    } else {
      await validateDefineZoneBlocksSubmission(assignment.zoneId, normalized.zoneBlocks);
    }

    return prisma.assignment.update({
      where: { id },
      data: {
        payload: normalized,
        status: "SUBMITTED",
        submittedAt: new Date(),
        rejectionReason: null,
      },
      include: assignmentInclude,
    });
  },

  approveChildAssignment: async (childId, officerId) => {
    const child = await fetchAssignment(childId);
    if (child.tier !== "CHILD" || child.parent?.assignedToId !== officerId) {
      throw new Error("You do not have access to this assignment");
    }
    if (child.status !== "SUBMITTED") {
      throw new Error("Only submitted child assignments can be approved");
    }

    const updated = await prisma.assignment.update({
      where: { id: childId },
      data: {
        status: "APPROVED",
        officerReviewedAt: new Date(),
        officerReviewedById: officerId,
        rejectionReason: null,
      },
      include: assignmentInclude,
    });

    await syncParentStatus(child.parentAssignmentId);
    return updated;
  },

  rejectChildAssignment: async (childId, officerId, rejectionReason) => {
    const child = await fetchAssignment(childId);
    if (child.tier !== "CHILD" || child.parent?.assignedToId !== officerId) {
      throw new Error("You do not have access to this assignment");
    }
    if (child.status !== "SUBMITTED") {
      throw new Error("Only submitted child assignments can be rejected");
    }
    if (!rejectionReason?.trim()) throw new Error("Rejection reason is required");

    const updated = await prisma.assignment.update({
      where: { id: childId },
      data: {
        status: "REJECTED",
        officerReviewedAt: new Date(),
        officerReviewedById: officerId,
        rejectionReason: rejectionReason.trim(),
      },
      include: assignmentInclude,
    });

    if (child.parentAssignmentId) {
      await prisma.assignment.update({
        where: { id: child.parentAssignmentId },
        data: { status: "IN_PROGRESS" },
      });
    }

    return updated;
  },

  mergeParentAssignment: async (parentId, officerId) => {
    const parent = await fetchAssignment(parentId);
    assertOfficerParentAccess(parent, officerId);

    const children = await prisma.assignment.findMany({
      where: { parentAssignmentId: parentId, status: "APPROVED" },
      orderBy: [{ mergeOrder: "asc" }, { createdAt: "asc" }],
    });

    if (!children.length) {
      throw new Error("At least one approved child assignment is required to merge");
    }

    let mergedPayload;
    if (parent.type === "REGISTER_ADDRESSES") {
      mergedPayload = {
        addresses: children.flatMap((child) =>
          normalizePayload(child.type, child.payload).addresses
        ),
      };
      if (!parent.zoneBlockId) throw new Error("Parent assignment zone block is missing");
      await validateRegisterAddressesSubmission(parent.zoneBlockId, mergedPayload.addresses);
    } else {
      mergedPayload = {
        zoneBlocks: children.flatMap(
          (child) => normalizePayload(child.type, child.payload).zoneBlocks
        ),
      };
      await validateDefineZoneBlocksSubmission(parent.zoneId, mergedPayload.zoneBlocks);
    }

    return prisma.assignment.update({
      where: { id: parentId },
      data: {
        payload: mergedPayload,
        status: "READY_FOR_REVIEW",
      },
      include: assignmentInclude,
    });
  },

  submitParentToAdmin: async (parentId, officerId) => {
    const parent = await prisma.assignment.findUnique({ where: { id: parentId } });
    if (!parent) throw new Error("Assignment not found");
    assertOfficerParentAccess(parent, officerId);

    if (!["READY_FOR_REVIEW", "REJECTED"].includes(parent.status)) {
      throw new Error("Parent assignment must be ready for review before submitting to admin");
    }

    const normalized = normalizePayload(parent.type, parent.payload);
    if (parent.type === "REGISTER_ADDRESSES") {
      if (!parent.zoneBlockId) throw new Error("Assignment zone block is missing");
      await validateRegisterAddressesSubmission(parent.zoneBlockId, normalized.addresses);
    } else {
      await validateDefineZoneBlocksSubmission(parent.zoneId, normalized.zoneBlocks);
    }

    return prisma.assignment.update({
      where: { id: parentId },
      data: {
        payload: normalized,
        status: "SUBMITTED",
        submittedAt: new Date(),
        rejectionReason: null,
      },
      include: assignmentInclude,
    });
  },

  approveAssignment: async (id, reviewerId) => {
    const assignment = await prisma.assignment.findUnique({ where: { id } });
    if (!assignment) throw new Error("Assignment not found");
    assertAdminParentAccess(assignment);

    if (assignment.status !== "SUBMITTED") {
      throw new Error("Only submitted assignments can be approved");
    }

    const normalized = normalizePayload(assignment.type, assignment.payload);

    if (assignment.type === "REGISTER_ADDRESSES") {
      if (!assignment.zoneBlockId) throw new Error("Assignment zone block is missing");
      await validateRegisterAddressesSubmission(assignment.zoneBlockId, normalized.addresses);

      const createdAddresses = await AddressService.createAddressesFromDraftBatch(
        assignment.zoneBlockId,
        normalized.addresses
      );

      const updated = await prisma.assignment.update({
        where: { id },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
          reviewedById: reviewerId,
          rejectionReason: null,
        },
        include: assignmentInclude,
      });

      return { assignment: updated, createdAddresses };
    }

    await validateDefineZoneBlocksSubmission(assignment.zoneId, normalized.zoneBlocks);
    const createdZoneBlocks = [];
    for (const zoneBlock of normalized.zoneBlocks) {
      createdZoneBlocks.push(
        await ZoneBlockService.createZoneBlock({
          zoneId: assignment.zoneId,
          name: zoneBlock.name,
          code: zoneBlock.code,
          status: zoneBlock.status,
          geometry: zoneBlock.geometry,
        })
      );
    }

    const updated = await prisma.assignment.update({
      where: { id },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewedById: reviewerId,
        rejectionReason: null,
      },
      include: assignmentInclude,
    });

    return { assignment: updated, createdZoneBlocks };
  },

  rejectAssignment: async (id, reviewerId, rejectionReason) => {
    const assignment = await prisma.assignment.findUnique({ where: { id } });
    if (!assignment) throw new Error("Assignment not found");
    assertAdminParentAccess(assignment);

    if (assignment.status !== "SUBMITTED") {
      throw new Error("Only submitted assignments can be rejected");
    }
    if (!rejectionReason?.trim()) throw new Error("Rejection reason is required");

    return prisma.assignment.update({
      where: { id },
      data: {
        status: "REJECTED",
        reviewedAt: new Date(),
        reviewedById: reviewerId,
        rejectionReason: rejectionReason.trim(),
      },
      include: assignmentInclude,
    });
  },
};
