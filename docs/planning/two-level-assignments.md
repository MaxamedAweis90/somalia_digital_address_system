# Two-Level Assignments — Implementation Plan

**Epic:** Three-tier field workflow (Admin → Data Officer → Data Collector)  
**Status:** Planning complete — ready for Issue 2 (foundation) and Issue 3 (workflow)  
**Depends on:** Phases 0–6 of `tasks.md` (single-level assignments, spatial validation, `REGISTER_ADDRESSES`)

---

## 1. Overview

Today, **Admin** assigns work directly to a **Data Officer**, who does field work and submits to **Admin** for approval. This plan introduces a **Data Collector** role and **parent/child assignments** so officers supervise 30–100 collectors instead of doing all map work themselves.

```
Admin
  │  creates PARENT assignment → Data Officer
  │
Data Officer
  │  creates CHILD assignments → Data Collectors (under supervision)
  │  reviews child submissions (approve / reject)
  │  merges approved children → submits PARENT to Admin
  │
Data Collector
  │  field work on CHILD only (zones or addresses)
  │  submits to Officer (never to Admin)
  │
Admin
     final approve / reject PARENT → publish zones or issue DACs
```

**Assignment types unchanged:** `DEFINE_ZONES`, `REGISTER_ADDRESSES`  
**Addressing remains manual:** one building = one draft row; DACs issued on admin approve of merged parent.

---

## 2. Locked rules (do not change without explicit decision)

| # | Rule | Choice |
|---|------|--------|
| R1 | Admin assigns **parent** tasks only | Always to `DATA_OFFICER`, never directly to collector |
| R2 | Officer creates **child** tasks only | Only under a parent they own; only to collectors they supervise |
| R3 | Collector submit target | Officer only — collectors cannot call admin submit/approve |
| R4 | Admin publish target | Parent assignment only — admin never approves children directly |
| R5 | One collector → one officer | `User.supervisorId` (no multi-supervisor at launch) |
| R6 | Officer field work | **Disabled** at launch — officer supervises, does not draw/submit child payloads themselves |
| R7 | Child payload shape | Same JSON as today (`zones[]` or `addresses[]`) |
| R8 | Merge before admin submit | Officer merges all **approved** children into parent `payload` |
| R9 | Spatial validation on merge | Re-run zone overlap / within-neighborhood / pin-in-zone on **merged** parent before admin submit |
| R10 | DAC house order on approve | Merged list order: children ordered by officer-defined `mergeOrder` or `createdAt` |
| R11 | Reject child | Collector can edit and resubmit; parent stays `IN_PROGRESS` |
| R12 | Reject parent (admin) | Officer fixes (re-delegate or merge again); children not auto-rejected |
| R13 | Collector portal scope | My Tasks + Logout only (mirror current officer minimal nav) |
| R14 | Admin address override | Keep direct admin address create as escape hatch |
| R15 | One zone per `REGISTER_ADDRESSES` parent | Unchanged; children split **within** that zone via `scope` |

---

## 3. Schema changes

### 3.1 `UserRole` enum

```prisma
enum UserRole {
  SYS_ADMIN
  DATA_OFFICER
  DATA_COLLECTOR   // NEW
}
```

### 3.2 `User` model

```prisma
model User {
  // ... existing fields
  supervisorId  String?  @map("supervisor_id")
  supervisor    User?    @relation("UserSupervision", fields: [supervisorId], references: [id])
  supervisees   User[]   @relation("UserSupervision")

  @@index([supervisorId], map: "user_supervisor_index")
}
```

**Constraints:**

- `DATA_COLLECTOR` must have `supervisorId` pointing to a `DATA_OFFICER`
- `DATA_OFFICER` and `SYS_ADMIN` have `supervisorId = null`
- Officer can only assign children to users where `supervisorId = officer.id`

### 3.3 `Assignment` model

```prisma
model Assignment {
  // ... existing fields
  parentAssignmentId  String?  @map("parent_assignment_id")
  tier                AssignmentTier  @default(PARENT)  // PARENT | CHILD
  scope               Json?    // optional sub-area / instructions
  mergeOrder          Int?     @map("merge_order")   // child ordering when merging
  officerReviewedAt   DateTime? @map("officer_reviewed_at")
  officerReviewedById String?  @map("officer_reviewed_by_id")

  parent    Assignment?  @relation("AssignmentChildren", fields: [parentAssignmentId], references: [id])
  children  Assignment[] @relation("AssignmentChildren")

  @@index([parentAssignmentId], map: "assignment_parent_index")
  @@index([tier, status], map: "assignment_tier_status_index")
}

enum AssignmentTier {
  PARENT
  CHILD
}
```

**Invariants:**

| Field | Parent | Child |
|-------|--------|-------|
| `parentAssignmentId` | `null` | required |
| `tier` | `PARENT` | `CHILD` |
| `assignedById` | Admin | Officer |
| `assignedToId` | Officer | Collector |
| `assignedTo` role | `DATA_OFFICER` | `DATA_COLLECTOR` |

### 3.4 `scope` JSON (optional, on child)

```json
{
  "label": "North block — Wadada Taleex",
  "instructions": "Register compounds on the north side of the street only",
  "maxAddresses": 50,
  "geometry": { "type": "Polygon", "coordinates": [[...]] }
}
```

**Validation (Issue 3):**

- If `scope.geometry` present: pins must be within scope **and** zone (for `REGISTER_ADDRESSES`)
- If `scope.maxAddresses` present: child `addresses.length` cannot exceed on submit

### 3.5 Migration strategy

1. Add enum value `DATA_COLLECTOR`, columns, indexes, self-relation on `Assignment`
2. Backfill existing assignments: `tier = PARENT`, `parentAssignmentId = null`
3. Existing officer-as-worker assignments remain valid parents until migrated operationally

---

## 4. Status model

### 4.1 Child assignment (Collector → Officer)

| Status | Who acts | Meaning |
|--------|----------|---------|
| `ASSIGNED` | Collector | Task created by officer; not started |
| `IN_PROGRESS` | Collector | Draft saved |
| `SUBMITTED` | Officer | Collector submitted for officer review |
| `REJECTED` | Collector | Officer rejected; collector may edit |
| `APPROVED` | — | Officer accepted child work (terminal for child) |

**Child transitions:**

```
ASSIGNED → IN_PROGRESS (save draft)
IN_PROGRESS → SUBMITTED (collector submit)
SUBMITTED → APPROVED | REJECTED (officer review)
REJECTED → IN_PROGRESS (collector save draft)
REJECTED → SUBMITTED (collector resubmit)
```

### 4.2 Parent assignment (Officer → Admin)

| Status | Who acts | Meaning |
|--------|----------|---------|
| `ASSIGNED` | Officer | Admin created; no children or not started |
| `IN_PROGRESS` | Officer | Children exist and/or delegation in progress |
| `READY_FOR_REVIEW` | Officer | All required children `APPROVED`; officer may merge & submit |
| `SUBMITTED` | Admin | Officer submitted merged parent |
| `REJECTED` | Officer | Admin rejected; officer must fix |
| `APPROVED` | — | Admin published zones/addresses (terminal) |

**Parent transitions:**

```
ASSIGNED → IN_PROGRESS (first child created or officer opens task)
IN_PROGRESS → READY_FOR_REVIEW (all children approved — auto or manual flag)
READY_FOR_REVIEW → SUBMITTED (officer merge + submit to admin)
SUBMITTED → APPROVED | REJECTED (admin)
REJECTED → IN_PROGRESS (officer fixes)
```

**New enum values required:** extend `AssignmentStatus` with `READY_FOR_REVIEW` (or compute client-side from children counts until submit).

**Recommendation:** Add `READY_FOR_REVIEW` to DB enum for clear officer UX.

### 4.3 Status responsibility matrix

| Action | Child status after | Parent status after |
|--------|-------------------|---------------------|
| Officer creates child | child: `ASSIGNED` | parent: `IN_PROGRESS` |
| Collector submits | child: `SUBMITTED` | parent: unchanged |
| Officer approves child | child: `APPROVED` | parent: `READY_FOR_REVIEW` if all children approved |
| Officer rejects child | child: `REJECTED` | parent: `IN_PROGRESS` |
| Officer merge + submit | children: unchanged | parent: `SUBMITTED` |
| Admin approves | — | parent: `APPROVED` |

---

## 5. API endpoints

### 5.1 Current (to refactor)

| Method | Path | Roles today | Change |
|--------|------|-------------|--------|
| `GET` | `/admin/assignments` | Admin | Parents only (filter `tier=PARENT`) |
| `POST` | `/admin/assignments` | Admin | Creates **parent** only |
| `GET` | `/admin/assignments/my` | Officer | Split → parents for officer |
| `GET` | `/admin/assignments/:id` | Admin, Officer | + collector; enforce access by tier |
| `PUT` | `/admin/assignments/:id/draft` | Officer | → **Collector** for children; officer cannot draft child work |
| `POST` | `/admin/assignments/:id/submit` | Officer | → **Collector** for children |
| `POST` | `/admin/assignments/:id/approve` | Admin | Parents only |
| `POST` | `/admin/assignments/:id/reject` | Admin | Parents only |

### 5.2 New endpoints (Issue 2 + 3)

#### User / team management

| Method | Path | Roles | Purpose |
|--------|------|-------|---------|
| `GET` | `/admin/data-collectors` | Admin | List all collectors (optional filter by officer) |
| `GET` | `/officer/collectors` | Officer | List my supervisees |
| `POST` | `/officer/collectors` | Officer | Create collector account under me |
| `PUT` | `/officer/collectors/:id` | Officer | Update name, active flag (not supervisor) |
| `PATCH` | `/officer/collectors/:id/status` | Officer | Activate/deactivate collector |

*Alternative:* extend existing `/admin/data-officers` pattern as `data-collector.service.js` + routes.

#### Parent assignments (officer)

| Method | Path | Roles | Purpose |
|--------|------|-------|---------|
| `GET` | `/officer/assignments` | Officer | My **parent** assignments |
| `GET` | `/officer/assignments/:parentId/children` | Officer | List children for a parent |
| `POST` | `/officer/assignments/:parentId/children` | Officer | Create child task |
| `DELETE` | `/officer/assignments/:childId` | Officer | Delete child if `ASSIGNED` only (no draft) |

#### Child workflow (collector)

| Method | Path | Roles | Purpose |
|--------|------|-------|---------|
| `GET` | `/collector/assignments` | Collector | My child tasks |
| `GET` | `/collector/assignments/:id` | Collector | Child detail |
| `PUT` | `/collector/assignments/:id/draft` | Collector | Save draft |
| `POST` | `/collector/assignments/:id/submit` | Collector | Submit to officer |

#### Officer review & merge

| Method | Path | Roles | Purpose |
|--------|------|-------|---------|
| `GET` | `/officer/reviews` | Officer | Children in `SUBMITTED` status |
| `POST` | `/officer/assignments/:childId/approve` | Officer | Approve child |
| `POST` | `/officer/assignments/:childId/reject` | Officer | Reject child + reason |
| `POST` | `/officer/assignments/:parentId/merge` | Officer | Merge approved children → parent payload |
| `POST` | `/officer/assignments/:parentId/submit` | Officer | Submit parent to admin |

#### Admin (unchanged paths, stricter rules)

| Method | Path | Roles | Purpose |
|--------|------|-------|---------|
| `POST` | `/admin/assignments/:id/approve` | Admin | Parent only; existing zone/address publish logic |
| `POST` | `/admin/assignments/:id/reject` | Admin | Parent only |

### 5.3 Route mounting (proposed)

```
/admin/assignments/*     → SYS_ADMIN (parents)
/officer/assignments/*   → DATA_OFFICER
/officer/collectors/*    → DATA_OFFICER
/collector/assignments/* → DATA_COLLECTOR
```

Keep shared read routes (`GET` districts/neighborhoods/zones) open to all three field roles for map context.

---

## 6. Permission matrix

| Action | SYS_ADMIN | DATA_OFFICER | DATA_COLLECTOR |
|--------|-----------|--------------|----------------|
| CRUD regions/districts/neighborhoods | ✅ | ❌ | ❌ |
| CRUD zones/addresses directly | ✅ | ❌ | ❌ |
| Create parent assignment | ✅ | ❌ | ❌ |
| View all parent assignments | ✅ | Own only | ❌ |
| Create child assignment | ❌ | ✅ (own parent) | ❌ |
| View child assignments | All (admin) | Own team's | Own only |
| Save draft (zones/addresses) | ❌ | ❌ | ✅ (own child) |
| Submit to officer | ❌ | ❌ | ✅ |
| Approve/reject child | ❌ | ✅ | ❌ |
| Merge children → parent | ❌ | ✅ | ❌ |
| Submit parent to admin | ❌ | ✅ | ❌ |
| Approve/reject parent (publish) | ✅ | ❌ | ❌ |
| Create collector accounts | ✅ | ✅ (under self) | ❌ |
| Reassign collector to another officer | ✅ | ❌ | ❌ |
| Preview next DAC code | ✅ | ✅ | ✅ |
| Settings write | ✅ | ❌ | ❌ |
| Public lookup | ✅ | ✅ | ✅ |

---

## 7. UI screens by portal

### 7.1 Admin (`/admin/*`) — changes from today

| Screen | Purpose | Changes |
|--------|---------|---------|
| **Assignments list** | All parent tasks | Filter `tier=PARENT`; show officer name, child progress (`3/5 approved`) |
| **Add assignment** | New parent task | Unchanged flow; assignee dropdown = officers only |
| **Assignment detail** | Review submitted parent | Read-only merged map; approve/reject; no child editing |
| **Users** (future) | Manage officers | Optional: link to officer's collector count |

### 7.2 Data Officer (`/officer/*`) — major expansion

| Screen | Route | Purpose |
|--------|-------|---------|
| **Dashboard** | `/officer/dashboard` | Parent task summary + pending reviews count |
| **My assignments** | `/officer/assignments` | Parent list with child progress bars |
| **Parent detail** | `/officer/assignments/:id` | Overview, delegate, merge, submit to admin |
| **Delegate child** | `/officer/assignments/:id/delegate` | Form: collector, label, scope, due date |
| **Review queue** | `/officer/reviews` | Submitted children; map preview; approve/reject |
| **Child detail (read-only)** | `/officer/assignments/:parentId/children/:childId` | Review collector submission |
| **My team** | `/officer/collectors` | List collectors; add / deactivate |
| **Add collector** | `/officer/collectors/add` | Name, email, temp password |

**Remove from officer:** direct map editing on parent (officer no longer does field work).

### 7.3 Data Collector (`/collector/*`) — new portal

| Screen | Route | Purpose |
|--------|-------|---------|
| **Dashboard** | `/collector/dashboard` | My tasks + workflow guide |
| **Task detail** | `/collector/assignments/:id` | Reuse `DefineZonesAssignment` / `RegisterAddressesAssignment` in collector mode |
| **Layout** | `DataCollectorLayout` | My Tasks + Logout only |

### 7.4 Shared components (reuse)

- `DefineZonesAssignment.jsx` — add `mode: 'collector' | 'officer-review' | 'admin-review'`
- `RegisterAddressesAssignment.jsx` — same
- `ZoneMapEditor.jsx`, `AddressDraftMap.jsx`, `ConfirmDialog.jsx`, `OfficerWorkflowGuide.jsx`

---

## 8. Issue 2 — Foundation (backend / schema / auth)

**Goal:** Roles, relationships, and parent/child CRUD work via API. No merge or officer review UI yet.

**Depends on:** Nothing (first build issue)  
**Blocks:** Issue 3

### 8.1 Schema & migration

- [ ] **2.1** Add `DATA_COLLECTOR` to `UserRole` enum
- [ ] **2.2** Add `supervisorId` to `User` + self-relation + index
- [ ] **2.3** Add `AssignmentTier` enum (`PARENT`, `CHILD`)
- [ ] **2.4** Add `parentAssignmentId`, `tier`, `scope`, `mergeOrder`, `officerReviewedAt`, `officerReviewedById` to `Assignment`
- [ ] **2.5** Add `READY_FOR_REVIEW` to `AssignmentStatus` enum
- [ ] **2.6** Create migration; backfill existing rows as `tier = PARENT`
- [ ] **2.7** Run `prisma generate`

### 8.2 Auth & middleware

- [ ] **2.8** Add `DATA_COLLECTOR` to `frontend/src/constants/roles.js` + `ROLE_HOME` → `/collector/dashboard`
- [ ] **2.9** Update `authorize()` usage; add `assertSupervisor`, `assertParentOwner`, `assertChildAssignee` helpers
- [ ] **2.10** Login redirect supports collector role
- [ ] **2.11** `RoleRoute` + new `DataCollectorLayout` shell (empty outlet OK for this issue)

### 8.3 Data collector user management

- [ ] **2.12** `data-collector.service.js` — create/list/update under officer
- [ ] **2.13** `data-collector.controller.js` + `/officer/collectors` routes
- [ ] **2.14** Admin read-only list endpoint (optional)
- [ ] **2.15** Validate: collector creation sets `supervisorId = officer.id`, role = `DATA_COLLECTOR`

### 8.4 Assignment service refactor (CRUD only)

- [ ] **2.16** `createAssignment` (admin) — always creates `tier = PARENT`, `assignedTo` officer
- [ ] **2.17** `createChildAssignment` (officer) — validates parent ownership + supervisee
- [ ] **2.18** `getAssignments` — admin: parents only; officer: my parents; collector: my children
- [ ] **2.19** `getAssignmentById` — enforce tier + role access
- [ ] **2.20** `deleteChildAssignment` — officer only, status `ASSIGNED` only
- [ ] **2.21** Refactor existing `saveDraft` / `submit` / `approve` / `reject` to tier-aware stubs (collector draft/submit wired; admin approve parent only)

### 8.5 Routes

- [ ] **2.22** Mount `/officer/assignments` router
- [ ] **2.23** Mount `/collector/assignments` router
- [ ] **2.24** Restrict legacy `/admin/assignments/my` + officer draft routes (deprecate officer as worker)

### 8.6 Seed & docs

- [ ] **2.25** Seed: 2 collectors under demo officer, 1 parent + 2 children (empty payloads)
- [ ] **2.26** Update `tasks.md` Phase 8 reference

### 8.7 Issue 2 acceptance criteria

- [ ] Admin can create parent assignment assigned to officer
- [ ] Officer can create child under parent for supervised collector only
- [ ] Officer cannot assign child to another officer's collector
- [ ] Collector can `GET` own children only
- [ ] Collector can save draft on child (`PUT .../draft`)
- [ ] Existing single-tier assignments still load as parents
- [ ] API returns 403 for cross-team access attempts

### 8.8 Issue 2 manual API test script

1. Login admin → `POST /admin/assignments` (parent, officer assignee)
2. Login officer → `POST /officer/collectors` → create collector
3. Officer → `POST /officer/assignments/:parentId/children`
4. Login collector → `GET /collector/assignments` → see child
5. Collector → `PUT /collector/assignments/:id/draft` with sample payload

---

## 9. Issue 3 — Workflow (delegation, review, merge, portals)

**Goal:** End-to-end three-tier flow with UI.

**Depends on:** Issue 2 complete  
**Blocks:** Production rollout

### 9.1 Collector workflow (backend)

- [ ] **3.1** `submitChildAssignment` — collector → status `SUBMITTED`; validate payload (reuse spatial rules)
- [ ] **3.2** Block collector from parent endpoints
- [ ] **3.3** On child submit: optional notification hook (future)

### 9.2 Officer review (backend)

- [ ] **3.4** `approveChildAssignment` — status `APPROVED`; set `officerReviewedAt/By`
- [ ] **3.5** `rejectChildAssignment` — status `REJECTED` + reason
- [ ] **3.6** `getOfficerReviewQueue` — children `SUBMITTED` for my parents
- [ ] **3.7** Auto-set parent `READY_FOR_REVIEW` when all children `APPROVED`

### 9.3 Merge & parent submit (backend)

- [ ] **3.8** `mergeChildAssignments(parentId)` — combine approved children `payload` by `mergeOrder`
- [ ] **3.9** `DEFINE_ZONES` merge: concatenate `zones[]`; validate no duplicate codes; run `assertZonesDoNotOverlap` + `assertZonesWithinNeighborhood`
- [ ] **3.10** `REGISTER_ADDRESSES` merge: concatenate `addresses[]`; validate all pins in zone
- [ ] **3.11** `submitParentToAdmin` — parent → `SUBMITTED`; only from `READY_FOR_REVIEW`
- [ ] **3.12** Admin `approveAssignment` — unchanged publish logic on parent merged payload
- [ ] **3.13** Admin reject parent → officer can re-merge after fixing children

### 9.4 Scope validation (backend)

- [ ] **3.14** If child `scope.geometry`: validate pins/zones within scope on submit
- [ ] **3.15** If `scope.maxAddresses`: enforce cap on child submit

### 9.5 Officer frontend

- [ ] **3.16** Refactor `/officer/dashboard` — parent focus + review queue badge
- [ ] **3.17** `/officer/assignments` — parent list with child progress
- [ ] **3.18** Parent detail — children table, delegate button, merge & submit (disabled until ready)
- [ ] **3.19** Delegate child form (collector picker, label, notes, optional scope)
- [ ] **3.20** Review queue page — approve/reject with map preview
- [ ] **3.21** `/officer/collectors` — team management UI
- [ ] **3.22** Remove officer map editing (field work) from parent detail

### 9.6 Collector frontend

- [ ] **3.23** `DataCollectorLayout` — My Tasks + Logout
- [ ] **3.24** `/collector/dashboard` — task list + `OfficerWorkflowGuide` (collector variant)
- [ ] **3.25** `/collector/assignments/:id` — reuse assignment detail components (`canEdit` for collector)
- [ ] **3.26** Submit to officer copy (not "submit for approval" to admin)
- [ ] **3.27** `collectorApi.js` + wire routes in `AppRoutes.jsx`

### 9.7 Admin frontend updates

- [ ] **3.28** Assignments list — show child progress on parent rows
- [ ] **3.29** Assignment detail — indicate merged submission from officer; read-only child summary accordion
- [ ] **3.30** Add assignment — officers-only assignee dropdown (verify)

### 9.8 Issue 3 acceptance criteria

- [ ] Full E2E scenario passes (see §10)
- [ ] Officer with 4 collectors can parallelize work; progress visible on parent
- [ ] Rejected child can resubmit without affecting approved siblings
- [ ] Merge fails with clear error if combined zones overlap
- [ ] Admin approve issues sequential DACs in merge order
- [ ] Collector cannot access officer or admin routes

---

## 10. End-to-end test scenarios

### Scenario A — Register addresses (4 collectors, 1 rejection)

**Setup:** Neighborhood Taleex, Zone Z01 published, parent `REGISTER_ADDRESSES` assigned to Officer A.

| Step | Actor | Action | Expected |
|------|-------|--------|----------|
| 1 | Admin | Create parent → Officer A | Parent `ASSIGNED` |
| 2 | Officer A | Create 4 children → Collectors 1–4 with scope labels | Parent `IN_PROGRESS`, 4 children `ASSIGNED` |
| 3 | Collector 1 | Add 3 addresses, submit | Child `SUBMITTED` |
| 4 | Collector 2 | Add 2 addresses, submit | Child `SUBMITTED` |
| 5 | Officer A | Approve collector 1 | Child `APPROVED` |
| 6 | Officer A | Reject collector 2 ("pins outside scope") | Child `REJECTED` |
| 7 | Collector 3 | Add 4 addresses, submit | Child `SUBMITTED` |
| 8 | Collector 4 | Add 1 address, submit | Child `SUBMITTED` |
| 9 | Officer A | Approve collectors 3, 4 | Children `APPROVED` |
| 10 | Collector 2 | Fix pins, resubmit | Child `SUBMITTED` |
| 11 | Officer A | Approve collector 2 | All 4 `APPROVED` → parent `READY_FOR_REVIEW` |
| 12 | Officer A | Merge + submit parent | Parent `SUBMITTED`, merged 10 addresses |
| 13 | Admin | Approve parent | Parent `APPROVED`, DACs `...-0001` through `...-0010` in merge order |
| 14 | Public | Lookup `...-0005` | Returns correct address |

### Scenario B — Define zones (2 collectors)

| Step | Actor | Action | Expected |
|------|-------|--------|----------|
| 1 | Admin | Parent `DEFINE_ZONES` → Officer B | Parent created |
| 2 | Officer B | Child → Collector X ("Z01"), Child → Collector Y ("Z02") | 2 children |
| 3 | Collector X | Draw Z01 polygon inside neighborhood, submit | Submitted |
| 4 | Collector Y | Draw Z02 overlapping Z01, submit | Submitted |
| 5 | Officer B | Approve both, merge, submit | Merge validation **fails** (overlap) |
| 6 | Officer B | Reject Y, request fix | Child Y `REJECTED` |
| 7 | Collector Y | Redraw non-overlapping Z02, resubmit | Submitted |
| 8 | Officer B | Approve, merge, submit | Parent `SUBMITTED` |
| 9 | Admin | Approve | Zones Z01, Z02 published |

### Scenario C — Access control

| Step | Actor | Action | Expected |
|------|-------|--------|----------|
| 1 | Collector 1 | `GET` Collector 2's child | 403 |
| 2 | Collector 1 | `POST` admin approve | 403 |
| 3 | Officer A | Assign child to Officer B's collector | 403 |
| 4 | Officer A | Submit parent with unapproved child | 400 |
| 5 | Admin | Approve child directly | 403 or 400 |

### Scenario D — Scale smoke (officer dashboard)

| Step | Actor | Action | Expected |
|------|-------|--------|----------|
| 1 | Officer | 30 children on one parent | List paginates; progress `0/30` |
| 2 | — | 15 approved, 10 in progress, 5 submitted | Dashboard shows review queue = 5 |
| 3 | — | Filter review queue by collector | Works |

---

## 11. Dependency graph

```
Issue 1 (this document) ✅
    │
    ▼
Issue 2: Schema + auth + parent/child CRUD APIs
    │
    ├── 2.1–2.7 schema (blocks all)
    ├── 2.8–2.11 auth (blocks frontends)
    ├── 2.12–2.15 collector users (blocks 3.21)
    ├── 2.16–2.24 assignment APIs (blocks Issue 3)
    └── 2.25–2.26 seed
    │
    ▼
Issue 3: Review + merge + portals
    │
    ├── 3.1–3.15 backend workflow (blocks 3.16–3.30)
    ├── 3.16–3.22 officer UI (parallel with 3.23–3.27 after 3.1)
    ├── 3.23–3.27 collector UI
    └── 3.28–3.30 admin UI tweaks
```

**Parallelizable after Issue 2:**

- Officer team UI (3.21) ∥ Collector portal shell (3.23–3.24)
- Admin list tweaks (3.28) ∥ Review queue (3.20)

---

## 12. Files to create or modify (reference)

### Backend (new)

- `backend/src/service/data-collector.service.js`
- `backend/src/controllers/data-collector.controller.js`
- `backend/src/routes/data-collector.routes.js`
- `backend/src/routes/officer-assignment.routes.js`
- `backend/src/routes/collector-assignment.routes.js`
- `backend/src/utils/assignment-access.utils.js`

### Backend (modify)

- `backend/prisma/schema.prisma`
- `backend/src/service/assignment.service.js` (major)
- `backend/src/routes/assignment.routes.js`
- `backend/src/middleware/auth.midleware.js`
- `backend/prisma/seed.js`

### Frontend (new)

- `frontend/src/layouts/DataCollectorLayout.jsx`
- `frontend/src/pages/dashboard/CollectorDashboard.jsx`
- `frontend/src/pages/officer/OfficerAssignments.jsx`
- `frontend/src/pages/officer/OfficerParentDetail.jsx`
- `frontend/src/pages/officer/DelegateChild.jsx`
- `frontend/src/pages/officer/ReviewQueue.jsx`
- `frontend/src/pages/officer/Collectors.jsx`
- `frontend/src/api/collectorApi.js`
- `frontend/src/api/officerAssignmentApi.js`

### Frontend (modify)

- `frontend/src/constants/roles.js`
- `frontend/src/routes/AppRoutes.jsx`
- `frontend/src/pages/assignments/Assignments.jsx`
- `frontend/src/pages/assignments/AssignmentDetail.jsx`
- `frontend/src/components/assignments/DefineZonesAssignment.jsx`
- `frontend/src/components/assignments/RegisterAddressesAssignment.jsx`
- `frontend/src/pages/dashboard/OfficerDashboard.jsx`
- `frontend/src/layouts/DataOfficerLayout.jsx` (nav items)

---

## 13. Out of scope (later epics)

- Push notifications (assignment assigned / rejected)
- Collector mobile offline mode
- Auto-suggest buildings from OSM
- Reassign collector between officers (admin-only, post-launch)
- Audit log entries for tier transitions
- Bulk child creation (CSV upload of 100 collector splits)
- Per-child SLA / overdue alerts

---

## 14. Open questions (resolve before Issue 2 starts)

| # | Question | Proposed default |
|---|----------|------------------|
| Q1 | Can one parent have mixed child types? | **No** — children inherit parent `type` |
| Q2 | Minimum children before merge? | **≥1 approved child**; officer can submit with partial coverage if admin allows (setting) |
| Q3 | Delete approved child? | **No** — officer must reject before approve if wrong |
| Q4 | Officer deactivate collector with active children? | **Block** until children completed or reassigned |
| Q5 | Password reset for collectors | Officer sets initial password; reset via admin for v1 |

---

**Document owner:** Issue 1 (planning)  
**Next action:** Start Issue 2 — schema migration `2026xxxx_two_level_assignments`
