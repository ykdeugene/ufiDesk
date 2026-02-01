# UfiDesk Backend - Development Hot Reload Guide

## Quick Start

### Option 1: Using PowerShell Script (Windows - Recommended)

```powershell
cd C:\Users\Ufinity\Desktop\Hackathon\ufiDesk\UfiDesk-BE
.\run-dev.ps1
```

The script will:
- ✅ Check if MongoDB is running
- ✅ Start MongoDB via docker-compose if needed
- ✅ Run the Spring Boot application with DevTools enabled
- ✅ Enable live reload on port 35729

### Option 2: Using Bash Script (Linux/WSL)

```bash
cd ~/UfiDesk-BE
chmod +x run-dev.sh
./run-dev.sh
```

### Option 3: Manual Command (All Platforms)

```bash
./gradlew bootRun --args='--spring.profiles.active=dev'
```

On Windows PowerShell:
```powershell
.\gradlew.bat bootRun --args='--spring.profiles.active=dev'
```

---

## What is Hot Reload?

Hot reload (also called hot swap or live reload) means the application automatically restarts and reloads your code changes WITHOUT having to manually stop and restart the server.

### Benefits:
- 🚀 **Faster Development** - See changes instantly
- ⚡ **No Manual Restarts** - Code changes trigger automatic reload
- 💾 **Preserves Session State** - Some state persists between reloads
- 🔍 **Easier Debugging** - Test changes without full rebuild

---

## How It Works

### Spring Boot DevTools

When you run with the `dev` profile, Spring Boot DevTools is automatically enabled:

```yaml
spring:
  devtools:
    restart:
      enabled: true                  # Auto-restart on file changes
      additional-paths: src/         # Watch these directories
      poll-interval: 1000            # Check every 1 second
      quiet-period: 400              # Wait 400ms after change
    livereload:
      enabled: true                  # Live reload browser
      port: 35729                    # Live reload server port
```

### What Triggers a Reload?

Changes to these files automatically trigger a restart:

✅ **Java source files** (`src/main/java/**/*.java`)
- Controller changes
- Service changes
- Model changes
- Configuration changes

✅ **Resource files** (`src/main/resources/**`)
- `application.yml`
- `application-dev.yml`
- Property files
- XML configurations

❌ **NOT reloaded** (requires manual restart):
- `build.gradle` or `pom.xml` (dependency changes)
- `gradlew` or `gradle` wrapper changes
- JVM-level changes

---

## Configuration: Development Profile

The `application-dev.yml` file contains dev-specific settings:

### DevTools Configuration
```yaml
spring:
  devtools:
    restart:
      enabled: true                  # Enable auto-restart
      poll-interval: 1000            # Check for changes every 1s
      quiet-period: 400              # Debounce: wait 400ms after change
    livereload:
      enabled: true                  # Enable browser live reload
      port: 35729                    # Live reload port
```

### Logging
More verbose logging in dev mode for easier debugging:
```yaml
logging:
  level:
    root: INFO
    com.ufidesk: DEBUG              # Your app: DEBUG level
    org.springframework: DEBUG       # Spring framework: DEBUG
    org.springframework.data.mongodb: DEBUG
```

### Extended CORS
Allows connections from multiple local ports:
```yaml
cors:
  allowed-origins: http://localhost:5173,http://localhost:3000,http://localhost:8080
```

### Management Endpoints
All actuator endpoints exposed for monitoring:
```yaml
management:
  endpoints:
    web:
      exposure:
        include: "*"                # All endpoints available
  endpoint:
    health:
      show-details: always          # Show detailed health info
```

---

## Usage Tips

### 1. **Monitor Application Startup**

Watch the console for reload messages:

```
[*] Attaching agents: []
.   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_|\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.4.2)

...

[*] DevTools is watching for file changes...
```

### 2. **Make Changes and Watch Them Reload**

Example: Update a controller method in `AuthController.java`

```java
@GetMapping("/status")
public ResponseEntity<ApiResponse<LoginResponse>> checkSession(HttpServletRequest request) {
    // Make changes here...
    // Save the file...
    // Watch the console - it will auto-restart!
}
```

You'll see:
```
[*] Restarting application
...
[*] DevTools restarted successfully
```

### 3. **View Logs in Real-Time**

The console shows:
- Application startup logs
- Your `@Slf4j` log.info(), log.warn(), log.error() statements
- Spring Framework debug logs
- Database operations (MongoDB queries)

### 4. **Health Check During Development**

Use the health endpoint to check app status:

```bash
curl http://localhost:8080/actuator/health
```

Response:
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "MongoDB"
      }
    }
  }
}
```

---

## Common Issues & Troubleshooting

### Issue 1: "MongoDB Connection Refused"

**Symptoms**: Application fails to start, shows connection error

**Solution**:
```bash
# Check if MongoDB is running
docker ps | grep mongo

# If not running, start it
docker-compose up -d

# Verify connection
mongosh "mongodb://admin:admin123@localhost:27017/ufidesk?authSource=admin"
```

### Issue 2: "Port 8080 Already in Use"

**Symptoms**: `Address already in use` error

**Solution**:
```bash
# Windows PowerShell - Kill process on port 8080
$process = Get-Process | Where-Object { $_.Handles -match "8080" }
Stop-Process -Id $process.Id -Force

# Or change port in application-dev.yml
server:
  port: 8081  # Use different port
```

### Issue 3: "DevTools Not Restarting"

**Symptoms**: Changes aren't being picked up

**Troubleshooting**:
1. Verify file was saved (check editor status)
2. Check that file is in `src/main/java/` or `src/main/resources/`
3. Check console for errors
4. Try a manual restart: Stop and run `.\run-dev.ps1` again

### Issue 4: "Changes Causing Compilation Errors"

**Symptoms**: Application crashes after saving

**Solution**:
1. Check console for error messages
2. Fix the error in your code
3. Save again - DevTools will auto-restart when fixed

---

## Keyboard Shortcuts & Tips

### In IDE (IntelliJ/VS Code)

While running with DevTools:

- **Ctrl+Shift+F9** (IntelliJ) - Recompile and reload
- **Ctrl+S** - Save (triggers automatic reload)
- **F8** - Resume (if paused in debugger)

### Browser Live Reload

If you have Live Reload extension installed:

- Install: [Live Reload Chrome Extension](https://chromewebstore.google.com/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlkl)
- Browser tab auto-refreshes when backend restarts
- Monitor network tab to see reload trigger

---

## Environment Variables

You can override settings via environment variables:

### Windows PowerShell
```powershell
$env:SPRING_PROFILES_ACTIVE = "dev"
$env:SPRING_DATA_MONGODB_URI = "mongodb://admin:admin123@localhost:27017/ufidesk"
.\gradlew.bat bootRun
```

### Linux/Mac/WSL
```bash
export SPRING_PROFILES_ACTIVE=dev
export SPRING_DATA_MONGODB_URI=mongodb://admin:admin123@localhost:27017/ufidesk
./gradlew bootRun
```

---

## Performance Tips

### 1. **Faster Rebuilds**

The `quiet-period: 400` gives a 400ms buffer for batch changes:

```yaml
spring:
  devtools:
    restart:
      quiet-period: 400  # Larger = fewer restarts for rapid changes
```

### 2. **Selective Reloading**

To exclude certain files from triggering reloads:

```yaml
spring:
  devtools:
    restart:
      exclude: "**/*.js,**/*.css,**/*.html"
```

### 3. **Memory Usage**

DevTools has minimal overhead. If you need more resources:

```bash
# Increase heap size
JAVA_OPTS="-Xmx1024m" ./gradlew.bat bootRun
```

---

## Switching to Production Mode

When ready to deploy:

```bash
# Build production JAR
./gradlew clean build

# Run production build (no DevTools)
java -jar build/libs/ufidesk-0.0.1-SNAPSHOT.jar

# Or run with different profile
./gradlew bootRun --args='--spring.profiles.active=prod'
```

---

## Additional Resources

- [Spring Boot DevTools Documentation](https://docs.spring.io/spring-boot/reference/using/devtools.html)
- [Spring Boot Profiles](https://docs.spring.io/spring-boot/reference/features/profiles.html)
- [Live Reload Browser Extensions](https://livereload.com/extensions/)

---

## Summary

| Method | Command | Notes |
|--------|---------|-------|
| **PowerShell (Recommended)** | `.\run-dev.ps1` | Auto-checks MongoDB, user-friendly |
| **Bash** | `./run-dev.sh` | For Linux/WSL |
| **Manual Gradle** | `.\gradlew.bat bootRun --args='--spring.profiles.active=dev'` | Direct control |
| **IDE** | Run → Edit Configuration → Add profile `dev` | Integrated development |

---

**Happy coding!** 🚀
