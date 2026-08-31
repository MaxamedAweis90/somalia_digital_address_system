import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Eye, Edit, KeyRound, Trash2 } from "lucide-react";

export default function DataCollectorTable({
  collectors = [],
  onRegeneratePassword,
  onDelete,
}) {
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-line bg-[#FBFCFE]">
            <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
              Name
            </th>
            <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
              Email
            </th>
            <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
              Supervisor
            </th>
            <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
              Created Date
            </th>
            <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
              Status
            </th>
            <th className="px-5 py-4 text-right text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {collectors.map((collector) => {
            const supervisorName =
              collector.supervisor?.name ||
              collector.supervisorName ||
              (collector.supervisorId ? `Officer (${collector.supervisorId.slice(0, 8)}...)` : "Unassigned");

            const supervisorEmail =
              collector.supervisor?.email || collector.supervisorEmail || "";

            return (
              <tr
                key={collector.id}
                className="border-b border-line last:border-b-0 hover:bg-[#FBFCFE] transition-colors"
              >
                <td className="px-5 py-4">
                  <span
                    onClick={() => navigate(`/admin/data-collectors/${collector.id}`)}
                    className="text-[13px] font-semibold text-ink hover:text-blue cursor-pointer"
                  >
                    {collector.name}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <span className="text-[12px] text-ink">{collector.email}</span>
                </td>

                <td className="px-5 py-4">
                  <div>
                    <p className="text-[12px] font-semibold text-ink">
                      {supervisorName}
                    </p>
                    {supervisorEmail && (
                      <p className="text-[11px] text-ink-soft">
                        {supervisorEmail}
                      </p>
                    )}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span className="text-[12px] text-ink-soft">
                    {collector.createdAt
                      ? new Date(collector.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-100">
                    DATA_COLLECTOR
                  </span>
                </td>

                <td className="px-5 py-4 text-right relative">
                  <div className="inline-block text-left" ref={openMenuId === collector.id ? menuRef : null}>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuId(openMenuId === collector.id ? null : collector.id)
                      }
                      className="p-1.5 rounded-lg text-ink-soft hover:bg-slate-100 hover:text-ink transition-colors cursor-pointer"
                      title="Actions menu"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {openMenuId === collector.id && (
                      <div className="absolute right-5 mt-1 w-44 rounded-lg bg-white border border-line shadow-lg py-1 z-30 text-left">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            navigate(`/admin/data-collectors/${collector.id}`);
                          }}
                          className="w-full px-3 py-2 text-[12px] font-medium text-ink hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-500" />
                          View Details
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            navigate(`/admin/data-collectors/${collector.id}/edit`);
                          }}
                          className="w-full px-3 py-2 text-[12px] font-medium text-ink hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Edit className="h-3.5 w-3.5 text-slate-500" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            onRegeneratePassword(collector);
                          }}
                          className="w-full px-3 py-2 text-[12px] font-medium text-amber-700 hover:bg-amber-50 flex items-center gap-2 cursor-pointer"
                        >
                          <KeyRound className="h-3.5 w-3.5 text-amber-600" />
                          Regenerate Password
                        </button>

                        <div className="my-1 border-t border-line" />

                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            onDelete(collector);
                          }}
                          className="w-full px-3 py-2 text-[12px] font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
