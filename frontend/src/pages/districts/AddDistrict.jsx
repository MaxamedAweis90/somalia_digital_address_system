import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const EditDistrict = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Existing district data
  // Later waxaad API/backend kaga beddeli kartaa
  const [formData, setFormData] = useState({
    districtName: "Hodan",
    districtCode: "HDN",
    active: true,
  });

  const [errors, setErrors] = useState({
    districtName: "",
    districtCode: "",
  });

  const [loading, setLoading] = useState(false);

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
    };

    let isValid = true;

    if (!formData.districtName.trim()) {
      newErrors.districtName = "District name is required";
      isValid = false;
    }

    if (!formData.districtCode.trim()) {
      newErrors.districtCode = "District code is required";
      isValid = false;
    } else if (formData.districtCode.trim().length < 3) {
      newErrors.districtCode =
        "District code must be at least 3 characters";
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
      setLoading(true);

      const updatedDistrict = {
        id,
        ...formData,
      };

      // Backend API integration later
      console.log("Updated District:", updatedDistrict);

      await new Promise((resolve) => setTimeout(resolve, 800));

      navigate("/districts");
    } catch (error) {
      console.error("Error updating district:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cancel
  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-bg font-sans">
      <div className="px-4 sm:px-6 lg:px-5 pt-5">
        {/* =========================
            BREADCRUMB
        ========================= */}
        <div className="flex items-center gap-2 text-[11px] font-medium text-ink-soft mb-6">
          <span className="hover:text-blue cursor-pointer">
            Dashboard
          </span>

          <span className="text-gray-400">›</span>

          <span
            onClick={() => navigate("/districts")}
            className="hover:text-blue cursor-pointer"
          >
            Districts
          </span>

          <span className="text-gray-400">›</span>

          <span className="text-ink">
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
        </div>

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
            <div className="px-5 pt-5 pb-4">
              {/* =========================
                  DISTRICT NAME
              ========================= */}
              <div className="mb-4">
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

              {/* =========================
                  DISTRICT CODE
              ========================= */}
              <div className="mb-5">
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
                    font-medium
                    tracking-wide
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

                {errors.districtCode ? (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-red-500 text-xs">ⓘ</span>

                    <p className="text-[10px] font-medium text-red-500">
                      {errors.districtCode}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-red-500 text-xs">ⓘ</span>

                    <p className="text-[10px] font-medium text-red-500">
                      District code must be unique
                    </p>
                  </div>
                )}
              </div>

              {/* =========================
                  ACTIVE STATUS
              ========================= */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[12px] font-semibold text-ink">
                    Active Status
                  </h3>

                  <p className="mt-1 text-[13px] text-ink-soft">
                    Set whether this district is currently active in the registry.
                  </p>
                </div>

                {/* Toggle */}
                <button
                  type="button"
                  onClick={handleToggle}
                  aria-label="Toggle district active status"
                  className={`
                    relative
                    flex-shrink-0
                    w-[38px]
                    h-[21px]
                    rounded-full
                    transition-colors
                    duration-200
                    ${
                      formData.active
                        ? "bg-blue-deep"
                        : "bg-gray-300"
                    }
                  `}
                >
                  <span
                    className={`
                      absolute
                      top-[3px]
                      w-[15px]
                      h-[15px]
                      rounded-full
                      bg-white
                      shadow-sm
                      transition-transform
                      duration-200
                      ${
                        formData.active
                          ? "translate-x-[20px]"
                          : "translate-x-[3px]"
                      }
                    `}
                  />
                </button>
              </div>
            </div>

            {/* =========================
                CARD FOOTER
            ========================= */}
            <div className="border-t border-line px-5 py-5">
              <div className="flex justify-end gap-3">
                {/* CANCEL */}
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="
                    min-w-[82px]
                    h-[39px]
                    rounded-lg
                    border
                    border-[#AEB9C7]
                    bg-white
                    px-5
                    text-[12px]
                    font-semibold
                    text-ink
                    transition-all
                    hover:bg-gray-50
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  Cancel
                </button>

                {/* UPDATE */}
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    min-w-[125px]
                    h-[39px]
                    rounded-lg
                    bg-blue-deep
                    px-5
                    text-[12px]
                    font-semibold
                    text-white
                    shadow-cta
                    transition-all
                    hover:bg-[#0F2B4D]
                    active:scale-[0.98]
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                  "
                >
                  {loading
                    ? "Updating..."
                    : "Update District"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditDistrict;