import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import {
  getDataOfficerById,
  updateDataOfficer,
} from "@/api/dataOfficerApi";
import RegeneratePasswordModal from "@/components/data-officers/RegeneratePasswordModal";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EditDataOfficer() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);

  useEffect(() => {
    const loadOfficer = async () => {
      try {
        setLoading(true);
        setServerError(null);
        const res = await getDataOfficerById(id);
        const officer = res.data.data;

        setFormData({
          name: officer.name || "",
          email: officer.email || "",
          password: "",
          confirmPassword: "",
        });
      } catch (err) {
        setServerError(
          err.response?.data?.message ||
            "Failed to load data officer details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) loadOfficer();
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
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Full name must be at least 2 characters";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
      isValid = false;
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (formData.password || formData.confirmPassword) {
      if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters long";
        isValid = false;
      } else if (
        !/[A-Za-z]/.test(formData.password) ||
        !/[0-9]/.test(formData.password)
      ) {
        newErrors.password =
          "Password must contain at least one letter and one number";
        isValid = false;
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
        isValid = false;
      }
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

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      await updateDataOfficer(id, payload);
      navigate("/admin/staff");
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
          "Failed to update data officer. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-deep" />
          <p className="text-[13px] text-ink-soft">Loading data officer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg font-sans">
      {showRegenerateModal && (
        <RegeneratePasswordModal
          officer={{ id, name: formData.name }}
          onClose={() => setShowRegenerateModal(false)}
        />
      )}

      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10">
        <div className="flex items-center gap-2 text-[11px] font-medium text-ink-soft mb-6">
          <span
            onClick={() => navigate("/admin/dashboard")}
            className="hover:text-blue cursor-pointer"
          >
            Dashboard
          </span>
          <span className="text-gray-400">›</span>
          <span
            onClick={() => navigate("/admin/staff")}
            className="hover:text-blue cursor-pointer"
          >
            Staff
          </span>
          <span className="text-gray-400">›</span>
          <span className="text-ink font-semibold">Edit Data Officer</span>
        </div>

        <div className="mb-6">
          <h1 className="font-display text-[25px] font-semibold tracking-tight text-ink">
            Edit Data Officer
          </h1>
          <p className="mt-1 text-[13px] text-ink-soft">
            Update account details or reset the officer&apos;s password.
          </p>
        </div>

        {serverError && (
          <div className="mb-6 max-w-[635px] rounded-lg bg-red-50 p-4 border border-red-200 text-red-700 text-sm">
            {serverError}
          </div>
        )}

        <div className="w-full max-w-[635px] bg-white border border-line rounded-xl shadow-card-sm overflow-hidden">
          <div className="px-5 py-5 border-b border-line">
            <h2 className="text-[18px] font-semibold text-ink">Account Details</h2>
            <p className="mt-1 text-[13px] text-ink-soft">
              Leave password fields blank to keep the current password.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-5 pt-5 pb-4 space-y-4">
              <div>
                <label htmlFor="name" className="block text-[12px] font-semibold text-ink mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full h-[38px] rounded-lg border bg-white px-3 text-[13px] text-ink outline-none transition-all focus:ring-2 focus:ring-blue/10 ${
                    errors.name
                      ? "border-red-400 focus:border-red-400"
                      : "border-[#B9C2CE] focus:border-blue"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1.5 text-[11px] text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-[12px] font-semibold text-ink mb-2">
                  Official Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full h-[38px] rounded-lg border bg-white px-3 text-[13px] text-ink outline-none transition-all focus:ring-2 focus:ring-blue/10 ${
                    errors.email
                      ? "border-red-400 focus:border-red-400"
                      : "border-[#B9C2CE] focus:border-blue"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1.5 text-[11px] text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="pt-4 border-t border-line">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3">
                  <div>
                    <p className="text-[12px] font-semibold text-amber-900">
                      Auto-generate password
                    </p>
                    <p className="mt-0.5 text-[11px] text-amber-800/80">
                      Create a secure temporary password instantly.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRegenerateModal(true)}
                    className="h-[34px] shrink-0 rounded-lg border border-amber-300 bg-white px-4 text-[12px] font-semibold text-amber-900 hover:bg-amber-100 cursor-pointer"
                  >
                    Regenerate Password
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-line">
                <p className="text-[12px] font-semibold text-ink mb-3">
                  Set password manually (optional)
                </p>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-[12px] font-semibold text-ink mb-2"
                    >
                      New Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Leave blank to keep current password"
                      className={`w-full h-[38px] rounded-lg border bg-white px-3 text-[13px] text-ink outline-none transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-blue/10 ${
                        errors.password
                          ? "border-red-400 focus:border-red-400"
                          : "border-[#B9C2CE] focus:border-blue"
                      }`}
                    />
                    {errors.password && (
                      <p className="mt-1.5 text-[11px] text-red-500">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-[12px] font-semibold text-ink mb-2"
                    >
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full h-[38px] rounded-lg border bg-white px-3 text-[13px] text-ink outline-none transition-all focus:ring-2 focus:ring-blue/10 ${
                        errors.confirmPassword
                          ? "border-red-400 focus:border-red-400"
                          : "border-[#B9C2CE] focus:border-blue"
                      }`}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1.5 text-[11px] text-red-500">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-5 py-4 bg-[#FBFBFC] border-t border-line">
              <button
                type="button"
                onClick={() => navigate("/admin/staff")}
                disabled={saving}
                className="h-[36px] px-4 rounded-lg border border-line bg-white text-[12px] font-semibold text-ink-soft hover:bg-bg transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="h-[36px] px-5 rounded-lg bg-blue-deep text-[12px] font-semibold text-white hover:bg-[#0F2B4D] transition-all shadow-cta cursor-pointer disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
