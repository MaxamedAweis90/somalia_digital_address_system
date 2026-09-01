import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getZoneById, updateZone } from "@/api/zoneApi";
import { getDistrictOptions } from "@/api/districtApi";
import { extractListFromResponse } from "@/utils/apiResponse";
import ZoneMapEditor from "@/components/zones/ZoneMapEditor";
import { Loader2 } from "lucide-react";

export default function EditZone() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    districtId: "",
    active: true,
  });

  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [geometry, setGeometry] = useState(null);

  const [errors, setErrors] = useState({
    name: "",
    code: "",
    districtId: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setServerError(null);

        const [zoneRes, distRes] = await Promise.all([
          getZoneById(id),
          getDistrictOptions(),
        ]);

        const zone = zoneRes.data.data;
        const distList = extractListFromResponse(distRes);

        setDistricts(distList);
        setFormData({
          name: zone.name || "",
          code: zone.code || "",
          districtId: zone.districtId || (distList[0]?.id ?? ""),
          active: (zone.status || "ACTIVE").toUpperCase() === "ACTIVE",
        });
        setGeometry(zone.geometry || null);
      } catch (err) {
        console.error("Failed to load zone data:", err);
        setServerError(err.response?.data?.message || "Failed to load zone details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleToggle = () => {
    setFormData((prev) => ({ ...prev, active: !prev.active }));
  };

  const validateForm = () => {
    const newErrors = { name: "", code: "", districtId: "" };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Zone name is required";
      isValid = false;
    }

    if (!formData.code.trim()) {
      newErrors.code = "Zone code is required";
      isValid = false;
    } else if (formData.code.trim().length < 2) {
      newErrors.code = "Zone code must be at least 2 characters";
      isValid = false;
    }

    if (!formData.districtId) {
      newErrors.districtId = "Please select a parent district";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      setServerError(null);

      await updateZone(id, {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        districtId: formData.districtId,
        status: formData.active ? "ACTIVE" : "INACTIVE",
        geometry,
      });

      navigate(-1);
    } catch (error) {
      console.error("Error updating zone:", error);
      setServerError(error.response?.data?.message || "Failed to update zone");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-deep" />
        <p className="text-sm text-ink-soft">Loading zone information...</p>
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
            Update zone information and boundary parameters.
          </p>
        </div>

        {/* Server Error */}
        {serverError && (
          <div className="mb-6 max-w-[635px] rounded-lg bg-red-50 p-4 border border-red-200 text-red-700 text-sm">
            {serverError}
          </div>
        )}

        {/* MAIN CARD */}
        <div className="w-full max-w-[900px] bg-white border border-line rounded-xl shadow-card-sm overflow-hidden">
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
              {/* PARENT DISTRICT */}
              <div>
                <label
                  htmlFor="districtId"
                  className="block text-[12px] font-semibold text-ink mb-2"
                >
                  Parent District
                  <span className="text-red-500 ml-1">*</span>
                </label>

                <select
                  id="districtId"
                  name="districtId"
                  value={formData.districtId}
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
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>

                {errors.districtId && (
                  <p className="mt-1.5 text-[11px] text-red-500">
                    {errors.districtId}
                  </p>
                )}
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
                  placeholder="e.g. Taleex"
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
                  placeholder="e.g. TLX"
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

              <div className="pt-2">
                <label className="block text-[12px] font-semibold text-ink mb-2">
                  Zone Boundary
                </label>
                <p className="mb-3 text-[12px] text-ink-soft">
                  Optional official boundary polygon used to validate zone block assignments.
                </p>
                <ZoneMapEditor
                  geometry={geometry}
                  onChange={setGeometry}
                  height="420px"
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
                {saving ? "Updating..." : "Update Zone"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
