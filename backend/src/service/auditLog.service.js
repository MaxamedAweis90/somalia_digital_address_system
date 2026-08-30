import { prisma } from "../db.js";

export const AuditLogService = {
  /**
   * Helper function to log system activities.
   * @param {Object} params
   * @param {string} params.userId - ID of the user performing the action
   * @param {string} params.action - Description of the action performed
   * @param {'CREATE'|'UPDATE'|'DELETE'} params.actionType - Type of action
   * @param {string} params.entityId - ID of the entity that was acted upon
   * @returns {Promise<Object>} The created audit log entry
   */
  createAuditLog: async ({ userId, action, actionType, entityId }) => {
    if (!userId) {
      throw new Error("User ID is required for audit logging");
    }
    if (!action?.trim()) {
      throw new Error("Action description is required");
    }
    if (!actionType) {
      throw new Error("Action type is required");
    }
    if (!entityId) {
      throw new Error("Entity ID is required");
    }

    return prisma.auditLog.create({
      data: {
        userId,
        action: action.trim(),
        actionType,
        entityId,
      },
    });
  },

  /**
   * Fetch paginated audit logs with search filter and user relation.
   * @param {Object} params
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Number of items per page
   * @param {'CREATE'|'UPDATE'|'DELETE'} [params.actionType] - Optional filter for action type
   * @param {string} [params.search] - Optional search query
   * @returns {Promise<{logs: Array, pagination: Object}>} Paginated logs and metadata
   */
  getAuditLogs: async ({ page = 1, limit = 10, actionType, search }) => {
    const skip = (page - 1) * limit;
    const take = Number(limit);

    // Build filter criteria
    const where = {};

    if (actionType) {
      where.actionType = actionType;
    }

    if (search?.trim()) {
      const searchPattern = search.trim();
      where.OR = [
        { action: { contains: searchPattern, mode: "insensitive" } },
        { entityId: { contains: searchPattern, mode: "insensitive" } },
        {
          user: {
            OR: [
              { name: { contains: searchPattern, mode: "insensitive" } },
              { email: { contains: searchPattern, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    // Execute count and data fetch in parallel
    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { timestamp: "desc" },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return {
      logs,
      pagination: {
        total,
        page: Number(page),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  },
};
