import { prisma } from "../db.js";

export function isParentAssignment(assignment) {
  return assignment.tier === "PARENT";
}

export function isChildAssignment(assignment) {
  return assignment.tier === "CHILD";
}

export async function assertUserRole(userId, role) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user || user.role !== role) {
    throw new Error(`User must be a ${role.toLowerCase().replace("_", " ")}`);
  }

  return user;
}

export async function assertSupervisedCollector(collectorId, officerId) {
  const collector = await prisma.user.findUnique({
    where: { id: collectorId },
    select: { id: true, role: true, supervisorId: true },
  });

  if (!collector || collector.role !== "DATA_COLLECTOR") {
    throw new Error("Assigned user must be a data collector");
  }

  if (collector.supervisorId !== officerId) {
    throw new Error("You can only assign tasks to collectors on your team");
  }

  return collector;
}

export function assertCollectorAccess(assignment, userId) {
  if (assignment.assignedToId !== userId) {
    throw new Error("You do not have access to this assignment");
  }

  if (assignment.tier !== "CHILD") {
    throw new Error("Collectors can only access child assignments");
  }
}

export function assertOfficerParentAccess(assignment, userId) {
  if (assignment.tier !== "PARENT" || assignment.assignedToId !== userId) {
    throw new Error("You do not have access to this assignment");
  }
}

export function assertAdminParentAccess(assignment) {
  if (assignment.tier !== "PARENT") {
    throw new Error("Admin can only review parent assignments");
  }
}
