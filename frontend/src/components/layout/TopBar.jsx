import {
    Search,
    Bell,
    HelpCircle,
} from "lucide-react";

function TopBar({
    searchPlaceholder,
    onSearch,
    user,
}) {
    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-8">

            {/* Search */}
            <div className="relative w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                    type="text"
                    onChange={(e) =>
                        onSearch?.(e.target.value)
                    }
                    placeholder={
                        searchPlaceholder || "Search..."
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-5">

                {/* Notifications */}
                <button
                    type="button"
                    aria-label="Notifications"
                    className="text-slate-500 hover:text-slate-700"
                >
                    <Bell className="h-5 w-5" />
                </button>

                {/* Help */}
                <button
                    type="button"
                    aria-label="Help"
                    className="text-slate-500 hover:text-slate-700"
                >
                    <HelpCircle className="h-5 w-5" />
                </button>

                {/* User */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">
                        {user?.name || "Admin Panel"}
                    </span>

                    <div className="h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-blue-600 ring-2 ring-white">
                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-white">
                            {(user?.name || "A")
                                .charAt(0)
                                .toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default TopBar;
export { TopBar };