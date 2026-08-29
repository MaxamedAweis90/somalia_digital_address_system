import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo.jsx";

const NAV_LINKS = ["Platform", "Coverage", "Pricing", "Docs", "Blog"];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogin = () => {
    setMenuOpen(false);
    navigate("/login");
  };

  const handleGetStarted = () => {
    setMenuOpen(false);
    navigate("/login");
  };

  return (
    <div>
      {/* Desktop Header */}
      <header className="site-header">

        <Logo />

        {/* Navigation */}
        <nav className="links">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              {link}

              {link === "Platform" && (
                <span className="caret">▾</span>
              )}
            </a>
          ))}
        </nav>

        {/* Right Navigation */}
        <div className="nav-right">

          <button
            type="button"
            className="login"
            onClick={handleLogin}
          >
            Log in
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={handleGetStarted}
          >
            Get Started
          </button>

        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
          >
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
        <nav
          className="mobile-nav"
          style={{ display: "flex" }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              {link}
            </a>
          ))}

          <div className="mobile-actions">

            <button
              type="button"
              className="login"
              onClick={handleLogin}
            >
              Log in
            </button>

            <button
              type="button"
              className="btn-primary"
              onClick={handleGetStarted}
              style={{ justifyContent: "center" }}
            >
              Get Started
            </button>

          </div>
        </nav>
      )}
    </div>
  );
}