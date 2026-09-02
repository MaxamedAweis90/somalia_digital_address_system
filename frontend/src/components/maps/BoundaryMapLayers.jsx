import { useEffect } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";

export function MapBoundaryLayer({
  geometry,
  color = "#2563eb",
  fillOpacity = 0.12,
  dashArray = null,
}) {
  const map = useMap();

  useEffect(() => {
    if (!geometry) return undefined;

    const layer = L.geoJSON(
      { type: "Feature", geometry },
      {
        style: {
          color,
          weight: 2,
          fillOpacity,
          dashArray: dashArray || undefined,
        },
      }
    );

    layer.addTo(map);

    return () => {
      map.removeLayer(layer);
    };
  }, [geometry, map, color, fillOpacity, dashArray]);

  return null;
}

export function FitMapToGeometries({ geometries = [], position = null }) {
  const map = useMap();

  useEffect(() => {
    const group = L.featureGroup();

    geometries.filter(Boolean).forEach((geometry) => {
      L.geoJSON({ type: "Feature", geometry }).eachLayer((layer) => {
        group.addLayer(layer);
      });
    });

    if (position?.latitude != null && position?.longitude != null) {
      group.addLayer(L.marker([position.latitude, position.longitude]));
    }

    if (group.getLayers().length > 0) {
      map.fitBounds(group.getBounds(), { padding: [24, 24], maxZoom: 16 });
    }
  }, [geometries, position, map]);

  return null;
}
