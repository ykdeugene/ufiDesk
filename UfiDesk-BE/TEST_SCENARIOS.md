# UfiDesk - API Test Scenarios

## 📋 Test Cases for Authentication Endpoints

### Prerequisites
- MongoDB is running: `docker-compose up -d`
- Backend is running: `./gradlew bootRun`
- Superadmin user exists in database
- Mongo Express available at http://localhost:8081

---

## 🧪 Test Scenarios

### 1. Successful Login

**Request:**
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -H "Cookie: JSESSIONID=test" \
  -d '{
    "username": "superadmin",
    "password": "password"
  }' -v
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "username": "superadmin",
    "role": "SUPERADMIN",
    "message": "Login successful"
  }
}
```

**Verify:**
- Status: 200 OK
- Response contains username and role
- Session cookie is set in response headers
- Check database: `db.users.findOne({username: "superadmin"})` shows `lastLogin` updated
- `failedLoginAttempts` should be 0

---

### 2. Invalid Username

**Request:**
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "nonexistent",
    "password": "password"
  }'
```

**Expected Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid username or password",
  "data": null
}
```

**Verify:**
- Status: 401 Unauthorized
- Generic error message (doesn't reveal if user exists)

---

### 3. Invalid Password

**Request:**
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "wrongpassword"
  }'
```

**Expected Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid username or password",
  "data": null
}
```

**Verify:**
- Status: 401 Unauthorized
- Check database: `failedLoginAttempts` incremented to 1
- `accountLockedUntil` should still be null (not locked yet)

---

### 4. Account Lockout After 5 Failed Attempts

**Procedure:**
1. Send 5 login requests with wrong password
2. On the 5th request, check the response
3. Try login with correct password immediately after

**Request (5th failed attempt):**
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "wrongpassword"
  }'
```

**Expected Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid username or password",
  "data": null
}
```

**After 5th attempt, verify in database:**
```javascript
db.users.findOne({username: "superadmin"})
```
Should show:
```json
{
  "failedLoginAttempts": 5,
  "accountLockedUntil": <date 15 minutes in future>
}
```

**Request (6th attempt with correct password):**
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "password"
  }'
```

**Expected Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Account is temporarily locked due to too many failed login attempts",
  "data": null
}
```

**Verify:**
- Status: 403 Forbidden
- Even with correct password, login is blocked
- Account is locked for 15 minutes

---

### 5. Check Session Status (Active Session)

**Request:**
```bash
# First login to get session
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "password"
  }' -c cookies.txt

# Then check status using session cookie
curl -X GET http://localhost:8080/auth/status \
  -H "Cookie: JSESSIONID=<session-id>" \
  -b cookies.txt
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Session active",
  "data": {
    "username": "superadmin",
    "role": "SUPERADMIN",
    "message": "Session active"
  }
}
```

**Verify:**
- Status: 200 OK
- Returns current user info from session

---

### 6. Check Session Status (No Active Session)

**Request:**
```bash
curl -X GET http://localhost:8080/auth/status \
  -H "Content-Type: application/json"
```

**Expected Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "No active session",
  "data": null
}
```

**Verify:**
- Status: 401 Unauthorized
- No user data in response

---

### 7. Logout

**Request:**
```bash
# Login first
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "password"
  }' -c cookies.txt

# Then logout
curl -X POST http://localhost:8080/auth/logout \
  -b cookies.txt
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

**Verify:**
- Status: 200 OK
- Session is invalidated
- Subsequent `/auth/status` should return 401

---

### 8. Logout Without Session

**Request:**
```bash
curl -X POST http://localhost:8080/auth/logout \
  -H "Content-Type: application/json"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "No active session",
  "data": null
}
```

**Verify:**
- Status: 200 OK
- Gracefully handles logout without active session

---

## 🔄 Account Lockout Reset Test

### Scenario: Wait for lockout to expire

1. Lock account (5 failed attempts)
2. Wait 15 minutes
3. Try login with correct password

**Expected:**
- After 15 minutes, lockout expires automatically
- Can successfully login with correct password
- `failedLoginAttempts` is reset to 0
- `accountLockedUntil` is set to null

---

## 🗂️ Database Verification Checklist

### After each test, verify in Mongo Express or mongosh:

```javascript
// Check superadmin user
db.users.findOne({username: "superadmin"})

// Check for all users
db.users.find()

// Check failed attempts
db.users.aggregate([
  {$match: {failedLoginAttempts: {$gt: 0}}},
  {$project: {username: 1, failedLoginAttempts: 1, accountLockedUntil: 1}}
])

// Check active sessions
db.SPRING_SESSION.find()
```

---

## ✅ Testing Checklist

- [ ] Login successful with correct credentials
- [ ] Login fails with invalid username
- [ ] Login fails with invalid password
- [ ] Failed attempts counter increments
- [ ] Account locks after 5 failed attempts
- [ ] Lockout prevents login (even with correct password)
- [ ] Session check works with active session
- [ ] Session check fails without session
- [ ] Logout invalidates session
- [ ] Logout works without active session
- [ ] Lockout expires after 15 minutes
- [ ] Database updates reflect all changes

---

## 🐛 Debugging Tips

### View Application Logs
```bash
# Terminal running the app shows real-time logs
```

### View MongoDB Logs
```bash
docker-compose logs mongodb
```

### Check Session in Database
```bash
db.SPRING_SESSION.find().pretty()
db.SPRING_SESSION_ATTRIBUTES.find().pretty()
```

### Reset User for Testing
```bash
# Set failed attempts to 0
db.users.updateOne(
  {username: "superadmin"},
  {$set: {failedLoginAttempts: 0, accountLockedUntil: null}}
)
```

### Clear All Sessions
```bash
db.SPRING_SESSION.deleteMany({})
db.SPRING_SESSION_ATTRIBUTES.deleteMany({})
```

---

## 🎯 Common Issues

### "Connection refused" at localhost:8080
- Verify backend is running: `./gradlew bootRun`
- Check port 8080 is not in use

### "Invalid username or password" even with correct credentials
- Verify user exists in database: `db.users.findOne({username: "superadmin"})`
- Check passwordHash is not null or empty
- Restart backend and try again

### Lockout not lifting after 15 minutes
- Check database for `accountLockedUntil` value
- Manually reset: `db.users.updateOne({username: "superadmin"}, {$set: {accountLockedUntil: null, failedLoginAttempts: 0}})`

### Session not persisting
- Verify MongoDB SPRING_SESSION collection exists
- Check Spring Session configuration in application.yml
- Restart MongoDB and backend

---

## 📊 Test Report Template

```
Test Date: ___________
Tester: ___________
Environment: Development

Test Results:
- Successful Login: ✓ / ✗
- Invalid Username: ✓ / ✗
- Invalid Password: ✓ / ✗
- Account Lockout: ✓ / ✗
- Session Check (Active): ✓ / ✗
- Session Check (Inactive): ✓ / ✗
- Logout: ✓ / ✗
- Database Consistency: ✓ / ✗

Issues Found:
[List any issues]

Overall Status: PASS / FAIL
```

---

## 🚀 Performance Notes

- Login response should be < 100ms
- Session check should be < 50ms
- Account lockout check should be automatic
- Failed attempt increment should be atomic (no race conditions)

---

## 📝 Automation Script (Postman/Thunder Client)

You can import these requests into Postman or Thunder Client for automated testing.

**Collection: UfiDesk Auth Tests**

Request list:
1. Login - Success
2. Login - Invalid Username
3. Login - Invalid Password
4. Login - Fail 1x
5. Login - Fail 2x
6. Login - Fail 3x
7. Login - Fail 4x
8. Login - Fail 5x (Locked)
9. Check Session - Active
10. Check Session - Inactive
11. Logout
12. Logout - No Session

---

## 🔄 Continuous Integration

These test scenarios should be automated in CI/CD pipeline:
- JUnit tests for UserService
- Integration tests for AuthController
- Database state verification
- Performance benchmarks
