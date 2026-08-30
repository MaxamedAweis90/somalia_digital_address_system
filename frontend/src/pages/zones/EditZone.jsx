import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EditZone() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "Zone 01",
    district: "Hodan",
    code: "Z01",
    active: true,
  });

  const [errors, setErrors] = useState({
    name: "",
    code: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleToggle = () => {
    setFormData((prev) => ({ ...prev, active: !prev.active }));
  };

  const validateForm = () => {
    const newErrors = { name: "", code: "" };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Zone name is required";
      isValid = false;
    }

    if (!formData.code.trim()) {
      newErrors.code = "Zone code is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate(-1);
    }, 400);
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
            Zones
          </span>
          <span className="text-gray-400">›</span>
          <span className="text-ink font-semibold">Edit Zone</span>
        </div>

        {/* PAGE TITLE */}
        <div className="mb-6">
          <h1 className="font-display text-[25px] font-semibold tracking-tight text-ink">
            Edit Zone
          </h1>
          <p className="mt-1 text-[13px] text-ink-soft">
            Update cadastral zone details and parameters.
          </p>
        </div>

        {/* MAIN CARD */}
        <div className="w-full max-w-[635px] bg-white border border-line rounded-xl shadow-card-sm overflow-hidden">
          <div className="px-5 py-5 border-b border-line">
            <h2 className="text-[18px] font-semibold text-ink">
              Zone Details
            </h2>
            <p className="mt-1 text-[13px] text-ink-soft">
              Update the official details for this zone.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-5 pt-5 pb-4 space-y-4">
              {/* DISTRICT */}
              <div>
                <label
                  htmlFor="district"
                  className="block text-[12px] font-semibold text-ink mb-2"
                >
                  District
                  <span className="text-red-500 ml-1">*</span>
                </label>

                <select
                  id="district"
                  name="district"
                  value={formData.district}
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
                  <option value="Hodan">Hodan</option>
                  <option value="Wadajir">Wadajir</option>
                  <option value="Karaan">Karaan</option>
                  <option value="Howlwadaag">Howlwadaag</option>
                  <option value="Yaqshiid">Yaqshiid</option>
                </select>
              </div>

              {/* NAME */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-[12px] font-semibold text-ink mb-2"
                >
                  Zone Name
                  <span className="text-red-500 ml-1">*</span>
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Zone 01"
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
                      errors.name
                        ? "border-red-400 focus:border-red-400"
                        : "border-[#B9C2CE] focus:border-blue"
                    }
                  `}
                />

                {errors.name && (
                  <p className="mt-1.5 text-[11px] text-red-500">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* CODE */}
              <div>
                <label
                  htmlFor="code"
                  className="block text-[12px] font-semibold text-ink mb-2"
                >
                  Zone Code
                  <span className="text-red-500 ml-1">*</span>
                </label>

                <input
                  id="code"
                  name="code"
                  type="text"
                  value={formData.code}
                  onChange={(e) => {
                    handleChange({
                      target: {
                        name: "code",
                        value: e.target.value.toUpperCase(),
                      },
                    });
                  }}
                  placeholder="e.g. Z01"
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
                      errors.code
                        ? "border-red-400 focus:border-red-400"
                        : "border-[#B9C2CE] focus:border-blue"
                    }
                  `}
                />

                {errors.code && (
                  <p className="mt-1.5 text-[11px] text-red-500">
                    {errors.code}
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
                    Enable or disable this zone in the system
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
                {loading ? "Updating..." : "Update Zone"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}