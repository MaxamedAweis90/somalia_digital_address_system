import React from "react";

export default function StatusBadge({ status }) {
  const styles =
    status === "Verified" || status === "Active"
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
      : "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${styles}`}
    >
      {status === "Active" && (
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      )}
      {status}
    </span>
  );
}
