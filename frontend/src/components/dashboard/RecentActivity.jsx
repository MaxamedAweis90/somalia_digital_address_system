import {
  Plus,
  CheckCircle2,
  MapPinned,
  AlertCircle,
} from "lucide-react";

const activities = [
  {
    title: "New address registered",
    description: "MG-HB-01-A24 was added to the registry.",
    time: "Just now",
    icon: Plus,
  },
  {
    title: "Address verified",
    description: "MG-WL-03-B12 was verified successfully.",
    time: "2 hours ago",
    icon: CheckCircle2,
  },
  {
    title: "Zone boundary updated",
    description: "Zone C boundary information was updated.",
    time: "5 hours ago",
    icon: MapPinned,
  },
  {
    title: "Data synchronization conflict",
    description: "A registry synchronization issue requires review.",
    time: "1 day ago",
    icon: AlertCircle,
  },
];

export default function RecentActivity() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-sm font-semibold text-gray-900">
          Recent Activity
        </h2>

        <p className="mt-1 text-xs text-gray-500">
          Latest registry activities.
        </p>
      </div>

      {/* Activities */}
      <div className="px-5 py-2">
        {activities.map((activity, index) => {
          const Icon = activity.icon;

          return (
            <div
              key={activity.title}
              className={`flex gap-3 py-4 ${
                index !== activities.length - 1
                  ? "border-b border-gray-100"
                  : ""
              }`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50">
                <Icon
                  size={15}
                  strokeWidth={1.8}
                  className="text-[#07529b]"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-800">
                  {activity.title}
                </p>

                <p className="mt-1 text-[11px] leading-4 text-gray-500">
                  {activity.description}
                </p>

                <p className="mt-1.5 text-[10px] text-gray-400">
                  {activity.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}