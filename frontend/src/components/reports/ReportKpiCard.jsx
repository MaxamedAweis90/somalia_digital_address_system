const accentStyles = {
  "blue-deep": "bg-blue-deep/10 text-blue-deep border-blue-deep/15",
  brand: "bg-brand-light text-brand border-blue/20",
  teal: "bg-teal-50 text-teal-700 border-teal-100",
  sand: "bg-amber-50 text-amber-800 border-amber-100",
};

export default function ReportKpiCard({ title, value, icon: Icon, accent = "blue-deep" }) {
  const iconClass = accentStyles[accent] || accentStyles["blue-deep"];

  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-ink-soft">{title}</p>
          <p className="mt-2 font-display text-[28px] font-semibold tracking-tight text-ink">
            {Number(value || 0).toLocaleString()}
          </p>
        </div>
        {Icon && (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${iconClass}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
