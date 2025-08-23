# Google Analytics 4 API Integration

This document describes the Google Analytics 4 (GA4) API integration for the Business Intelligence Platform.

## Overview

The Google Analytics 4 integration provides:
- OAuth2 authentication flow for secure access to GA4 data
- Basic metrics retrieval (sessions, users, pageviews)
- Automatic token refresh management
- Rate limiting and error handling
- Secure credential storage (when database integration is complete)

## Prerequisites

### 1. Google Cloud Project Setup
1. Create a new project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Google Analytics Data API v1
3. Create OAuth2 credentials (Web application type)
4. Configure authorized redirect URIs

### 2. Environment Variables
Add the following to your `.env` file:

```bash
# Google Analytics 4 API Configuration
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/google-analytics/auth/callback"
GOOGLE_ANALYTICS_PROPERTY_ID="your-ga4-property-id"
```

### 3. GA4 Property ID
- Find your GA4 property ID in Google Analytics
- Property IDs are typically numeric (e.g., "123456789")
- This is used to identify which GA4 property to query

## API Endpoints

### 1. Generate Authorization URL
**GET** `/api/google-analytics/auth/url`

Generates the OAuth2 authorization URL for Google Analytics.

**Query Parameters:**
- `state` (optional): Custom state parameter for security

**Response:**
```json
{
  "success": true,
  "data": {
    "authUrl": "https://accounts.google.com/oauth2/auth?...",
    "state": "default"
  }
}
```

**Example:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/google-analytics/auth/url?state=custom-state"
```

### 2. Exchange Authorization Code
**POST** `/api/google-analytics/auth/callback`

Exchanges the authorization code for access and refresh tokens.

**Request Body:**
```json
{
  "code": "authorization_code_from_google",
  "businessEntityId": "business_entity_uuid",
  "propertyId": "123456789"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Authorization successful",
    "propertyId": "123456789",
    "businessEntityId": "business_entity_uuid",
    "tokenExpiry": "2024-01-01T12:00:00.000Z"
  }
}
```

**Example:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "4/0AfJohXn...",
    "businessEntityId": "uuid-here",
    "propertyId": "123456789"
  }' \
  "http://localhost:3000/api/google-analytics/auth/callback"
```

### 3. Refresh Access Token
**POST** `/api/google-analytics/refresh-token`

Refreshes an expired access token using the refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Token refreshed successfully",
    "tokenExpiry": "2024-01-01T12:00:00.000Z"
  }
}
```

### 4. Get Basic Metrics
**GET** `/api/google-analytics/metrics`

Retrieves basic metrics from Google Analytics 4.

**Query Parameters:**
- `propertyId`: GA4 property ID (required)
- `startDate`: Start date in YYYY-MM-DD format (required)
- `endDate`: End date in YYYY-MM-DD format (required)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-01",
      "sessions": 100,
      "users": 50,
      "pageviews": 200
    }
  ]
}
```

**Example:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/google-analytics/metrics?propertyId=123456789&startDate=2024-01-01&endDate=2024-01-31"
```

### 5. Health Check
**GET** `/api/google-analytics/health`

Checks the health and configuration of the Google Analytics service.

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Google Analytics service is healthy",
    "status": "operational",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

## OAuth2 Flow

### 1. Authorization Flow
1. **Generate Auth URL**: Call `/auth/url` to get the Google OAuth2 authorization URL
2. **User Authorization**: Redirect user to the generated URL
3. **Callback**: Google redirects back with an authorization code
4. **Token Exchange**: Exchange the code for access and refresh tokens
5. **Store Tokens**: Store tokens securely (database integration pending)

### 2. Token Management
- **Access Token**: Valid for 1 hour, used for API calls
- **Refresh Token**: Long-lived, used to get new access tokens
- **Automatic Refresh**: Service automatically refreshes expired tokens

## Rate Limiting

The Google Analytics API endpoints are rate-limited to:
- **100 requests per 15 minutes** per IP address
- Exceeds return HTTP 429 (Too Many Requests)

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Missing required fields: code, businessEntityId, propertyId"
}
```

**400 Bad Request (Invalid Property ID):**
```json
{
  "success": false,
  "error": "Invalid GA4 property ID format"
}
```

**400 Bad Request (Invalid Date Format):**
```json
{
  "success": false,
  "error": "Invalid date format. Use YYYY-MM-DD"
}
```

**429 Too Many Requests:**
```json
{
  "success": false,
  "error": "Too many requests to Google Analytics API, please try again later."
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Authorization failed",
  "details": "Token exchange failed: invalid_grant"
}
```

## Security Considerations

### 1. OAuth2 Security
- Uses `access_type: 'offline'` to get refresh tokens
- Implements state parameter for CSRF protection
- Tokens are encrypted when stored (database integration pending)

### 2. API Security
- All endpoints require JWT authentication
- Rate limiting prevents abuse
- Input validation for all parameters

### 3. Data Privacy
- Only requests necessary scopes
- No sensitive data logged
- Secure token storage

## Testing

### Unit Tests
Run the Google Analytics service tests:

```bash
npm test -- --testPathPattern=googleAnalytics.test.ts
```

### Manual Testing
1. Set up environment variables
2. Test OAuth2 flow with a real Google account
3. Verify metrics retrieval with actual GA4 data

## Troubleshooting

### Common Issues

**1. "Invalid property ID" error**
- Ensure property ID is numeric only
- Verify the property exists in your GA4 account

**2. "Missing environment variables" error**
- Check all required environment variables are set
- Verify no typos in variable names

**3. OAuth2 flow failures**
- Verify redirect URI matches exactly
- Check Google Cloud Console OAuth2 configuration
- Ensure API is enabled

**4. Rate limiting errors**
- Implement exponential backoff
- Reduce request frequency
- Monitor API quota usage

### Debug Mode
Enable debug logging by setting:
```bash
LOG_LEVEL="debug"
```

## Future Enhancements

### Planned Features
1. **Database Integration**: Secure token storage in database
2. **Advanced Metrics**: Custom metrics and dimensions
3. **Real-time Data**: WebSocket support for live updates
4. **Data Caching**: Redis-based caching for performance
5. **Batch Processing**: Bulk data retrieval for large datasets

### Integration Points
1. **Dashboard**: Real-time metrics display
2. **Data Pipeline**: ETL processing for analytics
3. **Reporting**: Automated report generation
4. **Alerts**: Threshold-based notifications

## Support

For issues or questions:
1. Check the logs for detailed error messages
2. Verify environment configuration
3. Test with Google's OAuth2 playground
4. Review Google Analytics Data API documentation

## References

- [Google Analytics Data API v1](https://developers.google.com/analytics/devguides/reporting/data/v1)
- [Google OAuth2 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GA4 Property Setup](https://support.google.com/analytics/answer/10089681)
