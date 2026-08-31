import {
  Building2,
  Home,
  Map,
  MapPinned,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";

const icons = {
  "Total Districts": Building2,
  "Total Neighborhoods": Home,
  "Total Zones": Map,
  "Total Zone Blocks": MapPinned,
  "Total Addresses": MapPin,
};

export default function StatCard({ title, value, to, onClick }) {
  const Icon = icons[title] || MapPin;

  const cardContent = (
    <>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-medium text-ink-soft">{title}</p>
          <h3 className="mt-2 font-display text-[28px] font-semibold tracking-tight text-ink">
            {value}
          </h3>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-deep/10 border border-blue-deep/10 transition-colors group-hover:bg-blue-deep/15">
          <Icon size={20} strokeWidth={1.8} className="text-blue-deep" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-[11px] text-ink-soft">
        <span>Live registry count</span>
        <span className="font-semibold text-blue-deep opacity-0 group-hover:opacity-100 transition-opacity">
          View →
        </span>
      </div>
    </>
  );

  const cardClasses =
    "group block rounded-xl border border-line bg-white p-5 shadow-card-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-deep/50 cursor-pointer select-none";

  if (to) {
    return (
      <Link to={to} className={cardClasses}>
        {cardContent}
      </Link>
    );
  }

  return (
    <div
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className={cardClasses}
    >
      {cardContent}
    </div>
  );
}
