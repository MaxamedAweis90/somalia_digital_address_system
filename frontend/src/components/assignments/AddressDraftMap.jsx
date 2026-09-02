import { useMemo, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "@/lib/leafletSetup";
import {
  DEFAULT_ZOOM,
  MOGADISHU_CENTER,
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
} from "@/lib/leafletSetup";
import { formatCoordinates, hasValidCoordinates, isPointInGeometry } from "@/utils/geojson";
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
  onSelect,
}) {
  const markerRef = useRef(null);

  if (!hasValidCoordinates(address.latitude, address.longitude)) {
    return null;
  }

  return (
    <Marker
      ref={markerRef}
      position={[address.latitude, address.longitude]}
      draggable={editable && selected}
      eventHandlers={{
        click: () => onSelect?.(address.clientId),
        ...(editable && selected
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
          : {}),
      }}
    />
  );
}

function SubmittedAddressCoordinatesTable({
  addresses,
  selectedClientId,
  onSelect,
}) {
  if (!addresses.length) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-line bg-[#FBFCFE]">
            <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
              #
            </th>
            <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
              Street
            </th>
            <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
              Latitude
            </th>
            <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
              Longitude
            </th>
            <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
              Coordinates
            </th>
          </tr>
        </thead>
        <tbody>
          {addresses.map((address, index) => {
            const selected = address.clientId === selectedClientId;

            return (
              <tr
                key={address.clientId}
                className={`border-b border-line last:border-b-0 cursor-pointer transition-colors ${
                  selected ? "bg-blue/5" : "hover:bg-bg"
                }`}
                onClick={() => onSelect?.(address.clientId)}
              >
                <td className="px-3 py-2.5 text-[12px] font-semibold text-ink">{index + 1}</td>
                <td className="px-3 py-2.5 text-[12px] text-ink">
                  {address.streetName || `Address ${index + 1}`}
                </td>
                <td className="px-3 py-2.5 font-mono text-[11px] text-ink">
                  {address.latitude != null ? Number(address.latitude).toFixed(6) : "—"}
                </td>
                <td className="px-3 py-2.5 font-mono text-[11px] text-ink">
                  {address.longitude != null ? Number(address.longitude).toFixed(6) : "—"}
                </td>
                <td className="px-3 py-2.5 font-mono text-[11px] text-ink-soft">
                  {formatCoordinates(address.latitude, address.longitude)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function AddressDraftMap({
  zoneBlockGeometry,
  zoneBlockGeometries = [],
  zoneGeometry = null,
  addresses = [],
  selectedClientId = null,
  onPinChange,
  onSelectAddress,
  editable = true,
  height = "520px",
}) {
  const [boundaryMessage, setBoundaryMessage] = useState(null);
  const selectedAddress = addresses.find((item) => item.clientId === selectedClientId);

  const blockGeometries = useMemo(() => {
    if (zoneBlockGeometries.length) {
      return zoneBlockGeometries.map((block) => block.geometry).filter(Boolean);
    }

    return zoneBlockGeometry ? [zoneBlockGeometry] : [];
  }, [zoneBlockGeometries, zoneBlockGeometry]);

  const primaryBoundaryGeometry = blockGeometries[0] || null;

  const addressPositions = useMemo(
    () =>
      addresses.filter((address) =>
        hasValidCoordinates(address.latitude, address.longitude)
      ),
    [addresses]
  );

  const handlePinChange = (coords) => {
    setBoundaryMessage(null);
    onPinChange(coords);
  };

  return (
    <div className="space-y-3">
      <div
        className="rounded-lg overflow-hidden border border-line shadow-xs relative z-0"
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
          {blockGeometries.map((geometry, index) => (
            <MapBoundaryLayer
              key={`zone-block-${index}`}
              geometry={geometry}
              color="#2563eb"
              fillOpacity={0.14}
            />
          ))}
          <FitMapToGeometries
            geometries={[zoneGeometry, ...blockGeometries]}
            position={
              selectedAddress && hasValidCoordinates(
                selectedAddress.latitude,
                selectedAddress.longitude
              )
                ? {
                    latitude: selectedAddress.latitude,
                    longitude: selectedAddress.longitude,
                  }
                : null
            }
            positions={!editable ? addressPositions : []}
          />
          {editable && (
            <MapClickHandler
              editable={editable && Boolean(selectedClientId)}
              onMapClick={handlePinChange}
              boundaryGeometry={primaryBoundaryGeometry}
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
              boundaryGeometry={primaryBoundaryGeometry}
              onBoundaryViolation={setBoundaryMessage}
              onSelect={onSelectAddress}
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
            : `${addressPositions.length} submitted pin${addressPositions.length === 1 ? "" : "s"} shown on the map.`}
        </span>
        {selectedAddress && hasValidCoordinates(selectedAddress.latitude, selectedAddress.longitude) && (
          <span className="font-mono text-ink">
            Selected: {formatCoordinates(selectedAddress.latitude, selectedAddress.longitude)}
          </span>
        )}
      </div>

      {!editable && addresses.length > 0 && (
        <SubmittedAddressCoordinatesTable
          addresses={addresses}
          selectedClientId={selectedClientId}
          onSelect={onSelectAddress}
        />
      )}

      {boundaryMessage && (
        <p className="text-[11px] text-red-600 font-medium">{boundaryMessage}</p>
      )}
    </div>
  );
}
