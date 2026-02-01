# UfiDesk - Reference Card

## 🚀 Commands Quick Reference

### Start Services
```bash
# Start MongoDB + Mongo Express
docker-compose up -d

# Start Backend
./gradlew bootRun

# Stop services
docker-compose down

# Stop and remove data
docker-compose down -v

# View logs
docker-compose logs mongodb
```

---

## 🔓 Credentials

### Superadmin
- Username: `superadmin`
- Password: `password`

### MongoDB
- Username: `admin`
- Password: `admin123`
- Connection: `mongodb://admin:admin123@localhost:27017/ufidesk?authSource=admin`

---

## 🌐 URLs

| Service | URL |
|---------|-----|
| API | http://localhost:8080 |
| Mongo Express | http://localhost:8081 |
| MongoDB | localhost:27017 |

---

## 📡 API Quick Test

### Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"password"}'
```

### Check Status
```bash
curl -X GET http://localhost:8080/auth/status \
  -H "Cookie: JSESSIONID=<session-id>"
```

### Logout
```bash
curl -X POST http://localhost:8080/auth/logout \
  -H "Cookie: JSESSIONID=<session-id>"
```

---

## 🗄️ Database Commands

### Connect to MongoDB
```bash
mongosh mongodb://admin:admin123@localhost:27017/ufidesk?authSource=admin
```

### View Superadmin User
```javascript
db.users.findOne({username: "superadmin"})
```

### View All Users
```javascript
db.users.find()
```

### View Collections
```javascript
db.getCollectionNames()
```

### Reset Failed Attempts
```javascript
db.users.updateOne(
  {username: "superadmin"},
  {$set: {failedLoginAttempts: 0, accountLockedUntil: null}}
)
```

### Delete User
```javascript
db.users.deleteOne({username: "superadmin"})
```

### Clear Sessions
```javascript
db.SPRING_SESSION.deleteMany({})
db.SPRING_SESSION_ATTRIBUTES.deleteMany({})
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| init-mongo.js | Auto-initialization |
| docker-compose.yml | Docker services |
| application.yml | App config |
| AuthController.java | Auth endpoints |
| UserService.java | User logic |
| User.java | User model |

---

## 🔒 Security Settings

- **Password Hashing**: BCrypt (10 rounds)
- **Account Lockout**: 5 attempts → 15 min lock
- **Session Timeout**: 30 minutes
- **Password Min Length**: 8 chars
- **Cookie**: HTTPOnly, SameSite=Lax

---

## ⚠️ Important

- ⚠️ Change default superadmin password after first login
- ⚠️ Do NOT use default MongoDB credentials in production
- ⚠️ Set `secure: true` for cookies in HTTPS environments
- ⚠️ Update CORS origins for production domain

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Connection refused | Start MongoDB: `docker-compose up -d` |
| Port in use | Change port in docker-compose.yml |
| Collections missing | Check logs: `docker-compose logs mongodb` |
| Login fails | Reset attempts: `db.users.updateOne(...)` |
| Session not working | Restart MongoDB and backend |

---

## 📚 Documentation

- **QUICKSTART.md** - 5-minute setup
- **MONGODB_SETUP.md** - Detailed setup
- **TEST_SCENARIOS.md** - Test cases
- **README.md** - Project info

---

## 🔄 Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Success |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Auth failed |
| 403 | Forbidden - Account locked/disabled |
| 500 | Server Error |

---

## 📊 Collections

### users
- `_id` (ObjectId)
- `username` (String, unique)
- `passwordHash` (String)
- `email` (String)
- `role` (String)
- `enabled` (Boolean)
- `createdAt` (Date)
- `lastLogin` (Date)
- `failedLoginAttempts` (Int)
- `accountLockedUntil` (Date)

### SPRING_SESSION
- Session storage

### SPRING_SESSION_ATTRIBUTES
- Session attributes

---

## 🎯 Development Workflow

1. Start services: `docker-compose up -d`
2. Start backend: `./gradlew bootRun`
3. Open http://localhost:8081 (Mongo Express)
4. Test endpoints via curl or Postman
5. Check logs for debugging
6. Make changes to code
7. Backend recompiles automatically (DevTools)
8. Test again

---

## ✅ Verification Checklist

- [ ] MongoDB running: `docker-compose ps`
- [ ] Collections created: View in Mongo Express
- [ ] Superadmin exists: `db.users.find()`
- [ ] Backend starts: `./gradlew bootRun`
- [ ] Login works: Test curl command
- [ ] Session works: Check /auth/status
- [ ] Logout works: Test /auth/logout
- [ ] Account lockout works: 5 failed attempts

---

## 🚀 Ready to Go!

Everything is configured. Just run:
```bash
docker-compose up -d
./gradlew bootRun
```

Login with: `superadmin` / `password`

**Start building! 🎉**
