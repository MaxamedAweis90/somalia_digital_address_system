import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAddress, previewAddressCode } from "@/api/addressApi";
import { getDistricts } from "@/api/districtApi";
import { getZones } from "@/api/zoneApi";
import { getZoneBlocks } from "@/api/zoneBlockApi";
import LocationMapPicker from "@/components/addresses/LocationMapPicker";

export default function AddAddress() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    districtId: "",
    zoneId: "",
    zoneBlockId: "",
    streetName: "",
    description: "",
    active: true,
  });

  const [position, setPosition] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [zones, setZones] = useState([]);
  const [zoneBlocks, setZoneBlocks] = useState([]);
  const [dacPreview, setDacPreview] = useState("");
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [loadingZones, setLoadingZones] = useState(false);
  const [loadingZoneBlocks, setLoadingZoneBlocks] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    getDistricts()
      .then((res) => {
        const data = res.data.data || [];
        setDistricts(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, districtId: data[0].id }));
        }
      })
      .catch(console.error)
      .finally(() => setLoadingDistricts(false));
  }, []);

  useEffect(() => {
    if (!formData.districtId) {
      setZones([]);
      return;
    }

    setLoadingZones(true);
    getZones(formData.districtId)
      .then((res) => {
        const data = res.data.data || [];
        setZones(data);
        setFormData((prev) => ({
          ...prev,
          zoneId: data[0]?.id || "",
        }));
      })
      .catch(console.error)
      .finally(() => setLoadingZones(false));
  }, [formData.districtId]);

  useEffect(() => {
    if (!formData.zoneId) {
      setZoneBlocks([]);
      return;
    }

    setLoadingZoneBlocks(true);
    getZoneBlocks(formData.zoneId)
      .then((res) => {
        const data = res.data.data || [];
        setZoneBlocks(data);
        setFormData((prev) => ({
          ...prev,
          zoneBlockId: data[0]?.id || "",
        }));
      })
      .catch(console.error)
      .finally(() => setLoadingZoneBlocks(false));
  }, [formData.zoneId]);

  useEffect(() => {
    if (!formData.zoneBlockId) {
      setDacPreview("");
      return;
    }

    setLoadingPreview(true);
    previewAddressCode(formData.zoneBlockId)
      .then((res) => {
        setDacPreview(res.data.data?.addressCode || "");
      })
      .catch(() => setDacPreview(""))
      .finally(() => setLoadingPreview(false));
  }, [formData.zoneBlockId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleToggle = () => {
    setFormData((prev) => ({ ...prev, active: !prev.active }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.districtId) {
      newErrors.districtId = "Please select a district";
      isValid = false;
    }
    if (!formData.zoneId) {
      newErrors.zoneId = "Please select a zone";
      isValid = false;
    }
    if (!formData.zoneBlockId) {
      newErrors.zoneBlockId = "Please select a zone block";
      isValid = false;
    }
    if (!formData.streetName.trim()) {
      newErrors.streetName = "Street name is required";
      isValid = false;
    }
    if (!position) {
      newErrors.location = "Place a GPS pin on the map";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setServerError(null);

      await createAddress({
        districtId: formData.districtId,
        zoneId: formData.zoneId,
        zoneBlockId: formData.zoneBlockId,
        streetName: formData.streetName.trim(),
        description: formData.description.trim(),
        latitude: position.latitude,
        longitude: position.longitude,
        status: formData.active ? "ACTIVE" : "INACTIVE",
      });

      navigate(-1);
    } catch (error) {
      setServerError(error.response?.data?.message || "Failed to register address");
    } finally {
      setLoading(false);
    }
  };

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
          <span className="text-ink font-semibold">Register Address</span>
        </div>

        <div className="mb-6">
          <h1 className="font-display text-[25px] font-semibold tracking-tight text-ink">
            Register Address
          </h1>
          <p className="mt-1 text-[13px] text-ink-soft">
            A Digital Address Code (DAC) will be generated automatically in the
            official format: DISTRICT-ZONE-ZONEBLOCK-0001.
          </p>
        </div>

        {serverError && (
          <div className="mb-6 max-w-[900px] rounded-lg bg-red-50 p-4 border border-red-200 text-red-700 text-sm">
            {serverError}
          </div>
        )}

        <div className="w-full max-w-[900px] bg-white border border-line rounded-xl shadow-card-sm overflow-hidden">
          <div className="px-5 py-5 border-b border-line">
            <h2 className="text-[18px] font-semibold text-ink">Address Details</h2>
            <p className="mt-1 text-[13px] text-ink-soft">
              Select the administrative hierarchy and property location.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-5 pt-5 pb-4 space-y-4">
              <div className="rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-deep">
                  Next Digital Address Code (DAC)
                </p>
                <p className="mt-1 text-[18px] font-bold tracking-wide text-ink font-mono">
                  {loadingPreview ? "Generating..." : dacPreview || "Select a zone block"}
                </p>
                <p className="mt-1 text-[11px] text-ink-soft">
                  Format: [District]-[Zone]-[Zone Block]-[House] e.g. HOD-TLX-Z01-0001
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="districtId" className="block text-[12px] font-semibold text-ink mb-2">
                    District <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="districtId"
                    name="districtId"
                    value={formData.districtId}
                    onChange={handleChange}
                    disabled={loadingDistricts}
                    className="w-full h-[38px] rounded-lg border border-[#B9C2CE] bg-white px-3 text-[13px] outline-none focus:border-blue focus:ring-2 focus:ring-blue/10 cursor-pointer"
                  >
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                  {errors.districtId && <p className="mt-1.5 text-[11px] text-red-500">{errors.districtId}</p>}
                </div>

                <div>
                  <label htmlFor="zoneId" className="block text-[12px] font-semibold text-ink mb-2">
                    Zone <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="zoneId"
                    name="zoneId"
                    value={formData.zoneId}
                    onChange={handleChange}
                    disabled={loadingZones || zones.length === 0}
                    className="w-full h-[38px] rounded-lg border border-[#B9C2CE] bg-white px-3 text-[13px] outline-none focus:border-blue focus:ring-2 focus:ring-blue/10 cursor-pointer"
                  >
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} ({z.code})
                      </option>
                    ))}
                  </select>
                  {errors.zoneId && <p className="mt-1.5 text-[11px] text-red-500">{errors.zoneId}</p>}
                </div>

                <div>
                  <label htmlFor="zoneBlockId" className="block text-[12px] font-semibold text-ink mb-2">
                    Zone Block <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="zoneBlockId"
                    name="zoneBlockId"
                    value={formData.zoneBlockId}
                    onChange={handleChange}
                    disabled={loadingZoneBlocks || zoneBlocks.length === 0}
                    className="w-full h-[38px] rounded-lg border border-[#B9C2CE] bg-white px-3 text-[13px] outline-none focus:border-blue focus:ring-2 focus:ring-blue/10 cursor-pointer"
                  >
                    {zoneBlocks.length > 0 ? (
                      zoneBlocks.map((block) => (
                        <option key={block.id} value={block.id}>
                          {block.name} ({block.code})
                        </option>
                      ))
                    ) : (
                      <option value="">No zone blocks available</option>
                    )}
                  </select>
                  {errors.zoneBlockId && <p className="mt-1.5 text-[11px] text-red-500">{errors.zoneBlockId}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="streetName" className="block text-[12px] font-semibold text-ink mb-2">
                  Street Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="streetName"
                  name="streetName"
                  value={formData.streetName}
                  onChange={handleChange}
                  placeholder="e.g. Wadada Taleex"
                  className={`w-full h-[38px] rounded-lg border bg-white px-3 text-[13px] outline-none focus:ring-2 focus:ring-blue/10 ${
                    errors.streetName ? "border-red-400" : "border-[#B9C2CE] focus:border-blue"
                  }`}
                />
                {errors.streetName && <p className="mt-1.5 text-[11px] text-red-500">{errors.streetName}</p>}
              </div>

              <div>
                <label htmlFor="description" className="block text-[12px] font-semibold text-ink mb-2">
                  Property Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="e.g. Residential compound, blue gate"
                  className="w-full rounded-lg border border-[#B9C2CE] bg-white px-3 py-2 text-[13px] outline-none focus:border-blue focus:ring-2 focus:ring-blue/10"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-ink mb-2">
                  GPS Location <span className="text-red-500">*</span>
                </label>
                <LocationMapPicker position={position} onChange={setPosition} />
                {position && (
                  <p className="mt-2 text-[11px] text-ink-soft font-mono">
                    {position.latitude}, {position.longitude}
                  </p>
                )}
                {errors.location && <p className="mt-1.5 text-[11px] text-red-500">{errors.location}</p>}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-line">
                <div>
                  <label htmlFor="activeToggle" className="text-[13px] font-semibold text-ink block cursor-pointer">
                    Active Status
                  </label>
                  <p className="text-[12px] text-ink-soft mt-0.5">
                    Enable or disable this address in the registry
                  </p>
                </div>
                <button
                  type="button"
                  id="activeToggle"
                  role="switch"
                  aria-checked={formData.active}
                  onClick={handleToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    formData.active ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.active ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-5 py-4 bg-[#FBFBFC] border-t border-line">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={loading}
                className="h-[36px] px-4 rounded-lg border border-line bg-white text-[12px] font-semibold text-ink-soft hover:bg-bg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="h-[36px] px-5 rounded-lg bg-blue-deep text-[12px] font-semibold text-white hover:bg-[#0F2B4D] shadow-cta cursor-pointer disabled:opacity-50"
              >
                {loading ? "Registering..." : "Register Address"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
