const DONUT_COLORS = [
  "#1e3a5f",
  "#d97706",
  "#7c3aed",
  "#4f46e5",
  "#059669",
  "#dc2626",
];

function getBarValue(item) {
  if (typeof item.completionPct === "number") return item.completionPct;
  if (typeof item.val === "number") return item.val;
  if (typeof item.count === "number") return item.count;
  return 0;
}

function getBarLabel(item) {
  return item.name || item.period || "—";
}

export function DonutChart({ data = [] }) {
  const total = data.reduce((sum, item) => sum + (item.count || 0), 0);

  if (!data.length || total === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-xs text-ink-soft">
        No data to chart
      </div>
    );
  }

  let offset = 0;
  const segments = data.map((item, index) => {
    const pct = (item.count / total) * 100;
    const segment = { pct, color: DONUT_COLORS[index % DONUT_COLORS.length], ...item };
    offset += pct;
    return segment;
  });

  const gradient = segments
    .reduce(
      (acc, seg, i) => {
        const start = segments.slice(0, i).reduce((s, x) => s + x.pct, 0);
        const end = start + seg.pct;
        acc.push(`${seg.color} ${start}% ${end}%`);
        return acc;
      },
      []
    )
    .join(", ");

  return (
    <div className="space-y-4">
      <div
        className="mx-auto h-40 w-40 rounded-full"
        style={{ background: `conic-gradient(${gradient})` }}
        aria-hidden
      />
      <ul className="space-y-2 text-xs">
        {segments.map((seg) => (
          <li key={seg.status || seg.label} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 min-w-0">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="truncate text-ink-soft">{seg.status?.replace(/_/g, " ") || seg.label}</span>
            </span>
            <span className="font-mono font-semibold text-ink shrink-0">
              {seg.count} ({seg.percentage ?? Math.round(seg.pct)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HorizontalBarChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="flex h-32 items-center justify-center text-xs text-ink-soft">
        No data to chart
      </div>
    );
  }

  const max = Math.max(...data.map(getBarValue), 1);

  return (
    <div className="space-y-3">
      {data.slice(0, 8).map((item) => {
        const value = getBarValue(item);
        const width = Math.round((value / max) * 100);
        return (
          <div key={getBarLabel(item)}>
            <div className="mb-1 flex justify-between gap-2 text-[11px]">
              <span className="truncate text-ink-soft">{getBarLabel(item)}</span>
              <span className="font-mono font-semibold text-ink shrink-0">{value}</span>
            </div>
            <div className="h-2 rounded-full bg-bg overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-deep transition-all"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TrendLineChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="flex h-40 items-center justify-center text-xs text-ink-soft">
        No trend data yet
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.count || 0), 1);
  const width = 600;
  const height = 160;
  const padding = 24;
  const step = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;

  const points = data.map((item, index) => {
    const x = padding + index * step;
    const y = height - padding - ((item.count || 0) / max) * (height - padding * 2);
    return `${x},${y}`;
  });

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[320px] h-40">
        <polyline
          fill="none"
          stroke="#1e3a5f"
          strokeWidth="2"
          points={points.join(" ")}
        />
        {data.map((item, index) => {
          const x = padding + index * step;
          const y = height - padding - ((item.count || 0) / max) * (height - padding * 2);
          return (
            <g key={item.period}>
              <circle cx={x} cy={y} r="4" fill="#1e3a5f" />
              <text x={x} y={height - 4} textAnchor="middle" className="fill-ink-soft text-[9px]">
                {item.period}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
