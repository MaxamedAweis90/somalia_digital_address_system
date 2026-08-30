import {
  Building2,
  Map,
  MapPinned,
  MapPin,
} from "lucide-react";

const icons = {
  "Total Districts": Building2,
  "Total Neighborhoods": Map,
  "Total Zones": MapPinned,
  "Total Addresses": MapPin,
};

export default function StatCard({ title, value }) {
  const Icon = icons[title] || MapPin;

  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-medium text-ink-soft">{title}</p>
          <h3 className="mt-2 font-display text-[28px] font-semibold tracking-tight text-ink">
            {value}
          </h3>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-deep/10 border border-blue-deep/10">
          <Icon size={20} strokeWidth={1.8} className="text-blue-deep" />
        </div>
      </div>

      <p className="mt-4 text-[11px] text-ink-soft">Live registry count</p>
    </div>
  );
}
