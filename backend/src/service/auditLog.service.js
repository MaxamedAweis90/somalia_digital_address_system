import { prisma } from "../db.js";

const VALID_ACTION_TYPES = ["CREATE", "UPDATE", "DELETE"];

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
    if (!userId || typeof userId !== "string" || !userId.trim()) {
      throw new Error("User ID is required for audit logging");
    }
    if (!action || typeof action !== "string" || !action.trim()) {
      throw new Error("Action description is required");
    }
    if (!actionType) {
      throw new Error("Action type is required");
    }
    if (!entityId || typeof entityId !== "string" || !entityId.trim()) {
      throw new Error("Entity ID is required");
    }

    const uppercaseActionType = String(actionType).toUpperCase();
    if (!VALID_ACTION_TYPES.includes(uppercaseActionType)) {
      throw new Error(`Invalid action type: must be one of ${VALID_ACTION_TYPES.join(", ")}`);
    }

    return prisma.auditLog.create({
      data: {
        userId: userId.trim(),
        action: action.trim(),
        actionType: uppercaseActionType,
        entityId: entityId.trim(),
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
    // Robust parsing for numbers to prevent NaN/invalid inputs
    let parsedPage = parseInt(page, 10);
    let parsedLimit = parseInt(limit, 10);

    if (isNaN(parsedPage) || parsedPage < 1) {
      parsedPage = 1;
    }
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      parsedLimit = 10;
    }

    const skip = (parsedPage - 1) * parsedLimit;
    const take = parsedLimit;

    // Build filter criteria
    const where = {};

    if (actionType) {
      const uppercaseActionType = String(actionType).toUpperCase();
      if (VALID_ACTION_TYPES.includes(uppercaseActionType)) {
        where.actionType = uppercaseActionType;
      } else {
        throw new Error(`Invalid action type filter: must be one of ${VALID_ACTION_TYPES.join(", ")}`);
      }
    }

    if (search && typeof search === "string" && search.trim()) {
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
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
      },
    };
  },
};
