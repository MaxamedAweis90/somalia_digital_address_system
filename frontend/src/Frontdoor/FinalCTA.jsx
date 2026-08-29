export default function FinalCTA() {
  return (
    <section className="final-cta">
      <h2>Give your home a real address today</h2>
      <p>It takes under a minute, and it's free for every household in Somalia.</p>
      <div className="cta-row">
        <button
          className="btn-primary"
          style={{ backgroundColor: "#0056B3", borderColor: "#0056B3" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#00458F")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0056B3")}
        >
          Get your address free
        </button>
        <button
          className="btn-secondary"
          style={{ borderColor: "#0056B3", color: "#0056B3" }}
        >
          Talk to our team
        </button>
      </div>
    </section>
  );
}