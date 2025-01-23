# Authentication Documentation

## Overview

FormChat implements a secure authentication system using JSON Web Tokens (JWT) for managing admin sessions and protecting sensitive routes. The system is designed for admin-only access with secure password handling and comprehensive logging.

## Authentication Flow

### Admin Login
```javascript
POST /auth/login

Request:
{
  "username": "string",
  "password": "string"
}

Response:
{
  "token": "jwt_token"  // Valid for 24 hours
}
```

### Admin Logout
```javascript
POST /auth/logout

Response:
{
  "message": "Logged out successfully"
}
```

### Change Password
```javascript
POST /auth/change-password

Request:
{
  "currentPassword": "string",
  "newPassword": "string"  // Must be at least 8 characters
}

Response:
{
  "message": "Password updated successfully"
}

Error Responses:
{
  "message": "Current password is incorrect"  // 401
}
{
  "message": "New password must be at least 8 characters long"  // 400
}
```

## Database Schema

### Admins Table
```sql
CREATE TABLE admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Security Implementation

### Password Handling
- Passwords are hashed using bcrypt with salt
- Password comparison uses bcrypt.compare()
- Minimum password length: 8 characters
- Password change requires current password verification

### JWT Implementation
- Token generation: `jwt.sign(payload, secret, options)`
- Payload contains: `{ id, username }`
- Token expiration: 24 hours
- Secret key from environment variable: `JWT_SECRET`

### Protected Routes
All admin routes are protected using the auth middleware which:
1. Extracts JWT from Authorization header
2. Verifies token validity
3. Adds admin info to request object: `req.admin`

Example protected route header:
```
Authorization: Bearer <jwt_token>
```

## Error Handling

### Login Errors
- Missing credentials (400)
```json
{
  "error": "Username and password are required"
}
```

- Invalid credentials (401)
```json
{
  "error": "Invalid credentials"
}
```

### Password Change Errors
- Missing data (400)
```json
{
  "message": "Current password and new password are required"
}
```

- Invalid password length (400)
```json
{
  "message": "New password must be at least 8 characters long"
}
```

- Incorrect current password (401)
```json
{
  "message": "Current password is incorrect"
}
```

### JWT Errors
- Missing token (401)
- Invalid token (401)
- Expired token (401)

## Logging

The authentication system includes comprehensive logging:

### Login Events
- Login attempts
- Password validation results
- Successful logins
- Failed login attempts

### Password Changes
- Password change attempts
- Validation failures
- Successful password updates
- Error conditions

### Security Events
- Invalid token attempts
- Unauthorized access attempts
- System errors

## Best Practices

1. Password Security
   - Passwords are never stored in plain text
   - Bcrypt is used for secure hashing
   - Minimum password length enforced
   - Password change requires verification

2. Token Security
   - Short expiration time (24 hours)
   - Secure secret key management
   - Token invalidation on logout

3. Error Handling
   - Generic error messages for security
   - Comprehensive error logging
   - Proper HTTP status codes

4. Logging
   - Sensitive data is never logged
   - All security events are logged
   - Structured logging format

## Environment Variables

Required environment variables:
```
JWT_SECRET=your-secret-key
```

## API Routes Summary

- `POST /auth/login` - Admin login
- `POST /auth/logout` - Admin logout
- `POST /auth/change-password` - Change admin password (protected)
