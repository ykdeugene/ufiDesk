import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";

// Query Keys
export const bookingKeys = {
  all: ["booking"] as const,
  activeBookings: () => [...bookingKeys.all, "active"] as const,
};

// Types
export enum Period {
  AM = "AM",
  PM = "PM",
}

export enum Status {
  ACTIVE = "ACTIVE",
  CANCELLED = "CANCELLED",
}

export interface CreateBookingRequest {
  description: string;
  deskIds: string[];
  startDate: string; // ISO date string (YYYY-MM-DD)
  startPeriod: Period;
  endDate: string; // ISO date string (YYYY-MM-DD)
  endPeriod: Period;
}

export interface Booking {
  id: string;
  floorplanId: string;
  deskId: string;
  description: string;
  startDate: string;
  startPeriod: Period;
  endDate: string;
  endPeriod: Period;
  userEmail: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

/**
 * Hook for creating a booking
 * POST /booking/create-booking
 * Returns a list of bookings (one per desk ID)
 */
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingData: CreateBookingRequest) => {
      const response = await apiClient.post<Booking[]>(
        "/booking/create-booking",
        bookingData,
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to create booking");
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalidate booking queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}

/**
 * Hook for getting all active bookings
 * GET /booking/get-all-active-booking
 */
export function useGetAllActiveBookings() {
  return useQuery({
    queryKey: bookingKeys.activeBookings(),
    queryFn: async () => {
      const response = await apiClient.get<Booking[]>(
        "/booking/get-all-active-booking",
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch active bookings");
      }

      return response.data;
    },
  });
}

/**
 * Hook for deleting a booking
 * DELETE /booking/delete-booking/{bookingId}
 */
export function useDeleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await apiClient.delete<void>(
        `/booking/delete-booking/${bookingId}`,
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to delete booking");
      }

      return response;
    },
    onSuccess: () => {
      // Invalidate booking queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}
