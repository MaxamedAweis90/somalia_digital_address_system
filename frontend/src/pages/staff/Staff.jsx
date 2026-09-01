import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Plus, Search, Users } from "lucide-react";
import {
  deleteDataOfficer,
  getDataOfficers,
} from "@/api/dataOfficerApi";
import { getDataCollectors } from "@/api/dataCollectorApi";
import RegenerateOfficerPasswordModal from "@/components/data-officers/RegeneratePasswordModal";
import DataCollectorTable from "@/pages/data-collectors/components/DataCollectorTable";
import RegenerateCollectorPasswordModal from "@/pages/data-collectors/components/RegeneratePasswordModal";
import DeleteCollectorDialog from "@/pages/data-collectors/components/DeleteCollectorDialog";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageHeader from "@/components/ui/PageHeader";
import Pagination from "@/components/common/Pagination";

const ROLES = {
  officer: "officer",
  collector: "collector",
};

const ROLE_TABS = [
  { id: ROLES.officer, label: "Data Officers" },
  { id: ROLES.collector, label: "Data Collectors" },
];

function parseRole(value) {
  return value === ROLES.collector ? ROLES.collector : ROLES.officer;
}

export default function Staff() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const role = parseRole(searchParams.get("role"));
  const isOfficer = role === ROLES.officer;

  const [items, setItems] = useState([]);
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

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 450);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    setSearchTerm("");
    setDebouncedSearch("");
    setPage(1);
    setError(null);
    setDeleteTarget(null);
    setRegenerateTarget(null);
  }, [role]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = isOfficer
        ? await getDataOfficers({
            page,
            limit,
            search: debouncedSearch || undefined,
          })
        : await getDataCollectors({
            page,
            limit,
            search: debouncedSearch || undefined,
          });

      const responseData = res.data?.data;

      if (responseData?.data && responseData?.pagination) {
        setItems(responseData.data);
        setPagination(responseData.pagination);
      } else if (Array.isArray(responseData)) {
        setItems(responseData);
        setPagination({
          total: responseData.length,
          page: 1,
          limit: responseData.length || 10,
          totalPages: 1,
        });
      } else {
        setItems([]);
        setPagination({ total: 0, page: 1, limit: 10, totalPages: 1 });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Failed to load ${isOfficer ? "data officers" : "data collectors"}. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [role, page, debouncedSearch]);

  const setRole = (nextRole) => {
    setSearchParams(nextRole === ROLES.collector ? { role: ROLES.collector } : {});
  };

  const confirmDeleteOfficer = async () => {
    if (!deleteTarget) return;

    try {
      setDeletingId(deleteTarget.id);
      setError(null);
      await deleteDataOfficer(deleteTarget.id);
      setDeleteTarget(null);
      await fetchStaff();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete data officer. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const addPath = isOfficer
    ? "/admin/data-officers/add"
    : "/admin/data-collectors/create";
  const roleLabel = isOfficer ? "Data Officer" : "Data Collector";
  const roleLabelPlural = isOfficer ? "Data Officers" : "Data Collectors";

  return (
    <div className="min-h-full bg-bg font-sans">
      {regenerateTarget && isOfficer && (
        <RegenerateOfficerPasswordModal
          officer={regenerateTarget}
          onClose={() => setRegenerateTarget(null)}
        />
      )}

      {regenerateTarget && !isOfficer && (
        <RegenerateCollectorPasswordModal
          collector={regenerateTarget}
          onClose={() => setRegenerateTarget(null)}
        />
      )}

      {isOfficer ? (
        <ConfirmDialog
          open={Boolean(deleteTarget)}
          title="Delete Data Officer"
          message={`Delete data officer "${deleteTarget?.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          loading={Boolean(deletingId)}
          loadingLabel="Deleting..."
          onConfirm={confirmDeleteOfficer}
          onCancel={() => {
            if (!deletingId) setDeleteTarget(null);
          }}
        />
      ) : (
        <DeleteCollectorDialog
          open={Boolean(deleteTarget)}
          collector={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => fetchStaff()}
        />
      )}

      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10">
        <Breadcrumb
          items={[
            { label: "Dashboard", to: "/admin/dashboard" },
            { label: "Staff" },
          ]}
        />

        <PageHeader
          title="Staff"
          description="Manage data officer and data collector accounts for the registry portal."
          actions={
            <button
              type="button"
              onClick={() => navigate(addPath)}
              className="h-[39px] px-4 rounded-lg bg-blue-deep text-[12px] font-semibold text-white shadow-cta transition-all hover:bg-[#0F2B4D] active:scale-[0.98] cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add {roleLabel}
            </button>
          }
        />

        <div className="mb-6 flex flex-wrap gap-2">
          {ROLE_TABS.map((tab) => {
            const active = tab.id === role;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRole(tab.id)}
                className={`h-[34px] rounded-lg px-3.5 text-[12px] font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-blue-deep text-white shadow-cta"
                    : "border border-line bg-white text-ink-soft hover:bg-bg hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 text-red-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={fetchStaff}
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
                <h2 className="text-[16px] font-semibold text-ink">{roleLabelPlural}</h2>
                <p className="mt-1 text-[12px] text-ink-soft">
                  Total {pagination.total} registered {roleLabelPlural.toLowerCase()}
                </p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft h-4 w-4" />
                <input
                  type="text"
                  placeholder={
                    isOfficer
                      ? "Search by name or email..."
                      : "Search by name, email, supervisor..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-[38px] w-full sm:w-[280px] rounded-lg border border-line bg-white pl-9 pr-3 text-[12px] text-ink outline-none placeholder:text-gray-400 focus:border-blue focus:ring-2 focus:ring-blue/10"
                />
              </div>
            </div>
          </div>

          {isOfficer ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse">
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
                            <p className="text-[12px] text-ink-soft">Loading staff...</p>
                          </div>
                        </td>
                      </tr>
                    ) : items.length > 0 ? (
                      items.map((officer) => (
                        <tr
                          key={officer.id}
                          className="border-b border-line last:border-b-0 hover:bg-[#FBFCFE] transition-colors"
                        >
                          <td className="px-5 py-4">
                            <p className="text-[13px] font-semibold text-ink">{officer.name}</p>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-[12px] text-ink">{officer.email}</span>
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
                                type="button"
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
                                type="button"
                                onClick={() =>
                                  navigate(`/admin/data-officers/edit/${officer.id}`)
                                }
                                className="h-[32px] rounded-md bg-blue-deep px-3 text-[11px] font-semibold text-white transition-all hover:bg-[#0F2B4D] cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(officer)}
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
                  Showing{" "}
                  {items.length > 0
                    ? (pagination.page - 1) * pagination.limit + 1
                    : 0}
                  -{Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                  {pagination.total} data officers
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
            </>
          ) : loading ? (
            <div className="px-5 py-16 text-center">
              <div className="flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-blue-deep" />
                <p className="text-[12px] text-ink-soft">Loading staff...</p>
              </div>
            </div>
          ) : items.length > 0 ? (
            <>
              <DataCollectorTable
                collectors={items}
                onRegeneratePassword={(collector) => setRegenerateTarget(collector)}
                onDelete={(collector) => setDeleteTarget(collector)}
              />
              {pagination.totalPages > 1 && (
                <div className="px-5 py-4 border-t border-line">
                  <Pagination
                    page={pagination.page}
                    totalPages={pagination.totalPages}
                    total={pagination.total}
                    pageSize={limit}
                    onPageChange={setPage}
                    disabled={loading}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="px-5 py-16 text-center">
              <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-ink-soft mb-3">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-[15px] font-semibold text-ink">
                  {searchTerm ? "No matching data collectors" : "No Data Collectors"}
                </h3>
                <p className="mt-1 text-[12px] text-ink-soft leading-relaxed">
                  {searchTerm
                    ? "Try adjusting your search terms or filter."
                    : "Create a data collector and assign them to a supervising data officer."}
                </p>
                {!searchTerm && (
                  <button
                    type="button"
                    onClick={() => navigate(addPath)}
                    className="mt-4 h-[36px] px-4 rounded-lg bg-blue-deep text-[12px] font-semibold text-white transition-all hover:bg-[#0F2B4D] cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    Add Data Collector
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
