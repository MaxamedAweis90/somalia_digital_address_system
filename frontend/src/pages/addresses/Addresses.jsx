import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAddresses, deleteAddress } from "@/api/addressApi";
import { Loader2 } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function Addresses() {
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAddresses(
        searchTerm.trim() ? { search: searchTerm.trim() } : undefined
      );
      setAddresses(res.data.data || []);
    } catch (err) {
      console.error("Failed to load addresses:", err);
      setError(err.response?.data?.message || "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAddresses();
  };

  const handleDelete = (item) => {
    setDeleteTarget(item);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      setError(null);
      await deleteAddress(deleteTarget.id);
      setAddresses((current) => current.filter((address) => address.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete address");
    } finally {
      setDeleting(false);
    }
  };

  const filteredAddresses = useMemo(() => {
    return addresses.filter((item) => {
      const status = (item.status || "ACTIVE").toUpperCase();
      return (
        statusFilter === "All" ||
        (statusFilter === "Active" && status === "ACTIVE") ||
        (statusFilter === "Inactive" && status === "INACTIVE")
      );
    });
  }, [addresses, statusFilter]);

  return (
    <div className="min-h-screen bg-bg font-sans">
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Address"
        message={`Are you sure you want to delete "${deleteTarget?.addressCode || "this address"}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        loadingLabel="Deleting..."
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
      />

      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10">
        <div className="flex items-center gap-2 text-[11px] font-medium text-ink-soft mb-6">
          <span
            onClick={() => navigate("../dashboard")}
            className="hover:text-blue cursor-pointer"
          >
            Dashboard
          </span>
          <span className="text-gray-400">›</span>
          <span className="text-ink font-semibold">Addresses</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-[25px] font-semibold tracking-tight text-ink">
              Address Registry
            </h1>
            <p className="mt-1 text-[13px] text-ink-soft">
              Manage digital addresses using the official DAC format
              (e.g. HOD-TLX-Z01-0001).
            </p>
          </div>

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
            + Register Address
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 text-red-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchAddresses}
              className="text-xs font-semibold underline hover:text-red-900 ml-4 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        <div className="w-full bg-white border border-line rounded-xl shadow-card-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-line">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-[16px] font-semibold text-ink">All Addresses</h2>
                <p className="mt-1 text-[12px] text-ink-soft">
                  Total {addresses.length} registered addresses
                </p>
              </div>

              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft text-sm">
                    🔍
                  </span>
                  <input
                    type="text"
                    placeholder="Search DAC, street, district..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="
                      h-[38px]
                      w-full
                      sm:w-[260px]
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

                <button
                  type="submit"
                  className="
                    h-[38px]
                    px-4
                    rounded-lg
                    bg-blue-deep
                    text-[12px]
                    font-semibold
                    text-white
                    hover:bg-[#0F2B4D]
                    cursor-pointer
                  "
                >
                  Search
                </button>
              </form>
            </div>
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
                    Zone
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Zone Block
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Street
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Status
                  </th>
                  <th className="px-5 py-4 text-right text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-deep" />
                        <p className="text-[12px] text-ink-soft">Loading addresses...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredAddresses.length > 0 ? (
                  filteredAddresses.map((item) => {
                    const isActive = (item.status || "ACTIVE").toUpperCase() === "ACTIVE";

                    return (
                      <tr
                        key={item.id}
                        className="border-b border-line last:border-b-0 hover:bg-[#FBFCFE] transition-colors"
                      >
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center rounded-md bg-bg px-2.5 py-1 text-[11px] font-semibold text-blue-deep">
                            {item.addressCode}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[12px] text-ink">
                          {item.district?.name || "—"}
                        </td>
                        <td className="px-5 py-4 text-[12px] text-ink">
                          {item.zone?.name || "—"}
                        </td>
                        <td className="px-5 py-4 text-[12px] text-ink">
                          {item.zoneBlock?.name || "—"}
                        </td>
                        <td className="px-5 py-4 text-[12px] text-ink">
                          {item.streetName}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`
                              inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold
                              ${
                                isActive
                                  ? "bg-green-50 text-green-600 border border-green-100"
                                  : "bg-gray-100 text-gray-500 border border-gray-200"
                              }
                            `}
                          >
                            <span
                              className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                                isActive ? "bg-green-500" : "bg-gray-400"
                              }`}
                            />
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`view/${item.id}`)}
                              className="h-[32px] rounded-md border border-line bg-white px-3 text-[11px] font-semibold text-ink hover:bg-bg cursor-pointer"
                            >
                              View
                            </button>
                            <button
                              onClick={() => navigate(`edit/${item.id}`)}
                              className="h-[32px] rounded-md bg-blue-deep px-3 text-[11px] font-semibold text-white hover:bg-[#0F2B4D] cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="h-[32px] rounded-md border border-red-200 bg-white px-3 text-[11px] font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center">
                      <p className="text-[13px] font-medium text-ink">No addresses found</p>
                      <p className="mt-1 text-[12px] text-ink-soft">
                        Register a new address or adjust your search.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-line px-5 py-4">
            <p className="text-[11px] text-ink-soft">
              Showing {filteredAddresses.length} of {addresses.length} addresses
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
