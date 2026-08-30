import { useEffect } from "react";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@/lib/leafletSetup";
import {
  DEFAULT_ZOOM,
  MOGADISHU_CENTER,
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
} from "@/lib/leafletSetup";

function FitBounds({ geometry }) {
  const map = useMap();

  useEffect(() => {
    if (!geometry) return;

    const group = L.geoJSON({
      type: "Feature",
      geometry,
    });

    if (group.getLayers().length > 0) {
      map.fitBounds(group.getBounds(), { padding: [28, 28] });
    }
  }, [geometry, map]);

  return null;
}

export default function ZoneMapPreview({ geometry, height = "460px" }) {
  if (!geometry) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-line bg-bg text-[13px] text-ink-soft"
        style={{ height }}
      >
        No boundary geometry available for this zone.
      </div>
    );
  }

  return (
    <div
      className="rounded-lg overflow-hidden border border-line shadow-xs"
      style={{ height }}
    >
      <MapContainer
        center={MOGADISHU_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
        <GeoJSON
          data={{ type: "Feature", geometry }}
          style={{
            color: "#0F2B4D",
            weight: 2,
            fillColor: "#1D4ED8",
            fillOpacity: 0.22,
          }}
        />
        <FitBounds geometry={geometry} />
      </MapContainer>
    </div>
  );
}
