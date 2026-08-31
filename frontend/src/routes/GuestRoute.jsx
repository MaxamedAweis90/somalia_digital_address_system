import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import LoadingState from "@/components/common/LoadingState";

export default function GuestRoute({ children }) {
  const { isAuthenticated, loading, user, getHomePath } = useAuth();

  if (loading) {
    return <LoadingState message="Somalia Digital Address System" submessage="Loading portal..." />;
  }

  if (isAuthenticated) {
    return <Navigate to={getHomePath(user.role)} replace />;
  }

  return children;
}
