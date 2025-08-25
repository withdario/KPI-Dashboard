import PerformanceOptimizationService from '../services/performanceOptimizationService';
import PerformanceMonitoringService from '../services/performanceMonitoringService';
// import DatabaseMonitoringService from '../services/databaseMonitoringService';
import PerformanceBottleneckService from '../services/performanceBottleneckService';

// Mock the services
jest.mock('../services/performanceMonitoringService');
jest.mock('../services/databaseMonitoringService');
jest.mock('../services/performanceBottleneckService');

describe('PerformanceOptimizationService', () => {
  let optimizationService: PerformanceOptimizationService;
  let mockPerformanceService: jest.Mocked<PerformanceMonitoringService>;
  let mockBottleneckService: jest.Mocked<PerformanceBottleneckService>;

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



    mockBottleneckService = {
      detectBottlenecks: jest.fn(),
      getBottlenecks: jest.fn(),
      getActiveBottlenecks: jest.fn(),
      getBottleneck: jest.fn(),
      updateBottleneckStatus: jest.fn(),
      getThresholds: jest.fn(),
      updateThresholds: jest.fn()
    } as any;

    optimizationService = new PerformanceOptimizationService(
      mockPerformanceService,
      mockBottleneckService
    );
  });

  describe('generateOptimizationRecommendations', () => {
    it('should generate recommendations based on API bottlenecks', async () => {
      mockBottleneckService.detectBottlenecks.mockResolvedValue([
        {
          id: 'bottleneck_1',
          type: 'api',
          severity: 'critical',
          description: 'API response time is critically high',
          detectedAt: new Date(),
          metrics: { responseTime: 1200 },
          recommendations: ['Implement caching'],
          status: 'active'
        }
      ] as any);

      const recommendations = await optimizationService.generateOptimizationRecommendations();
      
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(r => r.type === 'caching')).toBe(true);
      expect(recommendations.some(r => r.type === 'code_optimization')).toBe(true);
    });

    it('should generate recommendations based on database bottlenecks', async () => {
      mockBottleneckService.detectBottlenecks.mockResolvedValue([
        {
          id: 'bottleneck_2',
          type: 'database',
          severity: 'critical',
          description: 'Database query time is critically high',
          detectedAt: new Date(),
          metrics: { queryTime: 800 },
          recommendations: ['Add indexes'],
          status: 'active'
        }
      ] as any);

      const recommendations = await optimizationService.generateOptimizationRecommendations();
      
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(r => r.type === 'indexing')).toBe(true);
      expect(recommendations.some(r => r.type === 'query_optimization')).toBe(true);
    });

    it('should generate recommendations based on system bottlenecks', async () => {
      mockBottleneckService.detectBottlenecks.mockResolvedValue([
        {
          id: 'bottleneck_3',
          type: 'system',
          severity: 'critical',
          description: 'System memory usage is critically high',
          detectedAt: new Date(),
          metrics: { memory: 95 },
          recommendations: ['Check for memory leaks'],
          status: 'active'
        }
      ] as any);

      const recommendations = await optimizationService.generateOptimizationRecommendations();
      
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(r => r.type === 'resource_management')).toBe(true);
    });

    it('should generate recommendations based on frontend bottlenecks', async () => {
      mockBottleneckService.detectBottlenecks.mockResolvedValue([
        {
          id: 'bottleneck_4',
          type: 'frontend',
          severity: 'critical',
          description: 'Frontend load time is critically high',
          detectedAt: new Date(),
          metrics: { loadTime: 6000 },
          recommendations: ['Optimize bundle'],
          status: 'active'
        }
      ] as any);

      const recommendations = await optimizationService.generateOptimizationRecommendations();
      
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(r => r.type === 'caching')).toBe(true);
      expect(recommendations.some(r => r.type === 'code_optimization')).toBe(true);
    });

    it('should include proactive optimizations', async () => {
      mockBottleneckService.detectBottlenecks.mockResolvedValue([]);

      const recommendations = await optimizationService.generateOptimizationRecommendations();
      
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(r => r.description.includes('Redis caching layer'))).toBe(true);
      expect(recommendations.some(r => r.description.includes('database indexes'))).toBe(true);
      expect(recommendations.some(r => r.description.includes('connection pooling'))).toBe(true);
    });

    it('should sort recommendations by priority and impact', async () => {
      mockBottleneckService.detectBottlenecks.mockResolvedValue([
        {
          id: 'bottleneck_1',
          type: 'api',
          severity: 'critical',
          description: 'API error rate is critically high',
          detectedAt: new Date(),
          metrics: { errorRate: 15 },
          recommendations: ['Implement circuit breaker'],
          status: 'active'
        }
      ] as any);

      const recommendations = await optimizationService.generateOptimizationRecommendations();
      
      // Critical priority should come first
      const criticalRecommendations = recommendations.filter(r => r.priority === 'critical');
      const highPriorityRecommendations = recommendations.filter(r => r.priority === 'high');
      
      expect(criticalRecommendations.length).toBeGreaterThan(0);
      if (highPriorityRecommendations.length > 0) {
        expect(recommendations.indexOf(criticalRecommendations[0])).toBeLessThan(
          recommendations.indexOf(highPriorityRecommendations[0])
        );
      }
    });
  });

  describe('executeOptimization', () => {
    it('should execute caching optimization successfully', async () => {
      // First generate recommendations
      mockBottleneckService.detectBottlenecks.mockResolvedValue([
        {
          id: 'bottleneck_1',
          type: 'api',
          severity: 'critical',
          description: 'API response time is critically high',
          detectedAt: new Date(),
          metrics: { responseTime: 1200 },
          recommendations: ['Implement caching'],
          status: 'active'
        }
      ] as any);

      const recommendations = await optimizationService.generateOptimizationRecommendations();
      const cachingAction = recommendations.find(r => r.type === 'caching');
      
      if (cachingAction) {
        mockPerformanceService.getMetricsSummary
          .mockReturnValueOnce({ api: { responseTime: { current: 1200 } } } as any)
          .mockReturnValueOnce({ api: { responseTime: { current: 800 } } } as any);

        const result = await optimizationService.executeOptimization(cachingAction.id);
        
        expect(result.success).toBe(true);
        expect(result.notes).toContain('Cache hit rate improved');
        expect(result.beforeMetrics).toBeDefined();
        expect(result.afterMetrics).toBeDefined();
        expect(result.improvement).toBeDefined();
      }
    });

    it('should execute indexing optimization successfully', async () => {
      // First generate recommendations
      mockBottleneckService.detectBottlenecks.mockResolvedValue([
        {
          id: 'bottleneck_2',
          type: 'database',
          severity: 'critical',
          description: 'Database query time is critically high',
          detectedAt: new Date(),
          metrics: { queryTime: 800 },
          recommendations: ['Add indexes'],
          status: 'active'
        }
      ] as any);

      const recommendations = await optimizationService.generateOptimizationRecommendations();
      const indexingAction = recommendations.find(r => r.type === 'indexing');
      
      if (indexingAction) {
        mockPerformanceService.getMetricsSummary
          .mockReturnValueOnce({ database: { queryTime: { current: 800 } } } as any)
          .mockReturnValueOnce({ database: { queryTime: { current: 200 } } } as any);

        const result = await optimizationService.executeOptimization(indexingAction.id);
        
        expect(result.success).toBe(true);
        expect(result.notes).toContain('Query performance improved');
      }
    });

    it('should throw error for non-existent action', async () => {
      await expect(
        optimizationService.executeOptimization('non-existent-id')
      ).rejects.toThrow('Optimization action non-existent-id not found');
    });

    it('should throw error for non-pending action', async () => {
      // First generate recommendations
      mockBottleneckService.detectBottlenecks.mockResolvedValue([
        {
          id: 'bottleneck_1',
          type: 'api',
          severity: 'critical',
          description: 'API response time is critically high',
          detectedAt: new Date(),
          metrics: { responseTime: 1200 },
          recommendations: ['Implement caching'],
          status: 'active'
        }
      ] as any);

      const recommendations = await optimizationService.generateOptimizationRecommendations();
      const action = recommendations[0];
      
      // Manually change status to completed
      (action as any).status = 'completed';
      
      await expect(
        optimizationService.executeOptimization(action.id)
      ).rejects.toThrow('Optimization action');
    });
  });

  describe('getOptimizationStatus', () => {
    it('should return optimization status summary', async () => {
      // First generate some recommendations
      mockBottleneckService.detectBottlenecks.mockResolvedValue([
        {
          id: 'bottleneck_1',
          type: 'api',
          severity: 'critical',
          description: 'API response time is critically high',
          detectedAt: new Date(),
          metrics: { responseTime: 1200 },
          recommendations: ['Implement caching'],
          status: 'active'
        }
      ] as any);

      await optimizationService.generateOptimizationRecommendations();
      
      const status = optimizationService.getOptimizationStatus();
      
      expect(status.summary).toBeDefined();
      expect(status.summary.total).toBeGreaterThan(0);
      expect(status.priorityBreakdown).toBeDefined();
      expect(status.typeBreakdown).toBeDefined();
      expect(status.recentResults).toBeDefined();
    });
  });

  describe('getOptimizationActions', () => {
    it('should return all optimization actions', async () => {
      // First generate some recommendations
      mockBottleneckService.detectBottlenecks.mockResolvedValue([
        {
          id: 'bottleneck_1',
          type: 'api',
          severity: 'critical',
          description: 'API response time is critically high',
          detectedAt: new Date(),
          metrics: { responseTime: 1200 },
          recommendations: ['Implement caching'],
          status: 'active'
        }
      ] as any);

      await optimizationService.generateOptimizationRecommendations();
      
      const actions = optimizationService.getOptimizationActions();
      expect(actions.length).toBeGreaterThan(0);
      expect(actions.every(a => a.id && a.type && a.description)).toBe(true);
    });
  });

  describe('getOptimizationAction', () => {
    it('should return specific optimization action', async () => {
      // First generate some recommendations
      mockBottleneckService.detectBottlenecks.mockResolvedValue([
        {
          id: 'bottleneck_1',
          type: 'api',
          severity: 'critical',
          description: 'API response time is critically high',
          detectedAt: new Date(),
          metrics: { responseTime: 1200 },
          recommendations: ['Implement caching'],
          status: 'active'
        }
      ] as any);

      await optimizationService.generateOptimizationRecommendations();
      const actions = optimizationService.getOptimizationActions();
      
      if (actions.length > 0) {
        const action = optimizationService.getOptimizationAction(actions[0].id);
        expect(action).toBeDefined();
        expect(action?.id).toBe(actions[0].id);
      }
    });

    it('should return undefined for non-existent action', () => {
      const action = optimizationService.getOptimizationAction('non-existent-id');
      expect(action).toBeUndefined();
    });
  });

  describe('getOptimizationResults', () => {
    it('should return optimization results', async () => {
      // First generate and execute a recommendation
      mockBottleneckService.detectBottlenecks.mockResolvedValue([
        {
          id: 'bottleneck_1',
          type: 'api',
          severity: 'critical',
          description: 'API response time is critically high',
          detectedAt: new Date(),
          metrics: { responseTime: 1200 },
          recommendations: ['Implement caching'],
          status: 'active'
        }
      ] as any);

      const recommendations = await optimizationService.generateOptimizationRecommendations();
      const action = recommendations.find(r => r.type === 'caching');
      
      if (action) {
        mockPerformanceService.getMetricsSummary
          .mockReturnValueOnce({ api: { responseTime: { current: 1200 } } } as any)
          .mockReturnValueOnce({ api: { responseTime: { current: 800 } } } as any);

        await optimizationService.executeOptimization(action.id);
        
        const results = optimizationService.getOptimizationResults();
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].actionId).toBe(action.id);
        expect(results[0].success).toBe(true);
      }
    });
  });
});
