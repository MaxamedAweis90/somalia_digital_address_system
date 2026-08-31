import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { createCollector, getCollectors } from "@/api/officerApi";
import Breadcrumb from "@/components/ui/Breadcrumb";
import PageHeader from "@/components/ui/PageHeader";

export default function OfficerCollectors() {
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);

  const load = () => {
    getCollectors()
      .then((res) => setCollectors(res.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await createCollector(form);
      setShowForm(false);
      setForm({ name: "", email: "", password: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create collector");
    }
  };

  return (
    <div className="min-h-full bg-bg font-sans">
      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10 space-y-6">
        <Breadcrumb items={[{ label: "My Assignments", to: "/officer/dashboard" }, { label: "My Team" }]} />
        <PageHeader
          title="My Data Collectors"
          description="Manage field collectors on your team."
          actions={
            <button type="button" onClick={() => setShowForm(true)} className="h-[39px] px-5 rounded-lg bg-blue-deep text-white text-[12px] font-semibold cursor-pointer">
              + Add Collector
            </button>
          }
        />
        {error && <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} className="max-w-md rounded-xl border border-line bg-white p-5 space-y-3">
            <input required placeholder="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full h-[40px] rounded-lg border border-line px-3 text-[13px]" />
            <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="w-full h-[40px] rounded-lg border border-line px-3 text-[13px]" />
            <input required type="password" placeholder="Password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} className="w-full h-[40px] rounded-lg border border-line px-3 text-[13px]" />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="h-[38px] px-4 rounded-lg border border-line text-[12px] cursor-pointer">Cancel</button>
              <button type="submit" className="h-[38px] px-4 rounded-lg bg-blue-deep text-white text-[12px] cursor-pointer">Create</button>
            </div>
          </form>
        )}

        <div className="rounded-xl border border-line bg-white shadow-card-sm overflow-hidden">
          {loading ? (
            <div className="py-12 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-blue" /></div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-line bg-[#FBFCFE]">
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase text-ink-soft">Name</th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase text-ink-soft">Email</th>
                </tr>
              </thead>
              <tbody>
                {collectors.map((c) => (
                  <tr key={c.id} className="border-b border-line">
                    <td className="px-5 py-4 text-[12px] font-medium">{c.name}</td>
                    <td className="px-5 py-4 text-[12px] text-ink-soft">{c.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
