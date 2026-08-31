import { ReportsService } from "../service/reports.service.js";

function extractFilters(req) {
  const {
    districtId,
    zoneId,
    dataOfficerId,
    dataCollectorId,
    status,
    dateFrom,
    dateTo,
  } = req.query

  return {
    districtId: districtId || undefined,
    zoneId: zoneId || undefined,
    dataOfficerId: dataOfficerId || undefined,
    dataCollectorId: dataCollectorId || undefined,
    status: status || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  };
}

export const getExecutiveSummary = async (req, res, next) => {
  try {
    const filters = extractFilters(req);
    const data = await ReportsService.getExecutiveSummary(filters);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getCollectionProgress = async (req, res, next) => {
  try {
    const filters = extractFilters(req);
    const data = await ReportsService.getCollectionProgress(filters);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getDistrictPerformance = async (req, res, next) => {
  try {
    const filters = extractFilters(req);
    const data = await ReportsService.getDistrictPerformance(filters);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getCollectorPerformance = async (req, res, next) => {
  try {
    const filters = extractFilters(req);
    const data = await ReportsService.getCollectorPerformance(filters);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAssignmentLifecycle = async (req, res, next) => {
  try {
    const filters = extractFilters(req);
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";

    const result = await ReportsService.getAssignmentLifecycle(
      filters,
      page,
      limit,
      search
    );
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getSpatialValidationReport = async (req, res, next) => {
  try {
    const filters = extractFilters(req);
    const data = await ReportsService.getSpatialValidationReport(filters);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAddressStatistics = async (req, res, next) => {
  try {
    const filters = extractFilters(req);
    const data = await ReportsService.getAddressStatistics(filters);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getDataQualityReport = async (req, res, next) => {
  try {
    const filters = extractFilters(req);
    const data = await ReportsService.getDataQualityReport(filters);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getTrendAnalytics = async (req, res, next) => {
  try {
    const filters = extractFilters(req);
    const data = await ReportsService.getTrendAnalytics(filters);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const exportReportData = async (req, res, next) => {
  try {
    const filters = extractFilters(req);
    const format = req.params.format || "csv";

    const exportResult = await ReportsService.exportReportData(format, filters);

    res.setHeader("Content-Type", exportResult.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${exportResult.filename}"`
    );
    res.status(200).send(exportResult.data);
  } catch (error) {
    next(error);
  }
};
