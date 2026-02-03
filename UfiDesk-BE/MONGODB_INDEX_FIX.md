# MongoDB Email Index Conflict - Fix Guide

## Problem

```
Cannot create index for 'email' in collection 'users' with keys 'Document{{email=1}}' 
and options 'Document{{name=email, unique=true}}'

Index already exists with a different name: email_1
```

## Root Cause

An old index named `email_1` exists in MongoDB from a previous migration or setup, but Spring Data is trying to create a new index with different options (unique constraint with a specific name). MongoDB doesn't allow two indexes on the same field with different names.

## Solution

### Option 1: Use MongoDB Compass (GUI - Easiest)

1. **Open MongoDB Compass**
2. **Connect to localhost:27017**
3. **Navigate to: ufidesk → users → Indexes**
4. **Find the `email_1` or `email` index**
5. **Click the delete icon (trash can)**
6. **Confirm deletion**
7. **Restart your Spring Boot application**

The application will automatically recreate the proper unique email index on startup.

### Option 2: Use MongoDB Shell (Terminal)

Run the provided script: `fix-email-index.js`

```bash
# Option A: Using mongosh (newer MongoDB)
mongosh --authenticationDatabase admin -u admin -p admin123 localhost:27017/ufidesk < fix-email-index.js

# Option B: Using mongo (older MongoDB)
mongo --authenticationDatabase admin -u admin -p admin123 localhost:27017/ufidesk < fix-email-index.js
```

### Option 3: Manual MongoDB Shell Commands

1. **Open MongoDB Shell**:
```bash
mongosh --authenticationDatabase admin -u admin -p admin123 localhost:27017
```

2. **Switch to ufidesk database**:
```javascript
use ufidesk
```

3. **List all indexes on users collection**:
```javascript
db.users.getIndexes()
```

4. **Drop the conflicting index**:
```javascript
db.users.dropIndex("email_1")
// or
db.users.dropIndex("email")
```

5. **Verify deletion**:
```javascript
db.users.getIndexes()
```

## Configuration Changes Made

### `application.yml` Changes

**Before:**
```yaml
auto-index-creation: true
```

**After:**
```yaml
auto-index-creation: false
```

**Reason:** Auto-index creation during startup can conflict with existing indexes. We now manage indexes explicitly through migration scripts.

## What Happens Next

Once you delete the old index and restart the application:

1. ✅ MongoDB connection will initialize successfully
2. ✅ `mongoTemplate` bean will be created without errors
3. ✅ Application will start normally
4. ✅ Existing unique email constraint will still be enforced

## Index Management Going Forward

### Creating New Indexes

If you need to create indexes in the future, create a migration script like `fix-email-index.js`:

```javascript
db.users.createIndex(
    { email: 1 },
    { unique: true, name: "email_unique" }
);
```

### Using @Indexed Annotation

Spring Data MongoDB will respect `@Indexed` annotations even with `auto-index-creation: false`:

```java
@Document(collection = "users")
public class User {
    @Id
    private String id;

    @Indexed(unique = true, name = "email_unique")
    private String email;
    
    // ... rest of fields
}
```

The indexes won't be auto-created on startup, but Spring will track them and you can manage them manually.

## Files Modified

| File | Change | Reason |
|------|--------|--------|
| `application.yml` | Set `auto-index-creation: false` | Prevent startup conflicts with existing indexes |
| `fix-email-index.js` | **NEW** | Script to remove conflicting email indexes |

## Verification Checklist

After applying the fix:

- [ ] Deleted the old `email_1` index from MongoDB
- [ ] Restarted the Spring Boot application
- [ ] Application started successfully without errors
- [ ] No "Cannot create index" error in logs
- [ ] Can login with email/password (tests unique constraint)
- [ ] Can create new users (tests unique constraint enforcement)

## Related Issues

This issue often occurs when:
1. Running setup scripts multiple times
2. Migrating from different Spring Boot versions
3. Manually creating indexes without proper naming
4. Index naming conflicts from previous deploys

## Prevention

To prevent this in the future:

1. **Use migration scripts** for all schema changes
2. **Set `auto-index-creation: false`** in production
3. **Version your migration scripts** (e.g., `001-email-index.js`)
4. **Run migrations before deployment** (not during startup)
5. **Document all indexes** in your project

## Troubleshooting

### If error persists after deleting index:

1. Drop the entire users collection:
```javascript
db.users.drop()
```

2. Restart application (it will recreate the collection)

⚠️ **Warning:** This will delete all user data!

### If you get "Connection refused":

MongoDB may not be running. Start it:

```bash
# Windows
mongod --config "path/to/mongod.conf"

# macOS (via Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

## Questions?

Check the logs:
```bash
tail -f build/logs/spring.log | grep -i index
```

Look for:
- `MongoPersistentEntityIndexCreator` messages
- `IndexOptionsConflict` errors
- Successful index creation messages
