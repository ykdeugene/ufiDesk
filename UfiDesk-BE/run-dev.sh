#!/bin/bash

# UfiDesk Backend - Development Hot Reload Script
# This script runs the Spring Boot application with DevTools enabled for hot reload

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║         UfiDesk Backend - Development Hot Reload Mode          ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"

echo ""
echo "[*] Checking for required services..."

# Check if MongoDB is running
if command -v docker &> /dev/null && docker ps | grep -q mongo; then
    echo "[+] MongoDB is running"
else
    echo "[-] MongoDB is NOT running!"
    echo "    Start MongoDB before running the application."
    echo "    Run: docker-compose up -d"
    echo ""
    read -p "[?] Do you want to start MongoDB via docker-compose? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "[*] Starting MongoDB..."
        docker-compose up -d
        sleep 3
    else
        echo "[-] Cannot continue without MongoDB. Exiting."
        exit 1
    fi
fi

echo ""
echo "[*] Starting Spring Boot application with DevTools..."
echo "    Profile: dev"
echo "    Hot Reload: Enabled"
echo "    Live Reload: Enabled (port 35729)"
echo ""
echo "[*] Application will be available at: http://localhost:8080"
echo "[*] Swagger UI: http://localhost:8080/swagger-ui.html"
echo ""
echo "[*] Watch for changes in:"
echo "    - src/main/java/"
echo "    - src/main/resources/"
echo ""
echo "[*] Press Ctrl+C to stop the application"
echo ""

# Run with dev profile
./gradlew bootRun --args='--spring.profiles.active=dev'

if [ $? -ne 0 ]; then
    echo ""
    echo "[-] Application failed to start!"
    echo "[*] Check the logs above for errors."
fi
