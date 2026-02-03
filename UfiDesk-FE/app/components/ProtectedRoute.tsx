import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useSessionStatus } from "~/api/hooks";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "user";
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { data: sessionData, isLoading } = useSessionStatus();

  useEffect(() => {
    console.log("🛡️ ProtectedRoute Check:");
    console.log("  Is Loading:", isLoading);
    console.log("  Session Data:", sessionData);
    console.log("  User Role:", sessionData?.role);
    console.log("  Is Admin:", sessionData?.admin);
    console.log("  Required Role:", requiredRole);

    if (isLoading) return;

    // If no session, redirect to login
    if (!sessionData) {
      console.log("  ❌ No session, redirecting to login");
      navigate("/login", { replace: true });
      return;
    }

    // If admin role required but user is not admin, redirect to home
    if (requiredRole === "admin" && sessionData.admin !== true) {
      console.log(
        "  ❌ Admin role required but user is not admin, redirecting to home",
      );
      navigate("/", { replace: true });
      return;
    }

    console.log("  ✅ Access granted");
  }, [sessionData, isLoading, navigate, requiredRole]);

  // Show loading state while checking session
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Don't render children if not authenticated or authorized
  if (!sessionData) return null;

  if (requiredRole === "admin" && sessionData.admin !== true) {
    return null;
  }

  return <>{children}</>;
}
