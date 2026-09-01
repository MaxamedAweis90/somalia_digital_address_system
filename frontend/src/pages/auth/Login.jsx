import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import somaliaFlag from "@/assets/images.jpg";
import sdasLogo from "@/assets/logo/sdas_logo.png";
import ReCAPTCHA from "react-google-recaptcha";
import { resendOtp } from "@/api/auth";

export default function Login() {
  const navigate = useNavigate();
  const { login, verifyOtp, getHomePath } = useAuth();
  const recaptchaRef = useRef(null);

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  // Step 1 State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2 State
  const [otp, setOtp] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const recaptchaToken = recaptchaRef.current?.getValue();
    if (!recaptchaToken && import.meta.env.VITE_ENABLE_RECAPTCHA !== "false") {
      setError("Please complete the reCAPTCHA.");
      setIsLoading(false);
      return;
    }

    try {
      // Use dev token if in development and recaptcha is optional, otherwise use token
      const token = recaptchaToken || "dev-token-bypass";
      const result = await login(email, password, token);

      if (result?.requireOtp) {
        setStep(2);
        toast.info("OTP sent to your email.");
      } else {
        toast.success("Signed in successfully");
        navigate(getHomePath(result.role), { replace: true });
      }
    } catch (err) {
      const message = err.response?.data?.message || "Login failed. Please try again.";
      setError(message);
      toast.error(message);
      if (recaptchaRef.current) recaptchaRef.current.reset();
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const user = await verifyOtp(email, otp);
      toast.success("OTP verified successfully");
      navigate(getHomePath(user.role), { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || "OTP verification failed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp(email);
      toast.success("A new OTP has been sent to your email.");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to resend OTP.";
      toast.error(message);
    }
  };

  return (
    <div>
      <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 bg-white font-sans antialiased text-[#16233A]">
        {/* =====================================================
          LEFT COLUMN - CIVIC HERO BANNER
        ====================================================== */}
        <div className="relative hidden md:flex flex-col justify-end p-10 lg:p-14 xl:p-20 overflow-hidden select-none bg-[#0A1F35] min-h-screen">
          <img
            src={somaliaFlag}
            alt="Somalia National Flag"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(10, 31, 53, 0.40) 0%, rgba(0, 59, 122, 0.70) 50%, rgba(10, 31, 53, 0.95) 100%)",
            }}
          />
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
              <Link
                to="/login"
                className="flex justify-center items-center w-full hover:opacity-90 transition-opacity"
              >
                <img
                  src={sdasLogo}
                  alt="SDAS - Somali Digital Address System"
                  className="h-16 sm:h-20 w-auto object-contain"
                />
              </Link>
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-display tracking-tight text-center">
                  Government Official Sign In
                </h2>
                <p className="text-sm text-gray-500 font-normal text-center">
                  Authorized Personnel Only
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Official Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.so"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-4 pr-11 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition cursor-pointer"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#0056B3] hover:bg-[#00458F] active:bg-[#003B7A] text-white text-sm font-semibold shadow-xs hover:shadow transition duration-150 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {isLoading ? "Authenticating..." : "Continue →"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="otp" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider text-center">
                    One-Time Password (OTP)
                  </label>
                  <p className="text-sm text-gray-500 mb-2 text-center mb-3">We sent a 6-digit code to {email}</p>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    required
                    className="w-full px-4 py-2.5 text-center tracking-widest text-lg rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#0056B3] hover:bg-[#00458F] active:bg-[#003B7A] text-white text-sm font-semibold shadow-xs hover:shadow transition duration-150 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {isLoading ? "Verifying..." : "Sign In"}
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-sm text-[#0056B3] hover:underline"
                  >
                    Resend Code
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm text-gray-500 hover:underline"
                  >
                    ← Back to Login
                  </button>
                </div>
              </form>
            )}

            {/* Clean Footer */}
            <div className="text-center pt-2">
              <p className="text-xs text-gray-500 font-normal">
                For credential recovery, contact your Super Admin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}