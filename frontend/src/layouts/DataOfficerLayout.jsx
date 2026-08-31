import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AppTopBar, { navLinkClass } from "@/components/layout/AppTopBar";
import {
  LayoutGrid,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  ClipboardCheck,
  Map,
  UserCheck,
} from "lucide-react";

const navItems = [
  { to: "/officer/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/officer/zones", label: "Zones", icon: Map },
  { to: "/officer/reviews", label: "Submitted Zones", icon: ClipboardCheck },
  { to: "/officer/collector-reviews", label: "Collector Reviews", icon: UserCheck },
  { to: "/officer/collectors", label: "My Team", icon: Users },
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
              <LayoutGrid className="h-5 w-5 text-white" />
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="truncate text-base font-semibold leading-tight text-white font-display">
                  SDAS
                </p>
                <p className="truncate text-[11px] leading-tight text-slate-300 font-medium">
                  Field Operations
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

        <div className="border-t border-white/10 px-3 py-4">
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
          roleLabel="DATA_OFFICER"
          user={user}
        />

        <main className="flex-1 overflow-y-auto bg-bg">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
