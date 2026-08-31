export default function ReportKpiCard({ title, value, icon: Icon, accent = "blue-deep" }) {
  const accentClasses = {
    "blue-deep": "bg-blue-deep/10 border-blue-deep/10 text-blue-deep",
    brand: "bg-brand/10 border-brand/10 text-brand",
    teal: "bg-teal/10 border-teal/10 text-teal",
    sand: "bg-sand/10 border-sand/10 text-sand",
  };

  const badgeClass = accentClasses[accent] || accentClasses["blue-deep"];

  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-medium text-ink-soft">{title}</p>
          <h3 className="mt-2 font-display text-[28px] font-semibold tracking-tight text-ink">
            {typeof value === "number" ? value.toLocaleString() : value}
          </h3>
        </div>

        {Icon && (
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg border ${badgeClass}`}
          >
            <Icon size={20} strokeWidth={1.8} />
          </div>
        )}
      </div>
    </div>
  );
}
