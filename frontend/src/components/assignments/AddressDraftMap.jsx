import { useEffect, useRef } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@/lib/leafletSetup";
import {
  DEFAULT_ZOOM,
  MOGADISHU_CENTER,
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
} from "@/lib/leafletSetup";

function BoundaryLayer({ geometry, color = "#2563eb", fillOpacity = 0.12, dashArray = null }) {
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

function FitToLayers({ zoneGeometry, neighborhoodGeometry, addresses }) {
  const map = useMap();

  useEffect(() => {
    const group = L.featureGroup();

    [neighborhoodGeometry, zoneGeometry].filter(Boolean).forEach((geometry) => {
      L.geoJSON({ type: "Feature", geometry }).eachLayer((layer) => {
        group.addLayer(layer);
      });
    });

    (addresses || [])
      .filter((address) => address.latitude != null && address.longitude != null)
      .forEach((address) => {
        group.addLayer(L.marker([address.latitude, address.longitude]));
      });

    if (group.getLayers().length > 0) {
      map.fitBounds(group.getBounds(), { padding: [24, 24] });
    }
  }, [zoneGeometry, neighborhoodGeometry, addresses, map]);

  return null;
}

function MapClickHandler({ editable, onMapClick }) {
  useMapEvents({
    click(event) {
      if (!editable) return;
      onMapClick({
        latitude: Number(event.latlng.lat.toFixed(6)),
        longitude: Number(event.latlng.lng.toFixed(6)),
      });
    },
  });

  return null;
}

function DraggableMarker({ address, editable, selected, onDrag }) {
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
                onDrag({
                  latitude: Number(lat.toFixed(6)),
                  longitude: Number(lng.toFixed(6)),
                });
              },
            }
          : undefined
      }
    />
  );
}

export default function AddressDraftMap({
  zoneGeometry,
  neighborhoodGeometry = null,
  addresses = [],
  selectedClientId = null,
  onPinChange,
  editable = true,
  height = "520px",
}) {
  const selectedAddress = addresses.find((item) => item.clientId === selectedClientId);

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
          <BoundaryLayer
            geometry={neighborhoodGeometry}
            color="#64748b"
            fillOpacity={0.06}
            dashArray="6 4"
          />
          <BoundaryLayer geometry={zoneGeometry} color="#2563eb" fillOpacity={0.14} />
          <FitToLayers
            zoneGeometry={zoneGeometry}
            neighborhoodGeometry={neighborhoodGeometry}
            addresses={addresses}
          />
          {editable && (
            <MapClickHandler
              editable={editable && Boolean(selectedClientId)}
              onMapClick={onPinChange}
            />
          )}
          {addresses.map((address) => (
            <DraggableMarker
              key={address.clientId}
              address={address}
              editable={editable}
              selected={address.clientId === selectedClientId}
              onDrag={onPinChange}
            />
          ))}
        </MapContainer>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-[11px] text-ink-soft">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2 w-4 rounded-sm bg-blue-500/30 border border-blue-500" />
          Zone boundary
        </span>
        {neighborhoodGeometry && (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-4 border border-slate-500 border-dashed rounded-sm" />
            Neighborhood boundary
          </span>
        )}
        <span>
          {editable
            ? selectedClientId
              ? "Click the map or drag the marker to set GPS for the selected address."
              : "Select an address from the list to place its pin."
            : "Draft address pin locations."}
        </span>
        {selectedAddress?.latitude != null && selectedAddress?.longitude != null && (
          <span className="font-mono text-ink">
            {selectedAddress.latitude}, {selectedAddress.longitude}
          </span>
        )}
      </div>
    </div>
  );
}
