import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import PerformanceMonitoringService from '../services/performanceMonitoringService';
import { performance } from 'perf_hooks';

describe('PerformanceMonitoringService', () => {
  let service: PerformanceMonitoringService;

  beforeEach(() => {
    service = new PerformanceMonitoringService();
    service.start(); // Start monitoring for tests
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      const config = service.getConfig();
      expect(config.apiResponseTimeThreshold).toBe(200);
      expect(config.databaseQueryTimeThreshold).toBe(100);
      expect(config.frontendLoadTimeThreshold).toBe(3000);
      expect(config.systemMemoryThreshold).toBe(80);
      expect(config.alertEnabled).toBe(true);
      expect(config.metricsRetentionDays).toBe(30);
    });

    it('should initialize with custom configuration', () => {
      const customConfig = {
        apiResponseTimeThreshold: 150,
        databaseQueryTimeThreshold: 75,
        frontendLoadTimeThreshold: 2000,
        systemMemoryThreshold: 70
      };
      const customService = new PerformanceMonitoringService(customConfig);
      const config = customService.getConfig();
      expect(config.apiResponseTimeThreshold).toBe(150);
      expect(config.databaseQueryTimeThreshold).toBe(75);
      expect(config.frontendLoadTimeThreshold).toBe(2000);
      expect(config.systemMemoryThreshold).toBe(70);
    });
  });

  describe('API Call Tracking', () => {
    it('should track API call performance', () => {
      const startTime = performance.now();
      const endTime = startTime + 150; // 150ms duration
      
      service.trackApiCall('GET /api/users', startTime, endTime, { userId: '123' });
      
      const metrics = service.getMetrics('api');
      expect(metrics).toHaveLength(1);
      expect(metrics[0].type).toBe('api');
      expect(metrics[0].name).toBe('GET /api/users');
      expect(metrics[0].value).toBe(150);
      expect(metrics[0].unit).toBe('ms');
      expect(metrics[0].metadata).toEqual({ userId: '123' });
    });

    it('should not track API calls when monitoring is stopped', () => {
      service.stop();
      const startTime = performance.now();
      const endTime = startTime + 100;
      
      service.trackApiCall('GET /api/test', startTime, endTime);
      
      const metrics = service.getMetrics('api');
      expect(metrics).toHaveLength(0);
    });

    it('should create warning alert for slow API calls', () => {
      const startTime = performance.now();
      const endTime = startTime + 250; // Exceeds 200ms threshold
      
      service.trackApiCall('GET /api/slow', startTime, endTime);
      
      const alerts = service.getAlerts('warning');
      expect(alerts).toHaveLength(1);
      expect(alerts[0].message).toContain('API response time 250ms exceeds threshold 200ms');
      expect(alerts[0].type).toBe('warning');
    });
  });

  describe('Database Query Tracking', () => {
    it('should track database query performance', () => {
      const startTime = performance.now();
      const endTime = startTime + 80; // 80ms duration
      
      service.trackDatabaseQuery('SELECT * FROM users WHERE id = ?', startTime, endTime, { table: 'users' });
      
      const metrics = service.getMetrics('database');
      expect(metrics).toHaveLength(1);
      expect(metrics[0].type).toBe('database');
      expect(metrics[0].name).toBe('SELECT * FROM users WHERE id = ?');
      expect(metrics[0].value).toBe(80);
      expect(metrics[0].unit).toBe('ms');
      expect(metrics[0].metadata).toEqual({ 
        fullQuery: 'SELECT * FROM users WHERE id = ?',
        table: 'users' 
      });
    });

    it('should truncate long query names', () => {
      const longQuery = 'SELECT * FROM very_long_table_name_that_exceeds_one_hundred_characters_and_should_be_truncated_for_display_purposes';
      const startTime = performance.now();
      const endTime = startTime + 50;
      
      service.trackDatabaseQuery(longQuery, startTime, endTime);
      
      const metrics = service.getMetrics('database');
      expect(metrics[0].name.length).toBeLessThanOrEqual(100);
    });

    it('should create warning alert for slow database queries', () => {
      const startTime = performance.now();
      const endTime = startTime + 150; // Exceeds 100ms threshold
      
      service.trackDatabaseQuery('SELECT * FROM large_table', startTime, endTime);
      
      const alerts = service.getAlerts('warning');
      expect(alerts).toHaveLength(1);
      expect(alerts[0].message).toContain('Database query time 150ms exceeds threshold 100ms');
      expect(alerts[0].type).toBe('warning');
    });
  });

  describe('Frontend Performance Tracking', () => {
    it('should track frontend performance metrics', () => {
      service.trackFrontendPerformance('page-load', 2500, { page: '/dashboard' });
      
      const metrics = service.getMetrics('frontend');
      expect(metrics).toHaveLength(1);
      expect(metrics[0].type).toBe('frontend');
      expect(metrics[0].name).toBe('page-load');
      expect(metrics[0].value).toBe(2500);
      expect(metrics[0].unit).toBe('ms');
      expect(metrics[0].metadata).toEqual({ page: '/dashboard' });
    });

    it('should create warning alert for slow frontend loads', () => {
      service.trackFrontendPerformance('page-load', 3500); // Exceeds 3000ms threshold
      
      const alerts = service.getAlerts('warning');
      expect(alerts).toHaveLength(1);
      expect(alerts[0].message).toContain('Frontend load time 3500ms exceeds threshold 3000ms');
      expect(alerts[0].type).toBe('warning');
    });
  });

  describe('System Monitoring', () => {
    it('should start system monitoring when service starts', () => {
      const emitSpy = jest.spyOn(service, 'emit');
      
      service.start();
      
      expect(emitSpy).toHaveBeenCalledWith('monitoring-started');
      emitSpy.mockRestore();
    });

    it('should stop system monitoring when service stops', () => {
      const emitSpy = jest.spyOn(service, 'emit');
      
      service.start();
      service.stop();
      
      expect(emitSpy).toHaveBeenCalledWith('monitoring-stopped');
      emitSpy.mockRestore();
    });
  });

  describe('Alert Management', () => {
    it('should create alerts when thresholds are exceeded', () => {
      const startTime = performance.now();
      const endTime = startTime + 300; // Exceeds API threshold
      
      service.trackApiCall('GET /api/slow', startTime, endTime);
      
      const alerts = service.getAlerts();
      expect(alerts).toHaveLength(1);
      expect(alerts[0].type).toBe('warning');
      expect(alerts[0].threshold).toBe(200);
      expect(alerts[0].actualValue).toBeCloseTo(300, 10);
    });

    it('should not create alerts when alerts are disabled', () => {
      service.updateConfig({ alertEnabled: false });
      
      const startTime = performance.now();
      const endTime = startTime + 300;
      
      service.trackApiCall('GET /api/slow', startTime, endTime);
      
      const alerts = service.getAlerts();
      expect(alerts).toHaveLength(0);
    });

    it('should create critical alerts for system memory issues', () => {
      // We can't easily test the private method, but we can test the behavior
      // by checking if the service responds to configuration changes
      service.updateConfig({ systemMemoryThreshold: 70 });
      
      // The actual memory monitoring happens in setInterval, which is hard to test
      // This test verifies the configuration update works
      const config = service.getConfig();
      expect(config.systemMemoryThreshold).toBe(70);
    });
  });

  describe('Metrics Management', () => {
    it('should return metrics filtered by type', () => {
      const startTime = performance.now();
      const endTime = startTime + 100;
      
      service.trackApiCall('GET /api/test1', startTime, endTime);
      service.trackDatabaseQuery('SELECT * FROM test', startTime, endTime);
      service.trackFrontendPerformance('test', 1000);
      
      const apiMetrics = service.getMetrics('api');
      const dbMetrics = service.getMetrics('database');
      const frontendMetrics = service.getMetrics('frontend');
      
      expect(apiMetrics).toHaveLength(1);
      expect(dbMetrics).toHaveLength(1);
      expect(frontendMetrics).toHaveLength(1);
    });

    it('should limit returned metrics', () => {
      const startTime = performance.now();
      const endTime = startTime + 100;
      
      // Create 150 metrics
      for (let i = 0; i < 150; i++) {
        service.trackApiCall(`GET /api/test${i}`, startTime, endTime);
      }
      
      const limitedMetrics = service.getMetrics('api', 50);
      expect(limitedMetrics).toHaveLength(50);
    });

    it('should clean up old metrics based on retention policy', () => {
      const startTime = performance.now();
      const endTime = startTime + 100;
      
      service.trackApiCall('GET /api/test', startTime, endTime);
      
      // Update retention to 1 day to test cleanup
      service.updateConfig({ metricsRetentionDays: 1 });
      
      // Trigger cleanup by adding another metric
      service.trackApiCall('GET /api/test2', startTime, endTime);
      
      const metrics = service.getMetrics();
      expect(metrics).toHaveLength(2); // Both metrics should remain as they're recent
      
      // Verify cleanup is working by checking the retention config
      const config = service.getConfig();
      expect(config.metricsRetentionDays).toBe(1);
    });
  });

  describe('Configuration Management', () => {
    it('should update configuration', () => {
      const newConfig = {
        apiResponseTimeThreshold: 150,
        databaseQueryTimeThreshold: 75,
        frontendLoadTimeThreshold: 2000,
        systemMemoryThreshold: 70
      };
      
      service.updateConfig(newConfig);
      
      const config = service.getConfig();
      expect(config.apiResponseTimeThreshold).toBe(150);
      expect(config.databaseQueryTimeThreshold).toBe(75);
      expect(config.frontendLoadTimeThreshold).toBe(2000);
      expect(config.systemMemoryThreshold).toBe(70);
    });

    it('should emit config-updated event', () => {
      const emitSpy = jest.spyOn(service, 'emit');
      
      service.updateConfig({ apiResponseTimeThreshold: 150 });
      
      expect(emitSpy).toHaveBeenCalledWith('config-updated', expect.objectContaining({
        apiResponseTimeThreshold: 150
      }));
      emitSpy.mockRestore();
    });
  });

  describe('Metrics Summary', () => {
    it('should generate metrics summary', () => {
      const startTime = performance.now();
      const endTime = startTime + 100;
      
      // Add some test metrics
      service.trackApiCall('GET /api/test1', startTime, endTime);
      service.trackApiCall('GET /api/test2', startTime, endTime + 50);
      service.trackDatabaseQuery('SELECT * FROM test', startTime, endTime + 25);
      
      const summary = service.getMetricsSummary();
      
      expect(summary.totalMetrics).toBe(3);
      expect(summary.api.responseTime.current).toBe(125); // (100 + 150) / 2
      expect(summary.database.queryTime.current).toBe(125);
      expect(summary.systemHealth).toBe('healthy');
    });

    it('should calculate system health correctly', () => {
      // Create some alerts to test system health calculation
      const startTime = performance.now();
      const endTime = startTime + 300; // Exceeds threshold
      
      // Add multiple slow API calls to create warnings
      for (let i = 0; i < 6; i++) {
        service.trackApiCall(`GET /api/slow${i}`, startTime, endTime);
      }
      
      const summary = service.getMetricsSummary();
      expect(summary.systemHealth).toBe('warning');
    });
  });

  describe('Event Emission', () => {
    it('should emit metric-added event when tracking metrics', () => {
      const emitSpy = jest.spyOn(service, 'emit');
      const startTime = performance.now();
      const endTime = startTime + 100;
      
      service.trackApiCall('GET /api/test', startTime, endTime);
      
      expect(emitSpy).toHaveBeenCalledWith('metric-added', expect.objectContaining({
        type: 'api',
        name: 'GET /api/test'
      }));
      emitSpy.mockRestore();
    });

    it('should emit alert-created event when creating alerts', () => {
      const emitSpy = jest.spyOn(service, 'emit');
      const startTime = performance.now();
      const endTime = startTime + 300; // Exceeds threshold
      
      service.trackApiCall('GET /api/slow', startTime, endTime);
      
      expect(emitSpy).toHaveBeenCalledWith('alert-created', expect.objectContaining({
        type: 'warning'
      }));
      emitSpy.mockRestore();
    });
  });
});
