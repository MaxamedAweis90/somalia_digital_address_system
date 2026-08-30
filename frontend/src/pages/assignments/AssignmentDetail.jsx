import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getAssignmentById } from "@/api/assignmentApi";
import DefineZonesAssignment from "@/components/assignments/DefineZonesAssignment";
import RegisterAddressesAssignment from "@/components/assignments/RegisterAddressesAssignment";
import { AssignmentTypeBadge } from "@/components/assignments/AssignmentStatusBadge";
import Breadcrumb from "@/components/ui/Breadcrumb";
import PageHeader from "@/components/ui/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/constants/roles";

export default function AssignmentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.SYS_ADMIN;
  const basePath = isAdmin ? "/admin" : "/officer";

  const [assignmentType, setAssignmentType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAssignmentById(id)
      .then((res) => {
        setAssignmentType(res.data.data?.type || "DEFINE_ZONES");
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load assignment");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-full bg-bg flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-bg p-8 text-center text-sm text-red-600">
        {error}
      </div>
    );
  }

  const isRegisterAddresses = assignmentType === "REGISTER_ADDRESSES";

  return (
    <div className="min-h-full bg-bg font-sans">
      <div className="px-4 sm:px-6 lg:px-5 pt-5 pb-10 space-y-6">
        <Breadcrumb
          items={[
            { label: isAdmin ? "Dashboard" : "My Assignments", to: `${basePath}/dashboard` },
            { label: isRegisterAddresses ? "Register Addresses" : "Define Zones" },
          ]}
        />

        <PageHeader
          title={isRegisterAddresses ? "Register Zone Addresses" : "Define Neighborhood Zones"}
          description={
            isRegisterAddresses
              ? isAdmin
                ? "Review the officer's address draft submission for the assigned zone."
                : "Place address pins inside the assigned zone, save drafts as you work, then submit for approval."
              : isAdmin
                ? "Review the officer's zone draft submission for this neighborhood."
                : "Draw zone boundaries for the assigned neighborhood. Save drafts as you work, then submit for approval."
          }
          actions={<AssignmentTypeBadge type={assignmentType} />}
        />

        {isRegisterAddresses ? (
          <RegisterAddressesAssignment id={id} isAdmin={isAdmin} />
        ) : (
          <DefineZonesAssignment id={id} isAdmin={isAdmin} />
        )}
      </div>
    </div>
  );
}
