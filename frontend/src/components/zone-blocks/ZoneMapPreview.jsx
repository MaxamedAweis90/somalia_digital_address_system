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

function FitBounds({ geometry, zoneBlocks = [] }) {
  const map = useMap();

  useEffect(() => {
    const group = L.geoJSON({
      type: "Feature",
      geometry,
    });

    zoneBlocks.filter((zoneBlock) => zoneBlock.geometry).forEach((zoneBlock) => {
      L.geoJSON({
        type: "Feature",
        geometry: zoneBlock.geometry,
      }).eachLayer((layer) => group.addLayer(layer));
    });

    if (group.getLayers().length > 0) {
      map.fitBounds(group.getBounds(), { padding: [28, 28] });
    }
  }, [geometry, zoneBlocks, map]);

  return null;
}

export default function ZoneMapPreview({
  geometry,
  parentGeometry = null,
  zoneBlocks = [],
  height = "460px",
}) {
  const firstBlockGeometry = zoneBlocks.find((zoneBlock) => zoneBlock.geometry)?.geometry;
  const baseGeometry = geometry || parentGeometry || firstBlockGeometry;

  if (!baseGeometry) {
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
        {baseGeometry && (
          <GeoJSON
            data={{ type: "Feature", geometry: baseGeometry }}
            style={{
              color: parentGeometry ? "#64748b" : "#0F2B4D",
              weight: 2,
              fillColor: parentGeometry ? "#94a3b8" : "#1D4ED8",
              fillOpacity: parentGeometry ? 0.06 : 0.22,
              dashArray: parentGeometry ? "6 4" : undefined,
            }}
          />
        )}
        {parentGeometry && geometry && (
          <GeoJSON
            data={{ type: "Feature", geometry }}
            style={{
              color: "#1D4ED8",
              weight: 3,
              fillColor: "#3B82F6",
              fillOpacity: 0.25,
            }}
          />
        )}
        {zoneBlocks.map((zoneBlock, index) =>
          zoneBlock.geometry ? (
            <GeoJSON
              key={zoneBlock.id || zoneBlock.code || index}
              data={{ type: "Feature", geometry: zoneBlock.geometry }}
              style={{
                color: "#1D4ED8",
                weight: 2,
                fillColor: "#60A5FA",
                fillOpacity: 0.28,
              }}
            />
          ) : null
        )}
        <FitBounds geometry={baseGeometry} zoneBlocks={zoneBlocks} />
      </MapContainer>
    </div>
  );
}
