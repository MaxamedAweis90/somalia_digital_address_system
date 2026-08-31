import { useState } from "react";
import { Loader2, X, Copy, Check } from "lucide-react";
import { toast } from "react-toastify";
import { regenerateDataCollectorPassword } from "@/api/dataCollectorApi";

export default function RegeneratePasswordModal({ collector, onClose }) {
  const [step, setStep] = useState("confirm");
  const [loading, setLoading] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [copied, setCopied] = useState(false);

  if (!collector) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);

      const res = await regenerateDataCollectorPassword(collector.id);
      const tempPass =
        res.data?.data?.temporaryPassword ||
        res.data?.temporaryPassword ||
        "";

      setTemporaryPassword(tempPass);
      setStep("success");
      toast.success("Temporary password generated successfully");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to regenerate password. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(temporaryPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.info("Password copied to clipboard");
    } catch {
      toast.error("Could not copy to clipboard. Please copy manually.");
    }
  };

  const handleCloseModal = () => {
    setTemporaryPassword("");
    setStep("confirm");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md rounded-xl bg-white border border-line shadow-xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="regenerate-password-title"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2
            id="regenerate-password-title"
            className="text-[16px] font-semibold text-ink"
          >
            {step === "confirm" ? "Regenerate Password" : "Password Generated"}
          </h2>
          <button
            type="button"
            onClick={handleCloseModal}
            className="text-ink-soft hover:text-ink cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-5">
          {step === "confirm" ? (
            <>
              <p className="text-[13px] text-ink leading-relaxed">
                Are you sure you want to generate a new password for{" "}
                <span className="font-semibold">{collector.name}</span>?
              </p>
              <p className="mt-3 text-[12px] text-ink-soft leading-relaxed">
                The current password will no longer work. You will need to share
                the new temporary password with them securely.
              </p>
            </>
          ) : (
            <>
              <p className="text-[13px] text-ink-soft">
                The new temporary password for{" "}
                <span className="font-semibold text-ink">{collector.name}</span>{" "}
                is:
              </p>

              <div className="mt-4 flex items-center gap-2 rounded-lg border border-line bg-bg px-3 py-3">
                <code className="flex-1 text-[14px] font-mono font-semibold text-ink tracking-wide break-all select-all">
                  {temporaryPassword}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="shrink-0 inline-flex items-center gap-1 rounded-md border border-line bg-white px-2.5 py-1.5 text-[11px] font-semibold text-ink-soft hover:bg-slate-50 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy Password
                    </>
                  )}
                </button>
              </div>

              <p className="mt-3 text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                Keep this password secure. It will only be shown here.
              </p>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-line px-5 py-4 bg-[#FBFBFC]">
          {step === "confirm" ? (
            <>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={loading}
                className="h-[36px] px-4 rounded-lg border border-line bg-white text-[12px] font-semibold text-ink-soft hover:bg-bg cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className="h-[36px] px-5 rounded-lg bg-amber-600 text-[12px] font-semibold text-white hover:bg-amber-700 cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Regenerating..." : "Regenerate Password"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleCloseModal}
              className="h-[36px] px-5 rounded-lg bg-blue-deep text-[12px] font-semibold text-white hover:bg-[#0F2B4D] cursor-pointer"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
