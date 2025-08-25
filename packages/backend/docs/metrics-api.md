# Metrics Storage API Documentation

## Overview

The Metrics Storage API provides comprehensive functionality for storing, retrieving, and managing business metrics, automation execution records, and historical data archives. This system is designed to support multi-tenant business intelligence applications with efficient data storage and retrieval capabilities.

## Base URL

```
http://localhost:3000/api/metrics
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

All endpoints are subject to rate limiting:
- General API: 100 requests per 15 minutes
- Webhook endpoints: 1000 requests per 15 minutes

## Data Models

### Metric

Stores business metrics with flexible metadata support.

```typescript
interface Metric {
  id: string;
  businessEntityId: string;
  metricType: MetricType;
  metricName: string;
  metricValue: number;
  metricUnit?: string;
  source: MetricSource;
  sourceId?: string;
  date: Date;
  timezone: string;
  metadata: Record<string, any>;
  tags: string[];
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### AutomationExecution

Tracks automation workflow executions with detailed status and performance data.

```typescript
interface AutomationExecution {
  id: string;
  businessEntityId: string;
  automationType: AutomationType;
  automationName: string;
  executionId: string;
  status: AutomationStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  triggerType: TriggerType;
  triggerData: Record<string, any>;
  inputData: Record<string, any>;
  outputData: Record<string, any>;
  errorMessage?: string;
  errorCode?: string;
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: Date;
  metadata: Record<string, any>;
  tags: string[];
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### DataArchive

Stores archived data for historical analysis and compliance.

```typescript
interface DataArchive {
  id: string;
  businessEntityId: string;
  archiveType: ArchiveType;
  sourceTable: string;
  sourceRecordId: string;
  archivedData: Record<string, any>;
  archiveDate: Date;
  retentionPolicy: string;
  compressionRatio?: number;
  storageLocation?: string;
  isRestorable: boolean;
  createdAt: Date;
}
```

## Enums

### MetricType
- `ga4_pageview` - Google Analytics 4 pageview metrics
- `ga4_session` - Google Analytics 4 session metrics
- `ga4_user` - Google Analytics 4 user metrics
- `n8n_workflow_execution` - n8n workflow execution metrics
- `custom` - Custom business metrics

### MetricSource
- `google_analytics` - Data from Google Analytics
- `n8n` - Data from n8n automation platform
- `custom` - Custom data sources

### AutomationType
- `n8n_workflow` - n8n workflow automations
- `zapier_automation` - Zapier automations
- `custom_script` - Custom automation scripts

### AutomationStatus
- `running` - Automation is currently executing
- `completed` - Automation completed successfully
- `failed` - Automation failed with an error
- `cancelled` - Automation was cancelled
- `pending` - Automation is waiting to start

### TriggerType
- `scheduled` - Time-based triggers
- `manual` - Manual execution
- `webhook` - Webhook-based triggers
- `event_based` - Event-driven triggers

### ArchiveType
- `metrics` - Archived metrics data
- `automation_executions` - Archived automation records
- `webhook_events` - Archived webhook events

## Endpoints

### Dashboard Data Endpoints

#### GET /api/metrics/summary
Get metrics summary for a business entity with caching (2 minutes).

**Query Parameters:**
- `businessEntityId` (required): Business entity identifier
- `startDate` (required): Start date in ISO format
- `endDate` (required): End date in ISO format

**Response:**
```json
{
  "success": true,
  "data": {
    "totalMetrics": 150,
    "totalAutomations": 25,
    "successRate": 92.0,
    "averageExecutionTime": 45000
  }
}
```

#### GET /api/metrics/history
Get historical metrics data for trend analysis with caching (5 minutes).

**Query Parameters:**
- `businessEntityId` (required): Business entity identifier
- `startDate` (required): Start date in ISO format
- `endDate` (required): End date in ISO format
- `metricType` (optional): Filter by specific metric type
- `aggregation` (optional): Aggregation period (daily, weekly, monthly, default: daily)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "period": "2024-01-01",
      "metrics": [
        {
          "metricType": "traffic",
          "metricName": "pageviews",
          "totalValue": 1250,
          "averageValue": 1250,
          "count": 1
        }
      ]
    }
  ]
}
```

#### GET /api/automation/performance
Get automation performance metrics and insights with caching (3 minutes).

**Query Parameters:**
- `businessEntityId` (required): Business entity identifier
- `startDate` (required): Start date in ISO format
- `endDate` (required): End date in ISO format
- `automationType` (optional): Filter by automation type

**Response:**
```json
{
  "success": true,
  "data": {
    "totalExecutions": 150,
    "successfulExecutions": 138,
    "failedExecutions": 12,
    "successRate": 92.0,
    "averageExecutionTime": 45000,
    "totalTimeSaved": 6750000,
    "costSavings": 93.75,
    "topPerformingAutomations": [
      {
        "automationId": "exec-123",
        "automationName": "Email Campaign Automation",
        "successRate": 95.0,
        "averageExecutionTime": 30000,
        "totalExecutions": 50
      }
    ],
    "performanceTrends": [
      {
        "date": "2020-01-01",
        "successRate": 90.0,
        "averageExecutionTime": 50000,
        "totalExecutions": 10
      }
    ]
  }
}
```

#### GET /api/insights/business
Get business insights and recommendations with caching (10 minutes).

**Query Parameters:**
- `businessEntityId` (required): Business entity identifier
- `startDate` (required): Start date in ISO format
- `endDate` (required): End date in ISO format
- `insightType` (optional): Filter by insight type

**Response:**
```json
{
  "success": true,
  "data": {
    "roiMetrics": {
      "automationROI": 150.0,
      "timeSavings": 6750000,
      "costSavings": 93.75,
      "efficiencyGain": 25.0
    },
    "trends": [
      {
        "metric": "Automation Success Rate",
        "trend": "increasing",
        "changePercentage": 15.0,
        "recommendation": "Excellent automation performance improvement. Consider expanding automation to other areas."
      }
    ],
    "recommendations": [
      {
        "category": "ROI",
        "priority": "high",
        "title": "Optimize Automation ROI",
        "description": "Current automation ROI is below 100%. Focus on high-impact workflows.",
        "impact": "High - Improve cost efficiency",
        "effort": "Medium - Process optimization"
      }
    ],
    "alerts": [
      {
        "type": "warning",
        "message": "Low automation efficiency",
        "metric": "Efficiency Gain",
        "threshold": 10,
        "currentValue": 8.5
      }
    ]
  }
}
```

### Data Export Endpoints

#### GET /api/metrics/export
Export metrics data in various formats.

**Query Parameters:**
- `businessEntityId` (required): Business entity identifier
- `startDate` (required): Start date in ISO format
- `endDate` (required): End date in ISO format
- `format` (required): Export format (csv, json)
- `metricType` (optional): Filter by metric type

**Response:** File download in requested format

#### GET /api/automation/export
Export automation execution data.

**Query Parameters:**
- `businessEntityId` (required): Business entity identifier
- `startDate` (required): Start date in ISO format
- `endDate` (required): End date in ISO format
- `format` (required): Export format (csv, json)
- `automationType` (optional): Filter by automation type

**Response:** File download in requested format

### Cache Management Endpoints

#### GET /api/metrics/cache/stats
Get cache statistics and information.

**Response:**
```json
{
  "success": true,
  "data": {
    "size": 15,
    "keys": ["/summary:entity-1:2024-01-01:2024-01-31"]
  }
}
```

#### POST /api/metrics/cache/clear
Clear cache for specific business entity or all cache.

**Request Body:**
```json
{
  "businessEntityId": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cache cleared for business entity: entity-1"
}
```

### Metrics Management

#### Create Metric

**POST** `/api/metrics`

Creates a new metric record.

**Request Body:**
```json
{
  "businessEntityId": "be-123",
  "metricType": "ga4_pageview",
  "metricName": "pageviews",
  "metricValue": 1500,
  "metricUnit": "count",
  "source": "google_analytics",
  "sourceId": "ga4-123",
  "date": "2024-01-01T00:00:00.000Z",
  "timezone": "UTC",
  "metadata": {
    "page": "/home",
    "device": "desktop"
  },
  "tags": ["homepage", "traffic", "desktop"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "metric-123",
    "businessEntityId": "be-123",
    "metricType": "ga4_pageview",
    "metricName": "pageviews",
    "metricValue": 1500,
    "metricUnit": "count",
    "source": "google_analytics",
    "sourceId": "ga4-123",
    "date": "2024-01-01T00:00:00.000Z",
    "timezone": "UTC",
    "metadata": {
      "page": "/home",
      "device": "desktop"
    },
    "tags": ["homepage", "traffic", "desktop"],
    "isArchived": false,
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  },
  "message": "Metric created successfully"
}
```

#### Get Metrics

**GET** `/api/metrics`

Retrieves metrics with filtering and pagination.

**Query Parameters:**
- `businessEntityId` (required) - Business entity ID
- `metricType` (optional) - Filter by metric type
- `source` (optional) - Filter by data source
- `startDate` (optional) - Start date for range filtering (ISO format)
- `endDate` (optional) - End date for range filtering (ISO format)
- `tags` (optional) - Filter by tags (comma-separated)
- `isArchived` (optional) - Filter archived metrics (default: false)
- `limit` (optional) - Number of results per page (default: 100)
- `offset` (optional) - Number of results to skip (default: 0)

**Example Request:**
```
GET /api/metrics?businessEntityId=be-123&metricType=ga4_pageview&startDate=2024-01-01&endDate=2024-01-31&limit=50
```

**Response:**
```json
{
  "success": true,
  "data": {
    "metrics": [
      {
        "id": "metric-123",
        "businessEntityId": "be-123",
        "metricType": "ga4_pageview",
        "metricName": "pageviews",
        "metricValue": 1500,
        "metricUnit": "count",
        "source": "google_analytics",
        "sourceId": "ga4-123",
        "date": "2024-01-01T00:00:00.000Z",
        "timezone": "UTC",
        "metadata": {},
        "tags": ["homepage"],
        "isArchived": false,
        "createdAt": "2024-01-01T10:00:00.000Z",
        "updatedAt": "2024-01-01T10:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 50,
    "hasMore": false
  }
}
```

#### Get Metric by ID

**GET** `/api/metrics/:id`

Retrieves a specific metric by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "metric-123",
    "businessEntityId": "be-123",
    "metricType": "ga4_pageview",
    "metricName": "pageviews",
    "metricValue": 1500,
    "metricUnit": "count",
    "source": "google_analytics",
    "sourceId": "ga4-123",
    "date": "2024-01-01T00:00:00.000Z",
    "timezone": "UTC",
    "metadata": {},
    "tags": ["homepage"],
    "isArchived": false,
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  }
}
```

#### Update Metric

**PUT** `/api/metrics/:id`

Updates an existing metric.

**Request Body:**
```json
{
  "metricValue": 2000,
  "metadata": {
    "page": "/home",
    "device": "desktop",
    "updated": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "metric-123",
    "metricValue": 2000,
    "metadata": {
      "page": "/home",
      "device": "desktop",
      "updated": true
    },
    "updatedAt": "2024-01-01T11:00:00.000Z"
  },
  "message": "Metric updated successfully"
}
```

#### Archive Metric

**DELETE** `/api/metrics/:id`

Archives a metric (soft delete).

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "metric-123",
    "isArchived": true,
    "updatedAt": "2024-01-01T12:00:00.000Z"
  },
  "message": "Metric archived successfully"
}
```

### Automation Executions Management

#### Create Automation Execution

**POST** `/api/metrics/automations`

Creates a new automation execution record.

**Request Body:**
```json
{
  "businessEntityId": "be-123",
  "automationType": "n8n_workflow",
  "automationName": "Email Campaign",
  "executionId": "exec-123",
  "status": "running",
  "startTime": "2024-01-01T10:00:00.000Z",
  "triggerType": "scheduled",
  "triggerData": {
    "schedule": "daily",
    "time": "09:00"
  },
  "inputData": {
    "campaignId": "camp-123",
    "recipients": 1000
  },
  "outputData": {},
  "tags": ["email", "campaign", "marketing"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "auto-123",
    "businessEntityId": "be-123",
    "automationType": "n8n_workflow",
    "automationName": "Email Campaign",
    "executionId": "exec-123",
    "status": "running",
    "startTime": "2024-01-01T10:00:00.000Z",
    "triggerType": "scheduled",
    "triggerData": {
      "schedule": "daily",
      "time": "09:00"
    },
    "inputData": {
      "campaignId": "camp-123",
      "recipients": 1000
    },
    "outputData": {},
    "tags": ["email", "campaign", "marketing"],
    "retryCount": 0,
    "maxRetries": 3,
    "isArchived": false,
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  },
  "message": "Automation execution created successfully"
}
```

#### Get Automation Executions

**GET** `/api/metrics/automations`

Retrieves automation executions with filtering and pagination.

**Query Parameters:**
- `businessEntityId` (required) - Business entity ID
- `automationType` (optional) - Filter by automation type
- `status` (optional) - Filter by execution status
- `startDate` (optional) - Start date for range filtering
- `endDate` (optional) - End date for range filtering
- `triggerType` (optional) - Filter by trigger type
- `isArchived` (optional) - Filter archived executions
- `limit` (optional) - Number of results per page
- `offset` (optional) - Number of results to skip

**Example Request:**
```
GET /api/metrics/automations?businessEntityId=be-123&status=completed&startDate=2024-01-01&endDate=2024-01-31
```

#### Update Automation Execution Status

**PUT** `/api/metrics/automations/:id/status`

Updates the status of an automation execution.

**Request Body:**
```json
{
  "status": "completed",
  "endTime": "2024-01-01T11:00:00.000Z",
  "duration": 3600000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "auto-123",
    "status": "completed",
    "endTime": "2024-01-01T11:00:00.000Z",
    "duration": 3600000,
    "updatedAt": "2024-01-01T11:00:00.000Z"
  },
  "message": "Automation execution status updated successfully"
}
```

### Data Archival Management

#### Create Data Archive

**POST** `/api/metrics/archives`

Creates a new data archive record.

**Request Body:**
```json
{
  "businessEntityId": "be-123",
  "archiveType": "metrics",
  "sourceTable": "metrics",
  "sourceRecordId": "metric-123",
  "archivedData": {
    "id": "metric-123",
    "metricValue": 1500,
    "date": "2024-01-01T00:00:00.000Z"
  },
  "archiveDate": "2024-02-01T00:00:00.000Z",
  "retentionPolicy": "30_days"
}
```

#### Get Data Archives

**GET** `/api/metrics/archives`

Retrieves data archives with filtering and pagination.

**Query Parameters:**
- `businessEntityId` (required) - Business entity ID
- `archiveType` (optional) - Filter by archive type
- `sourceTable` (optional) - Filter by source table
- `startDate` (optional) - Start date for range filtering
- `endDate` (optional) - End date for range filtering
- `isRestorable` (optional) - Filter by restore capability
- `limit` (optional) - Number of results per page
- `offset` (optional) - Number of results to skip

### Utility Endpoints

#### Get Metrics Summary

**GET** `/api/metrics/summary`

Retrieves a summary of metrics and automation executions for a business entity.

**Query Parameters:**
- `businessEntityId` (required) - Business entity ID
- `startDate` (required) - Start date for summary period
- `endDate` (required) - End date for summary period

**Example Request:**
```
GET /api/metrics/summary?businessEntityId=be-123&startDate=2024-01-01&endDate=2024-01-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalMetrics": 1000,
    "totalAutomations": 50,
    "successRate": 94.5,
    "averageExecutionTime": 300000
  }
}
```

#### Data Cleanup

**POST** `/api/metrics/cleanup`

Performs automated cleanup of old data based on retention policies.

**Request Body:**
```json
{
  "businessEntityId": "be-123",
  "retentionDays": 30
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "archivedMetrics": 150,
    "archivedAutomations": 25,
    "archivedWebhooks": 10
  },
  "message": "Data cleanup completed successfully"
}
```

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Performance Considerations

### Database Indexes

The system includes comprehensive database indexing for optimal query performance:

- **Primary indexes**: `businessEntityId`, `metricType`, `source`, `date`
- **Composite indexes**: 
  - `(businessEntityId, metricType, date)` for metric queries
  - `(businessEntityId, source, date)` for source-based queries
  - `(businessEntityId, automationType, status)` for automation queries

### Query Optimization

- Use date ranges for time-based queries
- Leverage tags for categorical filtering
- Implement pagination for large result sets
- Use specific metric types and sources when possible

### Data Retention

- Implement automated archival for old data
- Support configurable retention policies
- Maintain data integrity through soft deletes
- Provide data restoration capabilities

## Best Practices

### Creating Metrics

1. **Use consistent naming**: Establish a clear naming convention for metric names
2. **Leverage tags**: Use tags for categorization and filtering
3. **Include metadata**: Store additional context in the metadata field
4. **Set appropriate timezones**: Ensure consistent timezone handling

### Managing Automations

1. **Track execution lifecycle**: Monitor status changes throughout execution
2. **Store input/output data**: Maintain complete execution context
3. **Implement retry logic**: Use retry count and max retries for resilience
4. **Add meaningful tags**: Categorize automations for better organization

### Data Archival

1. **Plan retention policies**: Define appropriate retention periods for different data types
2. **Monitor archive growth**: Track archive size and performance impact
3. **Test restoration**: Verify data can be restored when needed
4. **Document policies**: Maintain clear documentation of archival procedures

## Integration Examples

### Google Analytics Integration

```typescript
// Create GA4 pageview metric
const metric = await metricsService.createMetric({
  businessEntityId: 'be-123',
  metricType: MetricType.GA4_PAGEVIEW,
  metricName: 'pageviews',
  metricValue: 1500,
  source: MetricSource.GOOGLE_ANALYTICS,
  sourceId: 'ga4-123',
  date: new Date(),
  metadata: {
    page: '/home',
    device: 'desktop',
    country: 'US'
  },
  tags: ['homepage', 'traffic', 'desktop', 'us']
});
```

### n8n Workflow Tracking

```typescript
// Start automation execution
const execution = await metricsService.createAutomationExecution({
  businessEntityId: 'be-123',
  automationType: AutomationType.N8N_WORKFLOW,
  automationName: 'Email Campaign',
  executionId: 'exec-123',
  status: AutomationStatus.RUNNING,
  startTime: new Date(),
  triggerType: TriggerType.SCHEDULED,
  triggerData: { schedule: 'daily' },
  inputData: { campaignId: 'camp-123' },
  tags: ['email', 'campaign', 'marketing']
});

// Update status on completion
await metricsService.updateAutomationExecutionStatus(
  execution.id,
  AutomationStatus.COMPLETED,
  new Date(),
  3600000 // 1 hour duration
);
```

### Data Cleanup Automation

```typescript
// Clean up old data monthly
const cleanupResult = await metricsService.cleanupOldData('be-123', 90);

console.log(`Archived ${cleanupResult.archivedMetrics} metrics`);
console.log(`Archived ${cleanupResult.archivedAutomations} automations`);
console.log(`Archived ${cleanupResult.archivedWebhooks} webhook events`);
```

## Monitoring and Alerting

### Key Metrics to Monitor

- **API Response Times**: Monitor endpoint performance
- **Database Query Performance**: Track slow queries
- **Storage Growth**: Monitor data volume increases
- **Archive Performance**: Track archival operation efficiency

### Recommended Alerts

- High error rates (>5%)
- Slow response times (>1 second)
- Database connection issues
- Storage capacity warnings (>80%)
- Failed automation executions

## Security Considerations

### Data Isolation

- All queries are scoped to `businessEntityId`
- Row-level security prevents cross-tenant data access
- Input validation ensures data integrity

### Access Control

- JWT-based authentication required
- Rate limiting prevents abuse
- Input sanitization prevents injection attacks

### Audit Trail

- All operations are logged with timestamps
- User actions are tracked for compliance
- Data changes maintain version history
