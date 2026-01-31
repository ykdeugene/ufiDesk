import { Login } from "~/login/login-page";
import type { Route } from "./+types/home";
import { UserManagementPage } from "~/admin/user-management-page";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "UfiDesk" },
    { name: "UfiDesk FE", content: "Hot Desk Booking and Administration" },
  ];
}

export default function Home() {
  return <Login />;
}
