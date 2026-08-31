import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Plus, Search, Users } from "lucide-react";
import { getDataCollectors } from "@/api/dataCollectorApi";
import DataCollectorTable from "./components/DataCollectorTable";
import RegeneratePasswordModal from "./components/RegeneratePasswordModal";
import DeleteCollectorDialog from "./components/DeleteCollectorDialog";

export default function DataCollectorsPage() {
  const navigate = useNavigate();

  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [regenerateTarget, setRegenerateTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchCollectors = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDataCollectors();

      // Support different possible backend response shapes
      const dataList =
        res.data?.data?.collectors ||
        res.data?.collectors ||
        res.data?.data ||
        (Array.isArray(res.data) ? res.data : []);

      setCollectors(dataList);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load data collectors. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollectors();
  }, []);

  const filteredCollectors = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return collectors;

    return collectors.filter((collector) => {
      const name = collector.name?.toLowerCase() || "";
      const email = collector.email?.toLowerCase() || "";
      const supervisorName =
        collector.supervisor?.name?.toLowerCase() ||
        collector.supervisorName?.toLowerCase() ||
        "";
      const supervisorEmail =
        collector.supervisor?.email?.toLowerCase() ||
        collector.supervisorEmail?.toLowerCase() ||
        "";
      return (
        name.includes(query) ||
        email.includes(query) ||
        supervisorName.includes(query) ||
        supervisorEmail.includes(query)
      );
    });
  }, [collectors, searchTerm]);

  const handleDeleted = (deletedId) => {
    setCollectors((prev) => prev.filter((c) => c.id !== deletedId));
  };

  return (
    <div className="min-h-screen bg-bg font-sans">
      {regenerateTarget && (
        <RegeneratePasswordModal
          collector={regenerateTarget}
          onClose={() => setRegenerateTarget(null)}
        />
      )}

      <DeleteCollectorDialog
        open={Boolean(deleteTarget)}
        collector={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={handleDeleted}
      />

      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10">
        <div className="flex items-center gap-2 text-[11px] font-medium text-ink-soft mb-6">
          <span
            onClick={() => navigate("/admin/dashboard")}
            className="hover:text-blue cursor-pointer"
          >
            Dashboard
          </span>
          <span className="text-gray-400">›</span>
          <span className="text-ink font-semibold">Data Collectors</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-[25px] font-semibold tracking-tight text-ink">
              Data Collectors
            </h1>
            <p className="mt-1 text-[13px] text-ink-soft">
              Manage field data collectors and their supervising data officers.
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/data-collectors/create")}
            className="h-[39px] px-4 rounded-lg bg-blue-deep text-[12px] font-semibold text-white shadow-cta transition-all hover:bg-[#0F2B4D] active:scale-[0.98] self-start sm:self-auto cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            + Add Data Collector
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 text-red-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchCollectors}
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
                  All Data Collectors
                </h2>
                <p className="mt-1 text-[12px] text-ink-soft">
                  Total {collectors.length} registered field data collectors
                </p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by name, email, supervisor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-[38px] w-full sm:w-[280px] rounded-lg border border-line bg-white pl-9 pr-3 text-[12px] text-ink outline-none placeholder:text-gray-400 focus:border-blue focus:ring-2 focus:ring-blue/10"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="px-5 py-16 text-center">
              <div className="flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-blue-deep" />
                <p className="text-[12px] text-ink-soft">
                  Loading data collectors...
                </p>
              </div>
            </div>
          ) : filteredCollectors.length > 0 ? (
            <DataCollectorTable
              collectors={filteredCollectors}
              onRegeneratePassword={(collector) => setRegenerateTarget(collector)}
              onDelete={(collector) => setDeleteTarget(collector)}
            />
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
                    : "There are currently no data collectors registered. Create a data collector and assign them to a supervising data officer."}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => navigate("/admin/data-collectors/create")}
                    className="mt-4 h-[36px] px-4 rounded-lg bg-blue-deep text-[12px] font-semibold text-white transition-all hover:bg-[#0F2B4D] cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    + Add Data Collector
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-line px-5 py-4">
            <p className="text-[11px] text-ink-soft">
              Showing {filteredCollectors.length} of {collectors.length} data collectors
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
