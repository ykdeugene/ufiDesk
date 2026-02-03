# Notification on Login - Issue & Solution

## The Issue

You're not seeing notifications being sent out when a user logs in.

## Root Cause

This is **NOT a backend issue** - the backend is working correctly. The problem is with the **expected workflow**:

1. When a user logs in → Backend calls `sendPendingNotificationsOnLogin()`
2. This method checks if user has an active SSE emitter (connection to `/notification/notif-sse`)
3. **At the moment of login, the user typically does NOT have an active SSE connection yet**
4. So notifications are stored in the database but NOT sent
5. Notifications are only sent when the user actually connects to the SSE endpoint

## The Correct Workflow

For notifications to be delivered on login:

```
User Login → Frontend Receives Login Response
                    ↓
        Frontend Immediately Connects to SSE
        GET /notification/notif-sse
                    ↓
        Backend Sends All Pending Notifications
                    ↓
        User Sees Notifications
```

## What You Need to Do (Frontend)

Your frontend MUST establish an SSE connection immediately after login:

```javascript
// After successful login response
const response = await fetch('/auth/login', {
  method: 'POST',
  body: JSON.stringify(loginRequest)
});

const loginData = await response.json();

if (response.ok) {
  // ⭐ IMMEDIATELY connect to SSE to receive pending notifications
  connectToSSE();
  
  // Then proceed with navigation
  navigate('/dashboard');
}

function connectToSSE() {
  const eventSource = new EventSource('/notification/notif-sse');
  
  eventSource.addEventListener('notification', (event) => {
    const notification = JSON.parse(event.data);
    console.log('Notification received:', notification);
    displayNotification(notification); // Show to user
  });
  
  eventSource.addEventListener('error', () => {
    eventSource.close();
    // Reconnect with exponential backoff
    setTimeout(connectToSSE, 5000);
  });
  
  return eventSource;
}
```

## How to Verify It Works

1. **User A** logs in and immediately connects to SSE (can check Network tab for `notif-sse` with 200 status)
2. **User B** (admin) updates desk configuration that clashes with User A's bookings
3. Check the **Network tab**:
   - You should see `notif-sse` with 200 (not cancelled)
   - Response shows the notification event
4. **User A** should see the notification displayed

## Backend Behavior

The backend logs will show:

**On Login:**
```
✅ Login successful for user: user@example.com (role: USER, admin: false)
Checking for pending notifications on login for user: user@example.com
No pending notifications for user: user@example.com
```

**When Desk is Updated (if user is not connected):**
```
Sending notification UUID to connected user: admin@example.com
User user@example.com is not connected. Notification UUID will be sent on next login.
```

**When User Connects to SSE:**
```
User subscribing to notifications: user@example.com
✅ SSE emitter registered for user: user@example.com
Found 1 pending notifications for user: user@example.com
✅ Sent pending notification UUID to user user@example.com
```

## Summary

- ✅ Backend is working correctly
- ✅ Notifications are being created and stored
- ❌ **Frontend is not connecting to SSE after login**
- 🔧 **Solution**: Connect to SSE immediately after login succeeds

See `NOTIFICATION_SYSTEM.md` for complete documentation and troubleshooting guide.
