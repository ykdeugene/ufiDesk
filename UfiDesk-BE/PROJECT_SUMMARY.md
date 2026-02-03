# UfiDesk Backend - Project Summary

**A comprehensive Hot Desk Booking and Administration Backend API**

---

## 📋 Executive Summary

**UfiDesk Backend** is a Spring Boot 3.2+ REST API application designed to manage hot desk booking systems with administrative controls. The system provides robust authentication, session management, user administration, real-time notifications, and desk booking capabilities through MongoDB database storage.

### Key Statistics
- **Language**: Java 17+
- **Framework**: Spring Boot 3.4.2
- **Database**: MongoDB
- **Architecture**: RESTful API with Spring MVC
- **Authentication**: Spring Security + BCrypt
- **Real-Time Features**: Server-Sent Events (SSE) for notifications
- **Session Management**: Spring Session with MongoDB backend

---

## 🎯 Project Objectives

1. **Hot Desk Booking Management** - Allow users to book and manage desk reservations
2. **Multi-user Authentication** - Secure login with account lockout protection
3. **Administrative Control** - Admin panel for user and system management
4. **Real-Time Notifications** - Instant alerts when bookings are affected
5. **User Profile Management** - Self-service password and email updates
6. **Data Persistence** - MongoDB-backed data storage with proper indexing

---

## 🏗️ System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────┐
│      Frontend Application           │
│     (Vue.js - separate repo)        │
└────────────────┬────────────────────┘
                 │ HTTP/REST
                 ▼
┌─────────────────────────────────────┐
│    UfiDesk Backend API              │
│    (Spring Boot 3.4.2)              │
├─────────────────────────────────────┤
│ • Controllers (REST Endpoints)       │
│ • Services (Business Logic)          │
│ • Security (Authentication/AuthZ)    │
│ • DTOs (Data Transfer Objects)       │
└────────────────┬────────────────────┘
                 │
    ┌────────────┴────────────┐
    ▼                         ▼
┌─────────────────┐   ┌──────────────────┐
│   MongoDB       │   │  Spring Session  │
│   Collections   │   │   (HTTP)         │
└─────────────────┘   └──────────────────┘
```

### Technology Stack
| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Java | 17+ |
| Framework | Spring Boot | 3.4.2 |
| Database | MongoDB | Latest (Docker) |
| ORM/Data Access | Spring Data MongoDB | Included |
| Authentication | Spring Security | Included |
| Session Management | Spring Session | With MongoDB backend |
| Validation | Spring Validation | Built-in |
| Logging | SLF4J + Logback | Included |
| Development | Spring DevTools | With hot-reload |
| Rate Limiting | Bucket4j | 7.6.0 |
| Utility | Lombok | Latest |
| Testing | JUnit 5 + Spring Test | Included |

---

## 🔑 Core Features

### 1. Authentication System
- **Login Endpoint**: POST `/auth/login`
  - Username/password authentication
  - Returns user role and session token
  - 5-attempt lockout with 15-minute timeout
  
- **Logout Endpoint**: POST `/auth/logout`
  - Invalidates current session
  - Clears HTTP session
  
- **Session Status**: GET `/auth/status`
  - Verify active session
  - Check user role and permissions

### 2. Security Features
- **BCrypt Password Hashing**: Industry-standard password hashing
- **Account Lockout Protection**: Temporary locks after failed attempts
- **Session Management**: HTTP sessions stored in MongoDB
- **Password Strength**: Minimum 8 characters with 3+ character types
- **CORS Configuration**: Configured for frontend at localhost:5173
- **Rate Limiting**: Bucket4j integration for API protection

### 3. Admin Management API
**Endpoint Base**: `/admin/`

#### Admin Endpoints:
- **GET /admin/get-users** - Retrieve all users with their statuses
- **POST /admin/create-user** - Create new user accounts
- **POST /admin/update-user** - Update user credentials, roles, and status
- **Features**:
  - Superadmin deactivation protection
  - Password encryption with AES/CBC
  - Timestamp-based encryption salt
  - User status management (active/inactive)
  - Admin role assignment

### 4. User Profile Management
**Endpoint Base**: `/user/`

#### User Endpoints:
- **PUT /user/update-profile** - Update own email and password
- **Features**:
  - Self-service password changes
  - Email address updates with uniqueness validation
  - Encrypted password handling
  - Non-breaking updates (optional fields)

### 5. Real-Time Notification System (SSE)
**Endpoint Base**: `/notification/`

#### Notification Endpoints:
- **GET /notification/notif-sse** - Subscribe to real-time notifications
- **GET /notification/get-all** - Retrieve all notifications
- **GET /notification/get-unnotified** - Get unread notifications
- **PUT /notification/acknowledge/{notificationId}** - Mark as read

#### Features:
- **Real-Time Delivery**: Server-Sent Events (SSE) for instant updates
- **Offline Delivery**: Notifications stored when user is offline
- **Auto-Sync**: Pending notifications sent on login/SSE connection
- **Acknowledgment Flow**: User confirmation of notification receipt
- **MongoDB Storage**: Persistent notification history
- **5-minute Timeout**: Automatic reconnection support

### 6. Hot Desk Booking (Backend Foundation)
- Database collections prepared for booking management
- Booking validation rules ready for implementation
- Conflict detection for overlapping reservations
- Notification triggers for booking changes

---

## 📦 Project Structure

```
UfiDesk-BE/
├── src/main/java/com/ufidesk/
│   ├── UfiDeskApplication.java          # Main Spring Boot application class
│   ├── config/                          # Configuration classes
│   │   ├── SecurityConfig.java          # Spring Security configuration
│   │   └── SessionConfig.java           # MongoDB session configuration
│   ├── controller/                      # REST API Controllers
│   │   ├── AuthController.java          # Login/Logout/Status endpoints
│   │   ├── AdminController.java         # Admin user management
│   │   ├── UserController.java          # User profile management
│   │   ├── NotificationController.java  # SSE notifications
│   │   └── BookingController.java       # Desk booking endpoints
│   ├── service/                         # Business logic services
│   │   ├── AuthenticationService.java   # Auth logic
│   │   ├── AdminService.java            # Admin operations
│   │   ├── UserService.java             # User operations
│   │   ├── NotificationService.java     # Notification logic
│   │   └── BookingService.java          # Booking logic
│   ├── repository/                      # MongoDB data access
│   │   ├── UserRepository.java          # User CRUD
│   │   ├── NotificationRepository.java  # Notification CRUD
│   │   └── BookingRepository.java       # Booking CRUD
│   ├── model/                           # MongoDB entity models
│   │   ├── User.java                    # User entity
│   │   ├── Notification.java            # Notification entity
│   │   └── Booking.java                 # Booking entity
│   ├── dto/                             # Data Transfer Objects
│   │   ├── LoginRequest.java            # Login DTO
│   │   ├── UserResponse.java            # User response DTO
│   │   └── NotificationDto.java         # Notification DTO
│   └── security/                        # Security utilities
│       ├── JwtProvider.java             # JWT/token handling
│       └── PasswordEncoder.java         # BCrypt utilities
│
├── src/main/resources/
│   ├── application.yml                  # Base configuration
│   └── application-dev.yml              # Development overrides
│
├── build.gradle                         # Gradle build configuration
├── docker-compose.yml                   # MongoDB + Mongo Express setup
│
├── Documentation/
│   ├── README.md                        # Main readme
│   ├── QUICKSTART.md                    # 5-minute quick start
│   ├── GET_STARTED_NOW.md              # 3-minute quick start
│   ├── MONGODB_SETUP.md                # Database setup guide
│   ├── ARCHITECTURE_DIAGRAMS.md        # Architecture details
│   ├── ADMIN_API_DOCUMENTATION.md      # Admin endpoint details
│   ├── USER_PROFILE_API.md             # User endpoint details
│   ├── NOTIFICATION_SYSTEM.md          # Notification system guide
│   ├── TEST_SCENARIOS.md               # Testing checklist
│   └── REFERENCE.md                    # Command reference
│
├── Docker/
│   ├── docker-compose.yml              # MongoDB + Mongo Express
│   └── init-mongo.js                   # Database initialization
│
└── Scripts/
    ├── run-dev.sh/.ps1                 # Development runner
    ├── setup-mongodb.sh/.ps1           # MongoDB setup
    └── migrate-*.js                    # Database migrations
```

---

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Docker & Docker Compose
- Git

### Startup (3 Commands)

```bash
# 1. Start MongoDB
docker-compose up -d

# 2. Run the application
./gradlew bootRun  # macOS/Linux
# or
gradlew.bat bootRun  # Windows

# 3. Access the API
# API: http://localhost:8080
# Mongo Express UI: http://localhost:8081
# Swagger Docs: http://localhost:8080/swagger-ui.html (if configured)
```

### Verification
```bash
# Check application health
curl http://localhost:8080/auth/status

# Should return 401 (no session) or user data (if logged in)
```

---

## 📊 Database Schema

### User Collection
```json
{
  "_id": "user-id",
  "email": "user@example.com",
  "password": "$2a$10$...",  // BCrypt hash
  "role": "USER",            // USER or ADMIN
  "active": true,
  "locked": false,
  "failedLoginAttempts": 0,
  "lastLockTime": "2026-02-03T10:30:00Z",
  "createdAt": "2026-02-03T10:30:00Z",
  "updatedAt": "2026-02-03T10:30:00Z"
}
```

### Notification Collection
```json
{
  "_id": "notification-id",
  "email": "user@example.com",
  "bookingId": "booking-id",
  "cancelledBy": "admin@example.com",
  "notifiedStatus": false,
  "message": "Your booking was cancelled",
  "createdAt": "2026-02-03T10:30:00Z",
  "updatedAt": "2026-02-03T10:30:00Z"
}
```

### Session Collection
```json
{
  "_id": "session-id",
  "sessionAttributes": {
    "user": "user@example.com",
    "role": "USER"
  },
  "creationTime": "2026-02-03T10:30:00Z",
  "lastAccessedTime": "2026-02-03T10:35:00Z"
}
```

### Booking Collection (Foundation Ready)
```json
{
  "_id": "booking-id",
  "deskId": "desk-123",
  "userEmail": "user@example.com",
  "date": "2026-02-03",
  "startTime": "09:00",
  "endTime": "17:00",
  "status": "CONFIRMED",  // CONFIRMED, CANCELLED, PENDING
  "createdAt": "2026-02-03T10:30:00Z",
  "updatedAt": "2026-02-03T10:30:00Z"
}
```

---

## 🔐 API Response Format

All endpoints follow a consistent response format:

### Success Response (2xx)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Endpoint-specific data
  }
}
```

### Error Response (4xx/5xx)
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

### HTTP Status Codes
| Status | Meaning |
|--------|---------|
| 200 OK | Request succeeded |
| 201 Created | Resource created |
| 400 Bad Request | Invalid input |
| 401 Unauthorized | No valid session |
| 403 Forbidden | Permission denied |
| 404 Not Found | Resource not found |
| 409 Conflict | Duplicate/conflict (e.g., email exists) |
| 500 Server Error | Unexpected error |

---

## 🔄 Development Workflow

### Hot Reload Development
The application is configured with Spring DevTools for instant reload during development:

1. **Edit Code**: Make changes in your IDE
2. **Save File**: Press Ctrl+S (automatic detection)
3. **Auto Reload**: Application restarts within 2-3 seconds
4. **Test Changes**: Immediately available at http://localhost:8080

### Configuration Files
- **application.yml**: Base configuration (port 8080, MongoDB URI)
- **application-dev.yml**: Development overrides (debug logging, DevTools)
- **Properties**:
  - `spring.profiles.active=dev` - Enable dev mode
  - `spring.devtools.restart.enabled=true` - Enable hot reload
  - `spring.jpa.hibernate.ddl-auto=update` - Auto schema updates

### Logging
- **Development**: DEBUG level for application code
- **Default**: INFO level for Spring Framework
- **Output**: Console via Logback configuration

---

## 📈 Key Metrics & Features

### Performance Considerations
- Rate limiting via Bucket4j to prevent abuse
- MongoDB indexing on frequently queried fields
- Session timeout: 30 minutes default
- SSE connection timeout: 5 minutes (auto-reconnect)

### Security Checklist
✅ BCrypt password hashing  
✅ Account lockout protection  
✅ Password strength validation  
✅ Email uniqueness enforcement  
✅ Superadmin deactivation protection  
✅ CORS configuration  
✅ Encrypted password transmission  
✅ Timestamp-based encryption salt  
✅ Session management  
✅ Role-based access control  

### Data Integrity
✅ MongoDB transaction support (Spring Data)  
✅ Proper indexing on collections  
✅ Email uniqueness indexes  
✅ Cascading updates/deletes  
✅ Audit timestamps (createdAt, updatedAt)  

---

## 🧪 Testing

### Test Scenarios Covered
- ✅ Login with correct credentials
- ✅ Login with incorrect password (5 attempts lockout)
- ✅ Session status verification
- ✅ User creation/update by admins
- ✅ Notification delivery (SSE)
- ✅ Offline notification queuing
- ✅ Profile updates (email/password)
- ✅ Error handling and validation

### Manual Testing
```bash
# Login test
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@ufidesk.com","password":"admin123"}'

# Check status
curl http://localhost:8080/auth/status

# Get all users (admin only)
curl http://localhost:8080/admin/get-users

# Subscribe to notifications (SSE)
curl http://localhost:8080/notification/notif-sse
```

---

## 📚 Documentation Files

| File | Purpose | Read Time |
|------|---------|-----------|
| **GET_STARTED_NOW.md** | Copy-paste quick start | 3 min |
| **QUICKSTART.md** | Complete setup guide | 5 min |
| **MONGODB_SETUP.md** | Database setup & config | 15+ min |
| **ARCHITECTURE_DIAGRAMS.md** | System architecture | 10 min |
| **ADMIN_API_DOCUMENTATION.md** | Admin endpoints | 15 min |
| **USER_PROFILE_API.md** | User endpoints | 10 min |
| **NOTIFICATION_SYSTEM.md** | SSE notifications | 15 min |
| **TEST_SCENARIOS.md** | Testing guide | 30+ min |
| **REFERENCE.md** | Command reference | 2 min |
| **USER_PROFILE_SECURITY.md** | Security details | 10 min |

---

## 🔧 Configuration Overview

### Application Properties
```yaml
server:
  port: 8080
  
spring:
  application:
    name: ufidesk
  
  # MongoDB Configuration
  data:
    mongodb:
      uri: mongodb://admin:admin123@localhost:27017/ufidesk
  
  # Session Management
  session:
    store-type: mongodb
    timeout: 30m
    mongodb:
      collection-name: spring_session
  
  # CORS Setup
  web:
    cors:
      allowed-origins: http://localhost:5173
      allowed-methods: GET,POST,PUT,DELETE
      allow-credentials: true
  
  # Security
  security:
    user:
      name: admin
      password: admin123
```

---

## 🚨 Common Issues & Solutions

### MongoDB Connection Failed
- **Issue**: Cannot connect to MongoDB
- **Solution**: Ensure Docker Compose is running: `docker-compose up -d`
- **Check**: `docker ps` should show MongoDB container

### Port Already in Use
- **Issue**: Port 8080 already in use
- **Solution**: Change in `application.yml` or kill existing process
- **Alternative**: `lsof -i :8080` (macOS/Linux) to find process

### Session Not Persisting
- **Issue**: Login works but session is lost
- **Solution**: Ensure Spring Session MongoDB is properly configured
- **Check**: Session collection in MongoDB should have documents

### Hot Reload Not Working
- **Issue**: Changes not reflecting after save
- **Solution**: Check if DevTools is enabled in development profile
- **Alternative**: Manually restart with `./gradlew bootRun`

---

## 🎓 Learning Resources

### For Developers
1. **Spring Boot Official Docs**: https://spring.io/projects/spring-boot
2. **Spring Security**: https://spring.io/projects/spring-security
3. **Spring Data MongoDB**: https://spring.io/projects/spring-data-mongodb
4. **MongoDB Documentation**: https://docs.mongodb.com/

### For DevOps
1. **Docker Compose**: https://docs.docker.com/compose/
2. **Gradle Build Tool**: https://gradle.org/
3. **Logback Configuration**: https://logback.qos.ch/

---

## 📋 Deployment Checklist

Before production deployment:

- [ ] Change default passwords (MongoDB, application)
- [ ] Configure production CORS origins
- [ ] Enable HTTPS/SSL
- [ ] Set up MongoDB Atlas or managed service
- [ ] Configure environment variables for secrets
- [ ] Run security vulnerability scan (CVE)
- [ ] Set up monitoring and logging (ELK stack, etc.)
- [ ] Configure backup strategy for MongoDB
- [ ] Load testing and performance tuning
- [ ] Security audit and penetration testing
- [ ] API rate limiting configuration
- [ ] Database indexing optimization

---

## 🤝 Contributing

### Code Style
- Follow Spring Boot conventions
- Use meaningful variable names
- Add JavaDoc comments for public methods
- Write unit tests for new features

### Pull Request Process
1. Create feature branch: `git checkout -b feature/feature-name`
2. Commit changes: `git commit -m "Add feature"`
3. Push branch: `git push origin feature/feature-name`
4. Create pull request with description

---

## 📞 Support & Contact

For issues, questions, or suggestions:
- Check existing documentation files
- Review test scenarios in `TEST_SCENARIOS.md`
- Check MongoDB logs: `docker-compose logs mongodb`
- Review application logs in console output

---

## 📄 License & Copyright

This project is part of the UfiDesk Hackathon initiative.

---

## 🎯 Future Enhancements

### Planned Features
- [ ] WebSocket support for real-time notifications (alternative to SSE)
- [ ] Email notifications via SMTP
- [ ] SMS notifications
- [ ] Slack/Teams integration
- [ ] Calendar sync (Google Calendar, Outlook)
- [ ] Analytics dashboard
- [ ] Advanced booking rules (blackout dates, etc.)
- [ ] Desk floor plan visualization
- [ ] Reporting and audit logs
- [ ] API documentation (Swagger/OpenAPI)
- [ ] GraphQL API alternative
- [ ] Mobile app backend optimization

### Optimization Opportunities
- Implement caching layer (Redis)
- Add database connection pooling optimization
- Implement async processing (message queues)
- Add comprehensive metrics and monitoring
- Performance testing and benchmarking

---

## 📊 Project Statistics

**Last Updated**: February 3, 2026

- **Total Endpoints**: 15+
- **Database Collections**: 4 (User, Notification, Booking, Session)
- **Documentation Pages**: 12+
- **Code Files**: 25+
- **Dependencies**: 20+

---

**Happy Coding! 🚀**
