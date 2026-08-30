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
  const zone = assignment?.zone;

  if (!neighborhood) return "—";

  const parts = [
    zone ? `${zone.name} (${zone.code})` : null,
    neighborhood.name,
    district?.name,
    region?.name,
  ].filter(Boolean);

  return parts.join(" · ");
}

const typeLabels = {
  DEFINE_ZONES: "Define Zones",
  REGISTER_ADDRESSES: "Register Addresses",
};

const typeStyles = {
  DEFINE_ZONES: "bg-violet-50 text-violet-700 border-violet-200",
  REGISTER_ADDRESSES: "bg-cyan-50 text-cyan-700 border-cyan-200",
};

export function AssignmentTypeBadge({ type }) {
  const normalized = (type || "DEFINE_ZONES").toUpperCase();

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
        typeStyles[normalized] || typeStyles.DEFINE_ZONES
      }`}
    >
      {typeLabels[normalized] || normalized}
    </span>
  );
}

export function getAssignmentDraftCount(assignment) {
  if (assignment?.type === "REGISTER_ADDRESSES") {
    return assignment.payload?.addresses?.length || 0;
  }

  return assignment.payload?.zones?.length || 0;
}

export function getAssignmentDraftLabel(assignment) {
  return assignment?.type === "REGISTER_ADDRESSES" ? "Draft Addresses" : "Draft Zones";
}
