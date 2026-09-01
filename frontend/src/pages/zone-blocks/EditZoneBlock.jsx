import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getZoneBlockById, updateZoneBlock } from "@/api/zoneBlockApi";
import { getDistrictOptions } from "@/api/districtApi";
import { extractListFromResponse } from "@/utils/apiResponse";
import { getZoneOptions, getZoneById } from "@/api/zoneApi";
import ZoneMapEditor from "@/components/zone-blocks/ZoneMapEditor";
import { isValidPolygonGeometry } from "@/utils/geojson";
import { Loader2 } from "lucide-react";

export default function EditZoneBlock() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    districtId: "",
    zoneId: "",
    active: true,
  });

  const [geometry, setGeometry] = useState(null);
  const [zoneBoundary, setZoneBoundary] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [zones, setZones] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingZones, setLoadingZones] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  const [errors, setErrors] = useState({
    name: "",
    code: "",
    districtId: "",
    zoneId: "",
    geometry: "",
  });

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingPage(true);
        setServerError(null);

        const [zoneBlockRes, districtsRes] = await Promise.all([
          getZoneBlockById(id),
          getDistrictOptions(),
        ]);

        const zoneBlock = zoneBlockRes.data.data;
        const districtList = extractListFromResponse(districtsRes);
        setDistricts(districtList);

        const districtId =
          zoneBlock.zone?.district?.id ||
          districtList.find((d) => d.name === zoneBlock.zone?.district?.name)?.id ||
          "";

        let zoneList = [];
        if (districtId) {
          const zonesRes = await getZoneOptions(districtId);
          zoneList = extractListFromResponse(zonesRes);
        }
        setZones(zoneList);

        setFormData({
          name: zoneBlock.name || "",
          code: zoneBlock.code || "",
          districtId,
          zoneId: zoneBlock.zoneId || zoneBlock.zone?.id || "",
          active: (zoneBlock.status || "ACTIVE").toUpperCase() === "ACTIVE",
        });

        setGeometry(zoneBlock.geometry || null);
        setMapKey((k) => k + 1);
      } catch (err) {
        console.error("Failed to load zone block:", err);
        setServerError(err.response?.data?.message || "Failed to load zone block");
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
      .catch((err) => {
        console.error("Failed to load zones:", err);
        setZones([]);
      })
      .finally(() => setLoadingZones(false));
  }, [formData.districtId, loadingPage]);

  useEffect(() => {
    if (!formData.zoneId) {
      setZoneBoundary(null);
      return;
    }

    getZoneById(formData.zoneId)
      .then((res) => setZoneBoundary(res.data.data?.geometry || null))
      .catch(() => setZoneBoundary(null));
  }, [formData.zoneId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleToggle = () => {
    setFormData((prev) => ({ ...prev, active: !prev.active }));
  };

  const handleGeometryChange = (nextGeometry) => {
    setGeometry(nextGeometry);
    setErrors((prev) => ({ ...prev, geometry: "" }));
  };

  const validateForm = () => {
    const newErrors = {
      name: "",
      code: "",
      districtId: "",
      zoneId: "",
      geometry: "",
    };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Zone block name is required";
      isValid = false;
    }

    if (!formData.code.trim()) {
      newErrors.code = "Zone block code is required";
      isValid = false;
    } else if (formData.code.trim().length < 2) {
      newErrors.code = "Zone block code must be at least 2 characters";
      isValid = false;
    }

    if (!formData.districtId) {
      newErrors.districtId = "Please select a district";
      isValid = false;
    }

    if (!formData.zoneId) {
      newErrors.zoneId = "Please select a parent zone";
      isValid = false;
    }

    if (!isValidPolygonGeometry(geometry)) {
      newErrors.geometry = "Draw a zone block boundary polygon on the map";
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

      await updateZoneBlock(id, {
        zoneId: formData.zoneId,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        status: formData.active ? "ACTIVE" : "INACTIVE",
        geometry,
      });

      navigate(-1);
    } catch (error) {
      console.error("Error updating zone block:", error);
      setServerError(error.response?.data?.message || "Failed to update zone block");
    } finally {
      setLoading(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="min-h-screen bg-bg font-sans flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-deep" />
          <p className="text-[13px] text-ink-soft">Loading zone block...</p>
        </div>
      </div>
    );
  }

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
          <span className="text-ink font-semibold">Edit Zone Block</span>
        </div>

        <div className="mb-6">
          <h1 className="font-display text-[25px] font-semibold tracking-tight text-ink">
            Edit Zone Block
          </h1>
          <p className="mt-1 text-[13px] text-ink-soft">
            Update zone block details and boundary polygon.
          </p>
        </div>

        {serverError && (
          <div className="mb-6 max-w-[900px] rounded-lg bg-red-50 p-4 border border-red-200 text-red-700 text-sm">
            {serverError}
          </div>
        )}

        <div className="w-full max-w-[900px] bg-white border border-line rounded-xl shadow-card-sm overflow-hidden">
          <div className="px-5 py-5 border-b border-line">
            <h2 className="text-[18px] font-semibold text-ink">Zone Block Details</h2>
            <p className="mt-1 text-[13px] text-ink-soft">
              Update the official details and boundary for this zone block.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-5 pt-5 pb-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="districtId"
                    className="block text-[12px] font-semibold text-ink mb-2"
                  >
                    District
                    <span className="text-red-500 ml-1">*</span>
                  </label>

                  <select
                    id="districtId"
                    name="districtId"
                    value={formData.districtId}
                    onChange={handleChange}
                    className="w-full h-[38px] rounded-lg border border-[#B9C2CE] bg-white px-3 text-[13px] text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/10 cursor-pointer"
                  >
                    {districts.length > 0 ? (
                      districts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.code})
                        </option>
                      ))
                    ) : (
                      <option value="">No districts available</option>
                    )}
                  </select>

                  {errors.districtId && (
                    <p className="mt-1.5 text-[11px] text-red-500">{errors.districtId}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="zoneId"
                    className="block text-[12px] font-semibold text-ink mb-2"
                  >
                    Parent Zone
                    <span className="text-red-500 ml-1">*</span>
                  </label>

                  <select
                    id="zoneId"
                    name="zoneId"
                    value={formData.zoneId}
                    onChange={handleChange}
                    disabled={loadingZones || zones.length === 0}
                    className="w-full h-[38px] rounded-lg border border-[#B9C2CE] bg-white px-3 text-[13px] text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/10 cursor-pointer"
                  >
                    {loadingZones ? (
                      <option>Loading zones...</option>
                    ) : zones.length > 0 ? (
                      zones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.name} ({z.code})
                        </option>
                      ))
                    ) : (
                      <option value="">No zones in this district</option>
                    )}
                  </select>

                  {errors.zoneId && (
                    <p className="mt-1.5 text-[11px] text-red-500">{errors.zoneId}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="name" className="block text-[12px] font-semibold text-ink mb-2">
                  Zone Block Name
                  <span className="text-red-500 ml-1">*</span>
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Block 01"
                  className={`w-full h-[38px] rounded-lg border bg-white px-3 text-[13px] text-ink outline-none focus:ring-2 focus:ring-blue/10 ${
                    errors.name ? "border-red-400 focus:border-red-400" : "border-[#B9C2CE] focus:border-blue"
                  }`}
                />

                {errors.name && (
                  <p className="mt-1.5 text-[11px] text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="code" className="block text-[12px] font-semibold text-ink mb-2">
                  Zone Block Code
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
                  className={`w-full h-[38px] rounded-lg border bg-white px-3 text-[13px] text-ink outline-none focus:ring-2 focus:ring-blue/10 ${
                    errors.code ? "border-red-400 focus:border-red-400" : "border-[#B9C2CE] focus:border-blue"
                  }`}
                />

                {errors.code && (
                  <p className="mt-1.5 text-[11px] text-red-500">{errors.code}</p>
                )}
              </div>

              <div className="pt-2">
                <label className="block text-[12px] font-semibold text-ink mb-2">
                  Zone Block Boundary
                  <span className="text-red-500 ml-1">*</span>
                </label>

                <ZoneMapEditor
                  key={mapKey}
                  geometry={geometry}
                  onChange={handleGeometryChange}
                  boundaryGeometry={zoneBoundary}
                />

                {errors.geometry && (
                  <p className="mt-1.5 text-[11px] text-red-500">{errors.geometry}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-line">
                <div>
                  <label
                    htmlFor="activeToggle"
                    className="text-[13px] font-semibold text-ink block cursor-pointer"
                  >
                    Active Status
                  </label>
                  <p className="text-[12px] text-ink-soft mt-0.5">
                    Enable or disable this zone block in the system
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
                {loading ? "Updating..." : "Update Zone Block"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
