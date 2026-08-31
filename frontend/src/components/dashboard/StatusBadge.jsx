export default function StatusBadge({ status }) {
  const normalized = (status || "ACTIVE").toUpperCase();
  const isActive = normalized === "ACTIVE" || status === "Verified";

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        px-3
        py-1
        text-[10px]
        font-semibold
        ${
          isActive
            ? "bg-green-50 text-green-600 border border-green-100"
            : "bg-gray-100 text-gray-500 border border-gray-200"
        }
      `}
    >
      <span
        className={`
          mr-1.5
          h-1.5
          w-1.5
          rounded-full
          ${isActive ? "bg-green-500" : "bg-gray-400"}
        `}
      />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}
