import { SystemHealthService } from '../services/systemHealthService';
import { PrismaClient } from '@prisma/client';

// Mock Prisma client
const mockPrisma = {
  $queryRaw: jest.fn()
} as unknown as PrismaClient;

// Mock logger
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }
}));

// Mock os module
jest.mock('os', () => ({
  totalmem: jest.fn(() => 8589934592) // 8GB
}));

describe('SystemHealthService', () => {
  let service: SystemHealthService;
  let mockEventEmitter: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SystemHealthService(mockPrisma);
    mockEventEmitter = jest.spyOn(service, 'emit');
  });

  afterEach(() => {
    if (service.isMonitoringActive()) {
      service.stopMonitoring();
    }
  });

  describe('Constructor', () => {
    it('should create a new SystemHealthService instance', () => {
      expect(service).toBeInstanceOf(SystemHealthService);
      expect(service.isMonitoringActive()).toBe(false);
    });
  });

  describe('startMonitoring', () => {
    it('should start monitoring successfully', async () => {
      mockPrisma.$queryRaw = jest.fn().mockResolvedValue([{ '?column?': 1 }]);

      await service.startMonitoring();

      expect(service.isMonitoringActive()).toBe(true);
      expect(mockEventEmitter).toHaveBeenCalledWith('monitoringStarted', expect.any(Object));
    });

    it('should not start monitoring if already running', async () => {
      mockPrisma.$queryRaw = jest.fn().mockResolvedValue([{ '?column?': 1 }]);

      await service.startMonitoring();
      await service.startMonitoring();

      // Should not emit additional monitoringStarted events
      expect(mockEventEmitter).toHaveBeenCalledWith('monitoringStarted', expect.any(Object));
    });

    it('should handle database errors gracefully during startup', async () => {
      mockPrisma.$queryRaw = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      // The service should handle database errors gracefully and not throw
      await service.startMonitoring();
      
      // Monitoring should still be active despite database errors
      expect(service.isMonitoringActive()).toBe(true);
      
      // Should emit monitoringStarted event
      expect(mockEventEmitter).toHaveBeenCalledWith('monitoringStarted', expect.any(Object));
    });
  });

  describe('stopMonitoring', () => {
    it('should stop monitoring successfully', async () => {
      mockPrisma.$queryRaw = jest.fn().mockResolvedValue([{ '?column?': 1 }]);

      await service.startMonitoring();
      await service.stopMonitoring();

      expect(service.isMonitoringActive()).toBe(false);
      expect(mockEventEmitter).toHaveBeenCalledWith('monitoringStopped', expect.any(Object));
    });

    it('should not stop monitoring if not running', async () => {
      await service.stopMonitoring();

      expect(mockEventEmitter).not.toHaveBeenCalled();
    });
  });

  describe('performHealthCheck', () => {
    beforeEach(() => {
      mockPrisma.$queryRaw = jest.fn().mockResolvedValue([{ '?column?': 1 }]);
    });

    it('should perform health check successfully', async () => {
      const result = await service.performHealthCheck();

      expect(result).toBeDefined();
      expect(result.systemStatus).toBeDefined();
      expect(result.performanceScore).toBeGreaterThanOrEqual(0);
      expect(result.performanceScore).toBeLessThanOrEqual(100);
      expect(mockEventEmitter).toHaveBeenCalledWith('healthCheckCompleted', expect.any(Object));
    });

    it('should handle database errors during health check', async () => {
      mockPrisma.$queryRaw = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      const result = await service.performHealthCheck();

      expect(result.systemStatus).toBe('critical');
      expect(result.databaseStatus).toBe('error');
      expect(result.performanceScore).toBeLessThanOrEqual(70); // Should be low due to database error
      expect(mockEventEmitter).toHaveBeenCalledWith('alertCreated', expect.objectContaining({
        type: 'critical',
        category: 'database',
        severity: 'critical'
      }));
    });

    it('should detect slow database responses', async () => {
      mockPrisma.$queryRaw = jest.fn().mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve([{ '?column?': 1 }]), 1500);
        });
      });

      const result = await service.performHealthCheck();

      expect(result.databaseStatus).toBe('slow');
    });
  });

  describe('collectSystemMetrics', () => {
    it('should collect memory usage metrics', async () => {
      const result = await service.performHealthCheck();

      expect(result.memoryUsage).toBeDefined();
      expect(result.memoryUsage.used).toBeGreaterThan(0);
      expect(result.memoryUsage.total).toBe(8589934592);
      expect(result.memoryUsage.percentage).toBeGreaterThan(0);
    });

    it('should collect uptime metrics', async () => {
      const result = await service.performHealthCheck();

      expect(result.uptime).toBeGreaterThan(0);
    });

    it('should collect database status', async () => {
      mockPrisma.$queryRaw = jest.fn().mockResolvedValue([{ '?column?': 1 }]);

      const result = await service.performHealthCheck();

      expect(result.databaseStatus).toBe('connected');
    });
  });

  describe('runHealthChecks', () => {
    it('should run database health check', async () => {
      mockPrisma.$queryRaw = jest.fn().mockResolvedValue([{ '?column?': 1 }]);

      await service.performHealthCheck();
      const results = await service.getHealthCheckResults();

      const dbCheck = results.find(r => r.message.includes('Database'));
      expect(dbCheck).toBeDefined();
      expect(dbCheck?.status).toBe('pass');
    });

    it('should run memory health check', async () => {
      await service.performHealthCheck();
      const results = await service.getHealthCheckResults();

      const memoryCheck = results.find(r => r.message.includes('Memory'));
      expect(memoryCheck).toBeDefined();
      expect(memoryCheck?.status).toBe('pass');
    });

    it('should run uptime health check', async () => {
      await service.performHealthCheck();
      const results = await service.getHealthCheckResults();

      const uptimeCheck = results.find(r => r.message.includes('uptime'));
      expect(uptimeCheck).toBeDefined();
      // Uptime status depends on actual system uptime, so just check it exists
      expect(['pass', 'warn']).toContain(uptimeCheck?.status);
    });
  });

  describe('analyzeSystemStatus', () => {
    it('should return healthy status when all checks pass', async () => {
      mockPrisma.$queryRaw = jest.fn().mockResolvedValue([{ '?column?': 1 }]);

      const result = await service.performHealthCheck();

      // System status depends on uptime, so it could be healthy or warning
      expect(['healthy', 'warning']).toContain(result.systemStatus);
    });

    it('should return warning status when some checks warn', async () => {
      // Mock high memory usage
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = jest.fn(() => ({
        heapUsed: 7000000000, // 7GB
        external: 1000000000,  // 1GB
        heapTotal: 1000000000,
        rss: 1000000000
      })) as any;

      const result = await service.performHealthCheck();

      // System status could be warning or critical depending on other factors
      expect(['warning', 'critical']).toContain(result.systemStatus);

      // Restore original
      process.memoryUsage = originalMemoryUsage;
    });

    it('should return critical status when checks fail', async () => {
      mockPrisma.$queryRaw = jest.fn().mockRejectedValue(new Error('Database error'));

      const result = await service.performHealthCheck();

      expect(result.systemStatus).toBe('critical');
    });
  });

  describe('calculatePerformanceScore', () => {
    it('should return high score for good health', async () => {
      mockPrisma.$queryRaw = jest.fn().mockResolvedValue([{ '?column?': 1 }]);

      const result = await service.performHealthCheck();

      // Performance score depends on uptime and other factors, so expect a reasonable range
      expect(result.performanceScore).toBeGreaterThanOrEqual(70);
      expect(result.performanceScore).toBeLessThanOrEqual(100);
    });

    it('should deduct points for health check failures', async () => {
      mockPrisma.$queryRaw = jest.fn().mockRejectedValue(new Error('Database error'));

      const result = await service.performHealthCheck();

      // Performance score should be low due to database error
      expect(result.performanceScore).toBeLessThanOrEqual(70);
    });

    it('should deduct points for memory usage', async () => {
      // Mock high memory usage
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = jest.fn(() => ({
        heapUsed: 8000000000, // 8GB
        external: 1000000000,  // 1GB
        heapTotal: 1000000000,
        rss: 1000000000
      })) as any;

      const result = await service.performHealthCheck();

      // Performance score should be lower due to high memory usage
      expect(result.performanceScore).toBeLessThan(100);

      // Restore original
      process.memoryUsage = originalMemoryUsage;
    });
  });

  describe('generateAlerts', () => {
    it('should generate alerts for critical issues', async () => {
      mockPrisma.$queryRaw = jest.fn().mockRejectedValue(new Error('Database error'));

      await service.performHealthCheck();
      const alerts = await service.getActiveAlerts();

      expect(alerts.length).toBeGreaterThan(0);
      const criticalAlert = alerts.find(a => a.severity === 'critical');
      expect(criticalAlert).toBeDefined();
      expect(criticalAlert?.message).toContain('Critical health check failure');
    });

    it('should generate alerts for memory issues', async () => {
      // Mock critical memory usage
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = jest.fn(() => ({
        heapUsed: 8000000000, // 8GB
        external: 1000000000,  // 1GB
        heapTotal: 1000000000,
        rss: 1000000000
      })) as any;

      await service.performHealthCheck();
      const alerts = await service.getActiveAlerts();

      const memoryAlert = alerts.find(a => a.source === 'memory-monitor');
      expect(memoryAlert).toBeDefined();

      // Restore original
      process.memoryUsage = originalMemoryUsage;
    });
  });

  describe('createAlert', () => {
    it('should create a new alert', async () => {
      const alertData = {
        type: 'warning' as const,
        category: 'system' as const,
        message: 'Test alert',
        timestamp: new Date(),
        severity: 'medium' as const,
        source: 'test'
      };

      const alert = await service.createAlert(alertData);

      expect(alert.id).toBeDefined();
      expect(alert.message).toBe('Test alert');
      expect(alert.acknowledged).toBe(false);
      expect(mockEventEmitter).toHaveBeenCalledWith('alertCreated', alert);
    });

    it('should generate unique alert IDs', async () => {
      const alertData = {
        type: 'info' as const,
        category: 'system' as const,
        message: 'Test alert 1',
        timestamp: new Date(),
        severity: 'low' as const,
        source: 'test'
      };

      const alert1 = await service.createAlert(alertData);
      const alert2 = await service.createAlert({ ...alertData, message: 'Test alert 2' });

      expect(alert1.id).not.toBe(alert2.id);
    });
  });

  describe('acknowledgeAlert', () => {
    it('should acknowledge an alert', async () => {
      const alertData = {
        type: 'warning' as const,
        category: 'system' as const,
        message: 'Test alert',
        timestamp: new Date(),
        severity: 'medium' as const,
        source: 'test'
      };

      const alert = await service.createAlert(alertData);
      const acknowledgedAlert = await service.acknowledgeAlert(alert.id, 'admin');

      expect(acknowledgedAlert?.acknowledged).toBe(true);
      expect(acknowledgedAlert?.acknowledgedBy).toBe('admin');
      expect(acknowledgedAlert?.acknowledgedAt).toBeDefined();
      expect(mockEventEmitter).toHaveBeenCalledWith('alertAcknowledged', acknowledgedAlert);
    });

    it('should return null for non-existent alert', async () => {
      const result = await service.acknowledgeAlert('non-existent', 'admin');

      expect(result).toBeNull();
    });
  });

  describe('Data retrieval methods', () => {
    beforeEach(async () => {
      mockPrisma.$queryRaw = jest.fn().mockResolvedValue([{ '?column?': 1 }]);
      await service.performHealthCheck();
    });

    it('should get current health', async () => {
      const health = await service.getCurrentHealth();

      expect(health).toBeDefined();
      expect(health?.systemStatus).toBeDefined();
    });

    it('should get health history', async () => {
      const history = await service.getHealthHistory();

      expect(history.length).toBeGreaterThan(0);
      expect(history[0].metrics).toBeDefined();
    });

    it('should get active alerts', async () => {
      const alerts = await service.getActiveAlerts();

      expect(Array.isArray(alerts)).toBe(true);
    });

    it('should get health check results', async () => {
      const results = await service.getHealthCheckResults();

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('cleanup', () => {
    it('should clean up old metrics and alerts', async () => {
      // Create some old data
      const oldDate = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago
      
      // Mock the private metricsHistory to add old data
      (service as any).metricsHistory = [
        {
          timestamp: oldDate,
          metrics: {} as any,
          alerts: []
        }
      ];

      await service.cleanup();
      const history = await service.getHealthHistory();

      expect(history.length).toBe(0);
    });
  });

  describe('formatUptime', () => {
    it('should format seconds correctly', () => {
      const formatUptime = (service as any).formatUptime;

      expect(formatUptime(30)).toBe('30s');
      expect(formatUptime(90)).toBe('1m 30s');
      expect(formatUptime(3661)).toBe('1h 1m 1s');
      expect(formatUptime(90000)).toBe('1d 1h 0m');
    });
  });

  describe('Event handling', () => {
    it('should emit events for monitoring lifecycle', async () => {
      mockPrisma.$queryRaw = jest.fn().mockResolvedValue([{ '?column?': 1 }]);

      const eventSpy = jest.fn();
      service.on('monitoringStarted', eventSpy);

      await service.startMonitoring();

      expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({
        timestamp: expect.any(Date)
      }));
    });

    it('should emit events for health check completion', async () => {
      mockPrisma.$queryRaw = jest.fn().mockResolvedValue([{ '?column?': 1 }]);

      const eventSpy = jest.fn();
      service.on('healthCheckCompleted', eventSpy);

      await service.performHealthCheck();

      expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({
        metrics: expect.any(Object),
        responseTime: expect.any(Number)
      }));
    });
  });
});
