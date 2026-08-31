import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getCollectorAssignments } from "@/api/collectorApi";
import AssignmentStatusBadge, {
  AssignmentTypeBadge,
  formatAssignmentLocation,
  getAssignmentDraftCount,
} from "@/components/assignments/AssignmentStatusBadge";
import OfficerWorkflowGuide from "@/components/assignments/OfficerWorkflowGuide";
import Breadcrumb from "@/components/ui/Breadcrumb";
import PageHeader from "@/components/ui/PageHeader";

const VIEW_CONFIG = {
  all: {
    title: "Assigned Work",
    description: "All zone blocks delegated to you by your data officer.",
  },
  inProgress: {
    title: "In Progress",
    description: "Zone blocks you have started and can continue working on.",
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
      total: assignments.length,
      ready: assignments.filter((assignment) => assignment.status === "ASSIGNED").length,
      inProgress: assignments.filter((assignment) =>
        ["IN_PROGRESS", "REJECTED"].includes(assignment.status)
      ).length,
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
        />

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
        )}

        {isDashboard && <OfficerWorkflowGuide compact />}

        {isDashboard && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
              <p className="text-[12px] text-ink-soft">Total Assigned</p>
              <p className="mt-2 text-[28px] font-semibold text-ink">{summary.total}</p>
            </div>
            <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
              <p className="text-[12px] text-ink-soft">Ready to Start</p>
              <p className="mt-2 text-[28px] font-semibold text-ink">{summary.ready}</p>
            </div>
            <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
              <p className="text-[12px] text-ink-soft">In Progress</p>
              <p className="mt-2 text-[28px] font-semibold text-ink">{summary.inProgress}</p>
            </div>
            <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
              <p className="text-[12px] text-ink-soft">Awaiting Review</p>
              <p className="mt-2 text-[28px] font-semibold text-ink">{summary.submitted}</p>
            </div>
            <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
              <p className="text-[12px] text-ink-soft">Completed</p>
              <p className="mt-2 text-[28px] font-semibold text-ink">{summary.completed}</p>
            </div>
            <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
              <p className="text-[12px] text-ink-soft">Addresses Registered</p>
              <p className="mt-2 text-[28px] font-semibold text-ink">{summary.addresses}</p>
            </div>
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
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin text-blue" />
                    </td>
                  </tr>
                ) : displayedAssignments.length > 0 ? (
                  displayedAssignments.map((assignment) => (
                    <tr
                      key={assignment.id}
                      onClick={() => navigate(`/collector/assignments/${assignment.id}`)}
                      className="border-b border-line last:border-b-0 hover:bg-[#FBFCFE] transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-4"><AssignmentTypeBadge type={assignment.type} /></td>
                      <td className="px-5 py-4 text-[12px] font-semibold text-ink">{formatAssignmentLocation(assignment)}</td>
                      <td className="px-5 py-4"><AssignmentStatusBadge status={assignment.status} /></td>
                      <td className="px-5 py-4 text-[12px] text-ink">{getAssignmentDraftCount(assignment)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-[12px] text-ink-soft">
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
