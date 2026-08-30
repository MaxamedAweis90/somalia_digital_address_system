import {
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  HelpCircle,
} from "lucide-react";

export default function AppTopBar({
  collapsed,
  onToggleCollapsed,
  searchQuery,
  onSearchChange,
  roleLabel,
  user,
}) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-white px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggleCollapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-soft transition-colors hover:bg-bg hover:text-ink cursor-pointer"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>

        <div className="relative w-56 sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search registry..."
            className="
              w-full
              h-[38px]
              rounded-lg
              border
              border-line
              bg-bg
              pl-9
              pr-3
              text-[12px]
              text-ink
              placeholder:text-ink-soft/70
              outline-none
              focus:border-blue
              focus:ring-2
              focus:ring-blue/10
              transition
            "
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-brand-light border border-blue/20 px-3 py-1 text-[11px] font-semibold text-brand">
          <span className="w-1.5 h-1.5 rounded-full bg-brand" />
          {roleLabel}
        </span>

        <button
          type="button"
          aria-label="Notifications"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft hover:bg-bg hover:text-ink transition cursor-pointer"
        >
          <Bell className="h-4 w-4" />
        </button>

        <button
          type="button"
          aria-label="Help"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft hover:bg-bg hover:text-ink transition cursor-pointer"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-line">
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-semibold text-ink leading-tight">
              {user?.name || "User"}
            </p>
            <p className="text-[11px] text-ink-soft leading-tight">{user?.email}</p>
          </div>

          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue to-blue-deep ring-2 ring-brand-light flex items-center justify-center text-xs font-bold text-white shadow-xs">
            {(user?.name || "U").charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}

export function navLinkClass(collapsed, isActive) {
  return `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
    isActive
      ? "bg-blue text-white shadow-sm"
      : "text-slate-300 hover:bg-white/10 hover:text-white"
  } ${collapsed ? "justify-center" : ""}`;
}
