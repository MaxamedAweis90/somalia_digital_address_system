import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { deleteAssignment, getAssignments } from "@/api/assignmentApi";
import AssignmentStatusBadge, {
  AssignmentTypeBadge,
  formatAssignmentLocation,
  getAssignmentDraftCount,
} from "@/components/assignments/AssignmentStatusBadge";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageHeader from "@/components/ui/PageHeader";

function formatProgress(assignment) {
  const children = assignment.children || [];
  const approved = children.filter((child) => child.status === "APPROVED").length;
  const submitted = children.filter((child) =>
    ["SUBMITTED", "APPROVED"].includes(child.status)
  ).length;
  const expected = assignment.expectedCollectorCount || children.length;

  return `${children.length}/${expected} delegated · ${approved} approved · ${submitted} submitted`;
}

function canRevokeAssignment(assignment) {
  return assignment?.status !== "APPROVED";
}

export default function Assignments() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revoking, setRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState(null);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAssignments();
      setAssignments(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const filteredAssignments = useMemo(() => {
    if (statusFilter === "All") return assignments;
    return assignments.filter((item) => item.status === statusFilter);
  }, [assignments, statusFilter]);

  const confirmRevoke = async () => {
    if (!revokeTarget) return;

    try {
      setRevoking(true);
      setRevokeError(null);
      await deleteAssignment(revokeTarget.id);
      setRevokeTarget(null);
      await fetchAssignments();
    } catch (err) {
      setRevokeError(err.response?.data?.message || "Failed to revoke assignment");
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="min-h-full bg-bg font-sans">
      <ConfirmDialog
        open={Boolean(revokeTarget)}
        title="Revoke Assignment"
        message={
          revokeTarget
            ? `Revoke the assignment for ${formatAssignmentLocation(revokeTarget)}? This removes the officer assignment and all related collector tasks. Published registry data is not affected.`
            : ""
        }
        confirmLabel="Revoke"
        loading={revoking}
        loadingLabel="Revoking..."
        variant="danger"
        error={revokeError}
        onConfirm={confirmRevoke}
        onCancel={() => {
          if (!revoking) {
            setRevokeTarget(null);
            setRevokeError(null);
          }
        }}
      />

      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10 space-y-6">
        <Breadcrumb
          items={[
            { label: "Dashboard", to: "/admin/dashboard" },
            { label: "Assignments" },
          ]}
        />

        <PageHeader
          title="Field Assignments"
          description="Assign field work to data officers and review zone or address submissions."
          actions={
            <button
              type="button"
              onClick={() => navigate("/admin/assignments/add")}
              className="h-[39px] px-5 rounded-lg bg-blue-deep text-[12px] font-semibold text-white shadow-cta transition-all hover:bg-[#0F2B4D] cursor-pointer"
            >
              + New Assignment
            </button>
          }
        />

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={fetchAssignments}
              className="text-xs font-semibold underline hover:text-red-900 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        <div className="rounded-xl border border-line bg-white shadow-card-sm overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[16px] font-semibold text-ink">All Assignments</h2>
              <p className="mt-1 text-[12px] text-ink-soft">
                Zone definition and address registration tasks with approval workflow.
              </p>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-[38px] rounded-lg border border-line bg-white px-3 text-[12px] text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/10"
            >
              <option value="All">All statuses</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="READY_FOR_REVIEW">Ready for Review</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-line bg-[#FBFCFE]">
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Type
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Location
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Officer
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Collector Team & Progress
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Status
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Draft Items
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Due
                  </th>
                  <th className="px-5 py-4 text-right text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin text-blue" />
                    </td>
                  </tr>
                ) : filteredAssignments.length > 0 ? (
                  filteredAssignments.map((assignment) => (
                    <tr
                      key={assignment.id}
                      className="border-b border-line last:border-b-0 hover:bg-[#FBFCFE] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <AssignmentTypeBadge type={assignment.type} />
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-[12px] font-semibold text-ink">
                          {formatAssignmentLocation(assignment)}
                        </p>
                        {assignment.notes && (
                          <p className="mt-1 text-[11px] text-ink-soft line-clamp-1">
                            {assignment.notes}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-[12px] text-ink">
                        {assignment.assignedTo?.name || "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center rounded-md bg-blue/10 px-2.5 py-1 text-[11px] font-semibold text-blue-deep font-mono">
                          {formatProgress(assignment)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <AssignmentStatusBadge status={assignment.status} />
                      </td>
                      <td className="px-5 py-4 text-[12px] text-ink">
                        {getAssignmentDraftCount(assignment)}
                      </td>
                      <td className="px-5 py-4 text-[12px] text-ink-soft">
                        {assignment.dueAt
                          ? new Date(assignment.dueAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/assignments/${assignment.id}`)}
                            className="h-[32px] rounded-md border border-line bg-white px-3 text-[11px] font-semibold text-ink transition-all hover:bg-bg cursor-pointer"
                          >
                            View
                          </button>
                          {canRevokeAssignment(assignment) && (
                            <button
                              type="button"
                              onClick={() => {
                                setRevokeError(null);
                                setRevokeTarget(assignment);
                              }}
                              className="h-[32px] rounded-md border border-red-200 bg-white px-3 text-[11px] font-semibold text-red-600 transition-all hover:bg-red-50 cursor-pointer"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center">
                      <p className="text-[13px] font-medium text-ink">No assignments yet</p>
                      <p className="mt-1 text-[12px] text-ink-soft">
                        Create an assignment to have an officer complete field work in a zone or zone block.
                      </p>
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
