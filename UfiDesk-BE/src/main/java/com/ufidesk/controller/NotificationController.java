package com.ufidesk.controller;

import com.ufidesk.dto.ApiResponse;
import com.ufidesk.dto.NotificationResponse;
import com.ufidesk.model.Notification;
import com.ufidesk.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;

/**
 * Controller for notification operations using Server-Sent Events (SSE).
 *
 * Endpoints:
 * - GET /notification/notif-sse - Subscribe to real-time notifications via SSE
 * - POST /notification/acknowledge/{notificationId} - Acknowledge/mark notification as read
 */
@RestController
@RequestMapping("/notification")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Subscribe to real-time notifications via Server-Sent Events.
     *
     * This endpoint:
     * 1. Creates an SSE emitter for the authenticated user
     * 2. Registers the emitter in the NotificationService
     * 3. Sends any pending unnotified notifications to the user
     * 4. Keeps the connection open to receive real-time notifications
     * 5. Handles client disconnections gracefully
     *
     * Only authenticated users can subscribe to notifications.
     *
     * @return SSE emitter that streams notifications to the client
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping(path = "/notif-sse", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribeToNotifications() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        log.info("User subscribing to notifications: {}", userEmail);

        // Create SSE emitter with 5 minute timeout
        SseEmitter emitter = new SseEmitter(5 * 60 * 1000L);

        // Register the emitter for this user
        notificationService.registerEmitter(userEmail, emitter);
        log.info("✅ SSE emitter registered for user: {}", userEmail);

        try {
            // Send connection established message
            emitter.send(SseEmitter.event()
                    .id("connection-" + System.currentTimeMillis())
                    .name("connect")
                    .data("Connected to notification stream")
                    .build());
            log.info("✅ Sent connection confirmation to user: {}", userEmail);
        } catch (IOException e) {
            log.warn("Failed to send connection confirmation to user {}: {}", userEmail, e.getMessage());
            notificationService.removeEmitter(userEmail);
            return emitter;
        }

        // Send pending unnotified notifications
        List<Notification> pendingNotifications = notificationService.getUnnotifiedNotificationsByEmail(userEmail);
        log.info("Found {} pending notifications for user: {}", pendingNotifications.size(), userEmail);

        if (!pendingNotifications.isEmpty()) {
            log.info("Sending {} pending notifications to user: {}", pendingNotifications.size(), userEmail);
            for (Notification notification : pendingNotifications) {
                try {
                    log.info("Preparing to send notification: id={}, email={}", notification.getId(), notification.getEmail());

                    // Convert notification to response with booking object
                    NotificationResponse notificationResponse = notificationService.convertToNotificationResponse(notification);

                    if (notificationResponse != null) {
                        emitter.send(SseEmitter.event()
                                .id(notification.getId())
                                .name("notification")
                                .data(notificationResponse)
                                .build());

                        log.info("✅ Sent pending notification {} with booking to user {}", notification.getId(), userEmail);
                    } else {
                        log.warn("Could not convert notification {} to response (booking not found)", notification.getId());
                    }
                } catch (IOException e) {
                    log.warn("Failed to send notification to user {}: {}", userEmail, e.getMessage());
                    notificationService.removeEmitter(userEmail);
                    return emitter;
                }
            }
        } else {
            log.info("No pending notifications for user: {}", userEmail);
        }

        // Handle emitter completion/timeout
        emitter.onCompletion(() -> {
            log.info("SSE emitter completed for user: {}", userEmail);
            notificationService.removeEmitter(userEmail);
        });

        // Handle emitter timeout
        emitter.onTimeout(() -> {
            log.info("SSE emitter timed out for user: {}", userEmail);
            notificationService.removeEmitter(userEmail);
        });

        // Handle emitter errors
        emitter.onError(throwable -> {
            log.warn("SSE emitter error for user {}: {}", userEmail, throwable.getMessage());
            notificationService.removeEmitter(userEmail);
        });

        log.info("Returning SSE emitter for user: {}", userEmail);
        return emitter;
    }


    /**
     * Mark a notification as notified/acknowledged.
     * This endpoint should be called when the user acknowledges the notification on the frontend.
     *
     * @param notificationId ID of the notification to acknowledge
     * @return Updated notification
     */
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/acknowledge/{notificationId}")
    public ResponseEntity<ApiResponse<Notification>> acknowledgeNotification(@PathVariable String notificationId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        log.info("User {} acknowledging notification: {}", userEmail, notificationId);

        try {
            Notification notification = notificationService.markAsNotified(notificationId);
            log.info("✅ Notification {} acknowledged by user {}", notificationId, userEmail);
            return ResponseEntity.ok(ApiResponse.success("Notification acknowledged successfully", notification));
        } catch (IllegalArgumentException e) {
            log.warn("Failed to acknowledge notification {}: {}", notificationId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Notification not found"));
        }
    }
}

