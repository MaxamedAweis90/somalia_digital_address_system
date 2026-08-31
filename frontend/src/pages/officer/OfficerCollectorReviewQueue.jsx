import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getCollectorReviewQueue } from "@/api/officerApi";
import { getAssignmentDraftCount } from "@/components/assignments/AssignmentStatusBadge";
import Breadcrumb from "@/components/ui/Breadcrumb";
import PageHeader from "@/components/ui/PageHeader";

export default function OfficerCollectorReviewQueue() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCollectorReviewQueue()
      .then((res) => setAssignments(res.data.data || []))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load collector submissions")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-full bg-bg font-sans">
      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10 space-y-6">
        <Breadcrumb
          items={[
            { label: "Zones", to: "/officer/zones" },
            { label: "Collector Reviews" },
          ]}
        />
        <PageHeader
          title="Collector Reviews"
          description="Review and approve address registrations submitted by your data collectors."
        />

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-xl border border-line bg-white shadow-card-sm overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-[16px] font-semibold text-ink">
              Submissions Waiting for Review
            </h2>
            <p className="mt-1 text-[12px] text-ink-soft">
              Open a submission to inspect every address before approving or returning it.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-line bg-[#FBFCFE]">
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase text-ink-soft">
                    Zone Block
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase text-ink-soft">
                    Zone
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase text-ink-soft">
                    Collector
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase text-ink-soft">
                    Addresses
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase text-ink-soft">
                    Submitted
                  </th>
                  <th className="px-5 py-4 text-right text-[11px] font-semibold uppercase text-ink-soft">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin text-blue" />
                    </td>
                  </tr>
                ) : assignments.length ? (
                  assignments.map((assignment) => (
                    <tr
                      key={assignment.id}
                      className="border-b border-line last:border-b-0 hover:bg-[#FBFCFE]"
                    >
                      <td className="px-5 py-4">
                        <p className="text-[12px] font-semibold text-ink">
                          {assignment.zoneBlock?.name || "—"}
                        </p>
                        <p className="font-mono text-[11px] text-ink-soft">
                          {assignment.zoneBlock?.code || "—"}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-[12px] font-semibold text-ink">
                          {assignment.zone?.name || "—"}
                        </p>
                        <p className="font-mono text-[11px] text-ink-soft">
                          {assignment.zone?.code || "—"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-[12px] text-ink">
                        {assignment.assignedTo?.name || "—"}
                      </td>
                      <td className="px-5 py-4 text-[12px] font-semibold text-ink">
                        {getAssignmentDraftCount(assignment)}
                      </td>
                      <td className="px-5 py-4 text-[12px] text-ink-soft">
                        {assignment.submittedAt
                          ? new Date(assignment.submittedAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => navigate(`/officer/children/${assignment.id}`)}
                          className="h-[32px] rounded-md border border-line bg-white px-3 text-[11px] font-semibold text-ink hover:bg-bg cursor-pointer"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[12px] text-ink-soft">
                      No collector submissions are waiting for review.
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
