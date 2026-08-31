import {
    Building2,
    Settings,
    PanelLeftClose,
    PanelLeftOpen,
    LogOut,
} from "lucide-react";

import { NAV_ITEMS } from "./navItems";

function Sidebar({
    active,
    onNavigate,
    collapsed,
    onToggleCollapsed,
}) {
    return (
        <aside
            className={`flex h-full shrink-0 flex-col bg-[#0e2a52] text-slate-200 transition-[width] duration-200 ${collapsed ? "w-20" : "w-64"
                }`}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-6">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <Building2 className="h-5 w-5 text-white" />
                </div>

                {!collapsed && (
                    <div className="overflow-hidden">
                        <p className="truncate text-base font-semibold leading-tight text-white">
                            SDAS
                        </p>

                        <p className="truncate text-[11px] leading-tight text-slate-400">
                            Digital Infrastructure
                        </p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="mt-2 flex-1 space-y-1 px-3">
                {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
                    const isActive = key === active;

                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => onNavigate(key)}
                            title={collapsed ? label : undefined}
                            aria-current={isActive ? "page" : undefined}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                                } ${collapsed ? "justify-center" : ""}`}
                        >
                            <Icon className="h-4 w-4 shrink-0" />

                            {!collapsed && (
                                <span className="truncate">
                                    {label}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="border-t border-white/10 px-3 py-4">

                {/* Settings */}
                <button
                    type="button"
                    onClick={() => onNavigate("settings")}
                    title={collapsed ? "Settings" : undefined}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white ${collapsed ? "justify-center" : ""
                        }`}
                >
                    <Settings className="h-4 w-4 shrink-0" />

                    {!collapsed && "Settings"}
                </button>

                {/* Logout */}
                <button
                    type="button"
                    onClick={() => onNavigate("logout")}
                    title={collapsed ? "Logout" : undefined}
                    className={`mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-red-500/10 hover:text-red-400 ${collapsed ? "justify-center" : ""
                        }`}
                >
                    <LogOut className="h-4 w-4 shrink-0" />

                    {!collapsed && "Logout"}
                </button>

                {/* Collapse */}
                <button
                    type="button"
                    onClick={onToggleCollapsed}
                    title={
                        collapsed
                            ? "Expand sidebar"
                            : "Collapse sidebar"
                    }
                    className={`mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white ${collapsed ? "justify-center" : ""
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
    );
}

export default Sidebar;