import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getReviewQueue } from "@/api/officerApi";
import AssignmentStatusBadge from "@/components/assignments/AssignmentStatusBadge";
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
        <Breadcrumb items={[{ label: "Zones", to: "/officer/zones" }, { label: "Submitted Zones" }]} />
        <PageHeader
          title="Submitted Zones"
          description="Zones you submitted that are waiting for administrator approval."
        />

        <div className="rounded-xl border border-line bg-white shadow-card-sm overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-line bg-[#FBFCFE]">
                <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase text-ink-soft">Zone</th>
                <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase text-ink-soft">District</th>
                <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase text-ink-soft">Block Tasks</th>
                <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase text-ink-soft">Submitted</th>
                <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase text-ink-soft">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-blue" /></td></tr>
              ) : assignments.length > 0 ? (
                assignments.map((a) => (
                  <tr key={a.id} onClick={() => navigate(`/officer/children/${a.id}`)} className="border-b border-line hover:bg-[#FBFCFE] cursor-pointer">
                    <td className="px-5 py-4">
                      <p className="text-[12px] font-semibold text-ink">{a.zone?.name || "—"}</p>
                      <p className="font-mono text-[11px] text-ink-soft">{a.zone?.code || "—"}</p>
                    </td>
                    <td className="px-5 py-4 text-[12px]">{a.zone?.district?.name || "—"}</td>
                    <td className="px-5 py-4 text-[12px]">{a.children?.length || 0}</td>
                    <td className="px-5 py-4 text-[12px] text-ink-soft">
                      {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-4"><AssignmentStatusBadge status={a.status} /></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="py-12 text-center text-[12px] text-ink-soft">No zones waiting for administrator approval.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
