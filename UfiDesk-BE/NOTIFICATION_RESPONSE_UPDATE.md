# Notification Response Update

## Overview

The notification system has been updated to include booking objects in notification responses. When retrieving notifications, the associated booking object is now automatically fetched and included in the response.

## Changes Made

### 1. New NotificationResponse DTO
**File**: `src/main/java/com/ufidesk/dto/NotificationResponse.java`

This DTO wraps a Notification with its associated Booking object:

```java
{
  "id": "notification-uuid",
  "email": "user@example.com",
  "booking": { /* booking object */ },
  "cancelledBy": "admin@example.com",
  "notifiedStatus": false,
  "createdAt": "2026-02-03T01:18:34",
  "updatedAt": "2026-02-03T01:18:34"
}
```

### 2. Updated NotificationService
**File**: `src/main/java/com/ufidesk/service/NotificationService.java`

**Added methods:**
- `convertToNotificationResponse(Notification)` - Converts a single notification to NotificationResponse with booking
- `convertToNotificationResponses(List<Notification>)` - Converts multiple notifications to NotificationResponses
- Added BookingService dependency to fetch booking objects

**How it works:**
1. Takes a Notification object
2. Fetches the associated Booking using the bookingId
3. Returns a NotificationResponse with both objects
4. Handles cases where booking is not found (returns null, which is filtered out)

### 3. Updated NotificationController
**File**: `src/main/java/com/ufidesk/controller/NotificationController.java`

**Updated endpoints:**
- `GET /notification/get-all` - Returns `List<NotificationResponse>` instead of `List<Notification>`
- `GET /notification/get-unnotified` - Returns `List<NotificationResponse>` instead of `List<Notification>`

### 4. Re-added BookingService Method
**File**: `src/main/java/com/ufidesk/service/BookingService.java`

Added `getBookingById(String bookingId)` method that was previously removed, as it's now needed by NotificationService.

## API Response Examples

### GET /notification/get-all
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": [
    {
      "id": "4d133ac7-f517-48e7-815b-62e11bafa3f2",
      "createdAt": "2026-02-03T01:18:34.891",
      "updatedAt": "2026-02-03T01:18:34.891",
      "email": "user@example.com",
      "booking": {
        "id": "booking-123",
        "floorplanId": "floorplan-1",
        "deskId": "desk-5",
        "userEmail": "user@example.com",
        "startDate": "2026-02-05",
        "startPeriod": "AM",
        "endDate": "2026-02-06",
        "endPeriod": "PM",
        "description": "Team meeting",
        "status": "CANCELLED",
        "createdAt": "2026-02-01T10:00:00",
        "updatedAt": "2026-02-03T01:18:34"
      },
      "cancelledBy": "admin@example.com",
      "notifiedStatus": false
    }
  ]
}
```

### GET /notification/get-unnotified
Same structure as above, but only includes notifications where `notifiedStatus` is `false`.

## Error Handling

If a booking cannot be found:
- The notification is excluded from the response list
- A warning is logged: "Booking not found for notification {id}"
- The response still succeeds but with fewer items

This prevents broken notification responses if a booking is deleted while notifications exist for it.

## Benefits

✅ **Complete Information**: Frontend gets both notification and booking data in one response
✅ **No Extra Calls**: Eliminates need for separate booking fetch calls
✅ **Efficient**: Uses Spring's lazy loading and caching mechanisms
✅ **Graceful Handling**: Handles missing bookings without breaking the API
✅ **Consistent**: Same response structure for all notification endpoints

## Testing

### Test Real-Time Notification with Booking
1. User A creates a booking
2. Admin updates desk configuration causing clash
3. User A connects to SSE or logs in
4. Response includes both notification and full booking details

### Test Offline Notification with Booking
1. User A is offline
2. Admin cancels User A's booking
3. Notification is created
4. User A logs in and fetches `/notification/get-unnotified`
5. Response includes notification with complete booking object

### Test Acknowledged Notifications
1. User acknowledges notification at `/notification/acknowledge/{id}`
2. Call `/notification/get-unnotified`
3. Acknowledged notification should NOT appear (notifiedStatus is now true)
