export const TYPE_LABELS = {
  region: "Region",
  district: "District",
  zone: "Zone",
  zone_block: "Zone Block",
  address: "Address",
  data_officer: "Data Officer",
  data_collector: "Data Collector",
};

export default function SearchResultRow({ item, onNavigate }) {
  return (
    <button
      type="button"
      onClick={() => onNavigate(item.path)}
      className="flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-bg cursor-pointer"
    >
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold text-ink">{item.title}</p>
        {item.subtitle && (
          <p className="mt-0.5 truncate text-[11px] text-ink-soft">{item.subtitle}</p>
        )}
      </div>
      <span className="shrink-0 rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-semibold text-brand">
        {TYPE_LABELS[item.type] || item.type}
      </span>
    </button>
  );
}
