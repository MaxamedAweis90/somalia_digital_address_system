const statusStyles = {
  ASSIGNED: "bg-slate-100 text-slate-700 border-slate-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
  SUBMITTED: "bg-blue-50 text-blue-700 border-blue-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

const statusLabels = {
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export default function AssignmentStatusBadge({ status }) {
  const normalized = (status || "ASSIGNED").toUpperCase();

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
        statusStyles[normalized] || statusStyles.ASSIGNED
      }`}
    >
      {statusLabels[normalized] || normalized}
    </span>
  );
}

export function formatAssignmentLocation(assignment) {
  const neighborhood = assignment?.neighborhood;
  const district = neighborhood?.district;
  const region = district?.region;

  if (!neighborhood) return "—";

  const parts = [
    neighborhood.name,
    district?.name,
    region?.name,
  ].filter(Boolean);

  return parts.join(" · ");
}
