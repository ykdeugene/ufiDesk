# UfiDesk - Smart Desk Booking System

## Project Overview & Presentation Summary

---

## 🎯 Executive Summary

**UfiDesk** is a modern, full-stack desk booking and workspace management solution designed for hybrid work environments. The system enables organizations to efficiently manage office desk allocations, track availability, and streamline workspace booking processes through an intuitive visual interface.

**Project Type:** Hackathon Project  
**Tech Stack:** React + TypeScript + Vite + React Router  
**Architecture:** Full-stack SSR application with REST API integration

---

## 💡 Problem Statement

In the post-pandemic hybrid work era, organizations face challenges:

- Inefficient desk allocation leading to wasted office space
- No visibility into desk availability across different time periods
- Manual booking processes causing scheduling conflicts
- Difficulty managing different desk types (regular, standing desks)
- Lack of administrative control over workspace configurations

---

## ✨ Key Features

### 👤 **User Features**

1. **Visual Floorplan Booking**
   - Interactive grid-based desk selection
   - Real-time availability status
   - Multi-desk booking support
   - Calendar integration with FullCalendar

2. **Flexible Booking Periods**
   - AM/PM time slot granularity
   - Date range selection
   - Custom booking descriptions
   - View personal booking history

3. **Smart Desk Filtering**
   - Filter by desk type (regular/standing)
   - Filter by amenities (monitor availability)
   - Visual desk orientation indicators
   - Availability status color coding

### 🔧 **Admin Features**

1. **Floorplan Management**
   - Drag-and-drop floorplan designer
   - Customizable grid dimensions (X × Y layout)
   - Multiple desk types support
   - Desk property configuration:
     - Position (X, Y coordinates)
     - Type (Regular/Standing)
     - Direction (Up/Down/Left/Right)
     - Monitor availability

2. **Advanced Editing Tools**
   - Paint mode for bulk desk placement
   - Undo/Redo history (up to 50 actions)
   - CSV import/export functionality
   - Template-based desk placement
   - Selection and deletion tools

3. **User Management**
   - Create/update user accounts
   - Role-based access control (Admin/User)
   - Account activation/deactivation
   - Secure password management

4. **System Configuration**
   - Multiple floorplan support
   - Set active/main floorplan
   - Booking oversight and management

---

## 🏗️ Technical Architecture

### **Frontend Stack**

```
React 19.2.4
├── React Router 7.12.0 (SSR Framework)
├── TypeScript 5.9.2 (Type Safety)
├── Vite 7.1.7 (Build Tool)
├── TailwindCSS 4.1.13 (Styling)
├── TanStack Query 5.90.20 (Data Fetching)
└── React Hook Form 7.71.1 (Form Management)
```

### **Key Libraries**

- **FullCalendar** - Calendar and scheduling visualization
- **Axios** - HTTP client for API communication
- **Zustand** - State management for notifications
- **React Toastify** - Toast notifications
- **Crypto-JS** - Client-side AES-256-CBC encryption

---

## 📁 Project Structure

```
UfiDesk-FE/
├── app/
│   ├── routes/
│   │   ├── admin/               # Admin-only routes
│   │   │   ├── user-management-page.tsx
│   │   │   ├── upload-floorplan/
│   │   │   └── floorplan-details/
│   │   ├── user/                # User routes
│   │   │   └── desk-booking-page.tsx
│   │   ├── login/
│   │   └── home.tsx
│   ├── api/
│   │   ├── hooks/               # React Query hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useBooking.ts
│   │   │   ├── useFloorplan.ts
│   │   │   ├── useAdmin.ts
│   │   │   └── useDesk.ts
│   │   └── types/               # TypeScript definitions
│   ├── components/
│   │   ├── FloorplanGrid.tsx    # Reusable grid component
│   │   ├── ProtectedRoute.tsx   # Auth guard
│   │   └── navbar/
│   └── stores/
│       └── notificationStore.ts
├── build/                       # Production build output
├── public/                      # Static assets
└── Docker configuration files
```

---

## 🔐 Security Features

### **Authentication & Authorization**

- Session-based authentication
- Role-based access control (RBAC)
- Protected routes with auth guards
- Session status monitoring (5-min cache)

### **Data Encryption**

- **AES-256-CBC encryption** for passwords
- Unique key derivation: `email:timestamp`
- Client-side encryption before transmission
- Secure logout with cache clearing

### **API Security**

- Credential-based HTTP requests
- CORS configuration
- Session validation on protected endpoints

---

## 🎨 User Experience Highlights

### **Intuitive Visual Design**

- Color-coded desk status (Available/Booked/Selected)
- Icon-based desk type indicators
- Responsive grid layout
- Smooth drag-and-drop interactions

### **Real-time Feedback**

- Toast notifications for all actions
- Loading states with skeletons
- Error handling with user-friendly messages
- Optimistic UI updates

### **Accessibility**

- Keyboard navigation support
- Clear visual hierarchy
- Responsive design (mobile-ready)
- Semantic HTML structure

---

## 📊 Data Management

### **State Management Strategy**

1. **Server State** (TanStack Query)
   - Automatic caching and revalidation
   - Optimistic updates
   - Background refetching
   - Cache invalidation strategies

2. **Client State** (Zustand)
   - Notification management
   - UI state persistence

3. **Form State** (React Hook Form)
   - Validation handling
   - Form submission management

### **Caching Strategy**

```typescript
Users Query: 30-second stale time
Session Status: 5-minute stale time
Floorplans: Cache until mutation
Bookings: Invalidate on create/delete
```

---

## 🔄 Key User Flows

### **1. Making a Desk Booking**

```
Login → View Floorplan → Select Desk(s)
→ Choose Date Range → Select Time Period (AM/PM)
→ Add Description → Submit → Calendar Confirmation
```

### **2. Admin Creating Floorplan**

```
Login as Admin → Upload Floorplan → Set Grid Size
→ Drag Desk Templates → Configure Properties
→ Use Paint Mode (Optional) → Save → Set as Main
```

### **3. Admin Managing Users**

```
Login as Admin → User Management
→ Create/Edit User → Set Permissions
→ Activate/Deactivate → Save
```

---

## 🚀 Deployment & DevOps

### **Docker Support**

- Containerized deployment ready
- Production-optimized build
- Port 3000 exposure
- Multi-platform support

### **Compatible Platforms**

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### **Build Process**

```bash
npm run build          # Production build
npm run dev            # Development mode (HMR)
npm run start          # Start production server
```

---

## 📈 Performance Optimizations

1. **Server-Side Rendering (SSR)**
   - Faster initial page load
   - Better SEO
   - Improved perceived performance

2. **Code Splitting**
   - Route-based splitting
   - Lazy loading of components
   - Optimized bundle sizes

3. **Asset Optimization**
   - Vite-powered hot module replacement
   - CSS optimization with TailwindCSS
   - Efficient chunk generation

4. **Data Fetching**
   - Parallel query execution
   - Request deduplication
   - Smart cache invalidation

---

## 🎯 Business Value

### **For Organizations**

- ✅ Optimize office space utilization
- ✅ Reduce real estate costs
- ✅ Enable flexible hybrid work policies
- ✅ Data-driven workspace planning
- ✅ Improved employee satisfaction

### **For Employees**

- ✅ Guaranteed desk availability
- ✅ Preferred desk selection
- ✅ Visual workspace planning
- ✅ Reduced booking conflicts
- ✅ Seamless booking experience

### **For Administrators**

- ✅ Centralized workspace management
- ✅ Real-time booking oversight
- ✅ Flexible configuration options
- ✅ User access control
- ✅ Scalable floorplan designs

---

## 🔮 Future Enhancements

### **Potential Features**

1. **Analytics Dashboard**
   - Desk utilization metrics
   - Popular desk heatmaps
   - Booking trend analysis

2. **Advanced Booking**
   - Recurring bookings
   - Team booking coordination
   - Booking requests and approvals

3. **Integration Capabilities**
   - Calendar sync (Google/Outlook)
   - Slack/Teams notifications
   - Building access systems
   - Visitor management

4. **Smart Features**
   - AI-powered desk recommendations
   - Predictive availability
   - Automated desk assignments

5. **Mobile Applications**
   - Native iOS/Android apps
   - QR code check-in
   - Push notifications

---

## 🛠️ Development Workflow

### **Technology Choices Rationale**

| Technology         | Reason                                                  |
| ------------------ | ------------------------------------------------------- |
| **React Router 7** | Modern SSR, file-based routing, built-in data loading   |
| **TypeScript**     | Type safety, better IDE support, fewer runtime errors   |
| **TanStack Query** | Powerful server state management, caching, auto-refetch |
| **TailwindCSS**    | Rapid UI development, consistent design, small bundle   |
| **Vite**           | Lightning-fast HMR, modern build tool, optimized output |
| **FullCalendar**   | Battle-tested calendar library, rich features           |

### **Code Quality Practices**

- TypeScript strict mode
- Component-based architecture
- Custom hooks for reusability
- Separation of concerns
- API layer abstraction

---

## 📝 API Integration Summary

### **Authentication APIs**

- `POST /auth/login` - User login with encryption
- `POST /auth/logout` - Session termination
- `GET /auth/status` - Session validation

### **Booking APIs**

- `POST /booking/create-booking` - Multi-desk booking creation
- `GET /booking/get-all-active-booking` - Fetch all active bookings
- `POST /booking/delete-booking/{id}` - Cancel booking

### **Floorplan APIs**

- `GET /floorplan/get-floorplan` - Fetch all floorplans
- `GET /floorplan/get-main` - Get active floorplan
- `POST /floorplan/upload` - Create new floorplan
- `POST /floorplan/set-main` - Set active floorplan

### **Admin APIs**

- `GET /admin/get-users` - List all users
- `POST /admin/create-user` - Create user account
- `POST /admin/update-user` - Update user details

### **Desk APIs**

- `GET /desk/get-desk-by-floorplan` - Fetch desks with booking info
- `POST /desk/toggle-block/{id}` - Block/unblock desk

---

## 🎓 Technical Highlights

### **Custom Hooks Showcase**

1. **useFloorplanGrid** - Grid state management
2. **useDragAndDrop** - Drag-and-drop logic
3. **useFloorplanHistory** - Undo/redo functionality
4. **usePaintMode** - Bulk editing mode

### **Advanced Features**

1. **History Management**
   - 50-action undo/redo buffer
   - State snapshots
   - Efficient memory usage

2. **CSV Import/Export**
   - Floorplan configuration portability
   - Bulk data management
   - Easy migration between environments

3. **Paint Mode**
   - Rapid desk placement
   - Consistent template application
   - Productivity boost for large floorplans

---

## 🏆 Project Achievements

### **Hackathon Success Factors**

✨ **Complete Full-Stack Solution** - Both frontend and backend integration  
✨ **Production-Ready Code** - Docker deployment, TypeScript, error handling  
✨ **User-Centric Design** - Intuitive UI, visual feedback, accessibility  
✨ **Security First** - Authentication, authorization, encryption  
✨ **Scalable Architecture** - Modular code, reusable components, clean structure  
✨ **Rich Feature Set** - Multi-role support, advanced editing, real-time updates

---

## 👥 Target Users

### **Primary Users**

- Office workers in hybrid work environments
- Facility managers and office administrators
- Team leads coordinating workspace needs

### **Use Cases**

- Daily desk reservations for hybrid workers
- Team collaboration desk clustering
- Hot-desking in flexible office spaces
- Workspace planning for events/meetings

---

## 📊 Technical Metrics

- **React Components**: 15+ custom components
- **API Hooks**: 8 specialized hook files
- **Type Definitions**: Full TypeScript coverage
- **Build Output**: Optimized client + server bundles
- **Routes**: 6+ protected routes
- **Security Level**: AES-256-CBC encryption

---

## 🌟 Innovation Points

1. **Visual Floorplan Editor** - Drag-and-drop interface for easy desk layout design
2. **Dual Period Booking** - AM/PM granularity for flexible scheduling
3. **Multi-Desk Selection** - Book multiple desks in one transaction
4. **Template System** - Predefined desk configurations for consistency
5. **Real-time Sync** - TanStack Query ensures all users see latest data

---

## 📞 Conclusion

**UfiDesk** represents a modern approach to workspace management, combining:

- **Cutting-edge technology stack**
- **Intuitive user experience**
- **Enterprise-grade security**
- **Scalable architecture**
- **Production deployment readiness**

The system addresses real-world challenges in hybrid work environments while demonstrating technical excellence in React development, API integration, state management, and user interface design.

---

## 🔗 Resources

- **Repository**: UfiDesk-FE Frontend Application
- **Framework**: [React Router v7](https://reactrouter.com/)
- **API Documentation**: See `API_DOCUMENTATION.md`
- **Deployment**: Docker-ready with multi-platform support

---

_Built with ❤️ for the Hackathon_  
_Technology: React • TypeScript • Vite • React Router_
