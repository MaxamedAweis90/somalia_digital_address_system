import { prisma } from "../db.js";
import { parseLocation } from "../utils/location.utils.js";

// Helper to construct date & hierarchy filter clauses for Prisma queries
function buildAssignmentWhere(filters = {}) {
  const where = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.zoneId) {
    where.zoneId = filters.zoneId;
  } else if (filters.districtId) {
    where.zone = {
      districtId: filters.districtId,
    };
  }

  if (filters.dataCollectorId) {
    where.assignedToId = filters.dataCollectorId;
  } else if (filters.dataOfficerId) {
    where.OR = [
      { assignedById: filters.dataOfficerId },
      { assignedToId: filters.dataOfficerId },
      { assignedTo: { supervisorId: filters.dataOfficerId } },
    ];
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) {
      where.createdAt.gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      const endDate = new Date(filters.dateTo);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt.lte = endDate;
    }
  }

  return where;
}

function buildAddressWhere(filters = {}) {
  const where = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.districtId) {
    where.districtId = filters.districtId;
  }

  if (filters.zoneId) {
    where.zoneId = filters.zoneId;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) {
      where.createdAt.gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      const endDate = new Date(filters.dateTo);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt.lte = endDate;
    }
  }

  return where;
}

export const ReportsService = {
  // 1. Executive Summary KPIs
  getExecutiveSummary: async (filters = {}) => {
    const assignmentWhere = buildAssignmentWhere(filters);
    const addressWhere = buildAddressWhere(filters);

    const [
      totalAssignments,
      completedAssignments,
      inProgressAssignments,
      pendingAssignments,
      totalAddresses,
      activeAddresses,
      inactiveAddresses,
      allAddressesForGis,
    ] = await Promise.all([
      prisma.assignment.count({ where: assignmentWhere }),
      prisma.assignment.count({
        where: { ...assignmentWhere, status: "APPROVED" },
      }),
      prisma.assignment.count({
        where: { ...assignmentWhere, status: "IN_PROGRESS" },
      }),
      prisma.assignment.count({
        where: {
          ...assignmentWhere,
          status: { in: ["ASSIGNED", "SUBMITTED", "READY_FOR_REVIEW"] },
        },
      }),
      prisma.address.count({ where: addressWhere }),
      prisma.address.count({
        where: { ...addressWhere, status: "ACTIVE" },
      }),
      prisma.address.count({
        where: { ...addressWhere, status: "INACTIVE" },
      }),
      prisma.address.findMany({
        where: addressWhere,
        select: { location: true },
      }),
    ]);

    let validLocationsCount = 0;
    let missingOrInvalidLocationsCount = 0;

    for (const addr of allAddressesForGis) {
      if (!addr.location) {
        missingOrInvalidLocationsCount++;
        continue;
      }
      try {
        parseLocation(addr.location);
        validLocationsCount++;
      } catch {
        missingOrInvalidLocationsCount++;
      }
    }

    const completionRate =
      totalAssignments > 0
        ? Math.round((completedAssignments / totalAssignments) * 100)
        : 0;

    const approvalRate =
      totalAddresses > 0
        ? Math.round((activeAddresses / totalAddresses) * 100)
        : 0;

    return {
      assignments: {
        total: totalAssignments,
        completed: completedAssignments,
        inProgress: inProgressAssignments,
        pending: pendingAssignments,
        completionRate,
      },
      buildings: {
        totalCollected: totalAddresses,
        approved: activeAddresses,
        inactiveOrPending: inactiveAddresses,
        approvalRate,
      },
      spatialValidationErrors: missingOrInvalidLocationsCount,
      validLocationsCount,
    };
  },

  // 2. Collection Progress Report
  getCollectionProgress: async (filters = {}) => {
    const assignmentWhere = buildAssignmentWhere(filters);
    const addressWhere = buildAddressWhere(filters);

    const statuses = [
      "ASSIGNED",
      "IN_PROGRESS",
      "SUBMITTED",
      "READY_FOR_REVIEW",
      "APPROVED",
      "REJECTED",
    ];

    const statusCounts = await Promise.all(
      statuses.map(async (status) => {
        const count = await prisma.assignment.count({
          where: { ...assignmentWhere, status },
        });
        return { status, count };
      })
    );

    const totalAssignments = statusCounts.reduce((acc, curr) => acc + curr.count, 0);

    const statusBreakdown = statusCounts.map((item) => ({
      status: item.status,
      count: item.count,
      percentage:
        totalAssignments > 0
          ? Math.round((item.count / totalAssignments) * 100)
          : 0,
    }));

    const [totalAddressesCollected, activeAddressesApproved] = await Promise.all([
      prisma.address.count({ where: addressWhere }),
      prisma.address.count({ where: { ...addressWhere, status: "ACTIVE" } }),
    ]);

    return {
      totalAssignments,
      totalAddressesCollected,
      activeAddressesApproved,
      statusBreakdown,
    };
  },

  // 3. District Performance Report
  getDistrictPerformance: async (filters = {}) => {
    const districtWhere = filters.districtId ? { id: filters.districtId } : {};

    const districts = await prisma.district.findMany({
      where: districtWhere,
      select: {
        id: true,
        name: true,
        code: true,
        status: true,
        _count: {
          select: {
            zones: true,
            addresses: true,
          },
        },
        zones: {
          select: {
            _count: {
              select: {
                zoneBlocks: true,
                assignments: true,
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const report = await Promise.all(
      districts.map(async (d) => {
        const totalBlocks = d.zones.reduce(
          (acc, z) => acc + (z._count?.zoneBlocks || 0),
          0
        );

        const assignmentWhere = buildAssignmentWhere({
          ...filters,
          districtId: d.id,
        });

        const addressWhere = buildAddressWhere({
          ...filters,
          districtId: d.id,
        });

        const [totalAssignments, completedAssignments, totalAddresses, activeAddresses] =
          await Promise.all([
            prisma.assignment.count({ where: assignmentWhere }),
            prisma.assignment.count({
              where: { ...assignmentWhere, status: "APPROVED" },
            }),
            prisma.address.count({ where: addressWhere }),
            prisma.address.count({
              where: { ...addressWhere, status: "ACTIVE" },
            }),
          ]);

        const completionPct =
          totalAssignments > 0
            ? Math.round((completedAssignments / totalAssignments) * 100)
            : 0;

        const approvalPct =
          totalAddresses > 0
            ? Math.round((activeAddresses / totalAddresses) * 100)
            : 0;

        return {
          id: d.id,
          name: d.name,
          code: d.code,
          zonesCount: d._count.zones,
          blocksCount: totalBlocks,
          housesCount: totalAddresses,
          assignmentsCount: totalAssignments,
          completedAssignments,
          activeAddresses,
          completionPct,
          approvalPct,
        };
      })
    );

    return report;
  },

  // 4. Data Collector Performance
  getCollectorPerformance: async (filters = {}) => {
    const collectorWhere = { role: "DATA_COLLECTOR" };
    if (filters.dataCollectorId) {
      collectorWhere.id = filters.dataCollectorId;
    }
    if (filters.dataOfficerId) {
      collectorWhere.supervisorId = filters.dataOfficerId;
    }

    const collectors = await prisma.user.findMany({
      where: collectorWhere,
      select: {
        id: true,
        name: true,
        email: true,
        supervisor: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const report = await Promise.all(
      collectors.map(async (c) => {
        const assignmentWhere = buildAssignmentWhere({
          ...filters,
          dataCollectorId: c.id,
        });

        const [assigned, inProgress, submitted, approved, rejected] =
          await Promise.all([
            prisma.assignment.count({ where: assignmentWhere }),
            prisma.assignment.count({
              where: { ...assignmentWhere, status: "IN_PROGRESS" },
            }),
            prisma.assignment.count({
              where: { ...assignmentWhere, status: "SUBMITTED" },
            }),
            prisma.assignment.count({
              where: { ...assignmentWhere, status: "APPROVED" },
            }),
            prisma.assignment.count({
              where: { ...assignmentWhere, status: "REJECTED" },
            }),
          ]);

        const completed = approved + submitted;
        const completionRate =
          assigned > 0 ? Math.round((completed / assigned) * 100) : 0;
        const approvalRate =
          completed > 0 ? Math.round((approved / completed) * 100) : 0;

        return {
          id: c.id,
          name: c.name,
          email: c.email,
          supervisorName: c.supervisor?.name || "Unassigned",
          assigned,
          inProgress,
          submitted,
          completed,
          approved,
          rejected,
          completionRate,
          approvalRate,
        };
      })
    );

    return report;
  },

  // 5. Assignment Lifecycle Report
  getAssignmentLifecycle: async (
    filters = {},
    page = 1,
    limit = 10,
    search = ""
  ) => {
    const where = buildAssignmentWhere(filters);

    if (search) {
      where.OR = [
        { zone: { name: { contains: search, mode: "insensitive" } } },
        { zone: { code: { contains: search, mode: "insensitive" } } },
        { assignedTo: { name: { contains: search, mode: "insensitive" } } },
        { assignedBy: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const totalCount = await prisma.assignment.count({ where });

    const assignments = await prisma.assignment.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        tier: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        submittedAt: true,
        reviewedAt: true,
        dueAt: true,
        zone: {
          select: {
            id: true,
            name: true,
            code: true,
            district: { select: { id: true, name: true, code: true } },
          },
        },
        zoneBlock: {
          select: { id: true, name: true, code: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
        assignedBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return {
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
      data: assignments.map((a) => ({
        id: a.id,
        type: a.type,
        tier: a.tier,
        status: a.status,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        districtName: a.zone?.district?.name || "—",
        zoneName: a.zone?.name || "—",
        zoneBlockName: a.zoneBlock?.name || "—",
        officerName: a.assignedBy?.name || "—",
        collectorName: a.assignedTo?.name || "—",
      })),
    };
  },

  // 6. GIS & Spatial Validation Report
  getSpatialValidationReport: async (filters = {}) => {
    const addressWhere = buildAddressWhere(filters);
    const addresses = await prisma.address.findMany({
      where: addressWhere,
      select: {
        id: true,
        addressCode: true,
        streetName: true,
        location: true,
        status: true,
        createdAt: true,
        district: { select: { name: true } },
        zone: { select: { name: true } },
        zoneBlock: { select: { name: true } },
      },
    });

    let withCoordinates = 0;
    let missingCoordinates = 0;
    let validLocations = 0;
    let invalidLocations = 0;
    let boundaryViolations = 0;

    const spatialPoints = [];

    for (const addr of addresses) {
      if (!addr.location?.trim()) {
        missingCoordinates++;
        continue;
      }

      withCoordinates++;

      try {
        const { latitude, longitude } = parseLocation(addr.location);
        // Valid Somalia coordinates check (Lat: -2 to 13, Lng: 40 to 52)
        if (latitude >= -2.0 && latitude <= 13.0 && longitude >= 40.0 && longitude <= 52.0) {
          validLocations++;
          spatialPoints.push({
            id: addr.id,
            addressCode: addr.addressCode,
            streetName: addr.streetName,
            districtName: addr.district?.name,
            zoneName: addr.zone?.name,
            latitude,
            longitude,
            status: "VALID",
          });
        } else {
          boundaryViolations++;
          spatialPoints.push({
            id: addr.id,
            addressCode: addr.addressCode,
            streetName: addr.streetName,
            districtName: addr.district?.name,
            zoneName: addr.zone?.name,
            latitude,
            longitude,
            status: "OUT_OF_BOUNDS",
          });
        }
      } catch {
        invalidLocations++;
      }
    }

    const totalCount = addresses.length;
    const validationScore =
      totalCount > 0 ? Math.round((validLocations / totalCount) * 100) : 100;

    return {
      totalAddresses: totalCount,
      withCoordinates,
      missingCoordinates,
      validLocations,
      invalidLocations,
      boundaryViolations,
      overlappingPolygons: 0,
      validationScore,
      spatialPoints: spatialPoints.slice(0, 100),
    };
  },

  // 7. Address / Building Statistics
  getAddressStatistics: async (filters = {}) => {
    const addressWhere = buildAddressWhere(filters);

    const [
      totalAddresses,
      activeAddresses,
      inactiveAddresses,
      districtGroup,
      zoneGroup,
    ] = await Promise.all([
      prisma.address.count({ where: addressWhere }),
      prisma.address.count({ where: { ...addressWhere, status: "ACTIVE" } }),
      prisma.address.count({ where: { ...addressWhere, status: "INACTIVE" } }),
      prisma.address.groupBy({
        by: ["districtId"],
        where: addressWhere,
        _count: { id: true },
      }),
      prisma.address.groupBy({
        by: ["zoneId"],
        where: addressWhere,
        _count: { id: true },
      }),
    ]);

    const districtIds = districtGroup.map((g) => g.districtId);
    const districts = await prisma.district.findMany({
      where: { id: { in: districtIds } },
      select: { id: true, name: true, code: true },
    });

    const districtDistribution = districtGroup.map((g) => {
      const d = districts.find((dist) => dist.id === g.districtId);
      return {
        districtId: g.districtId,
        name: d?.name || "Unknown District",
        code: d?.code || "—",
        count: g._count.id,
      };
    });

    return {
      totalAddresses,
      activeAddresses,
      inactiveAddresses,
      districtDistribution,
      totalZonesCovered: zoneGroup.length,
    };
  },

  // 8. Data Quality Report
  getDataQualityReport: async (filters = {}) => {
    const addressWhere = buildAddressWhere(filters);
    const addresses = await prisma.address.findMany({
      where: addressWhere,
      select: {
        id: true,
        addressCode: true,
        streetName: true,
        description: true,
        location: true,
        status: true,
      },
    });

    let missingStreetName = 0;
    let missingDescription = 0;
    let missingGps = 0;
    let invalidGps = 0;
    let validRecords = 0;

    for (const addr of addresses) {
      let isIssue = false;
      if (!addr.streetName || addr.streetName === "Unnamed Street") {
        missingStreetName++;
        isIssue = true;
      }
      if (!addr.description) {
        missingDescription++;
        isIssue = true;
      }
      if (!addr.location) {
        missingGps++;
        isIssue = true;
      } else {
        try {
          parseLocation(addr.location);
        } catch {
          invalidGps++;
          isIssue = true;
        }
      }

      if (!isIssue) {
        validRecords++;
      }
    }

    const total = addresses.length;
    const qualityScore = total > 0 ? Math.round((validRecords / total) * 100) : 100;

    return {
      totalRecords: total,
      validRecords,
      qualityScore,
      issues: {
        missingStreetName,
        missingDescription,
        missingGps,
        invalidGps,
      },
    };
  },

  // 9. Trend Analytics
  getTrendAnalytics: async (filters = {}) => {
    const addressWhere = buildAddressWhere(filters);

    const addresses = await prisma.address.findMany({
      where: addressWhere,
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const monthlyCounts = {};

    for (const a of addresses) {
      const date = new Date(a.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      monthlyCounts[key] = (monthlyCounts[key] || 0) + 1;
    }

    const trend = Object.keys(monthlyCounts).map((month) => ({
      period: month,
      count: monthlyCounts[month],
    }));

    return trend;
  },

  // 10. Export Data Handler (CSV, Excel HTML, Text PDF Format)
  exportReportData: async (format = "csv", filters = {}) => {
    const districtReport = await ReportsService.getDistrictPerformance(filters);

    const generatedDate = new Date().toISOString().split("T")[0];

    if (format === "csv") {
      let csv = "Somalia Digital Address System - District Performance Report\n";
      csv += `Generated Date: ${generatedDate}\n\n`;
      csv += "District Name,Code,Zones Count,Blocks Count,Houses Count,Assignments Count,Completed Assignments,Completion %,Approval %\n";

      for (const row of districtReport) {
        csv += `"${row.name}","${row.code}",${row.zonesCount},${row.blocksCount},${row.housesCount},${row.assignmentsCount},${row.completedAssignments},${row.completionPct}%,${row.approvalPct}%\n`;
      }

      return {
        filename: `sdas_district_report_${generatedDate}.csv`,
        mimeType: "text/csv",
        data: csv,
      };
    }

    if (format === "excel") {
      let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="SDAS Report">
  <Table>
   <Row><Cell><Data ss:Type="String">Somalia Digital Address System - Performance Report</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Generated Date: ${generatedDate}</Data></Cell></Row>
   <Row></Row>
   <Row>
    <Cell><Data ss:Type="String">District Name</Data></Cell>
    <Cell><Data ss:Type="String">Code</Data></Cell>
    <Cell><Data ss:Type="String">Zones</Data></Cell>
    <Cell><Data ss:Type="String">Blocks</Data></Cell>
    <Cell><Data ss:Type="String">Houses</Data></Cell>
    <Cell><Data ss:Type="String">Assignments</Data></Cell>
    <Cell><Data ss:Type="String">Completed</Data></Cell>
    <Cell><Data ss:Type="String">Completion Rate</Data></Cell>
    <Cell><Data ss:Type="String">Approval Rate</Data></Cell>
   </Row>`;

      for (const row of districtReport) {
        xml += `
   <Row>
    <Cell><Data ss:Type="String">${row.name}</Data></Cell>
    <Cell><Data ss:Type="String">${row.code}</Data></Cell>
    <Cell><Data ss:Type="Number">${row.zonesCount}</Data></Cell>
    <Cell><Data ss:Type="Number">${row.blocksCount}</Data></Cell>
    <Cell><Data ss:Type="Number">${row.housesCount}</Data></Cell>
    <Cell><Data ss:Type="Number">${row.assignmentsCount}</Data></Cell>
    <Cell><Data ss:Type="Number">${row.completedAssignments}</Data></Cell>
    <Cell><Data ss:Type="String">${row.completionPct}%</Data></Cell>
    <Cell><Data ss:Type="String">${row.approvalPct}%</Data></Cell>
   </Row>`;
      }

      xml += `
  </Table>
 </Worksheet>
</Workbook>`;

      return {
        filename: `sdas_district_report_${generatedDate}.xls`,
        mimeType: "application/vnd.ms-excel",
        data: xml,
      };
    }

    if (format === "pdf") {
      let pdfContent = `SOMALIA DIGITAL ADDRESS SYSTEM (SDAS)
NATIONAL DISTRICT PERFORMANCE REPORT
Generated: ${generatedDate}
================================================================================

`;
      for (const row of districtReport) {
        pdfContent += `District: ${row.name} (${row.code})\n`;
        pdfContent += `  - Zones: ${row.zonesCount} | Blocks: ${row.blocksCount} | Houses: ${row.housesCount}\n`;
        pdfContent += `  - Assignments: ${row.assignmentsCount} Total (${row.completedAssignments} Completed)\n`;
        pdfContent += `  - Completion Rate: ${row.completionPct}% | Approval Rate: ${row.approvalPct}%\n`;
        pdfContent += `--------------------------------------------------------------------------------\n`;
      }

      return {
        filename: `sdas_district_report_${generatedDate}.txt`,
        mimeType: "text/plain",
        data: pdfContent,
      };
    }

    throw new Error("Unsupported export format");
  },
};
