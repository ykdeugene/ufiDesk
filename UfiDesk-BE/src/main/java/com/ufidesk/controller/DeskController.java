package com.ufidesk.controller;

import com.ufidesk.dto.ApiResponse;
import com.ufidesk.dto.UpdateDeskDetailsRequest;
import com.ufidesk.model.Booking;
import com.ufidesk.model.DeskDocument;
import com.ufidesk.model.Floorplan;
import com.ufidesk.service.BookingService;
import com.ufidesk.service.DeskService;
import com.ufidesk.service.FloorplanService;
import com.ufidesk.service.NotificationService;
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
 * Controller for desk operations.
 *
 * Endpoints:
 * - GET /desk/get-desks-by-main-floorplan - Retrieve all desks for the main floorplan (authenticated users only)
 * - POST /desk/update-desk-details - Update desk details like description and block dates (ADMIN/SUPERADMIN only)
 * - POST /desk/check-for-clash - Check for booking clashes with block dates (ADMIN/SUPERADMIN only)
 */
@RestController
@RequestMapping("/desk")
@RequiredArgsConstructor
@Slf4j
public class DeskController {

    private final DeskService deskService;
    private final FloorplanService floorplanService;
    private final BookingService bookingService;
    private final NotificationService notificationService;

    /**
     * Retrieve all desks for the main floorplan.
     *
     * This endpoint:
     * 1. Fetches the main floorplan (where isMain = true) from the floorplan table
     * 2. Gets all desks associated with that floorplan
     *
     * Any authenticated user can perform this operation.
     *
     * @return success response with list of desks for the main floorplan
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/get-desks-by-main-floorplan")
    public ResponseEntity<ApiResponse<List<DeskDocument>>> getDesksByMainFloorplan() {
        log.info("Fetching desks for main floorplan");

        try {
            // Get the main floorplan
            Floorplan mainFloorplan = floorplanService.getMainFloorplan();
            log.info("Found main floorplan with ID: {}", mainFloorplan.getId());

            // Get all desks for the main floorplan
            List<DeskDocument> desks = deskService.getDesksByFloorplanId(mainFloorplan.getId());

            log.info("✅ Retrieved {} desks for main floorplan: {}", desks.size(), mainFloorplan.getId());
            return ResponseEntity.ok(ApiResponse.success("Desks retrieved successfully", desks));
        } catch (IllegalArgumentException e) {
            log.error("❌ No main floorplan found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("No main floorplan found: " + e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Error retrieving desks for main floorplan: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve desks: " + e.getMessage()));
        }
    }

    /**
     * Update desk details (description, blockStart, blockEnd).
     *
     * This endpoint:
     * 1. Fetches the main floorplan (where isMain = true)
     * 2. Checks for active bookings that clash with the block date range
     * 3. If clashes exist, cancels all clashing bookings and creates notifications for affected users
     * 4. Updates the desk details (description, blockStart, blockEnd)
     *
     * Only ADMIN and SUPERADMIN users can perform this operation.
     *
     * @param request the request containing desk ID and updated details
     * @return success response with the updated desk
     */
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('SUPERADMIN')")
    @PostMapping("/update-desk-details")
    public ResponseEntity<ApiResponse<DeskDocument>> updateDeskDetails(@RequestBody UpdateDeskDetailsRequest request) {
        log.info("Attempting to update desk details for deskId: {}", request.getDeskId());

        try {
            // Get the authenticated user's email from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String adminEmail = authentication.getName();
            log.info("Update requested by admin: {}", adminEmail);

            // Get the main floorplan
            Floorplan mainFloorplan = floorplanService.getMainFloorplan();
            log.info("Found main floorplan with ID: {}", mainFloorplan.getId());

            // Check for clashing bookings if block dates are provided
            if (request.getBlockStart() != null && request.getBlockEnd() != null) {
                log.info("Checking for clashing bookings with block dates {} to {}",
                        request.getBlockStart(), request.getBlockEnd());

                List<Booking> clashingBookings = bookingService.getClashingBookings(
                        mainFloorplan.getId(),
                        request.getDeskId(),
                        request.getBlockStart(),
                        request.getBlockEnd()
                );

                // If there are clashing bookings, cancel them and create notifications
                if (!clashingBookings.isEmpty()) {
                    log.info("Found {} clashing bookings. Cancelling them and creating notifications...",
                            clashingBookings.size());

                    // Cancel all clashing bookings
                    List<String> bookingIds = clashingBookings.stream()
                            .map(Booking::getId)
                            .toList();

                    List<String> userEmails = clashingBookings.stream()
                            .map(Booking::getUserEmail)
                            .distinct()
                            .toList();

                    bookingService.cancelMultipleBookings(bookingIds);
                    log.info("✅ Cancelled {} bookings", bookingIds.size());

                    // Create notifications for affected users
                    for (Booking booking : clashingBookings) {
                        com.ufidesk.model.Notification notification = notificationService.createNotification(
                                booking.getUserEmail(),
                                booking.getId(),
                                adminEmail
                        );
                        // Send notification to user if they're connected via SSE
                        notificationService.sendNotificationToUser(notification);
                    }
                    log.info("✅ Created {} notifications and sent to connected users", clashingBookings.size());
                }
            }

            // Update desk details using floorplan ID and desk ID
            DeskDocument updatedDesk = deskService.updateDeskDetailsByFloorplanAndDeskId(
                    mainFloorplan.getId(),
                    request.getDeskId(),
                    request.getDescription(),
                    request.getBlockStart(),
                    request.getBlockEnd()
            );

            log.info("✅ Desk details updated successfully for deskId: {}", request.getDeskId());
            return ResponseEntity.ok(ApiResponse.success("Desk details updated successfully", updatedDesk));
        } catch (IllegalArgumentException e) {
            log.error("❌ Desk not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Desk not found: " + e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Error updating desk details: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update desk details: " + e.getMessage()));
        }
    }

    /**
     * Check for booking clashes with desk block dates and update desk if no clashes found.
     *
     * This endpoint:
     * 1. Fetches the main floorplan (where isMain = true)
     * 2. Finds all active bookings that clash with the block date range
     * 3. If clashes exist, returns the list of clashing bookings
     * 4. If no clashes exist, automatically updates the desk details (description, blockStart, blockEnd)
     * 5. Returns list of clashing bookings (empty if updated successfully)
     *
     * Only ADMIN and SUPERADMIN users can perform this operation.
     *
     * @param request the request containing desk ID, blockStart, blockEnd dates, and description
     * @return success response with list of clashing bookings (empty list if desk updated successfully)
     */
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('SUPERADMIN')")
    @PostMapping("/check-for-clash")
    public ResponseEntity<ApiResponse<List<Booking>>> checkForClash(@RequestBody UpdateDeskDetailsRequest request) {
        log.info("Checking for booking clashes for deskId: {} with block dates {} to {}",
                request.getDeskId(), request.getBlockStart(), request.getBlockEnd());

        try {
            // Validate that block dates are provided
            if (request.getBlockStart() == null || request.getBlockEnd() == null) {
                log.warn("❌ Block start or block end date is missing");
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Block start and block end dates are required"));
            }

            // Get the main floorplan
            Floorplan mainFloorplan = floorplanService.getMainFloorplan();
            log.info("Found main floorplan with ID: {}", mainFloorplan.getId());

            // Get clashing bookings using the extracted method
            List<Booking> clashingBookings = bookingService.getClashingBookings(
                    mainFloorplan.getId(),
                    request.getDeskId(),
                    request.getBlockStart(),
                    request.getBlockEnd()
            );

            // If there are clashing bookings, return them
            if (!clashingBookings.isEmpty()) {
                log.info("❌ Found {} clashing bookings for desk {}", clashingBookings.size(), request.getDeskId());
                return ResponseEntity.ok(ApiResponse.success(
                        "Booking clashes found - desk update cancelled",
                        clashingBookings
                ));
            }

            // No clashing bookings, proceed to update desk details
            log.info("✅ No clashing bookings found. Proceeding to update desk details for deskId: {}", request.getDeskId());

            DeskDocument updatedDesk = deskService.updateDeskDetailsByFloorplanAndDeskId(
                    mainFloorplan.getId(),
                    request.getDeskId(),
                    request.getDescription(),
                    request.getBlockStart(),
                    request.getBlockEnd()
            );

            log.info("✅ Desk details updated successfully for deskId: {}", request.getDeskId());
            return ResponseEntity.ok(ApiResponse.success(
                    "No booking clashes found - desk details updated successfully",
                    new java.util.ArrayList<>()
            ));

        } catch (IllegalArgumentException e) {
            log.error("❌ Error checking for clashes: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Error checking for clashes: " + e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Error checking for booking clashes: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to check for booking clashes: " + e.getMessage()));
        }
    }
}
