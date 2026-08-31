import api from "./axios";

/**
 * Fetch paginated audit logs with filters.
 * @param {Object} params - Query params like page, limit, actionType, search, startDate, endDate
 */
export const getAuditLogs = (params) => api.get("/audit-logs", { params });

/**
 * Fetch daily audit activity summary for calendar heatmap.
 * @param {Object} params - Query params like year, month, startDate, endDate
 */
export const getActivitySummary = (params) => api.get("/audit-logs/activity-summary", { params });
