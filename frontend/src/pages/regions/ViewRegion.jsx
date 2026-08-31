import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getRegionById } from "@/api/regionApi";

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
        {label}
      </p>
      <p className="mt-1 text-[13px] font-medium text-ink">{value || "—"}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const isActive = (status || "ACTIVE").toUpperCase() === "ACTIVE";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        isActive
          ? "border border-green-100 bg-green-50 text-green-600"
          : "border border-gray-200 bg-gray-100 text-gray-500"
      }`}
    >
      <span
        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
          isActive ? "bg-green-500" : "bg-gray-400"
        }`}
      />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-line bg-bg px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
        {label}
      </p>
      <p className="mt-1 text-[22px] font-semibold text-ink">{value}</p>
    </div>
  );
}

export default function ViewRegion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRegion = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getRegionById(id);
        setRegion(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load region details");
      } finally {
        setLoading(false);
      }
    };

    if (id) loadRegion();
  }, [id]);

  const totals = useMemo(() => {
    const districts = region?.districts || [];
    const zones = districts.flatMap((district) => district.zones || []);
    const zoneBlocks = zones.flatMap((zone) => zone.zoneBlocks || []);
    const addresses = zoneBlocks.flatMap((zoneBlock) => zoneBlock.addresses || []);

    return {
      districts: districts.length,
      zones: zones.length,
      zoneBlocks: zoneBlocks.length,
      addresses: addresses.length,
    };
  }, [region]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-deep" />
          <p className="text-[13px] text-ink-soft">Loading region details...</p>
        </div>
      </div>
    );
  }

  if (error || !region) {
    return (
      <div className="min-h-screen bg-bg px-4 pt-5 sm:px-6 lg:px-5">
        <div className="max-w-[900px] rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error || "Region not found"}
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin/regions")}
          className="mt-4 h-[36px] rounded-lg border border-line bg-white px-4 text-[12px] font-semibold text-ink-soft hover:bg-bg cursor-pointer"
        >
          Back to Regions
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg font-sans">
      <div className="px-4 pb-10 pt-5 sm:px-6 lg:px-5">
        <div className="mb-6 flex items-center gap-2 text-[11px] font-medium text-ink-soft">
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="hover:text-blue cursor-pointer"
          >
            Dashboard
          </button>
          <span className="text-gray-400">›</span>
          <button
            type="button"
            onClick={() => navigate("/admin/regions")}
            className="hover:text-blue cursor-pointer"
          >
            Regions
          </button>
          <span className="text-gray-400">›</span>
          <span className="font-semibold text-ink">Region Details</span>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-[25px] font-semibold tracking-tight text-ink">
              {region.name}
            </h1>
            <p className="mt-1 text-[13px] text-ink-soft">
              Region information and all administrative data registered under it.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => navigate("/admin/regions")}
              className="h-[36px] rounded-lg border border-line bg-white px-4 text-[12px] font-semibold text-ink-soft hover:bg-bg cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => navigate(`/admin/regions/edit/${region.id}`)}
              className="h-[36px] rounded-lg bg-blue-deep px-5 text-[12px] font-semibold text-white shadow-cta hover:bg-[#0F2B4D] cursor-pointer"
            >
              Edit Region
            </button>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <Metric label="Districts" value={totals.districts} />
          <Metric label="Zones" value={totals.zones} />
          <Metric label="Zone Blocks" value={totals.zoneBlocks} />
          <Metric label="Addresses" value={totals.addresses} />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[320px_1fr]">
          <div className="h-fit overflow-hidden rounded-xl border border-line bg-white shadow-card-sm">
            <div className="border-b border-line px-5 py-5">
              <h2 className="text-[18px] font-semibold text-ink">Region Information</h2>
              <p className="mt-1 text-[13px] text-ink-soft">
                Official registry metadata for this region.
              </p>
            </div>
            <div className="space-y-5 px-5 py-5">
              <DetailItem label="Region Name" value={region.name} />
              <DetailItem label="Region Code" value={region.code} />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                  Status
                </p>
                <div className="mt-2">
                  <StatusBadge status={region.status} />
                </div>
              </div>
              <DetailItem
                label="Created"
                value={region.createdAt ? new Date(region.createdAt).toLocaleString() : null}
              />
              <DetailItem
                label="Last Updated"
                value={region.updatedAt ? new Date(region.updatedAt).toLocaleString() : null}
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-line bg-white shadow-card-sm">
            <div className="border-b border-line px-5 py-5">
              <h2 className="text-[18px] font-semibold text-ink">
                Administrative Data
              </h2>
              <p className="mt-1 text-[13px] text-ink-soft">
                Districts, zones, zone blocks, and registered addresses under {region.name}.
              </p>
            </div>

            <div className="space-y-4 p-5">
              {region.districts?.length > 0 ? (
                region.districts.map((district) => (
                  <div key={district.id} className="rounded-xl border border-line">
                    <div className="flex flex-col gap-2 border-b border-line bg-[#FBFCFE] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[14px] font-semibold text-ink">
                          {district.name}
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] text-ink-soft">
                          {district.code}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-ink-soft">
                          {district._count?.zones ?? district.zones?.length ?? 0} zones
                        </span>
                        <StatusBadge status={district.status} />
                      </div>
                    </div>

                    <div className="space-y-3 p-4">
                      {district.zones?.length > 0 ? (
                        district.zones.map((zone) => (
                          <div key={zone.id} className="rounded-lg border border-line bg-white">
                            <div className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-[13px] font-semibold text-ink">{zone.name}</p>
                                <p className="mt-0.5 font-mono text-[11px] text-ink-soft">
                                  {zone.code}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[11px] text-ink-soft">
                                  {zone._count?.zoneBlocks ?? zone.zoneBlocks?.length ?? 0} blocks
                                </span>
                                <StatusBadge status={zone.status} />
                              </div>
                            </div>

                            <div className="border-t border-line bg-bg p-3">
                              {zone.zoneBlocks?.length > 0 ? (
                                <div className="space-y-3">
                                  {zone.zoneBlocks.map((zoneBlock) => (
                                    <div key={zoneBlock.id} className="rounded-lg border border-line bg-white">
                                      <div className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                          <p className="text-[12px] font-semibold text-ink">
                                            {zoneBlock.name}
                                          </p>
                                          <p className="mt-0.5 font-mono text-[10px] text-ink-soft">
                                            {zoneBlock.code}
                                          </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <span className="text-[11px] text-ink-soft">
                                            {zoneBlock._count?.addresses ??
                                              zoneBlock.addresses?.length ??
                                              0}{" "}
                                            addresses
                                          </span>
                                          <StatusBadge status={zoneBlock.status} />
                                        </div>
                                      </div>

                                      {zoneBlock.addresses?.length > 0 ? (
                                        <div className="overflow-x-auto border-t border-line">
                                          <table className="w-full border-collapse text-left">
                                            <thead>
                                              <tr className="border-b border-line bg-[#FBFCFE]">
                                                <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                                                  DAC
                                                </th>
                                                <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                                                  Street
                                                </th>
                                                <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                                                  Status
                                                </th>
                                                <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                                                  Action
                                                </th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {zoneBlock.addresses.map((address) => (
                                                <tr key={address.id} className="border-b border-line last:border-b-0">
                                                  <td className="px-3 py-2 font-mono text-[11px] font-semibold text-blue-deep">
                                                    {address.addressCode}
                                                  </td>
                                                  <td className="px-3 py-2 text-[11px] text-ink">
                                                    {address.streetName || "—"}
                                                  </td>
                                                  <td className="px-3 py-2">
                                                    <StatusBadge status={address.status} />
                                                  </td>
                                                  <td className="px-3 py-2 text-right">
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        navigate(`/admin/addresses/view/${address.id}`)
                                                      }
                                                      className="text-[11px] font-semibold text-blue-deep hover:text-blue cursor-pointer"
                                                    >
                                                      View
                                                    </button>
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      ) : (
                                        <p className="border-t border-line px-3 py-3 text-[11px] text-ink-soft">
                                          No addresses registered in this zone block.
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[11px] text-ink-soft">
                                  No zone blocks have been added to this zone.
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-[12px] text-ink-soft">
                          No zones have been added to this district.
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-line px-4 py-10 text-center">
                  <p className="text-[13px] font-medium text-ink">
                    No districts have been added to this region.
                  </p>
                  <p className="mt-1 text-[12px] text-ink-soft">
                    Add a district to start building this region&apos;s administrative hierarchy.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
