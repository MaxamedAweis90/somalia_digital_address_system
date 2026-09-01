import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AppTopBar, { navLinkClass } from "@/components/layout/AppTopBar";
import { LogOut, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";

export default function PortalShell({
  brandSubtitle,
  brandIcon: BrandIcon,
  navItems = [],
  footerNavItems = [],
  roleLabel,
  searchPath = null,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!searchPath || !location.pathname.startsWith(searchPath)) return;
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get("q") || "");
  }, [location.pathname, location.search, searchPath]);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const sidebarCollapsed = collapsed && !mobileOpen;

  const sidebar = (
    <aside
      className={`flex h-full flex-col bg-blue-deep text-slate-200 transition-transform duration-200 select-none
        fixed inset-y-0 left-0 z-40 w-64
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:static lg:z-auto lg:translate-x-0 lg:shrink-0 lg:transition-[width]
        ${sidebarCollapsed ? "lg:w-[72px]" : "lg:w-64"}`}
    >
      <div
        className={`border-b border-white/10 ${
          sidebarCollapsed
            ? "flex flex-col items-center gap-3 px-3 py-4"
            : "flex items-center gap-3 px-4 py-4"
        }`}
      >
        <div
          className={`flex min-w-0 items-center ${
            sidebarCollapsed ? "flex-col gap-3" : "flex-1 gap-3"
          }`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 border border-white/15 shadow-xs">
            <BrandIcon className="h-5 w-5 text-white" />
          </div>

          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="truncate text-base font-semibold leading-tight text-white font-display">
                SDAS
              </p>
              <p className="truncate text-[11px] leading-tight text-slate-300 font-medium">
                {brandSubtitle}
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => setCollapsed((current) => !current)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer lg:flex"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="mt-3 flex-1 space-y-1 px-3 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, end, matchPrefixes = [] }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={sidebarCollapsed ? label : undefined}
            className={({ isActive }) => {
              const matched =
                isActive ||
                matchPrefixes.some((prefix) => location.pathname.startsWith(prefix));
              return navLinkClass(sidebarCollapsed, matched);
            }}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 px-3 py-4 space-y-1">
        {footerNavItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            title={sidebarCollapsed ? label : undefined}
            className={({ isActive }) => navLinkClass(sidebarCollapsed, isActive)}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}

        <button
          type="button"
          onClick={handleLogout}
          title={sidebarCollapsed ? "Logout" : undefined}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-300 transition-colors hover:bg-red-500/15 hover:text-red-300 cursor-pointer ${
            sidebarCollapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!sidebarCollapsed && "Logout"}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen w-full bg-bg font-sans text-ink overflow-hidden">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {sidebar}

      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        <AppTopBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          roleLabel={roleLabel}
          user={user}
          onMenuClick={() => setMobileOpen(true)}
          searchPath={searchPath}
        />

        <main className="flex-1 overflow-y-auto bg-bg">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
