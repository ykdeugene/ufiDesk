# Running Dev Hot Reload from IntelliJ IDEA

## Method 1: Using Run Configuration (Recommended)

### Step 1: Open Run Configurations
1. Click **Run** → **Edit Configurations...**
2. Click **+** to add new configuration
3. Select **Gradle** → Click **OK**

### Step 2: Configure Gradle Task
Set the following:

| Field | Value |
|-------|-------|
| **Name** | UfiDesk Backend (Dev) |
| **Gradle Project** | UfiDesk-BE |
| **Tasks** | `bootRun` |
| **Arguments** | `--args='--spring.profiles.active=dev'` |
| **VM options** | (leave empty) |

### Step 3: Run
1. Select **UfiDesk Backend (Dev)** from the run dropdown
2. Click **Run** (green play button) or press **Shift+F10**

---

## Method 2: Using Gradle Tool Window

### Step 1: Open Gradle Tool
- **View** → **Tool Windows** → **Gradle**

### Step 2: Navigate Tasks
In the Gradle panel:
```
UfiDesk-BE
└── Tasks
    └── application
        └── bootRun
```

### Step 3: Run with Arguments
Right-click **bootRun** → **Run with Arguments**

Enter: `--args='--spring.profiles.active=dev'`

---

## Method 3: Terminal in IntelliJ

### Step 1: Open Terminal
- **View** → **Tool Windows** → **Terminal**
- Or press **Alt+F12**

### Step 2: Run Command
```powershell
.\gradlew.bat bootRun --args='--spring.profiles.active=dev'
```

Or simply run the script:
```powershell
.\run-dev.ps1
```

---

## Enable IDE Debugging

Once running, you can set breakpoints:

1. **Set Breakpoint**: Click in left margin next to code line
2. **Debug**: Click debugger icon instead of run
3. **Step Through**: Use F7/F8/F9 to step through code

### Breakpoint Shortcuts
- **F9**: Resume execution
- **F7**: Step into
- **F8**: Step over
- **Shift+F8**: Step out

---

## Hot Reload While Debugging

When running with DevTools and you make a code change:

1. **Save file** (Ctrl+S)
2. **App auto-restarts**
3. **Breakpoints remain active** (in same methods)
4. **Continue debugging**

---

## Useful Shortcuts

| Shortcut | Action |
|----------|--------|
| **Shift+F10** | Run current configuration |
| **Shift+F9** | Debug current configuration |
| **Ctrl+F2** | Stop application |
| **Alt+F12** | Toggle Terminal |
| **Ctrl+Shift+F10** | Re-run last configuration |

---

## IDE Console Features

Once running, IntelliJ shows:

### Console Tab
- Application startup logs
- All `System.out` output
- All `log.info()`, `log.warn()`, `log.error()` statements

### Variables Tab (when debugging)
- All local variables
- Object properties
- Stack trace

### Breakpoints Tab
- Manage breakpoints
- Enable/disable conditions
- Set conditional breakpoints

---

## Live Reload in Browser

To auto-refresh browser when app restarts:

1. **Install Browser Extension**:
   - [Chrome Live Reload](https://chromewebstore.google.com/detail/livereload)
   - [Firefox Live Reload](https://addons.mozilla.org/en-US/firefox/addon/livereload-web-extension/)

2. **Enable in Browser Tab**
   - Click extension icon to enable live reload
   - Visit `http://localhost:8080`

3. **Watch Auto-Refresh**
   - Make a Java change
   - Save (Ctrl+S)
   - Browser automatically refreshes ✨

---

## Code Coverage While Testing

IntelliJ can show code coverage:

1. **Run** → **Run with Coverage**
2. See coverage percentages in editor gutter
3. Helps identify untested code paths

---

## Troubleshooting in IDE

### Issue: "Cannot Find Gradle"
**Solution**: 
- **File** → **Settings** → **Build, Execution, Deployment** → **Gradle**
- Set **Gradle JVM** to Java 17+

### Issue: "Gradle Build Failed"
**Solution**:
1. **File** → **Invalidate Caches**
2. Click **Invalidate and Restart**
3. Re-run

### Issue: "DevTools Not Working"
**Solution**:
- Verify `build.gradle` has:
  ```groovy
  developmentOnly 'org.springframework.boot:spring-boot-devtools'
  ```
- Rebuild project: **Build** → **Rebuild Project**

### Issue: "Memory Error During Build"
**Solution**:
1. **File** → **Settings** → **Build, Execution, Deployment** → **Gradle**
2. Increase **VM options**: `-Xmx1024m`

---

## Best Practices

### 1. **Organize Your Console**
- Pin important logs using thumbtack icon
- Use filters (top right) to show only your app logs
- Clear console between runs

### 2. **Use Debug Mode for Complex Issues**
- Set breakpoints in suspicious code
- Step through execution
- Inspect variables in real-time

### 3. **Monitor Resource Usage**
- **View** → **Tool Windows** → **Memory**
- Watch memory consumption during hot reloads

### 4. **Keep External Tools Ready**
- Terminal window open for quick commands
- Gradle panel open for task access
- Console visible for real-time logs

---

## Advanced: Remote Debugging

To debug from another machine:

1. **Run with Debug Options**:
   ```bash
   JAVA_OPTS="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005" \
   ./gradlew bootRun --args='--spring.profiles.active=dev'
   ```

2. **In IntelliJ**: **Run** → **Debug** → **Edit Configurations** → **Remote**
   - Host: `your-server-ip`
   - Port: `5005`

3. **Click Debug** to connect

---

## Summary

| Method | Speed | Control | Best For |
|--------|-------|---------|----------|
| **Run Config** | ⚡ Fastest | ✅ High | General development |
| **Terminal** | ⚡ Fast | ✅ High | Advanced users |
| **Gradle Tool** | ⚡ Fast | ⚠️ Medium | Visual preference |
| **Debug Mode** | 🐢 Slower | ✅✅ Very High | Bug hunting |

---

## Next Steps

1. ✅ Create Run Configuration (Method 1)
2. ▶️ Click Run (Shift+F10)
3. 👀 Watch application start in IntelliJ console
4. 📝 Make Java code changes
5. 💾 Save (Ctrl+S) - watch auto-restart in console
6. 🧪 Test with curl or browser
7. 🔄 Repeat for rapid development

**Happy debugging!** 🚀
