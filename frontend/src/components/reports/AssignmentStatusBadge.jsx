const statusConfig = {
  ASSIGNED: {
    label: "Assigned",
    dot: "bg-blue-400",
    text: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  IN_PROGRESS: {
    label: "In Progress",
    dot: "bg-amber-400",
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  SUBMITTED: {
    label: "Submitted",
    dot: "bg-purple-400",
    text: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-100",
  },
  READY_FOR_REVIEW: {
    label: "Ready for Review",
    dot: "bg-indigo-400",
    text: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
  },
  APPROVED: {
    label: "Approved",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  REJECTED: {
    label: "Rejected",
    dot: "bg-red-400",
    text: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-100",
  },
  ACTIVE: {
    label: "Active",
    dot: "bg-green-500",
    text: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-100",
  },
  INACTIVE: {
    label: "Inactive",
    dot: "bg-gray-400",
    text: "text-gray-500",
    bg: "bg-gray-100",
    border: "border-gray-200",
  },
};

export default function AssignmentStatusBadge({ status }) {
  const normalized = (status || "ASSIGNED").toUpperCase();
  const config = statusConfig[normalized] || {
    label: status,
    dot: "bg-gray-400",
    text: "text-gray-500",
    bg: "bg-gray-100",
    border: "border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${config.bg} ${config.text} ${config.border} border`}
    >
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
