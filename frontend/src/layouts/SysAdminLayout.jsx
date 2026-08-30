import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AppTopBar, { navLinkClass } from "@/components/layout/AppTopBar";
import {
  LayoutGrid,
  Building2,
  Home,
  Grid3x3,
  MapPin,
  Search,
  ShieldCheck,
  Settings,
  LogOut,
  UserCog,
  Globe,
  PanelLeftClose,
  PanelLeftOpen,
  ClipboardList,
} from "lucide-react";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/admin/regions", label: "Regions", icon: Globe },
  { to: "/admin/districts", label: "Districts", icon: Building2 },
  { to: "/admin/neighborhoods", label: "Neighborhoods", icon: Home },
  { to: "/admin/zones", label: "Zones", icon: Grid3x3 },
  { to: "/admin/addresses", label: "Addresses", icon: MapPin },
  { to: "/admin/assignments", label: "Assignments", icon: ClipboardList },
  { to: "/admin/search", label: "Search", icon: Search },
  { to: "/admin/data-officers", label: "Data Officers", icon: UserCog },
  { to: "/admin/audit-logs", label: "Audit Logs", icon: ShieldCheck },
];

export default function SysAdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen w-full bg-bg font-sans text-ink overflow-hidden">
      <aside
        className={`flex h-full shrink-0 flex-col bg-blue-deep text-slate-200 transition-[width] duration-200 select-none ${
          collapsed ? "w-[72px]" : "w-64"
        }`}
      >
        <div
          className={`border-b border-white/10 ${
            collapsed ? "flex flex-col items-center gap-3 px-3 py-4" : "flex items-center gap-3 px-4 py-4"
          }`}
        >
          <div
            className={`flex min-w-0 items-center ${
              collapsed ? "flex-col gap-3" : "flex-1 gap-3"
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 border border-white/15 shadow-xs">
              <Building2 className="h-5 w-5 text-white" />
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="truncate text-base font-semibold leading-tight text-white font-display">
                  SDAS
                </p>
                <p className="truncate text-[11px] leading-tight text-slate-300 font-medium">
                  Digital Infrastructure
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setCollapsed((current) => !current)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>

        <nav className="mt-3 flex-1 space-y-1 px-3 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={({ isActive }) => navLinkClass(collapsed, isActive)}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-3 py-4 space-y-1">
          <NavLink
            to="/admin/settings"
            title={collapsed ? "Settings" : undefined}
            className={({ isActive }) => navLinkClass(collapsed, isActive)}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">Settings</span>}
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? "Logout" : undefined}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-300 transition-colors hover:bg-red-500/15 hover:text-red-300 cursor-pointer ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        <AppTopBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          roleLabel="SYS_ADMIN"
          user={user}
        />

        <main className="flex-1 overflow-y-auto bg-bg">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
