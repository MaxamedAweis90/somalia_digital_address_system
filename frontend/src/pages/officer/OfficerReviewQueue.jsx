import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getReviewQueue } from "@/api/officerApi";
import {
  AssignmentTypeBadge,
  formatAssignmentLocation,
  getAssignmentDraftCount,
} from "@/components/assignments/AssignmentStatusBadge";
import Breadcrumb from "@/components/ui/Breadcrumb";
import PageHeader from "@/components/ui/PageHeader";

export default function OfficerReviewQueue() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReviewQueue()
      .then((res) => setAssignments(res.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-full bg-bg font-sans">
      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10 space-y-6">
        <Breadcrumb items={[{ label: "Zones", to: "/officer/dashboard" }, { label: "Review Queue" }]} />
        <PageHeader title="Review Queue" description="Collector submissions waiting for your approval." />

        <div className="rounded-xl border border-line bg-white shadow-card-sm overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-line bg-[#FBFCFE]">
                <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase text-ink-soft">Type</th>
                <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase text-ink-soft">Collector</th>
                <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase text-ink-soft">Location</th>
                <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase text-ink-soft">Items</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="py-12 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-blue" /></td></tr>
              ) : assignments.length > 0 ? (
                assignments.map((a) => (
                  <tr key={a.id} onClick={() => navigate(`/officer/children/${a.id}`)} className="border-b border-line hover:bg-[#FBFCFE] cursor-pointer">
                    <td className="px-5 py-4"><AssignmentTypeBadge type={a.type} /></td>
                    <td className="px-5 py-4 text-[12px]">{a.assignedTo?.name}</td>
                    <td className="px-5 py-4 text-[12px] font-medium">{formatAssignmentLocation(a)}</td>
                    <td className="px-5 py-4 text-[12px]">{getAssignmentDraftCount(a)}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="py-12 text-center text-[12px] text-ink-soft">No submissions awaiting review.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
