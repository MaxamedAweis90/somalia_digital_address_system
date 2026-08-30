import { Navigate, Route, Routes } from "react-router-dom";
import { ROLES } from "@/constants/roles";
import RoleRoute from "./RoleRoute";
import GuestRoute from "./GuestRoute";
import SysAdminLayout from "@/layouts/SysAdminLayout";
import DataOfficerLayout from "@/layouts/DataOfficerLayout";
import Login from "@/pages/auth/Login";
import Dashboard from "@/pages/dashboard/Dashboard";
import PlaceholderPage from "@/pages/admin/PlaceholderPage";

// Region, District, Zone & Neighborhood pages
import Regions from "@/pages/regions/Regions";
import AddRegion from "@/pages/regions/AddRegion";
import EditRegion from "@/pages/regions/EditRegion";
import Districts from "@/pages/districts/Districts";
import AddDistrict from "@/pages/districts/AddDistrict";
import EditDistrict from "@/pages/districts/EditDistrict";
import Zones from "@/pages/zones/Zones";
import AddZone from "@/pages/zones/AddZone";
import EditZone from "@/pages/zones/EditZone";
import ViewZone from "@/pages/zones/ViewZone";
import Addresses from "@/pages/addresses/Addresses";
import AddAddress from "@/pages/addresses/AddAddress";
import EditAddress from "@/pages/addresses/EditAddress";
import ViewAddress from "@/pages/addresses/ViewAddress";
import Neighborhoods from "@/pages/neighborhoods/Neighborhoods";
import AddNeighborhood from "@/pages/neighborhoods/AddNeighborhood";
import EditNeighborhood from "@/pages/neighborhoods/EditNeighborhood";

import DataOfficers from "@/pages/data-officers/DataOfficers";
import AddDataOfficer from "@/pages/data-officers/AddDataOfficer";
import EditDataOfficer from "@/pages/data-officers/EditDataOfficer";
import Settings from "@/pages/settings/Settings";

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

        {/* Region routes (Full CRUD) */}
        <Route path="regions" element={<Regions />} />
        <Route path="regions/add" element={<AddRegion />} />
        <Route path="regions/edit/:id" element={<EditRegion />} />

        {/* District routes (Full CRUD) */}
        <Route path="districts" element={<Districts />} />
        <Route path="districts/add" element={<AddDistrict />} />
        <Route path="districts/edit/:id" element={<EditDistrict />} />
        <Route path="districts/:id" element={<EditDistrict />} />

        {/* Neighborhood routes (Full CRUD) */}
        <Route path="neighborhoods" element={<Neighborhoods />} />
        <Route path="neighborhoods/add" element={<AddNeighborhood />} />
        <Route path="neighborhoods/edit/:id" element={<EditNeighborhood />} />
        <Route path="neighborhoods/:id" element={<EditNeighborhood />} />

        {/* Zone routes */}
        <Route path="zones" element={<Zones />} />
        <Route path="zones/add" element={<AddZone />} />
        <Route path="zones/view/:id" element={<ViewZone />} />
        <Route path="zones/edit/:id" element={<EditZone />} />

        {/* Address routes */}
        <Route path="addresses" element={<Addresses />} />
        <Route path="addresses/add" element={<AddAddress />} />
        <Route path="addresses/view/:id" element={<ViewAddress />} />
        <Route path="addresses/edit/:id" element={<EditAddress />} />

        {/* Other routes */}
        <Route
          path="search"
          element={
            <PlaceholderPage
              title="Address Lookup & Search"
              description="Query and inspect registered digital addresses and geographic coordinates."
            />
          }
        />
        <Route path="data-officers" element={<DataOfficers />} />
        <Route path="data-officers/add" element={<AddDataOfficer />} />
        <Route path="data-officers/edit/:id" element={<EditDataOfficer />} />
        <Route
          path="audit-logs"
          element={
            <PlaceholderPage
              title="Audit Logs"
              description="View system activity and audit trail."
            />
          }
        />
        <Route path="settings" element={<Settings />} />
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

        {/* Region, District & Neighborhood routes (Read-only views for field lookup & reference) */}
        <Route path="regions" element={<Regions />} />
        <Route path="districts" element={<Districts />} />
        <Route path="neighborhoods" element={<Neighborhoods />} />

        {/* Zone routes */}
        <Route path="zones" element={<Zones />} />
        <Route path="zones/add" element={<AddZone />} />
        <Route path="zones/view/:id" element={<ViewZone />} />
        <Route path="zones/edit/:id" element={<EditZone />} />

        {/* Address routes */}
        <Route path="addresses" element={<Addresses />} />
        <Route path="addresses/add" element={<AddAddress />} />
        <Route path="addresses/view/:id" element={<ViewAddress />} />
        <Route path="addresses/edit/:id" element={<EditAddress />} />

        {/* Other routes */}
        <Route
          path="search"
          element={
            <PlaceholderPage
              title="Address Lookup & Search"
              description="Query and inspect registered digital addresses and geographic coordinates."
            />
          }
        />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Legacy redirect */}
      <Route path="/dashboard" element={<Navigate to="/login" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
