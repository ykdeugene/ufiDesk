package com.ufidesk.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Archive Booking model for storing cancelled bookings.
 * When a booking is cancelled, it is moved from the Booking collection to the ArchiveBooking collection
 * and deleted from the original Booking collection.
 */
@Document(collection = "archiveBookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArchiveBooking {

    @Id
    private String id;

    @JsonProperty("floorplanId")
    private String floorplanId;

    @JsonProperty("deskId")
    private String deskId;

    @JsonProperty("description")
    private String description;

    @JsonProperty("startDate")
    private LocalDate startDate;

    @JsonProperty("startPeriod")
    private Booking.Period startPeriod;

    @JsonProperty("endDate")
    private LocalDate endDate;

    @JsonProperty("endPeriod")
    private Booking.Period endPeriod;

    @JsonProperty("userEmail")
    private String userEmail;

    @JsonProperty("status")
    private Booking.Status status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    /**
     * Timestamp when the booking was cancelled/archived
     */
    @JsonProperty("archivedAt")
    private LocalDateTime archivedAt;

    /**
     * Create an ArchiveBooking from a Booking
     *
     * @param booking The booking to archive
     * @return ArchiveBooking instance
     */
    public static ArchiveBooking fromBooking(Booking booking) {
        ArchiveBooking archiveBooking = new ArchiveBooking();
        archiveBooking.setId(booking.getId());
        archiveBooking.setFloorplanId(booking.getFloorplanId());
        archiveBooking.setDeskId(booking.getDeskId());
        archiveBooking.setDescription(booking.getDescription());
        archiveBooking.setStartDate(booking.getStartDate());
        archiveBooking.setStartPeriod(booking.getStartPeriod());
        archiveBooking.setEndDate(booking.getEndDate());
        archiveBooking.setEndPeriod(booking.getEndPeriod());
        archiveBooking.setUserEmail(booking.getUserEmail());
        archiveBooking.setStatus(booking.getStatus());
        archiveBooking.setCreatedAt(booking.getCreatedAt());
        archiveBooking.setUpdatedAt(booking.getUpdatedAt());
        archiveBooking.setArchivedAt(LocalDateTime.now());
        return archiveBooking;
    }
}
