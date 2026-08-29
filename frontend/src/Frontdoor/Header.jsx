import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "./Logo.jsx";

// Official Government Navigation Links
export const GOVT_NAV_LINKS = [
  { name: "Address Lookup", path: "/search" },
  { name: "Developer API", path: "/developers" },
  { name: "Coverage & Districts", path: "/coverage" },
  { name: "About SDAS", path: "/about" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const handleLogin = () => {
    setMenuOpen(false);
    navigate("/login");
  };

  return (
    <div className="font-sans antialiased text-[#16233A]">
      {/* Desktop Header */}
      <header className="w-full flex items-center justify-between gap-6 px-6 lg:px-10 py-3 bg-white border-b border-gray-200">
        <Link to="/" aria-label="Go to Home">
          <Logo className="h-14 sm:h-16 lg:h-20 w-auto hover:opacity-80 transition-opacity cursor-pointer duration-200" />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {GOVT_NAV_LINKS.map((item) => (
            <a
              key={item.name}
              href={item.path}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation(item.path);
              }}
              className="text-sm font-medium text-gray-600 hover:text-[#0056B3] transition"
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* Right Navigation */}
        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            className="text-sm font-semibold text-[#0056B3] hover:text-[#00458F] px-3 py-2 transition cursor-pointer"
            onClick={handleLogin}
          >
            Log in (Officers)
          </button>

          <button
            type="button"
            className="text-sm font-semibold text-white bg-[#0056B3] hover:bg-[#00458F] active:bg-[#003B7A] rounded-lg px-4 py-2.5 shadow-xs hover:shadow transition cursor-pointer"
            onClick={() => handleNavigation("/search")}
          >
            Find Address
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden inline-flex items-center justify-center rounded-lg p-2 hover:bg-gray-100 transition"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            {menuOpen ? (
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="#16233A"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="#16233A"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </header>

      {/* Mobile Navigation */}
      {menuOpen && (
        <nav className="md:hidden flex flex-col gap-1 px-6 py-4 bg-white border-b border-gray-200">
          {GOVT_NAV_LINKS.map((item) => (
            <a
              key={item.name}
              href={item.path}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation(item.path);
              }}
              className="text-sm font-medium text-gray-700 hover:text-[#0056B3] py-2.5 transition"
            >
              {item.name}
            </a>
          ))}

          <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-gray-100">
            <button
              type="button"
              className="text-sm font-semibold text-[#0056B3] py-2 text-left cursor-pointer"
              onClick={handleLogin}
            >
              Log in (Officers)
            </button>

            <button
              type="button"
              className="text-sm font-semibold text-white bg-[#0056B3] hover:bg-[#00458F] rounded-lg px-4 py-2.5 justify-center flex transition cursor-pointer"
              onClick={() => handleNavigation("/search")}
            >
              Find Address
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}