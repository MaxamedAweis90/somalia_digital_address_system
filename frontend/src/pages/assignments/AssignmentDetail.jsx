import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  approveAssignment,
  getAssignmentById,
  rejectAssignment,
  saveAssignmentDraft,
  submitAssignment,
} from "@/api/assignmentApi";
import { getZones } from "@/api/zoneApi";
import AssignmentStatusBadge, {
  formatAssignmentLocation,
} from "@/components/assignments/AssignmentStatusBadge";
import ZoneMapEditor from "@/components/zones/ZoneMapEditor";
import Breadcrumb from "@/components/ui/Breadcrumb";
import PageHeader from "@/components/ui/PageHeader";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/constants/roles";

function createEmptyZone() {
  return {
    clientId: crypto.randomUUID(),
    name: "",
    code: "",
    status: "ACTIVE",
    geometry: null,
  };
}

export default function AssignmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.SYS_ADMIN;
  const basePath = isAdmin ? "/admin" : "/officer";

  const [assignment, setAssignment] = useState(null);
  const [existingZones, setExistingZones] = useState([]);
  const [draftZones, setDraftZones] = useState([]);
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
    if (!assignment || isAdmin) return false;
    return ["ASSIGNED", "IN_PROGRESS", "REJECTED"].includes(assignment.status);
  }, [assignment, isAdmin]);

  const canReview = isAdmin && assignment?.status === "SUBMITTED";

  const loadAssignment = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAssignmentById(id);
      const data = res.data.data;
      setAssignment(data);
      setDraftZones(data.payload?.zones?.length ? data.payload.zones : []);
      setSelectedIndex(0);

      const zonesRes = await getZones(data.neighborhoodId);
      setExistingZones(zonesRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load assignment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignment();
  }, [id]);

  const selectedZone = draftZones[selectedIndex] || null;

  const updateSelectedZone = (updates) => {
    setDraftZones((current) =>
      current.map((zone, index) =>
        index === selectedIndex ? { ...zone, ...updates } : zone
      )
    );
  };

  const handleAddZone = () => {
    const nextZones = [...draftZones, createEmptyZone()];
    setDraftZones(nextZones);
    setSelectedIndex(nextZones.length - 1);
  };

  const handleRemoveZone = (index) => {
    const nextZones = draftZones.filter((_, zoneIndex) => zoneIndex !== index);
    setDraftZones(nextZones);
    setSelectedIndex(Math.max(0, index - 1));
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const res = await saveAssignmentDraft(id, { zones: draftZones });
      setAssignment(res.data.data);
      setDraftZones(res.data.data.payload?.zones || []);
      setSuccess("Draft saved successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = () => {
    setShowSubmitDialog(true);
  };

  const confirmSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      await saveAssignmentDraft(id, { zones: draftZones });
      const res = await submitAssignment(id);
      setAssignment(res.data.data);
      setShowSubmitDialog(false);
      setSuccess("Assignment submitted for approval.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit assignment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = () => {
    setShowApproveDialog(true);
  };

  const confirmApprove = async () => {
    try {
      setReviewing(true);
      setError(null);
      await approveAssignment(id);
      await loadAssignment();
      setShowApproveDialog(false);
      setSuccess("Assignment approved and zones created.");
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
      const res = await rejectAssignment(id, rejectionReason.trim());
      setAssignment(res.data.data);
      setShowRejectForm(false);
      setRejectionReason("");
      setSuccess("Assignment rejected and sent back to the officer.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject assignment");
    } finally {
      setReviewing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-bg flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-full bg-bg p-8 text-center text-sm text-red-600">
        {error || "Assignment not found"}
      </div>
    );
  }

  return (
    <div className="min-h-full bg-bg font-sans">
      <ConfirmDialog
        open={showSubmitDialog}
        title="Submit for Approval"
        message="Submit this assignment for admin approval? You will not be able to edit it until it is reviewed."
        confirmLabel="Submit for Approval"
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
        message="Approve this assignment and create all draft zones in the registry?"
        confirmLabel="Approve & Publish Zones"
        loading={reviewing}
        loadingLabel="Approving..."
        onConfirm={confirmApprove}
        onCancel={() => {
          if (!reviewing) setShowApproveDialog(false);
        }}
      />

      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10 space-y-6">
        <Breadcrumb
          items={[
            { label: isAdmin ? "Dashboard" : "My Assignments", to: `${basePath}/dashboard` },
            { label: formatAssignmentLocation(assignment) },
          ]}
        />

        <PageHeader
          title="Define Neighborhood Zones"
          description={
            isAdmin
              ? "Review the officer's zone draft submission for this neighborhood."
              : "Draw zone boundaries for the assigned neighborhood. Save drafts as you work, then submit for approval."
          }
          actions={
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
                    onClick={handleSubmit}
                    disabled={saving || submitting || draftZones.length === 0}
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
                    onClick={handleApprove}
                    disabled={reviewing}
                    className="h-[39px] px-5 rounded-lg bg-blue-deep text-[12px] font-semibold text-white shadow-cta hover:bg-[#0F2B4D] disabled:opacity-50 cursor-pointer"
                  >
                    {reviewing ? "Approving..." : "Approve & Publish Zones"}
                  </button>
                </>
              )}
            </div>
          }
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
                <div>
                  <p className="text-ink-soft">Expected team size</p>
                  <p className="font-medium text-ink">
                    Expected team size: {assignment.expectedCollectorCount ?? 1}
                  </p>
                </div>
                {assignment.children && assignment.children.length > 0 && (
                  <div>
                    <p className="text-ink-soft">Delegated Tasks ({assignment.children.length}/{assignment.expectedCollectorCount ?? 1})</p>
                    <div className="mt-1 space-y-1">
                      {assignment.children.map((child) => (
                        <div key={child.id} className="flex justify-between items-center rounded bg-bg px-2 py-1 text-[11px]">
                          <span className="font-medium text-ink">{child.assignedTo?.name || "Collector"}</span>
                          <AssignmentStatusBadge status={child.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
              <h2 className="text-[15px] font-semibold text-ink">Existing Zones</h2>
              <p className="mt-1 text-[12px] text-ink-soft">
                Read-only reference for zones already in this neighborhood.
              </p>

              <div className="mt-4 space-y-2">
                {existingZones.length > 0 ? (
                  existingZones.map((zone) => (
                    <div
                      key={zone.id}
                      className="rounded-lg border border-line bg-bg px-3 py-2 text-[12px]"
                    >
                      <p className="font-semibold text-ink">{zone.name}</p>
                      <p className="text-ink-soft font-mono">{zone.code}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[12px] text-ink-soft">No zones published yet.</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-[15px] font-semibold text-ink">Draft Zones</h2>
                  <p className="mt-1 text-[12px] text-ink-soft">
                    {canEdit
                      ? "Add zones and draw each boundary on the map."
                      : "Submitted zone definitions awaiting review."}
                  </p>
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={handleAddZone}
                    className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-[11px] font-semibold text-ink hover:bg-bg cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </button>
                )}
              </div>

              <div className="mt-4 space-y-2">
                {draftZones.length > 0 ? (
                  draftZones.map((zone, index) => (
                    <button
                      key={zone.clientId}
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
                          {zone.name || `Zone ${index + 1}`}
                        </p>
                        <p className="text-[11px] text-ink-soft font-mono">
                          {zone.code || "No code yet"}
                        </p>
                      </div>
                      {canEdit && (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveZone(index);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRemoveZone(index);
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
                    No draft zones yet. Add a zone to begin.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6 xl:col-span-2">
            {selectedZone ? (
              <>
                <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm space-y-4">
                  <h2 className="text-[15px] font-semibold text-ink">
                    Zone Details
                  </h2>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[12px] font-semibold text-ink mb-1.5">
                        Zone Name
                      </label>
                      <input
                        type="text"
                        value={selectedZone.name}
                        disabled={!canEdit}
                        onChange={(e) => updateSelectedZone({ name: e.target.value })}
                        className="w-full h-[40px] rounded-lg border border-line bg-white px-3 text-[13px] text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/10 disabled:bg-bg"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-ink mb-1.5">
                        Zone Code
                      </label>
                      <input
                        type="text"
                        value={selectedZone.code}
                        disabled={!canEdit}
                        onChange={(e) =>
                          updateSelectedZone({ code: e.target.value.toUpperCase() })
                        }
                        className="w-full h-[40px] rounded-lg border border-line bg-white px-3 text-[13px] text-ink font-mono outline-none focus:border-blue focus:ring-2 focus:ring-blue/10 disabled:bg-bg"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
                  <ZoneMapEditor
                    geometry={selectedZone.geometry}
                    onChange={(geometry) => updateSelectedZone({ geometry })}
                    editable={canEdit}
                    height="520px"
                  />
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-line bg-white p-10 text-center shadow-card-sm">
                <p className="text-[13px] font-medium text-ink">Select or add a draft zone</p>
                <p className="mt-1 text-[12px] text-ink-soft">
                  Each zone needs a name, code, and boundary polygon.
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
      </div>
    </div>
  );
}
