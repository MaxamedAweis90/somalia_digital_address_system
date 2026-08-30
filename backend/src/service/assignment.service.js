import { prisma } from "../db.js";
import { validatePolygonGeometry } from "../utils/geojson.utils.js";
import { ZoneService } from "./zone.service.js";

const userSelect = {
  id: true,
  name: true,
  email: true,
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
  assignedTo: { select: userSelect },
  assignedBy: { select: userSelect },
  reviewedBy: { select: userSelect },
};

const EDITABLE_STATUSES = ["ASSIGNED", "IN_PROGRESS", "REJECTED"];

function normalizePayload(payload) {
  if (!payload || typeof payload !== "object") {
    return { zones: [] };
  }

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

function validateDraftZones(zones, { requireGeometry = false } = {}) {
  if (!zones.length) {
    throw new Error("Add at least one zone before submitting");
  }

  const codes = new Set();

  zones.forEach((zone, index) => {
    const label = `Zone ${index + 1}`;

    if (!zone.name) {
      throw new Error(`${label}: name is required`);
    }

    if (!zone.code) {
      throw new Error(`${label}: code is required`);
    }

    if (codes.has(zone.code)) {
      throw new Error(`Duplicate zone code "${zone.code}" in draft`);
    }

    codes.add(zone.code);

    if (requireGeometry) {
      validatePolygonGeometry(zone.geometry);
    } else if (zone.geometry) {
      validatePolygonGeometry(zone.geometry);
    }
  });
}

async function assertOfficer(userId) {
  const officer = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!officer || officer.role !== "DATA_OFFICER") {
    throw new Error("Assigned user must be a data officer");
  }
}

async function assertNeighborhood(neighborhoodId) {
  const neighborhood = await prisma.neighborhood.findUnique({
    where: { id: neighborhoodId },
    select: { id: true },
  });

  if (!neighborhood) {
    throw new Error("Neighborhood not found");
  }
}

async function assertNoCodeConflicts(neighborhoodId, zones) {
  const codes = zones.map((zone) => zone.code);

  if (!codes.length) return;

  const existing = await prisma.zone.findMany({
    where: {
      neighborhoodId,
      code: { in: codes },
    },
    select: { code: true },
  });

  if (existing.length) {
    throw new Error(
      `Zone code(s) already exist in this neighborhood: ${existing.map((z) => z.code).join(", ")}`
    );
  }
}

function assertOfficerAccess(assignment, userId) {
  if (assignment.assignedToId !== userId) {
    throw new Error("You do not have access to this assignment");
  }
}

function assertEditable(assignment) {
  if (!EDITABLE_STATUSES.includes(assignment.status)) {
    throw new Error("This assignment can no longer be edited");
  }
}

export const AssignmentService = {
  createAssignment: async ({ neighborhoodId, assignedToId, notes, dueAt }, actorId) => {
    if (!neighborhoodId || !assignedToId) {
      throw new Error("Neighborhood and data officer are required");
    }

    await assertNeighborhood(neighborhoodId);
    await assertOfficer(assignedToId);

    return prisma.assignment.create({
      data: {
        type: "DEFINE_ZONES",
        neighborhoodId,
        assignedToId,
        assignedById: actorId,
        notes: notes?.trim() || null,
        dueAt: dueAt ? new Date(dueAt) : null,
        payload: { zones: [] },
      },
      include: assignmentInclude,
    });
  },

  getAssignments: async () => {
    return prisma.assignment.findMany({
      include: assignmentInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  getMyAssignments: async (userId) => {
    return prisma.assignment.findMany({
      where: { assignedToId: userId },
      include: assignmentInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  getAssignmentById: async (id, user) => {
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: assignmentInclude,
    });

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    if (user.role === "DATA_OFFICER") {
      assertOfficerAccess(assignment, user.id);
    }

    return assignment;
  },

  saveDraft: async (id, payload, userId) => {
    const assignment = await prisma.assignment.findUnique({
      where: { id },
    });

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    assertOfficerAccess(assignment, userId);
    assertEditable(assignment);

    const normalized = normalizePayload(payload);
    validateDraftZones(normalized.zones, { requireGeometry: false });

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

  submitAssignment: async (id, userId) => {
    const assignment = await prisma.assignment.findUnique({
      where: { id },
    });

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    assertOfficerAccess(assignment, userId);
    assertEditable(assignment);

    const normalized = normalizePayload(assignment.payload);
    validateDraftZones(normalized.zones, { requireGeometry: true });
    await assertNoCodeConflicts(assignment.neighborhoodId, normalized.zones);

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

  approveAssignment: async (id, reviewerId) => {
    const assignment = await prisma.assignment.findUnique({
      where: { id },
    });

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    if (assignment.status !== "SUBMITTED") {
      throw new Error("Only submitted assignments can be approved");
    }

    const normalized = normalizePayload(assignment.payload);
    validateDraftZones(normalized.zones, { requireGeometry: true });
    await assertNoCodeConflicts(assignment.neighborhoodId, normalized.zones);

    const createdZones = [];

    for (const zone of normalized.zones) {
      const created = await ZoneService.createZone({
        neighborhoodId: assignment.neighborhoodId,
        name: zone.name,
        code: zone.code,
        status: zone.status,
        geometry: zone.geometry,
      });
      createdZones.push(created);
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
    const assignment = await prisma.assignment.findUnique({
      where: { id },
    });

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    if (assignment.status !== "SUBMITTED") {
      throw new Error("Only submitted assignments can be rejected");
    }

    if (!rejectionReason?.trim()) {
      throw new Error("Rejection reason is required");
    }

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
