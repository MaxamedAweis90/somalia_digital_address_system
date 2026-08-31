import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { getMyAssignments } from "@/api/assignmentApi";
import { getCollectors } from "@/api/officerApi";
import AssignmentStatusBadge from "@/components/assignments/AssignmentStatusBadge";
import Breadcrumb from "@/components/ui/Breadcrumb";
import PageHeader from "@/components/ui/PageHeader";

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
    const collectorReviews = assignments.reduce(
      (total, assignment) =>
        total +
        (assignment.children || []).filter((child) => child.status === "SUBMITTED").length,
      0
    );

    return {
      active: assignments.filter((item) =>
        ["ASSIGNED", "IN_PROGRESS", "REJECTED"].includes(item.status)
      ).length,
      collectorReviews,
      readyForAdmin: assignments.filter((item) => item.status === "READY_FOR_REVIEW").length,
      completed: assignments.filter((item) => item.status === "APPROVED").length,
    };
  }, [assignments]);

  const nextActions = useMemo(() => {
    const collectorActions = assignments.flatMap((assignment) =>
      (assignment.children || [])
        .filter((child) => child.status === "SUBMITTED")
        .map((child) => ({
          id: `collector-${child.id}`,
          title: child.zoneBlock?.name || "Zone block submission",
          detail: `${child.assignedTo?.name || "Collector"} submitted work in ${assignment.zone?.name || "this zone"}.`,
          label: "Review submission",
          path: `/officer/children/${child.id}`,
        }))
    );
    const zoneActions = assignments
      .filter((assignment) => ["READY_FOR_REVIEW", "REJECTED"].includes(assignment.status))
      .map((assignment) => ({
        id: `zone-${assignment.id}`,
        title: assignment.zone?.name || "Assigned zone",
        detail:
          assignment.status === "REJECTED"
            ? "This zone was returned by admin and needs your attention."
            : "All collector work is approved and ready for admin.",
        label: assignment.status === "REJECTED" ? "Review zone" : "Submit to admin",
        path: `/officer/assignments/${assignment.id}`,
      }));

    return [...collectorActions, ...zoneActions];
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
          actions={
            !zonesOnly ? (
              <button
                type="button"
                onClick={() => navigate("/officer/workflow")}
                className="inline-flex h-[39px] items-center gap-2 rounded-lg bg-blue-deep px-5 text-[12px] font-semibold text-white shadow-cta transition-all hover:bg-[#0F2B4D] cursor-pointer"
              >
                Open Workflow
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : undefined
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
              <p className="text-[12px] text-ink-soft">Collector Reviews</p>
              <p className="mt-2 text-[28px] font-semibold text-ink">{summary.collectorReviews}</p>
              <p className="mt-1 text-[11px] text-ink-soft">Submissions needing review</p>
            </div>
            <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
              <p className="text-[12px] text-ink-soft">Ready for Admin</p>
              <p className="mt-2 text-[28px] font-semibold text-ink">{summary.readyForAdmin}</p>
              <p className="mt-1 text-[11px] text-ink-soft">Zones ready to submit</p>
            </div>
            <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
              <p className="text-[12px] text-ink-soft">Active Zones</p>
              <p className="mt-2 text-[28px] font-semibold text-ink">{summary.active}</p>
              <p className="mt-1 text-[11px] text-ink-soft">Collection in progress</p>
            </div>
            <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
              <p className="text-[12px] text-ink-soft">Completed Zones</p>
              <p className="mt-2 text-[28px] font-semibold text-ink">{summary.completed}</p>
              <p className="mt-1 text-[11px] text-ink-soft">{collectors.length} collectors on your team</p>
            </div>
          </div>
        )}

        {!zonesOnly && (
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-5 shadow-card-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[15px] font-semibold text-ink">Your next actions</p>
                <p className="mt-1 text-[12px] text-ink-soft">
                  Review collector submissions first, then send completed zones to admin.
                </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-blue-deep">
                {nextActions.length} action{nextActions.length === 1 ? "" : "s"} waiting
              </span>
            </div>

            {nextActions.length ? (
              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                {nextActions.slice(0, 3).map((item) => (
                  <div key={item.id} className="rounded-lg border border-blue-100 bg-white px-4 py-3">
                    <p className="truncate text-[12px] font-semibold text-ink">{item.title}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">{item.detail}</p>
                    <button
                      type="button"
                      onClick={() => navigate(item.path)}
                      className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-deep cursor-pointer"
                    >
                      {item.label}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-100 bg-white px-4 py-3 text-[12px] text-emerald-800">
                <CheckCircle2 className="h-4 w-4" />
                No reviews or submissions need your attention right now.
              </p>
            )}
          </div>
        )}

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
                  <th className="px-5 py-4 text-right text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
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
                    <tr key={assignment.id} className="border-b border-line last:border-b-0 hover:bg-[#FBFCFE] transition-colors">
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
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => navigate(`/officer/assignments/${assignment.id}`)}
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
