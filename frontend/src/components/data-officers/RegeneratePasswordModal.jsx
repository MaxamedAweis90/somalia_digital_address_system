import { useState } from "react";
import { Loader2, X, Copy, Check } from "lucide-react";
import { regenerateDataOfficerPassword } from "@/api/dataOfficerApi";

export default function RegeneratePasswordModal({ officer, onClose }) {
  const [step, setStep] = useState("confirm");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [copied, setCopied] = useState(false);

  if (!officer) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await regenerateDataOfficerPassword(officer.id);
      setTemporaryPassword(res.data.data.temporaryPassword);
      setStep("success");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to regenerate password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(temporaryPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy to clipboard. Please copy the password manually.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md rounded-xl bg-white border border-line shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="regenerate-password-title"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2
            id="regenerate-password-title"
            className="text-[16px] font-semibold text-ink"
          >
            {step === "confirm" ? "Regenerate Password" : "New Password Generated"}
          </h2>
          <button
            type="button"
            onClick={onClose}
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
                Are you sure you want to regenerate the password for{" "}
                <span className="font-semibold">{officer.name}</span>?
              </p>
              <p className="mt-3 text-[12px] text-ink-soft leading-relaxed">
                Their current password will stop working immediately. You will
                need to share the new temporary password with them securely.
              </p>

              {error && (
                <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-[12px] text-red-700">
                  {error}
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-[13px] text-ink-soft">
                Share this temporary password with{" "}
                <span className="font-semibold text-ink">{officer.name}</span>.
                It will not be shown again.
              </p>

              <div className="mt-4 flex items-center gap-2 rounded-lg border border-line bg-bg px-3 py-3">
                <code className="flex-1 text-[14px] font-mono font-semibold text-ink tracking-wide break-all">
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
                      Copy
                    </>
                  )}
                </button>
              </div>

              <p className="mt-3 text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                Ask the officer to change this password after their next login.
              </p>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-line px-5 py-4 bg-[#FBFBFC]">
          {step === "confirm" ? (
            <>
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
                onClick={handleConfirm}
                disabled={loading}
                className="h-[36px] px-5 rounded-lg bg-amber-600 text-[12px] font-semibold text-white hover:bg-amber-700 cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Regenerating..." : "Yes, Regenerate"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
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
