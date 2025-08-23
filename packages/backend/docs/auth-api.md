# Authentication API Documentation

## Overview

The Authentication API provides secure user authentication, registration, and account management functionality. All endpoints use JWT tokens for authentication and include comprehensive input validation and rate limiting.

## Base URL

```
http://localhost:3000/api/auth
```

## Authentication Flow

1. **User Registration** → POST `/register`
2. **User Login** → POST `/login` → Receive JWT token
3. **Use JWT Token** → Include in `Authorization: Bearer <token>` header
4. **Token Refresh** → POST `/refresh` when token expires

## Endpoints

### 1. User Registration

**POST** `/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER",
      "isEmailVerified": false
    },
    "token": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

**Validation Rules:**
- Email: Valid email format
- Password: Minimum 8 characters, 1 lowercase, 1 uppercase, 1 number
- First/Last Name: Optional, 1-50 characters

### 2. User Login

**POST** `/login`

Authenticate user and receive JWT tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER",
      "isEmailVerified": false
    },
    "token": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

### 3. Get Current User

**GET** `/me`

Get information about the currently authenticated user.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
{
  "message": "User info retrieved successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "isEmailVerified": false
  }
}
```

### 4. Password Reset Request

**POST** `/forgot-password`

Request a password reset link (always returns success for security).

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "If an account with that email exists, a password reset link has been sent"
}
```

### 5. Password Reset

**POST** `/reset-password`

Reset password using a valid reset token.

**Request Body:**
```json
{
  "token": "reset-token",
  "newPassword": "NewSecurePass123"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset successfully"
}
```

### 6. Email Verification

**POST** `/verify-email`

Verify email address using verification token.

**Request Body:**
```json
{
  "token": "verification-token"
}
```

**Response (200 OK):**
```json
{
  "message": "Email verified successfully"
}
```

### 7. Token Refresh

**POST** `/refresh`

Refresh expired JWT token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh-token"
}
```

**Response (200 OK):**
```json
{
  "message": "Token refreshed successfully",
  "data": {
    "token": "new-jwt-token"
  }
}
```

### 8. User Logout

**POST** `/logout`

Logout user (client should discard tokens).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
{
  "message": "Logout successful"
}
```

## Security Features

### Rate Limiting
- **Authentication endpoints**: 100 requests per 15 minutes (test), 5 requests per 15 minutes (production)
- **Password reset**: 3 requests per hour
- **General API**: 100 requests per 15 minutes

### JWT Token Security
- **Access Token**: 24-hour expiration
- **Refresh Token**: 7-day expiration
- **Secret**: Stored in environment variables

### Password Security
- **Hashing**: bcrypt with 12 salt rounds
- **Validation**: Minimum 8 characters, complexity requirements
- **Reset**: Secure tokens with 1-hour expiration

### Input Validation
- **Email**: Normalized and validated
- **Password**: Complexity requirements enforced
- **Names**: Length and sanitization
- **Tokens**: Required field validation

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "details": [
    {
      "field": "field-name",
      "message": "Validation message",
      "value": "invalid-value"
    }
  ]
}
```

## HTTP Status Codes

- **200**: Success
- **201**: Created (registration)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid credentials)
- **403**: Forbidden (invalid token)
- **429**: Too Many Requests (rate limited)
- **500**: Internal Server Error

## Testing

The authentication system includes comprehensive test coverage:

- **Unit Tests**: 16 tests covering all endpoints
- **Validation Tests**: Input validation and error handling
- **Security Tests**: Rate limiting and token validation
- **Integration Tests**: End-to-end authentication flows

## Environment Variables

```bash
JWT_SECRET=your-secret-key
BCRYPT_SALT_ROUNDS=12
NODE_ENV=development|test|production
```

## Rate Limiting Configuration

Rate limits are automatically adjusted based on environment:
- **Test Environment**: More lenient limits for testing
- **Production Environment**: Strict security limits
- **Development Environment**: Balanced limits
