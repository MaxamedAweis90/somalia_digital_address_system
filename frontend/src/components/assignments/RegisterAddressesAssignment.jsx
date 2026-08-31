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
import { previewAddressCode } from "@/api/addressApi";
import { getZoneById } from "@/api/zoneApi";
import { getZoneBlockById } from "@/api/zoneBlockApi";
import AddressDraftMap from "@/components/assignments/AddressDraftMap";
import AssignmentStatusBadge, {
  formatAssignmentLocation,
} from "@/components/assignments/AssignmentStatusBadge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { AssignmentWorkSteps } from "@/components/assignments/OfficerWorkflowGuide";

function createEmptyAddress() {
  return {
    clientId: crypto.randomUUID(),
    streetName: "",
    description: "",
    latitude: null,
    longitude: null,
  };
}

export default function RegisterAddressesAssignment({
  id,
  workflowMode = "collector",
  onAssignmentLoaded,
}) {
  const [assignment, setAssignment] = useState(null);
  const [zoneBlockGeometry, setZoneBlockGeometry] = useState(null);
  const [zoneGeometry, setZoneGeometry] = useState(null);
  const [draftAddresses, setDraftAddresses] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [dacPreview, setDacPreview] = useState({});
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

  const selectedAddress =
    draftAddresses.find((address) => address.clientId === selectedClientId) || null;

  const loadDacPreview = async (zoneBlockId) => {
    if (!zoneBlockId) return;

    try {
      const res = await previewAddressCode(zoneBlockId);
      setDacPreview(res.data.data || {});
    } catch {
      setDacPreview({});
    }
  };

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

      const addresses = data.payload?.addresses?.length
        ? data.payload.addresses
        : [];
      setDraftAddresses(addresses);
      setSelectedClientId(addresses[0]?.clientId || null);

      if (data.zoneBlockId) {
        const [zoneBlockRes, zoneRes] = await Promise.all([
          getZoneBlockById(data.zoneBlockId),
          getZoneById(data.zoneId),
        ]);

        setZoneBlockGeometry(zoneBlockRes.data.data?.geometry || null);
        setZoneGeometry(zoneRes.data.data?.geometry || null);
        await loadDacPreview(data.zoneBlockId);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load assignment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // The loader synchronizes this screen with the selected assignment API data.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAssignment();
  }, [id]);

  const updateSelectedAddress = (updates) => {
    if (!selectedClientId) return;

    setDraftAddresses((current) =>
      current.map((address) =>
        address.clientId === selectedClientId ? { ...address, ...updates } : address
      )
    );
  };

  const handleAddAddress = () => {
    const nextAddress = createEmptyAddress();
    setDraftAddresses((current) => [...current, nextAddress]);
    setSelectedClientId(nextAddress.clientId);
  };

  const handleRemoveAddress = (clientId) => {
    setDraftAddresses((current) => {
      const next = current.filter((address) => address.clientId !== clientId);
      if (selectedClientId === clientId) {
        setSelectedClientId(next[0]?.clientId || null);
      }
      return next;
    });
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const res = await saveCollectorDraft(id, { addresses: draftAddresses });
      setAssignment(res.data.data);
      setDraftAddresses(res.data.data.payload?.addresses || []);
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
      await saveCollectorDraft(id, { addresses: draftAddresses });
      const res = await submitCollectorAssignment(id);
      setAssignment(res.data.data);
      setShowSubmitDialog(false);
      setSuccess("Assignment submitted to your data officer.");
    } catch (err) {
      setShowSubmitDialog(false);
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
          : "Assignment approved and addresses registered."
      );
    } catch (err) {
      setShowApproveDialog(false);
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

  const previewCodes = useMemo(() => {
    const baseHouse = Number(dacPreview.houseNumber || 1);
    const prefix = dacPreview.addressCode
      ? dacPreview.addressCode.replace(/-\d+$/, "")
      : assignment?.zoneBlock?.code
        ? `${assignment.zone?.district?.code || "DAC"}-${assignment.zone?.code || "ZON"}-${assignment.zoneBlock.code}`
        : "DAC";

    return draftAddresses.map((_, index) => {
      const houseNumber = String(baseHouse + index).padStart(4, "0");
      return `${prefix}-${houseNumber}`;
    });
  }, [draftAddresses, dacPreview, assignment]);

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
        message="Submit these draft addresses to your data officer for review?"
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
        message="Approve this assignment and register all draft addresses with sequential DAC codes?"
        confirmLabel="Approve & Register Addresses"
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

      {canEdit && <AssignmentWorkSteps type="REGISTER_ADDRESSES" />}

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
              disabled={saving || submitting || draftAddresses.length === 0}
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
              {reviewing ? "Approving..." : "Approve & Register Addresses"}
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
                <p className="text-ink-soft">Zone Block</p>
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
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[15px] font-semibold text-ink">Draft Addresses</h2>
                <p className="mt-1 text-[12px] text-ink-soft">
                  {canEdit
                    ? "Add addresses and place each pin inside the zone."
                    : "Submitted address drafts awaiting review."}
                </p>
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={handleAddAddress}
                  className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-[11px] font-semibold text-ink hover:bg-bg cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              )}
            </div>

            <div className="mt-4 space-y-2">
              {draftAddresses.length > 0 ? (
                draftAddresses.map((address, index) => (
                  <button
                    key={address.clientId}
                    type="button"
                    onClick={() => setSelectedClientId(address.clientId)}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors cursor-pointer ${
                      selectedClientId === address.clientId
                        ? "border-blue bg-blue/5"
                        : "border-line hover:bg-bg"
                    }`}
                  >
                    <div>
                      <p className="text-[12px] font-semibold text-ink">
                        {address.streetName || `Address ${index + 1}`}
                      </p>
                      <p className="text-[11px] text-ink-soft font-mono">
                        {previewCodes[index] || "DAC preview pending"}
                      </p>
                    </div>
                    {canEdit && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveAddress(address.clientId);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveAddress(address.clientId);
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
                  No draft addresses yet. Add an address to begin.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 xl:col-span-2">
          {selectedAddress ? (
            <>
              <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm space-y-4">
                <h2 className="text-[15px] font-semibold text-ink">Address Details</h2>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-ink mb-1.5">
                      Street Name
                    </label>
                    <input
                      type="text"
                      value={selectedAddress.streetName}
                      disabled={!canEdit}
                      onChange={(e) => updateSelectedAddress({ streetName: e.target.value })}
                      className="w-full h-[40px] rounded-lg border border-line bg-white px-3 text-[13px] text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/10 disabled:bg-bg"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-ink mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={selectedAddress.description}
                      disabled={!canEdit}
                      onChange={(e) => updateSelectedAddress({ description: e.target.value })}
                      rows={3}
                      className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[13px] text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/10 disabled:bg-bg"
                    />
                  </div>
                  <div className="rounded-lg bg-bg border border-line px-3 py-2 text-[12px]">
                    <p className="text-ink-soft">DAC Preview</p>
                    <p className="font-mono font-semibold text-ink">
                      {previewCodes[draftAddresses.findIndex((item) => item.clientId === selectedClientId)] ||
                        "—"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
                <AddressDraftMap
                  zoneBlockGeometry={zoneBlockGeometry}
                  zoneGeometry={zoneGeometry}
                  addresses={draftAddresses}
                  selectedClientId={selectedClientId}
                  onPinChange={(coords) => updateSelectedAddress(coords)}
                  editable={canEdit}
                />
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-line bg-white p-10 text-center shadow-card-sm">
              <p className="text-[13px] font-medium text-ink">Select or add a draft address</p>
              <p className="mt-1 text-[12px] text-ink-soft">
                Each address needs a street name, description, and GPS pin inside the zone.
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
