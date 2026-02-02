package com.ufidesk.controller;

import com.ufidesk.dto.ApiResponse;
import com.ufidesk.dto.SetMainFloorplanRequest;
import com.ufidesk.model.Floorplan;
import com.ufidesk.service.FloorplanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for floorplan operations.
 *
 * Endpoints:
 * - POST /floorplan/upload - Save a new floorplan (ADMIN/SUPERADMIN only)
 * - GET /floorplan/get-floorplan - Retrieve all floorplans (authenticated users only)
 */
@RestController
@RequestMapping("/floorplan")
@RequiredArgsConstructor
@Slf4j
public class FloorplanController {

    private final FloorplanService floorplanService;

    /**
     * Upload and save a new floorplan.
     *
     * Only ADMIN and SUPERADMIN users can perform this operation.
     *
     * @param floorplan the floorplan to save
     * @return success response with the saved floorplan
     */
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('SUPERADMIN')")
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Floorplan>> uploadFloorplan(@RequestBody Floorplan floorplan) {
        log.info("Attempting to upload floorplan: {}", floorplan.getName());
        log.info("📐 Received floorplan dimensions - xLength: {}, yLength: {}", floorplan.getXLength(), floorplan.getYLength());
        log.info("🏢 Received floorplan data: {}", floorplan);

        try {
            Floorplan savedFloorplan = floorplanService.saveFloorplan(floorplan);

            log.info("✅ Floorplan uploaded successfully with ID: {}", savedFloorplan.getId());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Floorplan uploaded successfully", savedFloorplan));
        } catch (Exception e) {
            log.error("❌ Error uploading floorplan: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to upload floorplan: " + e.getMessage()));
        }
    }

    /**
     * Retrieve all floorplans.
     *
     * Any authenticated user can perform this operation.
     *
     * @return success response with list of all floorplans
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/get-floorplan")
    public ResponseEntity<ApiResponse<List<Floorplan>>> getAllFloorplans() {
        log.info("Fetching all floorplans");

        try {
            List<Floorplan> floorplans = floorplanService.getAllFloorplans();

            log.info("✅ Retrieved {} floorplans", floorplans.size());
            return ResponseEntity.ok(ApiResponse.success("Floorplans retrieved successfully", floorplans));
        } catch (Exception e) {
            log.error("❌ Error retrieving floorplans: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve floorplans: " + e.getMessage()));
        }
    }

    /**
     * Set a floorplan as the main floorplan.
     *
     * This endpoint:
     * 1. Finds the current main floorplan (isMain = true) and sets it to false
     * 2. Sets the requested floorplan (by ID) as the main floorplan (isMain = true)
     *
     * Only ADMIN and SUPERADMIN users can perform this operation.
     *
     * @param request the request containing the floorplan ID to set as main
     * @return success response with the updated floorplan
     */
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('SUPERADMIN')")
    @PostMapping("/set-main")
    public ResponseEntity<ApiResponse<Floorplan>> setMainFloorplan(@RequestBody SetMainFloorplanRequest request) {
        log.info("Attempting to set floorplan {} as main", request.getFloorplanId());

        try {
            Floorplan updatedFloorplan = floorplanService.setMainFloorplan(request.getFloorplanId());

            log.info("✅ Floorplan {} set as main successfully", request.getFloorplanId());
            return ResponseEntity.ok(ApiResponse.success("Floorplan set as main successfully", updatedFloorplan));
        } catch (IllegalArgumentException e) {
            log.error("❌ Floorplan not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Floorplan not found: " + e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Error setting main floorplan: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to set main floorplan: " + e.getMessage()));
        }
    }
}
