# SSE Notification System Documentation

## Overview

This document describes the real-time Server-Sent Events (SSE) notification system implemented for UfiDesk. The system allows users to receive notifications in real-time when they are connected, and stores notifications for delivery when they log in.

## Architecture

### Components

1. **NotificationController** - HTTP endpoints for notification management
2. **NotificationService** - Core business logic for notification handling
3. **Notification Model** - Data model for notifications in MongoDB
4. **SSE Emitters Map** - Thread-safe concurrent storage of active client connections

## Key Features

### 1. Real-Time Notifications via SSE
- Users subscribe to notifications at `/notification/notif-sse`
- Notifications are pushed to connected clients immediately
- Server maintains a connection per authenticated user
- 5-minute timeout with automatic reconnection support

### 2. Offline Notification Delivery
- Notifications created while user is offline are stored in the database
- On next login or SSE connection, pending notifications are sent
- User can retrieve all pending notifications at any time

### 3. User Acknowledgment Flow
- **notifiedStatus = false**: Notification created/sent but not acknowledged
- **notifiedStatus = true**: User has explicitly acknowledged the notification on frontend
- Only the frontend can change this status by calling the acknowledge endpoint

## Endpoints

### 1. Subscribe to Notifications (SSE)
```
GET /notification/notif-sse
Authorization: Required (authenticated user)
Content-Type: text/event-stream

Response: SSE Event Stream
- Sends pending notifications on connection
- Keeps connection open for real-time updates
- Auto-removes emitter on timeout/completion
```

### 2. Get All Notifications
```
GET /notification/get-all
Authorization: Required
Response: List<Notification>
- Returns all notifications for the authenticated user (both notified and unnotified)
```

### 3. Get Unnotified Notifications
```
GET /notification/get-unnotified
Authorization: Required
Response: List<Notification>
- Returns only notifications where notifiedStatus = false
```

### 4. Acknowledge Notification
```
PUT /notification/acknowledge/{notificationId}
Authorization: Required
Response: Notification (with notifiedStatus = true)
- Called when user explicitly acknowledges a notification on the frontend
- Only call this endpoint when user has actually seen/dismissed the notification
```

## Data Flow

### When a Desk Configuration is Updated
1. System detects clashing bookings
2. Creates notification objects for each affected user
3. Calls `notificationService.sendNotificationToUser(notification)` for each user:
   - If user is connected via SSE: sends notification immediately
   - If user is not connected: notification remains in database with notifiedStatus = false

### When User Logs In
1. `notificationService.sendPendingNotificationsOnLogin(userEmail)` is called
2. Service fetches all unnotified notifications for the user
3. **Important**: At login, the user typically hasn't connected to SSE yet
   - If user HAS an active SSE emitter: sends notifications immediately
   - If user DOES NOT have an active SSE emitter: notifications remain in database and will be sent when they connect to SSE
4. This is by design - SSE connection should be established by the frontend before or immediately after login

### When User Connects to SSE
1. `subscribeToNotifications()` endpoint is called at `/notification/notif-sse`
2. Emitter is registered in `userEmitters` map
3. **All pending (unnotified) notifications are sent immediately**
4. Connection stays open to receive new notifications in real-time

### When User Acknowledges a Notification
1. Frontend calls `PUT /notification/acknowledge/{notificationId}`
2. `notificationService.markAsNotified(notificationId)` is called
3. Notification's `notifiedStatus` is set to true and saved

## Database Schema

### Notification Collection
```json
{
  "_id": "notification-uuid",
  "email": "user@example.com",
  "bookingId": "booking-uuid",
  "cancelledBy": "admin@example.com",
  "notifiedStatus": false,
  "createdAt": "2026-02-03T10:30:00",
  "updatedAt": "2026-02-03T10:30:00"
}
```

### Important Fields
- **notifiedStatus**: false = unacknowledged, true = user has seen and dismissed
- **email**: Recipient user
- **cancelledBy**: User who triggered the notification
- **bookingId**: Related booking that was affected
- **createdAt/updatedAt**: Timestamps

## Frontend Integration

### Expected Workflow for Notifications on Login

**IMPORTANT**: To receive notifications after login, your frontend MUST:
1. User logs in (POST /auth/login) ✅
2. **Immediately connect to SSE** (GET /notification/notif-sse) ← This is where pending notifications are sent
3. Keep the connection open to receive real-time updates

If you don't connect to SSE after login, pending notifications will NOT be displayed.

### Step 1: Connect to SSE
```javascript
const eventSource = new EventSource('/notification/notif-sse');

eventSource.addEventListener('notification', (event) => {
  const notification = JSON.parse(event.data);
  console.log('Received notification:', notification);
  // Display notification to user
  showNotificationUI(notification);
});

eventSource.addEventListener('error', (event) => {
  console.error('SSE connection error');
  eventSource.close();
  // Reconnect after delay
});
```

### Step 2: Handle User Acknowledgment
```javascript
async function acknowledgeNotification(notificationId) {
  const response = await fetch(
    `/notification/acknowledge/${notificationId}`,
    { method: 'PUT' }
  );
  
  if (response.ok) {
    const data = await response.json();
    console.log('Notification acknowledged:', data);
    // Remove from UI
    removeNotificationUI(notificationId);
  }
}
```

### Step 3: Fetch Pending Notifications (Optional)
```javascript
async function getPendingNotifications() {
  const response = await fetch('/notification/get-unnotified');
  const data = await response.json();
  const notifications = data.data;
  notifications.forEach(notif => showNotificationUI(notif));
}
```

## Important Notes

1. **notifiedStatus Semantics**
   - Only mark as true when user explicitly acknowledges on frontend
   - Never automatically mark as true when sending via SSE
   - Use `GET /notification/get-unnotified` to fetch pending items for display

2. **Connection Management**
   - Each user can have only one active SSE emitter at a time
   - New connection replaces old one (old one times out after 5 minutes)
   - SSE automatically closes when browser tab closes

3. **Error Handling**
   - If SSE send fails, emitter is removed from active connections
   - Notification remains in database and will be resent on next connection
   - Network errors are automatically retried by browser EventSource API

4. **Scalability**
   - ConcurrentHashMap ensures thread-safe operations
   - In-memory emitter storage only for active connections
   - Database stores all notifications persistently

## Testing

### Test Real-Time Notification
1. User A logs in and connects to SSE
2. User B (admin) updates desk configuration
3. User A should receive notification in real-time

### Test Offline Notification
1. User A is offline
2. User B updates desk configuration
3. User A logs in or connects to SSE
4. Pending notification is sent

### Test Acknowledgment
1. User receives notification
2. User calls acknowledge endpoint
3. notifiedStatus should be true in database
4. Notification should no longer appear in get-unnotified results

## Troubleshooting

### Problem: Notifications not appearing after login

**Cause**: The frontend did not connect to the SSE endpoint after logging in.

**Solution**: 
1. Ensure your frontend calls `GET /notification/notif-sse` immediately after login
2. Check browser console for SSE errors
3. Verify the EventSource connection is established

**What to check in logs**:
```
✅ Login successful for user: user@example.com
User subscribing to notifications: user@example.com
✅ SSE emitter registered for user: user@example.com
Found X pending notifications for user: user@example.com
✅ Sent pending notification ABC to user user@example.com
```

If you see "Found 0 pending notifications", there are no unnotified notifications in the database.

### Problem: Notifications appearing but then disappearing

**Cause**: Frontend is reconnecting to SSE multiple times instead of keeping connection open.

**Solution**:
1. Add exponential backoff to reconnection attempts
2. Ensure only one EventSource instance is created
3. Close EventSource properly on logout

**Code example for proper reconnection**:
```javascript
let eventSource = null;
let reconnectDelay = 1000;

function connectSSE() {
  if (eventSource) return; // Prevent duplicate connections
  
  eventSource = new EventSource('/notification/notif-sse');
  
  eventSource.addEventListener('notification', (event) => {
    reconnectDelay = 1000; // Reset on successful connection
    // Handle notification
  });
  
  eventSource.addEventListener('error', () => {
    eventSource.close();
    eventSource = null;
    reconnectDelay = Math.min(reconnectDelay * 1.5, 30000);
    setTimeout(connectSSE, reconnectDelay);
  });
}
```

### Problem: Notification sent but notifiedStatus still false

**Cause**: Frontend didn't call the acknowledge endpoint.

**Solution**:
1. After user sees the notification, call `PUT /notification/acknowledge/{notificationId}`
2. Only mark as notified when user explicitly dismisses/acknowledges it

### Problem: Same notification sent multiple times

**Cause**: User has multiple SSE connections active, or the notification wasn't properly marked as notified.

**Solution**:
1. Ensure only one EventSource connection per user
2. Always call acknowledge endpoint when user dismisses notification
3. Check logs for multiple "SSE emitter registered" entries for same user

### Debugging with Logs

Check the backend logs for these key messages:

**On login**:
- "Checking for pending notifications on login for user: X"
- "User X does not have active SSE connection yet" OR "Sending X pending notifications via SSE"

**On SSE connection**:
- "User subscribing to notifications: X"
- "Found X pending notifications for user: X"
- "Sent pending notification ABC to user X"

**On notification creation**:
- "Sending notification XYZ to connected user: ABC"
- "User ABC is not connected. Notification XYZ will be sent on next login."

**On acknowledgement**:
- "User X acknowledging notification: XYZ"
- "Notification XYZ marked as notified"

