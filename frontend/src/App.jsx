import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import AddDistrict from "./pages/districts/AddDistrict";

// Frontdoor components
import AnnouncementBar from "./Frontdoor/AnnouncementBar";
import Header from "./Frontdoor/Header";
import Hero from "./Frontdoor/Hero";
import Features from "./Frontdoor/Features";
import FinalCTA from "./Frontdoor/FinalCTA";
import Footer from "./Frontdoor/Footer";
import "./Frontdoor/frontdoor.css";

// Auth / pages
import Login from "./pages/auth/Login";
import AddressLookup from "./Frontdoor/Addresslookup";
import Developers from "./Frontdoor/Developers";
import About from "./Frontdoor/About";
import Coverage from "./Frontdoor/Coverage";
import CoveragePage from "./Frontdoor/pages/CoveragePage";


// ===============================
// Frontdoor Page
// ===============================
function Frontdoor() {
  return (
    <div className="min-h-screen">
      <AnnouncementBar />
      <Header />
      <Hero />
      <Route
  path="/districts/add"
  element={<AddDistrict />}
/>
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

  const stats = [
    { label: "Districts", value: "18" },
    { label: "Neighborhoods", value: "120" },
    { label: "Addresses", value: "2,450" },
    { label: "Zones", value: "350" },
  ];

  return (
    <div className="min-h-screen bg-[#F6F8FB]">
      <nav className="flex h-16 items-center justify-between bg-white px-6 border-b border-[#E3E8EF] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0056B3] text-xl font-bold text-white shadow-xs">
            S
          </div>
          <h1 className="text-xl font-bold text-[#0A1F35] font-display">SDAS</h1>
        </div>

        <button
          onClick={() => navigate("/login")}
          className="rounded-xl bg-[#0056B3] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#00458F] shadow-xs cursor-pointer"
        >
          Logout
        </button>
      </nav>

      <main className="p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-[#172B4D]">Dashboard</h2>
          <p className="mt-2 text-gray-500">
            Welcome to Somalia Digital Address System.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <h3 className="mt-2 text-3xl font-bold text-[#0056B3]">
                {stat.value}
              </h3>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl bg-white p-8 shadow-sm">
          <h3 className="text-xl font-bold text-[#172B4D]">Welcome to SDAS</h3>
          <p className="mt-2 text-gray-500">
            Somali Digital Address System helps manage digital addresses,
            districts, neighborhoods, zones, and locations across Somalia.
          </p>
        </div>
      </main>
    </div>
  );
}

// ===============================
// App — routes only. BrowserRouter lives in main.jsx.
// ===============================
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Frontdoor />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/search" element={<AddressLookup />} />
      <Route path="/developers" element={<Developers />} />
      <Route path="/coverage" element={<CoveragePage />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}