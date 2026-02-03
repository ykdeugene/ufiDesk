package com.ufidesk.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.ufidesk.model.Booking;
import com.ufidesk.model.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for notification response that includes the booking object.
 *
 * This DTO is used to return notifications with their associated booking details.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    @JsonProperty("id")
    private String id;

    @JsonProperty("email")
    private String email;

    @JsonProperty("booking")
    private Booking booking;

    @JsonProperty("cancelledBy")
    private String cancelledBy;

    @JsonProperty("notifiedStatus")
    private boolean notifiedStatus;

    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;

    /**
     * Convert a Notification and Booking to NotificationResponse
     *
     * @param notification The notification object
     * @param booking The booking object
     * @return NotificationResponse DTO
     */
    public static NotificationResponse fromNotificationAndBooking(Notification notification, Booking booking) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .email(notification.getEmail())
                .booking(booking)
                .cancelledBy(notification.getCancelledBy())
                .notifiedStatus(notification.isNotifiedStatus())
                .createdAt(notification.getCreatedAt())
                .updatedAt(notification.getUpdatedAt())
                .build();
    }
}
