import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";

// ===============================
// Frontdoor Components
// ===============================

import AnnouncementBar from "./Frontdoor/AnnouncementBar";
import Header from "./Frontdoor/Header";
import Hero from "./Frontdoor/Hero";
import Features from "./Frontdoor/Features";
import Coverage from "./Frontdoor/Coverage";
import FinalCTA from "./Frontdoor/FinalCTA";
import Footer from "./Frontdoor/Footer";

import "./Frontdoor/frontdoor.css";

// ===============================
// Auth
// ===============================

import Login from "./pages/auth/Login";


// ===============================
// Frontdoor Page
// ===============================

function Frontdoor() {
  return (
    <div className="min-h-screen">

      <AnnouncementBar />

      <Header />

      <Hero />

      <Features />

      <Coverage />

      <FinalCTA />

      <Footer />

    </div>
  );
}


// ===============================
// Dashboard
// ===============================

function Dashboard() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F6F8FB]">

      {/* Navbar */}
      <nav className="flex h-16 items-center justify-between bg-white px-6 border-b border-[#E3E8EF] shadow-xs">

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0056B3] text-xl font-bold text-white shadow-xs">
            S
          </div>
          <h1 className="text-xl font-bold text-[#0A1F35] font-display">
            SDAS
          </h1>
        </div>

        <button
          onClick={() => navigate("/login")}
          className="rounded-xl bg-[#0056B3] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#00458F] shadow-xs cursor-pointer"
        >
          Logout
        </button>
      </nav>


      {/* Dashboard */}

      <main className="p-6">

        <div className="mb-6">

          <h2 className="text-3xl font-bold text-[#172B4D]">
            Dashboard
          </h2>

          <p className="mt-2 text-gray-500">
            Welcome to Somalia Digital Address System.
          </p>

        </div>


        {/* Statistics */}

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


        {/* Welcome */}

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
// App
// ===============================

export default function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* =====================
            Frontdoor
        ====================== */}

        <Route
          path="/"
          element={<Frontdoor />}
        />


        {/* =====================
            Login
        ====================== */}

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
          element={<Navigate to="/" replace />}
        />

      </Routes>

    </BrowserRouter>

  );
}