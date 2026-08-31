import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getCollectors } from "@/api/officerApi";
import Breadcrumb from "@/components/ui/Breadcrumb";
import PageHeader from "@/components/ui/PageHeader";

export default function OfficerCollectors() {
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setError(null);
      const res = await getCollectors();
      setCollectors(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load your data collectors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // The loader synchronizes the team list with the authenticated officer's API data.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  return (
    <div className="min-h-full bg-bg font-sans">
      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10 space-y-6">
        <Breadcrumb items={[{ label: "Zones", to: "/officer/zones" }, { label: "My Team" }]} />
        <PageHeader
          title="My Data Collectors"
          description="View the collectors assigned to you. Assign them to zone blocks from the Zones menu."
        />
        {error && <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>}

        <div className="rounded-xl border border-line bg-white shadow-card-sm overflow-hidden">
          {loading ? (
            <div className="py-12 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-blue" /></div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-line bg-[#FBFCFE]">
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase text-ink-soft">Name</th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase text-ink-soft">Email</th>
                </tr>
              </thead>
              <tbody>
                {collectors.map((c) => (
                  <tr key={c.id} className="border-b border-line">
                    <td className="px-5 py-4 text-[12px] font-medium">{c.name}</td>
                    <td className="px-5 py-4 text-[12px] text-ink-soft">{c.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
