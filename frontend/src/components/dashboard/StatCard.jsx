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
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-bold text-gray-900">
            {value}
          </h3>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
          <Icon
            size={20}
            strokeWidth={1.8}
            className="text-[#07529b]"
          />
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Current registry data
      </p>
    </div>
  );
}