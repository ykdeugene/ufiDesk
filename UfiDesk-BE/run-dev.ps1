# UfiDesk Backend - Development Hot Reload Script
# This script runs the Spring Boot application with DevTools enabled for hot reload

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                                ║" -ForegroundColor Cyan
Write-Host "║         UfiDesk Backend - Development Hot Reload Mode          ║" -ForegroundColor Cyan
Write-Host "║                                                                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`n[*] Checking for required services..." -ForegroundColor Yellow

# Check if MongoDB is running
$mongoRunning = $false
try {
    $null = Get-Process mongod -ErrorAction Stop
    $mongoRunning = $true
    Write-Host "[+] MongoDB is running" -ForegroundColor Green
} catch {
    Write-Host "[-] MongoDB is NOT running!" -ForegroundColor Red
    Write-Host "    Start MongoDB before running the application." -ForegroundColor Yellow
    Write-Host "    Run: docker-compose up -d" -ForegroundColor Yellow
}

if (-not $mongoRunning) {
    Write-Host "`n[?] Do you want to start MongoDB via docker-compose? (y/n)" -ForegroundColor Cyan
    $response = Read-Host
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Host "[*] Starting MongoDB..." -ForegroundColor Yellow
        docker-compose up -d
        Start-Sleep -Seconds 3
    } else {
        Write-Host "[-] Cannot continue without MongoDB. Exiting." -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n[*] Starting Spring Boot application with DevTools..." -ForegroundColor Yellow
Write-Host "    Profile: dev" -ForegroundColor Cyan
Write-Host "    Hot Reload: Enabled" -ForegroundColor Cyan
Write-Host "    Live Reload: Enabled (port 35729)" -ForegroundColor Cyan
Write-Host "`n[*] Application will be available at: http://localhost:8080" -ForegroundColor Green
Write-Host "[*] Swagger UI: http://localhost:8080/swagger-ui.html" -ForegroundColor Green
Write-Host "`n[*] Watch for changes in:" -ForegroundColor Cyan
Write-Host "    - src/main/java/" -ForegroundColor White
Write-Host "    - src/main/resources/" -ForegroundColor White
Write-Host "`n[*] Press Ctrl+C to stop the application`n" -ForegroundColor Yellow

# Run with dev profile
& .\gradlew.bat bootRun --args='--spring.profiles.active=dev'

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[-] Application failed to start!" -ForegroundColor Red
    Write-Host "[*] Check the logs above for errors." -ForegroundColor Yellow
}
