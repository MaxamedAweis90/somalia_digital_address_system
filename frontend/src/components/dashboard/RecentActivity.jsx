import { Plus, CheckCircle2, MapPinned, Home } from "lucide-react";

const iconByType = {
  ADDRESS_CREATED: Plus,
  ZONE_CREATED: MapPinned,
  NEIGHBORHOOD_CREATED: Home,
  DEFAULT: CheckCircle2,
};

function formatRelativeTime(timestamp) {
  if (!timestamp) return "";

  const diffMs = Date.now() - new Date(timestamp).getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

  return new Date(timestamp).toLocaleDateString();
}

export default function RecentActivity({ activities = [], loading = false }) {
  return (
    <div className="rounded-xl border border-line bg-white shadow-card-sm overflow-hidden">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-[16px] font-semibold text-ink">Recent Activity</h2>
        <p className="mt-1 text-[12px] text-ink-soft">Latest registry activities.</p>
      </div>

      <div className="px-5 py-2">
        {loading ? (
          <p className="py-10 text-center text-[12px] text-ink-soft">Loading activity...</p>
        ) : activities.length > 0 ? (
          activities.map((activity, index) => {
            const Icon = iconByType[activity.type] || iconByType.DEFAULT;

            return (
              <div
                key={`${activity.type}-${activity.timestamp}-${index}`}
                className={`flex gap-3 py-4 ${
                  index !== activities.length - 1 ? "border-b border-line" : ""
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-deep/10">
                  <Icon size={15} strokeWidth={1.8} className="text-blue-deep" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-ink">{activity.title}</p>
                  <p className="mt-1 text-[11px] leading-4 text-ink-soft">
                    {activity.description}
                  </p>
                  <p className="mt-1.5 text-[10px] text-ink-soft/80">
                    {formatRelativeTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="py-10 text-center text-[12px] text-ink-soft">No recent activity yet.</p>
        )}
      </div>
    </div>
  );
}
