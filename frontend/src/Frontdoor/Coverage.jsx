import SomaliaMap from "./SomaliaFlag";

const REGIONS = [
  "Banaadir",
  "Woqooyi Galbeed",
  "Bari",
  "Lower Shabelle",
  "Gedo",
  "Bay",
  "Nugaal",
  "+11 more",
];

export default function Coverage() {
  return (
    <section className="map-signature">
      <div className="map-signature-inner">
        <div className="grain"></div>
        <div className="map-sig-inner">
          <div>
            <div className="kicker" style={{ color: "#8FC7FF" }}>
              Coverage
            </div>
            <h2>All 18 regions, one addressing grid</h2>
            <p>
              From the coast of Bosaso to the Jubba valley, Cinwaan lays a single grid over
              Somalia so an address in Garowe means exactly as much as one in Baidoa.
            </p>
            <div className="region-list">
              {REGIONS.map((r) => (
                <span className="region-pill" key={r}>
                  {r}
                </span>
              ))}
            </div>
          </div>
          <div style={{ aspectRatio: "1 / 1.05" }}>
            <SomaliaMap />
          </div>
        </div>
      </div>
    </section>
  );
}
