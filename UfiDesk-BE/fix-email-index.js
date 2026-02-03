// MongoDB Script to fix the email index conflict
// Run this in MongoDB Compass or mongo shell

// Switch to ufidesk database
db = db.getSiblingDB('ufidesk');

// List all existing indexes on the users collection
print("=== Current indexes on 'users' collection ===");
db.users.getIndexes().forEach(function(index) {
    print(JSON.stringify(index, null, 2));
});

// Drop the conflicting email_1 index (the old one without proper naming)
print("\n=== Dropping old 'email_1' index ===");
try {
    db.users.dropIndex("email_1");
    print("✓ Successfully dropped 'email_1' index");
} catch (e) {
    print("✗ Failed to drop index: " + e.message);
}

// Drop any other email-related indexes
print("\n=== Dropping any 'email' named index ===");
try {
    db.users.dropIndex("email");
    print("✓ Successfully dropped 'email' index");
} catch (e) {
    print("✗ No 'email' index found (this is OK): " + e.message);
}

// List remaining indexes
print("\n=== Remaining indexes on 'users' collection ===");
db.users.getIndexes().forEach(function(index) {
    print(JSON.stringify(index, null, 2));
});

print("\n✓ Index cleanup complete! Spring will recreate the proper index on next startup.");
