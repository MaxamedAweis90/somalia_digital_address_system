import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createZoneBlock } from "@/api/zoneBlockApi";
import { getDistrictOptions } from "@/api/districtApi";
import { getZoneOptions, getZoneById } from "@/api/zoneApi";
import ZoneMapEditor from "@/components/zone-blocks/ZoneMapEditor";
import { isPolygonWithinGeometry, isValidPolygonGeometry } from "@/utils/geojson";

export default function AddZoneBlock() {
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
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [loadingZones, setLoadingZones] = useState(false);

  const [errors, setErrors] = useState({
    name: "",
    code: "",
    districtId: "",
    zoneId: "",
    geometry: "",
  });

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [mapKey, setMapKey] = useState(0);
  const [loadingZoneBoundary, setLoadingZoneBoundary] = useState(false);

  useEffect(() => {
    getDistrictOptions()
      .then((data) => {
        setDistricts(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, districtId: data[0].id }));
        }
      })
      .finally(() => setLoadingDistricts(false));
  }, []);

  useEffect(() => {
    if (!formData.districtId) {
      setZones([]);
      setZoneBoundary(null);
      setGeometry(null);
      return;
    }

    setLoadingZones(true);
    getZoneOptions(formData.districtId)
      .then((data) => {
        setZones(data);
        setFormData((prev) => ({
          ...prev,
          zoneId: data[0]?.id || "",
        }));
        setGeometry(null);
      })
      .catch(() => setZones([]))
      .finally(() => setLoadingZones(false));
  }, [formData.districtId]);

  useEffect(() => {
    if (!formData.zoneId) {
      setZoneBoundary(null);
      setGeometry(null);
      return;
    }

    setLoadingZoneBoundary(true);
    getZoneById(formData.zoneId)
      .then((res) => {
        setZoneBoundary(res.data.data?.geometry || null);
        setGeometry(null);
        setMapKey((key) => key + 1);
      })
      .catch(() => {
        setZoneBoundary(null);
        setGeometry(null);
        setMapKey((key) => key + 1);
      })
      .finally(() => setLoadingZoneBoundary(false));
  }, [formData.zoneId]);

  const handleGeometryChange = useCallback((nextGeometry) => {
    setGeometry(nextGeometry);
    setErrors((prev) => ({ ...prev, geometry: "" }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = { name: "", code: "", districtId: "", zoneId: "", geometry: "" };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Zone block name is required";
      isValid = false;
    }
    if (!formData.code.trim() || formData.code.trim().length < 2) {
      newErrors.code = "Zone block code is required";
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
      newErrors.geometry = "Draw a zone block boundary inside the parent zone";
      isValid = false;
    } else if (
      zoneBoundary &&
      !isPolygonWithinGeometry(geometry, zoneBoundary)
    ) {
      newErrors.geometry = "Zone block boundary must stay inside the parent zone boundary";
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

      await createZoneBlock({
        zoneId: formData.zoneId,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        status: formData.active ? "ACTIVE" : "INACTIVE",
        geometry,
      });

      navigate(-1);
    } catch (error) {
      setServerError(error.response?.data?.message || "Failed to create zone block");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg font-sans">
      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10">
        <div className="mb-6">
          <h1 className="font-display text-[25px] font-semibold tracking-tight text-ink">Add Zone Block</h1>
          <p className="mt-1 text-[13px] text-ink-soft">
            Create a cadastral block inside a zone. The parent zone boundary is shown on the map.
          </p>
        </div>

        {serverError && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 text-red-700 text-sm">
            {serverError}
          </div>
        )}

        <div className="w-full bg-white border border-line rounded-xl shadow-card-sm overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="px-5 pt-5 pb-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-ink mb-2">District *</label>
                  <select name="districtId" value={formData.districtId} onChange={handleChange} disabled={loadingDistricts}
                    className="w-full h-[38px] rounded-lg border border-[#B9C2CE] px-3 text-[13px]">
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                  {errors.districtId && <p className="mt-1 text-[11px] text-red-500">{errors.districtId}</p>}
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-ink mb-2">Parent Zone *</label>
                  <select name="zoneId" value={formData.zoneId} onChange={handleChange}
                    disabled={loadingZones || zones.length === 0}
                    className="w-full h-[38px] rounded-lg border border-[#B9C2CE] px-3 text-[13px]">
                    {loadingZones ? (
                      <option>Loading zones...</option>
                    ) : zones.length > 0 ? (
                      zones.map((z) => (
                        <option key={z.id} value={z.id}>{z.name} ({z.code})</option>
                      ))
                    ) : (
                      <option value="">No zones in this district</option>
                    )}
                  </select>
                  {errors.zoneId && <p className="mt-1 text-[11px] text-red-500">{errors.zoneId}</p>}
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-ink mb-2">Zone Block Name *</label>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Block 01"
                  className="w-full h-[38px] rounded-lg border border-[#B9C2CE] px-3 text-[13px]" />
                {errors.name && <p className="mt-1 text-[11px] text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-ink mb-2">Zone Block Code *</label>
                <input name="code" value={formData.code}
                  onChange={(e) => handleChange({ target: { name: "code", value: e.target.value.toUpperCase() } })}
                  placeholder="e.g. Z01" maxLength={10}
                  className="w-full h-[38px] rounded-lg border border-[#B9C2CE] px-3 text-[13px]" />
                {errors.code && <p className="mt-1 text-[11px] text-red-500">{errors.code}</p>}
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-ink mb-2">Zone Block Boundary *</label>
                {!formData.zoneId ? (
                  <p className="rounded-lg border border-dashed border-line bg-bg px-4 py-8 text-center text-[12px] text-ink-soft">
                    Select a parent zone to enable the map drawing tools.
                  </p>
                ) : loadingZoneBoundary ? (
                  <p className="rounded-lg border border-line bg-bg px-4 py-8 text-center text-[12px] text-ink-soft">
                    Loading parent zone boundary...
                  </p>
                ) : (
                  <ZoneMapEditor
                    key={mapKey}
                    geometry={geometry}
                    onChange={handleGeometryChange}
                    boundaryGeometry={zoneBoundary}
                    boundaryLabel="Parent zone boundary"
                  />
                )}
                {errors.geometry && <p className="mt-1 text-[11px] text-red-500">{errors.geometry}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-3 px-5 py-4 bg-[#FBFBFC] border-t border-line">
              <button type="button" onClick={() => navigate(-1)} className="h-[36px] px-4 rounded-lg border border-line text-[12px] cursor-pointer">Cancel</button>
              <button type="submit" disabled={loading} className="h-[36px] px-5 rounded-lg bg-blue-deep text-white text-[12px] cursor-pointer">
                {loading ? "Creating..." : "Add Zone Block"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
