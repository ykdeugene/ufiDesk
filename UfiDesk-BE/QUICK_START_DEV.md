# 🚀 Quick Start: Hot Reload Development Mode

## One-Command Start (Windows PowerShell)

```powershell
.\run-dev.ps1
```

## One-Command Start (Linux/WSL)

```bash
./run-dev.sh
```

---

## What Happens?

✅ MongoDB automatically starts (if not running)  
✅ Spring Boot DevTools enabled  
✅ Hot reload on file changes  
✅ Live reload on browser refresh  
✅ Debug logging enabled  
✅ Health endpoints exposed  

---

## Application URLs

| Purpose | URL |
|---------|-----|
| **API** | http://localhost:8080 |
| **Health Check** | http://localhost:8080/actuator/health |
| **Endpoints Info** | http://localhost:8080/actuator |
| **Authentication** | POST http://localhost:8080/auth/login |

---

## File Changes Trigger Auto-Reload

Make changes to:
- `src/main/java/**/*.java` ← Controller, Service, Model changes
- `src/main/resources/**` ← Config, properties files

Save → App auto-restarts → Test immediately ✨

---

## Example Development Workflow

```
1. Run: .\run-dev.ps1
2. Edit: AuthController.java
3. Save file (Ctrl+S)
4. Watch console: "[*] DevTools restarted successfully"
5. Test: curl http://localhost:8080/auth/status
6. See changes instantly!
```

---

## Stop the Application

Press **Ctrl+C** in the terminal

---

## Manual Start (if scripts don't work)

```bash
./gradlew bootRun --args='--spring.profiles.active=dev'
```

---

## Full Documentation

See: `DEV_MODE_GUIDE.md`
