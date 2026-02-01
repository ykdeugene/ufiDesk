import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CryptoJS from "crypto-js";
import { apiClient } from "../client";
import type {
  LoginRequest,
  LoginResponse,
  SessionStatus,
} from "../types/auth.types";

// Query Keys
export const authKeys = {
  all: ["auth"] as const,
  session: () => [...authKeys.all, "session"] as const,
};

/**
 * Hook for logging in a user
 * POST /auth/login
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: Omit<LoginRequest, "loginTime">) => {
      // Generate login timestamp (ISO-8601 format)
      const loginTime = new Date().toISOString();

      // Derive 256-bit AES key from SHA-256 hash of email:loginTime
      const keySalt = `${credentials.email}:${loginTime}`;
      const key = CryptoJS.SHA256(keySalt);

      // Derive 128-bit IV from SHA-256 hash of email:IV:loginTime (first 16 bytes)
      const ivSalt = `${credentials.email}:IV:${loginTime}`;
      const ivHash = CryptoJS.SHA256(ivSalt);
      // Take first 128 bits (16 bytes) of the hash for IV
      const iv = CryptoJS.lib.WordArray.create(ivHash.words.slice(0, 4));

      // Encrypt password using AES-256-CBC with derived key and IV
      const encryptedPassword = CryptoJS.AES.encrypt(
        credentials.password,
        key,
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        },
      ).toString();

      const response = await apiClient.post<LoginResponse>("/auth/login", {
        email: credentials.email,
        password: encryptedPassword,
        loginTime: loginTime,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message);
      }

      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch session query on successful login
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
    },
    onError: (error: Error) => {
      console.error("Login failed:", error.message);
    },
  });
}

/**
 * Hook for logging out a user
 * POST /auth/logout
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<void>("/auth/logout");

      if (!response.success) {
        throw new Error(response.message);
      }

      return response;
    },
    onSuccess: () => {
      // Clear all queries on logout
      queryClient.clear();
    },
    onError: (error: Error) => {
      console.error("Logout failed:", error.message);
    },
  });
}

/**
 * Hook for checking session status
 * GET /auth/status
 */
export function useSessionStatus(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: async () => {
      const response = await apiClient.get<SessionStatus>("/auth/status");

      if (!response.success || !response.data) {
        return null;
      }

      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    ...options,
  });
}
