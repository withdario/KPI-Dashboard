# Data Synchronization API

The Data Synchronization API provides automated data synchronization capabilities for Google Analytics 4, n8n webhooks, and data cleanup operations. This service ensures dashboard data is always current and reliable through scheduled synchronization jobs.

## Base URL

```
/api/sync
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

All sync endpoints are rate-limited to 100 requests per 15-minute window per IP address.

## Endpoints

### 1. Sync Jobs Management

#### Get Sync Jobs

Retrieve synchronization jobs with optional filtering.

```http
GET /api/sync/jobs
```

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `businessEntityId` | string | Filter by business entity ID | `?businessEntityId=be_123` |
| `jobType` | string | Filter by job type | `?jobType=ga4_daily` |
| `status` | string | Filter by job status | `?status=completed` |
| `startDate` | string | Filter by start date (ISO format) | `?startDate=2024-01-01` |
| `endDate` | string | Filter by end date (ISO format) | `?endDate=2024-01-31` |
| `limit` | number | Maximum number of results | `?limit=50` |
| `offset` | number | Number of results to skip | `?offset=100` |

**Job Types:**
- `ga4_daily` - Google Analytics 4 daily synchronization
- `n8n_realtime` - n8n webhook real-time processing
- `manual` - Manually triggered synchronization
- `cleanup` - Data cleanup and archival

**Job Statuses:**
- `pending` - Job is queued for execution
- `running` - Job is currently executing
- `completed` - Job completed successfully
- `failed` - Job failed execution
- `cancelled` - Job was cancelled

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "job_123",
      "businessEntityId": "be_123",
      "jobType": "ga4_daily",
      "status": "completed",
      "startTime": "2024-01-01T02:00:00Z",
      "endTime": "2024-01-01T02:05:00Z",
      "duration": 300000,
      "errorMessage": null,
      "errorCode": null,
      "retryCount": 0,
      "maxRetries": 3,
      "nextRetryAt": null,
      "metadata": {
        "source": "cron_scheduled"
      },
      "createdAt": "2024-01-01T02:00:00Z",
      "updatedAt": "2024-01-01T02:05:00Z"
    }
  ],
  "count": 1
}
```

#### Get Sync Job by ID

Retrieve a specific synchronization job by its ID.

```http
GET /api/sync/jobs/{id}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Sync job ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "job_123",
    "businessEntityId": "be_123",
    "jobType": "ga4_daily",
    "status": "completed",
    "startTime": "2024-01-01T02:00:00Z",
    "endTime": "2024-01-01T02:05:00Z",
    "duration": 300000,
    "errorMessage": null,
    "errorCode": null,
    "retryCount": 0,
    "maxRetries": 3,
    "nextRetryAt": null,
    "metadata": {
      "source": "cron_scheduled"
    },
    "createdAt": "2024-01-01T02:00:00Z",
    "updatedAt": "2024-01-01T02:05:00Z"
  }
}
```

#### Get Sync Job Statistics

Retrieve synchronization statistics for a business entity.

```http
GET /api/sync/stats/{businessEntityId}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `businessEntityId` | string | Business entity ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "totalJobs": 100,
    "completedJobs": 95,
    "failedJobs": 3,
    "runningJobs": 1,
    "pendingJobs": 1,
    "averageDuration": 4500,
    "successRate": 95.0,
    "lastSyncAt": "2024-01-01T02:00:00Z"
  }
}
```

### 2. Sync Configuration Management

#### Create Sync Configuration

Create a new synchronization configuration for a business entity.

```http
POST /api/sync/config
```

**Request Body:**

```json
{
  "businessEntityId": "be_123",
  "ga4SyncEnabled": true,
  "ga4SyncSchedule": "0 2 * * *",
  "n8nSyncEnabled": true,
  "n8nSyncSchedule": "*/5 * * * *",
  "cleanupSyncEnabled": true,
  "cleanupSyncSchedule": "0 3 * * 0",
  "retryConfig": {
    "maxRetries": 3,
    "initialDelay": 60000,
    "maxDelay": 3600000,
    "backoffMultiplier": 2
  },
  "alerting": {
    "enabled": true,
    "emailRecipients": ["admin@example.com"],
    "slackWebhook": "https://hooks.slack.com/..."
  }
}
```

**Schedule Format (Cron Expressions):**

| Schedule | Description | Example |
|----------|-------------|---------|
| `0 2 * * *` | Daily at 2 AM UTC | GA4 daily sync |
| `*/5 * * * *` | Every 5 minutes | n8n real-time sync |
| `0 3 * * 0` | Weekly on Sunday at 3 AM UTC | Data cleanup |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "config_123",
    "businessEntityId": "be_123",
    "ga4SyncEnabled": true,
    "ga4SyncSchedule": "0 2 * * *",
    "n8nSyncEnabled": true,
    "n8nSyncSchedule": "*/5 * * * *",
    "cleanupSyncEnabled": true,
    "cleanupSyncSchedule": "0 3 * * 0",
    "retryConfig": {
      "maxRetries": 3,
      "initialDelay": 60000,
      "maxDelay": 3600000,
      "backoffMultiplier": 2
    },
    "alerting": {
      "enabled": true,
      "emailRecipients": ["admin@example.com"],
      "slackWebhook": "https://hooks.slack.com/..."
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Get Sync Configuration

Retrieve synchronization configuration for a business entity.

```http
GET /api/sync/config/{businessEntityId}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `businessEntityId` | string | Business entity ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "config_123",
    "businessEntityId": "be_123",
    "ga4SyncEnabled": true,
    "ga4SyncSchedule": "0 2 * * *",
    "n8nSyncEnabled": true,
    "n8nSyncSchedule": "*/5 * * * *",
    "cleanupSyncEnabled": true,
    "cleanupSyncSchedule": "0 3 * * 0",
    "retryConfig": {
      "maxRetries": 3,
      "initialDelay": 60000,
      "maxDelay": 3600000,
      "backoffMultiplier": 2
    },
    "alerting": {
      "enabled": true,
      "emailRecipients": ["admin@example.com"],
      "slackWebhook": "https://hooks.slack.com/..."
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Update Sync Configuration

Update synchronization configuration for a business entity.

```http
PUT /api/sync/config/{businessEntityId}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `businessEntityId` | string | Business entity ID |

**Request Body:**

```json
{
  "ga4SyncEnabled": false,
  "ga4SyncSchedule": "0 3 * * *",
  "retryConfig": {
    "maxRetries": 5
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "config_123",
    "businessEntityId": "be_123",
    "ga4SyncEnabled": false,
    "ga4SyncSchedule": "0 3 * * *",
    "n8nSyncEnabled": true,
    "n8nSyncSchedule": "*/5 * * * *",
    "cleanupSyncEnabled": true,
    "cleanupSyncSchedule": "0 3 * * 0",
    "retryConfig": {
      "maxRetries": 5,
      "initialDelay": 60000,
      "maxDelay": 3600000,
      "backoffMultiplier": 2
    },
    "alerting": {
      "enabled": true,
      "emailRecipients": ["admin@example.com"],
      "slackWebhook": "https://hooks.slack.com/..."
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T01:00:00Z"
  }
}
```

### 3. Manual Synchronization

#### Trigger Manual Sync

Manually trigger a synchronization job.

```http
POST /api/sync/manual
```

**Request Body:**

```json
{
  "businessEntityId": "be_123",
  "jobType": "ga4_daily",
  "metadata": {
    "reason": "data_verification",
    "user": "admin@example.com"
  }
}
```

**Response:**

```json
{
  "success": true,
  "jobId": "job_456",
  "message": "Manual sync completed successfully"
}
```

### 4. Health Monitoring

#### Get Sync Health Status

Retrieve the health status of the synchronization service for a business entity.

```http
GET /api/sync/health/{businessEntityId}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `businessEntityId` | string | Business entity ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "lastSyncAt": "2024-01-01T02:00:00Z",
    "activeJobs": 0,
    "failedJobs": 0,
    "averageSyncTime": 4500,
    "successRate": 95.0,
    "issues": []
  }
}
```

**Health Statuses:**

| Status | Description |
|--------|-------------|
| `healthy` | All systems operational |
| `degraded` | Some issues detected |
| `unhealthy` | Critical issues detected |

### 5. Service Management

#### Initialize Sync Service

Initialize the synchronization service (admin only).

```http
POST /api/sync/initialize
```

**Response:**

```json
{
  "success": true,
  "message": "Data synchronization service initialized successfully"
}
```

#### Shutdown Sync Service

Shutdown the synchronization service (admin only).

```http
POST /api/sync/shutdown
```

**Response:**

```json
{
  "success": true,
  "message": "Data synchronization service shut down successfully"
}
```

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**

| Status | Description |
|--------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Invalid or missing token |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Service error |

## Retry Logic

The synchronization service implements exponential backoff retry logic:

1. **Initial Delay**: 1 minute (60,000 ms)
2. **Backoff Multiplier**: 2x
3. **Maximum Delay**: 1 hour (3,600,000 ms)
4. **Maximum Retries**: 3 (configurable)

**Retry Schedule:**
- 1st retry: 1 minute delay
- 2nd retry: 2 minutes delay
- 3rd retry: 4 minutes delay
- 4th retry: 8 minutes delay (capped at 1 hour)

## Monitoring and Alerting

### Sync Job Monitoring

- **Real-time Status**: Track job execution status
- **Performance Metrics**: Monitor sync duration and success rates
- **Error Tracking**: Capture and log detailed error information
- **Retry Monitoring**: Track retry attempts and backoff schedules

### Alerting Configuration

- **Email Notifications**: Send alerts to configured recipients
- **Slack Integration**: Post alerts to Slack channels
- **Failure Thresholds**: Configure when alerts are triggered
- **Escalation Rules**: Define alert escalation procedures

### Health Checks

- **Service Status**: Monitor overall service health
- **Cron Job Status**: Verify scheduled jobs are running
- **Performance Metrics**: Track response times and throughput
- **Issue Detection**: Identify and report service issues

## Best Practices

### Configuration

1. **Schedule Optimization**: Set GA4 sync to off-peak hours
2. **Retry Configuration**: Adjust retry settings based on service reliability
3. **Alerting Setup**: Configure appropriate alerting for your team
4. **Monitoring**: Set up dashboards for sync performance

### Error Handling

1. **Log Analysis**: Review error logs for patterns
2. **Retry Logic**: Understand and optimize retry behavior
3. **Manual Intervention**: Use manual sync for troubleshooting
4. **Health Monitoring**: Regular health check reviews

### Performance

1. **Batch Processing**: Group related sync operations
2. **Resource Management**: Monitor system resource usage
3. **Concurrency Control**: Limit concurrent sync jobs
4. **Data Validation**: Verify sync data quality

## Examples

### Complete Sync Configuration

```json
{
  "businessEntityId": "be_123",
  "ga4SyncEnabled": true,
  "ga4SyncSchedule": "0 2 * * *",
  "n8nSyncEnabled": true,
  "n8nSyncSchedule": "*/5 * * * *",
  "cleanupSyncEnabled": true,
  "cleanupSyncSchedule": "0 3 * * 0",
  "retryConfig": {
    "maxRetries": 5,
    "initialDelay": 30000,
    "maxDelay": 1800000,
    "backoffMultiplier": 1.5
  },
  "alerting": {
    "enabled": true,
    "emailRecipients": [
      "admin@example.com",
      "devops@example.com"
    ],
    "slackWebhook": "https://hooks.slack.com/services/..."
  }
}
```

### Manual Sync Request

```json
{
  "businessEntityId": "be_123",
  "jobType": "ga4_daily",
  "metadata": {
    "reason": "data_recovery",
    "requestedBy": "admin@example.com",
    "priority": "high"
  }
}
```

### Health Check Response

```json
{
  "success": true,
  "data": {
    "status": "degraded",
    "lastSyncAt": "2024-01-01T02:00:00Z",
    "activeJobs": 2,
    "failedJobs": 1,
    "averageSyncTime": 5200,
    "successRate": 87.5,
    "issues": [
      "1 failed sync jobs",
      "Some cron jobs are not running"
    ]
  }
}
```

## Support

For technical support or questions about the Data Synchronization API:

- **Documentation**: Review this API documentation
- **Logs**: Check application logs for detailed error information
- **Health Checks**: Use health endpoints to diagnose issues
- **Manual Sync**: Test individual sync operations manually
- **Configuration**: Verify sync configuration settings
