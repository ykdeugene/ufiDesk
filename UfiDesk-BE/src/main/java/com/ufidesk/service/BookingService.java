package com.ufidesk.service;

import com.ufidesk.model.Booking;
import com.ufidesk.model.DeskDocument;
import com.ufidesk.model.Floorplan;
import com.ufidesk.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Service for booking operations.
 *
 * Handles:
 * - Creating bookings for multiple desks
 * - Retrieving bookings by various criteria
 * - Managing booking status
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final FloorplanService floorplanService;
    private final DeskService deskService;

    /**
     * Create bookings for multiple desks.
     *
     * This method:
     * 1. Gets the main floorplan (where isMain = true)
     * 2. Creates a booking document for each desk ID
     * 3. Sets all booking details including floorplan ID, desk ID, dates, periods, and user email
     * 4. Sets status to ACTIVE
     * 5. Saves all bookings to the database
     *
     * @param deskIds List of desk IDs to book
     * @param description Booking description
     * @param startDate Start date of the booking
     * @param startPeriod Start period (AM or PM)
     * @param endDate End date of the booking
     * @param endPeriod End period (AM or PM)
     * @param userEmail Email of the user making the booking
     * @return List of created bookings
     * @throws IllegalArgumentException if no main floorplan found
     */
    public List<Booking> createBookings(
            List<String> deskIds,
            String description,
            LocalDate startDate,
            Booking.Period startPeriod,
            LocalDate endDate,
            Booking.Period endPeriod,
            String userEmail) {

        log.info("Creating bookings for user {} with {} desks", userEmail, deskIds.size());

        // Get the main floorplan
        Floorplan mainFloorplan = floorplanService.getMainFloorplan();
        log.info("Found main floorplan with ID: {}", mainFloorplan.getId());

        // Validate that booking dates don't overlap with desk block dates
        log.info("Validating booking dates against desk block dates");
        for (String deskId : deskIds) {
            validateBookingDatesAgainstDeskBlocks(
                    mainFloorplan.getId(),
                    deskId,
                    startDate,
                    endDate
            );
        }
        log.info("✅ All desks passed block date validation");

        // Validate that booking dates don't clash with existing active bookings
        log.info("Validating booking dates against existing bookings");
        for (String deskId : deskIds) {
            validateBookingDatesAgainstExistingBookings(
                    mainFloorplan.getId(),
                    deskId,
                    startDate,
                    startPeriod,
                    endDate,
                    endPeriod
            );
        }
        log.info("✅ All desks passed existing booking validation");

        // Create bookings for each desk
        List<Booking> bookings = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (String deskId : deskIds) {
            Booking booking = new Booking();
            booking.setFloorplanId(mainFloorplan.getId());
            booking.setDeskId(deskId);
            booking.setDescription(description);
            booking.setStartDate(startDate);
            booking.setStartPeriod(startPeriod);
            booking.setEndDate(endDate);
            booking.setEndPeriod(endPeriod);
            booking.setUserEmail(userEmail);
            booking.setStatus(Booking.Status.ACTIVE);
            booking.setCreatedAt(now);
            booking.setUpdatedAt(now);

            bookings.add(booking);
            log.info("Prepared booking for desk {} by user {}", deskId, userEmail);
        }

        // Save all bookings
        List<Booking> savedBookings = bookingRepository.saveAll(bookings);
        log.info("✅ Successfully created {} bookings for user {}", savedBookings.size(), userEmail);

        return savedBookings;
    }

    /**
     * Find all active bookings in the system.
     *
     * @return List of all active bookings with status = ACTIVE
     */
    public List<Booking> getAllActiveBookings() {
        log.info("Fetching all active bookings from database");
        return bookingRepository.findByStatus(Booking.Status.ACTIVE);
    }

    /**
     * Find all bookings for a specific desk within a specific floorplan
     * PREFERRED METHOD: Since deskId is only unique within a floorplan context
     *
     * @param floorplanId Floorplan ID
     * @param deskId Desk ID
     * @return List of bookings for the desk within the floorplan
     */
    public List<Booking> getBookingsByFloorplanAndDesk(String floorplanId, String deskId) {
        log.info("Fetching bookings for desk {} in floorplan {}", deskId, floorplanId);
        return bookingRepository.findByFloorplanIdAndDeskId(floorplanId, deskId);
    }


    /**
     * Find all active bookings for a specific desk within a specific floorplan
     * PREFERRED METHOD: Since deskId is only unique within a floorplan context
     *
     * @param floorplanId Floorplan ID
     * @param deskId Desk ID
     * @return List of active bookings for the desk within the floorplan
     */
    public List<Booking> getActiveBookingsByFloorplanAndDesk(String floorplanId, String deskId) {
        log.info("Fetching active bookings for desk {} in floorplan {}", deskId, floorplanId);
        return bookingRepository.findByFloorplanIdAndDeskIdAndStatus(floorplanId, deskId, Booking.Status.ACTIVE);
    }

    /**
     * Find all bookings for a specific floorplan
     *
     * @param floorplanId Floorplan ID
     * @return List of bookings for the floorplan
     */
    public List<Booking> getBookingsByFloorplanId(String floorplanId) {
        log.info("Fetching bookings for floorplan: {}", floorplanId);
        return bookingRepository.findByFloorplanId(floorplanId);
    }

    /**
     * Cancel a booking by setting its status to CANCELLED
     *
     * @param bookingId Booking ID
     * @return Updated booking
     * @throws IllegalArgumentException if booking not found
     */
    public Booking cancelBooking(String bookingId) {
        log.info("Cancelling booking: {}", bookingId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));

        booking.setStatus(Booking.Status.CANCELLED);
        booking.setUpdatedAt(LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);
        log.info("✅ Successfully cancelled booking: {}", bookingId);

        return savedBooking;
    }

    /**
     * Validate that booking dates do not overlap with desk block dates.
     *
     * This method checks if the booking date range overlaps with any blocked periods
     * for the desk. If there's an overlap, an IllegalArgumentException is thrown.
     *
     * Date overlap logic:
     * - Booking overlaps with block if: bookingStart <= blockEnd AND bookingEnd >= blockStart
     *
     * @param floorplanId Floorplan ID
     * @param deskId Desk ID
     * @param bookingStartDate Booking start date
     * @param bookingEndDate Booking end date
     * @throws IllegalArgumentException if booking dates overlap with desk block dates
     */
    private void validateBookingDatesAgainstDeskBlocks(
            String floorplanId,
            String deskId,
            LocalDate bookingStartDate,
            LocalDate bookingEndDate) {

        log.info("Validating booking dates for desk {} in floorplan {} (dates: {} to {})",
                deskId, floorplanId, bookingStartDate, bookingEndDate);

        // Get the desk document
        Optional<DeskDocument> deskOptional = deskService.getDeskByFloorplanAndDeskId(floorplanId, deskId);

        if (deskOptional.isEmpty()) {
            log.error("❌ Desk not found: floorplanId={}, deskId={}", floorplanId, deskId);
            throw new IllegalArgumentException("Desk not found: " + deskId);
        }

        DeskDocument desk = deskOptional.get();

        // Check if desk has block dates
        if (desk.getBlockStart() == null || desk.getBlockEnd() == null) {
            log.info("ℹ️ Desk {} has no block dates, validation passed", deskId);
            return;
        }

        // Check for overlap using interval overlap logic
        // Dates overlap if: bookingStart <= blockEnd AND bookingEnd >= blockStart
        boolean datesOverlap = bookingStartDate.compareTo(desk.getBlockEnd()) <= 0 &&
                               bookingEndDate.compareTo(desk.getBlockStart()) >= 0;

        if (datesOverlap) {
            log.error("❌ Booking dates overlap with desk block dates for desk {}: " +
                    "Booking: {} to {}, Block: {} to {}",
                    deskId, bookingStartDate, bookingEndDate, desk.getBlockStart(), desk.getBlockEnd());
            throw new IllegalArgumentException(
                    String.format("Desk %s is blocked from %s to %s. Booking dates (%s to %s) overlap with this block period.",
                            deskId, desk.getBlockStart(), desk.getBlockEnd(), bookingStartDate, bookingEndDate)
            );
        }

        log.info("✅ Desk {} passed block date validation", deskId);
    }

    /**
     * Validate that booking dates do not clash with existing active bookings.
     *
     * This method checks if there are any existing ACTIVE bookings for the same desk
     * that overlap with the requested booking date range AND periods.
     *
     * Date overlap logic:
     * - Booking overlaps if: newBookingStart <= existingBookingEnd AND newBookingEnd >= existingBookingStart
     *
     * Period overlap logic (when dates overlap):
     * - If booking is a single day (startDate == endDate):
     *   - AM period: morning only, does NOT clash with PM on same day
     *   - PM period: afternoon only, does NOT clash with AM on same day
     * - If booking spans multiple days:
     *   - All occupied days must not have overlapping periods
     *
     * @param floorplanId Floorplan ID
     * @param deskId Desk ID
     * @param bookingStartDate Booking start date
     * @param bookingStartPeriod Booking start period
     * @param bookingEndDate Booking end date
     * @param bookingEndPeriod Booking end period
     * @throws IllegalArgumentException if booking dates/periods clash with existing active bookings
     */
    private void validateBookingDatesAgainstExistingBookings(
            String floorplanId,
            String deskId,
            LocalDate bookingStartDate,
            Booking.Period bookingStartPeriod,
            LocalDate bookingEndDate,
            Booking.Period bookingEndPeriod) {

        log.info("Validating booking dates/periods against existing bookings for desk {} in floorplan {} (dates: {} {} to {} {})",
                deskId, floorplanId, bookingStartDate, bookingStartPeriod, bookingEndDate, bookingEndPeriod);

        // Get all active bookings for this desk
        List<Booking> existingBookings = bookingRepository.findByFloorplanIdAndDeskIdAndStatus(
                floorplanId, deskId, Booking.Status.ACTIVE);

        if (existingBookings.isEmpty()) {
            log.info("ℹ️ No existing bookings found for desk {}, validation passed", deskId);
            return;
        }

        // Check each existing booking for date and period clash
        for (Booking existingBooking : existingBookings) {
            // First check if dates overlap at all
            boolean datesOverlap = bookingStartDate.compareTo(existingBooking.getEndDate()) <= 0 &&
                                   bookingEndDate.compareTo(existingBooking.getStartDate()) >= 0;

            if (!datesOverlap) {
                // Dates don't overlap, no conflict
                continue;
            }

            // Dates overlap, now check if periods also clash
            boolean periodsClash = doPeriodsClash(
                    bookingStartDate, bookingStartPeriod, bookingEndDate, bookingEndPeriod,
                    existingBooking.getStartDate(), existingBooking.getStartPeriod(),
                    existingBooking.getEndDate(), existingBooking.getEndPeriod()
            );

            if (periodsClash) {
                log.error("❌ Booking dates/periods clash with existing booking for desk {}: " +
                        "New Booking: {} {} to {} {}, Existing Booking: {} {} to {} {}",
                        deskId, bookingStartDate, bookingStartPeriod, bookingEndDate, bookingEndPeriod,
                        existingBooking.getStartDate(), existingBooking.getStartPeriod(),
                        existingBooking.getEndDate(), existingBooking.getEndPeriod());
                throw new IllegalArgumentException(
                        String.format("Desk %s is already booked from %s (%s) to %s (%s). Cannot create overlapping booking from %s (%s) to %s (%s).",
                                deskId, existingBooking.getStartDate(), existingBooking.getStartPeriod(),
                                existingBooking.getEndDate(), existingBooking.getEndPeriod(),
                                bookingStartDate, bookingStartPeriod, bookingEndDate, bookingEndPeriod)
                );
            }
        }

        log.info("✅ Desk {} passed existing booking validation", deskId);
    }

    /**
     * Check if two bookings' periods clash given their date and period ranges.
     *
     * Logic:
     * - Single day bookings on same date: clash only if they have the same period (both AM or both PM)
     * - Multi-day bookings: need to check each day individually:
     *   * First day: occupied from startPeriod to PM
     *   * Middle days: fully occupied (both AM and PM)
     *   * Last day: occupied from AM to endPeriod
     *
     * @param newStartDate New booking start date
     * @param newStartPeriod New booking start period
     * @param newEndDate New booking end date
     * @param newEndPeriod New booking end period
     * @param existingStartDate Existing booking start date
     * @param existingStartPeriod Existing booking start period
     * @param existingEndDate Existing booking end date
     * @param existingEndPeriod Existing booking end period
     * @return true if periods clash, false otherwise
     */
    private boolean doPeriodsClash(
            LocalDate newStartDate,
            Booking.Period newStartPeriod,
            LocalDate newEndDate,
            Booking.Period newEndPeriod,
            LocalDate existingStartDate,
            Booking.Period existingStartPeriod,
            LocalDate existingEndDate,
            Booking.Period existingEndPeriod) {

        // Case 1: Both bookings are single day on the same date
        if (newStartDate.equals(newEndDate) &&
            existingStartDate.equals(existingEndDate) &&
            newStartDate.equals(existingStartDate)) {

            // Single day bookings on same date only clash if they have the same period
            // AM and PM on the same day do NOT clash
            return newStartPeriod == existingStartPeriod;
        }

        // Case 2: Multi-day or overlapping bookings
        // Need to check each day in the overlap range individually

        // Determine the overlap date range
        LocalDate overlapStart = newStartDate.isAfter(existingStartDate) ? newStartDate : existingStartDate;
        LocalDate overlapEnd = newEndDate.isBefore(existingEndDate) ? newEndDate : existingEndDate;

        // Check each day in the overlap range
        for (LocalDate day = overlapStart; !day.isAfter(overlapEnd); day = day.plusDays(1)) {
            // Determine what periods are occupied on this day for the new booking
            boolean newBookingOccupiesAM = false;
            boolean newBookingOccupiesPM = false;

            if (day.equals(newStartDate) && day.equals(newEndDate)) {
                // Single day booking
                newBookingOccupiesAM = (newStartPeriod == Booking.Period.AM);
                newBookingOccupiesPM = (newEndPeriod == Booking.Period.PM);
                // If single day with same period, then only that period is occupied
                if (newStartPeriod == Booking.Period.AM) {
                    newBookingOccupiesAM = true;
                    newBookingOccupiesPM = false;
                } else {
                    newBookingOccupiesAM = false;
                    newBookingOccupiesPM = true;
                }
            } else if (day.equals(newStartDate)) {
                // First day of multi-day booking: from startPeriod to PM
                newBookingOccupiesAM = (newStartPeriod == Booking.Period.AM);
                newBookingOccupiesPM = true;
            } else if (day.equals(newEndDate)) {
                // Last day of multi-day booking: from AM to endPeriod
                newBookingOccupiesAM = true;
                newBookingOccupiesPM = (newEndPeriod == Booking.Period.PM);
            } else {
                // Middle day: fully occupied (both AM and PM)
                newBookingOccupiesAM = true;
                newBookingOccupiesPM = true;
            }

            // Determine what periods are occupied on this day for the existing booking
            boolean existingOccupiesAM = false;
            boolean existingOccupiesPM = false;

            if (day.equals(existingStartDate) && day.equals(existingEndDate)) {
                // Single day booking
                if (existingStartPeriod == Booking.Period.AM) {
                    existingOccupiesAM = true;
                    existingOccupiesPM = false;
                } else {
                    existingOccupiesAM = false;
                    existingOccupiesPM = true;
                }
            } else if (day.equals(existingStartDate)) {
                // First day of multi-day booking: from startPeriod to PM
                existingOccupiesAM = (existingStartPeriod == Booking.Period.AM);
                existingOccupiesPM = true;
            } else if (day.equals(existingEndDate)) {
                // Last day of multi-day booking: from AM to endPeriod
                existingOccupiesAM = true;
                existingOccupiesPM = (existingEndPeriod == Booking.Period.PM);
            } else {
                // Middle day: fully occupied (both AM and PM)
                existingOccupiesAM = true;
                existingOccupiesPM = true;
            }

            // Check for clash on this day
            if ((newBookingOccupiesAM && existingOccupiesAM) || (newBookingOccupiesPM && existingOccupiesPM)) {
                log.debug("Period clash detected on date {}: New ({},{}) vs Existing ({},{})",
                        day, newBookingOccupiesAM, newBookingOccupiesPM, existingOccupiesAM, existingOccupiesPM);
                return true;
            }
        }

        // No clash found
        return false;
    }
}

