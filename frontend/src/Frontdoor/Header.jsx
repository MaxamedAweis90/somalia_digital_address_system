import { useState } from "react";
import Logo from "./Logo.jsx";

const NAV_LINKS = ["Platform", "Coverage", "Pricing", "Docs", "Blog"];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div>
      <header className="site-header">
        <Logo />

        <nav className="links">
          {NAV_LINKS.map((link) => (
            <a key={link} href="#">
              {link}
              {link === "Platform" && <span className="caret">▾</span>}
            </a>
          ))}
        </nav>

        <div className="nav-right">
          <a href="#" className="login">Log in</a>
          <a href="#" className="btn-primary">Get Started</a>
        </div>

        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" stroke="#16233A" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" stroke="#16233A" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </header>

      {menuOpen && (
        <nav className="mobile-nav" style={{ display: "flex" }}>
          {NAV_LINKS.map((link) => (
            <a key={link} href="#">{link}</a>
          ))}
          <div className="mobile-actions">
            <a href="#">Log in</a>
            <a href="#" className="btn-primary" style={{ justifyContent: "center" }}>Get Started</a>
          </div>
        </nav>
      )}
    </div>
  );
}