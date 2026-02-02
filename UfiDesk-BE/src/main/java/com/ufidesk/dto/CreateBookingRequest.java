package com.ufidesk.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.ufidesk.model.Booking;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO for creating a booking.
 *
 * Fields:
 * - description: Description of the booking
 * - deskIds: List of desk IDs to book
 * - startDate: Start date of the booking
 * - startPeriod: Start period (AM or PM)
 * - endDate: End date of the booking
 * - endPeriod: End period (AM or PM)
 *
 * The user email will be retrieved from the security context.
 * The floorplan ID will be retrieved from the main floorplan.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateBookingRequest {

    @JsonProperty("description")
    private String description;

    @JsonProperty("deskIds")
    private List<String> deskIds;

    @JsonProperty("startDate")
    private LocalDate startDate;

    @JsonProperty("startPeriod")
    private Booking.Period startPeriod;

    @JsonProperty("endDate")
    private LocalDate endDate;

    @JsonProperty("endPeriod")
    private Booking.Period endPeriod;
}
