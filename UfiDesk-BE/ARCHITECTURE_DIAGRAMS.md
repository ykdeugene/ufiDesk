# Development Hot Reload Architecture & Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     UfiDesk Backend (Dev Mode)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────┐         ┌──────────────────┐                │
│  │   Your IDE     │         │  Spring Boot     │                │
│  │  (IntelliJ)    │         │  Application     │                │
│  │                │         │  (port 8080)     │                │
│  │ ┌────────────┐ │  Ctrl+S │ ┌──────────────┐ │                │
│  │ │ Edit Code  │─┼────────>│ │ DevTools     │ │                │
│  │ │ Save File  │ │         │ │              │ │                │
│  │ └────────────┘ │         │ ├──────────────┤ │                │
│  │                │         │ │ • Restart    │ │                │
│  │ ┌────────────┐ │  Auto   │ │ • Live Reload│ │                │
│  │ │ Console    │<┼────────>│ │ • Debug      │ │                │
│  │ │ Output     │ │ logs    │ └──────────────┘ │                │
│  │ └────────────┘ │         │                  │                │
│  └────────────────┘         └──────────────────┘                │
│        ▲                            ▲                            │
│        │                            │                            │
│        └────────────────────────────┘                            │
│              File System Watcher                                 │
│         (Detects changes: 1s interval)                           │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────┐         ┌──────────────────┐                │
│  │   Browser      │         │    MongoDB       │                │
│  │ (localhost)    │         │  (Docker)        │                │
│  │                │         │                  │                │
│  │ http://        │────────>│ User Data        │                │
│  │ localhost:8080 │<────────│ Sessions         │                │
│  │                │         │ Collections      │                │
│  └────────────────┘         └──────────────────┘                │
│        ▲                                                          │
│        │ Live Reload (optional)                                 │
│        │ port 35729                                             │
│        └────────────────────────────────────────────────────────│
└─────────────────────────────────────────────────────────────────┘
```

## Hot Reload Workflow

```
1️⃣ DEVELOPMENT
   ┌─────────────────────┐
   │ Edit Java File      │
   │ src/main/java/...   │
   └──────────┬──────────┘
              │
2️⃣ SAVE
   ┌─────────────────────┐
   │ Save File (Ctrl+S)  │
   └──────────┬──────────┘
              │
3️⃣ DETECTION (1 second)
   ┌─────────────────────┐
   │ DevTools Watches:   │
   │ • src/main/java/    │
   │ • src/main/res/     │
   └──────────┬──────────┘
              │
4️⃣ COMPILATION
   ┌─────────────────────┐
   │ Compile Changes     │
   │ Check Dependencies  │
   └──────────┬──────────┘
              │
5️⃣ RESTART (2 seconds)
   ┌─────────────────────┐
   │ Stop Old Instance   │
   │ Start New Instance  │
   │ Load New Classes    │
   └──────────┬──────────┘
              │
6️⃣ SUCCESS
   ┌─────────────────────┐
   │ ✅ Ready for Test   │
   │ Changes Are LIVE!   │
   └─────────────────────┘
```

## File Change Detection Flow

```
Your Code                Spring Boot             DevTools            Console
   │                        │                       │                   │
   │ Save File              │                       │                   │
   ├──────────────────────>│                       │                   │
   │                        │                       │                   │
   │                        │ Poll (every 1s)       │                   │
   │                        │<──────────────────────│                   │
   │                        │                       │                   │
   │                        │ Change Detected       │                   │
   │                        │<──────────────────────│                   │
   │                        │                       │                   │
   │                        │ Wait (quiet-period)   │                   │
   │                        ├─────── 400ms ────────>│                   │
   │                        │                       │                   │
   │                        │ Compile Classes       │                   │
   │                        ├─────── 1-2s ────────>│                   │
   │                        │                       │                   │
   │                        │ Restart Application   │                   │
   │                        │<──────────────────────│                   │
   │                        │                       │  [*] Restarting   │
   │                        │                       │<─────────────────>│
   │                        │                       │                   │
   │                        │ Startup Sequence      │  [*] Started in   │
   │                        ├──────────────────────>│  2.5 seconds      │
   │                        │                       │<─────────────────>│
   │                        │                       │  ✅ DevTools      │
   │                        │                       │  restarted OK     │
   │                        │                       │<─────────────────>│
   │                        │ Ready for Requests    │                   │
   │                        ├──────────────────────>│                   │
```

## Configuration Hierarchy

```
Application Startup
        │
        ├─ spring.profiles.active = "dev"
        │   (from --args='--spring.profiles.active=dev')
        │
        ├─ Load application.yml (base config)
        │   ├─ Server port: 8080
        │   ├─ MongoDB URI
        │   └─ CORS settings
        │
        └─ Load application-dev.yml (dev overrides)
            ├─ Enable DevTools
            │   ├─ restart.enabled = true
            │   ├─ poll-interval = 1000ms
            │   ├─ quiet-period = 400ms
            │   └─ livereload.enabled = true
            │
            ├─ Debug Logging
            │   ├─ com.ufidesk = DEBUG
            │   ├─ org.springframework = DEBUG
            │   └─ org.springframework.data = DEBUG
            │
            ├─ Actuator Endpoints
            │   ├─ /actuator/health
            │   ├─ /actuator/metrics
            │   └─ /actuator/env
            │
            └─ Extended CORS
                └─ localhost:5173, :3000, :8080
```

## Directory Structure

```
UfiDesk-BE/
│
├─ 📄 run-dev.ps1                    ← PowerShell Script
├─ 📄 run-dev.sh                     ← Bash Script
│
├─ build.gradle                      ← Dependencies
│   └─ spring-boot-devtools (line 43)
│
├─ src/
│   └─ main/
│       ├─ java/
│       │   └─ com/ufidesk/
│       │       ├─ controller/          ← Auto-reload
│       │       ├─ service/             ← Auto-reload
│       │       ├─ model/               ← Auto-reload
│       │       └─ security/            ← Auto-reload
│       │
│       └─ resources/
│           ├─ 📄 application.yml          ← Base config
│           └─ 📄 application-dev.yml      ← Dev config (AUTO-RELOAD)
│
└─ 📚 Documentation/
    ├─ START_HERE.md
    ├─ QUICK_START_DEV.md
    ├─ DEV_MODE_GUIDE.md
    ├─ IDE_RUN_CONFIGURATION.md
    └─ SETUP_COMPLETION_CHECKLIST.md
```

## Performance Timeline

```
Timeline (seconds)
│
0s  ├─ You Save File (Ctrl+S)
    │
1s  ├─ DevTools Detects Change
    │  └─ Watches: src/main/java/**, src/main/resources/**
    │
1.4s├─ Compilation Complete
    │  └─ Java files compiled to bytecode
    │
1.8s├─ Restart Initiated
    │  ├─ Stop old Spring context
    │  └─ Start new Spring context
    │
3s  ├─ ✅ APPLICATION READY
    │  └─ New code is live!
    │
    ├─ Tests run against new code
    ├─ Breakpoints still active
    └─ Sessions may persist (depending on config)
```

## Auto-Reload Triggers vs Manual Restart

```
╔════════════════════════════════════════════════════════════╗
║                    AUTO-RELOAD (✅)                        ║
╠════════════════════════════════════════════════════════════╣
║ Save: src/main/java/AuthController.java                   ║
║ Result: Restart in ~3s, changes live                       ║
║                                                            ║
║ Save: src/main/resources/application-dev.yml              ║
║ Result: Restart in ~3s, new config active                 ║
║                                                            ║
║ Edit: Field in User.java                                  ║
║ Result: Restart in ~3s, new fields available              ║
╠════════════════════════════════════════════════════════════╣
║                  MANUAL RESTART (⚠️)                       ║
╠════════════════════════════════════════════════════════════╣
║ Edit: build.gradle (add dependency)                       ║
║ Action: Stop app (Ctrl+C), re-run script                  ║
║                                                            ║
║ Edit: Gradle wrapper                                      ║
║ Action: Stop app, re-run script                           ║
║                                                            ║
║ Add: New annotation that needs processing                 ║
║ Action: May need: ./gradlew clean, then re-run            ║
╚════════════════════════════════════════════════════════════╝
```

## Debugging Integration

```
┌─────────────────────────────────────────────────────────────┐
│              IDE with DevTools Debugging                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 1. Set Breakpoint in Code                                  │
│    authController.java line 42 ← Click to set breakpoint   │
│                                                              │
│ 2. Start Debugger                                          │
│    ▶️ Debug button (Shift+F9)                               │
│                                                              │
│ 3. Make Request                                            │
│    curl http://localhost:8080/auth/status                 │
│                                                              │
│ 4. Hit Breakpoint                                          │
│    ⏸️ Debugger pauses at line 42                            │
│                                                              │
│ 5. Inspect Variables                                       │
│    - Watch panel shows all local variables                 │
│    - Modify values if needed                               │
│                                                              │
│ 6. Step Through Code                                       │
│    F7: Step Into                                           │
│    F8: Step Over                                           │
│    Shift+F8: Step Out                                      │
│                                                              │
│ 7. Make Code Change (Optional)                             │
│    - Edit code while paused                                │
│    - Save file                                             │
│    - DevTools restarts with new code                       │
│    - Debugger reconnects automatically                     │
│                                                              │
│ 8. Continue Execution                                      │
│    ▶️ Continue (F9)                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Request Flow (With Hot Reload)

```
Client                 Spring Boot                Database
 │                         │                         │
 │ POST /auth/login        │                         │
 ├────────────────────────>│                         │
 │                         │                         │
 │                         │ Authenticate            │
 │                         │ (new code if reloaded)  │
 │                         │                         │
 │                         │ Query User              │
 │                         ├────────────────────────>│
 │                         │                         │
 │                         │ User Data               │
 │                         │<────────────────────────┤
 │                         │                         │
 │                         │ Process (new code)      │
 │                         │                         │
 │ 200 OK                  │                         │
 │<────────────────────────┤                         │
 │ { email, role, token }  │                         │
 │                         │                         │
```

---

**This architecture allows for rapid development with instant feedback!** 🚀
