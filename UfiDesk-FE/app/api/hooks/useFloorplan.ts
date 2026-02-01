import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "../client";

// Query Keys
export const floorplanKeys = {
  all: ["floorplan"] as const,
  list: () => [...floorplanKeys.all, "list"] as const,
};

// Types
export interface Desk {
  id: string;
  x: number;
  y: number;
  hasMonitor: boolean;
  direction: "up" | "down" | "left" | "right";
  type: "regular" | "standing";
}

export interface Floorplan {
  id: string;
  name: string;
  xlength: number;
  ylength: number;
  desks: Desk[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UploadFloorplanRequest {
  name: string;
  xLength: number;
  yLength: number;
  desks: Desk[];
}

/**
 * Hook for getting floorplan
 * GET /floorplan/get-floorplan
 */
export function useGetFloorplan() {
  return useQuery({
    queryKey: floorplanKeys.list(),
    queryFn: async () => {
      const response = await apiClient.get<Floorplan[]>(
        "/floorplan/get-floorplan",
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch floorplan");
      }

      return response.data;
    },
  });
}

/**
 * Hook for uploading floorplan
 * POST /floorplan/upload
 */
export function useUploadFloorplan() {
  return useMutation({
    mutationFn: async (floorplanData: UploadFloorplanRequest) => {
      const response = await apiClient.post<Floorplan>(
        "/floorplan/upload",
        floorplanData,
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to upload floorplan");
      }

      return response.data;
    },
  });
}
