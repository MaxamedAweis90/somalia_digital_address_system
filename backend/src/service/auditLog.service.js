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
   * Non-blocking helper function for audit logging.
   * Catches and logs errors without bubbling to interrupt primary business logic.
   */
  logSafe: async ({ userId, action, actionType, entityId }) => {
    try {
      if (!userId || !entityId || !action || !actionType) return null;
      return await AuditLogService.createAuditLog({ userId, action, actionType, entityId });
    } catch (error) {
      console.error("AuditLog warning (non-blocking):", error?.message || error);
      return null;
    }
  },

  /**
   * Fetch paginated audit logs with search filter, date range, and user relation.
   * @param {Object} params
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Number of items per page
   * @param {'CREATE'|'UPDATE'|'DELETE'} [params.actionType] - Optional filter for action type
   * @param {string} [params.search] - Optional search query
   * @param {string|Date} [params.startDate] - Optional start date (YYYY-MM-DD or ISO)
   * @param {string|Date} [params.endDate] - Optional end date (YYYY-MM-DD or ISO)
   * @returns {Promise<{logs: Array, pagination: Object}>} Paginated logs and metadata
   */
  getAuditLogs: async ({
    page = 1,
    limit = 10,
    actionType,
    search,
    startDate,
    endDate,
  }) => {
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
        throw new Error(
          `Invalid action type filter: must be one of ${VALID_ACTION_TYPES.join(", ")}`
        );
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

    // Date range filters
    if (startDate || endDate) {
      where.timestamp = {};

      if (startDate) {
        const startStr = String(startDate).trim();
        const startParsed = new Date(
          startStr.includes("T") ? startStr : `${startStr}T00:00:00.000Z`
        );
        if (!isNaN(startParsed.getTime())) {
          where.timestamp.gte = startParsed;
        }
      }

      if (endDate) {
        const endStr = String(endDate).trim();
        const endParsed = new Date(
          endStr.includes("T") ? endStr : `${endStr}T23:59:59.999Z`
        );
        if (!isNaN(endParsed.getTime())) {
          where.timestamp.lte = endParsed;
        }
      }

      // If neither date was valid, remove empty object
      if (Object.keys(where.timestamp).length === 0) {
        delete where.timestamp;
      }
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
              role: true,
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

  /**
   * Aggregate daily activity counts for a given month/year or date range.
   * Powers the heatmap calendar highlight colors.
   * @param {Object} params
   * @param {number} [params.year] - Year (e.g. 2026)
   * @param {number} [params.month] - Month (1-12)
   * @param {string} [params.startDate] - Optional custom start date (YYYY-MM-DD)
   * @param {string} [params.endDate] - Optional custom end date (YYYY-MM-DD)
   * @returns {Promise<{summary: Object, total: number}>} Summary mapped by YYYY-MM-DD
   */
  getActivitySummary: async ({ year, month, startDate, endDate }) => {
    let startRange;
    let endRange;

    if (startDate && endDate) {
      const s = String(startDate).trim();
      const e = String(endDate).trim();
      startRange = new Date(s.includes("T") ? s : `${s}T00:00:00.000Z`);
      endRange = new Date(e.includes("T") ? e : `${e}T23:59:59.999Z`);
    } else {
      const now = new Date();
      const targetYear = parseInt(year, 10) || now.getFullYear();
      const targetMonth = parseInt(month, 10) || now.getMonth() + 1; // 1-indexed

      // Start of the given month
      startRange = new Date(Date.UTC(targetYear, targetMonth - 1, 1, 0, 0, 0, 0));
      // End of the given month (day 0 of next month is the last day of target month)
      endRange = new Date(Date.UTC(targetYear, targetMonth, 0, 23, 59, 59, 999));
    }

    if (isNaN(startRange.getTime()) || isNaN(endRange.getTime())) {
      throw new Error("Invalid date parameters provided for activity summary");
    }

    const logs = await prisma.auditLog.findMany({
      where: {
        timestamp: {
          gte: startRange,
          lte: endRange,
        },
      },
      select: {
        timestamp: true,
        actionType: true,
      },
    });

    const summary = {};
    let totalActions = 0;

    for (const log of logs) {
      if (!log.timestamp) continue;
      const dateStr = log.timestamp.toISOString().split("T")[0]; // "YYYY-MM-DD"
      
      if (!summary[dateStr]) {
        summary[dateStr] = {
          date: dateStr,
          count: 0,
          createCount: 0,
          updateCount: 0,
          deleteCount: 0,
        };
      }

      summary[dateStr].count += 1;
      totalActions += 1;

      if (log.actionType === "CREATE") summary[dateStr].createCount += 1;
      else if (log.actionType === "UPDATE") summary[dateStr].updateCount += 1;
      else if (log.actionType === "DELETE") summary[dateStr].deleteCount += 1;
    }

    return {
      summary,
      totalActions,
      startDate: startRange.toISOString(),
      endDate: endRange.toISOString(),
    };
  },
};
