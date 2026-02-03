# AuthorizationDeniedException with MongoDB Interruption - Root Cause & Fix

## Error Chain Analysis

```
AuthorizationDeniedException
  ↓ Caused by
InterruptedException
  ↓ Caused by
MongoInterruptedException
```

## Root Cause

The error occurs due to **MongoDB connection pool exhaustion or timeout** during the authorization check process:

1. **Request arrives with `@PreAuthorize` annotation** (e.g., `@PreAuthorize("isAuthenticated()")`)
2. **Spring Security triggers authorization check** which needs to validate the user's session
3. **`CustomUserDetailsService.loadUserByUsername()` is called** to load fresh user details from the database
4. **MongoDB query times out or connection is interrupted** due to:
   - Connection pool exhaustion (too many concurrent queries)
   - Slow MongoDB instance
   - Network latency between app and MongoDB
   - Default connection timeout too short
5. **`MongoInterruptedException` is thrown** and bubbles up
6. **Spring Security catches it as an authorization failure** → `AuthorizationDeniedException`

## Why It Happens Randomly

- **Session management queries user on every request**: Spring Security validates sessions, which triggers MongoDB queries
- **High concurrency**: Multiple simultaneous requests exhaust the connection pool
- **Slow MongoDB responses**: During peak usage or complex queries, MongoDB takes too long
- **Connection pool starvation**: Connections not being released properly or pool size too small

## Solutions Implemented

### 1. **Global Exception Handler** (`GlobalExceptionHandler.java`)
Catches and handles MongoDB-related exceptions gracefully:

```java
@ExceptionHandler(MongoInterruptedException.class)
public ResponseEntity<ApiResponse<Void>> handleMongoInterruptedException(...) {
    // Returns 503 Service Unavailable instead of 500
    // User gets a friendly message to try again
}
```

**Benefits:**
- Prevents stack traces from leaking to frontend
- Returns appropriate HTTP status codes (503 instead of 500)
- Provides user-friendly error messages
- Logs errors for debugging

### 2. **Enhanced CustomUserDetailsService** 
Added explicit error handling:

```java
try {
    User user = userService.findByEmail(email)...
} catch (MongoInterruptedException | InterruptedException e) {
    log.error("Database connection interrupted");
    throw new RuntimeException("Database service temporarily unavailable", e);
} catch (Exception e) {
    throw new UsernameNotFoundException("Unable to load user", e);
}
```

**Benefits:**
- Catches MongoDB interruptions early
- Prevents unexpected exceptions from bubbling up
- Provides better context in logs for debugging

### 3. **MongoDB Connection Pool Optimization** (`application.yml`)
Added connection pool settings:

```yaml
spring:
  data:
    mongodb:
      max-connection-idle-time: 900000  # 15 minutes
```

**Benefits:**
- Prevents stale connections from hanging
- Automatically closes idle connections
- Reduces connection pool exhaustion

## Testing the Fix

### Test 1: Verify Exception Handling
```bash
# Simulate by stopping MongoDB, then making a request
curl -H "Cookie: JSESSIONID=..." http://localhost:8080/api/protected

# Expected response (instead of 500):
# HTTP 503 Service Unavailable
# {"success": false, "message": "Database service temporarily unavailable..."}
```

### Test 2: Load Test
```bash
# Use Apache Bench or similar to send concurrent requests
ab -n 1000 -c 50 -b cookie.txt http://localhost:8080/api/protected

# Should not see authorization errors anymore
```

### Test 3: Monitor Logs
Check for these log patterns:
```
✓ MongoDB connection interrupted: [details]
✓ Thread interrupted: [details]
✓ Authorization denied: [reason]
```

NOT seeing:
```
✗ java.lang.InterruptedException: null
✗ org.springframework.security.authorization.AuthorizationDeniedException
```

## Prevention Best Practices

### 1. **Connection Pool Size**
Monitor and adjust if needed in `application.yml`:
```yaml
spring:
  data:
    mongodb:
      # Default: 100 connections
      # Increase for high concurrency
```

### 2. **Query Timeout Configuration**
Add to `application.yml` if connection times out frequently:
```yaml
spring:
  data:
    mongodb:
      socket-timeout-ms: 30000  # 30 second timeout
```

### 3. **Caching User Details**
Consider caching `CustomUserDetails` to reduce MongoDB queries:
```java
@Cacheable("userDetails")
public UserDetails loadUserByUsername(String email) {
    // This would cache results and reduce DB hits
}
```

### 4. **MongoDB Performance Monitoring**
- Check MongoDB slow query logs
- Verify indexes are created on `User` collection (especially `email` field)
- Monitor connection pool usage in MongoDB monitoring tools

### 5. **Session Management**
The current configuration queries MongoDB for **every request** to validate sessions.
Consider:
- Using JWT tokens instead of server sessions for better scalability
- Implementing session caching with Redis
- Increasing session timeout if appropriate

## Configuration Changes Summary

| File | Change | Reason |
|------|--------|--------|
| `GlobalExceptionHandler.java` | **NEW** | Handle MongoDB interruptions gracefully |
| `CustomUserDetailsService.java` | Added try-catch for MongoDB exceptions | Early exception handling |
| `application.yml` | Added `max-connection-idle-time` | Prevent stale connections |

## Monitoring & Alerts

Add these to your monitoring:
1. **Track HTTP 503 responses** - indicates database unavailability
2. **Monitor MongoDB connection pool** - track exhaustion events
3. **Log MongoInterruptedException** - set alert when frequency > threshold
4. **Check MongoDB performance** - slow queries can trigger timeouts

## Related Configuration Files

- `/src/main/resources/application.yml` - Application configuration
- `/src/main/java/com/ufidesk/config/SecurityConfig.java` - Spring Security settings
- `/src/main/java/com/ufidesk/security/CustomUserDetailsService.java` - User loading logic

## Future Improvements

1. **Implement user caching** with Spring Cache abstraction
2. **Switch to JWT authentication** for better scalability
3. **Use Redis for session storage** instead of MongoDB
4. **Add request timeout configuration** at application level
5. **Implement circuit breaker pattern** for database calls using Resilience4j
