# Issue: Assignment Team Size & Parallel Collector Delegation

**Labels:** `enhancement`, `assignments`, `backend`, `frontend`  
**Assignee:** Developer B  
**Can run in parallel with:** Issue — Admin Data Collector Management

---

## Summary

When admin assigns work to a data officer, they specify **how many collectors** will work in parallel on that task. The officer delegates one child assignment per collector (up to that limit). Progress shows `delegated / expected`.

## Context

| Assignment type | Admin assigns officer to |
|-----------------|--------------------------|
| **Define Zone Blocks** | **Zone** — collectors draw blocks inside the zone |
| **Register Addresses** | **Zone Block** — collectors register addresses inside the block |

Parallel work = multiple **child** assignments under one **parent**, each assigned to a different collector.

## Scope

### Schema & migration

- [ ] Add `expectedCollectorCount Int?` on `Assignment` (parent rows only)
- [ ] Migration + backfill existing parents to `1`

### Backend

- [ ] `POST /admin/assignments` accepts `expectedCollectorCount` (required, 1–50)
- [ ] Store on parent assignment at create time
- [ ] `POST /officer/assignments/:parentId/children` — reject when `children.length >= expectedCollectorCount`
- [ ] Return `expectedCollectorCount` in assignment list/detail APIs

### Frontend — Admin

- [ ] **New Assignment** form: number input “Data Collectors on Team”
- [ ] Assignments list: show progress like `2/3 tasks · 1 approved · 2 submitted`
- [ ] Assignment detail: show expected team size

### Frontend — Officer

- [ ] Parent detail: **Team Size** card `delegated / expected`
- [ ] Disable “Delegate to Collector” when limit reached
- [ ] Show helper text: admin expects N parallel collector tasks

## Out of scope

- Admin collector CRUD (other issue)
- Auto-create N children in one click (future)
- Geographic `scope` split per collector (future)
- Changing team size after assignment created

## Acceptance criteria

1. Admin must set collector count when creating an assignment.
2. Officer can delegate child tasks until count is reached; further delegation returns clear error.
3. Admin and officer UIs show `delegated / expected` progress.
4. Two collectors can work on the same parent in parallel (separate child tasks).
5. Existing assignments still load after migration.

## Suggested files

```
backend/prisma/schema.prisma
backend/prisma/migrations/*_add_expected_collector_count/*
backend/src/service/assignment.service.js
frontend/src/pages/assignments/AddAssignment.jsx
frontend/src/pages/assignments/Assignments.jsx
frontend/src/pages/officer/OfficerParentDetail.jsx
backend/prisma/seed.js
```

## Test plan

1. Admin creates parent with `expectedCollectorCount: 2`
2. Officer delegates to collector 1 → success
3. Officer delegates to collector 2 → success
4. Officer tries third delegation → error
5. Both collectors submit in parallel → officer sees 2 submitted children
6. Verify **Define Zone Blocks** uses zone; **Register Addresses** uses zone block

## E2E scenario (2 parallel collectors)

| Step | Actor | Action |
|------|-------|--------|
| 1 | Admin | Create parent `DEFINE_ZONE_BLOCKS` on Zone Taleex, officer A, **2 collectors** |
| 2 | Officer A | Delegate child → Collector 1 (“East sector”) |
| 3 | Officer A | Delegate child → Collector 2 (“West sector”) |
| 4 | Collector 1 & 2 | Work in parallel, submit drafts |
| 5 | Officer A | Approve both, merge, submit to admin |
