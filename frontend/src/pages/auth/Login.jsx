import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import somaliaFlag from "../../../public/images.jpg";
import sdasLogo from "../../assets/logo/sdas_logo.png";

// import sdasLogo from "../../assets/logo/sdas_logo.png";

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Temporary login navigation
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-2 sm:p-3">

      <div
        className="
          mx-auto
          flex
          min-h-[calc(100vh-16px)]
          max-w-[1500px]
          overflow-hidden
          rounded-[26px]
          bg-white
          shadow-[0_8px_40px_rgba(15,23,42,0.08)]
        "
      >

        {/* =====================================================
            LEFT SIDE - SOMALIA FLAG
        ====================================================== */}

        <div
          className="
            relative
            hidden
            w-[46%]
            overflow-hidden
            rounded-[24px]
            md:flex
          "
        >

          {/* Somalia Flag Image */}

          <img
            src={somaliaFlag}
            alt="Somalia Flag"
            className="
              absolute
              inset-0
              h-full
              w-full
              object-cover
            "
          />

          {/* Soft SDAS Blue Overlay */}

          <div
            className="
              absolute
              inset-0
              bg-[#0056B3]/25
            "
          />

          {/* Slight dark overlay for readable text */}

          <div
            className="
              absolute
              inset-0
              bg-black/10
            "
          />

          {/* LEFT CONTENT */}

          <div
            className="
              relative
              z-10
              flex
              h-full
              w-full
              flex-col
              justify-between
              px-10
              py-9
              lg:px-12
              lg:py-10
            "
          >

            {/* Star */}

            <div
              className="
                text-[50px]
                font-light
                leading-none
                text-white
              "
            >
              *
            </div>


            {/* Bottom Text */}

            <div className="max-w-[430px]">

              <p
                className="
                  mb-4
                  text-[15px]
                  font-normal
                  text-white
                "
              >
                Welcome to SDAS
              </p>

              <h1
                className="
                  mb-4
                  text-[32px]
                  font-bold
                  leading-[1.15]
                  tracking-[-0.5px]
                  text-white
                  lg:text-[36px]
                "
              >
                Your digital address,
                <br />
                made simple.
              </h1>

              <p
                className="
                  max-w-[390px]
                  text-[14px]
                  leading-6
                  text-white/90
                "
              >
                Access your digital address, locations,
                and services anytime — all in one place.
              </p>

            </div>

          </div>

        </div>


        {/* =====================================================
            RIGHT SIDE - LOGIN
        ====================================================== */}

        <div
          className="
            flex
            min-h-[calc(100vh-16px)]
            flex-1
            items-center
            justify-center
            px-6
            py-10
            sm:px-10
            lg:px-16
          "
        >

          <div className="w-full max-w-[350px]">

            {/* =================================================
                SDAS LOGO
            ================================================== */}

            <div className="mb-5">

              <img
                src={sdasLogo}
                alt="Somali Digital Address System"
                className="
                  h-[62px]
                  w-[105px]
                  object-contain
                  object-left
                "
              />

            </div>


            {/* =================================================
                TITLE
            ================================================== */}

            <div className="mb-7">

              <h2
                className="
                  mb-2
                  text-[30px]
                  font-bold
                  leading-tight
                  tracking-[-0.5px]
                  text-[#172B4D]
                "
              >
                Welcome Back
              </h2>

              <p
                className="
                  max-w-[340px]
                  text-[13px]
                  leading-5
                  text-[#64748B]
                "
              >
                Sign in to your SDAS account and manage
                your digital address easily.
              </p>

            </div>


            {/* =================================================
                LOGIN FORM
            ================================================== */}

            <form onSubmit={handleSubmit}>

              {/* EMAIL */}

              <div className="mb-4">

                <label
                  htmlFor="email"
                  className="
                    mb-2
                    block
                    text-[13px]
                    font-semibold
                    text-[#172B4D]
                  "
                >
                  Your email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  className="
                    h-[44px]
                    w-full
                    rounded-[9px]
                    border
                    border-[#CBD5E1]
                    bg-white
                    px-3.5
                    text-[13px]
                    text-[#172B4D]
                    outline-none
                    transition
                    placeholder:text-[#94A3B8]
                    focus:border-[#0056B3]
                    focus:ring-4
                    focus:ring-[#0056B3]/10
                  "
                />

              </div>


              {/* PASSWORD */}

              <div className="mb-2">

                <label
                  htmlFor="password"
                  className="
                    mb-2
                    block
                    text-[13px]
                    font-semibold
                    text-[#172B4D]
                  "
                >
                  Password
                </label>

                <div className="relative">

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="
                      h-[44px]
                      w-full
                      rounded-[9px]
                      border
                      border-[#CBD5E1]
                      bg-white
                      px-3.5
                      pr-14
                      text-[13px]
                      text-[#172B4D]
                      outline-none
                      transition
                      placeholder:text-[#94A3B8]
                      focus:border-[#0056B3]
                      focus:ring-4
                      focus:ring-[#0056B3]/10
                    "
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      text-[12px]
                      font-semibold
                      text-[#0056B3]
                      hover:text-[#003F82]
                    "
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>

              </div>


              {/* FORGOT PASSWORD */}

              <div className="mb-5 flex justify-end">

                <button
                  type="button"
                  className="
                    text-[12px]
                    font-medium
                    text-[#0056B3]
                    hover:underline
                  "
                >
                  Forgot Password?
                </button>

              </div>


              {/* LOGIN BUTTON */}

              <button
                type="submit"
                className="
                  h-[45px]
                  w-full
                  rounded-[9px]
                  bg-[#0056B3]
                  text-[13px]
                  font-semibold
                  text-white
                  shadow-[0_7px_18px_rgba(0,86,179,0.24)]
                  transition-all
                  duration-200
                  hover:bg-[#00458F]
                  hover:shadow-[0_9px_22px_rgba(0,86,179,0.30)]
                  active:scale-[0.99]
                "
              >
                Login
              </button>

            </form>


            {/* =================================================
                DIVIDER
            ================================================== */}

            <div className="my-6 flex items-center gap-3">

              <div className="h-px flex-1 bg-[#CBD5E1]" />

              <span
                className="
                  whitespace-nowrap
                  text-[10px]
                  text-[#94A3B8]
                "
              >
                or continue with
              </span>

              <div className="h-px flex-1 bg-[#CBD5E1]" />

            </div>


            {/* =================================================
                SOCIAL LOGIN
            ================================================== */}

            <div className="grid grid-cols-3 gap-3">

              {/* Behance */}

              <button
                type="button"
                className="
                  flex
                  h-[40px]
                  items-center
                  justify-center
                  rounded-[8px]
                  bg-[#E5E7EB]
                  transition
                  hover:bg-[#D7DADF]
                "
              >
                <span
                  className="
                    text-[13px]
                    font-bold
                    text-[#172B4D]
                  "
                >
                  Bē
                </span>
              </button>


              {/* Google */}

              <button
                type="button"
                className="
                  flex
                  h-[40px]
                  items-center
                  justify-center
                  rounded-[8px]
                  bg-[#E5E7EB]
                  transition
                  hover:bg-[#D7DADF]
                "
              >
                <span
                  className="
                    text-[17px]
                    font-bold
                    text-[#4285F4]
                  "
                >
                  G
                </span>
              </button>


              {/* Facebook */}

              <button
                type="button"
                className="
                  flex
                  h-[40px]
                  items-center
                  justify-center
                  rounded-[8px]
                  bg-[#E5E7EB]
                  transition
                  hover:bg-[#D7DADF]
                "
              >
                <span
                  className="
                    flex
                    h-[17px]
                    w-[17px]
                    items-center
                    justify-center
                    rounded-full
                    bg-[#4267B2]
                    text-[12px]
                    font-bold
                    text-white
                  "
                >
                  f
                </span>
              </button>

            </div>


            {/* =================================================
                SIGN UP
            ================================================== */}

            <div className="mt-5 text-center">

              <p className="text-[12px] text-[#64748B]">

                Don't have an account?

                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="
                    ml-1
                    font-semibold
                    text-[#0056B3]
                    hover:underline
                  "
                >
                  Sign up
                </button>

              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}