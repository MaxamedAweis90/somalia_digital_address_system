import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

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
// Layout
// ===============================

import AppLayout from "./components/layout/AppLayout.jsx";

// ===============================
// Dashboard
// ===============================

// import Dashboard from "./pages/Dashboard";

// ===============================
// Frontdoor
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
// Dashboard Layout
// ===============================

function DashboardLayout() {
  const navigate = useNavigate();

  const handleNavigate = (key) => {
    // =========================
    // Logout
    // =========================
    if (key === "logout") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Go to login page
      navigate("/login", { replace: true });

      return;
    }

    // =========================
    // Other Navigation
    // =========================

    const routes = {
      dashboard: "/dashboard",
      districts: "/districts",
      neighborhoods: "/neighborhoods",
      zones: "/zones",
      addresses: "/addresses",
      search: "/search",
      users: "/users",
      settings: "/settings",
    };

    if (routes[key]) {
      navigate(routes[key]);
    }
  };

  return (
    <AppLayout
      active="dashboard"
      onNavigate={handleNavigate}
      user={{
        name: "Admin",
      }}
    >
      {/* <Dashboard /> */}
    </AppLayout>
  );
}

// ===============================
// App
// ===============================

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Frontdoor */}
        <Route
          path="/"
          element={<Frontdoor />}
        />

        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={<DashboardLayout />}
        />

        {/* Unknown URL */}
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}