import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const initialZones = [
  {
    id: 1,
    name: "Zone A",
    district: "Hodan",
    code: "ZN-001",
    status: "Active",
  },
  {
    id: 2,
    name: "Zone B",
    district: "Wadajir",
    code: "ZN-002",
    status: "Active",
  },
  {
    id: 3,
    name: "Zone C",
    district: "Karaan",
    code: "ZN-003",
    status: "Inactive",
  },
];

export default function Zone() {
  const navigate = useNavigate();
  const [zones, setZones] = useState(initialZones);
  const [search, setSearch] = useState("");

  const filteredZones = zones.filter(
    (zone) =>
      zone.name.toLowerCase().includes(search.toLowerCase()) ||
      zone.district.toLowerCase().includes(search.toLowerCase()) ||
      zone.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this zone?"
    );

    if (!confirmDelete) return;

    setZones((current) =>
      current.filter((zone) => zone.id !== id)
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <h1 className="text-3xl font-bold text-[#172B4D]">
            Zone Management
          </h1>

          <p className="mt-1 text-gray-500">
            Manage zones within districts.
          </p>
        </div>

        <Link
          to="/admin/zones/add"
          className="rounded-lg bg-[#0056B3] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#00458F]"
        >
          + Add Zone
        </Link>

      </div>

      {/* Search */}
      <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">

        <div className="flex flex-col gap-3 md:flex-row">

          <input
            type="text"
            placeholder="Search by zone, district or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0056B3] focus:ring-1 focus:ring-[#0056B3]"
          />

        </div>

      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="bg-gray-50">

              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  #
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Zone Name
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  District
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Zone Code
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100">

              {filteredZones.length > 0 ? (
                filteredZones.map((zone, index) => (

                  <tr
                    key={zone.id}
                    className="transition hover:bg-gray-50"
                  >

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {index + 1}
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-semibold text-[#172B4D]">
                        {zone.name}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {zone.district}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        {zone.code}
                      </span>
                    </td>

                    <td className="px-6 py-4">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          zone.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {zone.status}
                      </span>

                    </td>

                    <td className="px-6 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() =>
                            navigate(`/admin/zones/edit/${zone.id}`)
                          }
                          className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-[#0056B3] hover:bg-blue-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(zone.id)}
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                ))
              ) : (

                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No zones found.
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* Total */}
      <div className="mt-4 text-sm text-gray-500">
        Showing {filteredZones.length} of {zones.length} zones
      </div>

    </div>
  );
}