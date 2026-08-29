import { Navigate, Route, Routes } from "react-router-dom";
import { ROLES } from "@/constants/roles";
import RoleRoute from "./RoleRoute";
import GuestRoute from "./GuestRoute";
import SysAdminLayout from "@/layouts/SysAdminLayout";
import DataOfficerLayout from "@/layouts/DataOfficerLayout";
import Login from "@/pages/auth/Login";
import Dashboard from "@/pages/dashboard/Dashboard";
import PlaceholderPage from "@/pages/admin/PlaceholderPage";

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
      {/* Public routes */}
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

      {/* System Admin routes */}
      <Route
        path="/admin"
        element={
          <RoleRoute allowedRoles={[ROLES.SYS_ADMIN]}>
            <SysAdminLayout />
          </RoleRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route
          path="districts"
          element={
            <PlaceholderPage
              title="District Management"
              description="Manage districts, boundaries, and regional administrative codes."
            />
          }
        />
        <Route
          path="neighborhoods"
          element={
            <PlaceholderPage
              title="Neighborhood Management"
              description="Manage local neighborhoods and residential sub-zones."
            />
          }
        />
        <Route
          path="zones"
          element={
            <PlaceholderPage
              title="Zone Management"
              description="Configure cadastral zones and geographic sectors."
            />
          }
        />
        <Route
          path="addresses"
          element={
            <PlaceholderPage
              title="Address Registry"
              description="Register, verify, and manage digital property addresses."
            />
          }
        />
        <Route
          path="search"
          element={
            <PlaceholderPage
              title="Address Lookup & Search"
              description="Query and inspect registered digital addresses and geographic coordinates."
            />
          }
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
        <Route
          path="settings"
          element={
            <PlaceholderPage
              title="System Settings"
              description="Configure portal preferences, security protocols, and system parameters."
            />
          }
        />
      </Route>

      {/* Data Officer routes */}
      <Route
        path="/officer"
        element={
          <RoleRoute allowedRoles={[ROLES.DATA_OFFICER]}>
            <DataOfficerLayout />
          </RoleRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route
          path="districts"
          element={
            <PlaceholderPage
              title="District Management"
              description="Manage districts, boundaries, and regional administrative codes."
            />
          }
        />
        <Route
          path="neighborhoods"
          element={
            <PlaceholderPage
              title="Neighborhood Management"
              description="Manage local neighborhoods and residential sub-zones."
            />
          }
        />
        <Route
          path="zones"
          element={
            <PlaceholderPage
              title="Zone Management"
              description="Configure cadastral zones and geographic sectors."
            />
          }
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
          path="search"
          element={
            <PlaceholderPage
              title="Address Lookup & Search"
              description="Query and inspect registered digital addresses and geographic coordinates."
            />
          }
        />
        <Route
          path="settings"
          element={
            <PlaceholderPage
              title="Officer Settings"
              description="Configure officer account and display preferences."
            />
          }
        />
      </Route>

      {/* Legacy redirect */}
      <Route path="/dashboard" element={<Navigate to="/login" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
