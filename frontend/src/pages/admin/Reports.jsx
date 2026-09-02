import { useCallback, useEffect, useState } from "react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import PageHeader from "@/components/ui/PageHeader";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import Pagination from "@/components/common/Pagination";
import ReportKpiCard from "@/components/reports/ReportKpiCard";
import ReportFilterBar from "@/components/reports/ReportFilterBar";
import ReportSpatialMap from "@/components/reports/ReportSpatialMap";
import AssignmentStatusBadge from "@/components/reports/AssignmentStatusBadge";
import {
  DonutChart,
  HorizontalBarChart,
  TrendLineChart,
} from "@/components/reports/ReportCustomChart"
import {
  getExecutiveSummary,
  getCollectionProgressReport,
  getDistrictPerformanceReport,
  getCollectorPerformanceReport,
  getAssignmentLifecycleReport,
  getSpatialValidationReport,
  getAddressStatisticsReport,
  getDataQualityReport,
  getTrendAnalyticsReport,
  downloadReportExport,
} from "@/api/reportsApi";
import {
  BarChart3,
  Building2,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Globe,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

export default function Reports() {
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Data states
  const [summary, setSummary] = useState(null);
  const [collectionProgress, setCollectionProgress] = useState(null);
  const [districtPerformance, setDistrictPerformance] = useState([]);
  const [collectorPerformance, setCollectorPerformance] = useState([]);
  const [assignmentLifecycle, setAssignmentLifecycle] = useState({
    data: [],
    pagination: { page: 1, limit: 10, totalCount: 0, totalPages: 1 },
  });
  const [spatialReport, setSpatialReport] = useState(null);
  const [addressStats, setAddressStats] = useState(null);
  const [dataQuality, setDataQuality] = useState(null);
  const [trends, setTrends] = useState([]);

  // Assignment pagination
  const [assignmentPage, setAssignmentPage] = useState(1);

  const fetchAllReports = useCallback(
    async (appliedFilters = filters) => {
      try {
        setLoading(true);
        setError(null);

        const [
          sumRes,
          progRes,
          distRes,
          collRes,
          assignRes,
          spatRes,
          addrRes,
          qualRes,
          trendRes,
        ] = await Promise.all([
          getExecutiveSummary(appliedFilters),
          getCollectionProgressReport(appliedFilters),
          getDistrictPerformanceReport(appliedFilters),
          getCollectorPerformanceReport(appliedFilters),
          getAssignmentLifecycleReport({
            ...appliedFilters,
            page: assignmentPage,
            limit: 10,
          }),
          getSpatialValidationReport(appliedFilters),
          getAddressStatisticsReport(appliedFilters),
          getDataQualityReport(appliedFilters),
          getTrendAnalyticsReport(appliedFilters),
        ]);

        setSummary(sumRes.data?.data);
        setCollectionProgress(progRes.data?.data);
        setDistrictPerformance(distRes.data?.data || []);
        setCollectorPerformance(collRes.data?.data || []);
        setAssignmentLifecycle({
          data: assignRes.data?.data || [],
          pagination: assignRes.data?.pagination || {
            page: 1,
            limit: 10,
            totalCount: 0,
            totalPages: 1,
          },
        });
        setSpatialReport(spatRes.data?.data);
        setAddressStats(addrRes.data?.data);
        setDataQuality(qualRes.data?.data);
        setTrends(trendRes.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load report analytics");
      } finally {
        setLoading(false);
      }
    },
    [filters, assignmentPage]
  );

  useEffect(() => {
    fetchAllReports();
  }, [fetchAllReports]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setAssignmentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({});
    setAssignmentPage(1);
  };

  const handleExport = async (format) => {
    try {
      setExporting(true);
      await downloadReportExport(format, filters);
    } catch (err) {
      alert("Failed to export report: " + (err.message || "Unknown error"));
    } finally {
      setExporting(false);
    }
  };

  if (loading && !summary) {
    return (
      <div className="min-h-full bg-bg font-sans px-4 sm:px-6 lg:px-5 pt-5 pb-10">
        <DashboardSkeleton />
      </div>
    );
  }

  const headerActions = (
    <>
      <button
        onClick={() => fetchAllReports()}
        disabled={loading}
        className="h-9 px-3 rounded-lg border border-line bg-white text-xs font-medium text-ink hover:bg-bg transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        Refresh
      </button>
      <button
        onClick={() => handleExport("csv")}
        disabled={exporting}
        className="h-9 px-3 rounded-lg border border-line bg-white text-xs font-medium text-ink hover:bg-bg transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
      >
        <Download className="h-3.5 w-3.5 text-brand" />
        Export CSV
      </button>
      <button
        onClick={() => handleExport("excel")}
        disabled={exporting}
        className="h-9 px-3 rounded-lg border border-line bg-white text-xs font-medium text-ink hover:bg-bg transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
      >
        <FileSpreadsheet className="h-3.5 w-3.5 text-teal" />
        Export Excel
      </button>
      <button
        onClick={() => handleExport("pdf")}
        disabled={exporting}
        className="h-9 px-3 rounded-lg border border-line bg-white text-xs font-medium text-ink hover:bg-bg transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
      >
        <FileText className="h-3.5 w-3.5 text-sand" />
        Export Report
      </button>
    </>
  );

  return (
    <div className="min-h-full bg-bg font-sans">
      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10 space-y-6">
        <Breadcrumb items={[{ label: "Reports & Analytics" }]} />

        <PageHeader
          title="Reports & Analytics"
          description="Monitor address collection, assignments, field teams, district progress, and GIS validation across SDAS."
          actions={headerActions}
        />

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => fetchAllReports()}
              className="text-xs font-semibold underline hover:text-red-900 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Global Filter Bar */}
        <ReportFilterBar
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />

        {/* ─── Executive Summary KPI Cards ─── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ReportKpiCard
            title="Total Assignments"
            value={summary?.assignments?.total || 0}
            icon={BarChart3}
            accent="blue-deep"
          />
          <ReportKpiCard
            title="Completed Assignments"
            value={summary?.assignments?.completed || 0}
            icon={CheckCircle2}
            accent="teal"
          />
          <ReportKpiCard
            title="Buildings Collected"
            value={summary?.buildings?.totalCollected || 0}
            icon={Building2}
            accent="brand"
          />
          <ReportKpiCard
            title="Buildings Approved"
            value={summary?.buildings?.approved || 0}
            icon={ShieldCheck}
            accent="teal"
          />
        </div>

        {/* Secondary KPI Summary Row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="bg-white border border-line rounded-xl p-4 shadow-card-sm text-center">
            <span className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider block">
              Assignment Completion
            </span>
            <span className="text-xl font-bold text-brand font-mono mt-1 block">
              {summary?.assignments?.completionRate || 0}%
            </span>
          </div>
          <div className="bg-white border border-line rounded-xl p-4 shadow-card-sm text-center">
            <span className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider block">
              Building Approval Rate
            </span>
            <span className="text-xl font-bold text-teal font-mono mt-1 block">
              {summary?.buildings?.approvalRate || 0}%
            </span>
          </div>
          <div className="bg-white border border-line rounded-xl p-4 shadow-card-sm text-center">
            <span className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider block">
              Spatial Validation Score
            </span>
            <span className="text-xl font-bold text-blue-deep font-mono mt-1 block">
              {spatialReport?.validationScore ?? 100}%
            </span>
          </div>
          <div className="bg-white border border-line rounded-xl p-4 shadow-card-sm text-center">
            <span className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider block">
              Data Quality Score
            </span>
            <span className="text-xl font-bold text-sand font-mono mt-1 block">
              {dataQuality?.qualityScore ?? 100}%
            </span>
          </div>
        </div>

        {/* ─── SECTION A — Collection Progress ─── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="bg-white border border-line rounded-xl p-5 shadow-card-sm lg:col-span-1 space-y-3">
            <h2 className="text-base font-semibold text-ink">
              Assignment Status Distribution
            </h2>
            <p className="text-xs text-ink-soft">
              Real-time assignment pipeline distribution.
            </p>
            <DonutChart data={collectionProgress?.statusBreakdown || []} />
          </div>

          <div className="bg-white border border-line rounded-xl p-5 shadow-card-sm lg:col-span-2 space-y-4 overflow-hidden">
            <div className="border-b border-line pb-3">
              <h2 className="text-base font-semibold text-ink">
                Collection Progress Breakdown
              </h2>
              <p className="text-xs text-ink-soft">
                Status counts and percentage distribution across active filters.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-line bg-[#FBFCFE] text-left text-[11px] font-semibold uppercase text-ink-soft">
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Count</th>
                    <th className="px-4 py-3 text-right">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-xs text-ink">
                  {(collectionProgress?.statusBreakdown || []).map((item) => (
                    <tr key={item.status} className="hover:bg-bg/50">
                      <td className="px-4 py-3">
                        <AssignmentStatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold">
                        {item.count}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-ink-soft">
                        {item.percentage}%
                      </td>
                    </tr>
                  ))}
                  {(!collectionProgress?.statusBreakdown || collectionProgress.statusBreakdown.length === 0) && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-xs text-ink-soft">
                        No assignment data available for selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ─── SECTION B — District Report ─── */}
        <div className="bg-white border border-line rounded-xl p-5 shadow-card-sm space-y-4">
          <div className="border-b border-line pb-3">
            <h2 className="text-base font-semibold text-ink">
              District Performance Report
            </h2>
            <p className="text-xs text-ink-soft">
              Infrastructure coverage and assignment completion per district.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-line bg-[#FBFCFE] text-left text-[11px] font-semibold uppercase text-ink-soft">
                    <th className="px-4 py-3">District</th>
                    <th className="px-4 py-3 text-right">Zones</th>
                    <th className="px-4 py-3 text-right">Blocks</th>
                    <th className="px-4 py-3 text-right">Houses</th>
                    <th className="px-4 py-3 text-right">Assignments</th>
                    <th className="px-4 py-3 text-right">Completion %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-xs text-ink">
                  {districtPerformance.length > 0 ? (
                    districtPerformance.map((d) => (
                      <tr key={d.id} className="hover:bg-bg/50">
                        <td className="px-4 py-3 font-semibold">
                          {d.name}{" "}
                          <span className="text-[11px] font-mono text-ink-soft">
                            ({d.code})
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono">{d.zonesCount}</td>
                        <td className="px-4 py-3 text-right font-mono">{d.blocksCount}</td>
                        <td className="px-4 py-3 text-right font-mono">{d.housesCount}</td>
                        <td className="px-4 py-3 text-right font-mono">{d.assignmentsCount}</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-brand">
                          {d.completionPct}%
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-xs text-ink-soft">
                        No district data matching current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-line pt-4 lg:pt-0 lg:pl-6 space-y-3">
              <h3 className="text-sm font-semibold text-ink">District Completion Rank</h3>
              <HorizontalBarChart
                data={districtPerformance.map((d) => ({
                  name: d.name,
                  completionPct: d.completionPct,
                }))}
              />
            </div>
          </div>
        </div>

        {/* ─── SECTION C — Data Collector Performance ─── */}
        <div className="bg-white border border-line rounded-xl p-5 shadow-card-sm space-y-4">
          <div className="border-b border-line pb-3">
            <h2 className="text-base font-semibold text-ink">
              Data Collector Performance
            </h2>
            <p className="text-xs text-ink-soft">
              Field collector productivity, assigned workload, and approval success rates.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-line bg-[#FBFCFE] text-left text-[11px] font-semibold uppercase text-ink-soft">
                  <th className="px-4 py-3">Collector</th>
                  <th className="px-4 py-3">Supervisor</th>
                  <th className="px-4 py-3 text-right">Assigned</th>
                  <th className="px-4 py-3 text-right">In Progress</th>
                  <th className="px-4 py-3 text-right">Submitted</th>
                  <th className="px-4 py-3 text-right">Approved</th>
                  <th className="px-4 py-3 text-right">Rejected</th>
                  <th className="px-4 py-3 text-right">Completion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-xs text-ink">
                {collectorPerformance.length > 0 ? (
                  collectorPerformance.map((c) => (
                    <tr key={c.id} className="hover:bg-bg/50">
                      <td className="px-4 py-3 font-semibold">
                        {c.name}
                        <span className="block text-[11px] text-ink-soft font-normal">
                          {c.email}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink-soft">{c.supervisorName}</td>
                      <td className="px-4 py-3 text-right font-mono">{c.assigned}</td>
                      <td className="px-4 py-3 text-right font-mono">{c.inProgress}</td>
                      <td className="px-4 py-3 text-right font-mono">{c.submitted}</td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-700 font-semibold">
                        {c.approved}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-red-600">
                        {c.rejected}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-brand">
                        {c.completionRate}%
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-xs text-ink-soft">
                      No data collectors found for the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── SECTION D — Assignment Lifecycle Report ─── */}
        <div className="bg-white border border-line rounded-xl p-5 shadow-card-sm space-y-4">
          <div className="border-b border-line pb-3">
            <h2 className="text-base font-semibold text-ink">
              Assignment Lifecycle & Audit Trail
            </h2>
            <p className="text-xs text-ink-soft">
              Track assignment lifecycle stages from creation to final approval.
            </p>
          </div>

          {/* Pipeline visual indicator */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-3 bg-bg rounded-lg text-xs font-medium">
            <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800">Assigned</span>
            <span className="text-ink-soft font-bold">→</span>
            <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-800">In Progress</span>
            <span className="text-ink-soft font-bold">→</span>
            <span className="px-2.5 py-1 rounded bg-purple-100 text-purple-800">Submitted</span>
            <span className="text-ink-soft font-bold">→</span>
            <span className="px-2.5 py-1 rounded bg-indigo-100 text-indigo-800">Ready for Review</span>
            <span className="text-ink-soft font-bold">→</span>
            <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800">Approved</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-line bg-[#FBFCFE] text-left text-[11px] font-semibold uppercase text-ink-soft">
                  <th className="px-4 py-3">District / Zone</th>
                  <th className="px-4 py-3">Block</th>
                  <th className="px-4 py-3">Officer</th>
                  <th className="px-4 py-3">Collector</th>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-xs text-ink">
                {assignmentLifecycle.data.length > 0 ? (
                  assignmentLifecycle.data.map((a) => (
                    <tr key={a.id} className="hover:bg-bg/50">
                      <td className="px-4 py-3 font-semibold">
                        {a.districtName} / {a.zoneName}
                      </td>
                      <td className="px-4 py-3 text-ink-soft">{a.zoneBlockName}</td>
                      <td className="px-4 py-3">{a.officerName}</td>
                      <td className="px-4 py-3">{a.collectorName}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-bg text-ink border border-line">
                          {a.tier}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <AssignmentStatusBadge status={a.status} />
                      </td>
                      <td className="px-4 py-3 text-right text-ink-soft font-mono">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-xs text-ink-soft">
                      No assignments found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            page={assignmentLifecycle.pagination.page}
            totalPages={assignmentLifecycle.pagination.totalPages}
            total={assignmentLifecycle.pagination.totalCount}
            pageSize={assignmentLifecycle.pagination.limit}
            onPageChange={(page) => setAssignmentPage(page)}
          />
        </div>

        {/* ─── SECTION E & G — GIS Spatial & Data Quality ─── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Spatial Validation Card + Map */}
          <div className="bg-white border border-line rounded-xl p-5 shadow-card-sm space-y-3">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-brand" />
                <h2 className="text-base font-semibold text-ink">
                  GIS & Spatial Validation
                </h2>
              </div>
              <span className="text-xs font-semibold font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                Score: {spatialReport?.validationScore ?? 100}%
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-bg border border-line">
                <span className="text-[10px] uppercase font-semibold text-ink-soft block">
                  With GPS
                </span>
                <span className="font-bold text-ink font-mono mt-0.5 block">
                  {spatialReport?.withCoordinates || 0}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-bg border border-line">
                <span className="text-[10px] uppercase font-semibold text-ink-soft block">
                  Missing GPS
                </span>
                <span className="font-bold text-amber-600 font-mono mt-0.5 block">
                  {spatialReport?.missingCoordinates || 0}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-bg border border-line">
                <span className="text-[10px] uppercase font-semibold text-ink-soft block">
                  Violations
                </span>
                <span className="font-bold text-red-600 font-mono mt-0.5 block">
                  {spatialReport?.boundaryViolations || 0}
                </span>
              </div>
            </div>

            <ReportSpatialMap
              points={spatialReport?.spatialPoints || []}
              height="260px"
            />
          </div>

          {/* Data Quality Report */}
          <div className="bg-white border border-line rounded-xl p-5 shadow-card-sm space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-teal" />
                <h2 className="text-base font-semibold text-ink">
                  Data Quality & Validation
                </h2>
              </div>
              <span className="text-xs font-semibold font-mono text-brand bg-brand-light px-2 py-1 rounded">
                Quality: {dataQuality?.qualityScore ?? 100}%
              </span>
            </div>

            <div className="space-y-3">
              {[
                { label: "Missing Street Names", key: "missingStreetName", color: "text-amber-700" },
                { label: "Missing Property Description", key: "missingDescription", color: "text-amber-700" },
                { label: "Missing GPS Coordinates", key: "missingGps", color: "text-red-600" },
                { label: "Invalid Coordinates Format", key: "invalidGps", color: "text-red-600" },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex justify-between items-center text-xs p-3 rounded-lg bg-bg border border-line"
                >
                  <span className="font-medium text-ink">{item.label}</span>
                  <span className={`font-mono font-semibold ${item.color}`}>
                    {dataQuality?.issues?.[item.key] || 0}
                  </span>
                </div>
              ))}
            </div>

            {/* Address Statistics Summary */}
            <div className="border-t border-line pt-4 mt-2 space-y-2">
              <h3 className="text-sm font-semibold text-ink">Address Registry Summary</h3>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-bg border border-line">
                  <span className="text-[10px] uppercase font-semibold text-ink-soft block">
                    Total
                  </span>
                  <span className="font-bold text-ink font-mono block">
                    {addressStats?.totalAddresses || 0}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-bg border border-line">
                  <span className="text-[10px] uppercase font-semibold text-ink-soft block">
                    Active
                  </span>
                  <span className="font-bold text-emerald-700 font-mono block">
                    {addressStats?.activeAddresses || 0}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-bg border border-line">
                  <span className="text-[10px] uppercase font-semibold text-ink-soft block">
                    Inactive
                  </span>
                  <span className="font-bold text-ink-soft font-mono block">
                    {addressStats?.inactiveAddresses || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── SECTION F — Address Distribution by District ─── */}
        {addressStats?.districtDistribution?.length > 0 && (
          <div className="bg-white border border-line rounded-xl p-5 shadow-card-sm space-y-4">
            <div className="border-b border-line pb-3">
              <h2 className="text-base font-semibold text-ink">
                Address Distribution by District
              </h2>
              <p className="text-xs text-ink-soft">
                How registered digital addresses are spread across districts.
              </p>
            </div>
            <HorizontalBarChart
              data={addressStats.districtDistribution.map((d) => ({
                name: `${d.name} (${d.code})`,
                val: d.count,
              }))}
            />
          </div>
        )}

        {/* ─── SECTION H — Collection Trend Analytics ─── */}
        <div className="bg-white border border-line rounded-xl p-5 shadow-card-sm space-y-3">
          <div className="border-b border-line pb-3">
            <h2 className="text-base font-semibold text-ink">
              Address Collection Timeline & Trends
            </h2>
            <p className="text-xs text-ink-soft">
              Historical timeline of registered properties over time.
            </p>
          </div>
          <TrendLineChart data={trends} />
        </div>
      </div>
    </div>
  );
}
