# MongoDB Setup Guide for UfiDesk Backend

## Overview
This guide explains how to set up MongoDB collections for the UfiDesk application and create a superadmin account.

## Database Structure

### Collections

#### 1. **users** Collection
Stores user account information with security fields.

**Fields:**
- `_id` (ObjectId): Unique identifier
- `username` (String, Unique): Login username
- `passwordHash` (String): BCrypt hashed password
- `email` (String): User email address
- `role` (String): User role (SUPERADMIN, ADMIN, USER)
- `enabled` (Boolean): Account enabled status
- `createdAt` (Date): Account creation timestamp
- `lastLogin` (Date, Nullable): Last successful login timestamp
- `failedLoginAttempts` (Int): Counter for failed login attempts
- `accountLockedUntil` (Date, Nullable): Account lock expiration time

**Indexes:**
- `username` (Unique): For fast username lookup
- `role`: For role-based queries
- `enabled`: For active user queries
- `createdAt`: For sorting users by creation date

#### 2. **SPRING_SESSION** Collection
Manages HTTP session storage (Spring Session with MongoDB).

#### 3. **SPRING_SESSION_ATTRIBUTES** Collection
Stores session attributes.

---

## Setup Methods

### Method 1: Automatic Setup with Docker Compose (Recommended)

When you start MongoDB with Docker Compose, the `init-mongo.js` script runs automatically:

```bash
# Start MongoDB and Mongo Express
docker-compose up -d

# Wait for MongoDB to initialize (usually 10-15 seconds)
# Check logs to confirm initialization
docker-compose logs mongodb
```

The initialization script will:
1. Create all required collections
2. Set up indexes
3. Insert the superadmin user

**Superadmin Credentials:**
- Username: `superadmin`
- Password: `password`
- Email: `superadmin@ufidesk.com`
- Role: `SUPERADMIN`

---

### Method 2: Manual Setup with PowerShell (Windows)

If you need to set up the database manually:

```powershell
# Run the PowerShell setup script
.\setup-mongodb.ps1

# Or just view the script without executing
.\setup-mongodb.ps1 -ShowScriptOnly
```

---

### Method 3: Manual Setup with Mongosh

If using mongosh directly:

```bash
# Connect to MongoDB
mongosh mongodb://admin:admin123@localhost:27017/ufidesk?authSource=admin

# Run the initialization commands manually
```

Copy the JavaScript commands from `init-mongo.js` and paste them into the mongosh shell.

---

### Method 4: Using Mongo Express GUI

1. Open http://localhost:8081 in your browser
2. Navigate to the `ufidesk` database
3. Create collections manually:
   - `users`
   - `SPRING_SESSION`
   - `SPRING_SESSION_ATTRIBUTES`
4. Insert the superadmin document:

```json
{
  "_id": ObjectId(),
  "username": "superadmin",
  "passwordHash": "$2a$10$s0tM/w9pKJY3KjJ3lGKkpe8Mk1f1RVxfI0EYRzQzXl/xvkAFaKLZG",
  "email": "superadmin@ufidesk.com",
  "role": "SUPERADMIN",
  "enabled": true,
  "createdAt": new Date(),
  "lastLogin": null,
  "failedLoginAttempts": 0,
  "accountLockedUntil": null
}
```

---

## Verify Setup

### Check Collections in Mongo Express

1. Open http://localhost:8081
2. Select database: `ufidesk`
3. You should see:
   - `users` collection with 1 document (superadmin)
   - `SPRING_SESSION` collection
   - `SPRING_SESSION_ATTRIBUTES` collection

### Test Login

```bash
# After starting the backend application
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "password"
  }'
```

Expected response:
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

---

## Security Notes

### Password Hashing
- All passwords are hashed using **BCrypt** with 10 salt rounds
- The superadmin password "password" is hashed as: `$2a$10$s0tM/w9pKJY3KjJ3lGKkpe8Mk1f1RVxfI0EYRzQzXl/xvkAFaKLZG`
- **Never store plaintext passwords**
- **Change the default superadmin password after first login** (a password change endpoint should be implemented)

### Account Lockout
- After 5 failed login attempts, the account is locked for 15 minutes
- The `accountLockedUntil` field tracks the lock expiration time
- Failed attempt counter is reset on successful login

### MongoDB Credentials
- Database: `ufidesk`
- Username: `admin`
- Password: `admin123`
- **Change these credentials in production!**

---

## Creating Additional Users

Once the backend is running, you can create users via API or using the UserService:

### Via Application Code
```java
userService.createUser("username", "password", "user@email.com", "USER");
```

The service validates:
- Username uniqueness
- Password strength (min 8 chars with 3 of: uppercase, lowercase, numbers, special chars)
- Proper BCrypt hashing

---

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
docker-compose ps

# View MongoDB logs
docker-compose logs mongodb

# Verify connection
mongosh mongodb://admin:admin123@localhost:27017/ufidesk?authSource=admin
```

### Reset Database
```bash
# Remove MongoDB volume and data
docker-compose down -v

# Start fresh (collections and superadmin will be recreated)
docker-compose up -d
```

### Superadmin Already Exists
If you get a duplicate key error when reinitializing:
```bash
# Connect to MongoDB and delete the existing user
db.users.deleteOne({ username: "superadmin" })

# Then rerun the init script
```

---

## Files Reference

- `init-mongo.js` - Automatic initialization script (runs on Docker startup)
- `setup-mongodb.ps1` - Windows PowerShell setup script
- `setup-mongodb.sh` - Bash setup script for Linux/macOS
- `docker-compose.yml` - Updated with init script volume mount

---

## Next Steps

1. Start MongoDB: `docker-compose up -d`
2. Wait for initialization (check logs)
3. Start the backend application
4. Login with superadmin credentials
5. Create additional user accounts as needed
