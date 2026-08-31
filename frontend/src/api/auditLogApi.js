import api from "./axios";

/**
 * Fetch paginated audit logs with filters.
 * @param {Object} params - Query params like page, limit, actionType, search
 */
export const getAuditLogs = (params) => api.get("/audit-logs", { params });
