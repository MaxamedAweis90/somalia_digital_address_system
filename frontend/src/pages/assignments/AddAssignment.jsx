import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAssignment } from "@/api/assignmentApi";
import { getDistricts } from "@/api/districtApi";
import { getNeighborhoods } from "@/api/neighborhoodApi";
import { getZones } from "@/api/zoneApi";
import { getDataOfficers } from "@/api/dataOfficerApi";
import Breadcrumb from "@/components/ui/Breadcrumb";
import PageHeader from "@/components/ui/PageHeader";

export default function AddAssignment() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: "DEFINE_ZONES",
    districtId: "",
    neighborhoodId: "",
    zoneId: "",
    assignedToId: "",
    notes: "",
    dueAt: "",
  });
  const [districts, setDistricts] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [zones, setZones] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const isRegisterAddresses = formData.type === "REGISTER_ADDRESSES";

  useEffect(() => {
    Promise.all([getDistricts(), getDataOfficers()])
      .then(([districtRes, officerRes]) => {
        const districtData = districtRes.data.data || [];
        const officerData = officerRes.data.data || [];
        setDistricts(districtData);
        setOfficers(officerData);
        setFormData((prev) => ({
          ...prev,
          districtId: districtData[0]?.id || "",
          assignedToId: officerData[0]?.id || "",
        }));
      })
      .catch((err) => {
        setServerError(err.response?.data?.message || "Failed to load form data");
      });
  }, []);

  useEffect(() => {
    if (!formData.districtId) {
      setNeighborhoods([]);
      return;
    }

    getNeighborhoods(formData.districtId)
      .then((res) => {
        const data = res.data.data || [];
        setNeighborhoods(data);
        setFormData((prev) => ({
          ...prev,
          neighborhoodId: data[0]?.id || "",
        }));
      })
      .catch(() => setNeighborhoods([]));
  }, [formData.districtId]);

  useEffect(() => {
    if (!isRegisterAddresses || !formData.neighborhoodId) {
      setZones([]);
      return;
    }

    getZones(formData.neighborhoodId)
      .then((res) => {
        const data = (res.data.data || []).filter((zone) => zone.status === "ACTIVE");
        setZones(data);
        setFormData((prev) => ({
          ...prev,
          zoneId: data[0]?.id || "",
        }));
      })
      .catch(() => setZones([]));
  }, [formData.neighborhoodId, isRegisterAddresses]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setServerError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.assignedToId) {
      setServerError("Data officer is required");
      return;
    }

    if (isRegisterAddresses) {
      if (!formData.zoneId) {
        setServerError("Zone is required for address registration assignments");
        return;
      }
    } else if (!formData.neighborhoodId) {
      setServerError("Neighborhood is required");
      return;
    }

    try {
      setLoading(true);
      setServerError(null);

      const payload = {
        type: formData.type,
        assignedToId: formData.assignedToId,
        notes: formData.notes || undefined,
        dueAt: formData.dueAt || undefined,
      };

      if (isRegisterAddresses) {
        payload.zoneId = formData.zoneId;
      } else {
        payload.neighborhoodId = formData.neighborhoodId;
      }

      const res = await createAssignment(payload);

      navigate(`/admin/assignments/${res.data.data.id}`);
    } catch (err) {
      setServerError(err.response?.data?.message || "Failed to create assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-bg font-sans">
      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10 space-y-6">
        <Breadcrumb
          items={[
            { label: "Dashboard", to: "/admin/dashboard" },
            { label: "Assignments", to: "/admin/assignments" },
            { label: "New Assignment" },
          ]}
        />

        <PageHeader
          title="New Assignment"
          description="Assign field work to a data officer for zone definition or address registration."
        />

        {serverError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="max-w-2xl rounded-xl border border-line bg-white p-6 shadow-card-sm space-y-5"
        >
          <div>
            <label className="block text-[12px] font-semibold text-ink mb-1.5">
              Assignment Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full h-[40px] rounded-lg border border-line bg-white px-3 text-[13px] text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/10"
            >
              <option value="DEFINE_ZONES">Define Zones</option>
              <option value="REGISTER_ADDRESSES">Register Addresses</option>
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-ink mb-1.5">
              District
            </label>
            <select
              name="districtId"
              value={formData.districtId}
              onChange={handleChange}
              className="w-full h-[40px] rounded-lg border border-line bg-white px-3 text-[13px] text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/10"
            >
              {districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name} ({district.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-ink mb-1.5">
              Neighborhood
            </label>
            <select
              name="neighborhoodId"
              value={formData.neighborhoodId}
              onChange={handleChange}
              className="w-full h-[40px] rounded-lg border border-line bg-white px-3 text-[13px] text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/10"
            >
              {neighborhoods.map((neighborhood) => (
                <option key={neighborhood.id} value={neighborhood.id}>
                  {neighborhood.name} ({neighborhood.code})
                </option>
              ))}
            </select>
          </div>

          {isRegisterAddresses && (
            <div>
              <label className="block text-[12px] font-semibold text-ink mb-1.5">
                Zone
              </label>
              <select
                name="zoneId"
                value={formData.zoneId}
                onChange={handleChange}
                className="w-full h-[40px] rounded-lg border border-line bg-white px-3 text-[13px] text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/10"
              >
                {zones.length > 0 ? (
                  zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} ({zone.code})
                    </option>
                  ))
                ) : (
                  <option value="">No published zones available</option>
                )}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[12px] font-semibold text-ink mb-1.5">
              Data Officer
            </label>
            <select
              name="assignedToId"
              value={formData.assignedToId}
              onChange={handleChange}
              className="w-full h-[40px] rounded-lg border border-line bg-white px-3 text-[13px] text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/10"
            >
              {officers.map((officer) => (
                <option key={officer.id} value={officer.id}>
                  {officer.name} ({officer.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-ink mb-1.5">
              Due Date
            </label>
            <input
              type="date"
              name="dueAt"
              value={formData.dueAt}
              onChange={handleChange}
              className="w-full h-[40px] rounded-lg border border-line bg-white px-3 text-[13px] text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/10"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-ink mb-1.5">
              Instructions
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Optional notes for the officer..."
              className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[13px] text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/10"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/admin/assignments")}
              className="h-[39px] px-4 rounded-lg border border-line bg-white text-[12px] font-semibold text-ink-soft hover:bg-bg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-[39px] px-5 rounded-lg bg-blue-deep text-[12px] font-semibold text-white shadow-cta hover:bg-[#0F2B4D] disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Creating..." : "Create Assignment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
