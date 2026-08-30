import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/constants/roles";

const initialZones = [
  {
    id: 1,
    name: "Zone 01",
    district: "Hodan",
    neighborhood: "Taleex",
    code: "Z01",
    status: "Active",
    updated: "Today, 10:15 AM",
  },
  {
    id: 2,
    name: "Zone 02",
    district: "Wadajir",
    neighborhood: "Halane",
    code: "Z02",
    status: "Active",
    updated: "Yesterday",
  },
  {
    id: 3,
    name: "Zone 03",
    district: "Karaan",
    neighborhood: "Jamhuuriya",
    code: "Z03",
    status: "Inactive",
    updated: "Aug 15, 2026",
  },
];

export default function Zones() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.SYS_ADMIN;

  const [zones, setZones] = useState(initialZones);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredZones = useMemo(() => {
    return zones.filter((zone) => {
      const matchesSearch =
        zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        zone.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        zone.code.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || zone.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [zones, searchTerm, statusFilter]);

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this zone?"
    );
    if (!confirmDelete) return;

    setZones((current) => current.filter((zone) => zone.id !== id));
  };

  return (
    <div className="min-h-screen bg-bg font-sans">
      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-[11px] font-medium text-ink-soft mb-6">
          <span
            onClick={() => navigate("../dashboard")}
            className="hover:text-blue cursor-pointer"
          >
            Dashboard
          </span>
          <span className="text-gray-400">›</span>
          <span className="text-ink font-semibold">Zones</span>
        </div>

        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-[25px] font-semibold tracking-tight text-ink">
              Zones
            </h1>
            <p className="mt-1 text-[13px] text-ink-soft">
              Manage cadastral zones and geographic sectors within neighborhoods.
            </p>
          </div>

          {/* ADD ZONE - ONLY SHOWN TO SYS_ADMIN */}
          {isAdmin && (
            <button
              onClick={() => navigate("add")}
              className="
                h-[39px]
                px-5
                rounded-lg
                bg-blue-deep
                text-[12px]
                font-semibold
                text-white
                shadow-cta
                transition-all
                hover:bg-[#0F2B4D]
                active:scale-[0.98]
                self-start
                sm:self-auto
                cursor-pointer
              "
            >
              + Add Zone
            </button>
          )}
        </div>

        {/* MAIN CARD */}
        <div className="w-full bg-white border border-line rounded-xl shadow-card-sm overflow-hidden">
          {/* CARD HEADER / FILTERS */}
          <div className="px-5 py-4 border-b border-line">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-[16px] font-semibold text-ink">
                  All Zones
                </h2>
                <p className="mt-1 text-[12px] text-ink-soft">
                  Total {zones.length} zones in the registry
                </p>
              </div>

              {/* FILTERS */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* SEARCH */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft text-sm">
                    🔍
                  </span>
                  <input
                    type="text"
                    placeholder="Search zone, district, code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="
                      h-[38px]
                      w-full
                      sm:w-[220px]
                      rounded-lg
                      border
                      border-line
                      bg-white
                      pl-9
                      pr-3
                      text-[12px]
                      text-ink
                      outline-none
                      placeholder:text-gray-400
                      focus:border-blue
                      focus:ring-2
                      focus:ring-blue/10
                    "
                  />
                </div>

                {/* STATUS FILTER */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="
                    h-[38px]
                    rounded-lg
                    border
                    border-line
                    bg-white
                    px-3
                    text-[12px]
                    font-medium
                    text-ink
                    outline-none
                    cursor-pointer
                    focus:border-blue
                    focus:ring-2
                    focus:ring-blue/10
                  "
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-line bg-[#FBFCFE]">
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Zone Name
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    District
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Zone Code
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Status
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Last Updated
                  </th>
                  {isAdmin && (
                    <th className="px-5 py-4 text-right text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>
                {filteredZones.length > 0 ? (
                  filteredZones.map((zone) => (
                    <tr
                      key={zone.id}
                      className="border-b border-line last:border-b-0 hover:bg-[#FBFCFE] transition-colors"
                    >
                      {/* ZONE NAME */}
                      <td className="px-5 py-4">
                        <p className="text-[13px] font-semibold text-ink">
                          {zone.name}
                        </p>
                      </td>

                      {/* DISTRICT */}
                      <td className="px-5 py-4">
                        <span className="text-[12px] text-ink">
                          {zone.district}
                        </span>
                      </td>

                      {/* CODE */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center rounded-md bg-bg px-2.5 py-1 text-[11px] font-semibold text-blue-deep">
                          {zone.code}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="px-5 py-4">
                        <span
                          className={`
                            inline-flex
                            items-center
                            rounded-full
                            px-3
                            py-1
                            text-[10px]
                            font-semibold
                            ${
                              zone.status === "Active"
                                ? "bg-green-50 text-green-600 border border-green-100"
                                : "bg-gray-100 text-gray-500 border border-gray-200"
                            }
                          `}
                        >
                          <span
                            className={`
                              mr-1.5
                              h-1.5
                              w-1.5
                              rounded-full
                              ${
                                zone.status === "Active"
                                  ? "bg-green-500"
                                  : "bg-gray-400"
                              }
                            `}
                          />
                          {zone.status}
                        </span>
                      </td>

                      {/* LAST UPDATED */}
                      <td className="px-5 py-4">
                        <span className="text-[12px] text-ink-soft">
                          {zone.updated || "—"}
                        </span>
                      </td>

                      {/* ACTIONS - ONLY FOR SYS_ADMIN */}
                      {isAdmin && (
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`edit/${zone.id}`)}
                              className="
                                h-[32px]
                                rounded-md
                                bg-blue-deep
                                px-3
                                text-[11px]
                                font-semibold
                                text-white
                                transition-all
                                hover:bg-[#0F2B4D]
                                cursor-pointer
                              "
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(zone.id)}
                              className="
                                h-[32px]
                                rounded-md
                                border
                                border-red-200
                                bg-white
                                px-3
                                text-[11px]
                                font-semibold
                                text-red-600
                                transition-all
                                hover:bg-red-50
                                cursor-pointer
                              "
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={isAdmin ? 6 : 5}
                      className="px-5 py-12 text-center"
                    >
                      <p className="text-[13px] font-medium text-ink">
                        No zones found
                      </p>
                      <p className="mt-1 text-[12px] text-ink-soft">
                        Try changing your search or filter.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* CARD FOOTER */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-line px-5 py-4">
            <p className="text-[11px] text-ink-soft">
              Showing {filteredZones.length} of {zones.length} zones
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}