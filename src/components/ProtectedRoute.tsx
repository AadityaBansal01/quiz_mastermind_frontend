import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "student" | "admin";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show loader while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // User NOT logged in → redirect to login WITH original path preserved
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // User logged in but role mismatch → send them to correct dashboard
  if (requiredRole && user.role !== requiredRole) {
    const redirect = user.role === "admin" ? "/admin/dashboard" : "/dashboard";
    return <Navigate to={redirect} replace />;
  }

  // User OK → allow route
  return <>{children}</>;
}
