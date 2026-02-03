# API Hooks Summary - UfiDesk Frontend

## 📁 **Authentication APIs** (`useAuth.ts`)

### **POST** `/auth/login`

- **Hook:** `useLogin()`
- **Purpose:** User authentication with encrypted password
- **Features:** AES-256-CBC encryption using email:timestamp derived keys
- **Returns:** LoginResponse with user email, role, admin status

### **POST** `/auth/logout`

- **Hook:** `useLogout()`
- **Purpose:** Terminate user session
- **Side Effects:** Clears all React Query cache

### **GET** `/auth/status`

- **Hook:** `useSessionStatus()`
- **Purpose:** Check current user session status
- **Cache:** 5-minute stale time, no retry on failure
- **Returns:** SessionStatus (email, role, admin boolean) or null

---

## 📁 **Admin Management APIs** (`useAdmin.ts`)

### **GET** `/admin/get-users`

- **Hook:** `useGetUsers()`
- **Purpose:** Fetch all users (admin only)
- **Cache:** 30-second stale time
- **Returns:** Array of UserDto objects

### **POST** `/admin/create-user`

- **Hook:** `useCreateUser()`
- **Purpose:** Create new user account
- **Features:** AES-256-CBC password encryption with email:createTime keys
- **Payload:** email, encrypted password, admin boolean, active boolean, createTime
- **Side Effects:** Invalidates users query cache

### **POST** `/admin/update-user`

- **Hook:** `useUpdateUser()`
- **Purpose:** Update existing user account
- **Features:** Optional password update with encryption
- **Payload:** email, encrypted password (optional), admin, active, updateTime
- **Side Effects:** Invalidates users query cache

---

## 📁 **Booking APIs** (`useBooking.ts`)

### **POST** `/booking/create-booking`

- **Hook:** `useCreateBooking()`
- **Purpose:** Create desk booking(s) for multiple desks
- **Payload:** description, deskIds[], startDate, startPeriod (AM/PM), endDate, endPeriod
- **Returns:** Array of Booking objects (one per desk)
- **Side Effects:** Invalidates all booking queries

### **GET** `/booking/get-all-active-booking`

- **Hook:** `useGetAllActiveBookings()`
- **Purpose:** Fetch all active bookings across all desks
- **Returns:** Array of Booking objects with full details
- **Fields:** id, floorplanId, deskId, description, dates, periods, userEmail, status

### **POST** `/booking/delete-booking/{bookingId}`

- **Hook:** `useDeleteBooking()`
- **Purpose:** Delete a specific booking by ID
- **Side Effects:** Invalidates all booking queries

---

## 📁 **Floorplan APIs** (`useFloorplan.ts`)

### **GET** `/floorplan/get-floorplan`

- **Hook:** `useGetFloorplan()`
- **Purpose:** Fetch all floorplans
- **Returns:** Array of Floorplan objects with desk layouts

### **GET** `/floorplan/get-main`

- **Hook:** `useGetMainFloorplan()`
- **Purpose:** Fetch the currently active/main floorplan
- **Returns:** Single Floorplan object
- **Structure:** id, name, xLength, yLength, desks[], isMain

### **POST** `/floorplan/upload`

- **Hook:** `useUploadFloorplan()`
- **Purpose:** Upload new floorplan configuration
- **Payload:** name, xLength, yLength, desks[]
- **Desk Properties:** id, x, y, hasMonitor, direction (up/down/left/right), type (regular/standing)

### **POST** `/floorplan/set-main`

- **Hook:** `useSetMainFloorplan()`
- **Purpose:** Set a floorplan as the active/main floorplan
- **Payload:** floorplanId
- **Returns:** Updated Floorplan object

---

## 📁 **Desk Management APIs** (`useDesk.ts`)

### **GET** `/desk/get-desks-by-main-floorplan`

- **Hook:** `useGetDesksByFloorplan()` (aliased from useGetDesksByMainFloorplan)
- **Purpose:** Fetch desk data/details for main floorplan
- **Returns:** Array of DeskData objects
- **Fields:** id, floorplanId, deskId, description, blockStart, blockEnd, timestamps

### **POST** `/desk/update-desk-details`

- **Hook:** `useUpdateDeskDetails()`
- **Purpose:** Update desk blocking information
- **Payload:** deskId, description, blockStart (nullable), blockEnd (nullable)
- **Use Case:** Create/edit/delete desk blocking periods

### **POST** `/desk/check-for-clash`

- **Hook:** `useCheckForClash()`
- **Purpose:** Check if desk blocking conflicts with existing bookings
- **Payload:** Same as update-desk-details
- **Returns:** Array of conflicting Booking objects
- **Use Case:** Pre-validation before creating/editing desk blocks

---

## 📁 **User Profile APIs** (`useUser.ts`)

### **POST** `/user/update-profile`

- **Hook:** `useUpdateProfile()`
- **Purpose:** Non-admin user self-service profile update
- **Features:** Optional password change with AES-256-CBC encryption
- **Payload:** email, encrypted password (optional), updateTime
- **Side Effects:** Invalidates session query to refresh user data

---

## 📁 **Notification APIs** (`useNotification.ts`)

### **GET** `/notification/notif-sse` (Server-Sent Events)

- **Hook:** `useNotificationSSE()`
- **Purpose:** Real-time notification stream using SSE
- **Features:**
  - Auto-reconnection on error
  - Connection status tracking
  - Listens for "notification" and "connect" events
  - withCredentials: true for session cookies
- **Events:** Booking cancellations, desk blocks affecting user bookings

### **POST** `/notification/acknowledge/{notificationId}`

- **Hook:** `useAcknowledgeNotification()`
- **Purpose:** Mark notification as acknowledged/read
- **Combined Hook:** `useMarkAsNotified()` - Calls API + removes from local Zustand store

---

## 🔐 **Security Features**

- **Password Encryption:** All passwords encrypted client-side using AES-256-CBC
- **Key Derivation:** SHA-256 hash of `email:timestamp` for unique keys
- **IV Generation:** First 128 bits of SHA-256 hash of `email:IV:timestamp`
- **Session Management:** Cookie-based authentication with session status checks
- **CORS:** withCredentials enabled for cross-origin requests

---

## 📊 **Data Flow Summary**

### **Booking Workflow:**

1. User selects desk(s) and date range → `useCreateBooking()`
2. Calendar displays bookings → `useGetAllActiveBookings()`
3. User right-clicks own booking → `useDeleteBooking()`

### **Admin Blocking Workflow:**

1. Admin selects desk → `useGetDesksByFloorplan()`
2. Admin sets block dates → `useCheckForClash()` validates
3. If conflicts exist → Show clash modal
4. Confirm → `useUpdateDeskDetails()` creates/updates block

### **Notification Workflow:**

1. SSE connection established → `useNotificationSSE()`
2. Backend pushes event → Zustand store updated
3. User clicks notification → `useMarkAsNotified()` acknowledges

### **Floorplan Workflow:**

1. Admin uploads design → `useUploadFloorplan()`
2. Admin activates → `useSetMainFloorplan()`
3. All users see → `useGetMainFloorplan()`

---

## 📦 **Query Key Structure**

```typescript
authKeys = {
  all: ["auth"],
  session: ["auth", "session"],
};

adminKeys = {
  all: ["admin"],
  users: ["admin", "users"],
};

bookingKeys = {
  all: ["booking"],
  activeBookings: ["booking", "active"],
};

floorplanKeys = {
  all: ["floorplan"],
  list: ["floorplan", "list"],
  main: ["floorplan", "main"],
};

deskKeys = {
  all: ["desk"],
  byFloorplan: ["desk", "by-floorplan"],
};
```

---

## 🔄 **Cache Invalidation Strategy**

| Mutation Hook            | Invalidates                       |
| ------------------------ | --------------------------------- |
| `useLogin()`             | None (manual cache set)           |
| `useLogout()`            | All queries (queryClient.clear()) |
| `useCreateUser()`        | `adminKeys.users()`               |
| `useUpdateUser()`        | `adminKeys.users()`               |
| `useUpdateProfile()`     | `["session"]`                     |
| `useCreateBooking()`     | `bookingKeys.all`                 |
| `useDeleteBooking()`     | `bookingKeys.all`                 |
| `useUpdateDeskDetails()` | Manual refetch required           |
| `useMarkAsNotified()`    | Local Zustand store only          |

---

## 📝 **Type Definitions**

### Booking

```typescript
interface Booking {
  id: string;
  floorplanId: string;
  deskId: string;
  description: string;
  startDate: string;
  startPeriod: Period; // "AM" | "PM"
  endDate: string;
  endPeriod: Period; // "AM" | "PM"
  userEmail: string;
  status: Status; // "ACTIVE" | "CANCELLED"
  createdAt: string;
  updatedAt: string;
}
```

### Floorplan

```typescript
interface Floorplan {
  id: string;
  name: string;
  xLength: number;
  yLength: number;
  desks: Desk[];
  createdAt?: string;
  updatedAt?: string;
  isMain?: boolean;
}
```

### Desk

```typescript
interface Desk {
  id: string;
  x: number;
  y: number;
  hasMonitor: boolean;
  direction: "up" | "down" | "left" | "right";
  type: "regular" | "standing";
}
```

### DeskData

```typescript
interface DeskData {
  id: string;
  floorplanId: string;
  deskId: string;
  description: string;
  blockStart: string | null;
  blockEnd: string | null;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🌐 **API Base URL Configuration**

```typescript
// Default: http://localhost:8080
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
```

Set in `.env` file:

```
VITE_API_BASE_URL=https://your-backend-url.com
```
