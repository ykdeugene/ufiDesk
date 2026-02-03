package com.ufidesk.service;

import com.ufidesk.dto.NotificationResponse;
import com.ufidesk.model.Booking;
import com.ufidesk.model.Notification;
import com.ufidesk.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Service for notification operations.
 *
 * Handles:
 * - Creating notifications for cancelled bookings
 * - Retrieving notifications by various criteria
 * - Managing notification status
 * - Managing real-time SSE emitters for pushing notifications to connected clients
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final BookingService bookingService;

    // Thread-safe map to store active SSE emitters for each user email
    private final Map<String, SseEmitter> userEmitters = new ConcurrentHashMap<>();

    /**
     * Create a notification for a cancelled booking.
     *
     * @param email Email of the user whose booking was cancelled
     * @param bookingId ID of the cancelled booking
     * @param cancelledBy Email of the user who cancelled the booking
     * @return Created notification
     */
    public Notification createNotification(String email, String bookingId, String cancelledBy) {
        log.info("Creating notification for booking {} cancelled by {}", bookingId, cancelledBy);

        Notification notification = new Notification();
        notification.setId(UUID.randomUUID().toString());
        notification.setEmail(email);
        notification.setBookingId(bookingId);
        notification.setCancelledBy(cancelledBy);
        notification.setNotifiedStatus(false);

        LocalDateTime now = LocalDateTime.now();
        notification.setCreatedAt(now);
        notification.setUpdatedAt(now);

        Notification savedNotification = notificationRepository.save(notification);
        log.info("✅ Notification created for booking {}", bookingId);

        return savedNotification;
    }

    /**
     * Create multiple notifications for cancelled bookings.
     *
     * @param bookingIds List of cancelled booking IDs with their user emails
     * @param cancelledBy Email of the user who cancelled the bookings
     * @return List of created notifications
     */
    public List<Notification> createNotifications(List<String> bookingIds, String cancelledBy,
                                                   List<String> userEmails) {
        log.info("Creating {} notifications for bookings cancelled by {}", bookingIds.size(), cancelledBy);

        List<Notification> notifications = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (int i = 0; i < bookingIds.size(); i++) {
            Notification notification = new Notification();
            notification.setId(UUID.randomUUID().toString());
            notification.setEmail(userEmails.get(i));
            notification.setBookingId(bookingIds.get(i));
            notification.setCancelledBy(cancelledBy);
            notification.setNotifiedStatus(false);
            notification.setCreatedAt(now);
            notification.setUpdatedAt(now);

            notifications.add(notification);
        }

        List<Notification> savedNotifications = notificationRepository.saveAll(notifications);
        log.info("✅ Created {} notifications", savedNotifications.size());

        return savedNotifications;
    }

    /**
     * Find all notifications for a specific email
     *
     * @param email User email
     * @return List of notifications for the user
     */
    public List<Notification> getNotificationsByEmail(String email) {
        log.info("Fetching notifications for email: {}", email);
        return notificationRepository.findByEmail(email);
    }

    /**
     * Find all unnotified notifications for a specific email
     *
     * @param email User email
     * @return List of unnotified notifications
     */
    public List<Notification> getUnnotifiedNotificationsByEmail(String email) {
        log.info("Fetching unnotified notifications for email: {}", email);
        return notificationRepository.findByEmailAndNotifiedStatusFalse(email);
    }

    /**
     * Find all notifications for a specific booking
     *
     * @param bookingId Booking ID
     * @return List of notifications for the booking
     */
    public List<Notification> getNotificationsByBookingId(String bookingId) {
        log.info("Fetching notifications for booking: {}", bookingId);
        return notificationRepository.findByBookingId(bookingId);
    }

    /**
     * Mark a notification as notified
     *
     * @param notificationId Notification ID
     * @return Updated notification
     * @throws IllegalArgumentException if notification not found
     */
    public Notification markAsNotified(String notificationId) {
        log.info("Marking notification as notified: {}", notificationId);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found: " + notificationId));

        notification.setNotifiedStatus(true);
        notification.setUpdatedAt(LocalDateTime.now());

        Notification savedNotification = notificationRepository.save(notification);
        log.info("✅ Notification marked as notified: {}", notificationId);

        return savedNotification;
    }

    /**
     * Register an SSE emitter for a user.
     * Only one emitter is kept per user; registering a new one replaces the old one.
     *
     * @param userEmail User email
     * @param emitter SSE emitter
     */
    public void registerEmitter(String userEmail, SseEmitter emitter) {
        log.info("Registering SSE emitter for user: {}", userEmail);
        userEmitters.put(userEmail, emitter);
    }

    /**
     * Remove an SSE emitter for a user.
     *
     * @param userEmail User email
     */
    public void removeEmitter(String userEmail) {
        log.info("Removing SSE emitter for user: {}", userEmail);
        userEmitters.remove(userEmail);
    }

    /**
     * Send a notification to a connected user via SSE.
     * If the user is not connected, the notification is stored in the database.
     *
     * Note: notifiedStatus is NOT marked as true here. It will only be marked as true
     * when the user explicitly acknowledges the notification on the frontend.
     *
     * @param notification Notification to send
     */
    public void sendNotificationToUser(Notification notification) {
        String userEmail = notification.getEmail();
        SseEmitter emitter = userEmitters.get(userEmail);

        if (emitter != null) {
            try {
                log.info("Sending notification {} to connected user: {}", notification.getId(), userEmail);
                emitter.send(SseEmitter.event()
                        .id(notification.getId())
                        .name("notification")
                        .data(notification)
                        .build());

                log.info("✅ Notification {} sent to user {}", notification.getId(), userEmail);
            } catch (IOException e) {
                log.warn("Failed to send notification {} to user {}: {}", notification.getId(), userEmail, e.getMessage());
                // Remove the failed emitter
                removeEmitter(userEmail);
            }
        } else {
            log.info("User {} is not connected. Notification {} will be sent on next login.", userEmail, notification.getId());
        }
    }

    /**
     * Send a notification to all connected users via SSE.
     * This can be used for broadcast notifications.
     *
     * @param notifications List of notifications to send
     */
    public void sendNotificationsToAllConnected(List<Notification> notifications) {
        log.info("Sending {} notifications to all connected users", notifications.size());
        for (Notification notification : notifications) {
            sendNotificationToUser(notification);
        }
    }

    /**
     * Send all pending (unnotified) notifications to a user on login.
     * This method is called after a user successfully logs in to deliver
     * any notifications that were created while they were offline.
     *
     * Note: Notifications are only sent via SSE if the user has an active emitter.
     * If not, they will be sent when the user connects to the SSE endpoint.
     *
     * @param userEmail Email of the user who just logged in
     */
    public void sendPendingNotificationsOnLogin(String userEmail) {
        log.info("Checking for pending notifications on login for user: {}", userEmail);

        List<Notification> pendingNotifications = getUnnotifiedNotificationsByEmail(userEmail);

        if (!pendingNotifications.isEmpty()) {
            log.info("Found {} pending notifications for user: {}", pendingNotifications.size(), userEmail);

            // Try to send via SSE if user has connected emitter
            SseEmitter emitter = userEmitters.get(userEmail);
            if (emitter != null) {
                log.info("User {} has active SSE connection. Sending {} pending notifications via SSE.", userEmail, pendingNotifications.size());
                for (Notification notification : pendingNotifications) {
                    try {
                        log.info("Sending pending notification {} to connected user {}", notification.getId(), userEmail);
                        emitter.send(SseEmitter.event()
                                .id(notification.getId())
                                .name("notification")
                                .data(notification)
                                .build());

                        log.info("✅ Pending notification {} sent to user {}", notification.getId(), userEmail);
                    } catch (IOException e) {
                        log.warn("Failed to send pending notification {} to user {}: {}",
                                notification.getId(), userEmail, e.getMessage());
                        removeEmitter(userEmail);
                    }
                }
            } else {
                log.info("User {} does not have active SSE connection yet. Notifications stored in DB will be sent when they connect to /notification/notif-sse", userEmail);
            }
        } else {
            log.info("No pending notifications for user: {}", userEmail);
        }
    }

    /**
     * Convert a notification to NotificationResponse by fetching the associated booking
     *
     * @param notification The notification to convert
     * @return NotificationResponse with booking object, or null if booking not found
     */
    public NotificationResponse convertToNotificationResponse(Notification notification) {
        try {
            // Fetch the booking by booking ID
            Booking booking = bookingService.getBookingById(notification.getBookingId());
            return NotificationResponse.fromNotificationAndBooking(notification, booking);
        } catch (IllegalArgumentException e) {
            log.warn("Booking not found for notification {}: {}", notification.getId(), e.getMessage());
            // Return null if booking not found - controller will handle this
            return null;
        } catch (Exception e) {
            log.error("Error converting notification {} to response: {}", notification.getId(), e.getMessage());
            return null;
        }
    }

    /**
     * Convert a list of notifications to NotificationResponse objects
     *
     * @param notifications List of notifications to convert
     * @return List of NotificationResponse objects (excludes null values if booking not found)
     */
    public List<NotificationResponse> convertToNotificationResponses(List<Notification> notifications) {
        return notifications.stream()
                .map(this::convertToNotificationResponse)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
}
