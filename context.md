# Somalia Digital Address System (SDAS) — Context & Implementation Tracker

## 1. Project Overview & Hierarchy
**Somalia Digital Address System (SDAS)** is a centralized, web-based property and spatial addressing registry developed for the Bile Initiative (Group 6).

### **Primary Hierarchy & DAC Structure**
$$\text{District} \longrightarrow \text{Neighborhood} \longrightarrow \text{Zone} \longrightarrow \text{Address}$$

- **Digital Address Code (DAC) Formula**:  
  `[DISTRICT-CODE]-[NEIGHBORHOOD-CODE]-[ZONE-CODE]-[HOUSE-NUMBER]`
  - *Example*: `HOD-TLX-Z01-0001` (Hodan District / Taleex Neighborhood / Zone 01 / House 0001)

---

## 2. User Roles & Access Control (RBAC)

| Role | Main Responsibility | Target Permissions | Current Status |
|---|---|---|---|
| **Super Admin (`SYS_ADMIN`)** | System & administrative data management | Full CRUD on all levels, user management, audit logs, global search, dashboard | Fully operational |
| **Data Officer (`DATA_OFFICER`)** | Field data entry & spatial address management | Address CRUD, Zone viewing, Neighborhood/District lookup, search | Fully operational (Read-only lookup for administrative boundaries; write restricted to Admin) |
| **Public / Frontdoor** | Citizen lookup & verification | Address Search, Public coverage, Developer API specs, About | Operational |

---

## 3. Comprehensive Feature Status (SRS vs. Current Implementation)

### **A. Core Administrative Modules**

| Feature | SRS Requirement | Backend API Status | Frontend UI Status | Notes / Blockers |
|---|---|---|---|---|
| **Authentication & Session** | FR-01: JWT Auth, HTTP-Only Cookie | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` | Fully connected in `Login.jsx` & `AuthContext.jsx` | Completed |
| **Role-Based Routing** | FR-02: Super Admin vs Data Officer | Granular RBAC Middleware (`protect`, `authorize`) | `RoleRoute.jsx`, `SysAdminLayout.jsx`, `DataOfficerLayout.jsx` | Completed |
| **Districts Management** | FR-03: District CRUD + Delete Protection | `GET, POST, PUT, DELETE /admin/districts` | `Districts.jsx`, `AddDistrict.jsx`, `EditDistrict.jsx` | Fully connected (Read-only for Officer) |
| **Neighborhoods Management** | FR-04: Neighborhood CRUD linked to District | `GET, POST, PUT, DELETE /admin/neighborhoods` | `Neighborhoods.jsx`, `AddNeighborhood.jsx`, `EditNeighborhood.jsx` | Fully connected (Read-only for Officer) |
| **Zones Management** | FR-05: Zone CRUD linked to Neighborhood | Database Model exists in Prisma (`Zone`) | UI prototype screens created (`Zones.jsx`, `AddZone.jsx`, `EditZone.jsx`) | **Pending Backend API Routes** |
| **Addresses Management** | FR-06: Address CRUD + DAC validation | Database Model exists in Prisma (`Address`) | Placeholder route | **Pending Backend API & Frontend UI** |
| **DAC Generation** | FR-07: Automatic code generation | Pending | Pending | Needs formula generator logic on address creation |
| **Cascading Dropdowns** | FR-08: District $\rightarrow$ Neighborhood $\rightarrow$ Zone | Pending | Pending | To be built into Address Creation Form |
| **Global Search** | FR-09: Search by DAC, District, Zone, Street | Pending | Public search exists (`Addresslookup.jsx`); Admin search pending API | Needs dedicated search API endpoint |
| **Dashboard Metrics** | FR-10: Total counts & recent activity | Model count relations exist | Static count cards in `Dashboard.jsx` | Needs `/api/v1/dashboard` summary endpoint |
| **Delete Protection** | FR-11: Block parent deletion if children exist | Enforced in Prisma services (`district.service.js`, `neighborhood.service.js`) | Error handling in UI displays server constraint message | Completed for Districts & Neighborhoods |
| **GIS & Leaflet Map** | FR-15, FR-16, FR-17: Zone boundary polygons & GPS coords | PostGIS `geometry` column in Prisma schema | Prototype map component | Needs Leaflet polygon drawing & PostGIS integration |

---

## 4. Current Work Completed & What Remains

### **What is ALREADY DONE**
- **Granular Role-Based Access Control (RBAC)**: Configured method-level authorization in backend (`GET` allowed for `SYS_ADMIN` and `DATA_OFFICER`, while `POST`/`PUT`/`DELETE` strictly restricted to `SYS_ADMIN`).
- **Public Frontdoor**: Clean landing page, header, navigation, coverage view, and public address lookup.
- **Authentication**: Enterprise login page with official SDAS branding, session persistence, role decoding, and logout flow.
- **Layouts & Navigation**: Clean collapsible navigation sidebars for `SYS_ADMIN` and `DATA_OFFICER`.
- **Districts**: Full end-to-end integration (Database $\leftrightarrow$ Express API $\leftrightarrow$ React Frontend CRUD with role-based action controls).
- **Regions**: Backend CRUD and Frontend Service integration (`regionApi.js`) used as parent selector for districts.
- **Neighborhoods**: Full end-to-end integration (Database $\leftrightarrow$ Express API $\leftrightarrow$ React Frontend CRUD with parent District selection and role-based action controls).
- **Database Schema**: PostgreSQL with Prisma schema covering Users, Regions, Districts, Neighborhoods, Zones, Addresses, and Audit Logs.

---

### **What is NOT YET DONE (Remaining Scope)**

1. **Zones API & Spatial Integration**:
   - Create `backend/src/routes/zone.routes.js` and `backend/src/service/zone.service.js`.
   - Connect `src/api/zoneApi.js` to `Zones.jsx`, `AddZone.jsx`, and `EditZone.jsx`.
   - Add Leaflet boundary polygon drawing and visualization.
2. **Addresses API & Cascading Form**:
   - Create `backend/src/routes/address.routes.js` and `backend/src/service/address.service.js`.
   - Build Address List, Add Address with cascading District $\rightarrow$ Neighborhood $\rightarrow$ Zone selector, automatic DAC generator, and GPS coordinate capture.
3. **Dashboard Summary API**:
   - Create `GET /api/v1/dashboard` endpoint to provide dynamic counters (Districts, Neighborhoods, Zones, Addresses) and recent activity logs to replace static numbers in `Dashboard.jsx`.
4. **Users & Audit Logs Management**:
   - Wire user management for `SYS_ADMIN` and populate system activity trails from the `audit_logs` table.
