import StatCard from "@/components/dashboard/StatCard";
import RecentActivity from "@/components/dashboard/RecentActivity";

const stats = [
  {
    title: "Total Districts",
    value: "17",
  },
  {
    title: "Total Neighborhoods",
    value: "120",
  },
  {
    title: "Total Zones",
    value: "450",
  },
  {
    title: "Total Addresses",
    value: "12,500",
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-bg font-sans px-4 sm:px-6 lg:px-5 pt-5 pb-10 space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Overview
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Real-time infrastructure metrics and addressing status.
          </p>
        </div>

        <div className="flex gap-3">
          <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Export Report
          </button>

          <button className="rounded-md bg-[#07529b] px-4 py-2 text-sm font-medium text-white hover:bg-[#06447f]">
            + New Entry
          </button>
        </div>
      </div>

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

      {/* Bottom Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Addresses */}
        <div className="rounded-lg border border-gray-200 bg-white lg:col-span-2">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Recent Addresses
            </h2>

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
                <tr>
                  <td className="px-5 py-4 font-medium text-gray-900">
                    MG-HB-01-A24
                  </td>
                  <td className="px-5 py-4 text-gray-600">Hodan</td>
                  <td className="px-5 py-4 text-gray-600">Taleex</td>
                  <td className="px-5 py-4 text-gray-600">Zone A</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                      Verified
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="px-5 py-4 font-medium text-gray-900">
                    MG-WL-03-B12
                  </td>
                  <td className="px-5 py-4 text-gray-600">Wadajir</td>
                  <td className="px-5 py-4 text-gray-600">Hawo Taako</td>
                  <td className="px-5 py-4 text-gray-600">Zone B</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700">
                      Pending
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="px-5 py-4 font-medium text-gray-900">
                    MG-KR-02-C05
                  </td>
                  <td className="px-5 py-4 text-gray-600">Karaan</td>
                  <td className="px-5 py-4 text-gray-600">Suuqa Bakaaraha</td>
                  <td className="px-5 py-4 text-gray-600">Zone C</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                      Verified
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <RecentActivity />
      </div>
    </div>
  );
}