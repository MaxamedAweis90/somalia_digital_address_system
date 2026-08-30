import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNeighborhoods, deleteNeighborhood } from "@/api/neighborhoodApi";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/constants/roles";
import { Loader2 } from "lucide-react";

export default function Neighborhoods() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.SYS_ADMIN;

  const [neighborhoods, setNeighborhoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchNeighborhoods = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getNeighborhoods();
      setNeighborhoods(res.data.data || []);
    } catch (err) {
      console.error("Failed to load neighborhoods:", err);
      setError(err.response?.data?.message || "Failed to load neighborhoods from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNeighborhoods();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this neighborhood?"
    );
    if (!confirmDelete) return;

    try {
      await deleteNeighborhood(id);
      setNeighborhoods((current) => current.filter((n) => n.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete neighborhood");
    }
  };

  // Search and filter
  const filteredNeighborhoods = useMemo(() => {
    return neighborhoods.filter((item) => {
      const name = item.name || "";
      const code = item.code || "";
      const districtName = item.district?.name || "";

      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        districtName.toLowerCase().includes(searchTerm.toLowerCase());

      const status = (item.status || "ACTIVE").toUpperCase();
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && status === "ACTIVE") ||
        (statusFilter === "Inactive" && status === "INACTIVE");

      return matchesSearch && matchesStatus;
    });
  }, [neighborhoods, searchTerm, statusFilter]);

  return (
    <div className="min-h-screen bg-bg font-sans">
      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10">
        {/* =========================
            BREADCRUMB
        ========================= */}
        <div className="flex items-center gap-2 text-[11px] font-medium text-ink-soft mb-6">
          <span
            onClick={() => navigate("../dashboard")}
            className="hover:text-blue cursor-pointer"
          >
            Dashboard
          </span>

          <span className="text-gray-400">›</span>

          <span className="text-ink font-semibold">
            Neighborhoods
          </span>
        </div>

        {/* =========================
            PAGE HEADER
        ========================= */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-[25px] font-semibold tracking-tight text-ink">
              Neighborhoods
            </h1>
            <p className="mt-1 text-[13px] text-ink-soft">
              Manage and view all municipal neighborhoods and residential areas.
            </p>
          </div>

          {/* ADD NEIGHBORHOOD - ONLY SHOWN TO SYS_ADMIN */}
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
              + Add Neighborhood
            </button>
          )}
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 text-red-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchNeighborhoods}
              className="text-xs font-semibold underline hover:text-red-900 ml-4 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* =========================
            MAIN CARD
        ========================= */}
        <div className="w-full bg-white border border-line rounded-xl shadow-card-sm overflow-hidden">
          {/* =========================
              CARD HEADER / FILTERS
          ========================= */}
          <div className="px-5 py-4 border-b border-line">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-[16px] font-semibold text-ink">
                  All Neighborhoods
                </h2>
                <p className="mt-1 text-[12px] text-ink-soft">
                  Total {neighborhoods.length} neighborhoods in the registry
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
                    placeholder="Search neighborhood or code..."
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

          {/* =========================
              TABLE
          ========================= */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-line bg-[#FBFCFE]">
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Neighborhood
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Parent District
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Code
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
                {loading ? (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-deep" />
                        <p className="text-[12px] text-ink-soft">Loading neighborhoods from server...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredNeighborhoods.length > 0 ? (
                  filteredNeighborhoods.map((item) => {
                    const isActive = (item.status || "ACTIVE").toUpperCase() === "ACTIVE";
                    const formattedDate = item.updatedAt
                      ? new Date(item.updatedAt).toLocaleDateString()
                      : "—";

                    return (
                      <tr
                        key={item.id}
                        className="border-b border-line last:border-b-0 hover:bg-[#FBFCFE] transition-colors"
                      >
                        {/* NAME */}
                        <td className="px-5 py-4">
                          <p className="text-[13px] font-semibold text-ink">
                            {item.name}
                          </p>
                        </td>

                        {/* DISTRICT */}
                        <td className="px-5 py-4">
                          <span className="text-[12px] text-ink">
                            {item.district?.name || "—"}
                          </span>
                        </td>

                        {/* CODE */}
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center rounded-md bg-bg px-2.5 py-1 text-[11px] font-semibold text-blue-deep">
                            {item.code}
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
                                isActive
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
                                  isActive
                                    ? "bg-green-500"
                                    : "bg-gray-400"
                                }
                              `}
                            />
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* LAST UPDATED */}
                        <td className="px-5 py-4">
                          <span className="text-[12px] text-ink-soft">
                            {formattedDate}
                          </span>
                        </td>

                        {/* ACTIONS - ONLY SHOWN TO SYS_ADMIN */}
                        {isAdmin && (
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                              {/* EDIT */}
                              <button
                                onClick={() =>
                                  navigate(`edit/${item.id}`)
                                }
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

                              {/* DELETE */}
                              <button
                                onClick={() => handleDelete(item.id)}
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
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={isAdmin ? 6 : 5}
                      className="px-5 py-12 text-center"
                    >
                      <p className="text-[13px] font-medium text-ink">
                        No neighborhoods found
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
              Showing {filteredNeighborhoods.length} of {neighborhoods.length} neighborhoods
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
