import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, HelpCircle, ChevronDown, LogOut, Menu, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { searchRegistry } from "@/api/searchApi";
import SearchResultRow from "@/components/search/SearchResultRow";

const QUICK_SECTIONS = [
  { key: "regions", label: "Regions" },
  { key: "districts", label: "Districts" },
  { key: "zones", label: "Zones" },
  { key: "zoneBlocks", label: "Zone Blocks" },
  { key: "addresses", label: "Addresses" },
  { key: "staff", label: "Staff" },
];

export default function AppTopBar({
  searchQuery,
  onSearchChange,
  roleLabel,
  user,
  onMenuClick,
  searchPath,
}) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!searchPath) return undefined;

    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSearchResults(null);
      setSearchLoading(false);
      return undefined;
    }

    let cancelled = false;
    setSearchLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await searchRegistry({ q: trimmed, limit: 5 });
        if (!cancelled) {
          setSearchResults(res.data.data);
          setSearchOpen(true);
        }
      } catch {
        if (!cancelled) setSearchResults(null);
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, searchPath]);

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

  const submitSearch = () => {
    if (!searchPath) return;
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    setSearchOpen(false);
    navigate(`${searchPath}?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitSearch();
    }
  };

  const quickMatches = searchResults
    ? QUICK_SECTIONS.flatMap(({ key, label }) =>
        (searchResults.results?.[key] || []).map((item) => ({ ...item, sectionLabel: label }))
      )
    : [];

  const totalQuickMatches = searchResults
    ? Object.values(searchResults.totals || {}).reduce((sum, count) => sum + count, 0)
    : 0;

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

        {searchPath && (
          <div ref={searchRef} className="relative hidden min-w-0 flex-1 max-w-72 sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (e.target.value.trim().length >= 2) setSearchOpen(true);
              }}
              onFocus={() => {
                if (searchQuery.trim().length >= 2 && searchResults) setSearchOpen(true);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search registry..."
              aria-label="Search registry"
              aria-expanded={searchOpen}
              aria-controls="registry-search-results"
              className="
                w-full
                h-[38px]
                rounded-lg
                border
                border-line
                bg-bg
                pl-9
                pr-9
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
            {searchLoading && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-ink-soft" />
            )}

            {searchOpen && searchQuery.trim().length >= 2 && (
              <div
                id="registry-search-results"
                className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-line bg-white shadow-lg"
              >
                {searchLoading && !searchResults ? (
                  <div className="px-4 py-3 text-[12px] text-ink-soft">Searching...</div>
                ) : quickMatches.length > 0 ? (
                  <>
                    <div className="max-h-80 overflow-y-auto divide-y divide-line px-1 py-1">
                      {quickMatches.slice(0, 8).map((item) => (
                        <SearchResultRow
                          key={`${item.type}-${item.id}`}
                          item={item}
                          onNavigate={(path) => {
                            setSearchOpen(false);
                            navigate(path);
                          }}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={submitSearch}
                      className="w-full border-t border-line bg-[#FBFCFE] px-4 py-2.5 text-left text-[11px] font-semibold text-blue-deep hover:bg-bg cursor-pointer"
                    >
                      View all {totalQuickMatches} result{totalQuickMatches === 1 ? "" : "s"} for “
                      {searchQuery.trim()}”
                    </button>
                  </>
                ) : (
                  <div className="px-4 py-3 text-[12px] text-ink-soft">
                    No matches for “{searchQuery.trim()}”
                  </div>
                )}
              </div>
            )}
          </div>
        )}
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
