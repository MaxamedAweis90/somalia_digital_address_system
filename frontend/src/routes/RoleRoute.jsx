import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

export default function RoleRoute({ allowedRoles, children }) {
  const { user, getHomePath } = useAuth();

  return (
    <ProtectedRoute>
      {allowedRoles.includes(user?.role) ? (
        children
      ) : (
        <Navigate to={getHomePath(user?.role)} replace />
      )}
    </ProtectedRoute>
  );
}
