# SDAS Field Workflow — Implementation Tasks

Track implementation of the assignment-based field workflow:

```
Admin defines neighborhood boundary
        ↓
Officer: DEFINE_ZONES assignment → admin approves
        ↓
Officer: REGISTER_ADDRESSES assignment (per zone) → admin approves
        ↓
Published DAC addresses usable in registry + public lookup
```

**DAC format:** `[DISTRICT]-[NEIGHBORHOOD]-[ZONE]-[HOUSE]` (e.g. `HOD-TLX-Z01-0001`)

---

## Decisions (locked for implementation)

| # | Decision | Choice |
|---|----------|--------|
| 1 | One zone per address assignment | Yes |
| 2 | Neighborhood geometry required before zone assignments | No (optional; validate when present) |
| 3 | Allow overlapping zones in same neighborhood | No |
| 4 | Admin direct address create | Keep as override for now |
| 5 | House number order on approve | Draft list order |
| 6 | Reuse deleted house numbers | No (keep max+1 behavior) |
| 7 | Officer portal menus | My Assignments + Logout only (no Settings) |

---

## Phase 0 — Already done

- [x] `Assignment` model + migration
- [x] `DEFINE_ZONES` API (create, draft, submit, approve, reject)
- [x] Admin assignments UI (list, create, review)
- [x] Officer portal limited to **My Assignments**
- [x] Officer zone draft UI (map + save draft + submit)
- [x] Shared `ConfirmDialog` (replaces native `confirm` / `alert`)
- [x] Officer address CRUD blocked on backend
- [x] Auto DAC generation logic (`getNextHouseNumber` + `buildDac`)
- [x] Prisma CLI upgraded to v7

---

## Phase 1 — Neighborhood geometry (admin boundary) ✅

**Goal:** Admin can draw the official neighborhood polygon. This becomes the parent boundary for zone validation and map context.

### Backend

- [x] **1.1** Add nullable `geometry` column to `Neighborhood` (PostGIS, same pattern as `Zone`)
- [x] **1.2** Create and apply Prisma migration
- [x] **1.3** Update `neighborhood.service.js`:
  - [x] Create neighborhood with optional polygon
  - [x] Update neighborhood with optional polygon
  - [x] Return geometry as GeoJSON on read (`ST_AsGeoJSON`)
- [x] **1.4** Update neighborhood controller/routes to accept `geometry` in body
- [x] **1.5** Validate polygon GeoJSON on create/update (reuse `geojson.utils.js`)

### Frontend

- [x] **1.6** Update `neighborhoodApi.js` to send/receive geometry
- [x] **1.7** Add map editor to `AddNeighborhood.jsx` (draw boundary polygon)
- [x] **1.8** Add map editor to `EditNeighborhood.jsx` (view/edit boundary)
- [ ] **1.9** (Optional) Show neighborhood boundary preview on neighborhood list or view page

### Acceptance criteria

- [x] Admin can draw/edit neighborhood polygon on create and edit
- [x] Neighborhood API returns geometry as GeoJSON
- [x] Neighborhoods without geometry still work (field is nullable)

---

## Phase 2 — Spatial validation for zones ✅

**Goal:** Officer-drawn zones must stay inside the neighborhood boundary and must not overlap each other.

### Backend

- [x] **2.1** Add PostGIS helpers (`geo.validation.utils.js`)
- [x] **2.2** On `DEFINE_ZONES` submit: validate geometry, within-neighborhood, no overlaps, no code conflicts
- [x] **2.3** On `DEFINE_ZONES` approve: re-run validations before creating zones
- [x] **2.4** Return clear per-zone error messages

### Frontend

- [x] **2.5** Show neighborhood boundary on map as read-only layer (when available)
- [x] **2.6** Admin review page shows neighborhood + draft zone polygons together

### Acceptance criteria

- [x] Zone outside neighborhood → submit blocked with clear message
- [x] Overlapping zone drafts → submit blocked
- [x] When neighborhood has no geometry → skip boundary check (no error)

---

## Phase 3 — `REGISTER_ADDRESSES` assignment type ✅

**Goal:** Admin assigns an officer to register addresses inside a specific zone. Officer drafts pins; admin approves; system assigns DACs.

### Backend — Schema

- [x] **3.1** Extend `AssignmentType` enum: add `REGISTER_ADDRESSES`
- [x] **3.2** Add optional `zoneId` to `Assignment` (required when `type = REGISTER_ADDRESSES`)
- [x] **3.3** Create and apply migration

### Backend — Assignment service

- [x] **3.4**–**3.9** Full `REGISTER_ADDRESSES` create, draft, submit, approve, reject flow
- [x] **3.10** `createAddressesFromDraftBatch` in `address.service.js`

### Frontend

- [x] **3.11**–**3.15** Admin + officer UI for both assignment types

### Acceptance criteria

- [x] Admin can assign officer to register addresses in a specific zone
- [x] Officer can draft multiple address pins, save, and submit
- [x] Admin approves → addresses created with sequential DACs
- [x] Pin outside zone → submit blocked
- [x] Officer cannot create addresses outside an assignment

---

## Phase 4 — Permissions and workflow rules ✅

- [x] **4.1** `POST/PUT/DELETE /admin/addresses` blocked for `DATA_OFFICER`
- [x] **4.2** Reject `REGISTER_ADDRESSES` if target zone has no geometry
- [ ] **4.3** Optional: prevent duplicate active assignments (same zone + type + officer)
- [x] **4.4** Admin direct address create kept as override
- [x] **4.5** No officer routes to `/officer/addresses/*`

---

## Phase 5 — Map UX polish ✅

- [x] **5.1** Shared map layers: neighborhood boundary, zone boundary, address pins
- [x] **5.2** Auto fit map bounds when opening assignment
- [x] **5.3** Map legend on assignment work pages
- [x] **5.4** Modals use portal + high z-index (`ConfirmDialog`)

---

## Phase 6 — Settings wiring ✅

- [x] **6.1** Wire `dac_house_number_pad` from `AppSetting` into address DAC generation
- [x] **6.2** Wire `public_lookup_enabled` to block public address lookup when false
- [ ] **6.3** Document house numbering rules in settings descriptions / admin UI

---

## Phase 7 — Documentation, seed data, and tests

### Documentation

- [ ] **7.1** Update `context.md`:
  - [ ] Assignment types and statuses
  - [ ] Officer vs admin permissions
  - [ ] Spatial hierarchy (neighborhood → zone → address)
  - [ ] DAC numbering rules
- [ ] **7.2** Keep this `tasks.md` updated as tasks are completed

### Seed data

- [ ] **7.3** Seed sample neighborhood with geometry
- [ ] **7.4** Seed sample zones inside neighborhood
- [ ] **7.5** Seed sample assignments (`DEFINE_ZONES` + `REGISTER_ADDRESSES`) for demo/testing

### End-to-end test plan

- [ ] **7.6** Admin creates neighborhood with boundary polygon
- [ ] **7.7** Admin assigns Define Zones → officer draws Z01, Z02 inside boundary → submit → approve
- [ ] **7.8** Admin assigns Register Addresses for Z01 → officer adds 3 pins → submit → approve
- [ ] **7.9** Verify DACs: `HOD-TLX-Z01-0001`, `0002`, `0003`
- [ ] **7.10** Public lookup returns correct address data
- [ ] **7.11** Reject flow: admin rejects → officer fixes → resubmits → approves
- [ ] **7.12** Validation: pin outside zone → submit fails
- [ ] **7.13** Validation: zone outside neighborhood → zone submit fails

---

## Suggested implementation order

| Order | Phase | Focus |
|-------|-------|--------|
| 1 | Phase 1 | Neighborhood geometry (admin) |
| 2 | Phase 2 | Zone-within-neighborhood validation |
| 3 | Phase 3 | `REGISTER_ADDRESSES` backend |
| 4 | Phase 3 | `REGISTER_ADDRESSES` frontend |
| 5 | Phase 4 | Permissions hardening |
| 6 | Phase 5 | Map UX polish |
| 7 | Phase 6–7 | Settings wiring + docs + seed |

**Status:** Phases 0–6 implemented. Run `npm run db:seed` in `backend/` for demo data (Hodan / Taleex / Z01 + sample assignments).

---

## Key files (reference)

### Backend

- `backend/prisma/schema.prisma`
- `backend/src/service/neighborhood.service.js`
- `backend/src/service/assignment.service.js`
- `backend/src/service/address.service.js`
- `backend/src/controllers/assignment.controller.js`
- `backend/src/utils/geojson.utils.js`
- `backend/src/utils/geo.validation.utils.js` (new)

### Frontend

- `frontend/src/pages/neighborhoods/AddNeighborhood.jsx`
- `frontend/src/pages/neighborhoods/EditNeighborhood.jsx`
- `frontend/src/pages/assignments/AddAssignment.jsx`
- `frontend/src/pages/assignments/AssignmentDetail.jsx`
- `frontend/src/pages/assignments/Assignments.jsx`
- `frontend/src/pages/dashboard/OfficerDashboard.jsx`
- `frontend/src/api/assignmentApi.js`
- `frontend/src/api/neighborhoodApi.js`
- `frontend/src/components/zones/ZoneMapEditor.jsx` (or shared boundary editor)

---

## Future (out of scope for this workflow)

- Audit logs API + UI
- Admin global search
- `DEFINE_NEIGHBORHOOD_BOUNDARY` as separate officer assignment (vs admin draw on CRUD)
- District / region geometry
- Address correction / reassignment assignments
- Notifications when assignment is assigned, rejected, or approved
