import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import {
  deleteDataCollector,
  getDataCollectors,
  regenerateDataCollectorPassword,
} from "@/api/dataCollectorApi";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

function RegenerateCollectorPasswordModal({ collector, onClose }) {
  const [step, setStep] = useState("confirm");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [temporaryPassword, setTemporaryPassword] = useState("");

  if (!collector) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await regenerateDataCollectorPassword(collector.id);
      setTemporaryPassword(res.data.data.temporaryPassword);
      setStep("success");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to regenerate password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white border border-line shadow-xl">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-[16px] font-semibold text-ink">
            {step === "confirm" ? "Regenerate Password" : "New Password Generated"}
          </h2>
        </div>
        <div className="px-5 py-5">
          {step === "confirm" ? (
            <p className="text-[13px] text-ink">
              Regenerate password for <strong>{collector.name}</strong>?
            </p>
          ) : (
            <div className="rounded-lg border border-line bg-bg px-3 py-3 font-mono text-[14px]">
              {temporaryPassword}
            </div>
          )}
          {error && <p className="mt-3 text-[12px] text-red-600">{error}</p>}
        </div>
        <div className="flex justify-end gap-3 border-t border-line px-5 py-4 bg-[#FBFBFC]">
          {step === "confirm" ? (
            <>
              <button type="button" onClick={onClose} className="h-[36px] px-4 rounded-lg border border-line text-[12px] font-semibold">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className="h-[36px] px-5 rounded-lg bg-amber-600 text-[12px] font-semibold text-white disabled:opacity-50"
              >
                {loading ? "Regenerating..." : "Regenerate"}
              </button>
            </>
          ) : (
            <button type="button" onClick={onClose} className="h-[36px] px-5 rounded-lg bg-blue-deep text-[12px] font-semibold text-white">
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DataCollectors() {
  const navigate = useNavigate();
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [regenerateTarget, setRegenerateTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchCollectors = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDataCollectors();
      setCollectors(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data collectors.");
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
      const officer = collector.supervisor?.name?.toLowerCase() || "";
      return name.includes(query) || email.includes(query) || officer.includes(query);
    });
  }, [collectors, searchTerm]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeletingId(deleteTarget.id);
      await deleteDataCollector(deleteTarget.id);
      setCollectors((current) => current.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete data collector.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-bg font-sans">
      {regenerateTarget && (
        <RegenerateCollectorPasswordModal
          collector={regenerateTarget}
          onClose={() => setRegenerateTarget(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Data Collector"
        message={`Delete data collector "${deleteTarget?.name}"? This action cannot be undone.`}
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
          <span onClick={() => navigate("../dashboard")} className="hover:text-blue cursor-pointer">
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
              Create field collectors and assign them to supervising data officers.
            </p>
          </div>

          <button
            onClick={() => navigate("add")}
            className="h-[39px] px-5 rounded-lg bg-blue-deep text-[12px] font-semibold text-white shadow-cta hover:bg-[#0F2B4D] self-start sm:self-auto cursor-pointer"
          >
            + Add Data Collector
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 text-red-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchCollectors} className="text-xs font-semibold underline ml-4 cursor-pointer">
              Retry
            </button>
          </div>
        )}

        <div className="w-full bg-white border border-line rounded-xl shadow-card-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-line">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-[16px] font-semibold text-ink">All Data Collectors</h2>
                <p className="mt-1 text-[12px] text-ink-soft">
                  Total {collectors.length} registered data collectors
                </p>
              </div>
              <input
                type="text"
                placeholder="Search by name, email, or officer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-[38px] w-full sm:w-[280px] rounded-lg border border-line bg-white px-3 text-[12px] text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-line bg-[#FBFCFE]">
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Name</th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Email</th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Supervisor</th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Created</th>
                  <th className="px-5 py-4 text-right text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-deep" />
                    </td>
                  </tr>
                ) : filteredCollectors.length > 0 ? (
                  filteredCollectors.map((collector) => (
                    <tr key={collector.id} className="border-b border-line last:border-b-0 hover:bg-[#FBFCFE]">
                      <td className="px-5 py-4 text-[13px] font-semibold text-ink">{collector.name}</td>
                      <td className="px-5 py-4 text-[12px] text-ink">{collector.email}</td>
                      <td className="px-5 py-4 text-[12px] text-ink-soft">
                        {collector.supervisor?.name || "—"}
                      </td>
                      <td className="px-5 py-4 text-[12px] text-ink-soft">
                        {collector.createdAt ? new Date(collector.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          <button
                            onClick={() => setRegenerateTarget({ id: collector.id, name: collector.name })}
                            className="h-[32px] rounded-md border border-amber-200 bg-amber-50 px-3 text-[11px] font-semibold text-amber-800 cursor-pointer"
                          >
                            Regenerate Password
                          </button>
                          <button
                            onClick={() => navigate(`edit/${collector.id}`)}
                            className="h-[32px] rounded-md bg-blue-deep px-3 text-[11px] font-semibold text-white cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(collector)}
                            disabled={deletingId === collector.id}
                            className="h-[32px] rounded-md border border-red-200 bg-white px-3 text-[11px] font-semibold text-red-600 cursor-pointer disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-[13px] text-ink-soft">
                      No data collectors found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
