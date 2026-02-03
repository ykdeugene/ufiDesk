# Unused APIs Removal - Summary Report

## Date: February 3, 2026

This report documents all API endpoints that were removed from the backend because they were not being used by the frontend according to the API_DOCUMENTATION.md file.

---

## Removed Endpoints

### 1. BookingController - Archive Booking Endpoints

**File:** `BookingController.java`

**Removed Endpoints:**
- `GET /booking/get-all-archived-bookings` (ADMIN/SUPERADMIN only)
- `GET /booking/get-archived-bookings` (Authenticated users - their own archived bookings)
- `GET /booking/get-archived-booking/{archivedBookingId}` (Authenticated users - specific archived booking)

**Reason:** Frontend API documentation does not include any endpoints for retrieving archived bookings. The archive feature is backend-only for data persistence.

**Business Logic Impact:**
- Archived bookings are still being created when bookings are cancelled
- Archived bookings are still stored in the `archiveBookings` collection
- Notifications still fetch archived booking details when displaying to users
- No user-facing retrieval endpoints for archived bookings

---

### 2. NotificationController - Notification Retrieval Endpoints

**File:** `NotificationController.java`

**Removed Endpoints:**
- `GET /notification/get-all` (Authenticated users - all their notifications)
- `GET /notification/get-unnotified` (Authenticated users - unread notifications)

**Reason:** Frontend API documentation only uses:
- `GET /notification/notif-sse` (SSE stream for real-time notifications)
- `POST /notification/acknowledge/{notificationId}` (Mark as read)

The frontend relies on SSE for real-time notification delivery and does not make REST calls to fetch notifications.

**Business Logic Impact:**
- Notifications are still created when bookings are cancelled
- Notifications are still sent via SSE to connected users
- Pending notifications are still sent on login via SSE
- No REST endpoint for fetching notification history

---

## Preserved Endpoints

All other endpoints remain intact as they are used by the frontend:

### Authentication APIs (3 endpoints)
- ✅ `POST /auth/login`
- ✅ `POST /auth/logout`
- ✅ `GET /auth/status`

### Admin Management APIs (3 endpoints)
- ✅ `GET /admin/get-users`
- ✅ `POST /admin/create-user`
- ✅ `POST /admin/update-user`

### Booking APIs (3 endpoints)
- ✅ `POST /booking/create-booking`
- ✅ `GET /booking/get-all-active-booking`
- ✅ `DELETE /booking/delete-booking/{bookingId}` (Alias for cancel-booking)

### Floorplan APIs (4 endpoints)
- ✅ `GET /floorplan/get-floorplan`
- ✅ `GET /floorplan/get-main`
- ✅ `POST /floorplan/upload`
- ✅ `POST /floorplan/set-main`

### Desk APIs (3 endpoints)
- ✅ `GET /desk/get-desks-by-main-floorplan`
- ✅ `POST /desk/update-desk-details`
- ✅ `POST /desk/check-for-clash`

### User Profile APIs (1 endpoint)
- ✅ `POST /user/update-profile`

### Notification APIs (2 endpoints)
- ✅ `GET /notification/notif-sse`
- ✅ `POST /notification/acknowledge/{notificationId}`

**Total Preserved: 19 endpoints**

---

## Backend Services - No Removal

The service methods for archived bookings and notification retrieval are still preserved:

### BookingService Methods (Still Present)
- `cancelBooking()` - Creates archive and deletes from active
- `cancelMultipleBookings()` - Creates archives and deletes from active
- `getAllArchivedBookings()`
- `getArchivedBookingsByUserEmail()`
- `getArchivedBookingsByFloorplanId()`
- `getArchivedBookingsByFloorplanAndDesk()`
- `getArchivedBookingById()`

### NotificationService Methods (Still Present)
- `getNotificationsByEmail()`
- `getUnnotifiedNotificationsByEmail()`
- `convertToNotificationResponse()` - Used internally for SSE
- `convertToNotificationResponses()`

**Reason:** These service methods are used internally by the application and may be used by future features. Only the controller endpoints were removed.

---

## Database Collections - Untouched

Both collections remain intact:

- `archiveBookings` - Continues to store cancelled bookings
- `notifications` - Continues to store notification records

**Note:** Existing data in these collections is preserved.

---

## Code Cleanup Benefits

1. **Reduced API Surface Area:** Backend exposes only endpoints that are actually used
2. **Cleaner Codebase:** Less dead code in controllers
3. **Maintainability:** Easier to understand which endpoints are critical
4. **Future Development:** Clear guidance on what needs to be implemented for new features

---

## If These Endpoints Are Needed in the Future

To restore these endpoints, refer to the git history or follow these steps:

1. **For Archive Booking Endpoints:** Copy the three `@GetMapping` methods from `getAllArchivedBookings()`, `getMyArchivedBookings()`, and `getArchivedBooking()` from previous commit
2. **For Notification Endpoints:** Copy the two `@GetMapping` methods for `getAllNotifications()` and `getUnnotifiedNotifications()` from previous commit
3. Update frontend API_DOCUMENTATION.md to include these endpoints
4. Implement corresponding hooks in frontend (`useGetAllArchivedBookings()`, `useGetNotifications()`, etc.)

---

## Verification Checklist

- ✅ Removed archive booking GET endpoints from BookingController
- ✅ Removed notification retrieval endpoints from NotificationController
- ✅ Verified all remaining 19 endpoints match frontend API documentation
- ✅ Confirmed service methods are still available for internal use
- ✅ Database collections and data remain intact
- ✅ No breaking changes to existing functionality

---

## Files Modified

1. **BookingController.java** - Removed 3 archive booking endpoints
2. **NotificationController.java** - Removed 2 notification retrieval endpoints

**Total Endpoints Removed: 5**
**Total Endpoints Remaining: 19**
