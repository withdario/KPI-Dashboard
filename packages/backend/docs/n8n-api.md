# n8n Webhook Integration API Documentation

## Overview

The n8n Webhook Integration API enables business entities to connect their n8n automation workflows to the Business Intelligence Platform. This integration allows tracking of workflow execution, performance metrics, and automation ROI in real-time.

## Base URL

```
https://your-domain.com/api/n8n
```

## Authentication

All n8n API endpoints require authentication using webhook tokens. Include the token in the request headers:

```
X-Webhook-Token: your-webhook-token
```

Or use Bearer token authentication:

```
Authorization: Bearer your-webhook-token
```

## Endpoints

### 1. Webhook Endpoint

#### POST /webhooks/n8n

Receives webhook data from n8n workflows. This is the main endpoint that n8n will call to send workflow execution data.

**Headers:**
- `X-Webhook-Token` (required): Your webhook authentication token
- `Content-Type: application/json`

**Request Body:**
```json
{
  "workflowId": "workflow-123",
  "workflowName": "Email Marketing Automation",
  "executionId": "exec-456",
  "eventType": "workflow_completed",
  "status": "completed",
  "startTime": "2024-01-01T10:00:00Z",
  "endTime": "2024-01-01T10:05:00Z",
  "duration": 300000,
  "inputData": {
    "emailList": ["user1@example.com", "user2@example.com"],
    "campaignId": "campaign-789"
  },
  "outputData": {
    "emailsSent": 2,
    "successRate": 100
  },
  "metadata": {
    "tags": ["email", "marketing"],
    "priority": "high",
    "category": "customer-communication"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "eventId": "event-789",
  "metrics": {
    "totalWorkflows": 150,
    "successfulWorkflows": 142,
    "failedWorkflows": 8,
    "averageExecutionTime": 245000,
    "totalTimeSaved": 36750000,
    "successRate": 94.67,
    "lastExecutionAt": "2024-01-01T10:05:00Z"
  }
}
```

**Response (400 - Validation Error):**
```json
{
  "error": "Invalid webhook payload",
  "details": [
    "workflowName is required",
    "executionId is required"
  ],
  "warnings": [
    "inputData is missing (optional but recommended)"
  ]
}
```

**Response (401 - Authentication Error):**
```json
{
  "error": "Webhook authentication required",
  "message": "Missing webhook token in headers"
}
```

**Response (500 - Processing Error):**
```json
{
  "error": "Webhook processing failed",
  "details": ["Database connection failed"]
}
```

### 2. Integration Management

#### GET /integration/:businessEntityId

Retrieves n8n integration details for a specific business entity.

**Parameters:**
- `businessEntityId` (path): The ID of the business entity

**Response (200):**
```json
{
  "success": true,
  "integration": {
    "id": "integration-123",
    "businessEntityId": "business-456",
    "webhookUrl": "https://n8n.example.com/webhook",
    "isActive": true,
    "lastWebhookAt": "2024-01-01T10:05:00Z",
    "webhookCount": 150,
    "lastErrorAt": null,
    "errorMessage": null,
    "createdAt": "2024-01-01T09:00:00Z",
    "updatedAt": "2024-01-01T10:05:00Z"
  }
}
```

#### POST /integration

Creates a new n8n integration for a business entity.

**Request Body:**
```json
{
  "businessEntityId": "business-456",
  "webhookUrl": "https://n8n.example.com/webhook",
  "webhookToken": "secret-webhook-token"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "n8n integration created successfully",
  "integration": {
    "id": "integration-123",
    "businessEntityId": "business-456",
    "webhookUrl": "https://n8n.example.com/webhook",
    "isActive": true,
    "lastWebhookAt": null,
    "webhookCount": 0,
    "lastErrorAt": null,
    "errorMessage": null,
    "createdAt": "2024-01-01T09:00:00Z",
    "updatedAt": "2024-01-01T09:00:00Z"
  }
}
```

#### PUT /integration/:integrationId

Updates an existing n8n integration.

**Parameters:**
- `integrationId` (path): The ID of the integration to update

**Request Body:**
```json
{
  "webhookUrl": "https://new-n8n.example.com/webhook",
  "isActive": false
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "n8n integration updated successfully",
  "integration": {
    "id": "integration-123",
    "businessEntityId": "business-456",
    "webhookUrl": "https://new-n8n.example.com/webhook",
    "isActive": false,
    "lastWebhookAt": "2024-01-01T10:05:00Z",
    "webhookCount": 150,
    "lastErrorAt": null,
    "errorMessage": null,
    "createdAt": "2024-01-01T09:00:00Z",
    "updatedAt": "2024-01-01T11:00:00Z"
  }
}
```

### 3. Webhook Events

#### GET /events/:integrationId

Retrieves webhook events for a specific integration with pagination support.

**Parameters:**
- `integrationId` (path): The ID of the integration
- `limit` (query): Maximum number of events to return (default: 100, max: 1000)
- `offset` (query): Number of events to skip (default: 0)

**Response (200):**
```json
{
  "success": true,
  "events": [
    {
      "id": "event-789",
      "n8nIntegrationId": "integration-123",
      "workflowId": "workflow-123",
      "workflowName": "Email Marketing Automation",
      "executionId": "exec-456",
      "eventType": "workflow_completed",
      "status": "completed",
      "startTime": "2024-01-01T10:00:00Z",
      "endTime": "2024-01-01T10:05:00Z",
      "duration": 300000,
      "inputData": {
        "emailList": ["user1@example.com", "user2@example.com"],
        "campaignId": "campaign-789"
      },
      "outputData": {
        "emailsSent": 2,
        "successRate": 100
      },
      "errorMessage": null,
      "metadata": {
        "tags": ["email", "marketing"],
        "priority": "high"
      },
      "createdAt": "2024-01-01T10:05:00Z"
    }
  ],
  "pagination": {
    "limit": 100,
    "offset": 0,
    "total": 1
  }
}
```

### 4. Performance Metrics

#### GET /metrics/:integrationId

Retrieves performance metrics for a specific integration.

**Parameters:**
- `integrationId` (path): The ID of the integration

**Response (200):**
```json
{
  "success": true,
  "metrics": {
    "totalWorkflows": 150,
    "successfulWorkflows": 142,
    "failedWorkflows": 8,
    "averageExecutionTime": 245000,
    "totalTimeSaved": 36750000,
    "successRate": 94.67,
    "lastExecutionAt": "2024-01-01T10:05:00Z"
  }
}
```

### 5. Testing Endpoint

#### POST /test/webhook

Validates webhook payloads without processing them. Useful for testing and development.

**Request Body:**
```json
{
  "workflowId": "test-workflow",
  "workflowName": "Test Workflow",
  "executionId": "test-exec",
  "eventType": "workflow_completed",
  "status": "completed",
  "startTime": "2024-01-01T10:00:00Z"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Test payload is valid",
  "payload": {
    "workflowId": "test-workflow",
    "workflowName": "Test Workflow",
    "executionId": "test-exec",
    "eventType": "workflow_completed",
    "status": "completed",
    "startTime": "2024-01-01T10:00:00Z"
  },
  "warnings": [
    "inputData is missing (optional but recommended)",
    "outputData is missing (optional but recommended)"
  ]
}
```

## Data Models

### N8nWebhookPayload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| workflowId | string | Yes | Unique identifier for the n8n workflow |
| workflowName | string | Yes | Human-readable name of the workflow |
| executionId | string | Yes | Unique identifier for this execution |
| eventType | string | Yes | Type of event (see Event Types below) |
| status | string | Yes | Current status of the workflow (see Status Types below) |
| startTime | string | Yes | ISO 8601 timestamp when workflow started |
| endTime | string | No | ISO 8601 timestamp when workflow completed/failed |
| duration | number | No | Execution duration in milliseconds |
| inputData | object | No | Input data received by the workflow |
| outputData | object | No | Output data from the workflow |
| errorMessage | string | No | Error message if workflow failed |
| metadata | object | No | Additional metadata (tags, notes, priority, category) |

### Event Types

- `workflow_started` - Workflow execution has begun
- `workflow_completed` - Workflow execution completed successfully
- `workflow_failed` - Workflow execution failed
- `workflow_cancelled` - Workflow execution was cancelled
- `node_started` - Individual node execution started
- `node_completed` - Individual node execution completed
- `node_failed` - Individual node execution failed
- `execution_started` - Execution context started
- `execution_completed` - Execution context completed
- `execution_failed` - Execution context failed

### Status Types

- `running` - Workflow is currently executing
- `completed` - Workflow completed successfully
- `failed` - Workflow execution failed
- `cancelled` - Workflow execution was cancelled
- `waiting` - Workflow is waiting for input/trigger
- `error` - Workflow encountered an error

## Security Features

### Rate Limiting
- Webhook endpoints: 1000 requests per 15 minutes per IP
- General API endpoints: 100 requests per 15 minutes per IP

### Authentication
- Webhook token validation for all webhook requests
- Business entity isolation ensuring data security

### IP Validation
- Optional IP whitelist support via `ALLOWED_WEBHOOK_IPS` environment variable
- CIDR notation support (e.g., "192.168.1.0/24")

### Payload Validation
- Maximum payload size: 1MB
- Comprehensive field validation
- Timestamp validation to prevent replay attacks

## Error Handling

All endpoints return consistent error responses with:
- HTTP status codes indicating the type of error
- Error messages describing what went wrong
- Additional details when available
- Proper logging for debugging and monitoring

## Environment Variables

Configure the following environment variables:

```bash
# Database connection
DATABASE_URL=postgresql://user:password@localhost:5432/database

# Webhook security
ALLOWED_WEBHOOK_IPS=192.168.1.0/24,10.0.0.0/8

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Setup Instructions

### 1. Database Migration
Run Prisma migrations to create the required tables:
```bash
npx prisma migrate dev --name add-n8n-integration
```

### 2. Create Integration
Use the POST `/api/n8n/integration` endpoint to create your first integration.

### 3. Configure n8n
In your n8n workflow, add a webhook node that sends data to:
```
POST https://your-domain.com/api/webhooks/n8n
```

Include the webhook token in the headers:
```
X-Webhook-Token: your-webhook-token
```

### 4. Test Integration
Use the POST `/api/n8n/test/webhook` endpoint to validate your webhook payload format.

## Monitoring and Alerts

The system provides comprehensive monitoring:
- Webhook request/response logging
- Performance metrics tracking
- Error rate monitoring
- Integration health status
- Real-time dashboard updates

## Best Practices

1. **Webhook Token Security**: Use strong, unique tokens for each integration
2. **Payload Validation**: Always validate webhook data before processing
3. **Error Handling**: Implement proper error handling in your n8n workflows
4. **Rate Limiting**: Respect rate limits to ensure reliable webhook delivery
5. **Monitoring**: Regularly check integration health and performance metrics
6. **Data Retention**: Consider implementing data archiving for long-term storage

## Support

For technical support or questions about the n8n integration API, please refer to:
- API documentation: `/api/n8n` endpoint
- Health check: `/api/health`
- System metrics: `/api/metrics`
