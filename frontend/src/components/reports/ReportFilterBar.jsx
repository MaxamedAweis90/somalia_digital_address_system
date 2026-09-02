import { useEffect, useState } from "react";
import { Filter, RotateCcw } from "lucide-react";
import { getDistrictOptions } from "@/api/districtApi";
import { getZoneOptions } from "@/api/zoneApi";
import { getDataOfficerOptions } from "@/api/dataOfficerApi";
import { getDataCollectorOptions } from "@/api/dataCollectorApi";

const ASSIGNMENT_STATUSES = [
  "ASSIGNED",
  "IN_PROGRESS",
  "SUBMITTED",
  "READY_FOR_REVIEW",
  "APPROVED",
  "REJECTED",
];

const emptyFilters = {
  districtId: "",
  zoneId: "",
  dataOfficerId: "",
  dataCollectorId: "",
  status: "",
  dateFrom: "",
  dateTo: "",
};

export default function ReportFilterBar({ onApply, onReset }) {
  const [draft, setDraft] = useState(emptyFilters);
  const [districts, setDistricts] = useState([]);
  const [zones, setZones] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    Promise.all([
      getDistrictOptions(),
      getDataOfficerOptions(),
      getDataCollectorOptions(),
    ])
      .then(([districtData, officerData, collectorData]) => {
        setDistricts(districtData);
        setOfficers(officerData);
        setCollectors(collectorData);
      })
      .finally(() => setLoadingOptions(false));
  }, []);

  useEffect(() => {
    if (!draft.districtId) {
      setZones([]);
      return;
    }

    getZoneOptions({ districtId: draft.districtId })
      .then((data) => setZones(data))
      .catch(() => setZones([]));
  }, [draft.districtId]);

  const updateField = (field, value) => {
    setDraft((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "districtId") {
        next.zoneId = "";
      }
      return next;
    });
  };

  const handleApply = () => {
    const applied = {};
    Object.entries(draft).forEach(([key, value]) => {
      if (value) applied[key] = value;
    });
    onApply?.(applied);
  };

  const handleReset = () => {
    setDraft(emptyFilters);
    onReset?.();
  };

  const selectClass =
    "h-9 w-full rounded-lg border border-line bg-white px-3 text-xs text-ink focus:border-blue-deep focus:outline-none focus:ring-1 focus:ring-blue-deep/30 disabled:opacity-50";

  return (
    <div className="rounded-xl border border-line bg-white p-4 shadow-card-sm space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        <Filter className="h-4 w-4 text-brand" />
        Report Filters
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <label className="space-y-1">
          <span className="text-[11px] font-medium text-ink-soft">District</span>
          <select
            className={selectClass}
            value={draft.districtId}
            disabled={loadingOptions}
            onChange={(e) => updateField("districtId", e.target.value)}
          >
            <option value="">All districts</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-[11px] font-medium text-ink-soft">Zone</span>
          <select
            className={selectClass}
            value={draft.zoneId}
            disabled={!draft.districtId || loadingOptions}
            onChange={(e) => updateField("zoneId", e.target.value)}
          >
            <option value="">All zones</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-[11px] font-medium text-ink-soft">Data Officer</span>
          <select
            className={selectClass}
            value={draft.dataOfficerId}
            disabled={loadingOptions}
            onChange={(e) => updateField("dataOfficerId", e.target.value)}
          >
            <option value="">All officers</option>
            {officers.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-[11px] font-medium text-ink-soft">Data Collector</span>
          <select
            className={selectClass}
            value={draft.dataCollectorId}
            disabled={loadingOptions}
            onChange={(e) => updateField("dataCollectorId", e.target.value)}
          >
            <option value="">All collectors</option>
            {collectors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-[11px] font-medium text-ink-soft">Status</span>
          <select
            className={selectClass}
            value={draft.status}
            onChange={(e) => updateField("status", e.target.value)}
          >
            <option value="">All statuses</option>
            {ASSIGNMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-[11px] font-medium text-ink-soft">From</span>
          <input
            type="date"
            className={selectClass}
            value={draft.dateFrom}
            onChange={(e) => updateField("dateFrom", e.target.value)}
          />
        </label>

        <label className="space-y-1">
          <span className="text-[11px] font-medium text-ink-soft">To</span>
          <input
            type="date"
            className={selectClass}
            value={draft.dateTo}
            onChange={(e) => updateField("dateTo", e.target.value)}
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleApply}
          className="h-9 rounded-lg bg-blue-deep px-4 text-xs font-semibold text-white hover:bg-blue-deep/90 transition-colors cursor-pointer"
        >
          Apply Filters
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="h-9 rounded-lg border border-line bg-white px-4 text-xs font-medium text-ink hover:bg-bg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>
    </div>
  );
}
