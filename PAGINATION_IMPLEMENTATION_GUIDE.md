# Pagination Implementation Guide

## ✅ Completed Implementation

### 1. Reusable Pagination Component

- **File**: `frontend/src/components/common/Pagination.jsx`
- **Status**: ✅ Complete and ready to use
- **Features**:
  - Previous/Next buttons with disabled state
  - Page numbers with ellipsis for compact display
  - "Showing X-Y of Z" information text
  - Mobile-responsive design
  - Accessibility support (ARIA labels)

### 2. Data Collectors (Full Implementation)

- **Backend Service**: ✅ Updated with pagination logic
- **Backend Controller**: ✅ Parses pagination params
- **Frontend API**: ✅ Accepts params object
- **Frontend Page**: ✅ Integrated Pagination component with search debouncing

### 3. Districts (Full Implementation)

- **Backend Service**: ✅ Updated with pagination logic
- **Backend Controller**: ✅ Parses pagination params
- **Frontend API**: ✅ Accepts params object
- **Frontend Page**: ✅ Integrated Pagination component with search debouncing

---

## 📋 Remaining Pages to Implement

### Pattern Summary

All remaining pages follow the same 4-step pattern used in Data Collectors & Districts:

#### Step 1: Backend Service Update

```javascript
methodName: async ({ page = 1, limit = 10, search, ...otherFilters } = {}) => {
  // Parse and validate pagination params
  let parsedPage = parseInt(page, 10);
  let parsedLimit = parseInt(limit, 10);

  if (isNaN(parsedPage) || parsedPage < 1) parsedPage = 1;
  if (isNaN(parsedLimit) || parsedLimit < 1) parsedLimit = 10;
  if (parsedLimit > 100) parsedLimit = 100;

  const skip = (parsedPage - 1) * parsedLimit;
  const take = parsedLimit;

  // Build WHERE clause with filters and search
  const where = {};
  if (search && typeof search === "string" && search.trim()) {
    where.OR = [
      { field1: { contains: search.trim(), mode: "insensitive" } },
      { field2: { contains: search.trim(), mode: "insensitive" } },
    ];
  }

  // Apply other filters
  if (otherFilter) where.otherFilter = otherFilter;

  // Get total and paginated data
  const total = await prisma.model.count({ where });
  const data = await prisma.model.findMany({
    where,
    skip,
    take,
    orderBy: { name: "asc" },
    // include relationships, select fields, etc.
  });

  return {
    data,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit),
    },
  };
};
```

#### Step 2: Backend Controller Update

```javascript
export const getResource = async (req, res) => {
  try {
    const { page, limit, search, ...filters } = req.query;

    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;

    const result = await Service.method({
      page: isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage,
      limit: isNaN(parsedLimit) || parsedLimit < 1 ? 10 : parsedLimit,
      search,
      ...filters,
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

#### Step 3: Frontend API Update

```javascript
// OLD:
export const getResources = (filter) =>
  api.get("/endpoint", { params: { filter } });

// NEW:
export const getResources = (params) => api.get("/endpoint", { params });
```

#### Step 4: Frontend Page Update

```javascript
import Pagination from "@/components/common/Pagination";

// State
const [page, setPage] = useState(1);
const [pagination, setPagination] = useState({
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
});
const [searchTerm, setSearchTerm] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const limit = 10;

// Debounce search
useEffect(() => {
  const handler = setTimeout(() => {
    setDebouncedSearch(searchTerm);
    setPage(1); // Reset to page 1 on search change
  }, 450);

  return () => clearTimeout(handler);
}, [searchTerm]);

// Fetch with pagination
useEffect(() => {
  fetchResources();
}, [page, debouncedSearch]);

const fetchResources = async () => {
  try {
    setLoading(true);
    setError(null);
    const res = await getResources({
      page,
      limit,
      search: debouncedSearch || undefined,
      // add other filters as needed
    });

    const responseData = res.data?.data;

    if (responseData?.data && responseData?.pagination) {
      setResources(responseData.data);
      setPagination(responseData.pagination);
    } else if (Array.isArray(responseData)) {
      // Fallback for legacy format
      setResources(responseData);
    } else {
      setResources([]);
    }
  } catch (err) {
    setError(err.response?.data?.message || "Failed to load resources");
  } finally {
    setLoading(false);
  }
};

// Render
<div className="px-5 py-4 border-b border-line">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
      <h2 className="text-[16px] font-semibold text-ink">All Resources</h2>
      <p className="mt-1 text-[12px] text-ink-soft">
        Total {pagination.total} items
      </p>
    </div>
    <div className="relative">
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="h-[38px] w-full sm:w-[220px] rounded-lg border border-line bg-white pl-9 pr-3 text-[12px]"
      />
    </div>
  </div>
</div>;

{
  /* In footer */
}
<div className="px-5 py-4 border-t border-line">
  <p className="text-[11px] text-ink-soft mb-4">
    Showing{" "}
    {resources.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}-
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
</div>;
```

---

## 🎯 Remaining Implementations

### 1. Data Officers

**Files to Update**:

- `backend/src/service/data-officer.service.js` - getDataOfficers() method
- `backend/src/controllers/data-officer.controller.js` - getDataOfficers() controller
- `frontend/src/api/dataOfficerApi.js` - getDataOfficers() function
- `frontend/src/pages/data-officers/DataOfficers.jsx` - Add pagination state and Pagination component

**Search Fields**: name, email

---

### 2. Zones

**Files to Update**:

- `backend/src/service/zone.service.js` - getZones() method
- `backend/src/controllers/zone.controller.js` - getZones() controller
- `frontend/src/api/zoneApi.js` - getZones() function
- `frontend/src/pages/zones/Zones.jsx` - Add pagination state and Pagination component

**Search Fields**: name, code
**Special Consideration**: Zones use PostGIS geometry; ensure $queryRaw properly supports skip/take

---

### 3. Regions

**Files to Update**:

- `backend/src/service/region.service.js` - getRegions() method
- `backend/src/controllers/region.controller.js` - getRegions() controller
- `frontend/src/api/regionApi.js` - getRegions() function
- `frontend/src/pages/regions/Regions.jsx` - Add pagination state and Pagination component

**Search Fields**: name, code

---

### 4. Addresses

**Files to Update**:

- `backend/src/service/address.service.js` - getAddresses() method
- `backend/src/controllers/address.controller.js` - getAddresses() controller
- `frontend/src/api/addressApi.js` - getAddresses() function
- `frontend/src/pages/addresses/AddressesPage.jsx` - Add pagination state and Pagination component

**Search Fields**: houseNumber, streetName, wadiName, gaarName
**Special Considerations**:

- Multiple optional filters (zone, block, district)
- Larger dataset - pagination is critical
- May need to handle complex search across multiple fields

---

### 5. Zone Blocks

**Files to Update**:

- `backend/src/service/zone-block.service.js` - getZoneBlocks() method
- `backend/src/controllers/zone-block.controller.js` - getZoneBlocks() controller
- `frontend/src/api/zoneBlockApi.js` - getZoneBlocks() function
- `frontend/src/pages/zone-blocks/ZoneBlocks.jsx` - Add pagination state and Pagination component

**Search Fields**: name, code
**Parent Relationship**: Zone (filter by zone if provided)

---

### 6. Assignments

**Files to Update**:

- `backend/src/service/assignment.service.js` - getAssignments() method (if exists)
- `backend/src/controllers/assignment.controller.js` - getAssignments() controller
- `frontend/src/api/assignmentApi.js` - getAssignments() function
- `frontend/src/pages/assignments/Assignments.jsx` - Add pagination state and Pagination component

**Search Fields**: Depends on assignment structure (likely zone name, collector name, officer name)
**Filters**: Status, collector, officer, zone

---

## ✅ Testing Checklist

For each implemented page:

- [ ] Page loads with pagination controls
- [ ] Search terms filter results and reset to page 1
- [ ] Previous/Next buttons work correctly
- [ ] Direct page number selection works
- [ ] "Showing X-Y of Z" text is accurate
- [ ] Delete action updates pagination
- [ ] Mobile layout is responsive
- [ ] Loading state displays correctly
- [ ] Error state with retry works
- [ ] Empty state displays when no results

---

## 🚀 Implementation Priority

**High Priority** (Critical pages with large datasets):

1. Addresses (public-facing, complex filtering)
2. Data Officers (user management)
3. Zones (hierarchical)

**Medium Priority**: 4. Regions 5. Zone Blocks

**Lower Priority**: 6. Assignments (depends on other pages)

---

## 📝 Notes

- **Backend Response Format**: All paginated endpoints return `{ data: Array, pagination: { total, page, limit, totalPages } }`
- **Frontend Fallback**: All pages handle both paginated and legacy array formats
- **Search Debounce**: Use 450ms delay to prevent excessive API calls
- **Default Page Size**: 10 items per page
- **Maximum Limit**: 100 items per page (enforced backend)
- **Status Filtering**: Can be done client-side if backend doesn't support; implement server-side for better performance

---

## 🔧 Helper Functions

When implementing address search, use this pattern for complex field searching:

```javascript
// Multiple field search
if (search && typeof search === "string" && search.trim()) {
  const searchPattern = search.trim();
  where.OR = [
    { houseNumber: { contains: searchPattern, mode: "insensitive" } },
    { streetName: { contains: searchPattern, mode: "insensitive" } },
    { wadiName: { contains: searchPattern, mode: "insensitive" } },
    { gaarName: { contains: searchPattern, mode: "insensitive" } },
  ];
}
```

For related entity searching (e.g., searching by zone name in addresses):

```javascript
// Search in related entity
if (search && typeof search === "string" && search.trim()) {
  where.OR = [
    { houseNumber: { contains: search.trim(), mode: "insensitive" } },
    {
      zone: {
        name: { contains: search.trim(), mode: "insensitive" },
      },
    },
  ];
}
```
