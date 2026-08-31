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
  boundaryGeometry = null,
  boundaryLabel = "Zone boundary",
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
          <BoundaryLayer geometry={boundaryGeometry} />
          <FitToGeometries geometries={[boundaryGeometry, geometry]} />
          <MapDrawHandler
            geometry={geometry}
            onChange={onChange}
            editable={editable}
          />
        </MapContainer>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-[11px] text-ink-soft">
        <p>
          {editable
            ? "Use the map tools to draw a zone boundary polygon. One polygon per zone."
            : "Zone boundary preview."}
        </p>
        {boundaryGeometry && (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-4 border border-slate-500 border-dashed rounded-sm" />
            {boundaryLabel}
          </span>
        )}
      </div>
    </div>
  );
}
