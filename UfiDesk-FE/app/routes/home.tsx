import type { Route } from "./+types/home";
import { redirect } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "UfiDesk" },
    { name: "UfiDesk FE", content: "Hot Desk Booking and Administration" },
  ];
}

export function loader() {
  return redirect("/login");
}

export default function Home() {
  return null;
}
