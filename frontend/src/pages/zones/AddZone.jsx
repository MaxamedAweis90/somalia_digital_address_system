import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createZone } from "@/api/zoneApi";
import { getDistrictOptions, getDistrictGeometry } from "@/api/districtApi";
import ZoneMapEditor from "@/components/zones/ZoneMapEditor";
import { isPolygonWithinGeometry } from "@/utils/geojson";

export default function AddZone() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    districtId: "",
    active: true,
  });

  const [districts, setDistricts] = useState([]);
  const [districtGeometry, setDistrictGeometry] = useState(null);
  const [districtLabel, setDistrictLabel] = useState("");
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [errors, setErrors] = useState({ name: "", code: "", districtId: "", geometry: "" });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [geometry, setGeometry] = useState(null);

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
      setDistrictGeometry(null);
      setDistrictLabel("");
      return;
    }

    getDistrictGeometry(formData.districtId)
      .then(({ geometry, name }) => {
        setDistrictGeometry(geometry);
        setDistrictLabel(name);
      })
      .catch(() => {
        setDistrictGeometry(null);
        setDistrictLabel("");
      });
  }, [formData.districtId]);

  useEffect(() => {
    if (!geometry || !districtGeometry) return;

    if (!isPolygonWithinGeometry(geometry, districtGeometry)) {
      setGeometry(null);
    }
  }, [formData.districtId, districtGeometry]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = { name: "", code: "", districtId: "", geometry: "" };
    let isValid = true;
    if (!formData.name.trim()) {
      newErrors.name = "Zone name is required";
      isValid = false;
    }
    if (!formData.code.trim() || formData.code.trim().length < 2) {
      newErrors.code = "Zone code is required (min 2 characters)";
      isValid = false;
    }
    if (!formData.districtId) {
      newErrors.districtId = "Please select a parent district";
      isValid = false;
    }
    if (
      geometry &&
      districtGeometry &&
      !isPolygonWithinGeometry(geometry, districtGeometry)
    ) {
      newErrors.geometry = "Zone boundary must stay inside the selected district boundary";
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
      await createZone({
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        districtId: formData.districtId,
        status: formData.active ? "ACTIVE" : "INACTIVE",
        geometry: geometry || undefined,
      });
      navigate(-1);
    } catch (error) {
      setServerError(error.response?.data?.message || "Failed to create zone");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg font-sans">
      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10">
        <div className="mb-6">
          <h1 className="font-display text-[25px] font-semibold tracking-tight text-ink">Add Zone</h1>
          <p className="mt-1 text-[13px] text-ink-soft">
            Register a new zone under an administrative district.
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
              <div>
                <label className="block text-[12px] font-semibold text-ink mb-2">Parent District *</label>
                <select
                  name="districtId"
                  value={formData.districtId}
                  onChange={handleChange}
                  disabled={loadingDistricts}
                  className="w-full h-[38px] rounded-lg border border-[#B9C2CE] px-3 text-[13px]"
                >
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
                {errors.districtId && <p className="mt-1 text-[11px] text-red-500">{errors.districtId}</p>}
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-ink mb-2">Zone Name *</label>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Taleex"
                  className="w-full h-[38px] rounded-lg border border-[#B9C2CE] px-3 text-[13px]" />
                {errors.name && <p className="mt-1 text-[11px] text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-ink mb-2">Zone Code *</label>
                <input name="code" value={formData.code} onChange={(e) => handleChange({ target: { name: "code", value: e.target.value.toUpperCase() } })}
                  placeholder="e.g. TLX" maxLength={10}
                  className="w-full h-[38px] rounded-lg border border-[#B9C2CE] px-3 text-[13px]" />
                {errors.code && <p className="mt-1 text-[11px] text-red-500">{errors.code}</p>}
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-ink mb-2">Zone Boundary</label>
                <p className="mb-3 text-[12px] text-ink-soft">
                  Draw the zone inside the selected district boundary shown on the map.
                </p>
                {districtLabel && (
                  <p className="mb-2 text-[12px] font-medium text-ink">
                    District: <span className="font-semibold">{districtLabel}</span>
                  </p>
                )}
                <ZoneMapEditor
                  geometry={geometry}
                  onChange={setGeometry}
                  height="420px"
                  boundaryGeometry={districtGeometry}
                  boundaryLabel="District boundary"
                />
                {errors.geometry && (
                  <p className="mt-1.5 text-[11px] text-red-500">{errors.geometry}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 px-5 py-4 bg-[#FBFBFC] border-t border-line">
              <button type="button" onClick={() => navigate(-1)} className="h-[36px] px-4 rounded-lg border border-line text-[12px] cursor-pointer">Cancel</button>
              <button type="submit" disabled={loading} className="h-[36px] px-5 rounded-lg bg-blue-deep text-white text-[12px] cursor-pointer">
                {loading ? "Creating..." : "Add Zone"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
