import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function GuestRoute({ children }) {
  const { isAuthenticated, loading, user, getHomePath } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0056B3] border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={getHomePath(user.role)} replace />;
  }

  return children;
}
