package com.ufidesk.repository;

import com.ufidesk.model.ArchiveBooking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for managing archived bookings.
 */
@Repository
public interface ArchiveBookingRepository extends MongoRepository<ArchiveBooking, String> {

    /**
     * Find all archived bookings for a specific user email
     *
     * @param userEmail User email
     * @return List of archived bookings for the user
     */
    List<ArchiveBooking> findByUserEmail(String userEmail);

    /**
     * Find all archived bookings for a specific floorplan
     *
     * @param floorplanId Floorplan ID
     * @return List of archived bookings for the floorplan
     */
    List<ArchiveBooking> findByFloorplanId(String floorplanId);

    /**
     * Find all archived bookings for a specific desk within a floorplan
     *
     * @param floorplanId Floorplan ID
     * @param deskId Desk ID
     * @return List of archived bookings for the desk
     */
    List<ArchiveBooking> findByFloorplanIdAndDeskId(String floorplanId, String deskId);

    /**
     * Find archived bookings archived after a specific timestamp
     *
     * @param archivedAt The timestamp to filter after
     * @return List of archived bookings
     */
    List<ArchiveBooking> findByArchivedAtAfter(LocalDateTime archivedAt);
}
