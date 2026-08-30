import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import "leaflet/dist/leaflet.css";
import "@/lib/leafletSetup";
import {
  DEFAULT_ZOOM,
  MOGADISHU_CENTER,
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
} from "@/lib/leafletSetup";

function MapDrawHandler({ geometry, onChange, editable }) {
  const map = useMap();
  const layerRef = useRef(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!editable) return undefined;

    map.pm.addControls({
      position: "topright",
      drawCircle: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawRectangle: true,
      drawPolygon: true,
      drawMarker: false,
      drawText: false,
      cutPolygon: false,
      rotateMode: false,
      editMode: true,
      dragMode: false,
      removalMode: true,
    });

    const setGeometryFromLayer = (layer) => {
      const feature = layer.toGeoJSON();
      onChange(feature.geometry);
    };

    const replaceLayer = (layer) => {
      if (layerRef.current && layerRef.current !== layer) {
        map.removeLayer(layerRef.current);
      }

      layerRef.current = layer;

      if (editable) {
        layer.pm.enable();
      }

      setGeometryFromLayer(layer);
    };

    const onCreate = (event) => {
      replaceLayer(event.layer);
    };

    const onEdit = (event) => {
      setGeometryFromLayer(event.layer);
    };

    const onRemove = () => {
      layerRef.current = null;
      onChange(null);
    };

    map.on("pm:create", onCreate);
    map.on("pm:edit", onEdit);
    map.on("pm:remove", onRemove);

    return () => {
      map.off("pm:create", onCreate);
      map.off("pm:edit", onEdit);
      map.off("pm:remove", onRemove);
      map.pm.removeControls();
    };
  }, [map, onChange, editable]);

  useEffect(() => {
    if (!geometry || loadedRef.current) return;

    const group = L.geoJSON({
      type: "Feature",
      geometry,
    });

    group.eachLayer((layer) => {
      layer.addTo(map);
      layerRef.current = layer;

      if (editable) {
        layer.pm.enable();
      }
    });

    if (group.getLayers().length > 0) {
      map.fitBounds(group.getBounds(), { padding: [24, 24] });
    }

    loadedRef.current = true;
  }, [geometry, map, editable]);

  return null;
}

export default function ZoneMapEditor({
  geometry,
  onChange,
  editable = true,
  height = "420px",
}) {
  return (
    <div className="space-y-2">
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
          <MapDrawHandler
            geometry={geometry}
            onChange={onChange}
            editable={editable}
          />
        </MapContainer>
      </div>

      <p className="text-[11px] text-ink-soft">
        {editable
          ? "Use the map tools to draw a zone boundary polygon. One polygon per zone."
          : "Zone boundary preview."}
      </p>
    </div>
  );
}
