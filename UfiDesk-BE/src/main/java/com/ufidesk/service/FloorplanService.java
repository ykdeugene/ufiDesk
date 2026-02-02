package com.ufidesk.service;

import com.ufidesk.model.Floorplan;
import com.ufidesk.repository.FloorplanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Service for handling floorplan operations.
 *
 * Provides methods to:
 * - Save floorplans to the database
 * - Retrieve all floorplans
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FloorplanService {

    private final FloorplanRepository floorplanRepository;

    /**
     * Save a new floorplan to the database.
     *
     * @param floorplan the floorplan to save
     * @return the saved floorplan with generated ID and timestamps
     */
    public Floorplan saveFloorplan(Floorplan floorplan) {
        log.info("Saving floorplan: {}", floorplan.getName());
        log.info("📐 Floorplan dimensions - xLength: {}, yLength: {}", floorplan.getXLength(), floorplan.getYLength());

        // Generate ID if not present
        if (floorplan.getId() == null || floorplan.getId().isEmpty() || floorplan.getId().equals("temp-id")) {
            floorplan.setId(UUID.randomUUID().toString());
        }

        // Set timestamps
        LocalDateTime now = LocalDateTime.now();
        floorplan.setCreatedAt(now);
        floorplan.setUpdatedAt(now);

        Floorplan saved = floorplanRepository.save(floorplan);
        log.info("✅ Floorplan saved successfully with ID: {}", saved.getId());
        log.info("📐 Saved floorplan dimensions - xLength: {}, yLength: {}", saved.getXLength(), saved.getYLength());

        return saved;
    }

    /**
     * Get all floorplans from the database.
     *
     * @return list of all floorplans
     */
    public List<Floorplan> getAllFloorplans() {
        log.info("Fetching all floorplans");

        List<Floorplan> floorplans = floorplanRepository.findAll();
        log.info("Retrieved {} floorplans", floorplans.size());

        return floorplans;
    }

    /**
     * Set a floorplan as the main floorplan.
     *
     * This method:
     * 1. Finds the current main floorplan (main = true) and sets it to false
     * 2. Sets the requested floorplan (by ID) as the main floorplan (main = true)
     *
     * @param floorplanId the ID of the floorplan to set as main
     * @return the updated floorplan that was set as main
     * @throws IllegalArgumentException if the floorplan is not found
     */
    public Floorplan setMainFloorplan(String floorplanId) {
        log.info("Setting floorplan {} as main", floorplanId);

        // Find and unset the current main floorplan
        floorplanRepository.findByMainTrue().ifPresent(currentMain -> {
            log.info("Unsetting current main floorplan: {}", currentMain.getId());
            currentMain.setMain(false);
            floorplanRepository.save(currentMain);
            log.info("✅ Current main floorplan unset");
        });

        // Find the floorplan to set as main
        Floorplan floorplan = floorplanRepository.findById(floorplanId)
                .orElseThrow(() -> {
                    log.error("❌ Floorplan not found with ID: {}", floorplanId);
                    return new IllegalArgumentException("Floorplan not found with ID: " + floorplanId);
                });

        // Set it as main
        floorplan.setMain(true);
        floorplan.setUpdatedAt(LocalDateTime.now());
        Floorplan updated = floorplanRepository.save(floorplan);

        log.info("✅ Floorplan {} set as main successfully", floorplanId);
        return updated;
    }
}
