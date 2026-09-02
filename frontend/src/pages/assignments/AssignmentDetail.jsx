import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getOfficerAssignmentById } from "@/api/officerApi";
import { getCollectorAssignmentById } from "@/api/collectorApi";
import { deleteAssignment, getAssignmentById } from "@/api/assignmentApi";
import DefineZoneBlocksAssignment from "@/components/assignments/DefineZoneBlocksAssignment";
import RegisterAddressesAssignment from "@/components/assignments/RegisterAddressesAssignment";
import OfficerParentDetail from "@/pages/officer/OfficerParentDetail";
import {
  AssignmentTypeBadge,
  formatAssignmentLocation,
} from "@/components/assignments/AssignmentStatusBadge";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageHeader from "@/components/ui/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/constants/roles";

export default function AssignmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.SYS_ADMIN;
  const isOfficer = user?.role === ROLES.DATA_OFFICER;
  const isCollector = user?.role === ROLES.DATA_COLLECTOR;

  const [assignmentMeta, setAssignmentMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRevoke, setShowRevoke] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState(null);

  useEffect(() => {
    const fetcher = isCollector
      ? getCollectorAssignmentById
      : isOfficer
        ? getOfficerAssignmentById
        : getAssignmentById;

    fetcher(id)
      .then((res) => setAssignmentMeta(res.data.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load assignment"))
      .finally(() => setLoading(false));
  }, [id, isCollector, isOfficer]);

  if (loading) {
    return (
      <div className="min-h-full bg-bg flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue" />
      </div>
    );
  }

  if (error || !assignmentMeta) {
    return <div className="min-h-full bg-bg p-8 text-center text-sm text-red-600">{error || "Not found"}</div>;
  }

  if (isOfficer && assignmentMeta.tier === "PARENT") {
    return <OfficerParentDetail />;
  }

  const workflowMode = isAdmin ? "admin" : isOfficer ? "officer-review" : "collector";
  const basePath = isAdmin ? "/admin" : isOfficer ? "/officer" : "/collector";
  const isRegisterAddresses = assignmentMeta.type === "REGISTER_ADDRESSES";
  const canRevoke = isAdmin && assignmentMeta.status !== "APPROVED";

  const confirmRevoke = async () => {
    try {
      setRevoking(true);
      setRevokeError(null);
      await deleteAssignment(id);
      setShowRevoke(false);
      navigate("/admin/assignments");
    } catch (err) {
      setRevokeError(err.response?.data?.message || "Failed to revoke assignment");
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="min-h-full bg-bg font-sans">
      <ConfirmDialog
        open={showRevoke}
        title="Revoke Assignment"
        message={`Revoke the assignment for ${formatAssignmentLocation(assignmentMeta)}? This removes the officer assignment and all related collector tasks. Published registry data is not affected.`}
        confirmLabel="Revoke"
        loading={revoking}
        loadingLabel="Revoking..."
        variant="danger"
        error={revokeError}
        onConfirm={confirmRevoke}
        onCancel={() => {
          if (!revoking) {
            setShowRevoke(false);
            setRevokeError(null);
          }
        }}
      />

      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10 space-y-6">
        <Breadcrumb
          items={[
            {
              label: isAdmin ? "Assignments" : isOfficer ? "Zones" : "Assigned Work",
              to: isAdmin
                ? "/admin/assignments"
                : isOfficer
                  ? "/officer/zones"
                  : `${basePath}/dashboard`,
            },
            { label: isRegisterAddresses ? "Register Addresses" : "Define Zone Blocks" },
          ]}
        />
        <PageHeader
          title={isRegisterAddresses ? "Register Zone Block Addresses" : "Define Zone Blocks"}
          description={
            workflowMode === "collector"
              ? "Complete your assigned field work and submit to your data officer."
              : workflowMode === "officer-review"
                ? "Review the collector's submitted addresses and GPS coordinates."
                : "Review the merged submission and GPS coordinates from the data officer."
          }
          actions={
            <div className="flex items-center gap-2">
              <AssignmentTypeBadge type={assignmentMeta.type} />
              {canRevoke && (
                <button
                  type="button"
                  onClick={() => {
                    setRevokeError(null);
                    setShowRevoke(true);
                  }}
                  className="h-[32px] rounded-md border border-red-200 bg-white px-3 text-[11px] font-semibold text-red-600 transition-all hover:bg-red-50 cursor-pointer"
                >
                  Revoke
                </button>
              )}
            </div>
          }
        />
        {isRegisterAddresses ? (
          <RegisterAddressesAssignment id={id} workflowMode={workflowMode} />
        ) : (
          <DefineZoneBlocksAssignment id={id} workflowMode={workflowMode} />
        )}
      </div>
    </div>
  );
}
