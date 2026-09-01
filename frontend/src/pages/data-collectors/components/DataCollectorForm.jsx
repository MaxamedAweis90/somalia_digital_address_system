import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function DataCollectorForm({
  initialData = { name: "", email: "", supervisorId: "", password: "" },
  officers = [],
  loadingOfficers = false,
  isEdit = false,
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const [formData, setFormData] = useState(initialData);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Full name must be at least 2 characters";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Official email is required";
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.supervisorId) {
      newErrors.supervisorId = "Supervising data officer is required";
    }

    if (!isEdit) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters long";
      } else if (
        !/[A-Za-z]/.test(formData.password) ||
        !/[0-9]/.test(formData.password)
      ) {
        newErrors.password =
          "Password must contain at least one letter and one number";
      }

      if (confirmPassword !== formData.password) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    } else {
      if (formData.password) {
        if (formData.password.length < 8) {
          newErrors.password = "Password must be at least 8 characters long";
        } else if (
          !/[A-Za-z]/.test(formData.password) ||
          !/[0-9]/.test(formData.password)
        ) {
          newErrors.password =
            "Password must contain at least one letter and one number";
        }

        if (confirmPassword !== formData.password) {
          newErrors.confirmPassword = "Passwords do not match";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  // Ensure officers list only shows DATA_OFFICER users
  const officerList = Array.isArray(officers) ? officers : [];
  const dataOfficers = officerList.filter(
    (off) => !off.role || off.role === "DATA_OFFICER"
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-[12px] font-semibold text-ink mb-2"
        >
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter collector name"
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
        <label
          htmlFor="email"
          className="block text-[12px] font-semibold text-ink mb-2"
        >
          Official Email <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="collector@somalia.gov.so"
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
        <label
          htmlFor="supervisorId"
          className="block text-[12px] font-semibold text-ink mb-2"
        >
          Supervising Data Officer <span className="text-red-500">*</span>
        </label>
        <select
          id="supervisorId"
          name="supervisorId"
          value={formData.supervisorId}
          onChange={handleChange}
          disabled={loadingOfficers}
          className={`w-full h-[38px] rounded-lg border bg-white px-3 text-[13px] text-ink outline-none transition-all focus:ring-2 focus:ring-blue/10 ${
            errors.supervisorId
              ? "border-red-400 focus:border-red-400"
              : "border-[#B9C2CE] focus:border-blue"
          }`}
        >
          <option value="">
            {loadingOfficers
              ? "Loading officers..."
              : "Select Data Officer"}
          </option>
          {dataOfficers.map((officer) => (
            <option key={officer.id} value={officer.id}>
              {officer.name} — {officer.email}
            </option>
          ))}
        </select>
        {errors.supervisorId && (
          <p className="mt-1.5 text-[11px] text-red-500">
            {errors.supervisorId}
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="password"
            className="block text-[12px] font-semibold text-ink"
          >
            {isEdit ? "New Password (Optional)" : "Password"}{" "}
            {!isEdit && <span className="text-red-500">*</span>}
          </label>
          {isEdit && (
            <span className="text-[11px] text-ink-soft">
              Leave blank to keep the current password.
            </span>
          )}
        </div>

        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            placeholder={
              isEdit
                ? "Leave blank to keep current password"
                : "Enter secure password (min. 8 chars)"
            }
            className={`w-full h-[38px] rounded-lg border bg-white pl-3 pr-10 text-[13px] text-ink outline-none transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-blue/10 ${
              errors.password
                ? "border-red-400 focus:border-red-400"
                : "border-[#B9C2CE] focus:border-blue"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink cursor-pointer"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1.5 text-[11px] text-red-500">{errors.password}</p>
        )}
      </div>

      {(formData.password || !isEdit) && (
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-[12px] font-semibold text-ink mb-2"
          >
            Confirm Password {!isEdit && <span className="text-red-500">*</span>}
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setErrors((prev) => ({ ...prev, confirmPassword: "" }));
            }}
            placeholder="Confirm password"
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
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="h-[36px] px-4 rounded-lg border border-line bg-white text-[12px] font-semibold text-ink-soft hover:bg-bg transition-all cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || loadingOfficers}
          className="h-[36px] px-5 rounded-lg bg-blue-deep text-[12px] font-semibold text-white hover:bg-[#0F2B4D] transition-all shadow-cta cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting
            ? isEdit
              ? "Updating..."
              : "Creating..."
            : isEdit
            ? "Update Collector"
            : "Create Collector"}
        </button>
      </div>
    </form>
  );
}
