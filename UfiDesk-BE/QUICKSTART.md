# UfiDesk Backend - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Java 17 or higher
- Docker and Docker Compose
- Git (optional)

### Step 1: Start MongoDB

```bash
cd C:\Users\Ufinity\Desktop\Hackathon\ufiDesk\UfiDesk-BE

# Start MongoDB and Mongo Express
docker-compose up -d

# Verify MongoDB is running
docker-compose ps

# Check initialization logs
docker-compose logs mongodb
```

Wait for the output to show the initialization is complete. You should see messages like:
```
Database initialization complete!
Superadmin user created with username: 'superadmin', password: 'password'
```

### Step 2: Start the Backend Application

Option A: Using Gradle wrapper
```bash
./gradlew bootRun
```

Option B: Build and run JAR
```bash
./gradlew build
java -jar build/libs/ufidesk-0.0.1-SNAPSHOT.jar
```

The application will start on http://localhost:8080

### Step 3: Test the Application

#### Login as Superadmin
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "password"
  }'
```

Expected response (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "username": "superadmin",
    "role": "SUPERADMIN",
    "message": "Login successful"
  }
}
```

#### Check Session Status
```bash
curl -X GET http://localhost:8080/auth/status \
  -H "Cookie: JSESSIONID=<your-session-id>"
```

#### Logout
```bash
curl -X POST http://localhost:8080/auth/logout \
  -H "Cookie: JSESSIONID=<your-session-id>"
```

---

## 📊 Database Access

### Mongo Express UI
Open http://localhost:8081 in your browser to view the database

**Collections created:**
- `users` - Contains user accounts with security fields
- `SPRING_SESSION` - HTTP session storage
- `SPRING_SESSION_ATTRIBUTES` - Session attributes

### Direct MongoDB Access
```bash
# Connect with mongosh
mongosh mongodb://admin:admin123@localhost:27017/ufidesk?authSource=admin

# View all users
db.users.find()

# View superadmin user
db.users.findOne({ username: "superadmin" })
```

---

## 🔐 Default Credentials

**Superadmin Account:**
- Username: `superadmin`
- Password: `password`
- Email: `superadmin@ufidesk.com`
- Role: `SUPERADMIN`

⚠️ **IMPORTANT:** Change the default password after first login!

---

## 🛑 Stopping the Application

### Stop Backend
Press `Ctrl+C` in the terminal running the application

### Stop MongoDB
```bash
docker-compose down
```

### Stop MongoDB and Remove Data
```bash
docker-compose down -v
```

---

## 📝 API Endpoints

### Authentication
- `POST /auth/login` - Login with credentials
- `POST /auth/logout` - Logout and invalidate session
- `GET /auth/status` - Check current session status

### Responses
All responses follow this format:
```json
{
  "success": boolean,
  "message": string,
  "data": any
}
```

### Status Codes
- `200 OK` - Successful request
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication failed or no session
- `403 Forbidden` - Account locked or disabled
- `500 Internal Server Error` - Server error

---

## 🔒 Security Features

✅ BCrypt password hashing  
✅ Account lockout after 5 failed login attempts  
✅ 15-minute lockout duration  
✅ Session management with MongoDB  
✅ User enabled/disabled status checking  
✅ Failed attempt tracking and reset  
✅ Password strength validation (min 8 chars, 3 of: uppercase, lowercase, numbers, special chars)  

---

## 📚 Documentation

For detailed setup information, see `MONGODB_SETUP.md`

For environment configuration, see `src/main/resources/application.yml`

---

## 🐛 Troubleshooting

### MongoDB not starting
```bash
# Check Docker
docker ps

# Check logs
docker-compose logs mongodb

# Restart
docker-compose restart mongodb
```

### Port conflicts
- MongoDB uses port 27017
- Mongo Express uses port 8081
- Application uses port 8080

Change in `docker-compose.yml` if needed.

### Connection refused
Wait 10-15 seconds for MongoDB to fully initialize after starting.

### Reset everything
```bash
# Stop and remove everything including data
docker-compose down -v

# Start fresh
docker-compose up -d
```

---

## 💡 Next Steps

1. ✅ Start MongoDB
2. ✅ Start backend application
3. ✅ Test login with superadmin
4. 📋 Implement additional features:
   - User registration endpoint
   - Password change endpoint
   - User management endpoints
   - Authorization/permission checks

---

## 📧 Support

For issues or questions, refer to:
- Application logs: Check console output
- MongoDB logs: `docker-compose logs mongodb`
- Database UI: http://localhost:8081
