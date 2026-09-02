const STATUS_STYLES = {
  ASSIGNED: "bg-slate-100 text-slate-700 border-slate-200",
  IN_PROGRESS: "bg-amber-50 text-amber-800 border-amber-200",
  SUBMITTED: "bg-purple-50 text-purple-800 border-purple-200",
  READY_FOR_REVIEW: "bg-indigo-50 text-indigo-800 border-indigo-200",
  APPROVED: "bg-emerald-50 text-emerald-800 border-emerald-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

export default function AssignmentStatusBadge({ status }) {
  const label = (status || "UNKNOWN").replace(/_/g, " ");
  const style = STATUS_STYLES[status] || "bg-bg text-ink border-line";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${style}`}
    >
      {label}
    </span>
  );
}
