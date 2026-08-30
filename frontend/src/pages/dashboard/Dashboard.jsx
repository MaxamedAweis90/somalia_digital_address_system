
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import StatCard from "@/components/dashboard/StatCard";
import RecentActivity from "@/components/dashboard/RecentActivity";
import StatusBadge from "@/components/dashboard/StatusBadge";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import Breadcrumb from "@/components/ui/Breadcrumb";
import PageHeader from "@/components/ui/PageHeader";

import { getDashboardSummary } from "@/api/dashboardApi";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/constants/roles";

function formatCount(value) {
  return Number(value || 0).toLocaleString();
}

export default function Dashboard() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /*
   * Change this if your routing structure uses
   * a different admin prefix.
   */
  const basePath = "/admin";

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getDashboardSummary();

      setSummary(res.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load dashboard data"
      );
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
      {
        title: "Total Districts",
        value: formatCount(counts.districts),
      },
      {
        title: "Total Neighborhoods",
        value: formatCount(counts.neighborhoods),
      },
      {
        title: "Total Zones",
        value: formatCount(counts.zones),
      },
      {
        title: "Total Addresses",
        value: formatCount(counts.addresses),
      },
    ];
  }, [summary]);

  const recentAddresses = summary?.recentAddresses || [];
  const recentActivity = summary?.recentActivity || [];

  if (loading && !summary) {
    return (
      <div className="min-h-full bg-bg font-sans">
        <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-bg font-sans">
      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10 space-y-6">
        <Breadcrumb items={[{ label: "Dashboard" }]} />

        <PageHeader
          title="Registry Overview"
          description="Real-time infrastructure metrics and addressing status."
        />

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

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
            />
          ))}
        </div>

        {/* Recent Addresses + Activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Addresses */}
          <div className="w-full bg-white border border-line rounded-xl shadow-card-sm overflow-hidden lg:col-span-2">
            <div className="px-5 py-4 border-b border-line">
              <h2 className="text-[16px] font-semibold text-ink">
                Recent Addresses
              </h2>

              <p className="mt-1 text-[12px] text-ink-soft">
                Latest registered digital addresses.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-line bg-[#FBFCFE]">
                    <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                      DAC
                    </th>

                    <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                      District
                    </th>

                    <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                      Neighborhood
                    </th>

                    <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                      Zone
                    </th>

                    <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentAddresses.length > 0 ? (
                    recentAddresses.map((address) => (
                      <tr
                        key={address.id}
                        onClick={() =>
                          navigate(
                            `${ basePath } /addresses/view / ${ address.id } `
                          )
                        }
                        className="border-b border-line last:border-b-0 hover:bg-[#FBFCFE] transition-colors cursor-pointer"
                      >
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center rounded-md bg-bg px-2.5 py-1 text-[11px] font-semibold text-blue-deep font-mono">
                            {address.addressCode}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-[12px] text-ink">
                          {address.districtName || "—"}
                        </td>

                        <td className="px-5 py-4 text-[12px] text-ink">
                          {address.neighborhoodName || "—"}
                        </td>

                        <td className="px-5 py-4 text-[12px] text-ink">
                          {address.zoneName || "—"}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={address.status} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-12 text-center"
                      >
                        <p className="text-[13px] font-medium text-ink">
                          No addresses yet
                        </p>

                        <p className="mt-1 text-[12px] text-ink-soft">
                          Register your first address to see it here.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity */}
          <RecentActivity
            activities={recentActivity}
            loading={loading && !summary}
          />
        </div>
      </div>
    </div>
  );
}
