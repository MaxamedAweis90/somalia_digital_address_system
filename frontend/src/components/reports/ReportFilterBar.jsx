import { useEffect, useState } from "react";
import { getDistricts } from "@/api/districtApi";
import { getZones } from "@/api/zoneApi";
import { getDataOfficers } from "@/api/dataOfficerApi";
import { getDataCollectors } from "@/api/dataCollectorApi";
import { Filter, RotateCcw, Search } from "lucide-react";

export default function ReportFilterBar({ onApply, onReset }) {
  const [districts, setDistricts] = useState([]);
  const [zones, setZones] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [collectors, setCollectors] = useState([]);

  const [filters, setFilters] = useState({
    districtId: "",
    zoneId: "",
    dataOfficerId: "",
    dataCollectorId: "",
    status: "",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    async function loadOptions() {
      try {
        const [dRes, oRes, cRes] = await Promise.all([
          getDistricts(),
          getDataOfficers(),
          getDataCollectors(),
        ]);
        setDistricts(dRes.data?.data || dRes.data || []);
        setOfficers(oRes.data?.data || oRes.data || []);
        setCollectors(cRes.data?.data || cRes.data || []);
      } catch (err) {
        console.error("Failed to load filter options", err);
      }
    }
    loadOptions();
  }, []);

  useEffect(() => {
    async function loadZones() {
      if (filters.districtId) {
        try {
          const zRes = await getZones(filters.districtId);
          setZones(zRes.data?.data || zRes.data || []);
        } catch {
          setZones([]);
        }
      } else {
        setZones([]);
      }
    }
    loadZones();
  }, [filters.districtId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "districtId") {
        next.zoneId = "";
      }
      return next;
    });
  };

  const handleApply = (e) => {
    e.preventDefault();
    onApply(filters);
  };

  const handleReset = () => {
    const resetState = {
      districtId: "",
      zoneId: "",
      dataOfficerId: "",
      dataCollectorId: "",
      status: "",
      dateFrom: "",
      dateTo: "",
    };
    setFilters(resetState);
    onReset();
  };

  return (
    <div className="bg-white border border-line rounded-xl p-5 shadow-card-sm space-y-4">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-brand" />
          <h3 className="text-sm font-semibold text-ink">Global Report Filters</h3>
        </div>
        <span className="text-[11px] text-ink-soft">
          Server-side query filtering
        </span>
      </div>

      <form onSubmit={handleApply} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-ink-soft mb-1">
            District
          </label>
          <select
            name="districtId"
            value={filters.districtId}
            onChange={handleChange}
            className="w-full h-9 rounded-lg border border-line bg-bg px-3 text-xs text-ink focus:border-brand focus:outline-none"
          >
            <option value="">All Districts</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-ink-soft mb-1">
            Zone
          </label>
          <select
            name="zoneId"
            value={filters.zoneId}
            onChange={handleChange}
            disabled={!filters.districtId}
            className="w-full h-9 rounded-lg border border-line bg-bg px-3 text-xs text-ink focus:border-brand focus:outline-none disabled:opacity-50"
          >
            <option value="">All Zones</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name} ({z.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-ink-soft mb-1">
            Data Officer
          </label>
          <select
            name="dataOfficerId"
            value={filters.dataOfficerId}
            onChange={handleChange}
            className="w-full h-9 rounded-lg border border-line bg-bg px-3 text-xs text-ink focus:border-brand focus:outline-none"
          >
            <option value="">All Officers</option>
            {officers.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-ink-soft mb-1">
            Data Collector
          </label>
          <select
            name="dataCollectorId"
            value={filters.dataCollectorId}
            onChange={handleChange}
            className="w-full h-9 rounded-lg border border-line bg-bg px-3 text-xs text-ink focus:border-brand focus:outline-none"
          >
            <option value="">All Collectors</option>
            {collectors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-ink-soft mb-1">
            Assignment Status
          </label>
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="w-full h-9 rounded-lg border border-line bg-bg px-3 text-xs text-ink focus:border-brand focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="READY_FOR_REVIEW">Ready For Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-ink-soft mb-1">
            Date From
          </label>
          <input
            type="date"
            name="dateFrom"
            value={filters.dateFrom}
            onChange={handleChange}
            className="w-full h-9 rounded-lg border border-line bg-bg px-3 text-xs text-ink focus:border-brand focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-ink-soft mb-1">
            Date To
          </label>
          <input
            type="date"
            name="dateTo"
            value={filters.dateTo}
            onChange={handleChange}
            className="w-full h-9 rounded-lg border border-line bg-bg px-3 text-xs text-ink focus:border-brand focus:outline-none"
          />
        </div>

        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
          <button
            type="submit"
            className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand px-3 text-xs font-medium text-white hover:bg-brand-hover transition-colors cursor-pointer"
          >
            <Search className="h-3.5 w-3.5" />
            Apply Filters
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="h-9 inline-flex items-center justify-center gap-1 rounded-lg border border-line bg-white px-3 text-xs font-medium text-ink-soft hover:bg-bg transition-colors cursor-pointer"
            title="Reset Filters"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
