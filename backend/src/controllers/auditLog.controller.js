import { AuditLogService } from "../service/auditLog.service.js";
import { getErrorMessage } from "../utils/prisma-error.utils.js";

/**
 * Controller to fetch paginated audit logs based on query parameters.
 * GET /api/v1/audit-logs
 */
export const getAuditLogsController = async (req, res) => {
  try {
    const { page, limit, actionType, search, startDate, endDate } = req.query;

    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;

    const data = await AuditLogService.getAuditLogs({
      page: isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage,
      limit: isNaN(parsedLimit) || parsedLimit < 1 ? 10 : parsedLimit,
      actionType,
      search,
      startDate,
      endDate,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

/**
 * Controller to fetch aggregated daily audit activity for heatmap calendar.
 * GET /api/v1/audit-logs/activity-summary
 */
export const getActivitySummaryController = async (req, res) => {
  try {
    const { year, month, startDate, endDate } = req.query;

    const data = await AuditLogService.getActivitySummary({
      year: year ? parseInt(year, 10) : undefined,
      month: month ? parseInt(month, 10) : undefined,
      startDate,
      endDate,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};
