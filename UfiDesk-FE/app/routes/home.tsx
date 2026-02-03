import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useSessionStatus } from "~/api/hooks";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "UfiDesk" },
    { name: "UfiDesk FE", content: "Hot Desk Booking and Administration" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const { data: sessionData, isLoading } = useSessionStatus();

  useEffect(() => {
    console.log("🏠 Home Page - Session Check:");
    console.log("  Is Loading:", isLoading);
    console.log("  Session Data:", sessionData);
    console.log("  User Role:", sessionData?.role);
    console.log("  Is Admin:", sessionData?.admin);

    if (isLoading) return;

    if (!sessionData) {
      console.log("  ➡️ No session, redirecting to login");
      navigate("/login", { replace: true });
    } else if (sessionData.admin === true) {
      console.log("  ➡️ Admin user, redirecting to user management");
      navigate("/admin/user-management", { replace: true });
    } else {
      console.log("  ➡️ Regular user, redirecting to desk booking");
      navigate("/user/desk-booking", { replace: true });
    }
  }, [sessionData, isLoading, navigate]);

  // Show loading while checking session
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-600">Loading...</div>
    </div>
  );
}
