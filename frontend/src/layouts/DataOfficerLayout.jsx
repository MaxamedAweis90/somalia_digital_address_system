import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutGrid,
  Building2,
  Home,
  Grid3x3,
  MapPin,
  Search,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  HelpCircle,
} from "lucide-react";

const navItems = [
  { to: "/officer/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/officer/districts", label: "Districts", icon: Building2 },
  { to: "/officer/neighborhoods", label: "Neighborhoods", icon: Home },
  { to: "/officer/zones", label: "Zones", icon: Grid3x3 },
  { to: "/officer/addresses", label: "Addresses", icon: MapPin },
  { to: "/officer/search", label: "Search", icon: Search },
];

export default function DataOfficerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Collapsible Sidebar */}
      <aside
        className={`flex h-full shrink-0 flex-col bg-[#0e2a52] text-slate-200 transition-[width] duration-200 select-none ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/30 shadow-xs">
            <Building2 className="h-5 w-5 text-white" />
          </div>

          {!collapsed && (
            <div className="overflow-hidden">
              <p className="truncate text-base font-semibold leading-tight text-white font-display">
                SDAS
              </p>
              <p className="truncate text-[11px] leading-tight text-slate-400 font-medium">
                Digital Infrastructure
              </p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="mt-4 flex-1 space-y-1 px-3 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                } ${collapsed ? "justify-center" : ""}`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-white/10 px-3 py-4 space-y-1">
          {/* Settings */}
          <NavLink
            to="/officer/settings"
            title={collapsed ? "Settings" : undefined}
            className={({ isActive }) =>
              `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              } ${collapsed ? "justify-center" : ""}`
            }
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">Settings</span>}
          </NavLink>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? "Logout" : undefined}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-red-500/15 hover:text-red-300 cursor-pointer ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && "Logout"}
          </button>

          {/* Collapse Toggle */}
          <button
            type="button"
            onClick={() => setCollapsed((current) => !current)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white cursor-pointer ${
              collapsed ? "justify-center" : ""
            }`}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4 shrink-0" />
            ) : (
              <PanelLeftClose className="h-4 w-4 shrink-0" />
            )}
            {!collapsed && "Collapse"}
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        {/* TopBar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8">
          {/* Search */}
          <div className="relative w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          {/* Right Side Header Utilities */}
          <div className="flex items-center gap-5">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-semibold text-[#0056B3]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0056B3]"></span>
              DATA_OFFICER
            </span>

            {/* Notifications */}
            <button
              type="button"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>

            {/* Help / Support */}
            <button
              type="button"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
              title="Help & Support"
            >
              <HelpCircle className="h-4 w-4" />
            </button>

            <div className="h-4 w-px bg-slate-200" />

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-800 leading-tight">
                  {user?.name || "Data Officer"}
                </p>
                <p className="text-[11px] text-slate-500 leading-tight">
                  {user?.email || "officer@somalia.gov.so"}
                </p>
              </div>

              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : "D"}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Nested Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
