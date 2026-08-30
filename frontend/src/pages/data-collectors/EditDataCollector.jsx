import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getDataCollectorById, updateDataCollector } from "@/api/dataCollectorApi";
import { getDataOfficers } from "@/api/dataOfficerApi";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EditDataCollector() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [officers, setOfficers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    supervisorId: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [collectorRes, officersRes] = await Promise.all([
          getDataCollectorById(id),
          getDataOfficers(),
        ]);
        const collector = collectorRes.data.data;
        setOfficers(officersRes.data.data || []);
        setFormData({
          name: collector.name || "",
          email: collector.email || "",
          password: "",
          confirmPassword: "",
          supervisorId: collector.supervisorId || "",
        });
      } catch (err) {
        setServerError(err.response?.data?.message || "Failed to load collector.");
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError(null);
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
      isValid = false;
    }

    if (!formData.email.trim() || !EMAIL_REGEX.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!formData.supervisorId) {
      newErrors.supervisorId = "Supervising officer is required";
      isValid = false;
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        supervisorId: formData.supervisorId,
      };
      if (formData.password) payload.password = formData.password;

      await updateDataCollector(id, payload);
      navigate("/admin/data-collectors");
    } catch (err) {
      setServerError(err.response?.data?.message || "Failed to update collector.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-deep" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg font-sans">
      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10">
        <div className="mb-6">
          <h1 className="font-display text-[25px] font-semibold tracking-tight text-ink">
            Edit Data Collector
          </h1>
        </div>

        {serverError && (
          <div className="mb-6 max-w-[635px] rounded-lg bg-red-50 p-4 border border-red-200 text-red-700 text-sm">
            {serverError}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[635px] bg-white border border-line rounded-xl shadow-card-sm overflow-hidden"
        >
          <div className="px-5 pt-5 pb-4 space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-ink mb-2">Full Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full h-[38px] rounded-lg border border-line px-3 text-[13px]"
              />
              {errors.name && <p className="mt-1 text-[11px] text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-ink mb-2">Email</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full h-[38px] rounded-lg border border-line px-3 text-[13px]"
              />
              {errors.email && <p className="mt-1 text-[11px] text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-ink mb-2">
                Supervising Data Officer
              </label>
              <select
                name="supervisorId"
                value={formData.supervisorId}
                onChange={handleChange}
                className="w-full h-[38px] rounded-lg border border-line px-3 text-[13px]"
              >
                {officers.map((officer) => (
                  <option key={officer.id} value={officer.id}>
                    {officer.name} ({officer.email})
                  </option>
                ))}
              </select>
              {errors.supervisorId && (
                <p className="mt-1 text-[11px] text-red-500">{errors.supervisorId}</p>
              )}
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-ink mb-2">
                New Password (optional)
              </label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full h-[38px] rounded-lg border border-line px-3 text-[13px]"
              />
              {errors.password && <p className="mt-1 text-[11px] text-red-500">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-ink mb-2">
                Confirm New Password
              </label>
              <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full h-[38px] rounded-lg border border-line px-3 text-[13px]"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-[11px] text-red-500">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 px-5 py-4 bg-[#FBFBFC] border-t border-line">
            <button
              type="button"
              onClick={() => navigate("/admin/data-collectors")}
              className="h-[36px] px-4 rounded-lg border border-line text-[12px] font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-[36px] px-5 rounded-lg bg-blue-deep text-[12px] font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
