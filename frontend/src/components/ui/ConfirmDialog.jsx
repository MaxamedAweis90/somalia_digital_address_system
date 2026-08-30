import { createPortal } from "react-dom";
import { Loader2, X } from "lucide-react";

const confirmButtonStyles = {
  default: "bg-blue-deep hover:bg-[#0F2B4D]",
  danger: "bg-red-600 hover:bg-red-700",
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  loadingLabel = "Processing...",
  variant = "default",
  error = null,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md rounded-xl bg-white border border-line shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="confirm-dialog-title" className="text-[16px] font-semibold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="text-ink-soft hover:text-ink cursor-pointer disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-3">
          <p className="text-[13px] text-ink leading-relaxed">{message}</p>
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-[12px] text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-line px-5 py-4 bg-[#FBFBFC]">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="h-[36px] px-4 rounded-lg border border-line bg-white text-[12px] font-semibold text-ink-soft hover:bg-bg cursor-pointer disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`h-[36px] px-5 rounded-lg text-[12px] font-semibold text-white cursor-pointer disabled:opacity-50 inline-flex items-center gap-2 ${confirmButtonStyles[variant] || confirmButtonStyles.default}`}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
