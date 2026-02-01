# UfiDesk Backend

Hot Desk Booking and Administration Backend API

## Prerequisites

- Java 17 or higher
- Docker and Docker Compose
- MongoDB (running in Docker)

## Getting Started

### 1. Start MongoDB with Docker Compose

```bash
docker-compose up -d
```

This will start:

- MongoDB on port 27017
- Mongo Express (admin UI) on port 8081

Access Mongo Express at: http://localhost:8081

### 2. Run the Application

Using Gradle wrapper:

```bash
# On Windows
gradlew.bat bootRun

# On macOS/Linux
./gradlew bootRun
```

Or build and run the JAR:

```bash
# Build
gradlew.bat build

# Run
java -jar build/libs/ufidesk-0.0.1-SNAPSHOT.jar
```

The application will start on http://localhost:8080

## Configuration

Application configuration is in `src/main/resources/application.yml`:

- **Server Port**: 8080
- **MongoDB URI**: mongodb://admin:admin123@localhost:27017/ufidesk
- **Session Timeout**: 30 minutes
- **CORS**: Configured for frontend at http://localhost:5173

## Project Structure

```
src/
├── main/
│   ├── java/
│   │   └── com/
│   │       └── ufidesk/
│   │           ├── UfiDeskApplication.java
│   │           ├── config/
│   │           │   ├── SecurityConfig.java
│   │           │   └── SessionConfig.java
│   │           ├── controller/
│   │           │   └── AuthController.java
│   │           ├── dto/
│   │           ├── model/
│   │           ├── repository/
│   │           ├── security/
│   │           └── service/
│   └── resources/
│       └── application.yml
└── test/
    └── java/
```

## Technologies

- **Spring Boot 3.2.2**
- **Spring Data MongoDB** - MongoDB integration
- **Spring Session** - Session management with MongoDB store
- **SLF4J/Logback** - Logging
- **Lombok** - Reduce boilerplate code
- **Java 17** - Language version

## API Endpoints

### Authentication

- `POST /auth/login` - User login with credentials
  - Request: `{ "username": "string", "password": "string" }`
  - Response: `{ "success": true, "message": "Login successful", "data": { "username": "string", "role": "string", "message": "string" } }`
  - Status: 200 OK on success, 401 UNAUTHORIZED on invalid credentials, 403 FORBIDDEN on account locked/disabled

- `POST /auth/logout` - User logout (invalidates session)
  - Response: `{ "success": true, "message": "Logout successful", "data": null }`
  - Status: 200 OK

- `GET /auth/status` - Check current session status
  - Response: `{ "success": true, "message": "Session active", "data": { "username": "string", "role": "string", "message": "string" } }`
  - Status: 200 OK on active session, 401 UNAUTHORIZED if no session

### Security Features

- **BCrypt Password Hashing**: All passwords are hashed using BCrypt
- **Account Lockout**: Account is temporarily locked after 5 failed login attempts (15 minute lockout)
- **Session Management**: HTTP sessions stored in MongoDB
- **Password Strength Validation**: Minimum 8 characters with at least 3 of: uppercase, lowercase, numbers, special characters

## Development

### Hot Reload

Spring Boot DevTools is included for automatic restart during development.

### Database Management

Access Mongo Express at http://localhost:8081 to:

- View collections
- Query documents
- Manage sessions

### Stop MongoDB

```bash
docker-compose down
```

To remove volumes (deletes all data):

```bash
docker-compose down -v
```
