# Data Officers Pagination - Quick Start

This document provides the exact code changes needed to paginate the Data Officers page, using the Data Collectors implementation as a reference.

## Step 1: Backend Service Update

**File**: `backend/src/service/data-officer.service.js`

Find the `getDataOfficers` method (likely around line 50-70) and replace it:

```javascript
/**
 * Get data officers with optional pagination and search
 * @param {Object} params
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page
 * @param {string} [params.search] - Search by name or email
 * @returns {Promise<{data: Array, pagination: Object}>}
 */
getDataOfficers: async ({ page = 1, limit = 10, search } = {}) => {
  // Robust parameter parsing
  let parsedPage = parseInt(page, 10);
  let parsedLimit = parseInt(limit, 10);

  if (isNaN(parsedPage) || parsedPage < 1) {
    parsedPage = 1;
  }
  if (isNaN(parsedLimit) || parsedLimit < 1) {
    parsedLimit = 10;
  }

  if (parsedLimit > 100) {
    parsedLimit = 100;
  }

  const skip = (parsedPage - 1) * parsedLimit;
  const take = parsedLimit;

  // Build filter
  const where = {};

  if (search && typeof search === "string" && search.trim()) {
    const searchPattern = search.trim();
    where.OR = [
      { name: { contains: searchPattern, mode: "insensitive" } },
      { email: { contains: searchPattern, mode: "insensitive" } },
    ];
  }

  // Get total
  const total = await prisma.dataOfficer.count({ where });

  // Get paginated data
  const officers = await prisma.dataOfficer.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { collectors: true } },
    },
    orderBy: { name: "asc" },
    skip,
    take,
  });

  return {
    data: officers,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit),
    },
  };
},
```

## Step 2: Backend Controller Update

**File**: `backend/src/controllers/data-officer.controller.js`

Find `getDataOfficers` controller (likely around line 50-70) and replace:

```javascript
export const getDataOfficers = async (req, res) => {
  try {
    const { page, limit, search } = req.query;

    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;

    const result = await DataOfficerService.getDataOfficers({
      page: isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage,
      limit: isNaN(parsedLimit) || parsedLimit < 1 ? 10 : parsedLimit,
      search,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};
```

## Step 3: Frontend API Update

**File**: `frontend/src/api/dataOfficerApi.js`

Replace the entire file with:

```javascript
import api from "./axios";

/**
 * Fetch data officers with optional pagination and filtering
 * @param {Object} params - Query parameters {page, limit, search}
 */
export const getDataOfficers = (params) =>
  api.get("/admin/data-officers", { params });

export const getDataOfficerById = (id) => api.get(`/admin/data-officers/${id}`);

export const createDataOfficer = (data) =>
  api.post("/admin/data-officers", data);

export const updateDataOfficer = (id, data) =>
  api.put(`/admin/data-officers/${id}`, data);

export const deleteDataOfficer = (id) =>
  api.delete(`/admin/data-officers/${id}`);

export const regeneratePassword = (id) =>
  api.post(`/admin/data-officers/${id}/regenerate-password`);
```

## Step 4: Frontend Page Update

**File**: `frontend/src/pages/data-officers/DataOfficers.jsx`

At the top of the file, add the Pagination import:

```javascript
import Pagination from "@/components/common/Pagination";
```

Replace the state initialization section (typically lines 15-25) with:

```javascript
const [officers, setOfficers] = useState([]);
const [pagination, setPagination] = useState({
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
});
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [searchTerm, setSearchTerm] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");
const [page, setPage] = useState(1);
const [deletingId, setDeletingId] = useState(null);
const [regenerateTarget, setRegenerateTarget] = useState(null);
const [deleteTarget, setDeleteTarget] = useState(null);

const limit = 10;

// Handle search debouncing
useEffect(() => {
  const handler = setTimeout(() => {
    setDebouncedSearch(searchTerm);
    setPage(1); // Reset to first page on search change
  }, 450);

  return () => clearTimeout(handler);
}, [searchTerm]);
```

Replace the fetchOfficers function and its useEffect:

```javascript
const fetchOfficers = async () => {
  try {
    setLoading(true);
    setError(null);
    const res = await getDataOfficers({
      page,
      limit,
      search: debouncedSearch || undefined,
    });

    const responseData = res.data?.data;

    if (responseData?.data && responseData?.pagination) {
      // Paginated response
      setOfficers(responseData.data);
      setPagination(responseData.pagination);
    } else if (Array.isArray(responseData)) {
      // Legacy format fallback
      setOfficers(responseData);
    } else {
      setOfficers([]);
    }
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Failed to load data officers. Please try again.",
    );
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchOfficers();
}, [page, debouncedSearch]);
```

Remove this line if it exists (since we're using debounced search now):

```javascript
// DELETE THIS:
const filteredOfficers = useMemo(() => {
  // ... existing client-side filtering code
}, [officers, searchTerm]);

// INSTEAD, use officers directly in the table rendering
```

In the table header section where it shows the count, replace:

```javascript
  // OLD:
  Total {officers.length} registered data officers

  // NEW:
  Total {pagination.total} registered data officers
```

In the table footer (typically before the closing div tags), replace:

```javascript
// OLD (if it exists):
// <footer showing officers.length>

// NEW: Add this section in the card footer:
<div className="px-5 py-4 border-t border-line">
  <p className="text-[11px] text-ink-soft mb-4">
    Showing{" "}
    {officers.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}-
    {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
    {pagination.total} officers
  </p>

  {pagination.totalPages > 1 && (
    <Pagination
      page={pagination.page}
      totalPages={pagination.totalPages}
      total={pagination.total}
      pageSize={pagination.limit}
      onPageChange={setPage}
      disabled={loading}
    />
  )}
</div>
```

In the confirmDelete function, add a refresh after deletion:

```javascript
const confirmDelete = async () => {
  if (!deleteTarget) return;

  try {
    setDeletingId(deleteTarget.id);
    setError(null);
    await deleteDataOfficer(deleteTarget.id);
    // Refresh to update pagination
    fetchOfficers();
    setDeleteTarget(null);
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Failed to delete data officer. Please try again.",
    );
  } finally {
    setDeletingId(null);
  }
};
```

---

## Testing Checklist

After implementing all 4 steps for Data Officers:

- [ ] Page loads without errors
- [ ] Shows "Total X registered data officers" with correct count
- [ ] "Showing Y-Z of X" displays correct range
- [ ] Pagination component appears if more than 10 officers
- [ ] Next button works and loads new page
- [ ] Previous button works
- [ ] Page numbers can be clicked directly
- [ ] Search field debounces (don't wait 450ms, see typing pause)
- [ ] Search resets to page 1
- [ ] Search results show correct filtered data
- [ ] Deleting an officer updates pagination count
- [ ] Mobile layout responsive (pagination stacks)
- [ ] Loading spinner displays while fetching
- [ ] Empty state shows if no results

---

## Common Issues & Fixes

### Issue: "getDataOfficers is not a function"

**Fix**: Make sure you updated the import at the top of DataOfficers.jsx

### Issue: Pagination showing wrong numbers

**Fix**: Check calculation - should be `(page-1) * limit + 1` to `min(page * limit, total)`

### Issue: Search not working

**Fix**: Verify debouncedSearch state is being used in fetch call, not searchTerm

### Issue: Page resets to 1 unexpectedly

**Fix**: Good! This is intentional - search resets page to 1. Remove if you prefer to stay on current page.

### Issue: Shows 0 officers but server returns data

**Fix**: Check response format - backend might return `{ data: [...] }` instead of `{ data: { data: [...], pagination: {...} } }`

---

## Copy-Paste Ready Code Blocks

Use these when you need quick fixes:

### State initialization (copy entire block):

```javascript
const [officers, setOfficers] = useState([]);
const [pagination, setPagination] = useState({
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
});
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [searchTerm, setSearchTerm] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");
const [page, setPage] = useState(1);
const limit = 10;
```

### Import Pagination component:

```javascript
import Pagination from "@/components/common/Pagination";
```

### Render footer with pagination:

```jsx
<div className="px-5 py-4 border-t border-line">
  <p className="text-[11px] text-ink-soft mb-4">
    Showing{" "}
    {officers.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}-
    {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
    {pagination.total}
  </p>
  {pagination.totalPages > 1 && (
    <Pagination
      page={pagination.page}
      totalPages={pagination.totalPages}
      total={pagination.total}
      pageSize={pagination.limit}
      onPageChange={setPage}
      disabled={loading}
    />
  )}
</div>
```

---

## Need Help?

Refer to these complete working implementations:

- **Data Collectors**: `frontend/src/pages/data-collectors/DataCollectorsPage.jsx`
- **Districts**: `frontend/src/pages/districts/Districts.jsx`

Both have pagination fully implemented and can be used as reference.
