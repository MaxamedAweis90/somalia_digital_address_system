import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getMyAssignments } from "@/api/assignmentApi";
import { getCollectors } from "@/api/officerApi";
import AssignmentStatusBadge from "@/components/assignments/AssignmentStatusBadge";
import Breadcrumb from "@/components/ui/Breadcrumb";
import PageHeader from "@/components/ui/PageHeader";
import OfficerWorkflowGuide from "@/components/assignments/OfficerWorkflowGuide";

export default function OfficerDashboard({ zonesOnly = false }) {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const [assignmentsRes, collectorsRes] = await Promise.all([
        getMyAssignments(),
        getCollectors(),
      ]);
      setAssignments(assignmentsRes.data.data || []);
      setCollectors(collectorsRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // The loader synchronizes the dashboard with the authenticated officer's API data.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAssignments();
  }, []);

  const summary = useMemo(() => {
    const blockTasks = assignments.reduce(
      (total, assignment) => total + (assignment.children?.length || 0),
      0
    );
    const addressDrafts = assignments.reduce(
      (total, assignment) =>
        total +
        (assignment.children || []).reduce(
          (childTotal, child) => childTotal + (child.payload?.addresses?.length || 0),
          0
        ),
      0
    );

    return {
      total: assignments.length,
      active: assignments.filter((item) =>
        ["ASSIGNED", "IN_PROGRESS", "REJECTED"].includes(item.status)
      ).length,
      submitted: assignments.filter((item) => item.status === "SUBMITTED").length,
      completed: assignments.filter((item) => item.status === "APPROVED").length,
      blockTasks,
      addressDrafts,
    };
  }, [assignments]);

  return (
    <div className="min-h-full bg-bg font-sans">
      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10 space-y-6">
        <Breadcrumb items={[{ label: zonesOnly ? "Zones" : "Dashboard" }]} />

        <PageHeader
          title={zonesOnly ? "Assigned Zones" : "Officer Dashboard"}
          description={
            zonesOnly
              ? "Only zones assigned to you are shown here. Open one to allocate its blocks."
              : "Track your assigned zones, collector team, block tasks, and address registration progress."
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

        {!zonesOnly && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
            <p className="text-[12px] text-ink-soft">Assigned Zones</p>
            <p className="mt-2 text-[28px] font-semibold text-ink">{summary.total}</p>
          </div>
          <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
            <p className="text-[12px] text-ink-soft">Active Zones</p>
            <p className="mt-2 text-[28px] font-semibold text-ink">{summary.active}</p>
          </div>
          <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
            <p className="text-[12px] text-ink-soft">Zones Awaiting Review</p>
            <p className="mt-2 text-[28px] font-semibold text-ink">{summary.submitted}</p>
          </div>
          <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
            <p className="text-[12px] text-ink-soft">Completed Zones</p>
            <p className="mt-2 text-[28px] font-semibold text-ink">{summary.completed}</p>
          </div>
          <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
            <p className="text-[12px] text-ink-soft">Collectors on Team</p>
            <p className="mt-2 text-[28px] font-semibold text-ink">{collectors.length}</p>
          </div>
          <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
            <p className="text-[12px] text-ink-soft">Block Tasks</p>
            <p className="mt-2 text-[28px] font-semibold text-ink">{summary.blockTasks}</p>
          </div>
          <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
            <p className="text-[12px] text-ink-soft">Addresses in Progress</p>
            <p className="mt-2 text-[28px] font-semibold text-ink">{summary.addressDrafts}</p>
          </div>
        </div>
        )}

        {!zonesOnly && <OfficerWorkflowGuide />}

        <div className="rounded-xl border border-line bg-white shadow-card-sm overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-[16px] font-semibold text-ink">
              {zonesOnly ? "Zones Assigned to You" : "Zone Overview"}
            </h2>
            <p className="mt-1 text-[12px] text-ink-soft">
              Open a zone to choose zone blocks and assign them to your data collectors.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-line bg-[#FBFCFE]">
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Zone
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    District
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Zone Blocks
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Status
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
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
                        <p className="text-[13px] font-semibold text-ink">
                          {assignment.zone?.name || "—"}
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] text-ink-soft">
                          {assignment.zone?.code || "—"}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[12px] text-ink">
                          {assignment.zone?.district?.name || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[12px] text-ink">
                        <p className="font-semibold text-ink">
                          {assignment.children?.length || 0} block tasks
                        </p>
                        <p className="mt-0.5 text-[11px] text-ink-soft">
                          Team size: {assignment.expectedCollectorCount || "—"}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <AssignmentStatusBadge status={assignment.status} />
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate(`/officer/assignments/${assignment.id}`);
                          }}
                          className="h-[32px] rounded-md border border-line bg-white px-3 text-[11px] font-semibold text-ink hover:bg-bg cursor-pointer"
                        >
                          Open Zone
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <p className="text-[13px] font-medium text-ink">No assignments yet</p>
                      <p className="mt-1 text-[12px] text-ink-soft">
                        Your administrator will assign field tasks here.
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
