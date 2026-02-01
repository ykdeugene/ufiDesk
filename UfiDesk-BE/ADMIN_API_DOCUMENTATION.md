# Admin Controller API Documentation

## Base URL
```
POST /admin/
GET /admin/
```

---

## Endpoints

### 1. Get All Users
**Endpoint:** `GET /admin/get-users`

**Description:** Retrieve all users with their email, admin status, and active status.

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "email": "superadmin@ufidesk.com",
      "admin": true,
      "active": true
    },
    {
      "email": "user@example.com",
      "admin": false,
      "active": true
    },
    {
      "email": "inactive-user@example.com",
      "admin": false,
      "active": false
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Success
- `500 Internal Server Error` - Server error

---

### 2. Update User
**Endpoint:** `POST /admin/update-user`

**Description:** Update user details including password, admin status, and active status.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "<encrypted-password>",
  "admin": true,
  "active": true,
  "updateTime": "2026-02-01T10:30:00Z"
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User's email address |
| password | string | Yes | Encrypted password (AES/CBC encrypted using email + updateTime) |
| admin | boolean | No | Set user as admin (default: false) |
| active | boolean | No | Set user as active/inactive (default: false) |
| updateTime | string | Yes | ISO-8601 timestamp when update was initiated |

**Response (Success):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "email": "user@example.com",
    "admin": true,
    "active": true
  }
}
```

**Error Responses:**

**Superadmin Deactivation Protection:**
```json
{
  "success": false,
  "message": "Cannot deactivate the superadmin account",
  "data": null
}
```
Status: `403 Forbidden`

**User Not Found:**
```json
{
  "success": false,
  "message": "Failed to update user: User not found: user@example.com",
  "data": null
}
```
Status: `400 Bad Request`

**Decryption Failure:**
```json
{
  "success": false,
  "message": "Failed to update user: Password decryption failed",
  "data": null
}
```
Status: `400 Bad Request`

**Status Codes:**
- `200 OK` - User updated successfully
- `403 Forbidden` - Attempted to deactivate superadmin
- `400 Bad Request` - Invalid request or operation failed
- `500 Internal Server Error` - Server error

---

### 3. Create User
**Endpoint:** `POST /admin/create-user`

**Description:** Create a new user account.

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "<encrypted-password>",
  "admin": false,
  "active": true,
  "createTime": "2026-02-01T10:35:00Z"
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | New user's email address |
| password | string | Yes | Encrypted password (AES/CBC encrypted using email + createTime) |
| admin | boolean | No | Create user as admin (default: false) |
| active | boolean | No | Create user as active/inactive (default: false) |
| createTime | string | Yes | ISO-8601 timestamp when creation was initiated |

**Response (Success):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "email": "newuser@example.com",
    "admin": false,
    "active": true
  }
}
```

**Error Responses:**

**User Already Exists:**
```json
{
  "success": false,
  "message": "User already exists: newuser@example.com",
  "data": null
}
```
Status: `409 Conflict`

**Invalid Email Format:**
```json
{
  "success": false,
  "message": "Email is required",
  "data": null
}
```
Status: `400 Bad Request`

**Decryption Failure:**
```json
{
  "success": false,
  "message": "Failed to create user: Password decryption failed",
  "data": null
}
```
Status: `400 Bad Request`

**Status Codes:**
- `201 Created` - User created successfully
- `400 Bad Request` - Invalid request or validation error
- `409 Conflict` - User already exists
- `500 Internal Server Error` - Server error

---

## Security Features

### 1. Superadmin Protection
- The account `superadmin@ufidesk.com` **cannot be deactivated**
- Attempting to deactivate it returns `403 Forbidden`
- All other user modifications are allowed

### 2. Password Encryption
- Passwords are transmitted **encrypted** (AES/CBC)
- Encrypted using: `SHA256(email + ":" + timestamp)`
- Server decrypts before hashing with BCrypt
- Plaintext passwords never visible in network traffic

### 3. Audit Logging
- All operations are logged with timestamps
- Changes are tracked (previous → new values)
- Failures are logged with error details
- User-friendly emoji indicators in logs

---

## Encryption/Decryption Example

### Frontend (JavaScript)
```javascript
import CryptoJS from 'crypto-js';

function encryptPassword(email, password, timestamp) {
    // Derive key
    const keyHash = CryptoJS.SHA256(email + ":" + timestamp);
    const key = CryptoJS.enc.Hex.parse(keyHash.toString());
    
    // Derive IV
    const ivHash = CryptoJS.SHA256(email + ":IV:" + timestamp);
    const iv = CryptoJS.enc.Hex.parse(ivHash.toString().substring(0, 32));
    
    // Encrypt
    const encrypted = CryptoJS.AES.encrypt(password, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    }).toString();
    
    return encrypted;
}

// Usage
const createTime = new Date().toISOString();
const email = "newuser@example.com";
const password = "UserPassword123!";
const encryptedPassword = encryptPassword(email, password, createTime);

const request = {
    email: email,
    password: encryptedPassword,
    admin: false,
    active: true,
    createTime: createTime
};
```

### Backend (Java)
```java
// Decryption happens automatically in AdminController
// using EncryptionUtils.decryptPassword(encryptedPassword, email, createTime)
```

---

## Usage Examples

### cURL Examples

#### Get All Users
```bash
curl -X GET http://localhost:8080/admin/get-users
```

#### Create New User
```bash
curl -X POST http://localhost:8080/admin/create-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "<encrypted-password>",
    "admin": false,
    "active": true,
    "createTime": "2026-02-01T10:35:00Z"
  }'
```

#### Update User
```bash
curl -X POST http://localhost:8080/admin/update-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "<encrypted-password>",
    "admin": true,
    "active": true,
    "updateTime": "2026-02-01T10:40:00Z"
  }'
```

#### Try to Deactivate Superadmin (Will Fail)
```bash
curl -X POST http://localhost:8080/admin/update-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@ufidesk.com",
    "password": "<encrypted-password>",
    "admin": true,
    "active": false,
    "updateTime": "2026-02-01T10:45:00Z"
  }'
```

Response:
```json
{
  "success": false,
  "message": "Cannot deactivate the superadmin account",
  "data": null
}
```
Status: `403 Forbidden`

---

## Console Logging

When operations are performed, you'll see detailed logs:

```
[INFO] Attempting to create new user: newuser@example.com
[DEBUG] Decrypting password for new user: newuser@example.com
[INFO] ✅ User created successfully: newuser@example.com (admin: false, active: true)

[INFO] Attempting to update user: user@example.com
[DEBUG] Updating password for user: user@example.com
[INFO] Admin status changed for user user@example.com: false → true
[INFO] ✅ User updated successfully: user@example.com

[WARN] ⚠️  Attempted to deactivate superadmin account: superadmin@ufidesk.com
```

---

## Common Issues & Troubleshooting

| Issue | Solution |
|-------|----------|
| Email not provided | Ensure `email` field is in request and non-empty |
| Password not provided | Ensure `password` field contains encrypted password |
| Timestamp format invalid | Use ISO-8601 format: `2026-02-01T10:30:00Z` |
| User not found | Verify email address exists in database |
| Decryption fails | Ensure encryption key derivation matches (email + timestamp) |
| Cannot deactivate superadmin | This is protected - use different email |

---

## Notes

- All timestamps must be in **ISO-8601 format** (e.g., `2026-02-01T10:30:00Z`)
- Passwords must be **encrypted on frontend** before transmission
- The `admin` field determines if user has admin privileges
- The `active` field determines if user account is enabled/disabled
- Superadmin account is immune to deactivation for security
