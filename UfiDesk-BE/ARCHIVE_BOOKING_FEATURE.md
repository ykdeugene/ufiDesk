# Archive Booking Feature Documentation

## Overview

The Archive Booking feature allows cancelled bookings to be moved to a separate `archiveBookings` collection and deleted from the active `bookings` collection. This keeps the active bookings table clean while maintaining a complete audit trail of cancelled bookings.

## Architecture

### Collections

#### Bookings Collection
- **Purpose**: Stores all active and current bookings
- **Action on Cancel**: Booking is removed from this collection
- **Collection Name**: `bookings`

#### Archive Bookings Collection
- **Purpose**: Stores all cancelled bookings for historical/audit purposes
- **Action on Cancel**: Cancelled booking is moved here
- **Collection Name**: `archiveBookings`
- **Additional Fields**:
  - `archivedAt`: Timestamp when the booking was archived

## Data Models

### ArchiveBooking Model

The `ArchiveBooking` model extends the `Booking` model with one additional field:

```java
@Document(collection = "archiveBookings")
public class ArchiveBooking {
    String id;                          // Same as original booking ID
    String floorplanId;
    String deskId;
    String description;
    LocalDate startDate;
    Period startPeriod;
    LocalDate endDate;
    Period endPeriod;
    String userEmail;
    Status status;                      // Always CANCELLED
    LocalDateTime createdAt;            // When booking was created
    LocalDateTime updatedAt;            // When booking was updated
    LocalDateTime archivedAt;           // NEW: When booking was cancelled/archived
}
```

### Conversion Method

```java
public static ArchiveBooking fromBooking(Booking booking) {
    // Converts a Booking to ArchiveBooking
    // Preserves all original fields and adds archivedAt timestamp
}
```

## API Endpoints

### Cancel Booking

**Endpoint:** `DELETE /booking/cancel-booking/{bookingId}`

**Authentication:** Required (Any authenticated user)

**Request:**
```
DELETE /booking/cancel-booking/507f1f77bcf86cd799439011
```

**Response (Success - HTTP 200):**
```json
{
  "success": true,
  "message": "Booking cancelled and archived successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "floorplanId": "floor123",
    "deskId": "desk456",
    "description": "Team meeting preparation",
    "startDate": "2026-02-10",
    "startPeriod": "AM",
    "endDate": "2026-02-10",
    "endPeriod": "PM",
    "userEmail": "user@example.com",
    "status": "CANCELLED",
    "createdAt": "2026-02-03T10:00:00",
    "updatedAt": "2026-02-03T11:30:00",
    "archivedAt": "2026-02-03T11:30:45.123"
  }
}
```

**Response (Not Found - HTTP 404):**
```json
{
  "success": false,
  "message": "Booking not found: 507f1f77bcf86cd799439011"
}
```

---

### Get All Archived Bookings

**Endpoint:** `GET /booking/get-all-archived-bookings`

**Authentication:** Required (ADMIN or SUPERADMIN only)

**Request:**
```
GET /booking/get-all-archived-bookings
```

**Response (Success - HTTP 200):**
```json
{
  "success": true,
  "message": "All archived bookings retrieved successfully",
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "floorplanId": "floor123",
      "deskId": "desk456",
      "userEmail": "user@example.com",
      "status": "CANCELLED",
      "archivedAt": "2026-02-03T11:30:45.123"
    },
    // ... more archived bookings
  ]
}
```

---

### Get My Archived Bookings

**Endpoint:** `GET /booking/get-archived-bookings`

**Authentication:** Required (Any authenticated user)

**Description:** Retrieves archived bookings for the authenticated user only

**Request:**
```
GET /booking/get-archived-bookings
```

**Response (Success - HTTP 200):**
```json
{
  "success": true,
  "message": "Archived bookings retrieved successfully",
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "floorplanId": "floor123",
      "deskId": "desk456",
      "startDate": "2026-02-10",
      "endDate": "2026-02-10",
      "userEmail": "user@example.com",
      "status": "CANCELLED",
      "archivedAt": "2026-02-03T11:30:45.123"
    }
  ]
}
```

---

### Get Archived Booking by ID

**Endpoint:** `GET /booking/get-archived-booking/{archivedBookingId}`

**Authentication:** Required (Any authenticated user)

**Request:**
```
GET /booking/get-archived-booking/507f1f77bcf86cd799439011
```

**Response (Success - HTTP 200):**
```json
{
  "success": true,
  "message": "Archived booking retrieved successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "floorplanId": "floor123",
    "deskId": "desk456",
    "description": "Team meeting preparation",
    "startDate": "2026-02-10",
    "startPeriod": "AM",
    "endDate": "2026-02-10",
    "endPeriod": "PM",
    "userEmail": "user@example.com",
    "status": "CANCELLED",
    "createdAt": "2026-02-03T10:00:00",
    "updatedAt": "2026-02-03T11:30:00",
    "archivedAt": "2026-02-03T11:30:45.123"
  }
}
```

---

## Service Methods

### BookingService Methods

```java
// Cancel a single booking
public ArchiveBooking cancelBooking(String bookingId)

// Cancel multiple bookings
public List<ArchiveBooking> cancelMultipleBookings(List<String> bookingIds)

// Get all archived bookings
public List<ArchiveBooking> getAllArchivedBookings()

// Get archived bookings by user email
public List<ArchiveBooking> getArchivedBookingsByUserEmail(String userEmail)

// Get archived bookings by floorplan
public List<ArchiveBooking> getArchivedBookingsByFloorplanId(String floorplanId)

// Get archived bookings by desk
public List<ArchiveBooking> getArchivedBookingsByFloorplanAndDesk(String floorplanId, String deskId)

// Get a specific archived booking
public ArchiveBooking getArchivedBookingById(String archivedBookingId)
```

## Database Operations

### When a Booking is Cancelled

The `cancelBooking()` method performs these operations in order:

1. **Fetch** the booking from the `bookings` collection
2. **Set Status** to CANCELLED
3. **Create** an `ArchiveBooking` object from the booking
4. **Save** to `archiveBookings` collection
5. **Delete** from `bookings` collection

**MongoDB Operations:**
```javascript
// 1. Find booking
db.bookings.findOne({ _id: ObjectId("...") })

// 2. Insert to archive
db.archiveBookings.insertOne({
  _id: ObjectId("..."),
  floorplanId: "...",
  // ... all booking fields
  status: "CANCELLED",
  archivedAt: ISODate("...")
})

// 3. Delete from bookings
db.bookings.deleteOne({ _id: ObjectId("...") })
```

## Files Created/Modified

| File | Type | Action | Purpose |
|------|------|--------|---------|
| `ArchiveBooking.java` | Model | Created | Define archive booking data structure |
| `ArchiveBookingRepository.java` | Repository | Created | Data access layer for archive bookings |
| `BookingService.java` | Service | Modified | Updated cancel methods, added archive retrieval methods |
| `BookingController.java` | Controller | Modified | Updated cancel endpoint, added archive retrieval endpoints |

## Benefits

1. **Clean Active Bookings Table**: Only current bookings remain in the bookings collection
2. **Complete Audit Trail**: All cancelled bookings are preserved in archive
3. **Performance**: Smaller active bookings collection means faster queries
4. **Compliance**: Historical data is maintained for auditing purposes
5. **Data Integrity**: Timestamps track when bookings were cancelled

## Usage Example

### Frontend Example (JavaScript/Fetch)

```javascript
// Cancel a booking
async function cancelBooking(bookingId) {
  const response = await fetch(`/booking/cancel-booking/${bookingId}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('Booking archived:', result.data);
    // Refresh booking list, show notification, etc.
  } else {
    console.error('Failed to cancel booking:', result.message);
  }
}

// Get my archived bookings
async function getMyArchivedBookings() {
  const response = await fetch('/booking/get-archived-bookings', {
    credentials: 'include'
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('Archived bookings:', result.data);
  }
}

// Get a specific archived booking
async function getArchivedBooking(archivedBookingId) {
  const response = await fetch(`/booking/get-archived-booking/${archivedBookingId}`, {
    credentials: 'include'
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('Archived booking details:', result.data);
  }
}
```

## Security & Permissions

| Endpoint | Permission | Description |
|----------|-----------|-------------|
| `DELETE /booking/cancel-booking/{id}` | Authenticated | Any logged-in user |
| `GET /booking/get-archived-bookings` | Authenticated | User's own archived bookings |
| `GET /booking/get-archived-booking/{id}` | Authenticated | User's own archived bookings |
| `GET /booking/get-all-archived-bookings` | ADMIN/SUPERADMIN | System-wide archive access |

## Future Enhancements

1. **Restore from Archive**: Add ability to restore cancelled bookings
2. **Archive Cleanup**: Implement scheduled deletion of very old archived bookings
3. **Archive Reports**: Generate reports on cancellation trends
4. **Notification Enhancement**: Notify desk users when bookings for their desks are cancelled
5. **Soft Delete**: Consider using soft delete pattern instead of moving to archive

## Migration Notes

If migrating from an old system:

1. All existing cancelled bookings can be moved to archive using a migration script
2. The `archivedAt` timestamp can be set to the `updatedAt` value for historical cancelled bookings
3. Active cancelled bookings should be moved to archive and deleted from bookings collection
