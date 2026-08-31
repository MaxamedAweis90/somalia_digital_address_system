import { useEffect, useState } from "react";
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

export default function CollectorDashboard() {
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

  return (
    <div className="min-h-full bg-bg font-sans">
      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10 space-y-6">
        <Breadcrumb items={[{ label: "My Tasks" }]} />
        <PageHeader
          title="My Field Tasks"
          description="Complete assigned zone or address collection work and submit to your data officer."
        />

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
        )}

        <OfficerWorkflowGuide compact />

        <div className="rounded-xl border border-line bg-white shadow-card-sm overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-[16px] font-semibold text-ink">Assigned Work</h2>
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
                ) : assignments.length > 0 ? (
                  assignments.map((assignment) => (
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
                      No tasks assigned yet. Your data officer will delegate field work here.
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
