import { useMutation, useQueryClient } from "@tanstack/react-query";
import CryptoJS from "crypto-js";
import { apiClient } from "../client";
import type { UserDto, UserProfileUpdateRequest } from "../types/auth.types";

/**
 * Hook for updating user profile (non-admin)
 * POST /user/update-profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      userData: Omit<UserProfileUpdateRequest, "updateTime"> & {
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

      const response = await apiClient.post<UserDto>("/user/update-profile", {
        email: userData.email,
        password: encryptedPassword || "",
        updateTime: updateTime,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message);
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalidate session status to refresh user data
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (error: Error) => {
      console.error("Update profile failed:", error.message);
    },
  });
}
