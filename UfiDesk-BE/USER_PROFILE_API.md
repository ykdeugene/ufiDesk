# User Profile Management API

## Overview

The User Controller provides endpoints for authenticated users to manage their own profile, including updating their email address and password.

## Endpoints

### Update User Profile
```
PUT /user/update-profile
Authorization: Required (authenticated user)
Content-Type: application/json
```

## Request Body

```json
{
  "email": "newemail@example.com",
  "password": "encrypted_password_from_frontend",
  "updateTime": "2026-02-03T10:30:45.123"
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | String | Optional | New email address for the user. If blank/null, email is not updated. Must be unique. |
| `password` | String | Optional | Encrypted password (from frontend). If blank/null, password is not updated. |
| `updateTime` | String | Required | ISO-8601 format timestamp when the update request was initiated. Used as salt for password decryption. |

## Response

### Success (200 OK)
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "email": "newemail@example.com",
    "admin": false,
    "enabled": true
  }
}
```

### Error Cases

#### Email Already Exists (409 Conflict)
```json
{
  "success": false,
  "message": "Email already exists: newemail@example.com"
}
```

#### User Not Found (404 Not Found)
```json
{
  "success": false,
  "message": "User not found"
}
```

#### Invalid Request (400 Bad Request)
```json
{
  "success": false,
  "message": "Failed to update profile: [error details]"
}
```

## Usage Examples

### Update Email Only
```json
{
  "email": "newemail@example.com",
  "password": "",
  "updateTime": "2026-02-03T10:30:45.123"
}
```

### Update Password Only
```json
{
  "email": "",
  "password": "encrypted_password_from_frontend",
  "updateTime": "2026-02-03T10:30:45.123"
}
```

### Update Both Email and Password
```json
{
  "email": "newemail@example.com",
  "password": "encrypted_password_from_frontend",
  "updateTime": "2026-02-03T10:30:45.123"
}
```

### No Update (No-op)
```json
{
  "email": "",
  "password": "",
  "updateTime": "2026-02-03T10:30:45.123"
}
```
Returns 200 OK with current user data (no changes made).

## Business Logic

### Email Update
- Email must be unique across the system
- If a user tries to update to an email that already exists, a 409 Conflict error is returned
- Only updates if the new email is different from the current email

### Password Update
- Password is encrypted by the frontend using AES/CBC
- Salt for encryption: `email + updateTime` (same as login)
- Backend decrypts the password to plaintext
- Plaintext is hashed using BCrypt
- BCrypt hash is stored in the database
- This matches the same logic used in `AdminController.updateUser()`

### No-op Behavior
- If both email and password are blank/null, the request succeeds but makes no changes
- User data is still returned in the response

## Security Considerations

✅ **Authentication Required**: Only authenticated users can update their own profile

✅ **Self-Update Only**: Users can only update their own profile (current authenticated user), not other users

✅ **Password Security**: 
- Passwords are decrypted using the original email as salt
- Uses BCrypt hashing (same as login logic)
- Supports the same encryption method as the frontend

✅ **Email Uniqueness**: System prevents duplicate emails

✅ **Email Validation**: Email format is validated using standard email regex

## Frontend Integration

### Step 1: Prepare the Update Request

```javascript
const updateRequest = {
  email: newEmail || "", // Empty string if not updating
  password: encryptedPassword || "", // Empty string if not updating
  updateTime: new Date().toISOString() // Current timestamp
};
```

### Step 2: Encrypt Password (if updating)

```javascript
function encryptPassword(plainPassword, email, updateTime) {
  // Use the same encryption logic as login
  // Salt: email + updateTime
  // Method: AES/CBC
  // Return encrypted password
}
```

### Step 3: Send Update Request

```javascript
async function updateProfile(email, password) {
  const encryptedPassword = password ? encryptPassword(password, email, new Date().toISOString()) : "";
  
  const response = await fetch('/user/update-profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email || "",
      password: encryptedPassword,
      updateTime: new Date().toISOString()
    })
  });

  const data = await response.json();
  
  if (response.ok) {
    console.log('Profile updated:', data.data);
    // Update local state with new email if it was changed
  } else {
    console.error('Update failed:', data.message);
  }
}
```

## Testing

### Test Email Update
1. User logs in
2. Calls `PUT /user/update-profile` with new email
3. Verify response contains updated email
4. Verify old email no longer works for login (after session refresh)
5. Verify new email works for login

### Test Password Update
1. User logs in
2. Calls `PUT /user/update-profile` with encrypted new password
3. User logs out
4. Try logging in with old password → Should fail
5. Try logging in with new password → Should succeed

### Test Duplicate Email Prevention
1. User A is logged in
2. Calls `PUT /user/update-profile` with User B's existing email
3. Verify 409 Conflict response with error message

### Test No-op Request
1. User logs in
2. Calls `PUT /user/update-profile` with empty email and password
3. Verify 200 OK response with unchanged user data

## Logging

The controller logs the following actions:
- Profile update attempts
- Email changes: "Email updated for user X: old@email.com → new@email.com"
- Password updates: "Password updated for user X"
- Successful updates: "User profile updated successfully: X"
- Errors: "Failed to update profile for user X: [error]"
