import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { to: "/officer/dashboard", label: "Dashboard" },
  { to: "/officer/addresses", label: "Addresses" },
  { to: "/officer/districts", label: "Districts" },
];

export default function DataOfficerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#F6F8FB]">
      <aside className="flex w-64 flex-col border-r border-[#E3E8EF] bg-white">
        <div className="flex h-16 items-center gap-3 border-b border-[#E3E8EF] px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A7C59] text-lg font-bold text-white">
            D
          </div>
          <div>
            <p className="text-sm font-bold text-[#0A1F35]">SDAS</p>
            <p className="text-xs text-gray-500">Data Officer</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#0A7C59] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[#E3E8EF] p-4">
          <p className="truncate text-sm font-medium text-gray-900">{user?.name}</p>
          <p className="truncate text-xs text-gray-500">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="mt-3 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-[#E3E8EF] bg-white px-6">
          <h1 className="text-lg font-semibold text-[#172B4D]">Data Registry</h1>
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-[#0A7C59]">
            DATA_OFFICER
          </span>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
