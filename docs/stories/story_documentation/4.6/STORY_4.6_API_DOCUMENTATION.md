# Story 4.6 API Documentation

## 📋 API Overview

**Story ID:** S4.6  
**Story Title:** System Health Dashboard and Alerts  
**API Status:** ✅ **COMPLETED**  
**Base URL:** `/api/system-health`  
**Authentication:** JWT Bearer Token Required  
**Content Type:** `application/json`  

## 🔐 Authentication

All endpoints require authentication using JWT Bearer tokens.

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Example Request
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
     -H "Content-Type: application/json" \
     https://api.example.com/api/system-health/current
```

## 📊 API Endpoints

### 1. Health Data Endpoints

#### GET `/current`
Retrieve current system health status and metrics.

**Request:**
```http
GET /api/system-health/current
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Current health data retrieved successfully",
  "data": {
    "systemStatus": "healthy",
    "uptime": 3600,
    "memoryUsage": {
      "used": 1000000000,
      "total": 8589934592,
      "percentage": 11.6
    },
    "cpuUsage": {
      "current": 5,
      "average": 3,
      "percentage": 5
    },
    "databaseStatus": "connected",
    "apiStatus": "operational",
    "lastHealthCheck": "2025-08-25T10:30:00.000Z",
    "activeAlerts": 2,
    "performanceScore": 95
  }
}
```

**Response Codes:**
- `200 OK`: Health data retrieved successfully
- `401 Unauthorized`: Invalid or missing authentication token
- `404 Not Found`: No health data available
- `500 Internal Server Error`: Server error occurred

---

#### GET `/history`
Retrieve historical health metrics with pagination.

**Request:**
```http
GET /api/system-health/history?limit=50&offset=0
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `limit` (optional): Number of records to return (1-1000, default: 100)
- `offset` (optional): Number of records to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "message": "Health history retrieved successfully",
  "data": {
    "history": [
      {
        "timestamp": "2025-08-25T10:25:00.000Z",
        "metrics": {
          "systemStatus": "healthy",
          "uptime": 3540,
          "memoryUsage": {
            "used": 950000000,
            "total": 8589934592,
            "percentage": 11.1
          },
          "cpuUsage": {
            "current": 4,
            "average": 3,
            "percentage": 4
          },
          "databaseStatus": "connected",
          "apiStatus": "operational",
          "lastHealthCheck": "2025-08-25T10:25:00.000Z",
          "activeAlerts": 1,
          "performanceScore": 98
        },
        "alerts": [
          {
            "id": "alert-1",
            "type": "warning",
            "category": "performance",
            "message": "High memory usage detected",
            "severity": "medium",
            "timestamp": "2025-08-25T10:20:00.000Z"
          }
        ]
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 50,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

**Response Codes:**
- `200 OK`: History data retrieved successfully
- `400 Bad Request`: Invalid query parameters
- `401 Unauthorized`: Invalid or missing authentication token
- `500 Internal Server Error`: Server error occurred

---

#### GET `/alerts`
Retrieve all active system alerts.

**Request:**
```http
GET /api/system-health/alerts
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Active alerts retrieved successfully",
  "data": {
    "alerts": [
      {
        "id": "alert-1",
        "type": "warning",
        "category": "performance",
        "message": "High memory usage detected",
        "details": {
          "memoryPercentage": 85,
          "threshold": 80
        },
        "timestamp": "2025-08-25T10:20:00.000Z",
        "acknowledged": false,
        "severity": "medium",
        "source": "memory-monitor",
        "businessEntityId": "entity-123"
      },
      {
        "id": "alert-2",
        "type": "critical",
        "category": "database",
        "message": "Database connection timeout",
        "details": {
          "responseTime": 5000,
          "threshold": 1000
        },
        "timestamp": "2025-08-25T10:15:00.000Z",
        "acknowledged": false,
        "severity": "critical",
        "source": "database-monitor",
        "businessEntityId": "entity-123"
      }
    ],
    "summary": {
      "total": 2,
      "critical": 1,
      "warning": 1,
      "acknowledged": 0
    }
  }
}
```

**Response Codes:**
- `200 OK`: Alerts retrieved successfully
- `401 Unauthorized`: Invalid or missing authentication token
- `500 Internal Server Error`: Server error occurred

---

#### GET `/health-check-results`
Retrieve results from the most recent health checks.

**Request:**
```http
GET /api/system-health/health-check-results
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Health check results retrieved successfully",
  "data": {
    "results": [
      {
        "status": "pass",
        "message": "Database check passed",
        "timestamp": "2025-08-25T10:30:00.000Z",
        "responseTime": 50,
        "details": {
          "checkName": "database-connectivity",
          "queryTime": 45,
          "connectionPool": "active"
        }
      },
      {
        "status": "warn",
        "message": "Memory usage high",
        "timestamp": "2025-08-25T10:30:00.000Z",
        "responseTime": 0,
        "details": {
          "checkName": "memory-usage",
          "currentUsage": 85,
          "threshold": 80
        }
      },
      {
        "status": "pass",
        "message": "Uptime check passed",
        "timestamp": "2025-08-25T10:30:00.000Z",
        "responseTime": 0,
        "details": {
          "checkName": "system-uptime",
          "uptime": 3600,
          "threshold": 60
        }
      }
    ],
    "summary": {
      "total": 3,
      "pass": 2,
      "warn": 1,
      "fail": 0,
      "averageResponseTime": 16.67
    }
  }
}
```

**Response Codes:**
- `200 OK`: Health check results retrieved successfully
- `401 Unauthorized`: Invalid or missing authentication token
- `500 Internal Server Error`: Server error occurred

---

### 2. Monitoring Control Endpoints

#### POST `/monitoring/start`
Start system health monitoring with optional custom interval.

**Request:**
```http
POST /api/system-health/monitoring/start
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "intervalMs": 30000
}
```

**Request Body:**
- `intervalMs` (optional): Monitoring interval in milliseconds (1000-300000, default: 30000)

**Response:**
```json
{
  "success": true,
  "message": "System health monitoring started successfully",
  "data": {
    "status": "monitoring",
    "intervalMs": 30000,
    "startedAt": "2025-08-25T10:30:00.000Z",
    "nextCheck": "2025-08-25T10:30:30.000Z"
  }
}
```

**Response Codes:**
- `200 OK`: Monitoring started successfully
- `400 Bad Request`: Invalid interval parameter
- `401 Unauthorized`: Invalid or missing authentication token
- `409 Conflict`: Monitoring already active
- `500 Internal Server Error`: Server error occurred

---

#### POST `/monitoring/stop`
Stop system health monitoring.

**Request:**
```http
POST /api/system-health/monitoring/stop
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "System health monitoring stopped successfully",
  "data": {
    "status": "stopped",
    "stoppedAt": "2025-08-25T10:35:00.000Z",
    "totalRuntime": 300000,
    "healthChecksPerformed": 10
  }
}
```

**Response Codes:**
- `200 OK`: Monitoring stopped successfully
- `401 Unauthorized`: Invalid or missing authentication token
- `409 Conflict`: Monitoring not active
- `500 Internal Server Error`: Server error occurred

---

#### GET `/monitoring/status`
Get current monitoring status and statistics.

**Request:**
```http
GET /api/system-health/monitoring/status
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Monitoring status retrieved successfully",
  "data": {
    "isActive": true,
    "startedAt": "2025-08-25T10:30:00.000Z",
    "intervalMs": 30000,
    "nextCheck": "2025-08-25T10:30:30.000Z",
    "statistics": {
      "totalHealthChecks": 150,
      "successfulChecks": 145,
      "failedChecks": 5,
      "averageResponseTime": 125.5,
      "lastCheckAt": "2025-08-25T10:30:00.000Z"
    }
  }
}
```

**Response Codes:**
- `200 OK`: Status retrieved successfully
- `401 Unauthorized`: Invalid or missing authentication token
- `500 Internal Server Error`: Server error occurred

---

### 3. Health Check and Alert Endpoints

#### POST `/health-check`
Perform a manual health check.

**Request:**
```http
POST /api/system-health/health-check
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Health check completed successfully",
  "data": {
    "systemStatus": "healthy",
    "performanceScore": 95,
    "healthChecks": [
      {
        "status": "pass",
        "message": "Database check passed",
        "responseTime": 45
      },
      {
        "status": "pass",
        "message": "Memory usage normal",
        "responseTime": 0
      },
      {
        "status": "pass",
        "message": "Uptime check passed",
        "responseTime": 0
      }
    ],
    "alertsGenerated": 0,
    "checkDuration": 125,
    "timestamp": "2025-08-25T10:35:00.000Z"
  }
}
```

**Response Codes:**
- `200 OK`: Health check completed successfully
- `401 Unauthorized`: Invalid or missing authentication token
- `500 Internal Server Error`: Server error occurred

---

#### POST `/alerts`
Create a new system alert.

**Request:**
```http
POST /api/system-health/alerts
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "type": "warning",
  "category": "performance",
  "message": "High CPU usage detected",
  "severity": "medium",
  "source": "cpu-monitor",
  "details": {
    "cpuPercentage": 85,
    "threshold": 80
  },
  "businessEntityId": "entity-123"
}
```

**Request Body:**
- `type` (required): Alert type - `info`, `warning`, `critical`, `error`
- `category` (required): Alert category - `system`, `performance`, `database`, `api`, `security`
- `message` (required): Alert message (1-500 characters)
- `severity` (required): Alert severity - `low`, `medium`, `high`, `critical`
- `source` (required): Source system or monitor (1-100 characters)
- `details` (optional): Additional alert details as JSON object
- `businessEntityId` (optional): Associated business entity ID

**Response:**
```json
{
  "success": true,
  "message": "Alert created successfully",
  "data": {
    "alert": {
      "id": "alert-3",
      "type": "warning",
      "category": "performance",
      "message": "High CPU usage detected",
      "details": {
        "cpuPercentage": 85,
        "threshold": 80
      },
      "timestamp": "2025-08-25T10:35:00.000Z",
      "acknowledged": false,
      "severity": "medium",
      "source": "cpu-monitor",
      "businessEntityId": "entity-123"
    }
  }
}
```

**Response Codes:**
- `201 Created`: Alert created successfully
- `400 Bad Request`: Invalid request body or validation errors
- `401 Unauthorized`: Invalid or missing authentication token
- `500 Internal Server Error`: Server error occurred

---

#### POST `/alerts/:id/acknowledge`
Acknowledge an existing alert.

**Request:**
```http
POST /api/system-health/alerts/alert-1/acknowledge
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "acknowledgedBy": "john.doe@example.com"
}
```

**Request Body:**
- `acknowledgedBy` (required): Username or email of person acknowledging the alert (1-100 characters)

**Response:**
```json
{
  "success": true,
  "message": "Alert acknowledged successfully",
  "data": {
    "alert": {
      "id": "alert-1",
      "type": "warning",
      "category": "performance",
      "message": "High memory usage detected",
      "timestamp": "2025-08-25T10:20:00.000Z",
      "acknowledged": true,
      "acknowledgedBy": "john.doe@example.com",
      "acknowledgedAt": "2025-08-25T10:35:00.000Z",
      "severity": "medium",
      "source": "memory-monitor"
    }
  }
}
```

**Response Codes:**
- `200 OK`: Alert acknowledged successfully
- `400 Bad Request**: Missing acknowledgedBy field
- `401 Unauthorized**: Invalid or missing authentication token
- `404 Not Found**: Alert not found
- `500 Internal Server Error`: Server error occurred

---

### 4. Utility Endpoints

#### GET `/summary`
Get a comprehensive health summary.

**Request:**
```http
GET /api/system-health/summary
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Health summary retrieved successfully",
  "data": {
    "overview": {
      "systemStatus": "healthy",
      "performanceScore": 95,
      "uptime": 3600,
      "lastHealthCheck": "2025-08-25T10:30:00.000Z"
    },
    "resources": {
      "memory": {
        "used": 1000000000,
        "total": 8589934592,
        "percentage": 11.6,
        "status": "normal"
      },
      "cpu": {
        "current": 5,
        "average": 3,
        "percentage": 5,
        "status": "normal"
      },
      "database": {
        "status": "connected",
        "responseTime": 45,
        "connections": 12
      }
    },
    "alerts": {
      "total": 2,
      "critical": 1,
      "warning": 1,
      "acknowledged": 0,
      "recent": [
        {
          "id": "alert-2",
          "type": "critical",
          "message": "Database connection timeout",
          "timestamp": "2025-08-25T10:15:00.000Z"
        }
      ]
    },
    "monitoring": {
      "isActive": true,
      "intervalMs": 30000,
      "nextCheck": "2025-08-25T10:30:30.000Z",
      "totalChecks": 150,
      "successRate": 96.7
    }
  }
}
```

**Response Codes:**
- `200 OK`: Summary retrieved successfully
- `401 Unauthorized`: Invalid or missing authentication token
- `500 Internal Server Error`: Server error occurred

---

#### POST `/cleanup`
Perform cleanup of old metrics and acknowledged alerts.

**Request:**
```http
POST /api/system-health/cleanup
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Cleanup completed successfully",
  "data": {
    "metricsRemoved": 45,
    "alertsRemoved": 12,
    "healthCheckResultsRemoved": 23,
    "cleanupDuration": 1250,
    "timestamp": "2025-08-25T10:40:00.000Z"
  }
}
```

**Response Codes:**
- `200 OK`: Cleanup completed successfully
- `401 Unauthorized`: Invalid or missing authentication token
- `500 Internal Server Error`: Server error occurred

---

## 📊 Data Models

### 1. SystemHealthMetrics
```typescript
interface SystemHealthMetrics {
  systemStatus: 'healthy' | 'warning' | 'critical' | 'unknown';
  uptime: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  cpuUsage: {
    current: number;
    average: number;
    percentage: number;
  };
  databaseStatus: 'connected' | 'disconnected' | 'slow' | 'error';
  apiStatus: 'operational' | 'degraded' | 'down' | 'error';
  lastHealthCheck: Date;
  activeAlerts: number;
  performanceScore: number;
}
```

### 2. SystemAlert
```typescript
interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'critical' | 'error';
  category: 'system' | 'performance' | 'database' | 'api' | 'security';
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  businessEntityId?: string;
}
```

### 3. HealthCheckResult
```typescript
interface HealthCheckResult {
  status: 'pass' | 'warn' | 'fail';
  message: string;
  timestamp: Date;
  responseTime: number;
  details: Record<string, any>;
}
```

### 4. MonitoringStatus
```typescript
interface MonitoringStatus {
  isActive: boolean;
  startedAt?: Date;
  intervalMs: number;
  nextCheck?: Date;
  statistics: {
    totalHealthChecks: number;
    successfulChecks: number;
    failedChecks: number;
    averageResponseTime: number;
    lastCheckAt?: Date;
  };
}
```

## 🔒 Error Handling

### 1. Standard Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "timestamp": "2025-08-25T10:35:00.000Z",
  "path": "/api/system-health/current",
  "requestId": "req-12345"
}
```

### 2. HTTP Status Codes
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters or body
- `401 Unauthorized`: Authentication required or invalid
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., monitoring already active)
- `422 Unprocessable Entity`: Validation errors
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service temporarily unavailable

### 3. Validation Errors
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "type",
      "value": "invalid-type",
      "message": "Invalid alert type. Must be one of: info, warning, critical, error"
    },
    {
      "field": "message",
      "value": "",
      "message": "Message is required and must be between 1 and 500 characters"
    }
  ]
}
```

## 📈 Rate Limiting

### 1. Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### 2. Rate Limits by Endpoint
- **Read endpoints** (GET): 100 requests per minute
- **Write endpoints** (POST/PUT/DELETE): 30 requests per minute
- **Health check endpoints**: 60 requests per minute

### 3. Rate Limit Exceeded Response
```json
{
  "success": false,
  "message": "Rate limit exceeded",
  "error": "Too many requests. Please try again later.",
  "retryAfter": 60
}
```

## 🔍 Query Parameters

### 1. Pagination
- `limit`: Number of records to return (1-1000, default: 100)
- `offset`: Number of records to skip (default: 0)

### 2. Filtering
- `status`: Filter by system status (`healthy`, `warning`, `critical`, `unknown`)
- `type`: Filter alerts by type (`info`, `warning`, `critical`, `error`)
- `category`: Filter alerts by category (`system`, `performance`, `database`, `api`, `security`)
- `severity`: Filter alerts by severity (`low`, `medium`, `high`, `critical`)
- `acknowledged`: Filter alerts by acknowledgment status (`true`, `false`)

### 3. Time Ranges
- `startDate`: Start date for time range filtering (ISO 8601 format)
- `endDate`: End date for time range filtering (ISO 8601 format)
- `timezone`: Timezone for date filtering (default: UTC)

### 4. Example Filtered Request
```http
GET /api/system-health/alerts?type=critical&severity=high&acknowledged=false&limit=50
Authorization: Bearer <jwt_token>
```

## 📱 Client Examples

### 1. JavaScript/TypeScript
```typescript
class SystemHealthClient {
  private baseUrl: string;
  private authToken: string;

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  async getCurrentHealth(): Promise<SystemHealthMetrics> {
    const response = await fetch(`${this.baseUrl}/api/system-health/current`, {
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  }

  async startMonitoring(intervalMs?: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/system-health/monitoring/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json'
      },
      body: intervalMs ? JSON.stringify({ intervalMs }) : '{}'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  async createAlert(alert: CreateAlertRequest): Promise<SystemAlert> {
    const response = await fetch(`${this.baseUrl}/api/system-health/alerts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(alert)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data.alert;
  }
}

// Usage
const client = new SystemHealthClient('https://api.example.com', 'jwt-token');

// Get current health
const health = await client.getCurrentHealth();
console.log('System status:', health.systemStatus);

// Start monitoring
await client.startMonitoring(60000); // 1 minute interval

// Create alert
const alert = await client.createAlert({
  type: 'warning',
  category: 'performance',
  message: 'High memory usage detected',
  severity: 'medium',
  source: 'memory-monitor'
});
```

### 2. Python
```python
import requests
import json
from typing import Dict, Any, Optional

class SystemHealthClient:
    def __init__(self, base_url: str, auth_token: str):
        self.base_url = base_url
        self.auth_token = auth_token
        self.headers = {
            'Authorization': f'Bearer {auth_token}',
            'Content-Type': 'application/json'
        }

    def get_current_health(self) -> Dict[str, Any]:
        response = requests.get(
            f'{self.base_url}/api/system-health/current',
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()['data']

    def start_monitoring(self, interval_ms: Optional[int] = None) -> Dict[str, Any]:
        data = {}
        if interval_ms:
            data['intervalMs'] = interval_ms

        response = requests.post(
            f'{self.base_url}/api/system-health/monitoring/start',
            headers=self.headers,
            json=data
        )
        response.raise_for_status()
        return response.json()['data']

    def create_alert(self, alert_data: Dict[str, Any]) -> Dict[str, Any]:
        response = requests.post(
            f'{self.base_url}/api/system-health/alerts',
            headers=self.headers,
            json=alert_data
        )
        response.raise_for_status()
        return response.json()['data']['alert']

# Usage
client = SystemHealthClient('https://api.example.com', 'jwt-token')

# Get current health
health = client.get_current_health()
print(f"System status: {health['systemStatus']}")

# Start monitoring
result = client.start_monitoring(60000)  # 1 minute interval
print(f"Monitoring started: {result['status']}")

# Create alert
alert = client.create_alert({
    'type': 'warning',
    'category': 'performance',
    'message': 'High memory usage detected',
    'severity': 'medium',
    'source': 'memory-monitor'
})
print(f"Alert created: {alert['id']}")
```

### 3. cURL Examples
```bash
# Get current health
curl -H "Authorization: Bearer <jwt_token>" \
     https://api.example.com/api/system-health/current

# Start monitoring with custom interval
curl -X POST \
     -H "Authorization: Bearer <jwt_token>" \
     -H "Content-Type: application/json" \
     -d '{"intervalMs": 60000}' \
     https://api.example.com/api/system-health/monitoring/start

# Create alert
curl -X POST \
     -H "Authorization: Bearer <jwt_token>" \
     -H "Content-Type: application/json" \
     -d '{
       "type": "warning",
       "category": "performance",
       "message": "High memory usage detected",
       "severity": "medium",
       "source": "memory-monitor"
     }' \
     https://api.example.com/api/system-health/alerts

# Get filtered alerts
curl -H "Authorization: Bearer <jwt_token>" \
     "https://api.example.com/api/system-health/alerts?type=critical&severity=high"

# Acknowledge alert
curl -X POST \
     -H "Authorization: Bearer <jwt_token>" \
     -H "Content-Type: application/json" \
     -d '{"acknowledgedBy": "admin@example.com"}' \
     https://api.example.com/api/system-health/alerts/alert-1/acknowledge
```

## 🔄 WebSocket Events (Future Enhancement)

### 1. Real-time Updates
```typescript
// Future WebSocket implementation
interface WebSocketMessage {
  type: 'health_update' | 'alert_created' | 'alert_acknowledged' | 'monitoring_status';
  data: any;
  timestamp: string;
}

// Example WebSocket connection
const ws = new WebSocket('wss://api.example.com/api/system-health/ws');

ws.onmessage = (event) => {
  const message: WebSocketMessage = JSON.parse(event.data);
  
  switch (message.type) {
    case 'health_update':
      updateHealthDashboard(message.data);
      break;
    case 'alert_created':
      showNewAlert(message.data);
      break;
    case 'alert_acknowledged':
      updateAlertStatus(message.data);
      break;
  }
};
```

## 📚 SDK Libraries

### 1. Available SDKs
- **JavaScript/TypeScript**: `@company/system-health-client`
- **Python**: `company-system-health-client`
- **Java**: `com.company.systemhealth.client`
- **Go**: `github.com/company/system-health-client`

### 2. SDK Installation
```bash
# JavaScript/TypeScript
npm install @company/system-health-client

# Python
pip install company-system-health-client

# Java (Maven)
<dependency>
    <groupId>com.company</groupId>
    <artifactId>system-health-client</artifactId>
    <version>1.0.0</version>
</dependency>

# Go
go get github.com/company/system-health-client
```

## 🔧 Configuration

### 1. Environment Variables
```bash
# API Configuration
SYSTEM_HEALTH_API_BASE_URL=https://api.example.com
SYSTEM_HEALTH_API_TIMEOUT=30000
SYSTEM_HEALTH_API_RETRY_ATTEMPTS=3

# Authentication
SYSTEM_HEALTH_AUTH_TOKEN=<jwt_token>
SYSTEM_HEALTH_AUTH_REFRESH_INTERVAL=3600000

# Monitoring
SYSTEM_HEALTH_MONITORING_INTERVAL=30000
SYSTEM_HEALTH_HEALTH_CHECK_TIMEOUT=10000
```

### 2. Configuration File
```json
{
  "api": {
    "baseUrl": "https://api.example.com",
    "timeout": 30000,
    "retryAttempts": 3
  },
  "authentication": {
    "token": "<jwt_token>",
    "refreshInterval": 3600000
  },
  "monitoring": {
    "interval": 30000,
    "healthCheckTimeout": 10000
  }
}
```

---

**This API documentation provides comprehensive coverage of all endpoints, data models, error handling, and usage examples for the Story 4.6 System Health Dashboard and Alerts API.** 🚀
