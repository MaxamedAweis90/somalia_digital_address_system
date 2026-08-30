import { useEffect, useRef } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "@/lib/leafletSetup";
import {
  DEFAULT_ZOOM,
  MOGADISHU_CENTER,
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
} from "@/lib/leafletSetup";

function MapClickHandler({ onChange }) {
  useMapEvents({
    click(event) {
      onChange({
        latitude: Number(event.latlng.lat.toFixed(6)),
        longitude: Number(event.latlng.lng.toFixed(6)),
      });
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
}) {
  const markerRef = useRef(null);
  const center = position
    ? [position.latitude, position.longitude]
    : MOGADISHU_CENTER;

  return (
    <div className="space-y-2">
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
          {!readOnly && <MapClickHandler onChange={onChange} />}
          <FitToPosition position={position} />

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
                        onChange({
                          latitude: Number(lat.toFixed(6)),
                          longitude: Number(lng.toFixed(6)),
                        });
                      },
                    }
              }
            />
          )}
        </MapContainer>
      </div>

      <p className="text-[11px] text-ink-soft">
        {readOnly
          ? "Registered GPS location for this address."
          : "Click the map to place the property pin, or drag the marker to adjust GPS coordinates."}
      </p>
    </div>
  );
}
