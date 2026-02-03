import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "../client";
import type { Booking } from "./useBooking";

// Query Keys
export const deskKeys = {
  all: ["desk"] as const,
  byFloorplan: () => [...deskKeys.all, "by-floorplan"] as const,
};

// Types
export interface DeskData {
  id: string;
  floorplanId: string;
  deskId: string;
  description: string;
  blockStart: string | null;
  blockEnd: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateDeskDetailsRequest {
  deskId: string;
  description: string;
  blockStart: string | null;
  blockEnd: string | null;
}

/**
 * Hook for getting desks by floorplan
 * GET /get-desks-by-main-floorplan
 */
export function useGetDesksByMainFloorplan() {
  return useQuery({
    queryKey: deskKeys.byFloorplan(),
    queryFn: async () => {
      const response = await apiClient.get<DeskData[]>(
        "/desk/get-desks-by-main-floorplan",
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch desks");
      }

      return response.data;
    },
  });
}

/**
 * Hook for updating desk details
 * POST /desk/update-desk-details
 */
export function useUpdateDeskDetails() {
  return useMutation({
    mutationFn: async (request: UpdateDeskDetailsRequest) => {
      const response = await apiClient.post<DeskData>(
        "/desk/update-desk-details",
        request,
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to update desk details");
      }

      return response.data;
    },
  });
}

/**
 * Hook for checking booking clashes
 * POST /desk/check-for-clash
 */
export function useCheckForClash() {
  return useMutation({
    mutationFn: async (request: UpdateDeskDetailsRequest) => {
      const response = await apiClient.post<Booking[]>(
        "/desk/check-for-clash",
        request,
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to check for clashes");
      }

      return response.data;
    },
  });
}
