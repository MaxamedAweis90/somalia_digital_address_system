import { useNavigate } from "react-router-dom";

export default function DataCollectorTable({
  collectors = [],
  onRegeneratePassword,
  onDelete,
}) {
  const navigate = useNavigate();

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

                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/data-collectors/${collector.id}`)}
                      className="h-[32px] rounded-md border border-line bg-white px-3 text-[11px] font-semibold text-ink transition-all hover:bg-bg cursor-pointer"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => onRegeneratePassword(collector)}
                      className="h-[32px] rounded-md border border-amber-200 bg-amber-50 px-3 text-[11px] font-semibold text-amber-800 transition-all hover:bg-amber-100 cursor-pointer"
                    >
                      Regenerate Password
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/data-collectors/${collector.id}/edit`)}
                      className="h-[32px] rounded-md bg-blue-deep px-3 text-[11px] font-semibold text-white transition-all hover:bg-[#0F2B4D] cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(collector)}
                      className="h-[32px] rounded-md border border-red-200 bg-white px-3 text-[11px] font-semibold text-red-600 transition-all hover:bg-red-50 cursor-pointer"
                    >
                      Delete
                    </button>
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
