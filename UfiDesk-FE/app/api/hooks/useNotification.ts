import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../client";
import { useNotificationStore } from "~/stores/notificationStore";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export interface NotificationEvent {
  data: string;
  id?: string;
  event?: string;
}

/**
 * Hook for subscribing to Server-Sent Events notifications
 * GET /notif-sse
 */
export function useNotificationSSE(
  onMessage: (event: MessageEvent) => void,
  enabled = true,
) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const onMessageRef = useRef(onMessage);

  // Update the ref whenever onMessage changes
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!enabled) {
      // Close existing connection if disabled
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    console.log("Creating SSE connection...");

    // Create EventSource connection
    const eventSource = new EventSource(
      `${API_BASE_URL}/notification/notif-sse`,
      {
        withCredentials: true,
      },
    );

    eventSourceRef.current = eventSource;

    // Handle connection open
    eventSource.onopen = () => {
      console.log("✅ SSE connection opened");
      setIsConnected(true);
      setError(null);
    };

    // Listen for 'connect' event (initial connection confirmation from backend)
    eventSource.addEventListener("connect", (event) => {
      console.log("✅ SSE connection confirmed by server:", event.data);
    });

    // Listen for 'notification' event type
    eventSource.addEventListener("notification", (event) => {
      console.log("📬 Notification event received:", event);
      onMessageRef.current(event);
    });

    // Also listen to default messages (fallback)
    eventSource.onmessage = (event) => {
      console.log("📨 Default message received:", event);
      onMessageRef.current(event);
    };

    // Handle errors
    eventSource.onerror = (err) => {
      setIsConnected(false);
      setError(new Error("SSE connection error"));
      console.error("SSE Error:", err);
      console.error("EventSource readyState:", eventSource.readyState);
    };

    // Cleanup on unmount or when enabled changes
    return () => {
      console.log("SSE disconnecting");
      eventSource.close();
      setIsConnected(false);
    };
  }, [enabled]); // Only re-run when enabled changes

  const close = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      setIsConnected(false);
    }
  };

  return {
    isConnected,
    error,
    close,
  };
}

/**
 * Hook for acknowledging a notification
 * POST /notification/acknowledge/{notificationId}
 */
export function useAcknowledgeNotification() {
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await apiClient.post(
        `/notification/acknowledge/${notificationId}`,
        {},
      );

      if (!response.success) {
        throw new Error(
          response.message || "Failed to acknowledge notification",
        );
      }

      return response.data;
    },
  });
}

/**
 * Combined hook for marking notification as notified
 * Calls API to acknowledge and removes from local store
 */
export function useMarkAsNotified() {
  const acknowledgeMutation = useAcknowledgeNotification();
  const removeNotification = useNotificationStore(
    (state) => state.removeNotification,
  );

  const markAsNotified = async (notificationId: string) => {
    try {
      await acknowledgeMutation.mutateAsync(notificationId);
      // Remove from local store after successful API call
      removeNotification(notificationId);
      return true;
    } catch (error) {
      console.error("Failed to acknowledge notification:", error);
      throw error;
    }
  };

  return {
    markAsNotified,
    isPending: acknowledgeMutation.isPending,
    isError: acknowledgeMutation.isError,
    error: acknowledgeMutation.error,
  };
}
