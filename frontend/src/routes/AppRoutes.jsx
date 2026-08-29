import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth Pages
import Login from "../pages/auth/Login";


// ===============================
// Dashboard Page
// ===============================

function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="flex h-16 items-center justify-between bg-white px-6 shadow-sm">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0056B3] text-xl font-bold text-white">
            S
          </div>

          <h1 className="text-xl font-bold text-[#172B4D]">
            SDAS
          </h1>

        </div>


        <button
          onClick={() => {
            window.location.href = "/login";
          }}
          className="rounded-lg bg-[#0056B3] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#00458F]"
        >
          Logout
        </button>

      </nav>


      {/* Dashboard Content */}
      <main className="p-6">

        <div className="mb-6">

          <h2 className="text-3xl font-bold text-[#172B4D]">
            Dashboard
          </h2>

          <p className="mt-2 text-gray-500">
            Welcome to Somalia Digital Address System.
          </p>

        </div>


        {/* Cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {/* Districts */}
          <div className="rounded-xl bg-white p-6 shadow-sm">

            <p className="text-sm text-gray-500">
              Districts
            </p>

            <h3 className="mt-2 text-3xl font-bold text-[#0056B3]">
              18
            </h3>

          </div>


          {/* Neighborhoods */}
          <div className="rounded-xl bg-white p-6 shadow-sm">

            <p className="text-sm text-gray-500">
              Neighborhoods
            </p>

            <h3 className="mt-2 text-3xl font-bold text-[#0056B3]">
              120
            </h3>

          </div>


          {/* Addresses */}
          <div className="rounded-xl bg-white p-6 shadow-sm">

            <p className="text-sm text-gray-500">
              Addresses
            </p>

            <h3 className="mt-2 text-3xl font-bold text-[#0056B3]">
              2,450
            </h3>

          </div>


          {/* Zones */}
          <div className="rounded-xl bg-white p-6 shadow-sm">

            <p className="text-sm text-gray-500">
              Zones
            </p>

            <h3 className="mt-2 text-3xl font-bold text-[#0056B3]">
              350
            </h3>

          </div>

        </div>


        {/* Welcome Card */}
        <div className="mt-6 rounded-xl bg-white p-8 shadow-sm">

          <h3 className="text-xl font-bold text-[#172B4D]">
            Welcome to SDAS
          </h3>

          <p className="mt-2 text-gray-500">
            Somali Digital Address System helps manage
            digital addresses, districts, neighborhoods,
            zones, and locations across Somalia.
          </p>

        </div>

      </main>

    </div>
  );
}


// ===============================
// App Routes
// ===============================

function AppRoutes() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =====================
            Login
        ====================== */}

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<Login />}
        />


        {/* =====================
            Dashboard
        ====================== */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* =====================
            Unknown URL
        ====================== */}

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default AppRoutes;