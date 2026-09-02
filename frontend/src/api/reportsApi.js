import api from "./axios";

function buildParams(filters = {}) {
  const params = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params[key] = value;
    }
  });
  return params;
}

export const getExecutiveSummary = (filters) =>
  api.get("/admin/reports/summary", { params: buildParams(filters) });

export const getCollectionProgressReport = (filters) =>
  api.get("/admin/reports/collection-progress", { params: buildParams(filters) });

export const getDistrictPerformanceReport = (filters) =>
  api.get("/admin/reports/districts", { params: buildParams(filters) });

export const getCollectorPerformanceReport = (filters) =>
  api.get("/admin/reports/collectors", { params: buildParams(filters) });

export const getAssignmentLifecycleReport = (filters) =>
  api.get("/admin/reports/assignments", { params: buildParams(filters) });

export const getSpatialValidationReport = (filters) =>
  api.get("/admin/reports/spatial", { params: buildParams(filters) });

export const getAddressStatisticsReport = (filters) =>
  api.get("/admin/reports/addresses", { params: buildParams(filters) });

export const getDataQualityReport = (filters) =>
  api.get("/admin/reports/data-quality", { params: buildParams(filters) });

export const getTrendAnalyticsReport = (filters) =>
  api.get("/admin/reports/trends", { params: buildParams(filters) });

export async function downloadReportExport(format, filters = {}) {
  const response = await api.get(`/admin/reports/export/${format}`, {
    params: buildParams(filters),
    responseType: "blob",
  });

  const disposition = response.headers["content-disposition"] || "";
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] || `sdas_report.${format === "excel" ? "xls" : format}`;

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
