import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getAddressById } from "@/api/addressApi";
import LocationMapPicker from "@/components/addresses/LocationMapPicker";
import { formatLocationLabel, parseLocation } from "@/utils/location";

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="mt-1 text-[13px] font-medium text-ink">{value || "—"}</p>
    </div>
  );
}

export default function ViewAddress() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getAddressById(id);
        setAddress(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load address details");
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg font-sans flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-deep" />
          <p className="text-[13px] text-ink-soft">Loading address details...</p>
        </div>
      </div>
    );
  }

  if (error || !address) {
    return (
      <div className="min-h-screen bg-bg font-sans px-4 pt-5">
        <div className="max-w-[900px] rounded-lg bg-red-50 p-4 border border-red-200 text-red-700 text-sm">
          {error || "Address not found"}
        </div>
      </div>
    );
  }

  const isActive = (address.status || "ACTIVE").toUpperCase() === "ACTIVE";
  const position = parseLocation(address.location);

  return (
    <div className="min-h-screen bg-bg font-sans">
      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10">
        <div className="flex items-center gap-2 text-[11px] font-medium text-ink-soft mb-6">
          <span onClick={() => navigate("../dashboard")} className="hover:text-blue cursor-pointer">
            Dashboard
          </span>
          <span className="text-gray-400">›</span>
          <span onClick={() => navigate(-1)} className="hover:text-blue cursor-pointer">
            Addresses
          </span>
          <span className="text-gray-400">›</span>
          <span className="text-ink font-semibold">Address Details</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-[25px] font-semibold tracking-tight text-ink font-mono">
              {address.addressCode}
            </h1>
            <p className="mt-1 text-[13px] text-ink-soft">
              Official Digital Address Code (DAC) registry record.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="h-[36px] px-4 rounded-lg border border-line bg-white text-[12px] font-semibold text-ink-soft hover:bg-bg cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={() => navigate(`../edit/${address.id}`)}
              className="h-[36px] px-5 rounded-lg bg-blue-deep text-[12px] font-semibold text-white hover:bg-[#0F2B4D] shadow-cta cursor-pointer"
            >
              Edit Address
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-5">
          <div className="bg-white border border-line rounded-xl shadow-card-sm overflow-hidden h-fit">
            <div className="px-5 py-5 border-b border-line">
              <h2 className="text-[18px] font-semibold text-ink">Registry Information</h2>
            </div>

            <div className="px-5 py-5 space-y-5">
              <DetailItem label="DAC" value={address.addressCode} />
              <DetailItem label="House Number" value={address.houseNumber} />
              <DetailItem label="District" value={`${address.district?.name} (${address.district?.code})`} />
              <DetailItem
                label="Neighborhood"
                value={`${address.neighborhood?.name} (${address.neighborhood?.code})`}
              />
              <DetailItem label="Zone" value={`${address.zone?.name} (${address.zone?.code})`} />
              <DetailItem label="Street" value={address.streetName} />
              <DetailItem label="Description" value={address.description || "—"} />
              <DetailItem label="GPS Coordinates" value={formatLocationLabel(address.location)} />

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Status</p>
                <span
                  className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold ${
                    isActive
                      ? "bg-green-50 text-green-600 border border-green-100"
                      : "bg-gray-100 text-gray-500 border border-gray-200"
                  }`}
                >
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <DetailItem
                label="Registered"
                value={address.createdAt ? new Date(address.createdAt).toLocaleString() : "—"}
              />
              <DetailItem
                label="Last Updated"
                value={address.updatedAt ? new Date(address.updatedAt).toLocaleString() : "—"}
              />
            </div>
          </div>

          <div className="bg-white border border-line rounded-xl shadow-card-sm overflow-hidden">
            <div className="px-5 py-5 border-b border-line">
              <h2 className="text-[18px] font-semibold text-ink">Property Location</h2>
              <p className="mt-1 text-[13px] text-ink-soft">
                GPS pin for this registered address.
              </p>
            </div>

            <div className="p-5">
              {position ? (
                <LocationMapPicker position={position} readOnly height="520px" />
              ) : (
                <div className="h-[520px] flex items-center justify-center rounded-lg border border-line bg-bg text-[13px] text-ink-soft">
                  No GPS coordinates recorded.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
