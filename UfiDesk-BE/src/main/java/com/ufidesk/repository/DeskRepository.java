package com.ufidesk.repository;

import com.ufidesk.model.DeskDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for desk document operations.
 *
 * Provides MongoDB query methods for managing desks.
 */
@Repository
public interface DeskRepository extends MongoRepository<DeskDocument, String> {

    /**
     * Find all desks belonging to a specific floorplan.
     *
     * @param floorplanId the ID of the floorplan
     * @return list of desks for the floorplan
     */
    List<DeskDocument> findByFloorplanId(String floorplanId);

    /**
     * Find a desk by floorplan ID and desk ID.
     *
     * @param floorplanId the ID of the floorplan
     * @param deskId the ID of the desk
     * @return the desk document if found
     */
    Optional<DeskDocument> findByFloorplanIdAndDeskId(String floorplanId, String deskId);

    /**
     * Find all desks by floorplan ID and desk ID.
     * Use this method when there might be multiple results.
     *
     * @param floorplanId the ID of the floorplan
     * @param deskId the ID of the desk
     * @return list of desk documents matching the criteria
     */
    List<DeskDocument> findAllByFloorplanIdAndDeskId(String floorplanId, String deskId);

    /**
     * Delete all desks belonging to a specific floorplan.
     *
     * @param floorplanId the ID of the floorplan
     */
    void deleteByFloorplanId(String floorplanId);
}
