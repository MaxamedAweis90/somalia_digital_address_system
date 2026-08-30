import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  approveAssignment,
  getAssignmentById,
  rejectAssignment,
} from "@/api/assignmentApi";
import {
  approveChildAssignment,
  getOfficerAssignmentById,
  rejectChildAssignment,
} from "@/api/officerApi";
import {
  getCollectorAssignmentById,
  saveCollectorDraft,
  submitCollectorAssignment,
} from "@/api/collectorApi";
import { getZoneById } from "@/api/zoneApi";
import { getZoneBlocks } from "@/api/zoneBlockApi";
import AssignmentStatusBadge, {
  formatAssignmentLocation,
} from "@/components/assignments/AssignmentStatusBadge";
import ZoneMapEditor from "@/components/zone-blocks/ZoneMapEditor";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { AssignmentWorkSteps } from "@/components/assignments/OfficerWorkflowGuide";

function createEmptyZoneBlock() {
  return {
    clientId: crypto.randomUUID(),
    name: "",
    code: "",
    status: "ACTIVE",
    geometry: null,
  };
}

export default function DefineZoneBlocksAssignment({
  id,
  workflowMode = "collector",
  onAssignmentLoaded,
}) {
  const [assignment, setAssignment] = useState(null);
  const [zoneGeometry, setZoneGeometry] = useState(null);
  const [existingZoneBlocks, setExistingZoneBlocks] = useState([]);
  const [draftZoneBlocks, setDraftZoneBlocks] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);

  const canEdit = useMemo(() => {
    if (!assignment || workflowMode !== "collector") return false;
    return ["ASSIGNED", "IN_PROGRESS", "REJECTED"].includes(assignment.status);
  }, [assignment, workflowMode]);

  const canReview =
    (workflowMode === "admin" && assignment?.status === "SUBMITTED") ||
    (workflowMode === "officer-review" && assignment?.status === "SUBMITTED");

  const loadAssignment = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetcher =
        workflowMode === "collector"
          ? getCollectorAssignmentById
          : workflowMode === "officer-review"
            ? getOfficerAssignmentById
            : getAssignmentById;
      const res = await fetcher(id);
      const data = res.data.data;
      setAssignment(data);
      onAssignmentLoaded?.(data);
      setDraftZoneBlocks(data.payload?.zoneBlocks?.length ? data.payload.zoneBlocks : []);
      setSelectedIndex(0);

      const [zoneBlocksRes, zoneRes] = await Promise.all([
        getZoneBlocks(data.zoneId),
        getZoneById(data.zoneId),
      ]);

      setExistingZoneBlocks(zoneBlocksRes.data.data || []);
      setZoneGeometry(zoneRes.data.data?.geometry || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load assignment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignment();
  }, [id]);

  const selectedZoneBlock = draftZoneBlocks[selectedIndex] || null;

  const updateSelectedZoneBlock = (updates) => {
    setDraftZoneBlocks((current) =>
      current.map((zoneBlock, index) =>
        index === selectedIndex ? { ...zoneBlock, ...updates } : zoneBlock
      )
    );
  };

  const handleAddZoneBlock = () => {
    const nextZoneBlocks = [...draftZoneBlocks, createEmptyZoneBlock()];
    setDraftZoneBlocks(nextZoneBlocks);
    setSelectedIndex(nextZoneBlocks.length - 1);
  };

  const handleRemoveZoneBlock = (index) => {
    const nextZoneBlocks = draftZoneBlocks.filter((_, zoneBlockIndex) => zoneBlockIndex !== index);
    setDraftZoneBlocks(nextZoneBlocks);
    setSelectedIndex(Math.max(0, index - 1));
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const res = await saveCollectorDraft(id, { zoneBlocks: draftZoneBlocks });
      setAssignment(res.data.data);
      setDraftZoneBlocks(res.data.data.payload?.zoneBlocks || []);
      setSuccess("Draft saved successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  const confirmSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      await saveCollectorDraft(id, { zoneBlocks: draftZoneBlocks });
      const res = await submitCollectorAssignment(id);
      setAssignment(res.data.data);
      setShowSubmitDialog(false);
      setSuccess("Assignment submitted to your data officer.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit assignment");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmApprove = async () => {
    try {
      setReviewing(true);
      setError(null);
      if (workflowMode === "officer-review") {
        await approveChildAssignment(id);
      } else {
        await approveAssignment(id);
      }
      await loadAssignment();
      setShowApproveDialog(false);
      setSuccess(
        workflowMode === "officer-review"
          ? "Child assignment approved."
          : "Assignment approved and zone blocks created."
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve assignment");
    } finally {
      setReviewing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError("Rejection reason is required");
      return;
    }

    try {
      setReviewing(true);
      setError(null);
      const res =
        workflowMode === "officer-review"
          ? await rejectChildAssignment(id, rejectionReason.trim())
          : await rejectAssignment(id, rejectionReason.trim());
      setAssignment(res.data.data);
      setShowRejectForm(false);
      setRejectionReason("");
      setSuccess(
        workflowMode === "officer-review"
          ? "Child assignment rejected and sent back to the collector."
          : "Assignment rejected and sent back to the officer."
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject assignment");
    } finally {
      setReviewing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-blue" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
        {error || "Assignment not found"}
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog
        open={showSubmitDialog}
        title="Submit for Approval"
        message="Submit this zone block definition to your data officer for review?"
        confirmLabel="Submit to Officer"
        loading={submitting}
        loadingLabel="Submitting..."
        onConfirm={confirmSubmit}
        onCancel={() => {
          if (!submitting) setShowSubmitDialog(false);
        }}
      />

      <ConfirmDialog
        open={showApproveDialog}
        title="Approve Assignment"
        message="Approve this assignment and create all draft zone blocks in the registry?"
        confirmLabel="Approve & Publish Zone Blocks"
        loading={reviewing}
        loadingLabel="Approving..."
        onConfirm={confirmApprove}
        onCancel={() => {
          if (!reviewing) setShowApproveDialog(false);
        }}
      />

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {canEdit && <AssignmentWorkSteps type="DEFINE_ZONE_BLOCKS" />}

      <div className="flex flex-wrap gap-2">
        {canEdit && (
          <>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving || submitting}
              className="h-[39px] px-4 rounded-lg border border-line bg-white text-[12px] font-semibold text-ink-soft hover:bg-bg disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Saving..." : "Save Draft"}
            </button>
            <button
              type="button"
              onClick={() => setShowSubmitDialog(true)}
              disabled={saving || submitting || draftZoneBlocks.length === 0}
              className="h-[39px] px-5 rounded-lg bg-blue-deep text-[12px] font-semibold text-white shadow-cta hover:bg-[#0F2B4D] disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Submitting..." : "Submit for Approval"}
            </button>
          </>
        )}
        {canReview && (
          <>
            <button
              type="button"
              onClick={() => setShowRejectForm((current) => !current)}
              className="h-[39px] px-4 rounded-lg border border-red-200 bg-red-50 text-[12px] font-semibold text-red-700 hover:bg-red-100 cursor-pointer"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={() => setShowApproveDialog(true)}
              disabled={reviewing}
              className="h-[39px] px-5 rounded-lg bg-blue-deep text-[12px] font-semibold text-white shadow-cta hover:bg-[#0F2B4D] disabled:opacity-50 cursor-pointer"
            >
              {reviewing ? "Approving..." : "Approve & Publish Zone Blocks"}
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-1">
          <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[15px] font-semibold text-ink">Assignment</h2>
              <AssignmentStatusBadge status={assignment.status} />
            </div>

            <div className="space-y-3 text-[12px]">
              <div>
                <p className="text-ink-soft">Location</p>
                <p className="font-medium text-ink">{formatAssignmentLocation(assignment)}</p>
              </div>
              <div>
                <p className="text-ink-soft">Assigned Officer</p>
                <p className="font-medium text-ink">{assignment.assignedTo?.name}</p>
              </div>
              {assignment.notes && (
                <div>
                  <p className="text-ink-soft">Instructions</p>
                  <p className="text-ink">{assignment.notes}</p>
                </div>
              )}
              {assignment.rejectionReason && (
                <div className="rounded-lg bg-red-50 border border-red-100 p-3">
                  <p className="text-ink-soft">Rejection Reason</p>
                  <p className="text-red-700">{assignment.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
            <h2 className="text-[15px] font-semibold text-ink">Existing Zone Blocks</h2>
            <p className="mt-1 text-[12px] text-ink-soft">
              Read-only reference for zone blocks already in this zone.
            </p>

            <div className="mt-4 space-y-2">
              {existingZoneBlocks.length > 0 ? (
                existingZoneBlocks.map((zoneBlock) => (
                  <div
                    key={zoneBlock.id}
                    className="rounded-lg border border-line bg-bg px-3 py-2 text-[12px]"
                  >
                    <p className="font-semibold text-ink">{zoneBlock.name}</p>
                    <p className="text-ink-soft font-mono">{zoneBlock.code}</p>
                  </div>
                ))
              ) : (
                <p className="text-[12px] text-ink-soft">No zone blocks published yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[15px] font-semibold text-ink">Draft Zone Blocks</h2>
                <p className="mt-1 text-[12px] text-ink-soft">
                  {canEdit
                    ? "Add zone blocks and draw each boundary on the map."
                    : "Submitted zone block definitions awaiting review."}
                </p>
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={handleAddZoneBlock}
                  className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-[11px] font-semibold text-ink hover:bg-bg cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              )}
            </div>

            <div className="mt-4 space-y-2">
              {draftZoneBlocks.length > 0 ? (
                draftZoneBlocks.map((zoneBlock, index) => (
                  <button
                    key={zoneBlock.clientId}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors cursor-pointer ${
                      selectedIndex === index
                        ? "border-blue bg-blue/5"
                        : "border-line hover:bg-bg"
                    }`}
                  >
                    <div>
                      <p className="text-[12px] font-semibold text-ink">
                        {zoneBlock.name || `Zone Block ${index + 1}`}
                      </p>
                      <p className="text-[11px] text-ink-soft font-mono">
                        {zoneBlock.code || "No code yet"}
                      </p>
                    </div>
                    {canEdit && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveZoneBlock(index);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveZoneBlock(index);
                          }
                        }}
                        className="text-ink-soft hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <p className="text-[12px] text-ink-soft">
                  No draft zone blocks yet. Add a zone block to begin.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 xl:col-span-2">
          {selectedZoneBlock ? (
            <>
              <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm space-y-4">
                <h2 className="text-[15px] font-semibold text-ink">Zone Block Details</h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[12px] font-semibold text-ink mb-1.5">
                      Zone Block Name
                    </label>
                    <input
                      type="text"
                      value={selectedZoneBlock.name}
                      disabled={!canEdit}
                      onChange={(e) => updateSelectedZoneBlock({ name: e.target.value })}
                      className="w-full h-[40px] rounded-lg border border-line bg-white px-3 text-[13px] text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/10 disabled:bg-bg"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-ink mb-1.5">
                      Zone Block Code
                    </label>
                    <input
                      type="text"
                      value={selectedZoneBlock.code}
                      disabled={!canEdit}
                      onChange={(e) =>
                        updateSelectedZoneBlock({ code: e.target.value.toUpperCase() })
                      }
                      className="w-full h-[40px] rounded-lg border border-line bg-white px-3 text-[13px] text-ink font-mono outline-none focus:border-blue focus:ring-2 focus:ring-blue/10 disabled:bg-bg"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
                <ZoneMapEditor
                  geometry={selectedZoneBlock.geometry}
                  onChange={(geometry) => updateSelectedZoneBlock({ geometry })}
                  editable={canEdit}
                  boundaryGeometry={zoneGeometry}
                  height="520px"
                />
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-line bg-white p-10 text-center shadow-card-sm">
              <p className="text-[13px] font-medium text-ink">Select or add a draft zone block</p>
              <p className="mt-1 text-[12px] text-ink-soft">
                Each zone block needs a name, code, and boundary polygon.
              </p>
            </div>
          )}
        </div>
      </div>

      {showRejectForm && canReview && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 space-y-3">
          <h3 className="text-[14px] font-semibold text-red-800">Reject Assignment</h3>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={3}
            placeholder="Explain what needs to be corrected..."
            className="w-full rounded-lg border border-red-200 bg-white px-3 py-2.5 text-[13px] text-ink outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowRejectForm(false)}
              className="h-[38px] px-4 rounded-lg border border-line bg-white text-[12px] font-semibold text-ink-soft cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReject}
              disabled={reviewing}
              className="h-[38px] px-4 rounded-lg bg-red-600 text-[12px] font-semibold text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer"
            >
              {reviewing ? "Rejecting..." : "Confirm Rejection"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
