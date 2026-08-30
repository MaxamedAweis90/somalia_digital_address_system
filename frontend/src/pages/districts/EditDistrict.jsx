import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDistrictById, updateDistrict } from "@/api/districtApi";
import { getRegions } from "@/api/regionApi";
import { Loader2 } from "lucide-react";

const EditDistrict = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    districtName: "",
    districtCode: "",
    regionId: "",
    active: true,
  });

  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState(null);

  const [errors, setErrors] = useState({
    districtName: "",
    districtCode: "",
    regionId: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setServerError(null);

        const [distRes, regRes] = await Promise.all([
          getDistrictById(id),
          getRegions(),
        ]);

        const dist = distRes.data.data;
        const regList = regRes.data.data || [];

        setRegions(regList);
        setFormData({
          districtName: dist.name || "",
          districtCode: dist.code || "",
          regionId: dist.regionId || (regList[0]?.id ?? ""),
          active: (dist.status || "ACTIVE").toUpperCase() === "ACTIVE",
        });
      } catch (err) {
        console.error("Failed to load district data:", err);
        setServerError(err.response?.data?.message || "Failed to load district details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // Toggle active status
  const handleToggle = () => {
    setFormData((prev) => ({
      ...prev,
      active: !prev.active,
    }));
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {
      districtName: "",
      districtCode: "",
      regionId: "",
    };

    let isValid = true;

    if (!formData.districtName.trim()) {
      newErrors.districtName = "District name is required";
      isValid = false;
    }

    if (!formData.districtCode.trim()) {
      newErrors.districtCode = "District code is required";
      isValid = false;
    } else if (formData.districtCode.trim().length < 2) {
      newErrors.districtCode =
        "District code must be at least 2 characters";
      isValid = false;
    }

    if (!formData.regionId) {
      newErrors.regionId = "Please select a region";
      isValid = false;
    }

    setErrors(newErrors);

    return isValid;
  };

  // Submit updated district
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);
      setServerError(null);

      await updateDistrict(id, {
        name: formData.districtName.trim(),
        code: formData.districtCode.trim().toUpperCase(),
        regionId: formData.regionId,
        status: formData.active ? "ACTIVE" : "INACTIVE",
      });

      navigate(-1);
    } catch (error) {
      console.error("Error updating district:", error);
      setServerError(error.response?.data?.message || "Failed to update district");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-deep" />
        <p className="text-sm text-ink-soft">Loading district information...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg font-sans">
      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10">
        {/* =========================
            BREADCRUMB
        ========================= */}
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
            Districts
          </span>

          <span className="text-gray-400">›</span>

          <span className="text-ink font-semibold">
            Edit District
          </span>
        </div>

        {/* =========================
            PAGE TITLE
        ========================= */}
        <div className="mb-6">
          <h1 className="font-display text-[25px] font-semibold tracking-tight text-ink">
            Edit District
          </h1>
          <p className="mt-1 text-[13px] text-ink-soft">
            Update the official information for this administrative district.
          </p>
        </div>

        {/* Server Error */}
        {serverError && (
          <div className="mb-6 max-w-[635px] rounded-lg bg-red-50 p-4 border border-red-200 text-red-700 text-sm">
            {serverError}
          </div>
        )}

        {/* =========================
            MAIN CARD
        ========================= */}
        <div
          className="
            w-full
            max-w-[635px]
            bg-white
            border
            border-line
            rounded-xl
            shadow-card-sm
            overflow-hidden
          "
        >
          {/* =========================
              CARD HEADER
          ========================= */}
          <div className="px-5 py-5 border-b border-line">
            <h2 className="text-[18px] font-semibold text-ink">
              District Details
            </h2>

            <p className="mt-1 text-[13px] text-ink-soft">
              Update the official information for this administrative district.
            </p>
          </div>

          {/* =========================
              FORM
          ========================= */}
          <form onSubmit={handleSubmit}>
            <div className="px-5 pt-5 pb-4 space-y-4">
              {/* REGION SELECT */}
              <div>
                <label
                  htmlFor="regionId"
                  className="block text-[12px] font-semibold text-ink mb-2"
                >
                  Parent Region
                  <span className="text-red-500 ml-1">*</span>
                </label>

                <select
                  id="regionId"
                  name="regionId"
                  value={formData.regionId}
                  onChange={handleChange}
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
                  {regions.map((reg) => (
                    <option key={reg.id} value={reg.id}>
                      {reg.name} ({reg.code})
                    </option>
                  ))}
                </select>

                {errors.regionId && (
                  <p className="mt-1.5 text-[11px] text-red-500">
                    {errors.regionId}
                  </p>
                )}
              </div>

              {/* DISTRICT NAME */}
              <div>
                <label
                  htmlFor="districtName"
                  className="block text-[12px] font-semibold text-ink mb-2"
                >
                  District Name
                  <span className="text-red-500 ml-1">*</span>
                </label>

                <input
                  id="districtName"
                  name="districtName"
                  type="text"
                  value={formData.districtName}
                  onChange={handleChange}
                  placeholder="e.g. Banadir"
                  className={`
                    w-full
                    h-[38px]
                    rounded-lg
                    border
                    bg-white
                    px-3
                    text-[13px]
                    text-ink
                    outline-none
                    transition-all
                    placeholder:text-gray-400
                    focus:ring-2
                    focus:ring-blue/10
                    ${
                      errors.districtName
                        ? "border-red-400 focus:border-red-400"
                        : "border-[#B9C2CE] focus:border-blue"
                    }
                  `}
                />

                {errors.districtName && (
                  <p className="mt-1.5 text-[11px] text-red-500">
                    {errors.districtName}
                  </p>
                )}
              </div>

              {/* DISTRICT CODE */}
              <div>
                <label
                  htmlFor="districtCode"
                  className="block text-[12px] font-semibold text-ink mb-2"
                >
                  District Code
                  <span className="text-red-500 ml-1">*</span>
                </label>

                <input
                  id="districtCode"
                  name="districtCode"
                  type="text"
                  value={formData.districtCode}
                  onChange={(e) => {
                    handleChange({
                      target: {
                        name: "districtCode",
                        value: e.target.value.toUpperCase(),
                      },
                    });
                  }}
                  placeholder="e.g. HDN"
                  maxLength={10}
                  className={`
                    w-full
                    h-[38px]
                    rounded-lg
                    border
                    bg-white
                    px-3
                    text-[13px]
                    text-ink
                    outline-none
                    transition-all
                    placeholder:text-gray-400
                    focus:ring-2
                    focus:ring-blue/10
                    ${
                      errors.districtCode
                        ? "border-red-400 focus:border-red-400"
                        : "border-[#B9C2CE] focus:border-blue"
                    }
                  `}
                />

                {errors.districtCode && (
                  <p className="mt-1.5 text-[11px] text-red-500">
                    {errors.districtCode}
                  </p>
                )}
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
                    Enable or disable this district in the system
                  </p>
                </div>

                <button
                  type="button"
                  id="activeToggle"
                  role="switch"
                  aria-checked={formData.active}
                  onClick={handleToggle}
                  className={`
                    relative
                    inline-flex
                    h-6
                    w-11
                    items-center
                    rounded-full
                    transition-colors
                    cursor-pointer
                    ${formData.active ? "bg-blue-600" : "bg-gray-300"}
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
                      ${formData.active ? "translate-x-6" : "translate-x-1"}
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
                {saving ? "Updating..." : "Update District"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditDistrict;