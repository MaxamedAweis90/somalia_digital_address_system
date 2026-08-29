
import { Navigate, Route, Routes } from "react-router-dom";
import { ROLES } from "@/constants/roles";
import RoleRoute from "./RoleRoute";
import GuestRoute from "./GuestRoute";

import SysAdminLayout from "@/layouts/SysAdminLayout";
import DataOfficerLayout from "@/layouts/DataOfficerLayout";

import Login from "@/pages/auth/Login";
import Dashboard from "@/pages/dashboard/Dashboard";
import PlaceholderPage from "@/pages/admin/PlaceholderPage";

// District Pages
import Zone from "@/pages/zones/Zone";
import AddZone from "@/pages/zones/AddZone";
import EditZone from "@/pages/zones/EditZone";
import District from "@/pages/districts/District";
import AddDistrict from "@/pages/districts/AddDistrict";
import EditDistrict from "@/pages/districts/EditDistrict";

// Frontdoor
import AnnouncementBar from "@/Frontdoor/AnnouncementBar";
import Header from "@/Frontdoor/Header";
import Hero from "@/Frontdoor/Hero";
import Features from "@/Frontdoor/Features";
import FinalCTA from "@/Frontdoor/FinalCTA";
import Footer from "@/Frontdoor/Footer";
import Coverage from "@/Frontdoor/Coverage";
import AddressLookup from "@/Frontdoor/Addresslookup";
import Developers from "@/Frontdoor/Developers";
import About from "@/Frontdoor/About";
import CoveragePage from "@/Frontdoor/pages/CoveragePage";

import "@/Frontdoor/frontdoor.css";

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

export default function AppRoutes() {
  return (
    <Routes>

      {/* =========================
          Public Routes
      ========================== */}

      <Route path="/" element={<Frontdoor />} />

      <Route path="/search" element={<AddressLookup />} />

      <Route path="/developers" element={<Developers />} />

      <Route path="/coverage" element={<CoveragePage />} />

      <Route path="/about" element={<About />} />

      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />

      {/* =========================
          System Admin Routes
      ========================== */}

      <Route
        path="/admin"
        element={
          <RoleRoute allowedRoles={[ROLES.SYS_ADMIN]}>
            <SysAdminLayout />
          </RoleRoute>
        }
      >

        <Route
          index
          element={<Navigate to="dashboard" replace />}
        />

        <Route
          path="dashboard"
          element={<Dashboard />}
        />

        <Route
          path="users"
          element={
            <PlaceholderPage
              title="User Management"
              description="Manage system users and role assignments."
            />
          }
        />

        <Route
          path="audit-logs"
          element={
            <PlaceholderPage
              title="Audit Logs"
              description="View system activity and audit trail."
            />
          }
        />

        {/* Districts */}
        <Route
          path="districts"
          element={<District />}
        />

        <Route
          path="districts/add"
          element={<AddDistrict />}
        />

        <Route
          path="districts/edit/:id"
          element={<EditDistrict />}
        />

        {/* Zones */}
        <Route
          path="zones"
          element={<Zone />}
        />

        <Route
          path="zones/add"
          element={<AddZone />}
        />

        <Route
          path="zones/edit/:id"
          element={<EditZone />}
        />

      </Route>

      {/* =========================
          Data Officer Routes
      ========================== */}

      <Route
        path="/officer"
        element={
          <RoleRoute allowedRoles={[ROLES.DATA_OFFICER]}>
            <DataOfficerLayout />
          </RoleRoute>
        }
      >

        <Route
          index
          element={<Navigate to="dashboard" replace />}
        />

        <Route
          path="dashboard"
          element={<Dashboard />}
        />

        <Route
          path="addresses"
          element={
            <PlaceholderPage
              title="Address Registry"
              description="Register and manage digital addresses."
            />
          }
        />

        <Route
          path="districts"
          element={<District />}
        />

        <Route
          path="districts/add"
          element={<AddDistrict />}
        />

        <Route
          path="districts/edit/:id"
          element={<EditDistrict />}
        />

      </Route>

      {/* =========================
          Legacy Redirect
      ========================== */}

      <Route
        path="/dashboard"
        element={<Navigate to="/login" replace />}
      />

      {/* =========================
          Unknown URL
      ========================== */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}

