import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createDataCollector } from "@/api/dataCollectorApi";
import { getDataOfficers } from "@/api/dataOfficerApi";
import DataCollectorForm from "./components/DataCollectorForm";

export default function CreateDataCollectorPage() {
  const navigate = useNavigate();

  const [officers, setOfficers] = useState([]);
  const [loadingOfficers, setLoadingOfficers] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        setLoadingOfficers(true);
        const res = await getDataOfficers();

        const dataList =
          res.data?.data?.officers ||
          res.data?.officers ||
          res.data?.data ||
          (Array.isArray(res.data) ? res.data : []);

        setOfficers(dataList);
      } catch {
        toast.error("Failed to load list of data officers. Please refresh.");
      } finally {
        setLoadingOfficers(false);
      }
    };

    fetchOfficers();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        supervisorId: formData.supervisorId,
      };

      await createDataCollector(payload);

      toast.success("Data collector created successfully.");
      navigate("/admin/data-collectors");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to create data collector. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg font-sans">
      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10">
        <div className="flex items-center gap-2 text-[11px] font-medium text-ink-soft mb-6">
          <span
            onClick={() => navigate("/admin/dashboard")}
            className="hover:text-blue cursor-pointer"
          >
            Dashboard
          </span>
          <span className="text-gray-400">›</span>
          <span
            onClick={() => navigate("/admin/data-collectors")}
            className="hover:text-blue cursor-pointer"
          >
            Data Collectors
          </span>
          <span className="text-gray-400">›</span>
          <span className="text-ink font-semibold">Add Data Collector</span>
        </div>

        <div className="mb-6">
          <h1 className="font-display text-[25px] font-semibold tracking-tight text-ink">
            Add Data Collector
          </h1>
          <p className="mt-1 text-[13px] text-ink-soft">
            Create a new field data collector account and assign them to a supervising data officer.
          </p>
        </div>

        <div className="w-full max-w-[635px] bg-white border border-line rounded-xl shadow-card-sm overflow-hidden">
          <div className="px-5 py-5 border-b border-line">
            <h2 className="text-[18px] font-semibold text-ink">
              Collector Details
            </h2>
            <p className="mt-1 text-[13px] text-ink-soft">
              Enter the collector&apos;s credentials and select their supervising officer.
            </p>
          </div>

          <div className="px-5 py-5">
            <DataCollectorForm
              officers={officers}
              loadingOfficers={loadingOfficers}
              isEdit={false}
              onSubmit={handleSubmit}
              onCancel={() => navigate("/admin/data-collectors")}
              submitting={submitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
