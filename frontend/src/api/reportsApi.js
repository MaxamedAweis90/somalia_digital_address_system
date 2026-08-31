import api from "./axios";

export async function getExecutiveSummary(params = {}) {
  return api.get("/admin/reports/summary", { params });
}

export async function getReportsExecutiveSummary(params = {}) {
  return api.get("/admin/reports/summary", { params });
}

export async function getCollectionProgressReport(params = {}) {
  return api.get("/admin/reports/collection-progress", { params });
}

export async function getDistrictPerformanceReport(params = {}) {
  return api.get("/admin/reports/districts", { params });
}

export async function getCollectorPerformanceReport(params = {}) {
  return api.get("/admin/reports/collectors", { params });
}

export async function getAssignmentLifecycleReport(params = {}) {
  return api.get("/admin/reports/assignments", { params });
}

export async function getSpatialValidationReport(params = {}) {
  return api.get("/admin/reports/spatial", { params });
}

export async function getAddressStatisticsReport(params = {}) {
  return api.get("/admin/reports/addresses", { params });
}

export async function getDataQualityReport(params = {}) {
  return api.get("/admin/reports/data-quality", { params });
}

export async function getTrendAnalyticsReport(params = {}) {
  return api.get("/admin/reports/trends", { params });
}

export async function downloadReportExport(format = "csv", params = {}) {
  const response = await api.get(`/admin/reports/export/${format}`, {
    params,
    responseType: "blob",
  });

  const mimeTypes = {
    csv: "text/csv",
    excel: "application/vnd.ms-excel",
    pdf: "text/plain",
  };

  const extensions = {
    csv: "csv",
    excel: "xls",
    pdf: "txt",
  };

  const blob = new Blob([response.data], {
    type: mimeTypes[format] || "application/octet-stream",
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const dateStr = new Date().toISOString().split("T")[0];
  link.setAttribute("download", `sdas_report_${format}_${dateStr}.${extensions[format] || format}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
