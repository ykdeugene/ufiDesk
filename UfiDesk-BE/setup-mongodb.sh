#!/bin/bash
# MongoDB Setup Script for UfiDesk
# This script sets up MongoDB collections and creates a superadmin user
# Run this after MongoDB is running: mongosh -u admin -p admin123 localhost:27017/admin < setup-mongodb.sh

# Connect to ufidesk database
use ufidesk;

// Drop existing collections if they exist (optional - for fresh setup)
// db.users.drop();
// db.SPRING_SESSION.drop();
// db.SPRING_SESSION_ATTRIBUTES.drop();

// Create users collection with validation
db.createCollection('users', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['username', 'passwordHash', 'role', 'enabled'],
            properties: {
                _id: { bsonType: 'objectId' },
                username: {
                    bsonType: 'string',
                    description: 'Unique username'
                },
                passwordHash: {
                    bsonType: 'string',
                    description: 'BCrypt hashed password'
                },
                email: {
                    bsonType: 'string',
                    description: 'User email address'
                },
                role: {
                    bsonType: 'string',
                    enum: ['SUPERADMIN', 'ADMIN', 'USER'],
                    description: 'User role'
                },
                enabled: {
                    bsonType: 'bool',
                    description: 'Account enabled status'
                },
                createdAt: {
                    bsonType: 'date',
                    description: 'Account creation timestamp'
                },
                lastLogin: {
                    bsonType: ['date', 'null'],
                    description: 'Last login timestamp'
                },
                failedLoginAttempts: {
                    bsonType: 'int',
                    description: 'Failed login attempt counter'
                },
                accountLockedUntil: {
                    bsonType: ['date', 'null'],
                    description: 'Account lock expiration timestamp'
                }
            }
        }
    }
});

// Create unique index on username
db.users.createIndex({ 'username': 1 }, { unique: true });

// Create indexes for faster queries
db.users.createIndex({ 'role': 1 });
db.users.createIndex({ 'enabled': 1 });
db.users.createIndex({ 'createdAt': 1 });

// Create sessions collection for Spring Session
db.createCollection('SPRING_SESSION');
db.createCollection('SPRING_SESSION_ATTRIBUTES');

// Create indexes for session collections
db.SPRING_SESSION.createIndex({ 'expireAtTime': 1 }, { expireAfterSeconds: 0 });
db.SPRING_SESSION_ATTRIBUTES.createIndex({ 'sessionId': 1 });

// Insert superadmin user
// Username: superadmin
// Password: password
// BCrypt hash of "password" with 10 rounds: $2a$10$s0tM/w9pKJY3KjJ3lGKkpe8Mk1f1RVxfI0EYRzQzXl/xvkAFaKLZG
db.users.insertOne({
    username: 'superadmin',
    passwordHash: '$2a$10$s0tM/w9pKJY3KjJ3lGKkpe8Mk1f1RVxfI0EYRzQzXl/xvkAFaKLZG',
    email: 'superadmin@ufidesk.com',
    role: 'SUPERADMIN',
    enabled: true,
    createdAt: new Date(),
    lastLogin: null,
    failedLoginAttempts: 0,
    accountLockedUntil: null
});

print('MongoDB setup complete!');
print('Collections created: users, SPRING_SESSION, SPRING_SESSION_ATTRIBUTES');
print('Superadmin user created:');
print('  Username: superadmin');
print('  Password: password');
print('  Email: superadmin@ufidesk.com');
print('  Role: SUPERADMIN');
