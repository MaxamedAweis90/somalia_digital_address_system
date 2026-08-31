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
  parent: {
    include: {
      assignedTo: { select: userSelect },
    },
  },
  children: {
    include: {
      assignedTo: { select: userSelect },
      assignedBy: { select: userSelect },
    },
    orderBy: { createdAt: "asc" },
  },
};

const EDITABLE_STATUSES = ["ASSIGNED", "IN_PROGRESS", "REJECTED"];

function formatAssignment(item) {
  if (!item) return item;
  const children = item.children || [];
  const delegatedCount = children.length;
  const submittedCount = children.filter((c) => c.status === "SUBMITTED").length;
  const approvedCount = children.filter((c) => c.status === "APPROVED").length;
  const expectedCollectorCount = item.expectedCollectorCount ?? 1;

  return {
    ...item,
    expectedCollectorCount,
    delegatedCount,
    submittedCount,
    approvedCount,
  };
}

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

function validateExpectedCollectorCount(value) {
  if (value === undefined || value === null || value === "") {
    throw new Error("expectedCollectorCount is required when creating an assignment");
  }

  const num = Number(value);
  if (!Number.isInteger(num) || num < 1 || num > 50) {
    throw new Error("expectedCollectorCount must be an integer between 1 and 50");
  }

  return num;
}

async function assertOfficer(userId) {
  if (!userId || typeof userId !== "string" || !userId.trim()) {
    throw new Error("Assigned user must be a data officer");
  }

  const officer = await prisma.user.findUnique({
    where: { id: userId.trim() },
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
  createAssignment: async (
    { neighborhoodId, assignedToId, notes, dueAt, type, expectedCollectorCount },
    actorId
  ) => {
    if (!neighborhoodId || !assignedToId) {
      throw new Error("Neighborhood and data officer are required");
    }

    const count = validateExpectedCollectorCount(expectedCollectorCount);
    await assertNeighborhood(neighborhoodId);
    await assertOfficer(assignedToId);

    const assignment = await prisma.assignments.create({
      data: {
        type: type || "DEFINE_ZONES",
        neighborhoodId,
        assignedToId,
        assignedById: actorId,
        expectedCollectorCount: count,
        notes: notes?.trim() || null,
        dueAt: dueAt ? new Date(dueAt) : null,
        payload: { zones: [] },
      },
      include: assignmentInclude,
    });

    return formatAssignment(assignment);
  },

  createChildAssignment: async (parentId, { assignedToId, notes, dueAt }, actorId) => {
    if (!parentId) {
      throw new Error("Parent assignment ID is required");
    }
    if (!assignedToId) {
      throw new Error("Data collector is required");
    }

    await assertOfficer(assignedToId);

    return prisma.$transaction(async (tx) => {
      const parent = await tx.assignments.findUnique({
        where: { id: parentId },
        include: {
          children: true,
        },
      });

      if (!parent) {
        throw new Error("Parent assignment not found");
      }

      if (parent.assignedToId !== actorId) {
        throw new Error("You do not have permission to delegate tasks for this assignment");
      }

      const limit = parent.expectedCollectorCount ?? 1;
      const currentChildren = parent.children || [];

      if (currentChildren.length >= limit) {
        throw new Error(
          `This assignment already has the maximum number of collector tasks (${currentChildren.length}/${limit}).`
        );
      }

      const duplicateCollector = currentChildren.some(
        (child) => child.assignedToId === assignedToId
      );
      if (duplicateCollector) {
        throw new Error("This collector is already assigned to a task under this assignment.");
      }

      const child = await tx.assignments.create({
        data: {
          parentId,
          type: parent.type,
          neighborhoodId: parent.neighborhoodId,
          assignedToId,
          assignedById: actorId,
          notes: notes?.trim() || null,
          dueAt: dueAt ? new Date(dueAt) : null,
          payload: { zones: [] },
        },
        include: assignmentInclude,
      });

      return formatAssignment(child);
    });
  },

  getAssignments: async () => {
    const list = await prisma.assignments.findMany({
      include: assignmentInclude,
      orderBy: { createdAt: "desc" },
    });
    return list.map(formatAssignment);
  },

  getMyAssignments: async (userId) => {
    const list = await prisma.assignments.findMany({
      where: { assignedToId: userId },
      include: assignmentInclude,
      orderBy: { createdAt: "desc" },
    });
    return list.map(formatAssignment);
  },

  getAssignmentById: async (id, user) => {
    const assignment = await prisma.assignments.findUnique({
      where: { id },
      include: assignmentInclude,
    });

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    if (user.role === "DATA_OFFICER") {
      if (assignment.assignedToId !== user.id && assignment.parentId) {
        const parent = await prisma.assignments.findUnique({
          where: { id: assignment.parentId },
        });
        if (!parent || parent.assignedToId !== user.id) {
          assertOfficerAccess(assignment, user.id);
        }
      } else {
        assertOfficerAccess(assignment, user.id);
      }
    }

    return formatAssignment(assignment);
  },

  saveDraft: async (id, payload, userId) => {
    const assignment = await prisma.assignments.findUnique({
      where: { id },
    });

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    assertOfficerAccess(assignment, userId);
    assertEditable(assignment);

    const normalized = normalizePayload(payload);
    validateDraftZones(normalized.zones, { requireGeometry: false });

    const updated = await prisma.assignments.update({
      where: { id },
      data: {
        payload: normalized,
        status: assignment.status === "ASSIGNED" ? "IN_PROGRESS" : assignment.status,
        rejectionReason: assignment.status === "REJECTED" ? null : assignment.rejectionReason,
      },
      include: assignmentInclude,
    });

    return formatAssignment(updated);
  },

  submitAssignment: async (id, userId) => {
    const assignment = await prisma.assignments.findUnique({
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

    const updated = await prisma.assignments.update({
      where: { id },
      data: {
        payload: normalized,
        status: "SUBMITTED",
        submittedAt: new Date(),
        rejectionReason: null,
      },
      include: assignmentInclude,
    });

    return formatAssignment(updated);
  },

  approveAssignment: async (id, reviewerId) => {
    const assignment = await prisma.assignments.findUnique({
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

    const updated = await prisma.assignments.update({
      where: { id },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewedById: reviewerId,
        rejectionReason: null,
      },
      include: assignmentInclude,
    });

    return { assignment: formatAssignment(updated), createdZones };
  },

  rejectAssignment: async (id, reviewerId, rejectionReason) => {
    const assignment = await prisma.assignments.findUnique({
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

    const updated = await prisma.assignments.update({
      where: { id },
      data: {
        status: "REJECTED",
        reviewedAt: new Date(),
        reviewedById: reviewerId,
        rejectionReason: rejectionReason.trim(),
      },
      include: assignmentInclude,
    });

    return formatAssignment(updated);
  },
};
