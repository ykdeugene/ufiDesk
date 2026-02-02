package com.ufidesk.controller;

import com.ufidesk.dto.ApiResponse;
import com.ufidesk.dto.CreateBookingRequest;
import com.ufidesk.model.Booking;
import com.ufidesk.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for booking operations.
 *
 * Endpoints:
 * - POST /booking/create-booking - Create bookings for multiple desks (authenticated users only)
 * - GET /booking/get-all-active-booking - Get all active bookings (authenticated users only)
 * - DELETE /booking/cancel-booking/{bookingId} - Cancel a specific booking
 */
@RestController
@RequestMapping("/booking")
@RequiredArgsConstructor
@Slf4j
public class BookingController {

    private final BookingService bookingService;

    /**
     * Create bookings for multiple desks.
     *
     * This endpoint:
     * 1. Extracts the user's email from the security context
     * 2. Gets the main floorplan (where isMain = true)
     * 3. Creates a booking document for each desk ID provided
     * 4. Sets all booking details including floorplan ID, desk IDs, dates, periods, and user email
     * 5. Sets status to ACTIVE
     * 6. Saves all bookings to the database
     *
     * Any authenticated user can perform this operation.
     *
     * @param request the request containing desk IDs, dates, periods, and description
     * @return success response with list of created bookings
     */
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/create-booking")
    public ResponseEntity<ApiResponse<List<Booking>>> createBooking(@RequestBody CreateBookingRequest request) {
        log.info("Attempting to create bookings with {} desks", request.getDeskIds().size());

        try {
            // Get the authenticated user's email from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName();
            log.info("Creating bookings for user: {}", userEmail);

            // Validate input
            if (request.getDeskIds() == null || request.getDeskIds().isEmpty()) {
                log.warn("❌ No desk IDs provided in booking request");
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("At least one desk ID is required"));
            }

            if (request.getStartDate() == null || request.getEndDate() == null) {
                log.warn("❌ Start date or end date is missing");
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Start date and end date are required"));
            }

            if (request.getStartPeriod() == null || request.getEndPeriod() == null) {
                log.warn("❌ Start period or end period is missing");
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Start period and end period are required"));
            }

            // Create bookings
            List<Booking> createdBookings = bookingService.createBookings(
                    request.getDeskIds(),
                    request.getDescription(),
                    request.getStartDate(),
                    request.getStartPeriod(),
                    request.getEndDate(),
                    request.getEndPeriod(),
                    userEmail
            );

            log.info("✅ Created {} bookings for user {}", createdBookings.size(), userEmail);
            return ResponseEntity.ok(ApiResponse.success(
                    "Bookings created successfully",
                    createdBookings
            ));
        } catch (IllegalArgumentException e) {
            log.error("❌ Argument error creating bookings: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Booking creation failed: " + e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Error creating bookings: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create bookings: " + e.getMessage()));
        }
    }

    /**
     * Get all active bookings in the system.
     *
     * Any authenticated user can perform this operation.
     *
     * @return success response with list of all active bookings
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/get-all-active-booking")
    public ResponseEntity<ApiResponse<List<Booking>>> getAllActiveBookings() {
        log.info("Fetching all active bookings");

        try {
            List<Booking> bookings = bookingService.getAllActiveBookings();

            log.info("✅ Retrieved {} active bookings", bookings.size());
            return ResponseEntity.ok(ApiResponse.success(
                    "All active bookings retrieved successfully",
                    bookings
            ));
        } catch (Exception e) {
            log.error("❌ Error retrieving active bookings: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve active bookings: " + e.getMessage()));
        }
    }

    /**
     * Cancel a booking by setting its status to CANCELLED.
     *
     * Only the user who created the booking or an ADMIN/SUPERADMIN can cancel it.
     *
     * @param bookingId the booking ID to cancel
     * @return success response with the cancelled booking
     */
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/cancel-booking/{bookingId}")
    public ResponseEntity<ApiResponse<Booking>> cancelBooking(@PathVariable String bookingId) {
        log.info("Attempting to cancel booking: {}", bookingId);

        try {
            Booking cancelledBooking = bookingService.cancelBooking(bookingId);

            log.info("✅ Successfully cancelled booking: {}", bookingId);
            return ResponseEntity.ok(ApiResponse.success(
                    "Booking cancelled successfully",
                    cancelledBooking
            ));
        } catch (IllegalArgumentException e) {
            log.error("❌ Booking not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Booking not found: " + e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Error cancelling booking: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to cancel booking: " + e.getMessage()));
        }
    }
}
