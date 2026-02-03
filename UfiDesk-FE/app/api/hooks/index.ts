// Export all API hooks from a single entry point
export { useLogin, useLogout, useSessionStatus, authKeys } from "./useAuth";
export {
  useGetUsers,
  useCreateUser,
  useUpdateUser,
  adminKeys,
} from "./useAdmin";
export { useUpdateProfile } from "./useUser";
export {
  useGetFloorplan,
  useGetMainFloorplan,
  useUploadFloorplan,
  useSetMainFloorplan,
  floorplanKeys,
} from "./useFloorplan";
export {
  useGetDesksByMainFloorplan as useGetDesksByFloorplan,
  useUpdateDeskDetails,
  useCheckForClash,
  deskKeys,
} from "./useDesk";
