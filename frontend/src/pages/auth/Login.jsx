import { useState } from "react";
import { useNavigate } from "react-router-dom";
import somaliaFlag from "@/assets/images.jpg";
import sdasLogo from "@/assets/logo/sdas_logo.png";

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      navigate("/dashboard");
    }, 300);
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 bg-white font-sans antialiased text-[#16233A]">
      {/* =====================================================
          LEFT COLUMN - CIVIC HERO BANNER
      ====================================================== */}
      <div className="relative hidden md:flex flex-col justify-end p-10 lg:p-14 xl:p-20 overflow-hidden select-none bg-[#0A1F35] min-h-screen">
        {/* Somalia Flag Background */}
        <img
          src={somaliaFlag}
          alt="Somalia National Flag"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Clean Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(10, 31, 53, 0.40) 0%, rgba(0, 59, 122, 0.70) 50%, rgba(10, 31, 53, 0.95) 100%)",
          }}
        />

        {/* Clean Civic Headline */}
        <div className="relative z-10 space-y-3 max-w-lg">
          <h1 className="text-white text-3xl lg:text-4xl xl:text-[44px] font-bold leading-tight font-display tracking-tight drop-shadow-xs">
            Somalia Digital Address System (SDAS)
          </h1>
          <p className="text-blue-100/90 text-sm lg:text-base font-normal leading-relaxed">
            Centralized Administrative & Property Spatial Registry
          </p>
        </div>
      </div>

      {/* =====================================================
          RIGHT COLUMN - CLEAN STREAMLINED LOGIN FORM
      ====================================================== */}
      <div className="w-full flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 xl:p-20 min-h-screen bg-white">
        <div className="w-full max-w-[380px] mx-auto space-y-7">
          {/* Header */}
          <div className="space-y-4">
            <img
              src={sdasLogo}
              alt="SDAS - Somali Digital Address System"
              className="h-16 sm:h-20 w-auto object-contain"
            />

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-display tracking-tight">
                Government Official Sign In
              </h2>
              <p className="text-sm text-gray-500 font-normal">
                Authorized Personnel Only
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Official Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider"
              >
                Official Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <svg
                    className="w-4 h-4 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.so"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <svg
                    className="w-4 h-4 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-11 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-[#0056B3] hover:bg-[#00458F] active:bg-[#003B7A] text-white text-sm font-semibold shadow-xs hover:shadow transition duration-150 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Sign In →</span>
            </button>
          </form>

          {/* Clean Footer */}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500 font-normal">
              For credential recovery, contact your Super Admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
