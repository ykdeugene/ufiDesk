// Initialize MongoDB collections and create superadmin user
// This script runs when MongoDB container starts

// Use the ufidesk database
db = db.getSiblingDB('ufidesk');

// Create users collection with indexes
db.createCollection('users');

// Create unique index on email (email is now the login identifier)
db.users.createIndex({ "email": 1 }, { unique: true });

// Create index on role for faster queries
db.users.createIndex({ "role": 1 });

// Create index on enabled status
db.users.createIndex({ "enabled": 1 });

// Create sessions collection for Spring Session
db.createCollection('SPRING_SESSION');
db.createCollection('SPRING_SESSION_ATTRIBUTES');

// Create indexes for session collections
db.SPRING_SESSION.createIndex({ "expireAtTime": 1 }, { expireAfterSeconds: 0 });
db.SPRING_SESSION_ATTRIBUTES.createIndex({ "sessionId": 1 });

// Insert superadmin user with BCrypt hashed password for "password"
// BCrypt hash of "password": $2a$12$GIkjT97dU7JnJkAGnjzDF.o94Q0yOIPIBsvzOiwZrPb1V7DavXUTS
// Generated using BCrypt with salt rounds = 10
db.users.insertOne({
    "_id": ObjectId(),
    "email": "superadmin@ufidesk.com",
    "passwordHash": "$2a$12$GIkjT97dU7JnJkAGnjzDF.o94Q0yOIPIBsvzOiwZrPb1V7DavXUTS",
    "role": "SUPERADMIN",
    "admin": true,
    "enabled": true,
    "createdAt": new Date(),
    "lastLogin": null,
    "failedLoginAttempts": 0,
    "accountLockedUntil": null
});

print("Database initialization complete!");
print("Created collections: users, SPRING_SESSION, SPRING_SESSION_ATTRIBUTES");
print("Superadmin user created with email: 'superadmin@ufidesk.com', password: 'password'");
