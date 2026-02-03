import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Booking } from "~/api/hooks/useBooking";

export interface Notification {
  id: string;
  createdAt: string;
  updatedAt: string;
  email: string;
  booking: Booking;
  cancelledBy: string;
  notifiedStatus: boolean;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  getUnnotifiedCount: () => number;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],

      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
        })),

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((notif) => notif.id !== id),
        })),

      clearNotifications: () =>
        set({
          notifications: [],
        }),

      getUnnotifiedCount: () =>
        get().notifications.filter((notif) => !notif.notifiedStatus).length,
    }),
    {
      name: "notification-storage",
    },
  ),
);
