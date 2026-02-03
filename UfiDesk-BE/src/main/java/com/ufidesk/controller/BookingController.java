package com.ufidesk.controller;

import com.ufidesk.dto.ApiResponse;
import com.ufidesk.dto.CreateBookingRequest;
import com.ufidesk.model.ArchiveBooking;
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
     * Cancel a booking by archiving it and removing it from the bookings collection.
     *
     * Only the user who created the booking or an ADMIN/SUPERADMIN can cancel it.
     *
     * @param bookingId the booking ID to cancel
     * @return success response with the archived booking
     */
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/cancel-booking/{bookingId}")
    public ResponseEntity<ApiResponse<ArchiveBooking>> cancelBooking(@PathVariable String bookingId) {
        log.info("Attempting to cancel and archive booking: {}", bookingId);

        try {
            ArchiveBooking archivedBooking = bookingService.cancelBooking(bookingId);

            log.info("✅ Successfully cancelled and archived booking: {}", bookingId);
            return ResponseEntity.ok(ApiResponse.success(
                    "Booking cancelled and archived successfully",
                    archivedBooking
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

    /**
     * Delete a booking (alias for cancel-booking for backward compatibility).
     * This endpoint delegates to cancelBooking().
     *
     * Only the user who created the booking or an ADMIN/SUPERADMIN can delete it.
     *
     * @param bookingId the booking ID to delete
     * @return success response with the archived booking
     */
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/delete-booking/{bookingId}")
    public ResponseEntity<ApiResponse<ArchiveBooking>> deleteBooking(@PathVariable String bookingId) {
        log.info("Attempting to delete booking (via delete-booking endpoint): {}", bookingId);
        // Delegate to cancelBooking method
        return cancelBooking(bookingId);
    }

    // ===== Archive Booking Endpoints =====

    /**
     * Get all archived bookings.
     *
     * Only ADMIN/SUPERADMIN users can view archived bookings.
     *
     * @return success response with list of all archived bookings
     */
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('SUPERADMIN')")
    @GetMapping("/get-all-archived-bookings")
    public ResponseEntity<ApiResponse<List<ArchiveBooking>>> getAllArchivedBookings() {
        log.info("Fetching all archived bookings");

        try {
            List<ArchiveBooking> archivedBookings = bookingService.getAllArchivedBookings();

            log.info("✅ Retrieved {} archived bookings", archivedBookings.size());
            return ResponseEntity.ok(ApiResponse.success(
                    "All archived bookings retrieved successfully",
                    archivedBookings
            ));
        } catch (Exception e) {
            log.error("❌ Error retrieving archived bookings: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve archived bookings: " + e.getMessage()));
        }
    }

    /**
     * Get archived bookings for the authenticated user.
     *
     * @return success response with list of archived bookings for the user
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/get-archived-bookings")
    public ResponseEntity<ApiResponse<List<ArchiveBooking>>> getMyArchivedBookings() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        log.info("Fetching archived bookings for user: {}", userEmail);

        try {
            List<ArchiveBooking> archivedBookings = bookingService.getArchivedBookingsByUserEmail(userEmail);

            log.info("✅ Retrieved {} archived bookings for user {}", archivedBookings.size(), userEmail);
            return ResponseEntity.ok(ApiResponse.success(
                    "Archived bookings retrieved successfully",
                    archivedBookings
            ));
        } catch (Exception e) {
            log.error("❌ Error retrieving archived bookings for user {}: {}", userEmail, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve archived bookings: " + e.getMessage()));
        }
    }

    /**
     * Get an archived booking by its ID.
     *
     * @param archivedBookingId the archived booking ID
     * @return success response with the archived booking
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/get-archived-booking/{archivedBookingId}")
    public ResponseEntity<ApiResponse<ArchiveBooking>> getArchivedBooking(@PathVariable String archivedBookingId) {
        log.info("Fetching archived booking: {}", archivedBookingId);

        try {
            ArchiveBooking archivedBooking = bookingService.getArchivedBookingById(archivedBookingId);

            log.info("✅ Retrieved archived booking: {}", archivedBookingId);
            return ResponseEntity.ok(ApiResponse.success(
                    "Archived booking retrieved successfully",
                    archivedBooking
            ));
        } catch (IllegalArgumentException e) {
            log.error("❌ Archived booking not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Archived booking not found: " + e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Error retrieving archived booking: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve archived booking: " + e.getMessage()));
        }
    }
}
