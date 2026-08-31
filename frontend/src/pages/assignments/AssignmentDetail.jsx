import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getOfficerAssignmentById } from "@/api/officerApi";
import { getCollectorAssignmentById } from "@/api/collectorApi";
import { getAssignmentById } from "@/api/assignmentApi";
import DefineZoneBlocksAssignment from "@/components/assignments/DefineZoneBlocksAssignment";
import RegisterAddressesAssignment from "@/components/assignments/RegisterAddressesAssignment";
import OfficerParentDetail from "@/pages/officer/OfficerParentDetail";
import { AssignmentTypeBadge } from "@/components/assignments/AssignmentStatusBadge";
import Breadcrumb from "@/components/ui/Breadcrumb";
import PageHeader from "@/components/ui/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/constants/roles";

export default function AssignmentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.SYS_ADMIN;
  const isOfficer = user?.role === ROLES.DATA_OFFICER;
  const isCollector = user?.role === ROLES.DATA_COLLECTOR;

  const [assignmentMeta, setAssignmentMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div className="min-h-full bg-bg font-sans">
      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10 space-y-6">
        <Breadcrumb
          items={[
            {
              label: isAdmin ? "Assignments" : isOfficer ? "Zones" : "My Tasks",
              to: `${basePath}/dashboard`,
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
                ? "Review the collector's submission."
                : "Review the merged submission from the data officer."
          }
          actions={<AssignmentTypeBadge type={assignmentMeta.type} />}
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
