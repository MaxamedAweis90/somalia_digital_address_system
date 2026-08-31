import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import {
  deleteDataOfficer,
  getDataOfficers,
} from "@/api/dataOfficerApi";
import RegeneratePasswordModal from "@/components/data-officers/RegeneratePasswordModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Pagination from "@/components/common/Pagination";

export default function DataOfficers() {
  const navigate = useNavigate();

  const [officers, setOfficers] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [regenerateTarget, setRegenerateTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const limit = 10;

  // Handle search debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to first page on search change
    }, 450);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchOfficers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDataOfficers({
        page,
        limit,
        search: debouncedSearch || undefined,
      });

      const responseData = res.data?.data;

      if (responseData?.data && responseData?.pagination) {
        setOfficers(responseData.data);
        setPagination(responseData.pagination);
      } else if (Array.isArray(responseData)) {
        setOfficers(responseData);
      } else {
        setOfficers([]);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to load data officers. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficers();
  }, [page, debouncedSearch]);

  const handleDelete = (officer) => {
    setDeleteTarget(officer);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeletingId(deleteTarget.id);
      setError(null);
      await deleteDataOfficer(deleteTarget.id);
      setDeleteTarget(null);
      // Refetch to update pagination
      fetchOfficers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to delete data officer. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-bg font-sans">
      {regenerateTarget && (
        <RegeneratePasswordModal
          officer={regenerateTarget}
          onClose={() => setRegenerateTarget(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Data Officer"
        message={`Delete data officer "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={Boolean(deletingId)}
        loadingLabel="Deleting..."
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!deletingId) setDeleteTarget(null);
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
          <span className="text-ink font-semibold">Data Officers</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-[25px] font-semibold tracking-tight text-ink">
              Data Officers
            </h1>
            <p className="mt-1 text-[13px] text-ink-soft">
              Create and manage data officer accounts for the registry portal.
            </p>
          </div>

          <button
            onClick={() => navigate("add")}
            className="h-[39px] px-5 rounded-lg bg-blue-deep text-[12px] font-semibold text-white shadow-cta transition-all hover:bg-[#0F2B4D] active:scale-[0.98] self-start sm:self-auto cursor-pointer"
          >
            + Add Data Officer
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 text-red-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchOfficers}
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
                <h2 className="text-[16px] font-semibold text-ink">
                  All Data Officers
                </h2>
                <p className="mt-1 text-[12px] text-ink-soft">
                  Total {pagination.total} registered data officers
                </p>
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft text-sm">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-[38px] w-full sm:w-[260px] rounded-lg border border-line bg-white pl-9 pr-3 text-[12px] text-ink outline-none placeholder:text-gray-400 focus:border-blue focus:ring-2 focus:ring-blue/10"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-line bg-[#FBFCFE]">
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Name
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Email
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Role
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Created
                  </th>
                  <th className="px-5 py-4 text-right text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-deep" />
                        <p className="text-[12px] text-ink-soft">
                          Loading data officers...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : officers.length > 0 ? (
                  officers.map((officer) => (
                    <tr
                      key={officer.id}
                      className="border-b border-line last:border-b-0 hover:bg-[#FBFCFE] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <p className="text-[13px] font-semibold text-ink">
                          {officer.name}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[12px] text-ink">
                          {officer.email}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-[10px] font-semibold text-green-700 border border-green-100">
                          DATA_OFFICER
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[12px] text-ink-soft">
                          {officer.createdAt
                            ? new Date(officer.createdAt).toLocaleDateString()
                            : "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          <button
                            onClick={() =>
                              setRegenerateTarget({
                                id: officer.id,
                                name: officer.name,
                              })
                            }
                            className="h-[32px] rounded-md border border-amber-200 bg-amber-50 px-3 text-[11px] font-semibold text-amber-800 transition-all hover:bg-amber-100 cursor-pointer"
                          >
                            Regenerate Password
                          </button>
                          <button
                            onClick={() => navigate(`edit/${officer.id}`)}
                            className="h-[32px] rounded-md bg-blue-deep px-3 text-[11px] font-semibold text-white transition-all hover:bg-[#0F2B4D] cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(officer)}
                            disabled={deletingId === officer.id}
                            className="h-[32px] rounded-md border border-red-200 bg-white px-3 text-[11px] font-semibold text-red-600 transition-all hover:bg-red-50 cursor-pointer disabled:opacity-50"
                          >
                            {deletingId === officer.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <p className="text-[13px] font-medium text-ink">
                        No data officers found
                      </p>
                      <p className="mt-1 text-[12px] text-ink-soft">
                        {searchTerm
                          ? "Try a different search term."
                          : "Add your first data officer to get started."}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-4 border-t border-line">
            <p className="text-[11px] text-ink-soft mb-4">
              Showing {officers.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} data officers
            </p>

            {pagination.totalPages > 1 && (
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                pageSize={pagination.limit}
                onPageChange={setPage}
                disabled={loading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
