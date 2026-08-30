import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  createChildAssignment,
  deleteChildAssignment,
  getOfficerAssignmentById,
  mergeParentAssignment,
  submitParentToAdmin,
} from "@/api/officerApi";
import { getCollectors } from "@/api/officerApi";
import AssignmentStatusBadge, {
  AssignmentTypeBadge,
  formatAssignmentLocation,
  getAssignmentDraftCount,
} from "@/components/assignments/AssignmentStatusBadge";
import Breadcrumb from "@/components/ui/Breadcrumb";
import PageHeader from "@/components/ui/PageHeader";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function OfficerParentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showDelegate, setShowDelegate] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [merging, setMerging] = useState(false);
  const [delegateForm, setDelegateForm] = useState({
    assignedToId: "",
    notes: "",
    mergeOrder: "",
  });

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [assignmentRes, collectorsRes] = await Promise.all([
        getOfficerAssignmentById(id),
        getCollectors(),
      ]);
      setAssignment(assignmentRes.data.data);
      const collectorList = collectorsRes.data.data || [];
      setCollectors(collectorList);
      setDelegateForm((prev) => ({
        ...prev,
        assignedToId: collectorList[0]?.id || "",
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load assignment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const children = assignment?.children || [];
  const approvedCount = children.filter((c) => c.status === "APPROVED").length;
  const canMerge = approvedCount > 0 && !["SUBMITTED", "APPROVED"].includes(assignment?.status);
  const canSubmit = ["READY_FOR_REVIEW", "REJECTED"].includes(assignment?.status);

  const handleDelegate = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await createChildAssignment(id, {
        assignedToId: delegateForm.assignedToId,
        notes: delegateForm.notes || undefined,
        mergeOrder: delegateForm.mergeOrder ? Number(delegateForm.mergeOrder) : undefined,
      });
      setShowDelegate(false);
      setSuccess("Child task created for collector.");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create child task");
    }
  };

  const handleDeleteChild = async (childId) => {
    try {
      await deleteChildAssignment(childId);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete child task");
    }
  };

  const handleMerge = async () => {
    try {
      setMerging(true);
      setError(null);
      await mergeParentAssignment(id);
      setSuccess("Approved child work merged into parent assignment.");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to merge child work");
    } finally {
      setMerging(false);
    }
  };

  const confirmSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      await submitParentToAdmin(id);
      setShowSubmitDialog(false);
      setSuccess("Parent assignment submitted to admin for approval.");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit to admin");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue" />
      </div>
    );
  }

  if (!assignment) {
    return <div className="p-8 text-center text-red-600">{error || "Assignment not found"}</div>;
  }

  return (
    <div className="min-h-full bg-bg font-sans">
      <ConfirmDialog
        open={showSubmitDialog}
        title="Submit to Admin"
        message="Submit the merged parent assignment to the administrator for final approval?"
        confirmLabel="Submit to Admin"
        loading={submitting}
        onConfirm={confirmSubmit}
        onCancel={() => !submitting && setShowSubmitDialog(false)}
      />

      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10 space-y-6">
        <Breadcrumb
          items={[
            { label: "My Assignments", to: "/officer/dashboard" },
            { label: formatAssignmentLocation(assignment) },
          ]}
        />

        <PageHeader
          title="Supervise Field Assignment"
          description="Delegate work to collectors on your team, review submissions, merge approved work, then submit to admin."
          actions={
            <div className="flex flex-wrap gap-2">
              <AssignmentTypeBadge type={assignment.type} />
              <AssignmentStatusBadge status={assignment.status} />
            </div>
          }
        />

        {error && <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>}
        {success && <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700">{success}</div>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
            <p className="text-[12px] text-ink-soft">Child Tasks</p>
            <p className="mt-2 text-[28px] font-semibold text-ink">{children.length}</p>
          </div>
          <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
            <p className="text-[12px] text-ink-soft">Approved</p>
            <p className="mt-2 text-[28px] font-semibold text-ink">{approvedCount}</p>
          </div>
          <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
            <p className="text-[12px] text-ink-soft">Awaiting Review</p>
            <p className="mt-2 text-[28px] font-semibold text-ink">
              {children.filter((c) => c.status === "SUBMITTED").length}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowDelegate(true)}
            disabled={["SUBMITTED", "APPROVED"].includes(assignment.status)}
            className="h-[39px] px-4 rounded-lg bg-blue-deep text-[12px] font-semibold text-white cursor-pointer disabled:opacity-50"
          >
            <Plus className="inline h-3.5 w-3.5 mr-1" />
            Delegate to Collector
          </button>
          <button
            type="button"
            onClick={handleMerge}
            disabled={!canMerge || merging}
            className="h-[39px] px-4 rounded-lg border border-line bg-white text-[12px] font-semibold cursor-pointer disabled:opacity-50"
          >
            {merging ? "Merging..." : "Merge Approved Work"}
          </button>
          <button
            type="button"
            onClick={() => setShowSubmitDialog(true)}
            disabled={!canSubmit || submitting}
            className="h-[39px] px-5 rounded-lg bg-blue-deep text-[12px] font-semibold text-white cursor-pointer disabled:opacity-50"
          >
            Submit to Admin
          </button>
          <Link
            to="/officer/reviews"
            className="h-[39px] px-4 inline-flex items-center rounded-lg border border-line bg-white text-[12px] font-semibold text-ink-soft"
          >
            Review Queue
          </Link>
        </div>

        {showDelegate && (
          <form onSubmit={handleDelegate} className="rounded-xl border border-line bg-white p-5 shadow-card-sm space-y-4 max-w-xl">
            <h3 className="text-[15px] font-semibold text-ink">Delegate Child Task</h3>
            <div>
              <label className="block text-[12px] font-semibold text-ink mb-1.5">Collector</label>
              <select
                value={delegateForm.assignedToId}
                onChange={(e) => setDelegateForm((p) => ({ ...p, assignedToId: e.target.value }))}
                className="w-full h-[40px] rounded-lg border border-line px-3 text-[13px]"
                required
              >
                {collectors.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-ink mb-1.5">Merge Order (optional)</label>
              <input
                type="number"
                min="1"
                value={delegateForm.mergeOrder}
                onChange={(e) => setDelegateForm((p) => ({ ...p, mergeOrder: e.target.value }))}
                className="w-full h-[40px] rounded-lg border border-line px-3 text-[13px]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-ink mb-1.5">Instructions</label>
              <textarea
                value={delegateForm.notes}
                onChange={(e) => setDelegateForm((p) => ({ ...p, notes: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-line px-3 py-2 text-[13px]"
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowDelegate(false)} className="h-[38px] px-4 rounded-lg border border-line text-[12px] font-semibold cursor-pointer">Cancel</button>
              <button type="submit" className="h-[38px] px-4 rounded-lg bg-blue-deep text-white text-[12px] font-semibold cursor-pointer">Create Task</button>
            </div>
          </form>
        )}

        <div className="rounded-xl border border-line bg-white shadow-card-sm overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-[16px] font-semibold text-ink">Collector Tasks</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-line bg-[#FBFCFE]">
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase text-ink-soft">Collector</th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase text-ink-soft">Status</th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase text-ink-soft">Draft Items</th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase text-ink-soft">Actions</th>
                </tr>
              </thead>
              <tbody>
                {children.length > 0 ? (
                  children.map((child) => (
                    <tr key={child.id} className="border-b border-line last:border-b-0">
                      <td className="px-5 py-4 text-[12px] font-medium text-ink">{child.assignedTo?.name}</td>
                      <td className="px-5 py-4"><AssignmentStatusBadge status={child.status} /></td>
                      <td className="px-5 py-4 text-[12px]">{getAssignmentDraftCount(child)}</td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/officer/children/${child.id}`)}
                            className="text-[11px] font-semibold text-blue-deep cursor-pointer"
                          >
                            {child.status === "SUBMITTED" ? "Review" : "View"}
                          </button>
                          {child.status === "ASSIGNED" && (
                            <button type="button" onClick={() => handleDeleteChild(child.id)} className="text-red-600 cursor-pointer">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-[12px] text-ink-soft">
                      No collector tasks yet. Delegate work to begin field collection.
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
