import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, HelpCircle, ChevronDown, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AppTopBar({
  searchQuery,
  onSearchChange,
  roleLabel,
  user,
  onMenuClick,
}) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setProfileOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    if (loggingOut) return;

    try {
      setLoggingOut(true);
      await logout();
      navigate("/login", { replace: true });
    } finally {
      setLoggingOut(false);
      setProfileOpen(false);
    }
  };

  return (
    <header className="flex h-14 sm:h-16 shrink-0 items-center justify-between gap-2 border-b border-line bg-white px-3 sm:px-6 lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-soft hover:bg-bg hover:text-ink transition cursor-pointer lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="relative hidden min-w-0 flex-1 max-w-72 sm:block">
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

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-4">
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-brand-light border border-blue/20 px-3 py-1 text-[11px] font-semibold text-brand">
          <span className="w-1.5 h-1.5 rounded-full bg-brand" />
          {roleLabel}
        </span>

        <button
          type="button"
          aria-label="Notifications"
          className="hidden h-9 w-9 items-center justify-center rounded-lg text-ink-soft hover:bg-bg hover:text-ink transition cursor-pointer sm:flex"
        >
          <Bell className="h-4 w-4" />
        </button>

        <button
          type="button"
          aria-label="Help"
          className="hidden h-9 w-9 items-center justify-center rounded-lg text-ink-soft hover:bg-bg hover:text-ink transition cursor-pointer sm:flex"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        <div className="relative border-l border-line pl-2 sm:pl-3" ref={profileRef}>
          <button
            type="button"
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            onClick={() => setProfileOpen((current) => !current)}
            className="flex items-center gap-2.5 rounded-lg px-1.5 sm:px-2 py-1.5 text-left transition hover:bg-bg cursor-pointer"
          >
            <div className="hidden sm:block">
              <p className="text-[13px] font-semibold text-ink leading-tight">
                {user?.name || "User"}
              </p>
              <p className="text-[11px] text-ink-soft leading-tight">{user?.email}</p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue to-blue-deep text-xs font-bold text-white shadow-xs ring-2 ring-brand-light">
              {(user?.name || "U").charAt(0).toUpperCase()}
            </div>
            <ChevronDown
              className={`hidden h-4 w-4 text-ink-soft transition-transform sm:block ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {profileOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-2 w-[min(16rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-line bg-white shadow-lg"
            >
              <div className="border-b border-line bg-[#FBFCFE] px-4 py-3">
                <p className="text-[12px] font-semibold text-ink">{user?.name || "User"}</p>
                <p className="mt-0.5 truncate text-[11px] text-ink-soft">{user?.email}</p>
                <p className="mt-2 inline-flex rounded-full bg-brand-light px-2 py-1 text-[10px] font-semibold text-brand">
                  {roleLabel}
                </p>
              </div>
              <div className="p-1.5">
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-[12px] font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  {loggingOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            </div>
          )}
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
