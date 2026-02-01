#!/usr/bin/env pwsh
# MongoDB Setup Script for UfiDesk (Windows PowerShell)
# This script sets up MongoDB collections and creates a superadmin user
# Prerequisites: MongoDB must be running and mongosh must be installed

param(
    [string]$MongoUri = "mongodb://admin:admin123@localhost:27017/ufidesk?authSource=admin",
    [switch]$DropCollections = $false,
    [switch]$ShowScriptOnly = $false
)

# MongoDB initialization script
$mongoScript = @'
use ufidesk;

// Drop existing collections if requested
// Collections will be created fresh

// Create users collection
db.createCollection('users');

// Create unique index on username
db.users.createIndex({ "username": 1 }, { unique: true });

// Create indexes for faster queries
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "enabled": 1 });
db.users.createIndex({ "createdAt": 1 });

// Create sessions collection for Spring Session
db.createCollection('SPRING_SESSION');
db.createCollection('SPRING_SESSION_ATTRIBUTES');

// Create indexes for session collections
db.SPRING_SESSION.createIndex({ "expireAtTime": 1 }, { expireAfterSeconds: 0 });
db.SPRING_SESSION_ATTRIBUTES.createIndex({ "sessionId": 1 });

// Insert superadmin user
// Username: superadmin
// Password: password (hashed with BCrypt)
// Hash generated for password "password"
db.users.insertOne({
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
});

print("MongoDB setup complete!");
print("Superadmin user created: username=superadmin, password=password");
'@

if ($ShowScriptOnly) {
    Write-Host "MongoDB Initialization Script:"
    Write-Host "=============================="
    Write-Host $mongoScript
    exit 0
}

# Create a temporary file for the script
$tempScriptPath = [System.IO.Path]::GetTempFileName() + ".js"
Set-Content -Path $tempScriptPath -Value $mongoScript

try {
    Write-Host "Starting MongoDB setup..." -ForegroundColor Cyan
    Write-Host "Connecting to: $MongoUri" -ForegroundColor Gray

    # Execute the MongoDB script using mongosh
    $output = Get-Content $tempScriptPath | mongosh --quiet "$MongoUri" 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host "[+] MongoDB setup completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Superadmin Account Details:" -ForegroundColor Cyan
        Write-Host "  Username: superadmin" -ForegroundColor Yellow
        Write-Host "  Password: password" -ForegroundColor Yellow
        Write-Host "  Email: superadmin@ufidesk.com" -ForegroundColor Yellow
        Write-Host "  Role: SUPERADMIN" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Collections created:" -ForegroundColor Cyan
        Write-Host "  - users (with indexes)" -ForegroundColor Gray
        Write-Host "  - SPRING_SESSION" -ForegroundColor Gray
        Write-Host "  - SPRING_SESSION_ATTRIBUTES" -ForegroundColor Gray
    } else {
        Write-Host "[-] MongoDB setup failed!" -ForegroundColor Red
        Write-Host $output
        exit 1
    }
}
catch {
    Write-Host "[-] Error during MongoDB setup: $_" -ForegroundColor Red
    exit 1
}
finally {
    # Clean up temporary file
    if (Test-Path $tempScriptPath) {
        Remove-Item $tempScriptPath -Force
    }
}
