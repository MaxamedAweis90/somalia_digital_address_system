import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import { deleteDataCollector } from "@/api/dataCollectorApi";

export default function DeleteCollectorDialog({
  collector,
  open,
  onClose,
  onDeleted,
}) {
  const [loading, setLoading] = useState(false);

  if (!open || !collector) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteDataCollector(collector.id);
      toast.success(`Data collector "${collector.name}" deleted successfully.`);
      onDeleted(collector.id);
      onClose();
    } catch (err) {
      const serverMessage = err.response?.data?.message || "";
      if (
        serverMessage.toLowerCase().includes("active assignment") ||
        serverMessage.toLowerCase().includes("active")
      ) {
        toast.error(
          "Unable to delete collector. This collector has active assignments. Complete or close those assignments before deleting the account."
        );
      } else {
        toast.error(
          serverMessage || "Failed to delete data collector. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md rounded-xl bg-white border border-line shadow-xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        <div className="flex items-center gap-3 border-b border-line px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-600 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2
              id="delete-dialog-title"
              className="text-[16px] font-semibold text-ink"
            >
              Delete Data Collector
            </h2>
          </div>
        </div>

        <div className="px-5 py-5">
          <p className="text-[13px] text-ink leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{collector.name}</span>?
          </p>
          <p className="mt-3 text-[12px] text-ink-soft leading-relaxed">
            This action cannot be completed if the collector has active assignments.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-line px-5 py-4 bg-[#FBFBFC]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-[36px] px-4 rounded-lg border border-line bg-white text-[12px] font-semibold text-ink-soft hover:bg-bg cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="h-[36px] px-5 rounded-lg bg-red-600 text-[12px] font-semibold text-white hover:bg-red-700 cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Deleting..." : "Delete Collector"}
          </button>
        </div>
      </div>
    </div>
  );
}
