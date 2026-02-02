package com.ufidesk.controller;

import com.ufidesk.dto.ApiResponse;
import com.ufidesk.dto.UpdateDeskDetailsRequest;
import com.ufidesk.model.DeskDocument;
import com.ufidesk.model.Floorplan;
import com.ufidesk.service.DeskService;
import com.ufidesk.service.FloorplanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for desk operations.
 *
 * Endpoints:
 * - GET /desk/get-desks-by-main-floorplan - Retrieve all desks for the main floorplan (authenticated users only)
 * - POST /desk/update-desk-details - Update desk details like description and block dates (ADMIN/SUPERADMIN only)
 */
@RestController
@RequestMapping("/desk")
@RequiredArgsConstructor
@Slf4j
public class DeskController {

    private final DeskService deskService;
    private final FloorplanService floorplanService;

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
     * 2. Finds the desk document by matching floorplanId and deskId
     * 3. Updates the desk details (description, blockStart, blockEnd)
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
            // Get the main floorplan
            Floorplan mainFloorplan = floorplanService.getMainFloorplan();
            log.info("Found main floorplan with ID: {}", mainFloorplan.getId());

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
}
