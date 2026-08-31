import {
  LayoutGrid,
  Building2,
  Home,
  Grid3x3,
  MapPin,
  Search,
  Users,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { key: "districts", label: "Districts", icon: Building2 },
  { key: "zones", label: "Zones", icon: Home },
  { key: "zone-blocks", label: "Zone Blocks", icon: Grid3x3 },
  { key: "addresses", label: "Addresses", icon: MapPin },
  { key: "search", label: "Search", icon: Search },
  { key: "users", label: "Users", icon: Users },
];

export default function Sidebar({ active, onNavigate }) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-[#0e2a52] text-slate-200">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-base font-semibold leading-tight text-white">SDAS</p>
          <p className="text-[11px] leading-tight text-slate-400">
            Digital Infrastructure
          </p>
        </div>
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = key === active;
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        <button
          onClick={() => onNavigate("settings")}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
        >
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>
    </aside>
  );
}
