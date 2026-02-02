import { type RouteConfig, index, route } from "@react-router/dev/routes";

const adminPrefix = "admin/";
const userPrefix = "user/";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login/login-page.tsx"),
  route(
    `${adminPrefix}user-management`,
    "routes/admin/user-management-page.tsx",
  ),
  route(
    `${adminPrefix}upload-floorplan`,
    "routes/admin/upload-floorplan/upload-floorplan-page.tsx",
  ),
  route(
    `${adminPrefix}floorplan-details`,
    "routes/admin/floorplan-details/floorplan-details-page.tsx",
  ),
  route(`${userPrefix}desk-booking`, "routes/user/desk-booking-page.tsx"),
  // Catch-all route for unmatched paths (must be last)
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
