import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRegion } from "@/api/regionApi";
import { SOMALI_OFFICIAL_REGIONS } from "@/constants/somaliRegions";

export default function AddRegion() {
  const navigate = useNavigate();

  const [selectedRegion, setSelectedRegion] = useState(
    SOMALI_OFFICIAL_REGIONS[0].name
  );
  const [regionCode, setRegionCode] = useState(SOMALI_OFFICIAL_REGIONS[0].code);
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const handleRegionChange = (e) => {
    const name = e.target.value;
    setSelectedRegion(name);
    const found = SOMALI_OFFICIAL_REGIONS.find((r) => r.name === name);
    if (found) {
      setRegionCode(found.code);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setServerError(null);

      await createRegion({
        name: selectedRegion,
        code: regionCode,
        status: active ? "ACTIVE" : "INACTIVE",
      });

      navigate(-1);
    } catch (err) {
      console.error("Failed to create region:", err);
      setServerError(
        err.response?.data?.message || err.message || "Failed to register region."
      );
    } finally {
      setLoading(false);
    }
  };

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
          <span className="text-ink font-semibold">Add Region</span>
        </div>

        {/* PAGE TITLE */}
        <div className="mb-6">
          <h1 className="font-display text-[25px] font-semibold tracking-tight text-ink">
            Register Administrative Region
          </h1>
          <p className="mt-1 text-[13px] text-ink-soft">
            Register one of the 18 official constitutional regions of Somalia.
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
              Official Region Details
            </h2>
            <p className="mt-1 text-[13px] text-ink-soft">
              Select an official region from the standard cadastre index.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-5 pt-5 pb-4 space-y-4">
              {/* REGION SELECTION */}
              <div>
                <label
                  htmlFor="regionSelect"
                  className="block text-[12px] font-semibold text-ink mb-2"
                >
                  Official Somali Region
                  <span className="text-red-500 ml-1">*</span>
                </label>

                <select
                  id="regionSelect"
                  value={selectedRegion}
                  onChange={handleRegionChange}
                  className="
                    w-full
                    h-[38px]
                    rounded-lg
                    border
                    border-[#B9C2CE]
                    bg-white
                    px-3
                    text-[13px]
                    text-ink
                    outline-none
                    transition-all
                    focus:border-blue
                    focus:ring-2
                    focus:ring-blue/10
                    cursor-pointer
                  "
                >
                  {SOMALI_OFFICIAL_REGIONS.map((reg) => (
                    <option key={reg.code} value={reg.name}>
                      {reg.name} ({reg.capital})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-ink-soft">
                  Restricted to the 18 official constitutional regions.
                </p>
              </div>

              {/* REGION CODE (AUTO-FILLED) */}
              <div>
                <label
                  htmlFor="regionCode"
                  className="block text-[12px] font-semibold text-ink mb-2"
                >
                  Official Administrative Code
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
                <p className="mt-1 text-[11px] text-ink-soft">
                  Standard 3-letter regional prefix used in the Digital Address Code hierarchy.
                </p>
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
                    Enable or disable this region in the addressing system
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
                disabled={loading}
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
                disabled={loading}
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
                {loading ? "Registering..." : "Register Region"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
