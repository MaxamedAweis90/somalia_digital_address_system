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

export function FitMapToGeometries({
  geometries = [],
  position = null,
  positions = [],
}) {
  const map = useMap();

  useEffect(() => {
    const group = L.featureGroup();

    geometries.filter(Boolean).forEach((geometry) => {
      L.geoJSON({ type: "Feature", geometry }).eachLayer((layer) => {
        group.addLayer(layer);
      });
    });

    const fitPositions = [
      ...(position?.latitude != null && position?.longitude != null ? [position] : []),
      ...positions.filter(
        (item) => item?.latitude != null && item?.longitude != null
      ),
    ];

    fitPositions.forEach((item) => {
      group.addLayer(L.marker([item.latitude, item.longitude]));
    });

    if (group.getLayers().length > 0) {
      map.whenReady(() => {
        map.fitBounds(group.getBounds(), { padding: [24, 24], maxZoom: 16 });
        map.invalidateSize();
      });
    }
  }, [geometries, position, positions, map]);

  return null;
}
