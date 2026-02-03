# User Profile Update - Security Implementation

## Summary

The UserController now enforces strict security to ensure that **users can ONLY update their own profile**, not other users' profiles.

## Security Implementation

### How It Works

1. **Authentication Required**: `@PreAuthorize("isAuthenticated()")` ensures only logged-in users can access the endpoint

2. **Self-Update Only**: The authenticated user's email is extracted from Spring Security context:
   ```java
   Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
   String authenticatedUserEmail = authentication.getName(); // Gets CURRENT user's email
   ```

3. **No User ID Parameters**: The endpoint does NOT accept a user ID or email parameter, eliminating the possibility of parameter tampering

4. **User Lookup**: The endpoint fetches the user from the database using ONLY the authenticated user's email:
   ```java
   User user = userService.findByEmail(authenticatedUserEmail)
   ```

5. **No Cross-User Updates**: Since the endpoint always uses `authentication.getName()`, it's impossible for a user to update another user's profile

## Security Benefits

✅ **Cannot be bypassed**: No way to specify which user to update - always uses authenticated user

✅ **Simple and clean**: No extra validation needed - Spring Security context is the source of truth

✅ **Transparent logging**: All logs clearly indicate which authenticated user is performing the update

✅ **Clear error messages**: If something goes wrong, logs show exactly which user attempted the operation

## API Endpoint

```
PUT /user/update-profile
Authorization: Required (authenticated user)
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "newemail@example.com",  // Optional
  "password": "encrypted_password",  // Optional
  "updateTime": "2026-02-03T10:30:45.123"  // Required
}
```

**Response**:
```json
{
  "success": true,
  "message": "Your profile has been updated successfully",
  "data": {
    "email": "newemail@example.com",
    "admin": false,
    "enabled": true
  }
}
```

## Error Cases

### 1. Email Already Exists (409 Conflict)
```json
{
  "success": false,
  "message": "Email already exists: newemail@example.com"
}
```

### 2. User Not Found (404 Not Found)
```json
{
  "success": false,
  "message": "User not found"
}
```
*This should never happen under normal circumstances since the user is authenticated*

### 3. Invalid Request (400 Bad Request)
```json
{
  "success": false,
  "message": "Failed to update profile: [error details]"
}
```

## Usage Examples

### Update Own Email
```bash
curl -X PUT http://localhost:8080/user/update-profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemail@example.com",
    "password": "",
    "updateTime": "2026-02-03T10:30:45.123"
  }'
```

### Update Own Password
```bash
curl -X PUT http://localhost:8080/user/update-profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "",
    "password": "encrypted_password_from_frontend",
    "updateTime": "2026-02-03T10:30:45.123"
  }'
```

### Update Both Email and Password
```bash
curl -X PUT http://localhost:8080/user/update-profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemail@example.com",
    "password": "encrypted_password_from_frontend",
    "updateTime": "2026-02-03T10:30:45.123"
  }'
```

## Password Update Details

The password update uses the same business logic as `AdminController.updateUser()`:

1. **Decryption**: 
   - Frontend encrypts plaintext password using AES/CBC
   - Salt: original email + updateTime
   - Backend decrypts to get plaintext

2. **Hashing**: 
   - Plaintext is hashed using BCrypt
   - Hash is stored in database

3. **Security**: 
   - Same encryption/hashing as login process
   - Resistant to timing attacks
   - Industry standard (BCrypt)

## Logging

All operations are logged with the authenticated user's email:

```
User user@example.com attempting to update their own profile
Profile update is for authenticated user: user@example.com (original email: user@example.com)
✅ Email updated for authenticated user user@example.com: user@example.com → newemail@example.com
✅ Password updated for authenticated user: user@example.com
✅ Profile update completed successfully for authenticated user: user@example.com
```

## Files Modified

1. **UserController.java**: 
   - Added clear security enforcement
   - Uses authenticated user from Spring Security context
   - No possibility of cross-user updates

2. **UserProfileUpdateRequest.java**:
   - Removed @Email validation (allows any string)
   - Clarified that it updates authenticated user only
   - Optional email and password fields

## Important Notes

⚠️ **After Email Update**: The user's email is changed in the database, but their current session remains valid. The user can continue using the application with the old credentials until they log out and log back in with the new email.

⚠️ **After Password Update**: Old password will no longer work. User must use the new password for next login.

✅ **Admin Cannot Bypass**: Even admin users must use this endpoint to update their own profile. Admins use `/admin/update-user` to update OTHER users' profiles, but it requires admin permissions and the target email parameter.
