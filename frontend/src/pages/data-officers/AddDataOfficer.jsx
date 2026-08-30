import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDataOfficer } from "@/api/dataOfficerApi";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AddDataOfficer() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

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

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
      isValid = false;
    } else if (!/[A-Za-z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one letter and one number";
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm the password";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
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
      setLoading(true);
      setServerError(null);

      await createDataOfficer({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      navigate("/admin/data-officers");
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
          "Failed to create data officer. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg font-sans">
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
            onClick={() => navigate("/admin/data-officers")}
            className="hover:text-blue cursor-pointer"
          >
            Data Officers
          </span>
          <span className="text-gray-400">›</span>
          <span className="text-ink font-semibold">Add Data Officer</span>
        </div>

        <div className="mb-6">
          <h1 className="font-display text-[25px] font-semibold tracking-tight text-ink">
            Add Data Officer
          </h1>
          <p className="mt-1 text-[13px] text-ink-soft">
            Create a new data officer account with registry access.
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
              Enter the officer&apos;s profile and login credentials.
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
                  placeholder="e.g. Fatima Ali"
                  className={`w-full h-[38px] rounded-lg border bg-white px-3 text-[13px] text-ink outline-none transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-blue/10 ${
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
                  placeholder="name@organization.so"
                  className={`w-full h-[38px] rounded-lg border bg-white px-3 text-[13px] text-ink outline-none transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-blue/10 ${
                    errors.email
                      ? "border-red-400 focus:border-red-400"
                      : "border-[#B9C2CE] focus:border-blue"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1.5 text-[11px] text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-[12px] font-semibold text-ink mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters with letters and numbers"
                  className={`w-full h-[38px] rounded-lg border bg-white px-3 text-[13px] text-ink outline-none transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-blue/10 ${
                    errors.password
                      ? "border-red-400 focus:border-red-400"
                      : "border-[#B9C2CE] focus:border-blue"
                  }`}
                />
                {errors.password && (
                  <p className="mt-1.5 text-[11px] text-red-500">{errors.password}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-[12px] font-semibold text-ink mb-2"
                >
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className={`w-full h-[38px] rounded-lg border bg-white px-3 text-[13px] text-ink outline-none transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-blue/10 ${
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

            <div className="flex items-center justify-end gap-3 px-5 py-4 bg-[#FBFBFC] border-t border-line">
              <button
                type="button"
                onClick={() => navigate("/admin/data-officers")}
                disabled={loading}
                className="h-[36px] px-4 rounded-lg border border-line bg-white text-[12px] font-semibold text-ink-soft hover:bg-bg transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="h-[36px] px-5 rounded-lg bg-blue-deep text-[12px] font-semibold text-white hover:bg-[#0F2B4D] transition-all shadow-cta cursor-pointer disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Data Officer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
