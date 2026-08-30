import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { getDashboardSummary } from "@/api/dashboardApi";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/constants/roles";

function formatCount(value) {
  return Number(value || 0).toLocaleString();
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const basePath = user?.role === ROLES.SYS_ADMIN ? "/admin" : "/officer";

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDashboardSummary();
      setSummary(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const stats = useMemo(() => {
    const counts = summary?.counts || {};

    return [
      { title: "Total Districts", value: formatCount(counts.districts) },
      { title: "Total Neighborhoods", value: formatCount(counts.neighborhoods) },
      { title: "Total Zones", value: formatCount(counts.zones) },
      { title: "Total Addresses", value: formatCount(counts.addresses) },
    ];
  }, [summary]);

  const recentAddresses = summary?.recentAddresses || [];
  const recentActivity = summary?.recentActivity || [];

  return (
    <div className="min-h-screen bg-bg font-sans px-4 sm:px-6 lg:px-5 pt-5 pb-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registry Overview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Real-time infrastructure metrics and addressing status.
          </p>
        </div>

        <div className="flex gap-3 self-start sm:self-auto">
          <button
            onClick={fetchSummary}
            disabled={loading}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
          >
            Refresh
          </button>

          <button
            onClick={() => navigate(`${basePath}/addresses/add`)}
            className="rounded-md bg-[#07529b] px-4 py-2 text-sm font-medium text-white hover:bg-[#06447f] cursor-pointer"
          >
            + Register Address
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchSummary}
            className="text-xs font-semibold underline hover:text-red-900 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading && !summary ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 bg-white p-5 flex items-center justify-center h-[120px]"
            >
              <Loader2 className="h-5 w-5 animate-spin text-[#07529b]" />
            </div>
          ))
        ) : (
          stats.map((stat) => (
            <StatCard key={stat.title} title={stat.title} value={stat.value} />
          ))
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white lg:col-span-2">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">Recent Addresses</h2>
            <p className="mt-1 text-xs text-gray-500">
              Latest registered digital addresses.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3">DAC</th>
                  <th className="px-5 py-3">District</th>
                  <th className="px-5 py-3">Neighborhood</th>
                  <th className="px-5 py-3">Zone</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading && !summary ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center">
                      <Loader2 className="h-5 w-5 animate-spin text-[#07529b] mx-auto" />
                    </td>
                  </tr>
                ) : recentAddresses.length > 0 ? (
                  recentAddresses.map((address) => {
                    const isActive = (address.status || "ACTIVE").toUpperCase() === "ACTIVE";

                    return (
                      <tr
                        key={address.id}
                        onClick={() => navigate(`${basePath}/addresses/view/${address.id}`)}
                        className="cursor-pointer hover:bg-gray-50"
                      >
                        <td className="px-5 py-4 font-medium text-gray-900 font-mono text-xs">
                          {address.addressCode}
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          {address.districtName || "—"}
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          {address.neighborhoodName || "—"}
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          {address.zoneName || "—"}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">
                      No addresses registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <RecentActivity activities={recentActivity} loading={loading && !summary} />
      </div>
    </div>
  );
}
