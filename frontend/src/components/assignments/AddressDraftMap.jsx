import { useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
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

function MapClickHandler({ editable, onMapClick, boundaryGeometry, onBoundaryViolation }) {
  useMapEvents({
    click(event) {
      if (!editable) return;

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

      onMapClick(coords);
    },
  });

  return null;
}

function DraggableMarker({
  address,
  editable,
  selected,
  onDrag,
  boundaryGeometry,
  onBoundaryViolation,
}) {
  const markerRef = useRef(null);

  if (address.latitude == null || address.longitude == null) {
    return null;
  }

  return (
    <Marker
      ref={markerRef}
      position={[address.latitude, address.longitude]}
      draggable={editable && selected}
      eventHandlers={
        editable && selected
          ? {
              dragend() {
                const marker = markerRef.current;
                if (!marker) return;
                const { lat, lng } = marker.getLatLng();
                const coords = {
                  latitude: Number(lat.toFixed(6)),
                  longitude: Number(lng.toFixed(6)),
                };

                if (
                  boundaryGeometry &&
                  !isPointInGeometry(boundaryGeometry, coords.latitude, coords.longitude)
                ) {
                  marker.setLatLng([address.latitude, address.longitude]);
                  onBoundaryViolation?.(
                    "Drag the pin inside the highlighted zone block boundary."
                  );
                  return;
                }

                onDrag(coords);
              },
            }
          : undefined
      }
    />
  );
}

export default function AddressDraftMap({
  zoneBlockGeometry,
  zoneGeometry = null,
  addresses = [],
  selectedClientId = null,
  onPinChange,
  editable = true,
  height = "520px",
}) {
  const [boundaryMessage, setBoundaryMessage] = useState(null);
  const selectedAddress = addresses.find((item) => item.clientId === selectedClientId);

  const handlePinChange = (coords) => {
    setBoundaryMessage(null);
    onPinChange(coords);
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
          <MapBoundaryLayer
            geometry={zoneGeometry}
            color="#64748b"
            fillOpacity={0.06}
            dashArray="6 4"
          />
          <MapBoundaryLayer geometry={zoneBlockGeometry} color="#2563eb" fillOpacity={0.14} />
          <FitMapToGeometries
            geometries={[zoneGeometry, zoneBlockGeometry]}
            position={
              selectedAddress?.latitude != null && selectedAddress?.longitude != null
                ? {
                    latitude: selectedAddress.latitude,
                    longitude: selectedAddress.longitude,
                  }
                : null
            }
          />
          {editable && (
            <MapClickHandler
              editable={editable && Boolean(selectedClientId)}
              onMapClick={handlePinChange}
              boundaryGeometry={zoneBlockGeometry}
              onBoundaryViolation={setBoundaryMessage}
            />
          )}
          {addresses.map((address) => (
            <DraggableMarker
              key={address.clientId}
              address={address}
              editable={editable}
              selected={address.clientId === selectedClientId}
              onDrag={handlePinChange}
              boundaryGeometry={zoneBlockGeometry}
              onBoundaryViolation={setBoundaryMessage}
            />
          ))}
        </MapContainer>
      </div>

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
        <span>
          {editable
            ? selectedClientId
              ? "Click inside the blue zone block boundary or drag the marker to set GPS."
              : "Select an address from the list to place its pin."
            : "Draft address pin locations."}
        </span>
        {selectedAddress?.latitude != null && selectedAddress?.longitude != null && (
          <span className="font-mono text-ink">
            {selectedAddress.latitude}, {selectedAddress.longitude}
          </span>
        )}
      </div>

      {boundaryMessage && (
        <p className="text-[11px] text-red-600 font-medium">{boundaryMessage}</p>
      )}
    </div>
  );
}
