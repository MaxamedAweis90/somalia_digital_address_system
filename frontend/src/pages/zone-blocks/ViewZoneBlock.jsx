import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getZoneBlockById } from "@/api/zoneBlockApi";
import ZoneMapPreview from "@/components/zone-blocks/ZoneMapPreview";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/constants/roles";

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

function getVertexCount(geometry) {
  const ring = geometry?.coordinates?.[0];
  if (!Array.isArray(ring)) return 0;
  return Math.max(ring.length - 1, 0);
}

export default function ViewZoneBlock() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.SYS_ADMIN;

  const [zoneBlock, setZoneBlock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadZoneBlock = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getZoneBlockById(id);
        setZoneBlock(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load zone block details");
      } finally {
        setLoading(false);
      }
    };

    if (id) loadZoneBlock();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg font-sans flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-deep" />
          <p className="text-[13px] text-ink-soft">Loading zone block details...</p>
        </div>
      </div>
    );
  }

  if (error || !zoneBlock) {
    return (
      <div className="min-h-screen bg-bg font-sans">
        <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10">
          <div className="max-w-[900px] rounded-lg bg-red-50 p-4 border border-red-200 text-red-700 text-sm">
            {error || "Zone block not found"}
          </div>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 h-[36px] px-4 rounded-lg border border-line bg-white text-[12px] font-semibold text-ink-soft hover:bg-bg cursor-pointer"
          >
            Back to Zone Blocks
          </button>
        </div>
      </div>
    );
  }

  const isActive = (zoneBlock.status || "ACTIVE").toUpperCase() === "ACTIVE";
  const vertexCount = getVertexCount(zoneBlock.geometry);

  return (
    <div className="min-h-screen bg-bg font-sans">
      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10">
        <div className="flex items-center gap-2 text-[11px] font-medium text-ink-soft mb-6">
          <span
            onClick={() => navigate("../dashboard")}
            className="hover:text-blue cursor-pointer"
          >
            Dashboard
          </span>
          <span className="text-gray-400">›</span>
          <span
            onClick={() => navigate(-1)}
            className="hover:text-blue cursor-pointer"
          >
            Zone Blocks
          </span>
          <span className="text-gray-400">›</span>
          <span className="text-ink font-semibold">Zone Block Details</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-[25px] font-semibold tracking-tight text-ink">
              {zoneBlock.name}
            </h1>
            <p className="mt-1 text-[13px] text-ink-soft">
              View zone block details and boundary shape.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => navigate(-1)}
              className="
                h-[36px]
                px-4
                rounded-lg
                border
                border-line
                bg-white
                text-[12px]
                font-semibold
                text-ink-soft
                hover:bg-bg
                transition-all
                cursor-pointer
              "
            >
              Back
            </button>

            {isAdmin && (
              <button
                onClick={() => navigate(`../edit/${zoneBlock.id}`)}
                className="
                  h-[36px]
                  px-5
                  rounded-lg
                  bg-blue-deep
                  text-[12px]
                  font-semibold
                  text-white
                  hover:bg-[#0F2B4D]
                  transition-all
                  shadow-cta
                  cursor-pointer
                "
              >
                Edit Zone Block
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-5">
          <div className="bg-white border border-line rounded-xl shadow-card-sm overflow-hidden h-fit">
            <div className="px-5 py-5 border-b border-line">
              <h2 className="text-[18px] font-semibold text-ink">Zone Block Information</h2>
              <p className="mt-1 text-[13px] text-ink-soft">
                Official registry metadata for this zone block.
              </p>
            </div>

            <div className="px-5 py-5 space-y-5">
              <DetailItem label="Zone Block Name" value={zoneBlock.name} />
              <DetailItem label="Zone Block Code" value={zoneBlock.code} />
              <DetailItem
                label="District"
                value={zoneBlock.zone?.district?.name}
              />
              <DetailItem label="Zone" value={zoneBlock.zone?.name} />

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                  Status
                </p>
                <span
                  className={`
                    mt-2
                    inline-flex
                    items-center
                    rounded-full
                    px-3
                    py-1
                    text-[10px]
                    font-semibold
                    ${
                      isActive
                        ? "bg-green-50 text-green-600 border border-green-100"
                        : "bg-gray-100 text-gray-500 border border-gray-200"
                    }
                  `}
                >
                  <span
                    className={`
                      mr-1.5
                      h-1.5
                      w-1.5
                      rounded-full
                      ${isActive ? "bg-green-500" : "bg-gray-400"}
                    `}
                  />
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <DetailItem
                label="Boundary Vertices"
                value={vertexCount > 0 ? `${vertexCount} points` : "—"}
              />
              <DetailItem
                label="Created"
                value={
                  zone.createdAt
                    ? new Date(zone.createdAt).toLocaleString()
                    : "—"
                }
              />
              <DetailItem
                label="Last Updated"
                value={
                  zone.updatedAt
                    ? new Date(zone.updatedAt).toLocaleString()
                    : "—"
                }
              />
            </div>
          </div>

          <div className="bg-white border border-line rounded-xl shadow-card-sm overflow-hidden">
            <div className="px-5 py-5 border-b border-line">
              <h2 className="text-[18px] font-semibold text-ink">Zone Block Boundary</h2>
              <p className="mt-1 text-[13px] text-ink-soft">
                Geographic shape of the zone block on the map.
              </p>
            </div>

            <div className="p-5">
              <ZoneMapPreview geometry={zoneBlock.geometry} height="520px" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
