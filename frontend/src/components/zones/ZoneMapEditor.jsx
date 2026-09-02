import { useEffect, useRef, useState } from "react";
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
import { isPolygonWithinGeometry } from "@/utils/geojson";

const BOUNDARY_VIOLATION_MESSAGE =
  "Zone boundary must stay inside the selected district boundary.";

function BoundaryLayer({ geometry, color = "#64748b", fillOpacity = 0.08 }) {
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
          dashArray: "6 4",
        },
      }
    );

    layer.addTo(map);

    return () => {
      map.removeLayer(layer);
    };
  }, [geometry, map, color, fillOpacity]);

  return null;
}

function FitToGeometries({ geometries }) {
  const map = useMap();

  useEffect(() => {
    const valid = (geometries || []).filter(Boolean);
    if (!valid.length) return;

    const group = L.featureGroup();
    valid.forEach((geometry) => {
      L.geoJSON({ type: "Feature", geometry }).eachLayer((layer) => {
        group.addLayer(layer);
      });
    });

    if (group.getLayers().length > 0) {
      map.fitBounds(group.getBounds(), { padding: [24, 24] });
    }
  }, [geometries, map]);

  return null;
}

function mountGeometryLayer(map, layerRef, geometry, editable) {
  if (layerRef.current) {
    map.removeLayer(layerRef.current);
    layerRef.current = null;
  }

  if (!geometry) {
    return;
  }

  L.geoJSON({ type: "Feature", geometry }).eachLayer((layer) => {
    layer.addTo(map);
    layerRef.current = layer;
    if (editable) {
      layer.pm.enable();
    }
  });
}

function MapDrawHandler({
  geometry,
  onChange,
  editable,
  boundaryGeometry,
  onBoundaryViolation,
}) {
  const map = useMap();
  const layerRef = useRef(null);
  const loadedRef = useRef(false);
  const lastValidGeometryRef = useRef(geometry);

  useEffect(() => {
    lastValidGeometryRef.current = geometry;
  }, [geometry]);

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

    const applyLayer = (layer) => {
      const nextGeometry = layer.toGeoJSON().geometry;

      if (
        boundaryGeometry &&
        !isPolygonWithinGeometry(nextGeometry, boundaryGeometry)
      ) {
        onBoundaryViolation?.(BOUNDARY_VIOLATION_MESSAGE);
        map.removeLayer(layer);
        mountGeometryLayer(map, layerRef, lastValidGeometryRef.current, editable);
        return;
      }

      if (layerRef.current && layerRef.current !== layer) {
        map.removeLayer(layerRef.current);
      }

      layerRef.current = layer;

      if (editable) {
        layer.pm.enable();
      }

      lastValidGeometryRef.current = nextGeometry;
      onChange(nextGeometry);
    };

    const onCreate = (event) => {
      applyLayer(event.layer);
    };

    const onEdit = (event) => {
      applyLayer(event.layer);
    };

    const onRemove = () => {
      layerRef.current = null;
      lastValidGeometryRef.current = null;
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
  }, [map, onChange, editable, boundaryGeometry, onBoundaryViolation]);

  useEffect(() => {
    if (!geometry || loadedRef.current) return;

    mountGeometryLayer(map, layerRef, geometry, editable);
    lastValidGeometryRef.current = geometry;

    if (layerRef.current) {
      map.fitBounds(layerRef.current.getBounds(), { padding: [24, 24] });
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
  boundaryGeometry = null,
  boundaryLabel = "Zone boundary",
}) {
  const [boundaryMessage, setBoundaryMessage] = useState(null);

  const handleGeometryChange = (nextGeometry) => {
    setBoundaryMessage(null);
    onChange(nextGeometry);
  };

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
          <BoundaryLayer geometry={boundaryGeometry} />
          <FitToGeometries geometries={[boundaryGeometry, geometry]} />
          <MapDrawHandler
            geometry={geometry}
            onChange={handleGeometryChange}
            editable={editable}
            boundaryGeometry={boundaryGeometry}
            onBoundaryViolation={setBoundaryMessage}
          />
        </MapContainer>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-[11px] text-ink-soft">
        <p>
          {editable
            ? boundaryGeometry
              ? "Use the map tools to draw a zone boundary inside the dashed district outline."
              : "Use the map tools to draw a zone boundary polygon. One polygon per zone."
            : "Zone boundary preview."}
        </p>
        {boundaryGeometry && (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-4 border border-slate-500 border-dashed rounded-sm" />
            {boundaryLabel}
          </span>
        )}
      </div>

      {boundaryMessage && (
        <p className="text-[11px] text-red-600 font-medium">{boundaryMessage}</p>
      )}
    </div>
  );
}
