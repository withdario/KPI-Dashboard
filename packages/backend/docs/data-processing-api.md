# Data Processing Pipeline API Documentation

## Overview

The Data Processing Pipeline API provides endpoints for transforming raw data from external sources (Google Analytics 4 and n8n) into business-ready metrics and insights. This API handles data validation, transformation, aggregation, and quality monitoring.

## Base URL

```
/api/data-processing
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

All endpoints are subject to rate limiting:
- **Rate Limit**: 100 requests per 15 minutes per user
- **Burst Limit**: 10 requests per minute

## Endpoints

### 1. Process Data Pipeline

**POST** `/api/data-processing/process`

Processes raw data through the complete transformation pipeline including validation, transformation, and quality checks.

#### Request Body

```json
{
  "source": "google-analytics",
  "businessEntityId": "business-entity-123",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "sessions": "150",
    "users": "120",
    "pageviews": "450",
    "conversions": "25",
    "revenue": "1250.50"
  },
  "metadata": {
    "propertyId": "GA4_PROPERTY_123",
    "dataSource": "ga4-api"
  }
}
```

#### Response

**Success (200)**
```json
{
  "success": true,
  "message": "Data processed successfully",
  "result": {
    "success": true,
    "processedRecords": 5,
    "errors": [],
    "warnings": [],
    "processingTime": 45,
    "dataQuality": {
      "isValid": true,
      "errors": [],
      "warnings": [],
      "dataSource": "google-analytics",
      "timestamp": "2024-01-15T10:30:45Z"
    }
  }
}
```

**Error (400)**
```json
{
  "success": false,
  "message": "Data processing failed",
  "result": {
    "success": false,
    "processedRecords": 0,
    "errors": ["Missing business entity ID"],
    "warnings": [],
    "processingTime": 12,
    "dataQuality": {
      "isValid": false,
      "errors": ["Missing business entity ID"],
      "warnings": [],
      "dataSource": "google-analytics",
      "timestamp": "2024-01-15T10:30:12Z"
    }
  }
}
```

### 2. Transform Google Analytics Data

**POST** `/api/data-processing/transform/ga4`

Transforms raw Google Analytics 4 data into business metrics without full pipeline processing.

#### Request Body

```json
{
  "businessEntityId": "business-entity-123",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "sessions": "150",
    "users": "120",
    "pageviews": "450",
    "conversions": "25",
    "revenue": "1250.50"
  }
}
```

#### Response

**Success (200)**
```json
{
  "success": true,
  "message": "Google Analytics data transformed successfully",
  "metrics": [
    {
      "businessEntityId": "business-entity-123",
      "date": "2024-01-15",
      "source": "google-analytics",
      "metricType": "sessions",
      "value": 150,
      "unit": "count",
      "metadata": { "source": "ga4-api" }
    },
    {
      "businessEntityId": "business-entity-123",
      "date": "2024-01-15",
      "source": "google-analytics",
      "metricType": "users",
      "value": 120,
      "unit": "count",
      "metadata": { "source": "ga4-api" }
    }
  ],
  "count": 2
}
```

### 3. Transform n8n Data

**POST** `/api/data-processing/transform/n8n`

Transforms raw n8n webhook data into business metrics without full pipeline processing.

#### Request Body

```json
{
  "businessEntityId": "business-entity-123",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "workflowId": "workflow-123",
    "workflowName": "Email Automation",
    "executionId": "exec-456",
    "eventType": "workflow_completed",
    "status": "completed",
    "startTime": "2024-01-15T10:25:00Z",
    "endTime": "2024-01-15T10:30:00Z",
    "duration": 300000
  }
}
```

#### Response

**Success (200)**
```json
{
  "success": true,
  "message": "n8n data transformed successfully",
  "metrics": [
    {
      "businessEntityId": "business-entity-123",
      "date": "2024-01-15",
      "source": "n8n",
      "metricType": "workflow_executions",
      "value": 1,
      "unit": "count",
      "metadata": {
        "workflowId": "workflow-123",
        "workflowName": "Email Automation",
        "status": "completed",
        "source": "n8n-webhook"
      }
    },
    {
      "businessEntityId": "business-entity-123",
      "date": "2024-01-15",
      "source": "n8n",
      "metricType": "workflow_duration",
      "value": 300000,
      "unit": "milliseconds",
      "metadata": {
        "workflowId": "workflow-123",
        "workflowName": "Email Automation",
        "source": "n8n-webhook"
      }
    },
    {
      "businessEntityId": "business-entity-123",
      "date": "2024-01-15",
      "source": "n8n",
      "metricType": "workflow_successes",
      "value": 1,
      "unit": "count",
      "metadata": {
        "workflowId": "workflow-123",
        "workflowName": "Email Automation",
        "source": "n8n-webhook"
      }
    }
  ],
  "count": 3
}
```

### 4. Validate Data Quality

**POST** `/api/data-processing/validate`

Validates data quality without processing the data through the transformation pipeline.

#### Request Body

```json
{
  "source": "google-analytics",
  "businessEntityId": "business-entity-123",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "sessions": "150",
    "users": "120"
  }
}
```

#### Response

**Success (200)**
```json
{
  "success": true,
  "message": "Data quality validation completed",
  "qualityCheck": {
    "isValid": true,
    "errors": [],
    "warnings": ["Missing GA4 property ID"],
    "dataSource": "google-analytics",
    "timestamp": "2024-01-15T10:30:45Z"
  }
}
```

### 5. Aggregate Metrics

**GET** `/api/data-processing/aggregate`

Aggregates metrics by time period (daily, weekly, monthly).

#### Query Parameters

- `businessEntityId` (required): The business entity ID
- `startDate` (required): Start date in ISO format (YYYY-MM-DD)
- `endDate` (required): End date in ISO format (YYYY-MM-DD)
- `aggregationPeriod` (optional): Aggregation period (daily, weekly, monthly). Default: daily

#### Example Request

```
GET /api/data-processing/aggregate?businessEntityId=business-entity-123&startDate=2024-01-01&endDate=2024-01-31&aggregationPeriod=daily
```

#### Response

**Success (200)**
```json
{
  "success": true,
  "message": "Metrics aggregated successfully",
  "aggregation": {
    "businessEntityId": "business-entity-123",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T00:00:00.000Z",
    "period": "daily",
    "metrics": [],
    "count": 0
  }
}
```

### 6. Get Pipeline Statistics

**GET** `/api/data-processing/stats`

Retrieves processing pipeline statistics for a business entity.

#### Query Parameters

- `businessEntityId` (required): The business entity ID
- `startDate` (optional): Start date for statistics range
- `endDate` (optional): End date for statistics range

#### Example Request

```
GET /api/data-processing/stats?businessEntityId=business-entity-123
```

#### Response

**Success (200)**
```json
{
  "success": true,
  "message": "Pipeline statistics retrieved successfully",
  "stats": {
    "businessEntityId": "business-entity-123",
    "totalProcessedRecords": 0,
    "successfulProcessing": 0,
    "failedProcessing": 0,
    "averageProcessingTime": 0,
    "lastProcessedAt": null,
    "dataSources": ["google-analytics", "n8n"],
    "errorRate": 0,
    "throughput": 0
  }
}
```

### 7. Health Check

**GET** `/api/data-processing/health`

Checks the health status of the data processing pipeline.

#### Response

**Success (200)**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:45Z",
  "service": "data-processing-pipeline",
  "version": "1.0.0",
  "components": {
    "transformationService": "operational",
    "dataValidation": "operational",
    "aggregationService": "operational"
  }
}
```

## Data Types

### Raw Metrics Data

```typescript
interface RawMetricsData {
  source: 'google-analytics' | 'n8n';
  businessEntityId: string;
  timestamp: Date;
  data: any;
  metadata?: any;
}
```

### Business Metrics

```typescript
interface BusinessMetrics {
  businessEntityId: string;
  date: string; // YYYY-MM-DD format
  source: 'google-analytics' | 'n8n';
  metricType: string;
  value: number;
  unit?: string;
  metadata?: any;
}
```

### Processing Pipeline Result

```typescript
interface ProcessingPipelineResult {
  success: boolean;
  processedRecords: number;
  errors: string[];
  warnings: string[];
  processingTime: number;
  dataQuality: DataQualityCheck;
}
```

### Data Quality Check

```typescript
interface DataQualityCheck {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  dataSource: string;
  timestamp: Date;
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common HTTP Status Codes

- **200**: Success
- **400**: Bad Request (validation errors, missing fields)
- **401**: Unauthorized (missing or invalid token)
- **404**: Not Found (business entity not found)
- **429**: Too Many Requests (rate limit exceeded)
- **500**: Internal Server Error

## Data Quality Rules

The system automatically validates data quality based on these rules:

### Required Fields
- `source`: Must be 'google-analytics' or 'n8n'
- `businessEntityId`: Must be a valid business entity ID
- `timestamp`: Must be a valid date
- `data`: Must contain at least one field

### Google Analytics Specific
- `propertyId`: Recommended for GA4 data
- Numeric fields should be parseable as numbers

### n8n Specific
- `workflowId`: Recommended for workflow tracking
- `status`: Should be a valid workflow status

### Timestamp Validation
- Timestamps in the future generate warnings
- Invalid date formats generate errors

## Performance Considerations

- **Processing Time**: Typical processing time is <100ms for single records
- **Batch Processing**: For large datasets, consider processing in batches
- **Caching**: Aggregated metrics are cached for improved performance
- **Rate Limiting**: Respect API rate limits to avoid throttling

## Monitoring and Observability

The API provides comprehensive monitoring:

- **Request Logging**: All requests are logged with request IDs
- **Performance Metrics**: Processing time and throughput tracking
- **Error Tracking**: Detailed error logging and categorization
- **Health Checks**: Real-time service health monitoring
- **Data Quality Metrics**: Quality score tracking and reporting

## Best Practices

1. **Data Validation**: Always validate data before sending to the API
2. **Error Handling**: Implement proper error handling for failed requests
3. **Rate Limiting**: Respect rate limits and implement exponential backoff
4. **Monitoring**: Monitor processing success rates and error patterns
5. **Data Quality**: Regularly check data quality reports for insights
6. **Batch Processing**: Use batch endpoints for large datasets
7. **Retry Logic**: Implement retry logic for transient failures

## Examples

### Complete Google Analytics Processing Example

```bash
curl -X POST http://localhost:3000/api/data-processing/process \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "google-analytics",
    "businessEntityId": "business-entity-123",
    "timestamp": "2024-01-15T10:30:00Z",
    "data": {
      "sessions": "150",
      "users": "120",
      "pageviews": "450",
      "conversions": "25",
      "revenue": "1250.50",
      "propertyId": "GA4_PROPERTY_123"
    }
  }'
```

### n8n Workflow Processing Example

```bash
curl -X POST http://localhost:3000/api/data-processing/process \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "n8n",
    "businessEntityId": "business-entity-123",
    "timestamp": "2024-01-15T10:30:00Z",
    "data": {
      "workflowId": "workflow-123",
      "workflowName": "Email Automation",
      "executionId": "exec-456",
      "eventType": "workflow_completed",
      "status": "completed",
      "startTime": "2024-01-15T10:25:00Z",
      "endTime": "2024-01-15T10:30:00Z",
      "duration": 300000
    }
  }'
```

## Support

For technical support or questions about the Data Processing Pipeline API:

- **Documentation**: This document and related technical docs
- **API Status**: Check `/api/data-processing/health` endpoint
- **Error Logs**: Review application logs for detailed error information
- **Monitoring**: Use `/api/data-processing/stats` for performance insights
