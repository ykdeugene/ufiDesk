package com.ufidesk.repository;

import com.ufidesk.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    /**
     * Find all notifications for a specific email
     */
    List<Notification> findByEmail(String email);

    /**
     * Find all notifications for a specific booking
     */
    List<Notification> findByBookingId(String bookingId);

    /**
     * Find all unnotified notifications for a specific email
     */
    List<Notification> findByEmailAndNotifiedStatusFalse(String email);
}
