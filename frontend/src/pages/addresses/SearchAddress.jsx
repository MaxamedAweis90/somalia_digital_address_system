import { useState } from "react";
import { Search, MapPin, Building, Globe, Navigation, Search as SearchIcon } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import api from "@/api/axios"; // use axios directly for search or addressApi
import { toast } from "react-toastify";

// Helper component to recenter map
function MapUpdater({ center }) {
  const map = require("react-leaflet").useMap();
  if (center) {
    map.setView(center, 16);
  }
  return null;
}

export default function SearchAddress() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      // Assuming a generic search endpoint or we search by code/street
      const { data } = await api.get(`/address?search=${encodeURIComponent(query)}`);
      if (data?.addresses) {
        setResults(data.addresses);
      } else {
        setResults([]);
      }
    } catch (err) {
      toast.error("Failed to search addresses.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const LeafletMap = require("react-leaflet").MapContainer;
  const Tile = require("react-leaflet").TileLayer;
  const LMarker = require("react-leaflet").Marker;
  const LPopup = require("react-leaflet").Popup;
  const L = require("leaflet");

  // Fix leaflet marker icon issue
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50/50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm z-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Global Address Search</h1>
        <p className="text-sm text-gray-500 mb-4">
          Search for properties, streets, or unique SDAS address codes across Somalia.
        </p>

        <form onSubmit={handleSearch} className="max-w-3xl flex gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <SearchIcon size={18} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by SDAS code (e.g., HOD-TLX-Z01-0001) or street name..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition outline-none text-gray-800"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm flex items-center gap-2 transition disabled:opacity-70"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Results Panel */}
        <div className="w-1/3 min-w-[320px] max-w-[400px] bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Searching the registry...</div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {results.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddress(addr)}
                  className={`p-4 cursor-pointer hover:bg-blue-50 transition ${
                    selectedAddress?.id === addr.id ? "bg-blue-50 border-l-4 border-blue-600" : "border-l-4 border-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{addr.addressCode}</h3>
                      <p className="text-gray-600 text-sm mt-1">{addr.streetName} {addr.houseNumber}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {addr.status}
                    </span>
                  </div>
                  {addr.description && (
                    <p className="text-gray-500 text-xs mt-2 truncate">{addr.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : query && !loading ? (
            <div className="p-8 text-center text-gray-500">
              <MapPin className="mx-auto h-8 w-8 text-gray-300 mb-3" />
              <p>No addresses found matching "{query}"</p>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center h-full opacity-60">
              <Globe className="h-12 w-12 text-gray-300 mb-4" />
              <p>Enter a search query to locate an address.</p>
            </div>
          )}
        </div>

        {/* Map Panel */}
        <div className="flex-1 relative bg-gray-100">
          {selectedAddress ? (
            <LeafletMap 
              center={
                selectedAddress.location 
                  ? [JSON.parse(selectedAddress.location).latitude, JSON.parse(selectedAddress.location).longitude] 
                  : [2.0469, 45.3181]
              } 
              zoom={16} 
              style={{ height: "100%", width: "100%" }}
            >
              <Tile
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              {selectedAddress.location && (
                <>
                  <MapUpdater center={[JSON.parse(selectedAddress.location).latitude, JSON.parse(selectedAddress.location).longitude]} />
                  <LMarker position={[JSON.parse(selectedAddress.location).latitude, JSON.parse(selectedAddress.location).longitude]}>
                    <LPopup>
                      <strong>{selectedAddress.addressCode}</strong><br/>
                      {selectedAddress.streetName} {selectedAddress.houseNumber}
                    </LPopup>
                  </LMarker>
                </>
              )}
            </LeafletMap>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-400 flex-col bg-gray-100/80">
              <Navigation className="h-16 w-16 mb-4 text-gray-300" />
              <p className="text-lg">Select an address to view its location</p>
            </div>
          )}

          {/* Floating Address Detail Card */}
          {selectedAddress && (
            <div className="absolute bottom-6 left-6 right-6 lg:left-auto lg:w-96 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-5 z-[1000] transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Building size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">{selectedAddress.addressCode}</h3>
                  <p className="text-sm text-gray-500">Official SDAS Code</p>
                </div>
              </div>
              
              <div className="space-y-3 mt-4 text-sm">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Street</span>
                  <span className="font-medium text-gray-900">{selectedAddress.streetName || "-"}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">House No.</span>
                  <span className="font-medium text-gray-900">{selectedAddress.houseNumber || "-"}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Status</span>
                  <span className="font-medium text-blue-600">{selectedAddress.status}</span>
                </div>
                {selectedAddress.description && (
                  <div className="pt-1">
                    <span className="text-gray-500 block mb-1">Description</span>
                    <span className="text-gray-800 bg-gray-50 p-2 rounded block">{selectedAddress.description}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
