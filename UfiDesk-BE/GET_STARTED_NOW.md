# 🎯 Get Started Now - Step by Step

## 3-Minute Setup

Copy and paste these commands to get everything running!

---

## Terminal 1: Start MongoDB

```bash
cd C:\Users\Ufinity\Desktop\Hackathon\ufiDesk\UfiDesk-BE
docker-compose up -d
```

✅ Wait 10-15 seconds for MongoDB to initialize  
✅ You should see "ufidesk-mongodb" in the list  

**Verify:**
```bash
docker-compose ps
```

---

## Terminal 2: Start Backend

```bash
cd C:\Users\Ufinity\Desktop\Hackathon\ufiDesk\UfiDesk-BE
./gradlew bootRun
```

✅ Wait for the message: `Started UfiDeskApplication in X seconds`  
✅ Application is ready on http://localhost:8080  

**You'll see logs like:**
```
Started UfiDeskApplication in 5.123 seconds (JVM running for 5.456)
```

---

## Terminal 3: Test Login

```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"password"}'
```

✅ You should get a **200 OK** response with:

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

---

## 🌐 View Your Database

Open in browser: **http://localhost:8081**

You should see:
- Database: `ufidesk`
- Collections: `users`, `SPRING_SESSION`, `SPRING_SESSION_ATTRIBUTES`
- Users collection should have 1 document (superadmin)

---

## 🎉 Success!

If you see the login response and database UI, everything is working!

---

## ⚡ Quick Commands Reference

### View Logs
```bash
# MongoDB logs
docker-compose logs mongodb

# Backend logs (in Terminal 2 where ./gradlew bootRun is running)
# Scroll up or check the terminal output
```

### Stop Services
```bash
# Stop MongoDB
docker-compose down

# Stop backend (Ctrl+C in Terminal 2)
# Just press Ctrl+C
```

### Reset Everything
```bash
# Stop and remove all data
docker-compose down -v

# Start fresh (collections and superadmin will be recreated)
docker-compose up -d
```

---

## 🔍 Verify Each Component

### MongoDB Running?
```bash
docker-compose ps
# Should show ufidesk-mongodb as "Up"
```

### Backend Running?
```bash
# Check in Terminal 2 - should show "Started UfiDeskApplication"
# Or try: http://localhost:8080/auth/status
```

### Database Initialized?
```bash
# Open http://localhost:8081 in browser
# Or use mongosh:
mongosh mongodb://admin:admin123@localhost:27017/ufidesk?authSource=admin
db.users.find()
```

---

## 🔑 Login Credentials

**Superadmin:**
- Username: `superadmin`
- Password: `password`

That's it! Use these to test the endpoints.

---

## 📚 Next: Read Documentation

After confirming everything works:

1. **QUICKSTART.md** - Learn more about the setup
2. **REFERENCE.md** - Quick command reference
3. **TEST_SCENARIOS.md** - Test all endpoints
4. **MONGODB_SETUP.md** - Deep dive into setup

---

## 🐛 Troubleshooting

### MongoDB won't start?
```bash
# Check what's using port 27017
netstat -ano | findstr :27017

# Or just restart Docker
docker-compose down
docker-compose up -d
```

### Backend won't start?
```bash
# Make sure MongoDB is running first
docker-compose ps

# Check if port 8080 is in use
netstat -ano | findstr :8080
```

### Login returns 401?
```bash
# Check if superadmin exists in database
mongosh mongodb://admin:admin123@localhost:27017/ufidesk?authSource=admin
db.users.findOne({username: "superadmin"})
```

### Can't see database in Mongo Express?
```bash
# Check if it's running
docker-compose ps

# Try http://localhost:8081
# Refresh the page
```

---

## ✅ Completion Checklist

- [ ] Ran `docker-compose up -d`
- [ ] MongoDB is running (`docker-compose ps` shows it)
- [ ] Ran `./gradlew bootRun` in another terminal
- [ ] Backend shows "Started UfiDeskApplication"
- [ ] Tested login with curl command
- [ ] Got 200 OK response with user data
- [ ] Opened http://localhost:8081 in browser
- [ ] Saw superadmin user in database
- [ ] Verified collections exist

---

## 🎊 That's It!

You now have:
✅ MongoDB running with collections  
✅ Superadmin account ready  
✅ Backend application running  
✅ Authentication working  
✅ Database accessible via UI  

**Start using the API!** 🚀

---

## 📖 Full Documentation

Find all documentation files in the `UfiDesk-BE` folder:

- `QUICKSTART.md` - Get started
- `MONGODB_SETUP.md` - Detailed setup
- `TEST_SCENARIOS.md` - Test cases
- `REFERENCE.md` - Commands
- `START_HERE.md` - Overview

---

## 💡 What's Next?

### Immediate
- Change superadmin password
- Test all endpoints
- Explore database
- Review code

### Short Term
- Create additional user accounts
- Implement password change
- Add user registration
- Test account lockout

### Medium Term
- Add more endpoints
- Implement features
- Write tests
- Setup CI/CD

---

## 🎯 Remember

This is a **development setup**. For production:
- Change all credentials
- Enable HTTPS
- Configure firewall
- Set up backups
- Enable monitoring

---

## ✨ Enjoy!

Everything is ready. Start building! 🚀
