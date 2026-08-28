import SomaliaMap from "./SomaliaFlag";

export default function Hero() {
  return (
    <>
      {/* ── Hero text block ── */}
      <section className="hero">
        <h1>
          Every home in Somalia,<br />
          from GPS point to <span className="accent">cinwaan</span>
        </h1>
        <p className="sub">
          Give couriers, banks, and government services a real address to work with — even
          where streets have no names. One free API turns any coordinate into a short,
          memorable digital address, built for Somalia's mobile-first cities.
        </p>

        <div className="checks">
          <div className="item">
            <svg className="check-icon" viewBox="0 0 24 24" fill="none">
              <path d="M4 12.5L9.5 18L20 6" stroke="#1FA69B" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Works without street names
          </div>
          <div className="item">
            <svg className="check-icon" viewBox="0 0 24 24" fill="none">
              <path d="M4 12.5L9.5 18L20 6" stroke="#F6C453" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Free lookup for every developer
          </div>
          <div className="item">
            <svg className="check-icon" viewBox="0 0 24 24" fill="none">
              <path d="M4 12.5L9.5 18L20 6" stroke="#4189DD" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Works offline over SMS
          </div>
        </div>

        <div className="cta-row">
          <a href="#" className="btn-primary">Get your address free</a>
          <a href="#" className="btn-secondary">See how it works</a>
        </div>

        <div className="stats">
          <span>Trusted by <b>140,000+</b> households</span>
          <span className="dot">·</span>
          <span><b>18</b> of 18 regions mapped</span>
          <span className="dot">·</span>
          <span><b>620+</b> businesses integrated</span>
        </div>
      </section>

      {/* ── Console mockup ── */}
      <div className="console-wrap">
        <div className="glow"></div>
        <div className="console">
          {/* Window chrome */}
          <div className="console-bar">
            <div className="dots">
              <span></span><span></span><span></span>
            </div>
            <div className="url">console.cinwaan.so</div>
          </div>

          {/* Body */}
          <div className="console-body">
            {/* Sidebar */}
            <div className="console-side">
              <div className="side-item active">
                <svg className="dot16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="8" height="8" rx="2" fill="#4189DD" />
                  <rect x="13" y="3" width="8" height="8" rx="2" fill="#1FA69B" />
                  <rect x="3" y="13" width="8" height="8" rx="2" fill="#F6C453" />
                  <rect x="13" y="13" width="8" height="8" rx="2" fill="#E3E8EF" />
                </svg>
                Address lookup
              </div>
              <div className="side-item">
                <svg className="dot16" viewBox="0 0 24 24" fill="none">
                  <path d="M4 6h16M4 12h16M4 18h10" stroke="#8CA0BE" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Regions
              </div>
              <div className="side-item">
                <svg className="dot16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="8" stroke="#8CA0BE" strokeWidth="2" />
                </svg>
                API keys
              </div>
              <div className="side-item">
                <svg className="dot16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2l7 4v6c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-4z" stroke="#8CA0BE" strokeWidth="2" />
                </svg>
                Verification
              </div>
            </div>

            {/* Main panel */}
            <div className="console-main">
              <div className="eyebrow">📍 GET STARTED</div>
              <h3>Drop a pin, get a real address</h3>
              <div className="map-panel">
                {/* Somalia map */}
                <div className="map-box">
                  <SomaliaMap />
                </div>
                {/* Address details */}
                <div className="addr-box">
                  <div>
                    <div className="addr-label">Digital address</div>
                    <div className="addr-code">MQD-4X7-A2K</div>
                  </div>
                  <div className="addr-row">
                    <span>Region</span>
                    <b>Banaadir</b>
                  </div>
                  <div className="addr-row">
                    <span>District</span>
                    <b>Hodan</b>
                  </div>
                  <div className="addr-row">
                    <span>Coordinates</span>
                    <b>2.04°N, 45.31°E</b>
                  </div>
                  <div className="addr-row">
                    <span>Status</span>
                    <b style={{ color: "#1FA69B" }}>Verified</b>
                  </div>
                  <button className="btn-mini">Share this address</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
