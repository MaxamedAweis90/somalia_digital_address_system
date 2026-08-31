import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  ShieldCheck,
  Calendar,
  Filter,
} from "lucide-react";
import { getAuditLogs } from "@/api/auditLogApi";

// Inline Copy Button component for clean copy-to-clipboard functionality
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation(); // Avoid triggering any row clicks
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className="p-1.5 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer flex items-center justify-center shrink-0"
      title={copied ? "Copied!" : "Copy Entity ID"}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-600" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
};

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

  // Handle search debouncing (450ms) to avoid spamming the backend database
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to first page on search query change
    }, 450);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAuditLogs({
        page,
        limit,
        actionType: actionType || undefined,
        search: debouncedSearch || undefined,
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
  }, [page, actionType, debouncedSearch]);

  const handleResetFilters = () => {
    setActionType("");
    setSearchTerm("");
    setDebouncedSearch("");
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

  // Format date helper
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "—";
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
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
        <div className="w-full bg-white border border-line rounded-xl shadow-card-sm overflow-hidden transition-all duration-200 hover:shadow-card/5">
          <div className="px-5 py-5 border-b border-line bg-slate-50/50">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-[16px] font-semibold text-ink">
                  Audit Trail Records
                </h2>
                <p className="mt-0.5 text-[12px] text-ink-soft">
                  Review security and configuration updates
                </p>
              </div>

              {/* Filters Container */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Search Box */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search by action, email, ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-[38px] w-full sm:w-[240px] rounded-lg border border-line bg-white pl-9 pr-3 text-[12px] text-ink outline-none placeholder:text-slate-400 focus:border-blue focus:ring-2 focus:ring-blue/10 transition-all font-medium"
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
                    className="h-[38px] w-full sm:w-[150px] rounded-lg border border-line bg-white pl-9 pr-3 text-[12px] text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/10 transition-all appearance-none cursor-pointer font-medium"
                  >
                    <option value="">All Action Types</option>
                    <option value="CREATE">CREATE</option>
                    <option value="UPDATE">UPDATE</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                  <span className="absolute right-3 text-slate-400 text-[10px] pointer-events-none">▼</span>
                </div>

                {/* Reset Filters Button */}
                {(searchTerm || actionType) && (
                  <button
                    onClick={handleResetFilters}
                    className="h-[38px] px-3.5 rounded-lg border border-line bg-white hover:bg-slate-50 text-[12px] font-semibold text-ink-soft hover:text-ink transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Clear filters"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Table View */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-line bg-slate-50/50">
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    User
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Action Type
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Action Description
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Entity ID
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Timestamp
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="h-7 w-7 animate-spin text-blue" />
                        <p className="text-[12px] font-semibold text-ink-soft">
                          Loading audit trails...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-line last:border-b-0 hover:bg-slate-50/40 transition-colors"
                    >
                      {/* User (Name & Email) */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 text-blue font-bold flex items-center justify-center text-xs border border-line shrink-0 shadow-2xs">
                            {(log.user?.name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-ink leading-none">
                              {log.user?.name || "Deleted User"}
                            </p>
                            <p className="text-[11px] text-ink-soft mt-0.5">
                              {log.user?.email || `ID: ${log.userId.substring(0, 8)}...`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Action Type Badge */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {renderActionBadge(log.actionType)}
                      </td>

                      {/* Action Description */}
                      <td className="px-5 py-4 max-w-[300px]">
                        <p className="text-[12.5px] text-ink font-medium leading-normal break-words">
                          {log.action}
                        </p>
                      </td>

                      {/* Entity ID with Mono styling & copy capability */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-line px-2 py-1 rounded-md text-[11px] font-mono text-ink-soft">
                          <span className="truncate max-w-[120px] select-all" title={log.entityId}>
                            {log.entityId}
                          </span>
                          <CopyButton text={log.entityId} />
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-[12px] text-ink-soft">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{formatTimestamp(log.timestamp)}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-center p-4">
                        <span className="text-3xl mb-2.5">📋</span>
                        <p className="text-[13px] font-semibold text-ink">
                          No audit log records found
                        </p>
                        <p className="mt-1 text-[12px] text-ink-soft max-w-[280px]">
                          {searchTerm || actionType
                            ? "Try refining your search terms or clearing the active filters."
                            : "System logs are currently empty. Activities will start displaying here automatically."}
                        </p>
                        {(searchTerm || actionType) && (
                          <button
                            onClick={handleResetFilters}
                            className="mt-4 px-4 py-2 bg-blue-deep hover:bg-[#0c2441] text-white text-[11px] font-semibold rounded-lg shadow-sm transition-all"
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
