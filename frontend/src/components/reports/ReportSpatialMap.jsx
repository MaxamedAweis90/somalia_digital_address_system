import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@/lib/leafletSetup";
import {
  DEFAULT_ZOOM,
  MOGADISHU_CENTER,
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
} from "@/lib/leafletSetup";

function FitPoints({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points?.length) return;

    const bounds = L.latLngBounds(
      points.map((p) => [p.latitude, p.longitude])
    );

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [24, 24], maxZoom: 15 });
    }
  }, [points, map]);

  return null;
}

export default function ReportSpatialMap({ points = [], height = "260px" }) {
  if (!points.length) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-line bg-bg text-xs text-ink-soft"
        style={{ height }}
      >
        No GPS points to display for current filters.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line" style={{ height }}>
      <MapContainer
        center={MOGADISHU_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        scrollWheelZoom={false}
      >
        <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} />
        <FitPoints points={points} />
        {points.map((point) => (
          <Marker
            key={point.id}
            position={[point.latitude, point.longitude]}
            opacity={point.status === "OUT_OF_BOUNDS" ? 0.7 : 1}
          >
            <Popup>
              <div className="text-xs space-y-1 min-w-[140px]">
                <p className="font-semibold font-mono">{point.addressCode}</p>
                {point.streetName && <p>{point.streetName}</p>}
                <p className="text-ink-soft">
                  {point.districtName} / {point.zoneName}
                </p>
                <p
                  className={
                    point.status === "OUT_OF_BOUNDS"
                      ? "text-red-600 font-semibold"
                      : "text-emerald-700 font-semibold"
                  }
                >
                  {point.status === "OUT_OF_BOUNDS" ? "Out of bounds" : "Valid"}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
