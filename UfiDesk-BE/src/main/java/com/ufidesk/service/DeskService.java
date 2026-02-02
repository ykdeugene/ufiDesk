package com.ufidesk.service;

import com.ufidesk.model.DeskDocument;
import com.ufidesk.model.Floorplan;
import com.ufidesk.repository.DeskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Service for handling desk operations.
 *
 * Provides methods to:
 * - Save desks to the database
 * - Retrieve desks by floorplan
 * - Delete desks for a floorplan
 * - Generate desks from floorplan data
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DeskService {

    private final DeskRepository deskRepository;

    /**
     * Save a desk document to the database.
     *
     * @param desk the desk document to save
     * @return the saved desk document
     */
    public DeskDocument saveDeskDocument(DeskDocument desk) {
        log.info("Saving desk document: floorplanId={}, deskId={}", desk.getFloorplanId(), desk.getDeskId());

        if (desk.getId() == null || desk.getId().isEmpty()) {
            desk.setId(UUID.randomUUID().toString());
        }

        LocalDateTime now = LocalDateTime.now();
        desk.setCreatedAt(now);
        desk.setUpdatedAt(now);

        DeskDocument saved = deskRepository.save(desk);
        log.info("✅ Desk document saved with ID: {}", saved.getId());
        return saved;
    }

    /**
     * Save all desks from a floorplan to the desk collection.
     * This creates desk documents for each desk in the floorplan.
     *
     * @param floorplan the floorplan containing desk information
     */
    public void saveDesksFromFloorplan(Floorplan floorplan) {
        log.info("Saving desks from floorplan: {} (ID: {})", floorplan.getName(), floorplan.getId());

        if (floorplan.getDesks() == null || floorplan.getDesks().isEmpty()) {
            log.warn("⚠️ Floorplan {} has no desks to save", floorplan.getId());
            return;
        }

        int deskCount = 0;
        for (Floorplan.Desk desk : floorplan.getDesks()) {
            DeskDocument deskDocument = new DeskDocument();
            deskDocument.setId(UUID.randomUUID().toString());
            deskDocument.setFloorplanId(floorplan.getId());
            deskDocument.setDeskId(desk.getId());
            deskDocument.setDescription("");

            // blockStart and blockEnd are not set, meaning desk is not blocked
            deskDocument.setBlockStart(null);
            deskDocument.setBlockEnd(null);

            LocalDateTime now = LocalDateTime.now();
            deskDocument.setCreatedAt(now);
            deskDocument.setUpdatedAt(now);

            deskRepository.save(deskDocument);
            deskCount++;
        }

        log.info("✅ Saved {} desks from floorplan {}", deskCount, floorplan.getId());
    }

    /**
     * Get all desks for a specific floorplan.
     *
     * @param floorplanId the ID of the floorplan
     * @return list of desk documents for the floorplan
     */
    public List<DeskDocument> getDesksByFloorplanId(String floorplanId) {
        log.info("Fetching desks for floorplan: {}", floorplanId);
        List<DeskDocument> desks = deskRepository.findByFloorplanId(floorplanId);
        log.info("Retrieved {} desks for floorplan {}", desks.size(), floorplanId);
        return desks;
    }

    /**
     * Delete all desks for a specific floorplan.
     *
     * @param floorplanId the ID of the floorplan
     */
    public void deleteDesksForFloorplan(String floorplanId) {
        log.info("Deleting all desks for floorplan: {}", floorplanId);
        deskRepository.deleteByFloorplanId(floorplanId);
        log.info("✅ Deleted all desks for floorplan {}", floorplanId);
    }

    /**
     * Replace all desks for a floorplan (delete old and save new).
     *
     * @param floorplan the floorplan with new desk information
     */
    public void replaceDesksForFloorplan(Floorplan floorplan) {
        log.info("Replacing desks for floorplan: {}", floorplan.getId());

        // Delete old desks
        deleteDesksForFloorplan(floorplan.getId());

        // Save new desks
        saveDesksFromFloorplan(floorplan);

        log.info("✅ Desks replaced for floorplan {}", floorplan.getId());
    }

    /**
     * Update desk details (description, blockStart, blockEnd).
     *
     * @param deskId the ID of the desk document to update
     * @param description the new description (can be null to keep existing)
     * @param blockStart the new block start date (can be null)
     * @param blockEnd the new block end date (can be null)
     * @return the updated desk document
     * @throws IllegalArgumentException if the desk is not found
     */
    public DeskDocument updateDeskDetails(String deskId, String description, java.time.LocalDate blockStart, java.time.LocalDate blockEnd) {
        log.info("Updating desk details for deskId: {}", deskId);

        DeskDocument desk = deskRepository.findById(deskId)
                .orElseThrow(() -> {
                    log.error("❌ Desk not found with ID: {}", deskId);
                    return new IllegalArgumentException("Desk not found with ID: " + deskId);
                });

        // Update description if provided
        if (description != null) {
            desk.setDescription(description);
            log.info("Updated description to: {}", description);
        }

        // Update block dates
        desk.setBlockStart(blockStart);
        desk.setBlockEnd(blockEnd);

        if (blockStart != null && blockEnd != null) {
            log.info("Desk blocked from {} to {}", blockStart, blockEnd);
        } else {
            log.info("Desk unblocked");
        }

        // Update timestamp
        desk.setUpdatedAt(LocalDateTime.now());

        DeskDocument updated = deskRepository.save(desk);
        log.info("✅ Desk details updated successfully for deskId: {}", deskId);
        return updated;
    }

    /**
     * Update desk details using floorplan ID and desk ID.
     *
     * @param floorplanId the ID of the floorplan
     * @param deskId the desk ID (e.g., "RT-8") from the floorplan
     * @param description the new description (can be null to keep existing)
     * @param blockStart the new block start date (can be null)
     * @param blockEnd the new block end date (can be null)
     * @return the updated desk document
     * @throws IllegalArgumentException if the desk is not found
     */
    public DeskDocument updateDeskDetailsByFloorplanAndDeskId(String floorplanId, String deskId, String description, java.time.LocalDate blockStart, java.time.LocalDate blockEnd) {
        log.info("Updating desk details for floorplanId: {}, deskId: {}", floorplanId, deskId);

        DeskDocument desk = deskRepository.findByFloorplanIdAndDeskId(floorplanId, deskId)
                .orElseThrow(() -> {
                    log.error("❌ Desk not found with floorplanId: {} and deskId: {}", floorplanId, deskId);
                    return new IllegalArgumentException("Desk not found with floorplanId: " + floorplanId + " and deskId: " + deskId);
                });

        // Update description if provided
        if (description != null) {
            desk.setDescription(description);
            log.info("Updated description to: {}", description);
        }

        // Update block dates
        desk.setBlockStart(blockStart);
        desk.setBlockEnd(blockEnd);

        if (blockStart != null && blockEnd != null) {
            log.info("Desk blocked from {} to {}", blockStart, blockEnd);
        } else {
            log.info("Desk unblocked");
        }

        // Update timestamp
        desk.setUpdatedAt(LocalDateTime.now());

        DeskDocument updated = deskRepository.save(desk);
        log.info("✅ Desk details updated successfully for floorplanId: {}, deskId: {}", floorplanId, deskId);
        return updated;
    }
}
