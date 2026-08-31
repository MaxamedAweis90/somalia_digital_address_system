import React from "react";

// Color palette matching SDAS brand tokens
const PALETTE = [
  "#0056B3", // brand
  "#14345C", // brand-deep / night
  "#1FA69B", // teal
  "#D98C4A", // sand
  "#4189DD", // blue
  "#F6C453", // star / amber
  "#8B5CF6", // purple
  "#EF4444", // red
];

export function DonutChart({ data = [], height = 180 }) {
  const total = data.reduce((sum, item) => sum + (item.value || item.count || 0), 0);
  if (total === 0) {
    return (
      <div className="flex h-44 items-center justify-center text-xs text-ink-soft">
        No data available
      </div>
    );
  }

  let accumulatedAngle = 0;
  const radius = 60;
  const strokeWidth = 24;
  const center = 90;
  const circumference = 2 * Math.PI * radius;

  const slices = data.map((item, index) => {
    const val = item.value || item.count || 0;
    const percentage = val / total;
    const strokeDasharray = `${percentage * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedAngle * circumference;
    accumulatedAngle += percentage;
    const color = item.color || PALETTE[index % PALETTE.length];

    return {
      label: item.label || item.status || "Item",
      val,
      percentage: Math.round(percentage * 100),
      strokeDasharray,
      strokeDashoffset,
      color,
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
      <div className="relative shrink-0" style={{ width: height, height }}>
        <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90 transform">
          {slices.map((slice, i) => (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeDasharray={slice.strokeDasharray}
              strokeDashoffset={slice.strokeDashoffset}
              className="transition-all duration-300 hover:opacity-80"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold text-ink font-mono">{total}</span>
          <span className="text-[10px] uppercase font-semibold text-ink-soft tracking-wider">
            Total
          </span>
        </div>
      </div>

      <div className="flex flex-wrap sm:flex-col gap-2.5 max-w-xs text-xs">
        {slices.map((slice, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: slice.color }}
            />
            <span className="font-medium text-ink truncate">{slice.label}:</span>
            <span className="font-mono font-semibold text-ink-soft">{slice.val}</span>
            <span className="text-[11px] text-ink-soft font-mono">({slice.percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HorizontalBarChart({ data = [], maxVal }) {
  const max = maxVal || Math.max(...data.map((d) => d.val || d.count || d.completionPct || 0), 1);

  if (!data || data.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-ink-soft">
        No bar chart data available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const val = item.val || item.count || item.completionPct || 0;
        const pct = Math.min(Math.round((val / max) * 100), 100);
        const color = item.color || PALETTE[index % PALETTE.length];

        return (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-ink truncate max-w-[200px]">
                {item.label || item.name}
              </span>
              <span className="font-mono font-semibold text-ink-soft">
                {val} {item.unit || (item.completionPct !== undefined ? "%" : "")}
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-line/60 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TrendLineChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-44 items-center justify-center text-xs text-ink-soft">
        No trend records captured yet.
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.count || 0), 1);
  const width = 500;
  const height = 150;
  const padding = 20;

  const points = data.map((d, i) => {
    const x = padding + (i / Math.max(data.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - ((d.count || 0) / max) * (height - padding * 2);
    return { x, y, label: d.period, count: d.count };
  });

  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="w-full space-y-2">
      <div className="relative w-full h-40 overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0056B3" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0056B3" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#trendGradient)" />
          <path
            d={pathD}
            fill="none"
            stroke="#0056B3"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r="4"
                fill="#ffffff"
                stroke="#0056B3"
                strokeWidth="2"
              />
            </g>
          ))}
        </svg>
      </div>

      <div className="flex justify-between border-t border-line pt-2 text-[11px] font-mono text-ink-soft">
        {data.map((d, i) => (
          <span key={i} className="truncate">
            {d.period} ({d.count})
          </span>
        ))}
      </div>
    </div>
  );
}
