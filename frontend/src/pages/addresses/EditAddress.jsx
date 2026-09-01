import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getAddressById, previewAddressCode, updateAddress } from "@/api/addressApi";
import { getDistrictOptions } from "@/api/districtApi";
import { getZoneOptions } from "@/api/zoneApi";
import { getZoneBlocks } from "@/api/zoneBlockApi";
import { extractListFromResponse } from "@/utils/apiResponse";
import LocationMapPicker from "@/components/addresses/LocationMapPicker";
import { parseLocation } from "@/utils/location";

export default function EditAddress() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    districtId: "",
    zoneId: "",
    zoneBlockId: "",
    streetName: "",
    description: "",
    active: true,
    addressCode: "",
  });

  const [position, setPosition] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [zones, setZones] = useState([]);
  const [zoneBlocks, setZoneBlocks] = useState([]);
  const [dacPreview, setDacPreview] = useState("");
  const [initialZoneBlockId, setInitialZoneBlockId] = useState("");
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingZones, setLoadingZones] = useState(false);
  const [loadingZoneBlocks, setLoadingZoneBlocks] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingPage(true);
        const [addressRes, districtsRes] = await Promise.all([
          getAddressById(id),
          getDistrictOptions(),
        ]);

        const address = addressRes.data.data;
        const districtList = extractListFromResponse(districtsRes);
        setDistricts(districtList);

        let zoneList = [];
        if (address.districtId) {
          const zonesRes = await getZoneOptions(address.districtId);
          zoneList = extractListFromResponse(zonesRes);
        }
        setZones(zoneList);

        let zoneBlockList = [];
        if (address.zoneId) {
          const zoneBlocksRes = await getZoneBlocks(address.zoneId);
          zoneBlockList = extractListFromResponse(zoneBlocksRes);
        }
        setZoneBlocks(zoneBlockList);

        setFormData({
          districtId: address.districtId,
          zoneId: address.zoneId,
          zoneBlockId: address.zoneBlockId,
          streetName: address.streetName || "",
          description: address.description || "",
          active: (address.status || "ACTIVE").toUpperCase() === "ACTIVE",
          addressCode: address.addressCode,
        });
        setInitialZoneBlockId(address.zoneBlockId);
        setDacPreview(address.addressCode);
        setPosition(parseLocation(address.location));
      } catch (err) {
        setServerError(err.response?.data?.message || "Failed to load address");
      } finally {
        setLoadingPage(false);
      }
    };

    load();
  }, [id]);

  useEffect(() => {
    if (loadingPage || !formData.districtId) return;

    setLoadingZones(true);
    getZoneOptions(formData.districtId)
      .then((res) => {
        const data = extractListFromResponse(res);
        setZones(data);
        setFormData((prev) => {
          const stillValid = data.some((z) => z.id === prev.zoneId);
          return {
            ...prev,
            zoneId: stillValid ? prev.zoneId : data[0]?.id || "",
          };
        });
      })
      .finally(() => setLoadingZones(false));
  }, [formData.districtId, loadingPage]);

  useEffect(() => {
    if (loadingPage || !formData.zoneId) return;

    setLoadingZoneBlocks(true);
    getZoneBlocks(formData.zoneId)
      .then((res) => {
        const data = extractListFromResponse(res);
        setZoneBlocks(data);
        setFormData((prev) => {
          const stillValid = data.some((block) => block.id === prev.zoneBlockId);
          return {
            ...prev,
            zoneBlockId: stillValid ? prev.zoneBlockId : data[0]?.id || "",
          };
        });
      })
      .finally(() => setLoadingZoneBlocks(false));
  }, [formData.zoneId, loadingPage]);

  useEffect(() => {
    if (!formData.zoneBlockId) return;

    if (formData.zoneBlockId === initialZoneBlockId) {
      setDacPreview(formData.addressCode);
      return;
    }

    previewAddressCode(formData.zoneBlockId)
      .then((res) => setDacPreview(res.data.data?.addressCode || ""))
      .catch(() => setDacPreview(""));
  }, [formData.zoneBlockId, formData.addressCode, initialZoneBlockId]);

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

      await updateAddress(id, {
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
      setServerError(error.response?.data?.message || "Failed to update address");
    } finally {
      setLoading(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="min-h-screen bg-bg font-sans flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-deep" />
          <p className="text-[13px] text-ink-soft">Loading address...</p>
        </div>
      </div>
    );
  }

  const zoneBlockChanged = formData.zoneBlockId !== initialZoneBlockId;

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
          <span className="text-ink font-semibold">Edit Address</span>
        </div>

        <div className="mb-6">
          <h1 className="font-display text-[25px] font-semibold tracking-tight text-ink">
            Edit Address
          </h1>
          <p className="mt-1 text-[13px] text-ink-soft">
            Update property details. Changing the zone block will assign a new house number and DAC.
          </p>
        </div>

        {serverError && (
          <div className="mb-6 max-w-[900px] rounded-lg bg-red-50 p-4 border border-red-200 text-red-700 text-sm">
            {serverError}
          </div>
        )}

        <div className="w-full max-w-[900px] bg-white border border-line rounded-xl shadow-card-sm overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="px-5 pt-5 pb-4 space-y-4">
              <div className="rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-deep">
                  Digital Address Code (DAC)
                </p>
                <p className="mt-1 text-[18px] font-bold tracking-wide text-ink font-mono">
                  {dacPreview || formData.addressCode}
                </p>
                {zoneBlockChanged && (
                  <p className="mt-1 text-[11px] text-amber-700">
                    Zone block changed — a new house number will be assigned on save.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="districtId" className="block text-[12px] font-semibold text-ink mb-2">
                    District
                  </label>
                  <select
                    id="districtId"
                    name="districtId"
                    value={formData.districtId}
                    onChange={handleChange}
                    className="w-full h-[38px] rounded-lg border border-[#B9C2CE] bg-white px-3 text-[13px] outline-none cursor-pointer"
                  >
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="zoneId" className="block text-[12px] font-semibold text-ink mb-2">
                    Zone
                  </label>
                  <select
                    id="zoneId"
                    name="zoneId"
                    value={formData.zoneId}
                    onChange={handleChange}
                    disabled={loadingZones}
                    className="w-full h-[38px] rounded-lg border border-[#B9C2CE] bg-white px-3 text-[13px] outline-none cursor-pointer"
                  >
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} ({z.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="zoneBlockId" className="block text-[12px] font-semibold text-ink mb-2">
                    Zone Block
                  </label>
                  <select
                    id="zoneBlockId"
                    name="zoneBlockId"
                    value={formData.zoneBlockId}
                    onChange={handleChange}
                    disabled={loadingZoneBlocks}
                    className="w-full h-[38px] rounded-lg border border-[#B9C2CE] bg-white px-3 text-[13px] outline-none cursor-pointer"
                  >
                    {zoneBlocks.map((block) => (
                      <option key={block.id} value={block.id}>
                        {block.name} ({block.code})
                      </option>
                    ))}
                  </select>
                  {errors.zoneBlockId && <p className="mt-1.5 text-[11px] text-red-500">{errors.zoneBlockId}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="streetName" className="block text-[12px] font-semibold text-ink mb-2">
                  Street Name
                </label>
                <input
                  id="streetName"
                  name="streetName"
                  value={formData.streetName}
                  onChange={handleChange}
                  className={`w-full h-[38px] rounded-lg border bg-white px-3 text-[13px] outline-none ${
                    errors.streetName ? "border-red-400" : "border-[#B9C2CE]"
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
                  className="w-full rounded-lg border border-[#B9C2CE] bg-white px-3 py-2 text-[13px] outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-ink mb-2">GPS Location</label>
                <LocationMapPicker position={position} onChange={setPosition} />
                {errors.location && <p className="mt-1.5 text-[11px] text-red-500">{errors.location}</p>}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-line">
                <div>
                  <label className="text-[13px] font-semibold text-ink block">Active Status</label>
                </div>
                <button
                  type="button"
                  onClick={handleToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer ${
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
                className="h-[36px] px-4 rounded-lg border border-line bg-white text-[12px] font-semibold text-ink-soft hover:bg-bg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="h-[36px] px-5 rounded-lg bg-blue-deep text-[12px] font-semibold text-white hover:bg-[#0F2B4D] shadow-cta cursor-pointer disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Address"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
