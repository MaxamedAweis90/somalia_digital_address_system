import { useState, useEffect, useRef } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
  Sparkles,
  Info,
} from "lucide-react";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/**
 * AuditCalendarFilter Component
 * A calendar popover with activity heatmap color coding, tooltips, and date range/day filtering.
 */
export default function AuditCalendarFilter({
  selectedDate, // "YYYY-MM-DD" or null
  onSelectDate, // (dateStr | null) => void
  activitySummary = {}, // { "YYYY-MM-DD": { count, createCount, updateCount, deleteCount } }
  currentYear,
  currentMonth,
  onChangeMonth, // (newYear, newMonth) => void
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredDate, setHoveredDate] = useState(null);
  const popoverRef = useRef(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  // Navigate months
  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (currentMonth === 1) {
      onChangeMonth(currentYear - 1, 12);
    } else {
      onChangeMonth(currentYear, currentMonth - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (currentMonth === 12) {
      onChangeMonth(currentYear + 1, 1);
    } else {
      onChangeMonth(currentYear, currentMonth + 1);
    }
  };

  // Calendar calculations
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 (Sun) - 6 (Sat)
  const daysInPrevMonth = new Date(currentYear, currentMonth - 1, 0).getDate();

  // Current system date for "Today" marker
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Quick Preset Actions
  const handleSelectToday = () => {
    onChangeMonth(today.getFullYear(), today.getMonth() + 1);
    onSelectDate(todayStr);
    setIsOpen(false);
  };

  const handleSelectThisMonth = () => {
    // Select the whole month
    const startOfMonth = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
    const endOfMonth = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;
    onSelectDate({ startDate: startOfMonth, endDate: endOfMonth, label: `${MONTH_NAMES[currentMonth - 1]} ${currentYear}` });
    setIsOpen(false);
  };

  const handleClearDate = (e) => {
    if (e) e.stopPropagation();
    onSelectDate(null);
  };

  // Format label for button trigger
  const getButtonLabel = () => {
    if (!selectedDate) return "All Dates / Filter";
    if (typeof selectedDate === "object" && selectedDate.label) {
      return selectedDate.label;
    }
    if (typeof selectedDate === "string") {
      const [y, m, d] = selectedDate.split("-");
      if (y && m && d) {
        const dObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
        return dObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
    }
    return "Filtered Date";
  };

  // Compute total changes recorded in this month
  const totalMonthActivity = Object.entries(activitySummary).reduce(
    (sum, [dStr, data]) => {
      const [y, m] = dStr.split("-").map(Number);
      if (y === currentYear && m === currentMonth) {
        return sum + (data.count || 0);
      }
      return sum;
    },
    0
  );

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Trigger Button (Matching UI inputs) */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`h-[38px] px-3 rounded-lg border text-[12px] font-medium transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${
            selectedDate
              ? "bg-blue/5 border-blue text-blue font-semibold ring-2 ring-blue/10"
              : "bg-white border-line text-ink hover:bg-slate-50 hover:border-slate-300"
          }`}
          title="Filter logs by date or view activity heatmap"
        >
          <CalendarIcon
            className={`h-4 w-4 shrink-0 ${
              selectedDate ? "text-blue" : "text-slate-400"
            }`}
          />
          <span className="whitespace-nowrap">{getButtonLabel()}</span>

          {/* Active filter clear indicator */}
          {selectedDate && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleClearDate();
              }}
              className="ml-1 p-0.5 rounded-full hover:bg-blue/15 text-blue transition-colors cursor-pointer"
              title="Clear date filter"
            >
              <X className="h-3 w-3" />
            </span>
          )}

          {!selectedDate && (
            <span className="text-slate-400 text-[10px] ml-0.5">▼</span>
          )}
        </button>
      </div>

      {/* Popover Dropdown (Aligned to right edge of trigger button to stay within viewport) */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-[300px] sm:w-[320px] max-w-[calc(100vw-32px)] rounded-xl bg-white p-3.5 sm:p-4 shadow-2xl border border-line animate-in fade-in zoom-in-95 duration-150 font-sans">
          {/* Header Month / Year controls */}
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-[14px] sm:text-[15px] font-bold text-ink">
                {MONTH_NAMES[currentMonth - 1]} {currentYear}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-ink transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-ink transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1.5 py-2.5 border-b border-slate-100">
            <button
              type="button"
              onClick={handleSelectToday}
              className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-slate-100 hover:bg-blue/10 text-slate-700 hover:text-blue transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleSelectThisMonth}
              className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-slate-100 hover:bg-blue/10 text-slate-700 hover:text-blue transition-colors cursor-pointer"
            >
              This Month
            </button>
            {selectedDate && (
              <button
                type="button"
                onClick={handleClearDate}
                className="ml-auto px-2 py-1 text-[11px] font-semibold rounded-md text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>

          {/* Weekday Header Labels */}
          <div className="grid grid-cols-7 gap-1 text-center pt-2 pb-1">
            {DAYS_OF_WEEK.map((d) => (
              <div
                key={d}
                className="text-[11px] font-bold text-slate-400 uppercase tracking-wider"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid with Heatmap Color Highlights */}
          <div className="grid grid-cols-7 gap-1">
            {/* Previous Month Padding Days */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => {
              const prevDayNum = daysInPrevMonth - firstDayOfWeek + i + 1;
              return (
                <div
                  key={`prev-${i}`}
                  className="h-8 flex items-center justify-center text-[11px] text-slate-300 pointer-events-none select-none"
                >
                  {prevDayNum}
                </div>
              );
            })}

            {/* Current Month Active Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              const dayActivity = activitySummary[dateStr];
              const count = dayActivity?.count || 0;

              const isSelected =
                typeof selectedDate === "string"
                  ? selectedDate === dateStr
                  : typeof selectedDate === "object" && selectedDate?.startDate
                  ? dateStr >= selectedDate.startDate && dateStr <= selectedDate.endDate
                  : false;

              const isToday = dateStr === todayStr;

              // Color-coding rules per specification:
              // 0 changes: Default UI background / gray / transparent
              // 1 to 5 changes: Light Green indicator
              // > 6 changes: Darker Green prominent indicator
              let cellStyle = "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-100/80";
              if (count >= 1 && count <= 5) {
                cellStyle =
                  "bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold hover:bg-emerald-200";
              } else if (count >= 6) {
                cellStyle =
                  "bg-emerald-600 text-white font-bold border border-emerald-700 shadow-2xs hover:bg-emerald-700";
              }

              if (isSelected) {
                cellStyle += " ring-2 ring-blue ring-offset-1 z-10 scale-105";
              }

              return (
                <div
                  key={dateStr}
                  className="relative group"
                  onMouseEnter={() => setHoveredDate(dateStr)}
                  onMouseLeave={() => setHoveredDate(null)}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelectDate(dateStr);
                      setIsOpen(false);
                    }}
                    className={`h-8 w-full rounded-lg text-[12px] flex flex-col items-center justify-center transition-all cursor-pointer relative ${cellStyle}`}
                  >
                    <span className="leading-none">{dayNum}</span>

                    {/* Today indicator dot */}
                    {isToday && (
                      <span
                        className={`absolute bottom-1 h-1 w-1 rounded-full ${
                          count >= 6 ? "bg-white" : "bg-blue"
                        }`}
                      />
                    )}
                  </button>

                  {/* Tooltip on Hover */}
                  {hoveredDate === dateStr && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-white shadow-2xl border border-slate-700 animate-in fade-in zoom-in-95 duration-100">
                      <p className="text-[11px] font-bold text-slate-100">
                        {new Date(currentYear, currentMonth - 1, dayNum).toLocaleDateString(
                          "en-US",
                          { weekday: "short", month: "short", day: "numeric", year: "numeric" }
                        )}
                      </p>
                      <p
                        className={`text-[11px] font-semibold mt-0.5 ${
                          count > 0 ? "text-emerald-400" : "text-slate-400"
                        }`}
                      >
                        {count > 0
                          ? `${count} action${count > 1 ? "s" : ""} recorded`
                          : "No activity recorded"}
                      </p>
                      {count > 0 && dayActivity && (
                        <div className="flex items-center gap-1.5 text-[9.5px] text-slate-300 mt-1 font-mono border-t border-slate-800 pt-1">
                          {dayActivity.createCount > 0 && (
                            <span className="text-emerald-300">
                              +{dayActivity.createCount} Create
                            </span>
                          )}
                          {dayActivity.updateCount > 0 && (
                            <span className="text-blue-300">
                              ~{dayActivity.updateCount} Update
                            </span>
                          )}
                          {dayActivity.deleteCount > 0 && (
                            <span className="text-rose-300">
                              -{dayActivity.deleteCount} Delete
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend & Month Summary Footer */}
          <div className="mt-3.5 pt-3 border-t border-line flex flex-col gap-2">
            <div className="flex items-center justify-between text-[10.5px] text-ink-soft">
              <span className="font-semibold text-ink">
                Month Total:{" "}
                <span className="text-emerald-700 font-bold">
                  {totalMonthActivity}
                </span>{" "}
                actions
              </span>
            </div>

            {/* Heatmap Legend */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-xs bg-slate-100 border border-slate-200 shrink-0" />
                <span>0 actions</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-xs bg-emerald-100 border border-emerald-300 shrink-0" />
                <span>1–5 (Low)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-xs bg-emerald-600 shrink-0" />
                <span>&gt;6 (High)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
