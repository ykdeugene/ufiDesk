import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CryptoJS from "crypto-js";
import { apiClient } from "../client";
import type {
  UserDto,
  CreateUserRequest,
  UpdateUserRequest,
} from "../types/admin.types";

// Query Keys
export const adminKeys = {
  all: ["admin"] as const,
  users: () => [...adminKeys.all, "users"] as const,
};

/**
 * Hook for fetching all users
 * GET /admin/get-users
 */
export function useGetUsers() {
  return useQuery({
    queryKey: adminKeys.users(),
    queryFn: async () => {
      const response = await apiClient.get<UserDto[]>("/admin/get-users");

      if (!response.success || !response.data) {
        throw new Error(response.message);
      }

      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook for creating a new user
 * POST /admin/create-user
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      userData: Omit<CreateUserRequest, "createTime" | "password"> & {
        password: string;
      },
    ) => {
      // Generate create timestamp (ISO-8601 format)
      const createTime = new Date().toISOString();

      // Derive 256-bit AES key from SHA-256 hash of email:createTime
      const keySalt = `${userData.email}:${createTime}`;
      const key = CryptoJS.SHA256(keySalt);

      // Derive 128-bit IV from SHA-256 hash of email:IV:createTime (first 16 bytes)
      const ivSalt = `${userData.email}:IV:${createTime}`;
      const ivHash = CryptoJS.SHA256(ivSalt);
      const iv = CryptoJS.lib.WordArray.create(ivHash.words.slice(0, 4));

      // Encrypt password using AES-256-CBC with derived key and IV
      const encryptedPassword = CryptoJS.AES.encrypt(userData.password, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }).toString();

      const response = await apiClient.post<UserDto>("/admin/create-user", {
        email: userData.email,
        password: encryptedPassword,
        admin: userData.admin,
        active: userData.active,
        createTime: createTime,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message);
      }

      return response.data;
    },
    onSuccess: () => {
      // Refetch users list after creating a user
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
    onError: (error: Error) => {
      console.error("Create user failed:", error.message);
    },
  });
}

/**
 * Hook for updating an existing user
 * POST /admin/update-user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      userData: Omit<UpdateUserRequest, "updateTime"> & {
        password?: string;
      },
    ) => {
      // Generate update timestamp (ISO-8601 format)
      const updateTime = new Date().toISOString();

      let encryptedPassword: string | undefined;

      // Only encrypt password if provided
      if (userData.password && userData.password.trim() !== "") {
        // Derive 256-bit AES key from SHA-256 hash of email:updateTime
        const keySalt = `${userData.email}:${updateTime}`;
        const key = CryptoJS.SHA256(keySalt);

        // Derive 128-bit IV from SHA-256 hash of email:IV:updateTime (first 16 bytes)
        const ivSalt = `${userData.email}:IV:${updateTime}`;
        const ivHash = CryptoJS.SHA256(ivSalt);
        const iv = CryptoJS.lib.WordArray.create(ivHash.words.slice(0, 4));

        // Encrypt password using AES-256-CBC with derived key and IV
        encryptedPassword = CryptoJS.AES.encrypt(userData.password, key, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }).toString();
      }

      const response = await apiClient.post<UserDto>("/admin/update-user", {
        email: userData.email,
        password: encryptedPassword || "",
        admin: userData.admin,
        active: userData.active,
        updateTime: updateTime,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message);
      }

      return response.data;
    },
    onSuccess: () => {
      // Refetch users list after updating a user
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
    onError: (error: Error) => {
      console.error("Update user failed:", error.message);
    },
  });
}
