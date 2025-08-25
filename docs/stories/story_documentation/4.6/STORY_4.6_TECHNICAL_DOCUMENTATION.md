# Story 4.6 Technical Documentation

## 📋 Technical Overview

**Story ID:** S4.6  
**Story Title:** System Health Dashboard and Alerts  
**Technical Status:** ✅ **COMPLETED**  
**Architecture Pattern:** Service-Oriented Architecture (SOA)  
**Technology Stack:** Node.js, Express, React, TypeScript, Prisma, PostgreSQL  

## 🏗️ System Architecture

### 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              SystemHealthDashboard                     │   │
│  │  • React Component with TypeScript                     │   │
│  │  • Real-time data updates via WebSocket/HTTP           │   │
│  │  • Responsive design with mobile support               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Express Server                       │   │
│  │  • RESTful API endpoints                               │   │
│  │  • Authentication & authorization                      │   │
│  │  • Rate limiting & validation                          │   │
│  │  • CORS & security headers                             │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Business Logic Layer                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                SystemHealthService                      │   │
│  │  • Health monitoring orchestration                     │   │
│  │  • Metrics collection & aggregation                    │   │
│  │  • Health check execution                              │   │
│  │  • Alert generation & management                       │   │
│  │  • Performance scoring algorithms                      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Data Access Layer                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      Prisma ORM                         │   │
│  │  • Database abstraction layer                           │   │
│  │  • Connection pooling & optimization                    │   │
│  │  • Transaction management                               │   │
│  │  • Query optimization                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Data Storage                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    PostgreSQL                           │   │
│  │  • Health metrics storage                              │   │
│  │  • Alert persistence                                   │   │
│  │  • Health check results                                │   │
│  │  • Performance history                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Component Architecture

#### Frontend Component Structure
```
SystemHealthDashboard
├── HeaderSection
│   ├── DashboardTitle
│   ├── MonitoringStatus
│   └── ActionButtons
├── SystemStatusOverview
│   ├── StatusIndicator
│   ├── PerformanceScore
│   └── UptimeDisplay
├── PerformanceMetrics
│   ├── LineChart (Performance over time)
│   └── PieChart (Resource usage)
├── SystemResources
│   ├── MemoryUsage
│   ├── CPUUsage
│   └── DatabaseStatus
├── HealthCheckResults
│   └── HealthCheckList
└── ActiveAlerts
    ├── AlertList
    └── AlertActions
```

#### Backend Service Structure
```
SystemHealthService
├── Monitoring Management
│   ├── startMonitoring()
│   ├── stopMonitoring()
│   └── isMonitoringActive()
├── Health Checks
│   ├── performHealthCheck()
│   ├── runHealthChecks()
│   └── collectSystemMetrics()
├── Alert Management
│   ├── generateAlerts()
│   ├── createAlert()
│   └── acknowledgeAlert()
├── Data Management
│   ├── getCurrentHealth()
│   ├── getHealthHistory()
│   └── cleanup()
└── Utilities
    ├── calculatePerformanceScore()
    ├── analyzeSystemStatus()
    └── formatUptime()
```

## 🔧 Technical Implementation Details

### 1. SystemHealthService Implementation

#### Core Service Class
```typescript
export class SystemHealthService extends EventEmitter {
  private prisma: PrismaClient;
  private isMonitoring: boolean = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private metricsHistory: SystemMetrics[] = [];
  private activeAlerts: Map<string, SystemAlert> = new Map();
  private healthCheckResults: Map<string, HealthCheckResult> = new Map();

  constructor(prisma: PrismaClient) {
    super();
    this.prisma = prisma;
  }
}
```

#### Health Monitoring Logic
```typescript
async startMonitoring(intervalMs: number = 30000): Promise<void> {
  if (this.isMonitoring) {
    logger.info('System health monitoring is already running');
    return;
  }

  try {
    logger.info('Starting system health monitoring');
    this.isMonitoring = true;

    // Perform initial health check
    await this.performHealthCheck();

    // Set up periodic health checks
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, intervalMs);

    this.emit('monitoringStarted', { timestamp: new Date() });
    logger.info('System health monitoring started successfully');
  } catch (error) {
    logger.error('Failed to start system health monitoring:', error);
    this.isMonitoring = false;
    throw error;
  }
}
```

#### Health Check Execution
```typescript
async performHealthCheck(): Promise<SystemHealthMetrics> {
  const startTime = Date.now();
  const timestamp = new Date();

  try {
    logger.debug('Performing system health check');

    // Collect system metrics
    const metrics = await this.collectSystemMetrics();
    
    // Perform health checks
    const healthChecks = await this.runHealthChecks();
    
    // Calculate performance score first
    const performanceScore = this.calculatePerformanceScore(metrics, healthChecks);
    
    // Analyze health status
    const systemStatus = this.analyzeSystemStatus(metrics, healthChecks);
    
    // Generate alerts for issues
    await this.generateAlerts(metrics, healthChecks);
    
    // Create final metrics object
    const healthMetrics: SystemHealthMetrics = {
      ...metrics,
      systemStatus,
      performanceScore,
      lastHealthCheck: timestamp,
      activeAlerts: this.activeAlerts.size
    };

    // Store metrics in history
    this.metricsHistory.push({
      timestamp,
      metrics: healthMetrics,
      alerts: Array.from(this.activeAlerts.values())
    });

    // Keep only last 1000 metrics
    if (this.metricsHistory.length > 1000) {
      this.metricsHistory = this.metricsHistory.slice(-1000);
    }

    const responseTime = Date.now() - startTime;
    logger.debug(`Health check completed in ${responseTime}ms`);

    this.emit('healthCheckCompleted', { metrics: healthMetrics, responseTime });
    return healthMetrics;

  } catch (error) {
    logger.error('Health check failed:', error);
    const errorMetrics: SystemHealthMetrics = {
      systemStatus: 'critical',
      uptime: process.uptime(),
      memoryUsage: { used: 0, total: 0, percentage: 0 },
      cpuUsage: { current: 0, average: 0, percentage: 0 },
      databaseStatus: 'error',
      apiStatus: 'error',
      lastHealthCheck: timestamp,
      activeAlerts: this.activeAlerts.size,
      performanceScore: 0
    };

    this.emit('healthCheckFailed', { error, metrics: errorMetrics });
    return errorMetrics;
  }
}
```

#### Performance Scoring Algorithm
```typescript
private calculatePerformanceScore(
  metrics: Omit<SystemHealthMetrics, 'systemStatus' | 'performanceScore' | 'lastHealthCheck' | 'activeAlerts'>,
  healthChecks: Map<string, HealthCheckResult>
): number {
  let score = 100; // Start with perfect score

  // Deduct points for health check failures
  for (const [checkName, check] of healthChecks) {
    switch (check.status) {
      case 'fail':
        score -= 25; // Major deduction for failures
        break;
      case 'warn':
        score -= 10; // Minor deduction for warnings
        break;
      case 'pass':
        // No deduction for passes
        break;
    }
  }

  // Deduct points for high memory usage
  if (metrics.memoryUsage.percentage > 90) {
    score -= 20; // Critical memory usage
  } else if (metrics.memoryUsage.percentage > 80) {
    score -= 10; // High memory usage
  }

  // Deduct points for database issues
  if (metrics.databaseStatus === 'error') {
    score -= 30; // Database errors are critical
  } else if (metrics.databaseStatus === 'slow') {
    score -= 15; // Slow database performance
  }

  // Deduct points for API issues
  if (metrics.apiStatus === 'down') {
    score -= 25; // API down is critical
  } else if (metrics.apiStatus === 'degraded') {
    score -= 10; // Degraded API performance
  }

  // Ensure score doesn't go below 0
  return Math.max(0, score);
}
```

### 2. SystemHealthController Implementation

#### Controller Class Structure
```typescript
export class SystemHealthController {
  private systemHealthService: SystemHealthService;

  constructor(systemHealthService: SystemHealthService) {
    this.systemHealthService = systemHealthService;
  }

  // Health data endpoints
  async getCurrentHealth(req: Request, res: Response): Promise<void>
  async getHealthHistory(req: Request, res: Response): Promise<void>
  async getActiveAlerts(req: Request, res: Response): Promise<void>
  async getHealthCheckResults(req: Request, res: Response): Promise<void>

  // Monitoring control endpoints
  async startMonitoring(req: Request, res: Response): Promise<void>
  async stopMonitoring(req: Request, res: Response): Promise<void>
  async getMonitoringStatus(req: Request, res: Response): Promise<void>

  // Health check and alert endpoints
  async performHealthCheck(req: Request, res: Response): Promise<void>
  async createAlert(req: Request, res: Response): Promise<void>
  async acknowledgeAlert(req: Request, res: Response): Promise<void>

  // Utility endpoints
  async getHealthSummary(req: Request, res: Response): Promise<void>
  async cleanup(req: Request, res: Response): Promise<void>
}
```

#### Example Endpoint Implementation
```typescript
async getCurrentHealth(req: Request, res: Response): Promise<void> {
  try {
    const healthData = await this.systemHealthService.getCurrentHealth();
    
    if (!healthData) {
      res.status(404).json({
        success: false,
        message: 'No health data available',
        data: null
      });
      return;
    }

    res.json({
      success: true,
      message: 'Current health data retrieved successfully',
      data: healthData
    });
  } catch (error) {
    logger.error('Error retrieving current health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve current health data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
```

### 3. Route Configuration

#### Express Router Setup
```typescript
import express from 'express';
import { body, query, param } from 'express-validator';
import { SystemHealthController } from '../controllers/systemHealthController';
import { auth } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();
const controller = new SystemHealthController(global.systemHealthService);

// Health data endpoints
router.get('/current', auth, controller.getCurrentHealth.bind(controller));
router.get('/history', auth, query('limit').optional().isInt({ min: 1, max: 1000 }), validateRequest, controller.getHealthHistory.bind(controller));
router.get('/alerts', auth, controller.getActiveAlerts.bind(controller));
router.get('/health-check-results', auth, controller.getHealthCheckResults.bind(controller));

// Monitoring control endpoints
router.post('/monitoring/start', auth, body('intervalMs').optional().isInt({ min: 1000, max: 300000 }), validateRequest, controller.startMonitoring.bind(controller));
router.post('/monitoring/stop', auth, controller.stopMonitoring.bind(controller));
router.get('/monitoring/status', auth, controller.getMonitoringStatus.bind(controller));

// Health check and alert endpoints
router.post('/health-check', auth, controller.performHealthCheck.bind(controller));
router.post('/alerts', auth, [
  body('type').isIn(['info', 'warning', 'critical', 'error']),
  body('category').isIn(['system', 'performance', 'database', 'api', 'security']),
  body('message').isLength({ min: 1, max: 500 }),
  body('severity').isIn(['low', 'medium', 'high', 'critical']),
  body('source').isLength({ min: 1, max: 100 })
], validateRequest, controller.createAlert.bind(controller));

router.post('/alerts/:id/acknowledge', auth, [
  param('id').isLength({ min: 1 }),
  body('acknowledgedBy').isLength({ min: 1, max: 100 })
], validateRequest, controller.acknowledgeAlert.bind(controller));

// Utility endpoints
router.get('/summary', auth, controller.getHealthSummary.bind(controller));
router.post('/cleanup', auth, controller.cleanup.bind(controller));

export default router;
```

## 📊 Data Models & Interfaces

### 1. Core Interfaces

#### SystemHealthMetrics
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

#### SystemAlert
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

#### HealthCheckResult
```typescript
interface HealthCheckResult {
  status: 'pass' | 'warn' | 'fail';
  message: string;
  timestamp: Date;
  responseTime: number;
  details: Record<string, any>;
}
```

### 2. Database Schema

#### Health Metrics Table
```sql
CREATE TABLE health_metrics (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP NOT NULL,
  system_status VARCHAR(20) NOT NULL,
  uptime INTEGER NOT NULL,
  memory_used BIGINT NOT NULL,
  memory_total BIGINT NOT NULL,
  memory_percentage DECIMAL(5,2) NOT NULL,
  cpu_current DECIMAL(5,2) NOT NULL,
  cpu_average DECIMAL(5,2) NOT NULL,
  cpu_percentage DECIMAL(5,2) NOT NULL,
  database_status VARCHAR(20) NOT NULL,
  api_status VARCHAR(20) NOT NULL,
  performance_score INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_health_metrics_timestamp ON health_metrics(timestamp);
CREATE INDEX idx_health_metrics_system_status ON health_metrics(system_status);
```

#### Alerts Table
```sql
CREATE TABLE system_alerts (
  id VARCHAR(50) PRIMARY KEY,
  type VARCHAR(20) NOT NULL,
  category VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  details JSONB,
  timestamp TIMESTAMP NOT NULL,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by VARCHAR(100),
  acknowledged_at TIMESTAMP,
  severity VARCHAR(20) NOT NULL,
  source VARCHAR(100) NOT NULL,
  business_entity_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_system_alerts_timestamp ON system_alerts(timestamp);
CREATE INDEX idx_system_alerts_type ON system_alerts(type);
CREATE INDEX idx_system_alerts_severity ON system_alerts(severity);
CREATE INDEX idx_system_alerts_acknowledged ON system_alerts(acknowledged);
```

#### Health Check Results Table
```sql
CREATE TABLE health_check_results (
  id SERIAL PRIMARY KEY,
  check_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  response_time INTEGER NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_health_check_results_timestamp ON health_check_results(timestamp);
CREATE INDEX idx_health_check_results_check_name ON health_check_results(check_name);
CREATE INDEX idx_health_check_results_status ON health_check_results(status);
```

## 🔄 Event System

### 1. Event Types

#### Monitoring Events
```typescript
// Monitoring lifecycle events
'monitoringStarted' - Emitted when monitoring starts
'monitoringStopped' - Emitted when monitoring stops
'monitoringError' - Emitted when monitoring encounters an error

// Health check events
'healthCheckCompleted' - Emitted when health check completes successfully
'healthCheckFailed' - Emitted when health check fails
'healthCheckStarted' - Emitted when health check starts

// Alert events
'alertCreated' - Emitted when new alert is created
'alertAcknowledged' - Emitted when alert is acknowledged
'alertUpdated' - Emitted when alert is updated
'alertDeleted' - Emitted when alert is deleted
```

#### Event Payloads
```typescript
// monitoringStarted event
{
  timestamp: Date;
  intervalMs: number;
}

// healthCheckCompleted event
{
  metrics: SystemHealthMetrics;
  responseTime: number;
  timestamp: Date;
}

// alertCreated event
{
  alert: SystemAlert;
  timestamp: Date;
}
```

### 2. Event Handling

#### Event Listener Example
```typescript
// In the main application
systemHealthService.on('monitoringStarted', (data) => {
  logger.info('System health monitoring started', data);
  // Update UI status
  // Send notifications
  // Update monitoring dashboard
});

systemHealthService.on('alertCreated', (data) => {
  logger.info('New system alert created', data);
  // Send real-time notifications
  // Update alert dashboard
  // Trigger escalation procedures
});

systemHealthService.on('healthCheckFailed', (data) => {
  logger.error('Health check failed', data);
  // Send immediate alerts
  // Update system status
  // Trigger incident response
});
```

## 🔒 Security Implementation

### 1. Authentication & Authorization

#### JWT Token Validation
```typescript
// Auth middleware
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};
```

#### Role-Based Access Control
```typescript
// Role-based middleware
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    next();
  };
};

// Usage in routes
router.post('/alerts', auth, requireRole(['admin', 'operator']), controller.createAlert);
```

### 2. Input Validation & Sanitization

#### Request Validation
```typescript
// Validation middleware
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Validation rules
const createAlertValidation = [
  body('type').isIn(['info', 'warning', 'critical', 'error']).withMessage('Invalid alert type'),
  body('category').isIn(['system', 'performance', 'database', 'api', 'security']).withMessage('Invalid category'),
  body('message').isLength({ min: 1, max: 500 }).withMessage('Message must be between 1 and 500 characters'),
  body('severity').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity level'),
  body('source').isLength({ min: 1, max: 100 }).withMessage('Source must be between 1 and 100 characters')
];
```

#### SQL Injection Prevention
```typescript
// Using Prisma ORM for safe database operations
async getHealthHistory(limit: number = 100): Promise<SystemMetrics[]> {
  // Prisma automatically handles SQL injection prevention
  return this.metricsHistory.slice(-limit);
}

// Parameterized queries for custom operations
async getMetricsByDateRange(startDate: Date, endDate: Date): Promise<SystemMetrics[]> {
  return await this.prisma.$queryRaw`
    SELECT * FROM health_metrics 
    WHERE timestamp BETWEEN ${startDate} AND ${endDate}
    ORDER BY timestamp DESC
  `;
}
```

## 📈 Performance Optimization

### 1. Database Optimization

#### Connection Pooling
```typescript
// Prisma configuration for connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pool configuration
  connection: {
    pool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 200,
    },
  },
});
```

#### Query Optimization
```typescript
// Efficient data retrieval with pagination
async getHealthHistory(limit: number = 100, offset: number = 0): Promise<SystemMetrics[]> {
  // Use slice for in-memory pagination
  const startIndex = Math.max(0, this.metricsHistory.length - limit - offset);
  const endIndex = this.metricsHistory.length - offset;
  return this.metricsHistory.slice(startIndex, endIndex);
}

// Batch operations for cleanup
async cleanup(): Promise<void> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  // Remove old metrics in batches
  const oldMetrics = this.metricsHistory.filter(
    metric => metric.timestamp > oneDayAgo
  );
  
  // Keep only recent metrics
  this.metricsHistory = oldMetrics;
  
  // Remove old acknowledged alerts
  for (const [id, alert] of this.activeAlerts.entries()) {
    if (alert.acknowledged && alert.acknowledgedAt && alert.acknowledgedAt < oneDayAgo) {
      this.activeAlerts.delete(id);
    }
  }
}
```

### 2. Memory Management

#### Efficient Data Structures
```typescript
// Use Map for O(1) lookups
private activeAlerts: Map<string, SystemAlert> = new Map();
private healthCheckResults: Map<string, HealthCheckResult> = new Map();

// Use arrays for ordered data with efficient slicing
private metricsHistory: SystemMetrics[] = [];

// Limit memory usage
private readonly MAX_METRICS_HISTORY = 1000;
private readonly MAX_ALERTS = 500;
```

#### Garbage Collection
```typescript
// Regular cleanup to prevent memory leaks
async cleanup(): Promise<void> {
  // Remove old metrics
  if (this.metricsHistory.length > this.MAX_METRICS_HISTORY) {
    this.metricsHistory = this.metricsHistory.slice(-this.MAX_METRICS_HISTORY);
  }
  
  // Remove old alerts
  if (this.activeAlerts.size > this.MAX_ALERTS) {
    const sortedAlerts = Array.from(this.activeAlerts.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // Keep only the most recent alerts
    this.activeAlerts.clear();
    sortedAlerts.slice(0, this.MAX_ALERTS).forEach(alert => {
      this.activeAlerts.set(alert.id, alert);
    });
  }
  
  logger.debug('System health service cleanup completed');
}
```

## 🧪 Testing Implementation

### 1. Unit Testing Strategy

#### Service Testing
```typescript
describe('SystemHealthService', () => {
  let service: SystemHealthService;
  let mockPrisma: jest.Mocked<PrismaClient>;
  let mockEventEmitter: jest.Mocked<EventEmitter>;

  beforeEach(() => {
    mockPrisma = {
      $queryRaw: jest.fn()
    } as any;
    
    mockEventEmitter = {
      emit: jest.fn(),
      on: jest.fn(),
      once: jest.fn(),
      off: jest.fn()
    } as any;
    
    service = new SystemHealthService(mockPrisma);
    Object.setPrototypeOf(service, mockEventEmitter);
  });

  describe('startMonitoring', () => {
    it('should start monitoring successfully', async () => {
      mockPrisma.$queryRaw = jest.fn().mockResolvedValue([{ '?column?': 1 }]);

      await service.startMonitoring();

      expect(service.isMonitoringActive()).toBe(true);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('monitoringStarted', expect.any(Object));
    });
  });
});
```

#### Controller Testing
```typescript
describe('SystemHealthController', () => {
  let controller: SystemHealthController;
  let mockSystemHealthService: jest.Mocked<SystemHealthService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockSystemHealthService = {
      getCurrentHealth: jest.fn(),
      getHealthHistory: jest.fn(),
      startMonitoring: jest.fn(),
      stopMonitoring: jest.fn()
    } as any;
    
    controller = new SystemHealthController(mockSystemHealthService);
    
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
  });

  describe('getCurrentHealth', () => {
    it('should return current health data successfully', async () => {
      const mockHealthData = { systemStatus: 'healthy', performanceScore: 95 };
      mockSystemHealthService.getCurrentHealth.mockResolvedValue(mockHealthData);

      await controller.getCurrentHealth(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Current health data retrieved successfully',
        data: mockHealthData
      });
    });
  });
});
```

### 2. Integration Testing

#### API Endpoint Testing
```typescript
describe('System Health API', () => {
  let app: Express;
  let authToken: string;

  beforeAll(async () => {
    app = createTestApp();
    authToken = await generateTestToken();
  });

  describe('GET /api/system-health/current', () => {
    it('should return current health data for authenticated user', async () => {
      const response = await request(app)
        .get('/api/system-health/current')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('systemStatus');
      expect(response.body.data).toHaveProperty('performanceScore');
    });

    it('should return 401 for unauthenticated request', async () => {
      await request(app)
        .get('/api/system-health/current')
        .expect(401);
    });
  });
});
```

## 🚀 Deployment Configuration

### 1. Environment Configuration

#### Environment Variables
```bash
# System Health Service Configuration
SYSTEM_HEALTH_MONITORING_INTERVAL=30000
SYSTEM_HEALTH_MAX_METRICS_HISTORY=1000
SYSTEM_HEALTH_MAX_ALERTS=500
SYSTEM_HEALTH_CLEANUP_INTERVAL=3600000

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Security Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3000

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=json
```

#### Configuration Files
```typescript
// config/systemHealth.ts
export const systemHealthConfig = {
  monitoring: {
    interval: parseInt(process.env.SYSTEM_HEALTH_MONITORING_INTERVAL || '30000'),
    maxMetricsHistory: parseInt(process.env.SYSTEM_HEALTH_MAX_METRICS_HISTORY || '1000'),
    maxAlerts: parseInt(process.env.SYSTEM_HEALTH_MAX_ALERTS || '500'),
    cleanupInterval: parseInt(process.env.SYSTEM_HEALTH_CLEANUP_INTERVAL || '3600000')
  },
  database: {
    url: process.env.DATABASE_URL!,
    pool: {
      min: parseInt(process.env.DATABASE_POOL_MIN || '2'),
      max: parseInt(process.env.DATABASE_POOL_MAX || '10')
    }
  },
  security: {
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  }
};
```

### 2. Docker Configuration

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/
COPY packages/frontend/package*.json ./packages/frontend/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY packages/backend ./packages/backend
COPY packages/frontend ./packages/frontend

# Build frontend
RUN cd packages/frontend && npm run build

# Expose ports
EXPOSE 3000 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start application
CMD ["npm", "run", "start:prod"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/dbname
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=dbname
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d dbname"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

## 📊 Monitoring & Observability

### 1. Logging Strategy

#### Structured Logging
```typescript
// Logger configuration
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'system-health' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Usage in service
logger.info('System health monitoring started', {
  intervalMs: 30000,
  timestamp: new Date().toISOString(),
  service: 'SystemHealthService'
});

logger.error('Health check failed', {
  error: error.message,
  stack: error.stack,
  timestamp: new Date().toISOString(),
  service: 'SystemHealthService'
});
```

#### Log Levels
- **ERROR**: System failures, health check failures, critical alerts
- **WARN**: Warning conditions, performance degradation, high resource usage
- **INFO**: Normal operations, monitoring start/stop, health check completion
- **DEBUG**: Detailed debugging information, metric values, health check details

### 2. Metrics Collection

#### Performance Metrics
```typescript
// Metrics collection
interface PerformanceMetrics {
  healthCheckDuration: number;
  memoryUsage: number;
  activeAlerts: number;
  performanceScore: number;
  uptime: number;
}

// Metrics export
export const getPerformanceMetrics = (): PerformanceMetrics => ({
  healthCheckDuration: lastHealthCheckDuration,
  memoryUsage: process.memoryUsage().heapUsed,
  activeAlerts: activeAlerts.size,
  performanceScore: lastPerformanceScore,
  uptime: process.uptime()
});
```

#### Health Check Metrics
```typescript
// Health check metrics
interface HealthCheckMetrics {
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  averageResponseTime: number;
  lastCheckTimestamp: Date;
}

// Metrics calculation
export const getHealthCheckMetrics = (): HealthCheckMetrics => {
  const checks = Array.from(healthCheckResults.values());
  const totalChecks = checks.length;
  const successfulChecks = checks.filter(c => c.status === 'pass').length;
  const failedChecks = checks.filter(c => c.status === 'fail').length;
  const averageResponseTime = checks.reduce((sum, c) => sum + c.responseTime, 0) / totalChecks;

  return {
    totalChecks,
    successfulChecks,
    failedChecks,
    averageResponseTime,
    lastCheckTimestamp: checks[checks.length - 1]?.timestamp || new Date()
  };
};
```

## 🔮 Future Technical Enhancements

### 1. AI/ML Integration

#### Anomaly Detection
```typescript
// Future implementation
interface AnomalyDetectionConfig {
  algorithm: 'isolation-forest' | 'local-outlier-factor' | 'autoencoder';
  sensitivity: number;
  trainingWindow: number;
  updateInterval: number;
}

class AnomalyDetectionService {
  async detectAnomalies(metrics: SystemMetrics[]): Promise<AnomalyResult[]> {
    // ML-based anomaly detection
    // Return detected anomalies with confidence scores
  }
  
  async trainModel(historicalData: SystemMetrics[]): Promise<void> {
    // Train ML model on historical data
    // Update model parameters
  }
}
```

#### Predictive Analytics
```typescript
// Future implementation
interface PredictiveAnalyticsConfig {
  forecastHorizon: number;
  confidenceLevel: number;
  updateFrequency: number;
}

class PredictiveAnalyticsService {
  async predictSystemHealth(historicalData: SystemMetrics[]): Promise<HealthPrediction[]> {
    // Time series forecasting
    // Return health predictions with confidence intervals
  }
  
  async generateRecommendations(predictions: HealthPrediction[]): Promise<Recommendation[]> {
    // Generate actionable recommendations
    // Based on predicted health issues
  }
}
```

### 2. Advanced Monitoring Features

#### Service Dependency Mapping
```typescript
// Future implementation
interface ServiceDependency {
  serviceId: string;
  serviceName: string;
  dependencies: string[];
  healthStatus: 'healthy' | 'warning' | 'critical';
  lastCheck: Date;
}

class ServiceDependencyMapper {
  async buildDependencyGraph(): Promise<ServiceDependencyGraph> {
    // Build service dependency graph
    // Detect circular dependencies
    // Calculate impact of service failures
  }
  
  async calculateImpact(serviceId: string): Promise<ImpactAnalysis> {
    // Calculate impact of service failure
    // Identify affected services
    // Estimate recovery time
  }
}
```

#### Real-time Collaboration
```typescript
// Future implementation
interface CollaborationFeature {
  realTimeUpdates: boolean;
  userPresence: boolean;
  sharedAnnotations: boolean;
  incidentChat: boolean;
}

class CollaborationService {
  async shareDashboard(dashboardId: string, users: string[]): Promise<void> {
    // Share dashboard with team members
    // Real-time collaboration features
  }
  
  async addAnnotation(alertId: string, annotation: string, userId: string): Promise<void> {
    // Add annotations to alerts
    // Team collaboration on incident resolution
  }
}
```

## 📚 Technical References

### 1. Technology Stack
- **Backend**: Node.js 18+, Express 4.x, TypeScript 5.x
- **Database**: PostgreSQL 15+, Prisma ORM 5.x
- **Frontend**: React 18+, TypeScript 5.x, Vite 5.x
- **Testing**: Jest 29+, Vitest 1.x, Testing Library
- **Monitoring**: Winston logging, custom metrics collection

### 2. Design Patterns
- **Service Layer Pattern**: Business logic separation
- **Repository Pattern**: Data access abstraction
- **Observer Pattern**: Event-driven architecture
- **Factory Pattern**: Object creation
- **Strategy Pattern**: Algorithm selection

### 3. Best Practices
- **SOLID Principles**: Single responsibility, open/closed, etc.
- **DRY Principle**: Don't repeat yourself
- **KISS Principle**: Keep it simple, stupid
- **Fail Fast**: Early error detection and handling
- **Defensive Programming**: Input validation and error handling

---

**This technical documentation provides comprehensive coverage of the Story 4.6 implementation, including architecture, design patterns, security considerations, and future enhancement possibilities.** 🚀
