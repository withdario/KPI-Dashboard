import PerformanceBottleneckService from '../services/performanceBottleneckService';
import PerformanceMonitoringService from '../services/performanceMonitoringService';

// Mock the services
jest.mock('../services/performanceMonitoringService');
jest.mock('../services/databaseMonitoringService');

describe('PerformanceBottleneckService', () => {
  let bottleneckService: PerformanceBottleneckService;
  let mockPerformanceService: jest.Mocked<PerformanceMonitoringService>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock instances
    mockPerformanceService = {
      getMetricsSummary: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      trackApiCall: jest.fn(),
      trackDatabaseQuery: jest.fn(),
      trackFrontendPerformance: jest.fn(),
      startSystemMonitoring: jest.fn(),
      stopSystemMonitoring: jest.fn(),
      getMetrics: jest.fn(),
      getAlerts: jest.fn(),
      getConfiguration: jest.fn(),
      updateConfiguration: jest.fn(),
      getMonitoringStatus: jest.fn()
    } as any;

    bottleneckService = new PerformanceBottleneckService(
      mockPerformanceService
    );
  });

  describe('detectBottlenecks', () => {
    it('should detect API bottlenecks when response time is critical', async () => {
      mockPerformanceService.getMetricsSummary.mockReturnValue({
        api: {
          responseTime: { current: 1200, average: 800, p95: 1000, p99: 1500 },
          errorRate: { current: 2, average: 1, p95: 3, p99: 5 },
          throughput: { current: 150, average: 120, p95: 140, p99: 160 }
        }
      } as any);

      const bottlenecks = await bottleneckService.detectBottlenecks();
      
      expect(bottlenecks).toHaveLength(1);
      expect(bottlenecks[0].type).toBe('api');
      expect(bottlenecks[0].severity).toBe('critical');
      expect(bottlenecks[0].description).toContain('API response time is critically high');
    });

    it('should detect API bottlenecks when error rate is critical', async () => {
      mockPerformanceService.getMetricsSummary.mockReturnValue({
        api: {
          responseTime: { current: 300, average: 250, p95: 400, p99: 500 },
          errorRate: { current: 12, average: 2, p95: 5, p99: 8 },
          throughput: { current: 150, average: 120, p95: 140, p99: 160 }
        }
      } as any);

      const bottlenecks = await bottleneckService.detectBottlenecks();
      
      expect(bottlenecks).toHaveLength(1);
      expect(bottlenecks[0].type).toBe('api');
      expect(bottlenecks[0].severity).toBe('critical');
      expect(bottlenecks[0].description).toContain('API error rate is critically high');
    });

    it('should detect database bottlenecks when query time is critical', async () => {
      mockPerformanceService.getMetricsSummary.mockReturnValue({
        database: {
          queryTime: { current: 800, average: 200, p95: 400, p99: 600 },
          errorRate: { current: 1, average: 0.5, p95: 1.5, p99: 2 },
          slowQueries: { current: 15, average: 8, p95: 12, p99: 18 }
        }
      } as any);

      const bottlenecks = await bottleneckService.detectBottlenecks();
      
      expect(bottlenecks).toHaveLength(1);
      expect(bottlenecks[0].type).toBe('database');
      expect(bottlenecks[0].severity).toBe('critical');
      expect(bottlenecks[0].description).toContain('Database query time is critically high');
    });

    it('should detect system bottlenecks when memory usage is critical', async () => {
      mockPerformanceService.getMetricsSummary.mockReturnValue({
        system: {
          memory: { current: 95, average: 70, p95: 85, p99: 90 },
          cpu: { current: 75, average: 60, p95: 80, p99: 85 },
          uptime: { current: 99.8, average: 99.9, p95: 99.8, p99: 99.7 }
        }
      } as any);

      const bottlenecks = await bottleneckService.detectBottlenecks();
      
      expect(bottlenecks).toHaveLength(1);
      expect(bottlenecks[0].type).toBe('system');
      expect(bottlenecks[0].severity).toBe('critical');
      expect(bottlenecks[0].description).toContain('System memory usage is critically high');
    });

    it('should detect frontend bottlenecks when load time is critical', async () => {
      mockPerformanceService.getMetricsSummary.mockReturnValue({
        frontend: {
          loadTime: { current: 6000, average: 2000, p95: 4000, p99: 5000 },
          renderTime: { current: 1500, average: 800, p95: 1200, p99: 1500 },
          errorRate: { current: 1, average: 0.5, p95: 1.5, p99: 2 }
        }
      } as any);

      const bottlenecks = await bottleneckService.detectBottlenecks();
      
      expect(bottlenecks).toHaveLength(1);
      expect(bottlenecks[0].type).toBe('frontend');
      expect(bottlenecks[0].severity).toBe('critical');
      expect(bottlenecks[0].description).toContain('Frontend load time is critically high');
    });

    it('should return empty array when no bottlenecks detected', async () => {
      mockPerformanceService.getMetricsSummary.mockReturnValue({
        api: {
          responseTime: { current: 200, average: 180, p95: 250, p99: 300 },
          errorRate: { current: 1, average: 0.8, p95: 2, p99: 3 },
          throughput: { current: 200, average: 180, p95: 190, p99: 210 }
        },
        database: {
          queryTime: { current: 50, average: 40, p95: 80, p99: 100 },
          errorRate: { current: 0.5, average: 0.3, p95: 1, p99: 1.5 },
          slowQueries: { current: 5, average: 3, p95: 8, p99: 12 }
        },
        system: {
          memory: { current: 60, average: 55, p95: 70, p99: 75 },
          cpu: { current: 50, average: 45, p95: 65, p99: 70 },
          uptime: { current: 99.9, average: 99.9, p95: 99.9, p99: 99.8 }
        },
        frontend: {
          loadTime: { current: 1500, average: 1200, p95: 2000, p99: 2500 },
          renderTime: { current: 500, average: 400, p95: 800, p99: 1000 },
          errorRate: { current: 0.5, average: 0.3, p95: 1, p99: 1.5 }
        }
      } as any);

      const bottlenecks = await bottleneckService.detectBottlenecks();
      
      expect(bottlenecks).toHaveLength(0);
    });
  });

  describe('getBottlenecks', () => {
    it('should return all bottlenecks', () => {
      const bottlenecks = bottleneckService.getBottlenecks();
      expect(Array.isArray(bottlenecks)).toBe(true);
    });
  });

  describe('getActiveBottlenecks', () => {
    it('should return only active bottlenecks', async () => {
      // First detect some bottlenecks
      mockPerformanceService.getMetricsSummary.mockReturnValue({
        api: {
          responseTime: { current: 1200, average: 800, p95: 1000, p99: 1500 },
          errorRate: { current: 2, average: 1, p95: 3, p99: 5 },
          throughput: { current: 150, average: 120, p95: 140, p99: 160 }
        }
      } as any);

      await bottleneckService.detectBottlenecks();
      
      const activeBottlenecks = bottleneckService.getActiveBottlenecks();
      expect(activeBottlenecks.length).toBeGreaterThan(0);
      expect(activeBottlenecks.every(b => b.status === 'active')).toBe(true);
    });
  });

  describe('getBottleneck', () => {
    it('should return specific bottleneck by ID', async () => {
      mockPerformanceService.getMetricsSummary.mockReturnValue({
        api: {
          responseTime: { current: 1200, average: 800, p95: 1000, p99: 1500 },
          errorRate: { current: 2, average: 1, p95: 3, p99: 5 },
          throughput: { current: 150, average: 120, p95: 140, p99: 160 }
        }
      } as any);

      await bottleneckService.detectBottlenecks();
      const bottlenecks = bottleneckService.getBottlenecks();
      
      if (bottlenecks.length > 0) {
        const bottleneck = bottleneckService.getBottleneck(bottlenecks[0].id);
        expect(bottleneck).toBeDefined();
        expect(bottleneck?.id).toBe(bottlenecks[0].id);
      }
    });

    it('should return undefined for non-existent ID', () => {
      const bottleneck = bottleneckService.getBottleneck('non-existent-id');
      expect(bottleneck).toBeUndefined();
    });
  });

  describe('updateBottleneckStatus', () => {
    it('should update bottleneck status', async () => {
      mockPerformanceService.getMetricsSummary.mockReturnValue({
        api: {
          responseTime: { current: 1200, average: 800, p95: 1000, p99: 1500 },
          errorRate: { current: 2, average: 1, p95: 3, p99: 5 },
          throughput: { current: 150, average: 120, p95: 140, p99: 160 }
        }
      } as any);

      await bottleneckService.detectBottlenecks();
      const bottlenecks = bottleneckService.getBottlenecks();
      
      if (bottlenecks.length > 0) {
        const bottleneckId = bottlenecks[0].id;
        bottleneckService.updateBottleneckStatus(bottleneckId, 'investigating', 'Under investigation');
        
        const updatedBottleneck = bottleneckService.getBottleneck(bottleneckId);
        expect(updatedBottleneck?.status).toBe('investigating');
      }
    });
  });

  describe('getThresholds', () => {
    it('should return current thresholds', () => {
      const thresholds = bottleneckService.getThresholds();
      expect(thresholds).toBeDefined();
      expect(thresholds.api).toBeDefined();
      expect(thresholds.database).toBeDefined();
      expect(thresholds.system).toBeDefined();
      expect(thresholds.frontend).toBeDefined();
    });
  });

  describe('updateThresholds', () => {
    it('should update thresholds', () => {
      const newThresholds = {
        api: {
          responseTime: { warning: 600, critical: 1200 }
        }
      };

      bottleneckService.updateThresholds(newThresholds);
      const updatedThresholds = bottleneckService.getThresholds();
      
      expect(updatedThresholds.api.responseTime.warning).toBe(600);
      expect(updatedThresholds.api.responseTime.critical).toBe(1200);
    });
  });
});
