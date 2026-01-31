import { type RouteConfig, index, route } from "@react-router/dev/routes";

const adminPrefix = "admin/";

export default [
  index("routes/home.tsx"),
  route("login", "login/login-page.tsx"),
  route(`${adminPrefix}user-management`, "admin/user-management-page.tsx"),
  route(
    `${adminPrefix}upload-floorplan`,
    "admin/upload-floorplan/upload-floorplan-page.tsx",
  ),
] satisfies RouteConfig;
