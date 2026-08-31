import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Filter,
} from "lucide-react";
import { getAuditLogs, getActivitySummary } from "@/api/auditLogApi";
import AuditCalendarFilter from "@/components/audit/AuditCalendarFilter";

export default function AuditLogsPage() {
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [actionType, setActionType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Calendar Heatmap & Date Filter States
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(null); // "YYYY-MM-DD" or { startDate, endDate, label } or null
  const [activitySummary, setActivitySummary] = useState({});

  // Handle search debouncing (450ms) to avoid spamming the backend database
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to first page on search query change
    }, 450);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch monthly activity summary for heatmap
  const fetchActivitySummary = useCallback(async () => {
    try {
      const res = await getActivitySummary({
        year: currentYear,
        month: currentMonth,
      });
      setActivitySummary(res.data.data.summary || {});
    } catch (err) {
      console.error("Failed to load activity summary:", err);
    }
  }, [currentYear, currentMonth]);

  useEffect(() => {
    fetchActivitySummary();
  }, [fetchActivitySummary]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      let startDateParam;
      let endDateParam;

      if (typeof selectedDate === "string") {
        startDateParam = selectedDate;
        endDateParam = selectedDate;
      } else if (selectedDate && typeof selectedDate === "object") {
        startDateParam = selectedDate.startDate;
        endDateParam = selectedDate.endDate;
      }

      const res = await getAuditLogs({
        page,
        limit,
        actionType: actionType || undefined,
        search: debouncedSearch || undefined,
        startDate: startDateParam,
        endDate: endDateParam,
      });

      const { logs: fetchedLogs, pagination: fetchedPagination } = res.data.data;
      setLogs(fetchedLogs || []);
      setPagination(fetchedPagination || { total: 0, page: 1, limit: 10, totalPages: 1 });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch audit logs. Please check your credentials or try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionType, debouncedSearch, selectedDate]);

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setPage(1); // Reset to page 1 on date filter change
  };

  const handleChangeMonth = (newYear, newMonth) => {
    setCurrentYear(newYear);
    setCurrentMonth(newMonth);
  };

  const handleResetFilters = () => {
    setActionType("");
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedDate(null);
    setPage(1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const handleNextPage = () => {
    if (page < pagination.totalPages) setPage((p) => p + 1);
  };

  // Helper to format action type badges
  const renderActionBadge = (type) => {
    switch (type) {
      case "CREATE":
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 border border-emerald-100 shadow-xs">
            <span className="w-1 h-1 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
            CREATE
          </span>
        );
      case "UPDATE":
        return (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700 border border-blue-100 shadow-xs">
            <span className="w-1 h-1 rounded-full bg-blue-500 mr-1.5"></span>
            UPDATE
          </span>
        );
      case "DELETE":
        return (
          <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-semibold text-rose-700 border border-rose-100 shadow-xs">
            <span className="w-1 h-1 rounded-full bg-rose-500 mr-1.5"></span>
            DELETE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-700 border border-slate-100 shadow-xs">
            {type}
          </span>
        );
    }
  };

  // Format date helper: extracts day of week, formatted date, and time
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return { day: "—", date: "—", time: "—" };
    const date = new Date(timestamp);
    const day = date.toLocaleDateString("en-US", { weekday: "long" });
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    return { day, date: formattedDate, time: formattedTime };
  };

  return (
    <div className="min-h-screen bg-bg font-sans">
      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[11px] font-medium text-ink-soft mb-6">
          <span
            onClick={() => navigate("../dashboard")}
            className="hover:text-blue cursor-pointer transition-colors"
          >
            Dashboard
          </span>
          <span className="text-slate-300">›</span>
          <span className="text-ink font-semibold">Audit Logs</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-[25px] font-semibold tracking-tight text-ink flex items-center gap-2.5">
              <ShieldCheck className="h-6 w-6 text-blue" />
              System Audit Logs
            </h1>
            <p className="mt-1 text-[13px] text-ink-soft">
              Real-time activity log tracking system writes, updates, and deletes for compliance auditing.
            </p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-xl bg-rose-50 p-4 border border-rose-100 text-rose-800 text-sm flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <span>{error}</span>
            </div>
            <button
              onClick={fetchLogs}
              className="text-xs font-bold underline hover:text-rose-900 ml-4 cursor-pointer transition-all"
            >
              Retry
            </button>
          </div>
        )}

        {/* Dashboard Grid & Filters */}
        <div className="w-full bg-white border border-line rounded-xl shadow-card-sm transition-all duration-200 hover:shadow-card/5 relative">
          <div className="px-4 sm:px-5 py-4 sm:py-5 border-b border-line bg-slate-50/50 rounded-t-xl relative z-20">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
              <div>
                <h2 className="text-[16px] font-semibold text-ink">
                  Audit Trail Records
                </h2>
                <p className="mt-0.5 text-[12px] text-ink-soft">
                  Review security and configuration updates
                </p>
              </div>

              {/* Filters Container (Fully responsive wrapping) */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                {/* Search Box */}
                <div className="relative flex-1 sm:flex-initial min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search by action, user name, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-[38px] w-full sm:w-[220px] lg:w-[250px] rounded-lg border border-line bg-white pl-9 pr-3 text-[12px] text-ink outline-none placeholder:text-slate-400 focus:border-blue focus:ring-2 focus:ring-blue/10 transition-all font-medium"
                  />
                </div>

                {/* Filter Selector */}
                <div className="relative flex items-center">
                  <Filter className="absolute left-3 text-slate-400 h-3.5 w-3.5 pointer-events-none" />
                  <select
                    value={actionType}
                    onChange={(e) => {
                      setActionType(e.target.value);
                      setPage(1);
                    }}
                    className="h-[38px] w-[140px] sm:w-[145px] rounded-lg border border-line bg-white pl-9 pr-3 text-[12px] text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/10 transition-all appearance-none cursor-pointer font-medium"
                  >
                    <option value="">All Action Types</option>
                    <option value="CREATE">CREATE</option>
                    <option value="UPDATE">UPDATE</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                  <span className="absolute right-3 text-slate-400 text-[10px] pointer-events-none">▼</span>
                </div>

                {/* Calendar / Date Heatmap Filter */}
                <AuditCalendarFilter
                  selectedDate={selectedDate}
                  onSelectDate={handleSelectDate}
                  activitySummary={activitySummary}
                  currentYear={currentYear}
                  currentMonth={currentMonth}
                  onChangeMonth={handleChangeMonth}
                />

                {/* Reset Filters Button */}
                {(searchTerm || actionType || selectedDate) && (
                  <button
                    onClick={handleResetFilters}
                    className="h-[38px] px-3.5 rounded-lg border border-line bg-white hover:bg-slate-50 text-[12px] font-semibold text-ink-soft hover:text-ink transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Clear all filters"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Table View */}
          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-line bg-slate-50/50">
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft min-w-[220px]">
                    User Name
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft min-w-[120px]">
                    Action Type
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Action Description
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft min-w-[230px]">
                    Day & Timestamp
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="h-7 w-7 animate-spin text-blue" />
                        <p className="text-[12px] font-semibold text-ink-soft">
                          Loading audit trails...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : logs.length > 0 ? (
                  logs.map((log) => {
                    const timeInfo = formatTimestamp(log.timestamp);
                    return (
                      <tr
                        key={log.id}
                        className="border-b border-line last:border-b-0 hover:bg-slate-50/40 transition-colors"
                      >
                        {/* User Name & Details */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-[#0e2a52] text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                              {(log.user?.name || "U").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-[13px] font-semibold text-ink leading-tight">
                                {log.user?.name || "System User"}
                              </p>
                              <p className="text-[11px] text-ink-soft mt-0.5">
                                {log.user?.email || `ID: ${log.userId.substring(0, 8)}...`}
                              </p>
                              {log.user?.role && (
                                <span className="inline-block mt-1 rounded px-1.5 py-0.2 text-[9px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wide">
                                  {log.user.role.replace("_", " ")}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Action Type Badge */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {renderActionBadge(log.actionType)}
                        </td>

                        {/* Action Description */}
                        <td className="px-5 py-4">
                          <p className="text-[12.5px] text-ink font-medium leading-normal break-words max-w-[450px]">
                            {log.action}
                          </p>
                        </td>

                        {/* Day of Week & Timestamp */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-start gap-2.5">
                            <Calendar className="h-4 w-4 text-blue shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[12.5px] font-semibold text-ink leading-tight">
                                <span className="text-blue font-bold">{timeInfo.day}</span>, {timeInfo.date}
                              </p>
                              <p className="text-[11px] font-mono text-ink-soft mt-0.5">
                                {timeInfo.time}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-center p-4">
                        <span className="text-3xl mb-2.5">📋</span>
                        <p className="text-[13px] font-semibold text-ink">
                          No audit log records found
                        </p>
                        <p className="mt-1 text-[12px] text-ink-soft max-w-[280px]">
                          {searchTerm || actionType || selectedDate
                            ? "Try refining your search terms or clearing the active date and action filters."
                            : "System logs are currently empty. Activities will start displaying here automatically."}
                        </p>
                        {(searchTerm || actionType || selectedDate) && (
                          <button
                            onClick={handleResetFilters}
                            className="mt-4 px-4 py-2 bg-blue-deep hover:bg-[#0c2441] text-white text-[11px] font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
                          >
                            Clear Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-line px-5 py-4.5 bg-slate-50/50">
              <p className="text-[11px] font-medium text-ink-soft text-center sm:text-left">
                Showing page <span className="font-semibold text-ink">{pagination.page}</span> of{" "}
                <span className="font-semibold text-ink">{pagination.totalPages}</span> (Total{" "}
                <span className="font-semibold text-ink">{pagination.total}</span> records)
              </p>

              {/* Navigation buttons */}
              <div className="flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className="h-8 w-8 rounded-lg border border-line bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 disabled:opacity-50 disabled:pointer-events-none cursor-pointer transition-colors"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Page numbers */}
                {Array.from({ length: pagination.totalPages }, (_, idx) => {
                  const pgNum = idx + 1;
                  // Handle layout bounds for long pagination lists (only show first, last, and surrounding pages)
                  if (
                    pgNum === 1 ||
                    pgNum === pagination.totalPages ||
                    Math.abs(pgNum - page) <= 1
                  ) {
                    return (
                      <button
                        key={pgNum}
                        type="button"
                        onClick={() => setPage(pgNum)}
                        className={`h-8 min-w-[32px] px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          page === pgNum
                            ? "bg-blue text-white shadow-xs"
                            : "border border-line bg-white text-ink-soft hover:bg-slate-50"
                        }`}
                      >
                        {pgNum}
                      </button>
                    );
                  } else if (
                    pgNum === 2 ||
                    pgNum === pagination.totalPages - 1
                  ) {
                    return (
                      <span key={pgNum} className="px-1 text-[11px] text-slate-400 font-bold">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={page === pagination.totalPages}
                  className="h-8 w-8 rounded-lg border border-line bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 disabled:opacity-50 disabled:pointer-events-none cursor-pointer transition-colors"
                  aria-label="Next Page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
