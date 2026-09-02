import { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "@/lib/leafletSetup";
import {
  DEFAULT_ZOOM,
  MOGADISHU_CENTER,
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
} from "@/lib/leafletSetup";
import { isPointInGeometry } from "@/utils/geojson";
import { FitMapToGeometries, MapBoundaryLayer } from "@/components/maps/BoundaryMapLayers";

function MapClickHandler({ onChange, boundaryGeometry, onBoundaryViolation }) {
  useMapEvents({
    click(event) {
      const coords = {
        latitude: Number(event.latlng.lat.toFixed(6)),
        longitude: Number(event.latlng.lng.toFixed(6)),
      };

      if (
        boundaryGeometry &&
        !isPointInGeometry(boundaryGeometry, coords.latitude, coords.longitude)
      ) {
        onBoundaryViolation?.("Place the pin inside the highlighted zone block boundary.");
        return;
      }

      onChange(coords);
    },
  });

  return null;
}

function FitToPosition({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView([position.latitude, position.longitude], map.getZoom() || DEFAULT_ZOOM);
    }
  }, [position, map]);

  return null;
}

export default function LocationMapPicker({
  position,
  onChange,
  height = "360px",
  readOnly = false,
  zoneBlockGeometry = null,
  zoneGeometry = null,
  zoneBlockLabel = null,
}) {
  const markerRef = useRef(null);
  const [boundaryMessage, setBoundaryMessage] = useState(null);
  const center = position
    ? [position.latitude, position.longitude]
    : MOGADISHU_CENTER;
  const hasBoundary = Boolean(zoneBlockGeometry);

  const handlePositionChange = (coords) => {
    setBoundaryMessage(null);
    onChange(coords);
  };

  const handleBoundaryViolation = (message) => {
    setBoundaryMessage(message);
  };

  return (
    <div className="space-y-2">
      {zoneBlockLabel && (
        <p className="text-[12px] font-medium text-ink">
          Selected zone block: <span className="font-semibold">{zoneBlockLabel}</span>
        </p>
      )}

      <div
        className="rounded-lg overflow-hidden border border-line shadow-xs"
        style={{ height }}
      >
        <MapContainer
          center={center}
          zoom={DEFAULT_ZOOM}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
        >
          <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
          <MapBoundaryLayer
            geometry={zoneGeometry}
            color="#64748b"
            fillOpacity={0.06}
            dashArray="6 4"
          />
          <MapBoundaryLayer
            geometry={zoneBlockGeometry}
            color="#2563eb"
            fillOpacity={0.14}
          />
          <FitMapToGeometries
            geometries={[zoneGeometry, zoneBlockGeometry]}
            position={position}
          />
          {!readOnly && (
            <MapClickHandler
              onChange={handlePositionChange}
              boundaryGeometry={zoneBlockGeometry}
              onBoundaryViolation={handleBoundaryViolation}
            />
          )}
          {!hasBoundary && !readOnly && <FitToPosition position={position} />}
          {readOnly && <FitToPosition position={position} />}

          {position && (
            <Marker
              ref={markerRef}
              position={[position.latitude, position.longitude]}
              draggable={!readOnly}
              eventHandlers={
                readOnly
                  ? undefined
                  : {
                      dragend() {
                        const marker = markerRef.current;
                        if (!marker) return;
                        const { lat, lng } = marker.getLatLng();
                        const coords = {
                          latitude: Number(lat.toFixed(6)),
                          longitude: Number(lng.toFixed(6)),
                        };

                        if (
                          zoneBlockGeometry &&
                          !isPointInGeometry(
                            zoneBlockGeometry,
                            coords.latitude,
                            coords.longitude
                          )
                        ) {
                          marker.setLatLng([position.latitude, position.longitude]);
                          handleBoundaryViolation(
                            "Drag the pin inside the highlighted zone block boundary."
                          );
                          return;
                        }

                        handlePositionChange(coords);
                      },
                    }
              }
            />
          )}
        </MapContainer>
      </div>

      {hasBoundary && (
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-4 rounded-sm bg-blue-500/30 border border-blue-500" />
            Zone block boundary
          </span>
          {zoneGeometry && (
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2 w-4 border border-slate-500 border-dashed rounded-sm" />
              Zone boundary
            </span>
          )}
        </div>
      )}

      <p className="text-[11px] text-ink-soft">
        {readOnly
          ? "Registered GPS location for this address."
          : hasBoundary
            ? "Click inside the blue zone block boundary to place the property pin, or drag the marker to adjust."
            : "Click the map to place the property pin, or drag the marker to adjust GPS coordinates."}
      </p>

      {boundaryMessage && (
        <p className="text-[11px] text-red-600 font-medium">{boundaryMessage}</p>
      )}
    </div>
  );
}
