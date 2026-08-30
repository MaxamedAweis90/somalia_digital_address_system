import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRegionById, updateRegion } from "@/api/regionApi";
import { Loader2 } from "lucide-react";

export default function EditRegion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [regionName, setRegionName] = useState("");
  const [regionCode, setRegionCode] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    const loadRegion = async () => {
      try {
        setLoading(true);
        setServerError(null);
        const res = await getRegionById(id);
        const data = res.data.data;

        setRegionName(data.name || "");
        setRegionCode(data.code || "");
        setActive((data.status || "ACTIVE").toUpperCase() === "ACTIVE");
      } catch (err) {
        console.error("Failed to load region:", err);
        setServerError(err.response?.data?.message || "Failed to load region details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadRegion();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setServerError(null);

      await updateRegion(id, {
        name: regionName,
        code: regionCode,
        status: active ? "ACTIVE" : "INACTIVE",
      });

      navigate(-1);
    } catch (err) {
      console.error("Failed to update region:", err);
      setServerError(err.response?.data?.message || "Failed to update region");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-deep" />
        <p className="text-sm text-ink-soft">Loading region information...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg font-sans">
      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10">
        {/* BREADCRUMB */}
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
            Regions
          </span>
          <span className="text-gray-400">›</span>
          <span className="text-ink font-semibold">Edit Region</span>
        </div>

        {/* PAGE TITLE */}
        <div className="mb-6">
          <h1 className="font-display text-[25px] font-semibold tracking-tight text-ink">
            Edit Region
          </h1>
          <p className="mt-1 text-[13px] text-ink-soft">
            Update region parameters and operational status.
          </p>
        </div>

        {/* Server Error Notice */}
        {serverError && (
          <div className="mb-6 max-w-[635px] rounded-lg bg-red-50 p-4 border border-red-200 text-red-700 text-sm">
            {serverError}
          </div>
        )}

        {/* MAIN CARD */}
        <div className="w-full max-w-[635px] bg-white border border-line rounded-xl shadow-card-sm overflow-hidden">
          <div className="px-5 py-5 border-b border-line">
            <h2 className="text-[18px] font-semibold text-ink">
              Region Details
            </h2>
            <p className="mt-1 text-[13px] text-ink-soft">
              Modify region status and administrative parameters.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-5 pt-5 pb-4 space-y-4">
              {/* REGION NAME */}
              <div>
                <label
                  htmlFor="regionName"
                  className="block text-[12px] font-semibold text-ink mb-2"
                >
                  Region Name
                </label>

                <input
                  id="regionName"
                  type="text"
                  value={regionName}
                  readOnly
                  className="
                    w-full
                    h-[38px]
                    rounded-lg
                    border
                    border-gray-200
                    bg-gray-50
                    px-3
                    text-[13px]
                    font-semibold
                    text-ink
                    outline-none
                    cursor-not-allowed
                  "
                />
              </div>

              {/* REGION CODE */}
              <div>
                <label
                  htmlFor="regionCode"
                  className="block text-[12px] font-semibold text-ink mb-2"
                >
                  Region Code
                </label>

                <input
                  id="regionCode"
                  type="text"
                  value={regionCode}
                  readOnly
                  className="
                    w-full
                    h-[38px]
                    rounded-lg
                    border
                    border-gray-200
                    bg-gray-50
                    px-3
                    text-[13px]
                    font-semibold
                    text-blue-deep
                    outline-none
                    cursor-not-allowed
                  "
                />
              </div>

              {/* STATUS TOGGLE */}
              <div className="flex items-center justify-between pt-4 border-t border-line">
                <div>
                  <label
                    htmlFor="activeToggle"
                    className="text-[13px] font-semibold text-ink block cursor-pointer"
                  >
                    Active Status
                  </label>
                  <p className="text-[12px] text-ink-soft mt-0.5">
                    Enable or disable this region across districts and addresses
                  </p>
                </div>

                <button
                  type="button"
                  id="activeToggle"
                  role="switch"
                  aria-checked={active}
                  onClick={() => setActive((prev) => !prev)}
                  className={`
                    relative
                    inline-flex
                    h-6
                    w-11
                    items-center
                    rounded-full
                    transition-colors
                    cursor-pointer
                    ${active ? "bg-blue-600" : "bg-gray-300"}
                  `}
                >
                  <span
                    className={`
                      inline-block
                      h-4
                      w-4
                      transform
                      rounded-full
                      bg-white
                      transition-transform
                      ${active ? "translate-x-6" : "translate-x-1"}
                    `}
                  />
                </button>
              </div>
            </div>

            {/* CARD FOOTER */}
            <div className="flex items-center justify-end gap-3 px-5 py-4 bg-[#FBFBFC] border-t border-line">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={saving}
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
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
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
                  disabled:opacity-50
                "
              >
                {saving ? "Updating..." : "Update Region"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
