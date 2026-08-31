import { useEffect } from "react";
import { MapContainer, CircleMarker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "@/lib/leafletSetup";
import {
  DEFAULT_ZOOM,
  MOGADISHU_CENTER,
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
} from "@/lib/leafletSetup";

function MapBoundsUpdater({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points && points.length > 0) {
      const validPoints = points.filter(
        (p) => typeof p.latitude === "number" && typeof p.longitude === "number"
      );
      if (validPoints.length > 0) {
        const bounds = validPoints.map((p) => [p.latitude, p.longitude]);
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 16 });
      }
    }
  }, [points, map]);

  return null;
}

export default function ReportSpatialMap({ points = [], height = "320px" }) {
  return (
    <div className="space-y-2">
      <div
        className="rounded-xl overflow-hidden border border-line shadow-card-sm"
        style={{ height }}
      >
        <MapContainer
          center={MOGADISHU_CENTER}
          zoom={DEFAULT_ZOOM}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
          <MapBoundsUpdater points={points} />

          {points.map((pt) => {
            const isValid = pt.status === "VALID";
            const color = isValid ? "#10B981" : "#EF4444";

            return (
              <CircleMarker
                key={pt.id}
                center={[pt.latitude, pt.longitude]}
                radius={6}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.8,
                  color: "#FFFFFF",
                  weight: 1.5,
                }}
              >
                <Popup>
                  <div className="text-xs space-y-1 font-sans">
                    <p className="font-semibold text-ink font-mono">{pt.addressCode}</p>
                    <p className="text-ink-soft">{pt.streetName}</p>
                    <p className="text-ink-soft">
                      {pt.districtName} / {pt.zoneName}
                    </p>
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        isValid
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {pt.status}
                    </span>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      <div className="flex items-center gap-4 text-xs text-ink-soft px-1">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" />
          <span>Valid Coordinates ({points.filter((p) => p.status === "VALID").length})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500 inline-block" />
          <span>Boundary Violations ({points.filter((p) => p.status !== "VALID").length})</span>
        </div>
      </div>
    </div>
  );
}
