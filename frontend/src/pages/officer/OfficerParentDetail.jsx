import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, Plus, Users } from "lucide-react";
import { getAssignmentById, delegateChildAssignment } from "@/api/assignmentApi";
import { getDataOfficers } from "@/api/dataOfficerApi";
import AssignmentStatusBadge, {
  formatAssignmentLocation,
} from "@/components/assignments/AssignmentStatusBadge";
import Breadcrumb from "@/components/ui/Breadcrumb";
import PageHeader from "@/components/ui/PageHeader";

export default function OfficerParentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [delegating, setDelegating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showDelegateModal, setShowDelegateModal] = useState(false);

  const [delegateForm, setDelegateForm] = useState({
    assignedToId: "",
    notes: "",
    dueAt: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [assignmentRes, officersRes] = await Promise.all([
        getAssignmentById(id),
        getDataOfficers(),
      ]);

      const assignData = assignmentRes.data.data;
      const officerData = officersRes.data.data || [];

      setAssignment(assignData);
      setOfficers(officerData);

      const availableOfficer = officerData.find((o) => o.id !== assignData.assignedToId);
      if (availableOfficer) {
        setDelegateForm((prev) => ({ ...prev, assignedToId: availableOfficer.id }));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load assignment details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const delegatedCount = useMemo(() => {
    return assignment?.delegatedCount ?? assignment?.children?.length ?? 0;
  }, [assignment]);

  const expectedCollectorCount = useMemo(() => {
    return assignment?.expectedCollectorCount ?? 1;
  }, [assignment]);

  const isLimitReached = delegatedCount >= expectedCollectorCount;

  const handleDelegateSubmit = async (e) => {
    e.preventDefault();

    if (!delegateForm.assignedToId) {
      setError("Please select a data collector.");
      return;
    }

    try {
      setDelegating(true);
      setError(null);
      setSuccess(null);

      await delegateChildAssignment(id, {
        assignedToId: delegateForm.assignedToId,
        notes: delegateForm.notes || undefined,
        dueAt: delegateForm.dueAt || undefined,
      });

      setSuccess("Child assignment delegated successfully.");
      setShowDelegateModal(false);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delegate child assignment");
    } finally {
      setDelegating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-bg flex items-center justify-center p-12">
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
      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10 space-y-6">
        <Breadcrumb
          items={[
            { label: "My Assignments", to: "/officer/dashboard" },
            { label: formatAssignmentLocation(assignment) },
          ]}
        />

        <PageHeader
          title="Parent Assignment Overview"
          description="Manage parallel collector delegations for this area."
          actions={
            <button
              type="button"
              disabled={isLimitReached}
              onClick={() => {
                setError(null);
                setShowDelegateModal(true);
              }}
              className="h-[39px] px-5 rounded-lg bg-blue-deep text-[12px] font-semibold text-white shadow-cta hover:bg-[#0F2B4D] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Delegate to Collector
            </button>
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Team Size Card */}
          <div className="rounded-xl border border-line bg-white p-6 shadow-card-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-ink">Team Size</span>
              <Users className="h-5 w-5 text-blue" />
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-ink">
                {delegatedCount} / {expectedCollectorCount}
              </span>
              <span className="text-[12px] text-ink-soft">tasks delegated</span>
            </div>

            <p className="text-[12px] text-ink-soft border-t border-line pt-3">
              Admin expects {expectedCollectorCount} parallel collector tasks.
            </p>

            {isLimitReached && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-800">
                Maximum collector tasks reached ({delegatedCount}/{expectedCollectorCount}).
              </div>
            )}
          </div>

          {/* Details Card */}
          <div className="rounded-xl border border-line bg-white p-6 shadow-card-sm space-y-3 text-[12px] lg:col-span-2">
            <div className="flex justify-between items-center pb-2 border-b border-line">
              <h2 className="text-[15px] font-semibold text-ink">Scope & Location</h2>
              <AssignmentStatusBadge status={assignment.status} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-ink-soft">Location</p>
                <p className="font-semibold text-ink">{formatAssignmentLocation(assignment)}</p>
              </div>
              <div>
                <p className="text-ink-soft">Assigned Data Officer</p>
                <p className="font-semibold text-ink">{assignment.assignedTo?.name}</p>
              </div>
              {assignment.dueAt && (
                <div>
                  <p className="text-ink-soft">Due Date</p>
                  <p className="font-semibold text-ink">
                    {new Date(assignment.dueAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
            {assignment.notes && (
              <div className="pt-2 border-t border-line">
                <p className="text-ink-soft">Admin Instructions</p>
                <p className="text-ink mt-0.5">{assignment.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Delegated Children Table */}
        <div className="rounded-xl border border-line bg-white shadow-card-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-line flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-semibold text-ink">Delegated Collector Tasks</h2>
              <p className="mt-0.5 text-[12px] text-ink-soft">
                Parallel child assignments created under this parent task.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-line bg-[#FBFCFE]">
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Collector
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Status
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Instructions / Notes
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {assignment.children && assignment.children.length > 0 ? (
                  assignment.children.map((child) => (
                    <tr
                      key={child.id}
                      onClick={() => navigate(`/officer/assignments/${child.id}`)}
                      className="border-b border-line last:border-b-0 hover:bg-[#FBFCFE] transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-4 text-[12px] font-semibold text-ink">
                        {child.assignedTo?.name || "—"}
                      </td>
                      <td className="px-5 py-4">
                        <AssignmentStatusBadge status={child.status} />
                      </td>
                      <td className="px-5 py-4 text-[12px] text-ink line-clamp-1">
                        {child.notes || "—"}
                      </td>
                      <td className="px-5 py-4 text-[12px] text-ink-soft">
                        {new Date(child.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-[12px] text-ink-soft">
                      No collector tasks delegated yet. Click "Delegate to Collector" to assign work.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delegate Modal */}
        {showDelegateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-xl border border-line bg-white p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-semibold text-ink">Delegate Task to Collector</h3>
              <p className="text-[12px] text-ink-soft">
                Assign a collector to work in parallel on this assignment. ({delegatedCount}/{expectedCollectorCount})
              </p>

              <form onSubmit={handleDelegateSubmit} className="space-y-4 pt-2">
                <div>
                  <label className="block text-[12px] font-semibold text-ink mb-1.5">
                    Data Collector
                  </label>
                  <select
                    value={delegateForm.assignedToId}
                    onChange={(e) =>
                      setDelegateForm((prev) => ({ ...prev, assignedToId: e.target.value }))
                    }
                    className="w-full h-[40px] rounded-lg border border-line bg-white px-3 text-[13px] text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/10"
                  >
                    {officers.map((officer) => (
                      <option key={officer.id} value={officer.id}>
                        {officer.name} ({officer.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-ink mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={delegateForm.dueAt}
                    onChange={(e) =>
                      setDelegateForm((prev) => ({ ...prev, dueAt: e.target.value }))
                    }
                    className="w-full h-[40px] rounded-lg border border-line bg-white px-3 text-[13px] text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/10"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-ink mb-1.5">
                    Instructions / Sector Notes
                  </label>
                  <textarea
                    rows={3}
                    value={delegateForm.notes}
                    onChange={(e) =>
                      setDelegateForm((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    placeholder="e.g. East sector zone boundary drawing..."
                    className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[13px] text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/10"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDelegateModal(false)}
                    className="h-[38px] px-4 rounded-lg border border-line bg-white text-[12px] font-semibold text-ink-soft hover:bg-bg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={delegating}
                    className="h-[38px] px-5 rounded-lg bg-blue-deep text-[12px] font-semibold text-white shadow-cta hover:bg-[#0F2B4D] disabled:opacity-50 cursor-pointer"
                  >
                    {delegating ? "Delegating..." : "Delegate Task"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
