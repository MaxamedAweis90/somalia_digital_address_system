import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getMyAssignments } from "@/api/assignmentApi";
import AssignmentStatusBadge, {
  formatAssignmentLocation,
} from "@/components/assignments/AssignmentStatusBadge";
import Breadcrumb from "@/components/ui/Breadcrumb";
import PageHeader from "@/components/ui/PageHeader";

export default function OfficerDashboard() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyAssignments();
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

  const summary = useMemo(() => {
    return {
      active: assignments.filter((item) =>
        ["ASSIGNED", "IN_PROGRESS", "REJECTED"].includes(item.status)
      ).length,
      submitted: assignments.filter((item) => item.status === "SUBMITTED").length,
      completed: assignments.filter((item) => item.status === "APPROVED").length,
    };
  }, [assignments]);

  return (
    <div className="min-h-full bg-bg font-sans">
      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10 space-y-6">
        <Breadcrumb items={[{ label: "My Assignments" }]} />

        <PageHeader
          title="My Assignments"
          description="Complete assigned neighborhood zone-mapping tasks. Save drafts as you work and submit when ready."
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
            <p className="text-[12px] text-ink-soft">Active Tasks</p>
            <p className="mt-2 text-[28px] font-semibold text-ink">{summary.active}</p>
          </div>
          <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
            <p className="text-[12px] text-ink-soft">Awaiting Review</p>
            <p className="mt-2 text-[28px] font-semibold text-ink">{summary.submitted}</p>
          </div>
          <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
            <p className="text-[12px] text-ink-soft">Completed</p>
            <p className="mt-2 text-[28px] font-semibold text-ink">{summary.completed}</p>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-white shadow-card-sm overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-[16px] font-semibold text-ink">Assigned Work</h2>
            <p className="mt-1 text-[12px] text-ink-soft">
              Open a task to define zone boundaries for the assigned neighborhood.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-line bg-[#FBFCFE]">
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Neighborhood
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Status
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Draft Zones
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Due
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin text-blue" />
                    </td>
                  </tr>
                ) : assignments.length > 0 ? (
                  assignments.map((assignment) => (
                    <tr
                      key={assignment.id}
                      onClick={() => navigate(`/officer/assignments/${assignment.id}`)}
                      className="border-b border-line last:border-b-0 hover:bg-[#FBFCFE] transition-colors cursor-pointer"
                    >
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
                      <td className="px-5 py-4">
                        <AssignmentStatusBadge status={assignment.status} />
                      </td>
                      <td className="px-5 py-4 text-[12px] text-ink">
                        {assignment.payload?.zones?.length || 0}
                      </td>
                      <td className="px-5 py-4 text-[12px] text-ink-soft">
                        {assignment.dueAt
                          ? new Date(assignment.dueAt).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center">
                      <p className="text-[13px] font-medium text-ink">No assignments yet</p>
                      <p className="mt-1 text-[12px] text-ink-soft">
                        Your administrator will assign neighborhood zone-mapping tasks here.
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
