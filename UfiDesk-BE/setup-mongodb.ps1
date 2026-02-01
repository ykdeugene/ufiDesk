#!/usr/bin/env pwsh
param(
    [string]$MongoUri = "mongodb://admin:admin123@localhost:27017/ufidesk?authSource=admin",
    [switch]$DropCollections = $false,
    [switch]$ShowScriptOnly = $false
)

$dropFlag = if ($DropCollections) { "true" } else { "false" }

$mongoScript = @"
use ufidesk;

// Drop existing collections if requested
const dropCollections = $dropFlag;
if (dropCollections) {
    print('Dropping existing collections...');
    db.users.drop();
    db.SPRING_SESSION.drop();
    db.SPRING_SESSION_ATTRIBUTES.drop();
}

// Create users collection
db.createCollection('users');
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "enabled": 1 });
db.users.createIndex({ "createdAt": 1 });

// Create sessions collection
db.createCollection('SPRING_SESSION');
db.createCollection('SPRING_SESSION_ATTRIBUTES');
db.SPRING_SESSION.createIndex({ "expireAtTime": 1 }, { expireAfterSeconds: 0 });
db.SPRING_SESSION_ATTRIBUTES.createIndex({ "sessionId": 1 });

// Insert superadmin user
// BCrypt hash for password: "password"
db.users.insertOne({
    "_id": ObjectId(),
    "email": "superadmin@ufidesk.com",
    "passwordHash": "`$2a`$10`$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
    "role": "SUPERADMIN",
    "enabled": true,
    "createdAt": new Date(),
    "lastLogin": null,
    "failedLoginAttempts": 0,
    "accountLockedUntil": null
});

print("MongoDB setup complete!");
print("Superadmin user created:");
print("  Email: superadmin@ufidesk.com");
print("  Password: password");
print("  Role: SUPERADMIN");
"@

if ($ShowScriptOnly) {
    Write-Host "MongoDB Initialization Script:" -ForegroundColor Cyan
    Write-Host "==============================" -ForegroundColor Cyan
    Write-Host $mongoScript
    exit 0
}

$tempScriptPath = [System.IO.Path]::GetTempFileName() + ".js"
Set-Content -Path $tempScriptPath -Value $mongoScript

try {
    Write-Host "Starting MongoDB setup..." -ForegroundColor Cyan
    Write-Host "Connecting to: $MongoUri" -ForegroundColor Gray

    $output = Get-Content $tempScriptPath | mongosh --quiet "$MongoUri" 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n[+] MongoDB setup completed successfully!" -ForegroundColor Green
        Write-Host "`nSuperadmin Account Details:" -ForegroundColor Cyan
        Write-Host "  Email: superadmin@ufidesk.com" -ForegroundColor Yellow
        Write-Host "  Password: password" -ForegroundColor Yellow
        Write-Host "  Role: SUPERADMIN" -ForegroundColor Yellow
        Write-Host "`nCollections created:" -ForegroundColor Cyan
        Write-Host "  - users (with indexes)" -ForegroundColor Gray
        Write-Host "  - SPRING_SESSION" -ForegroundColor Gray
        Write-Host "  - SPRING_SESSION_ATTRIBUTES" -ForegroundColor Gray
    } else {
        Write-Host "`n[-] MongoDB setup failed!" -ForegroundColor Red
        Write-Host "Output:" -ForegroundColor Yellow
        Write-Host $output
    }
}
catch {
    Write-Host "`n[-] Error: $_" -ForegroundColor Red
    exit 1
}
finally {
    if (Test-Path $tempScriptPath) {
        Remove-Item $tempScriptPath -Force
    }
}
