import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import {
  getDataCollectorById,
  updateDataCollector,
} from "@/api/dataCollectorApi";
import { getDataOfficers } from "@/api/dataOfficerApi";
import DataCollectorForm from "./components/DataCollectorForm";

export default function EditDataCollectorPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [collector, setCollector] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOfficers, setLoadingOfficers] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCollector = async () => {
      try {
        setLoading(true);
        const res = await getDataCollectorById(id);
        const dataObj = res.data?.data || res.data;
        setCollector(dataObj);
      } catch (err) {
        toast.error("Failed to load data collector details.");
        navigate("/admin/data-collectors");
      } finally {
        setLoading(false);
      }
    };

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
      } catch (err) {
        toast.error("Failed to load data officers.");
      } finally {
        setLoadingOfficers(false);
      }
    };

    fetchCollector();
    fetchOfficers();
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        supervisorId: formData.supervisorId,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      await updateDataCollector(id, payload);

      toast.success("Data collector updated successfully.");
      navigate("/admin/data-collectors");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to update data collector. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg font-sans flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-deep" />
          <p className="text-[13px] text-ink-soft">Loading collector details...</p>
        </div>
      </div>
    );
  }

  const initialFormData = {
    name: collector?.name || "",
    email: collector?.email || "",
    supervisorId: collector?.supervisorId || collector?.supervisor?.id || "",
    password: "",
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
          <span className="text-ink font-semibold">Edit Data Collector</span>
        </div>

        <div className="mb-6">
          <h1 className="font-display text-[25px] font-semibold tracking-tight text-ink">
            Edit Data Collector
          </h1>
          <p className="mt-1 text-[13px] text-ink-soft">
            Update account details or reassign supervising officer.
          </p>
        </div>

        <div className="w-full max-w-[635px] bg-white border border-line rounded-xl shadow-card-sm overflow-hidden">
          <div className="px-5 py-5 border-b border-line">
            <h2 className="text-[18px] font-semibold text-ink">
              Update Collector Profile
            </h2>
            <p className="mt-1 text-[13px] text-ink-soft">
              Modify officer assignment or collector credentials.
            </p>
          </div>

          <div className="px-5 py-5">
            <DataCollectorForm
              initialData={initialFormData}
              officers={officers}
              loadingOfficers={loadingOfficers}
              isEdit={true}
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
