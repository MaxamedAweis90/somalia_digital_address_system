const FEATURES = [
  {
    bg: "#E9F1FC",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2C7 2 4 5.5 4 10c0 6 8 12 8 12s8-6 8-12c0-4.5-3-8-8-8z"
          stroke="#4189DD"
          strokeWidth="1.8"
        />
        <circle cx="12" cy="10" r="2.6" fill="#4189DD" />
      </svg>
    ),
    title: "A code, not a description",
    body: 'No more "blue gate past the qat market." A cinwaan code is precise to a few metres and short enough to read over a phone call.',
  },
  {
    bg: "#E6F5F3",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 17l4-8 4 5 3-4 5 9"
          stroke="#1FA69B"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Built for weak connections",
    body: "Every address resolves over USSD and SMS as well as the API, so it works in the neighbourhoods where data coverage is thinnest.",
  },
  {
    bg: "#FCF3E4",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="16" rx="2" stroke="#D98C4A" strokeWidth="1.8" />
        <path d="M3 9h18" stroke="#D98C4A" strokeWidth="1.8" />
      </svg>
    ),
    title: "One API, every partner",
    body: "Delivery apps, banks, and government registries all read the same address — issue it once through Cinwaan, use it everywhere.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Share your location",
    body: "Open the app or dial the USSD code to drop a pin on your compound, shop, or gate.",
  },
  {
    num: "02",
    title: "Get your cinwaan",
    body: "A short code is generated instantly and linked to the exact coordinate.",
  },
  {
    num: "03",
    title: "Share it anywhere",
    body: "Give it to a courier, a bank, or a friend — it resolves the same way every time.",
  },
];

export default function Features() {
  return (
    <section className="section">
      <div className="section-head">
        <div className="kicker">Why cinwaan</div>
        <h2>
          Somalia grew a generation without formal addresses. We're not waiting for street
          signs to catch up.
        </h2>
        <p>
          Cinwaan generates a short, shareable code for any point on the map — a shop, a
          compound, a water point — and keeps it tied to the coordinate underneath, so it
          works the same in Mogadishu, Hargeisa, or Kismayo.
        </p>
      </div>

      <div className="feature-grid">
        {FEATURES.map((f) => (
          <div className="feature-card" key={f.title}>
            <div className="ico" style={{ background: f.bg }}>
              {f.icon}
            </div>
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </div>
        ))}
      </div>

      <div className="steps">
        {STEPS.map((s) => (
          <div className="step" key={s.num}>
            <div className="num">{s.num}</div>
            <h4>{s.title}</h4>
            <p>{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
