# Security Architecture

## Authentication & Authorization

### JWT Token Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user_uuid",
    "email": "user@business.com",
    "business_id": "business_uuid",
    "iat": 1640995200,
    "exp": 1641081600,
    "iss": "kpi-dashboard",
    "aud": "kpi-dashboard-users"
  }
}
```

### Security Measures

- **Password Hashing:** bcrypt with salt rounds (12)
- **JWT Secret:** Environment variable with high entropy
- **Token Expiration:** 24-hour access tokens, 7-day refresh tokens
- **HTTPS Only:** All communication encrypted in transit
- **CORS Configuration:** Restrictive cross-origin policies

## Data Protection

### Encryption Strategy

- **At Rest:** Database encryption with PostgreSQL encryption
- **In Transit:** TLS 1.3 for all API communications
- **Sensitive Data:** API credentials encrypted before storage
- **Backup Encryption:** Automated backups encrypted with AES-256

### GDPR Compliance

- **Data Minimization:** Only collect necessary business metrics
- **User Rights:** Right to access, rectify, and delete personal data
- **Data Portability:** Export user data in machine-readable format
- **Consent Management:** Clear consent for data collection and processing

## API Security

### Rate Limiting

```typescript
interface RateLimitConfig {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false
}
```

### Input Validation

- **Request Sanitization:** Sanitize all user inputs
- **SQL Injection Prevention:** Parameterized queries with Prisma
- **XSS Protection:** Content Security Policy headers
- **CSRF Protection:** CSRF tokens for state-changing operations
