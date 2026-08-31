import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { getCollectorAssignments } from "@/api/collectorApi";
import AssignmentStatusBadge, {
  AssignmentTypeBadge,
  formatAssignmentLocation,
  getAssignmentDraftCount,
} from "@/components/assignments/AssignmentStatusBadge";
import Breadcrumb from "@/components/ui/Breadcrumb";
import PageHeader from "@/components/ui/PageHeader";

const VIEW_CONFIG = {
  all: {
    title: "My Work",
    description: "All zone blocks delegated to you by your data officer.",
  },
  inProgress: {
    title: "Needs Action",
    description: "Work that is ready to start, continue, or correct.",
  },
  submitted: {
    title: "Submitted Work",
    description: "Zone blocks submitted to your data officer for review.",
  },
  completed: {
    title: "Completed Work",
    description: "Zone blocks approved by your data officer.",
  },
};

const WORK_TABS = [
  { view: "all", label: "All work", path: "/collector/assignments" },
  { view: "inProgress", label: "Needs action", path: "/collector/assignments/in-progress" },
  { view: "submitted", label: "Submitted", path: "/collector/assignments/submitted" },
  { view: "completed", label: "Completed", path: "/collector/assignments/completed" },
];

export default function CollectorDashboard({ view = "dashboard" }) {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCollectorAssignments()
      .then((res) => setAssignments(res.data.data || []))
      .catch((err) => setError(err.response?.data?.message || "Failed to load tasks"))
      .finally(() => setLoading(false));
  }, []);

  const filteredAssignments = useMemo(() => {
    if (view === "dashboard") return assignments;
    if (view === "inProgress") {
      return assignments.filter((assignment) =>
        ["ASSIGNED", "IN_PROGRESS", "REJECTED"].includes(assignment.status)
      );
    }
    if (view === "submitted") {
      return assignments.filter((assignment) => assignment.status === "SUBMITTED");
    }
    if (view === "completed") {
      return assignments.filter((assignment) => assignment.status === "APPROVED");
    }
    return assignments;
  }, [assignments, view]);

  const summary = useMemo(
    () => ({
      submitted: assignments.filter((assignment) => assignment.status === "SUBMITTED").length,
      completed: assignments.filter((assignment) => assignment.status === "APPROVED").length,
      addresses: assignments.reduce(
        (total, assignment) => total + (assignment.payload?.addresses?.length || 0),
        0
      ),
    }),
    [assignments]
  );

  const isDashboard = view === "dashboard";
  const pageConfig = VIEW_CONFIG[view] || VIEW_CONFIG.all;
  const needsAction = assignments.filter((assignment) =>
    ["ASSIGNED", "IN_PROGRESS", "REJECTED"].includes(assignment.status)
  );
  const displayedAssignments = isDashboard
    ? assignments.slice(0, 5)
    : filteredAssignments;

  return (
    <div className="min-h-full bg-bg font-sans">
      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10 space-y-6">
        <Breadcrumb items={[{ label: isDashboard ? "Dashboard" : pageConfig.title }]} />
        <PageHeader
          title={isDashboard ? "Collector Dashboard" : pageConfig.title}
          description={
            isDashboard
              ? "Track your assigned zone blocks, address progress, and submissions."
              : pageConfig.description
          }
          actions={
            isDashboard ? (
              <button
                type="button"
                onClick={() => navigate("/collector/assignments")}
                className="inline-flex h-[39px] items-center gap-2 rounded-lg bg-blue-deep px-5 text-[12px] font-semibold text-white shadow-cta transition-all hover:bg-[#0F2B4D] cursor-pointer"
              >
                Open My Work
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : undefined
          }
        />

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
        )}

        {isDashboard && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
              <p className="text-[12px] text-ink-soft">Needs Action</p>
              <p className="mt-2 text-[28px] font-semibold text-ink">{needsAction.length}</p>
              <p className="mt-1 text-[11px] text-ink-soft">Ready, active, or returned</p>
            </div>
            <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
              <p className="text-[12px] text-ink-soft">Awaiting Review</p>
              <p className="mt-2 text-[28px] font-semibold text-ink">{summary.submitted}</p>
              <p className="mt-1 text-[11px] text-ink-soft">Sent to your data officer</p>
            </div>
            <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
              <p className="text-[12px] text-ink-soft">Completed</p>
              <p className="mt-2 text-[28px] font-semibold text-ink">{summary.completed}</p>
              <p className="mt-1 text-[11px] text-ink-soft">Approved by your officer</p>
            </div>
            <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
              <p className="text-[12px] text-ink-soft">Draft Items</p>
              <p className="mt-2 text-[28px] font-semibold text-ink">{summary.addresses}</p>
              <p className="mt-1 text-[11px] text-ink-soft">Addresses recorded</p>
            </div>
          </div>
        )}

        {isDashboard && (
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-5 shadow-card-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[15px] font-semibold text-ink">Continue your field work</p>
                <p className="mt-1 text-[12px] text-ink-soft">
                  Open a task, save your drafts, and submit it to your data officer when finished.
                </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-blue-deep">
                {needsAction.length} task{needsAction.length === 1 ? "" : "s"} to complete
              </span>
            </div>

            {needsAction.length ? (
              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                {needsAction.slice(0, 3).map((assignment) => (
                  <div key={assignment.id} className="rounded-lg border border-blue-100 bg-white px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-[12px] font-semibold text-ink">
                        {formatAssignmentLocation(assignment)}
                      </p>
                      <AssignmentStatusBadge status={assignment.status} />
                    </div>
                    <p className="mt-2 text-[11px] text-ink-soft">
                      {getAssignmentDraftCount(assignment)} draft item
                      {getAssignmentDraftCount(assignment) === 1 ? "" : "s"}
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate(`/collector/assignments/${assignment.id}`)}
                      className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-deep cursor-pointer"
                    >
                      {assignment.status === "ASSIGNED" ? "Start task" : "Continue task"}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-lg border border-emerald-100 bg-white px-4 py-3 text-[12px] text-emerald-800">
                You are all caught up. New work will appear here when your data officer assigns it.
              </p>
            )}
          </div>
        )}

        {!isDashboard && (
          <div className="flex flex-wrap gap-2 rounded-xl border border-line bg-white p-2 shadow-card-sm">
            {WORK_TABS.map((tab) => (
              <button
                key={tab.view}
                type="button"
                onClick={() => navigate(tab.path)}
                className={`rounded-lg px-4 py-2 text-[12px] font-semibold transition-colors cursor-pointer ${
                  view === tab.view
                    ? "bg-blue-deep text-white"
                    : "text-ink-soft hover:bg-bg hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <div className="rounded-xl border border-line bg-white shadow-card-sm overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-[16px] font-semibold text-ink">
              {isDashboard ? "Recent Assigned Work" : pageConfig.title}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-line bg-[#FBFCFE]">
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Type</th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Location</th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Status</th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Draft Items</th>
                  <th className="px-5 py-4 text-right text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin text-blue" />
                    </td>
                  </tr>
                ) : displayedAssignments.length > 0 ? (
                  displayedAssignments.map((assignment) => (
                    <tr key={assignment.id} className="border-b border-line last:border-b-0 hover:bg-[#FBFCFE] transition-colors">
                      <td className="px-5 py-4"><AssignmentTypeBadge type={assignment.type} /></td>
                      <td className="px-5 py-4 text-[12px] font-semibold text-ink">{formatAssignmentLocation(assignment)}</td>
                      <td className="px-5 py-4"><AssignmentStatusBadge status={assignment.status} /></td>
                      <td className="px-5 py-4 text-[12px] text-ink">{getAssignmentDraftCount(assignment)}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => navigate(`/collector/assignments/${assignment.id}`)}
                          className="h-[32px] rounded-md border border-line bg-white px-3 text-[11px] font-semibold text-ink hover:bg-bg cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-[12px] text-ink-soft">
                      {isDashboard
                        ? "No tasks assigned yet. Your data officer will delegate field work here."
                        : "No work matches this status."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
