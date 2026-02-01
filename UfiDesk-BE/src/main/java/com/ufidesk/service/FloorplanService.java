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
}
