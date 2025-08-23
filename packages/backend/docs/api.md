# Business Intelligence Platform API Documentation

## Overview

The Business Intelligence Platform API provides a comprehensive backend service for user management, business entity management, and system monitoring.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://api.yourdomain.com`

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Health Check and Monitoring

### GET /api/health

Returns comprehensive system health information.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-22T10:30:00.000Z",
  "uptime": {
    "seconds": 3600,
    "minutes": 60,
    "hours": 1
  },
  "environment": "development",
  "version": "1.0.0",
  "metrics": {
    "totalRequests": 150,
    "successfulRequests": 145,
    "failedRequests": 5,
    "averageResponseTime": 45,
    "lastHealthCheck": "2025-01-22T10:30:00.000Z"
  },
  "system": {
    "nodeVersion": "v20.10.5",
    "platform": "darwin",
    "memoryUsage": {
      "rss": 12345678,
      "heapTotal": 9876543,
      "heapUsed": 5432109,
      "external": 123456
    },
    "cpuUsage": {
      "user": 123456,
      "system": 654321
    }
  }
}
```

**Response (503 Service Unavailable):**
```json
{
  "status": "unhealthy",
  "timestamp": "2025-01-22T10:30:00.000Z",
  "uptime": {
    "seconds": 0,
    "minutes": 0,
    "hours": 0
  },
  "environment": "development",
  "version": "1.0.0",
  "metrics": {
    "totalRequests": 0,
    "successfulRequests": 0,
    "failedRequests": 0,
    "averageResponseTime": 0,
    "lastHealthCheck": "2025-01-22T10:30:00.000Z"
  },
  "system": {
    "nodeVersion": "v20.10.5",
    "platform": "darwin",
    "memoryUsage": {
      "rss": 12345678,
      "heapTotal": 9876543,
      "heapUsed": 5432109,
      "external": 123456
    },
    "cpuUsage": {
      "user": 123456,
      "system": 654321
    }
  }
}
```

### GET /api/metrics

Returns detailed system performance metrics.

**Response (200 OK):**
```json
{
  "timestamp": "2025-01-22T10:30:00.000Z",
  "uptime": {
    "milliseconds": 3600000,
    "seconds": 3600,
    "minutes": 60,
    "hours": 1,
    "days": 0
  },
  "requests": {
    "total": 150,
    "successful": 145,
    "failed": 5,
    "successRate": "96.67%"
  },
  "performance": {
    "averageResponseTime": 45,
    "requestsPerMinute": 2.5
  },
  "system": {
    "nodeVersion": "v20.10.5",
    "platform": "darwin",
    "arch": "x64",
    "memoryUsage": {
      "rss": 12345678,
      "heapTotal": 9876543,
      "heapUsed": 5432109,
      "external": 123456
    },
    "cpuUsage": {
      "user": 123456,
      "system": 654321
    },
    "pid": 12345
  }
}
```

## Error Handling

All API endpoints return standardized error responses:

```json
{
  "error": {
    "message": "Error description",
    "code": "ErrorCode",
    "requestId": "unique-request-id",
    "timestamp": "2025-01-22T10:30:00.000Z",
    "path": "/api/endpoint"
  }
}
```

### Common HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Access denied
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource conflict
- **422 Unprocessable Entity**: Validation failed
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error
- **503 Service Unavailable**: Service unavailable

### Error Codes

- **ValidationError**: Input validation failed
- **CastError**: Invalid ID format
- **JsonWebTokenError**: Invalid JWT token
- **TokenExpiredError**: JWT token expired
- **UnauthorizedError**: User not authenticated
- **ForbiddenError**: User not authorized
- **NotFoundError**: Resource not found
- **ConflictError**: Resource conflict
- **InternalError**: Internal server error

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General endpoints**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **Password reset**: 3 requests per hour per IP

Rate limit information is included in response headers:
- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Remaining requests in current window
- `RateLimit-Reset`: Time when the rate limit resets

## Request Logging

All requests are logged with:
- Unique request ID
- HTTP method and URL
- Client IP address
- User agent
- Response status code
- Response time
- Timestamp

## Security Headers

The API includes security headers via Helmet:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (in production)
- `Content-Security-Policy`

## CORS Configuration

CORS is configured to allow:
- Origin: Configurable via `CORS_ORIGIN` environment variable
- Credentials: `true`
- Methods: GET, POST, PUT, DELETE, PATCH
- Headers: Content-Type, Authorization

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:3001 |
| `LOG_LEVEL` | Logging level | info |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## Monitoring and Observability

The API provides comprehensive monitoring:

1. **Health Checks**: Real-time system health status
2. **Metrics**: Request counts, response times, success rates
3. **Logging**: Structured logging with request correlation
4. **Error Tracking**: Standardized error responses with context
5. **Performance Monitoring**: Response time tracking and analysis

## Development

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Running Locally

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm start            # Start production server
```

### Database

```bash
npm run db:generate   # Generate Prisma client
npm run db:migrate    # Run database migrations
npm run db:studio     # Open Prisma Studio
npm run db:seed       # Seed database
npm run db:reset      # Reset database
```
