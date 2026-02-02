package com.ufidesk.repository;

import com.ufidesk.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    /**
     * Find all bookings for a specific user email
     */
    List<Booking> findByUserEmail(String userEmail);

    /**
     * Find all bookings for a specific desk (WARNING: deskId is not globally unique, use with floorplanId)
     */
    List<Booking> findByDeskId(String deskId);

    /**
     * Find all bookings for a specific desk within a specific floorplan
     * This is the preferred method since deskId is only unique within a floorplan
     */
    List<Booking> findByFloorplanIdAndDeskId(String floorplanId, String deskId);

    /**
     * Find all active bookings for a specific desk within a specific floorplan
     * This is the preferred method since deskId is only unique within a floorplan
     */
    List<Booking> findByFloorplanIdAndDeskIdAndStatus(String floorplanId, String deskId, Booking.Status status);

    /**
     * Find all active bookings for a specific desk (WARNING: deskId is not globally unique, use with floorplanId)
     */
    List<Booking> findByDeskIdAndStatus(String deskId, Booking.Status status);

    /**
     * Find all bookings for a specific floorplan
     */
    List<Booking> findByFloorplanId(String floorplanId);

    /**
     * Find all bookings by status
     */
    List<Booking> findByStatus(Booking.Status status);
}
