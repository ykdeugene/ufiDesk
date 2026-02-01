#!/usr/bin/env pwsh

# MongoDB Index Fix Script
# Drops the old username_1 index and ensures email_1 index exists

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          MongoDB Index Migration - Drop username_1             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$mongoUri = "mongodb://admin:admin123@localhost:27017/ufidesk?authSource=admin"

# Create the MongoDB commands to execute
$commands = @"
// Drop the old username_1 index
db.users.dropIndex("username_1");

// Verify email index exists
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "enabled": 1 });

// List all indexes
print("\nCurrent indexes:");
db.users.getIndexes().forEach(idx => {
    print("  - " + JSON.stringify(idx.key));
});
"@

Write-Host "[*] Executing MongoDB commands..." -ForegroundColor Yellow
Write-Host "[*] Command: Drop username_1 index" -ForegroundColor Gray
Write-Host "[*] Command: Recreate email_1 index" -ForegroundColor Gray
Write-Host "[*] Command: List all indexes" -ForegroundColor Gray

# Execute the commands
try {
    $output = $commands | mongosh $mongoUri 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n[+] MongoDB index migration completed successfully!" -ForegroundColor Green
        Write-Host "`n✅ Old username_1 index dropped" -ForegroundColor Green
        Write-Host "✅ Email index verified/created" -ForegroundColor Green
        Write-Host "`n[*] Output:" -ForegroundColor Cyan
        Write-Host $output
    } else {
        Write-Host "`n[-] Migration failed!" -ForegroundColor Red
        Write-Host $output
    }
} catch {
    Write-Host "`n[-] Error executing mongosh: $_" -ForegroundColor Red
    Write-Host "`n[*] Make sure MongoDB is running and mongosh is installed." -ForegroundColor Yellow
}

Write-Host "`n[*] You can now try creating a new user again." -ForegroundColor Cyan
