import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, CheckCircle2, ClipboardCheck, Loader2 } from "lucide-react";
import {
  getCollectorReviewQueue,
  getOfficerAssignments,
} from "@/api/officerApi";
import AssignmentStatusBadge, {
  formatAssignmentLocation,
} from "@/components/assignments/AssignmentStatusBadge";
import Breadcrumb from "@/components/ui/Breadcrumb";
import PageHeader from "@/components/ui/PageHeader";

function getZoneAction(assignment, hasCollectorReview) {
  if (hasCollectorReview) {
    return { label: "Review submissions", tone: "primary" };
  }

  if (assignment.status === "READY_FOR_REVIEW") {
    return { label: "Submit to admin", tone: "primary" };
  }

  if (assignment.status === "REJECTED") {
    return { label: "Review and resubmit", tone: "primary" };
  }

  if (assignment.status === "SUBMITTED") {
    return { label: "Waiting for admin", tone: "muted" };
  }

  if (assignment.status === "APPROVED") {
    return { label: "Completed", tone: "muted" };
  }

  return { label: "Manage zone", tone: "default" };
}

function ActionButton({ action, onClick }) {
  const styles = {
    primary: "bg-blue-deep text-white hover:bg-[#0F2B4D]",
    default: "border border-line bg-white text-ink hover:bg-bg",
    muted: "border border-line bg-white text-ink-soft",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={action.tone === "muted" && action.label !== "Completed"}
      className={`inline-flex h-[34px] items-center gap-1.5 rounded-lg px-3 text-[11px] font-semibold transition-colors cursor-pointer disabled:cursor-default disabled:opacity-80 ${styles[action.tone]}`}
    >
      {action.label}
      {action.tone !== "muted" && <ArrowRight className="h-3.5 w-3.5" />}
    </button>
  );
}

export default function OfficerWorkflow() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [collectorReviews, setCollectorReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadWorkflow = async () => {
    try {
      setLoading(true);
      setError(null);
      const [assignmentsRes, collectorReviewsRes] = await Promise.all([
        getOfficerAssignments(),
        getCollectorReviewQueue(),
      ]);
      setAssignments(assignmentsRes.data.data || []);
      setCollectorReviews(collectorReviewsRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load workflow");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // The loader synchronizes this screen with the workflow APIs.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadWorkflow();
  }, []);

  const reviewParentIds = useMemo(
    () => new Set(collectorReviews.map((submission) => submission.parentAssignmentId)),
    [collectorReviews]
  );
  const firstReviewByParentId = useMemo(
    () => new Map(collectorReviews.map((submission) => [submission.parentAssignmentId, submission.id])),
    [collectorReviews]
  );

  const actionItems = [
    ...collectorReviews.map((submission) => ({
      id: `collector-${submission.id}`,
      title: submission.zoneBlock?.name || "Zone block submission",
      detail: `${submission.assignedTo?.name || "Collector"} submitted work in ${submission.zone?.name || "this zone"}.`,
      action: { label: "Review submission", tone: "primary" },
      onClick: () => navigate(`/officer/children/${submission.id}`),
    })),
    ...assignments
      .filter((assignment) => ["READY_FOR_REVIEW", "REJECTED"].includes(assignment.status))
      .map((assignment) => ({
      id: `admin-${assignment.id}`,
      title: assignment.zone?.name || formatAssignmentLocation(assignment),
      detail:
        assignment.status === "REJECTED"
          ? "The administrator returned this zone. Review the feedback and resubmit it."
          : "All collector work is complete. Submit this zone to the administrator.",
      action: {
        label: assignment.status === "REJECTED" ? "Review and resubmit" : "Submit to admin",
        tone: "primary",
      },
      onClick: () => navigate(`/officer/assignments/${assignment.id}`),
      })),
  ];

  return (
    <div className="min-h-full bg-bg font-sans">
      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10 space-y-6">
        <Breadcrumb items={[{ label: "Workflow" }]} />
        <PageHeader
          title="My Workflow"
          description="Manage each zone from collector review through final submission to admin."
        />

        {error && (
          <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <span>{error}</span>
            <button type="button" onClick={loadWorkflow} className="text-xs font-semibold underline cursor-pointer">
              Retry
            </button>
          </div>
        )}

        <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-[16px] font-semibold text-ink">Your next actions</h2>
              <p className="mt-1 text-[12px] text-ink-soft">
                Complete the next step here. The system handles internal merging automatically.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-blue/10 px-3 py-2 text-[11px] font-semibold text-blue-deep">
              <ClipboardCheck className="h-4 w-4" />
              {actionItems.length} action{actionItems.length === 1 ? "" : "s"} waiting
            </div>
          </div>

          {loading ? (
            <div className="py-10 text-center">
              <Loader2 className="mx-auto h-5 w-5 animate-spin text-blue" />
            </div>
          ) : actionItems.length ? (
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {actionItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 rounded-lg border border-blue-100 bg-blue-50/50 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-ink">{item.title}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">{item.detail}</p>
                  </div>
                  <ActionButton action={item.action} onClick={item.onClick} />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50/60 px-4 py-4 text-[12px] text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              No submissions need your attention right now.
            </div>
          )}
        </div>

        <div className="rounded-xl border border-line bg-white shadow-card-sm overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-[16px] font-semibold text-ink">All zones</h2>
            <p className="mt-1 text-[12px] text-ink-soft">
              Follow the complete assignment from allocation to administrator approval.
            </p>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="mx-auto h-5 w-5 animate-spin text-blue" />
            </div>
          ) : assignments.length ? (
            <div className="divide-y divide-line">
              {assignments.map((assignment) => {
                const action = getZoneAction(assignment, reviewParentIds.has(assignment.id));
                const children = assignment.children || [];
                const approved = children.filter((child) => child.status === "APPROVED").length;
                const submitted = children.filter((child) => child.status === "SUBMITTED").length;

                return (
                  <div key={assignment.id} className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[13px] font-semibold text-ink">{formatAssignmentLocation(assignment)}</p>
                        <AssignmentStatusBadge status={assignment.status} />
                      </div>
                      <p className="mt-1 text-[11px] text-ink-soft">
                        {children.length} collector task{children.length === 1 ? "" : "s"} · {approved} approved
                        {submitted ? ` · ${submitted} awaiting review` : ""}
                      </p>
                    </div>
                    <ActionButton
                      action={action}
                      onClick={() =>
                        reviewParentIds.has(assignment.id)
                          ? navigate(`/officer/children/${firstReviewByParentId.get(assignment.id)}`)
                          : navigate(`/officer/assignments/${assignment.id}`)
                      }
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-[12px] text-ink-soft">
              <AlertCircle className="mx-auto mb-2 h-5 w-5 text-ink-soft" />
              No zones have been assigned to you yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
