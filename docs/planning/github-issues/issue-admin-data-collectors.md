# Issue: Admin Data Collector Management

**Labels:** `enhancement`, `admin`, `backend`, `frontend`  
**Assignee:** Developer A  
**Can run in parallel with:** Issue — Assignment Team Size & Parallel Delegation

---

## Summary

Allow **SYS_ADMIN** to create and manage data collectors, and assign each collector to a supervising data officer. Today only officers can create collectors via `/officer/collectors`.

## Why

Admins need to onboard field staff centrally before officers delegate parallel work. Collectors must belong to exactly one officer (`User.supervisorId`).

## Scope

### Backend

- [ ] `POST /api/v1/admin/data-collectors` — create collector `{ name, email, password, supervisorId }`
- [ ] `GET /api/v1/admin/data-collectors` — list all collectors with supervisor info
- [ ] `GET /api/v1/admin/data-collectors/:id`
- [ ] `PUT /api/v1/admin/data-collectors/:id` — update name, email, password, supervisor
- [ ] `DELETE /api/v1/admin/data-collectors/:id` — block if active assignments exist
- [ ] `POST /api/v1/admin/data-collectors/:id/regenerate-password`
- [ ] Audit log on create / update / delete
- [ ] Validate `supervisorId` is a `DATA_OFFICER`

### Frontend

- [ ] Sidebar link: **Data Collectors** (`/admin/data-collectors`)
- [ ] List page — name, email, supervisor, created date, actions
- [ ] Add page — name, email, password, officer picker
- [ ] Edit page — reassign supervisor, optional password change
- [ ] Regenerate password modal
- [ ] `frontend/src/api/dataCollectorApi.js`

## Out of scope

- Assignment team size (other issue)
- Officer delegation UI changes
- Bulk import of collectors

## Acceptance criteria

1. Admin can create a collector assigned to an officer.
2. Admin can list collectors and see which officer supervises each.
3. Admin can edit collector details and change supervisor.
4. Admin cannot delete a collector with active (non-terminal) assignments.
5. Officer-created collectors still work via `/officer/collectors`.

## Suggested files

```
backend/src/service/data-collector.service.js
backend/src/controllers/admin-data-collector.controller.js
backend/src/routes/data-collector.routes.js
backend/src/routes/admin.routes.js
frontend/src/pages/data-collectors/*
frontend/src/api/dataCollectorApi.js
frontend/src/routes/AppRoutes.jsx
frontend/src/layouts/SysAdminLayout.jsx
```

## Test plan

1. Login as admin → create collector under `officer@somalia.gov.so`
2. Login as that officer → collector appears in `/officer/collectors`
3. Login as admin → edit supervisor to another officer
4. Try delete with active child assignment → expect error
