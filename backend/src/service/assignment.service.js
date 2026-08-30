import { prisma } from "../db.js";
import { validatePolygonGeometry } from "../utils/geojson.utils.js";
import {
  assertZonesDoNotOverlap,
  assertZonesWithinNeighborhood,
  isPointWithinZone,
} from "../utils/geo.validation.utils.js";
import {
  assertAdminParentAccess,
  assertCollectorAccess,
  assertOfficerParentAccess,
  assertSupervisedCollector,
  assertUserRole,
} from "../utils/assignment-access.utils.js";
import { AddressService } from "./address.service.js";
import { ZoneService } from "./zone.service.js";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
};

const assignmentInclude = {
  neighborhood: {
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
  zone: {
    select: {
      id: true,
      name: true,
      code: true,
      status: true,
      neighborhoodId: true,
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
  DEFINE_ZONES: { zones: [] },
  REGISTER_ADDRESSES: { addresses: [] },
};

function isValidCoordinate(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizeZonePayload(payload) {
  if (!payload || typeof payload !== "object") return { zones: [] };
  const zones = Array.isArray(payload.zones) ? payload.zones : [];
  return {
    zones: zones.map((zone, index) => ({
      clientId: zone.clientId || `zone-${index + 1}`,
      name: zone.name?.trim() || "",
      code: zone.code?.trim().toUpperCase() || "",
      status: zone.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
      geometry: zone.geometry || null,
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
  return normalizeZonePayload(payload);
}

function validateDraftZones(zones, { requireGeometry = false } = {}) {
  if (!zones.length) throw new Error("Add at least one zone before submitting");
  const codes = new Set();
  zones.forEach((zone, index) => {
    const label = `Zone ${index + 1}`;
    if (!zone.name) throw new Error(`${label}: name is required`);
    if (!zone.code) throw new Error(`${label}: code is required`);
    if (codes.has(zone.code)) throw new Error(`Duplicate zone code "${zone.code}" in draft`);
    codes.add(zone.code);
    if (requireGeometry) validatePolygonGeometry(zone.geometry);
    else if (zone.geometry) validatePolygonGeometry(zone.geometry);
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

async function assertNeighborhood(neighborhoodId) {
  const neighborhood = await prisma.neighborhood.findUnique({
    where: { id: neighborhoodId },
    select: { id: true },
  });
  if (!neighborhood) throw new Error("Neighborhood not found");
}

async function assertZoneForAssignment(zoneId) {
  const rows = await prisma.$queryRaw`
    SELECT z.id, z.neighborhood_id AS "neighborhoodId", z.status,
      (z.geometry IS NOT NULL) AS "hasGeometry"
    FROM zones z WHERE z.id = ${zoneId} LIMIT 1
  `;
  const zone = rows[0];
  if (!zone) throw new Error("Zone not found");
  if (zone.status !== "ACTIVE") throw new Error("Zone must be active to register addresses");
  if (!zone.hasGeometry) {
    throw new Error("Zone must have a boundary polygon before address registration can be assigned");
  }
  return zone;
}

async function assertNoCodeConflicts(neighborhoodId, zones) {
  const codes = zones.map((z) => z.code);
  if (!codes.length) return;
  const existing = await prisma.zone.findMany({
    where: { neighborhoodId, code: { in: codes } },
    select: { code: true },
  });
  if (existing.length) {
    throw new Error(
      `Zone code(s) already exist in this neighborhood: ${existing.map((z) => z.code).join(", ")}`
    );
  }
}

async function assertAddressesWithinZone(zoneId, addresses) {
  for (const address of addresses) {
    const within = await isPointWithinZone({
      latitude: address.latitude,
      longitude: address.longitude,
      zoneId,
    });
    if (!within) {
      throw new Error(`Address "${address.streetName}" is outside the assigned zone boundary`);
    }
  }
}

async function validateDefineZonesSubmission(neighborhoodId, zones) {
  validateDraftZones(zones, { requireGeometry: true });
  await assertNoCodeConflicts(neighborhoodId, zones);
  await assertZonesWithinNeighborhood(zones, neighborhoodId);
  await assertZonesDoNotOverlap(zones);
}

async function validateRegisterAddressesSubmission(zoneId, addresses) {
  validateDraftAddresses(addresses, { requireCoordinates: true });
  await assertAddressesWithinZone(zoneId, addresses);
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
    { type = "DEFINE_ZONES", neighborhoodId, zoneId, assignedToId, notes, dueAt },
    actorId
  ) => {
    if (!assignedToId) throw new Error("Data officer is required");
    await assertUserRole(assignedToId, "DATA_OFFICER");

    const assignmentType = type || "DEFINE_ZONES";
    if (!["DEFINE_ZONES", "REGISTER_ADDRESSES"].includes(assignmentType)) {
      throw new Error("Invalid assignment type");
    }

    let resolvedNeighborhoodId = neighborhoodId;
    let resolvedZoneId = null;
    let initialPayload = DEFAULT_PAYLOAD.DEFINE_ZONES;

    if (assignmentType === "DEFINE_ZONES") {
      if (!neighborhoodId) throw new Error("Neighborhood is required for zone definition assignments");
      await assertNeighborhood(neighborhoodId);
      initialPayload = DEFAULT_PAYLOAD.DEFINE_ZONES;
    } else {
      if (!zoneId) throw new Error("Zone is required for address registration assignments");
      const zone = await assertZoneForAssignment(zoneId);
      resolvedNeighborhoodId = zone.neighborhoodId;
      resolvedZoneId = zone.id;
      initialPayload = DEFAULT_PAYLOAD.REGISTER_ADDRESSES;
    }

    return prisma.assignment.create({
      data: {
        type: assignmentType,
        tier: "PARENT",
        neighborhoodId: resolvedNeighborhoodId,
        zoneId: resolvedZoneId,
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
        : DEFAULT_PAYLOAD.DEFINE_ZONES;

    const child = await prisma.assignment.create({
      data: {
        type: parent.type,
        tier: "CHILD",
        parentAssignmentId: parent.id,
        neighborhoodId: parent.neighborhoodId,
        zoneId: parent.zoneId,
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
      validateDraftZones(normalized.zones, { requireGeometry: false });
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
      if (!assignment.zoneId) throw new Error("Assignment zone is missing");
      await validateRegisterAddressesSubmission(assignment.zoneId, normalized.addresses);
    } else {
      await validateDefineZonesSubmission(assignment.neighborhoodId, normalized.zones);
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
      if (!parent.zoneId) throw new Error("Parent assignment zone is missing");
      await validateRegisterAddressesSubmission(parent.zoneId, mergedPayload.addresses);
    } else {
      mergedPayload = {
        zones: children.flatMap((child) => normalizePayload(child.type, child.payload).zones),
      };
      await validateDefineZonesSubmission(parent.neighborhoodId, mergedPayload.zones);
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
      if (!parent.zoneId) throw new Error("Assignment zone is missing");
      await validateRegisterAddressesSubmission(parent.zoneId, normalized.addresses);
    } else {
      await validateDefineZonesSubmission(parent.neighborhoodId, normalized.zones);
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
      if (!assignment.zoneId) throw new Error("Assignment zone is missing");
      await validateRegisterAddressesSubmission(assignment.zoneId, normalized.addresses);

      const createdAddresses = await AddressService.createAddressesFromDraftBatch(
        assignment.zoneId,
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

    await validateDefineZonesSubmission(assignment.neighborhoodId, normalized.zones);
    const createdZones = [];
    for (const zone of normalized.zones) {
      createdZones.push(
        await ZoneService.createZone({
          neighborhoodId: assignment.neighborhoodId,
          name: zone.name,
          code: zone.code,
          status: zone.status,
          geometry: zone.geometry,
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

    return { assignment: updated, createdZones };
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
