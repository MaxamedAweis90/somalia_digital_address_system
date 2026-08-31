import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  KeyRound,
  Trash2,
  User,
  Mail,
  ShieldCheck,
  Calendar,
  UserCheck,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import { getDataCollectorById } from "@/api/dataCollectorApi";
import RegeneratePasswordModal from "./components/RegeneratePasswordModal";
import DeleteCollectorDialog from "./components/DeleteCollectorDialog";

export default function DataCollectorDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [collector, setCollector] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await getDataCollectorById(id);
        const dataObj = res.data?.data || res.data;
        setCollector(dataObj);
      } catch {
        toast.error("Failed to load collector details.");
        navigate("/admin/data-collectors");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg font-sans flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-deep" />
          <p className="text-[13px] text-ink-soft">Loading collector profile...</p>
        </div>
      </div>
    );
  }

  if (!collector) return null;

  const supervisorName =
    collector.supervisor?.name ||
    collector.supervisorName ||
    (collector.supervisorId ? `Officer (${collector.supervisorId})` : "Unassigned");

  const supervisorEmail =
    collector.supervisor?.email || collector.supervisorEmail || "N/A";

  return (
    <div className="min-h-screen bg-bg font-sans">
      {showRegenerateModal && (
        <RegeneratePasswordModal
          collector={collector}
          onClose={() => setShowRegenerateModal(false)}
        />
      )}

      <DeleteCollectorDialog
        open={showDeleteDialog}
        collector={collector}
        onClose={() => setShowDeleteDialog(false)}
        onDeleted={() => navigate("/admin/data-collectors")}
      />

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
          <span className="text-ink font-semibold">{collector.name}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/data-collectors")}
              className="h-9 w-9 rounded-lg border border-line bg-white flex items-center justify-center text-ink-soft hover:bg-slate-50 cursor-pointer shrink-0"
              title="Back to collectors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="font-display text-[25px] font-semibold tracking-tight text-ink">
                {collector.name}
              </h1>
              <p className="mt-0.5 text-[13px] text-ink-soft">
                Field Data Collector Profile
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate(`/admin/data-collectors/${id}/edit`)}
              className="h-[36px] px-3.5 rounded-lg bg-blue-deep text-[12px] font-semibold text-white hover:bg-[#0F2B4D] transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              onClick={() => setShowRegenerateModal(true)}
              className="h-[36px] px-3.5 rounded-lg border border-amber-200 bg-amber-50 text-[12px] font-semibold text-amber-800 hover:bg-amber-100 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <KeyRound className="h-3.5 w-3.5" />
              Regenerate Password
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="h-[36px] px-3.5 rounded-lg border border-red-200 bg-white text-[12px] font-semibold text-red-600 hover:bg-red-50 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Collector Information Card */}
          <div className="bg-white border border-line rounded-xl shadow-card-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-line bg-[#FBFCFE]">
              <h2 className="text-[15px] font-semibold text-ink flex items-center gap-2">
                <User className="h-4 w-4 text-blue-deep" />
                Collector Information
              </h2>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="grid grid-cols-3 gap-2 py-2 border-b border-line/60">
                <span className="text-[12px] font-semibold text-ink-soft">Full Name</span>
                <span className="col-span-2 text-[13px] font-semibold text-ink">{collector.name}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 border-b border-line/60">
                <span className="text-[12px] font-semibold text-ink-soft flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Email
                </span>
                <span className="col-span-2 text-[13px] text-ink">{collector.email}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 border-b border-line/60">
                <span className="text-[12px] font-semibold text-ink-soft flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" /> Role
                </span>
                <span className="col-span-2">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-100">
                    {collector.role || "DATA_COLLECTOR"}
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 border-b border-line/60">
                <span className="text-[12px] font-semibold text-ink-soft flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Created Date
                </span>
                <span className="col-span-2 text-[13px] text-ink">
                  {collector.createdAt
                    ? new Date(collector.createdAt).toLocaleString()
                    : "—"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2">
                <span className="text-[12px] font-semibold text-ink-soft">Updated Date</span>
                <span className="col-span-2 text-[13px] text-ink">
                  {collector.updatedAt
                    ? new Date(collector.updatedAt).toLocaleString()
                    : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Supervision Information Card */}
          <div className="bg-white border border-line rounded-xl shadow-card-sm overflow-hidden h-fit">
            <div className="px-5 py-4 border-b border-line bg-[#FBFCFE]">
              <h2 className="text-[15px] font-semibold text-ink flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-blue-deep" />
                Supervision Details
              </h2>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="grid grid-cols-3 gap-2 py-2 border-b border-line/60">
                <span className="text-[12px] font-semibold text-ink-soft">Supervising Officer</span>
                <span className="col-span-2 text-[13px] font-semibold text-ink">
                  {supervisorName}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2">
                <span className="text-[12px] font-semibold text-ink-soft">Officer Email</span>
                <span className="col-span-2 text-[13px] text-ink">
                  {supervisorEmail}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
