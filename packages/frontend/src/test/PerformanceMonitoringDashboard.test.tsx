import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PerformanceMonitoringDashboard from '../components/PerformanceMonitoringDashboard';

// Mock the performanceApi service
vi.mock('../services/performanceApi', () => ({
  getMetrics: vi.fn(),
  getAlerts: vi.fn(),
  getOptimizationRecommendations: vi.fn(),
  getBottlenecks: vi.fn(),
  getMetricsSummary: vi.fn(),
  getAlertSummary: vi.fn(),
  getOptimizationStatus: vi.fn(),
  getTestStatus: vi.fn(),
  getDatabaseOptimizationStatus: vi.fn(),
  getApiOptimizationStatus: vi.fn(),
  getFrontendOptimizationStatus: vi.fn(),
  runBenchmark: vi.fn(),
  runStressTest: vi.fn(),
  runMemoryTest: vi.fn(),
  clearTestHistory: vi.fn(),
  analyzeQueries: vi.fn(),
  analyzeApiEndpoints: vi.fn(),
  analyzeFrontendPerformance: vi.fn(),
  detectBottlenecks: vi.fn(),
  startMonitoring: vi.fn(),
  stopMonitoring: vi.fn()
}));

describe('PerformanceMonitoringDashboard', () => {
  it('should render without crashing', async () => {
    // Mock successful API responses
    const { getMetrics, getAlerts, getOptimizationRecommendations, getBottlenecks } = await import('../services/performanceApi');
    
    (getMetrics as any).mockResolvedValue({
      api: {
        responseTime: { current: 150, average: 120, p95: 200, p99: 300 },
        throughput: { current: 1000, average: 950 },
        errorRate: { current: 2, average: 1.5 },
        availability: { current: 99.9, average: 99.8 }
      },
      database: {
        queryTime: { current: 75, average: 65, p95: 120, p99: 180 },
        throughput: { current: 500, average: 480 },
        connectionPool: { current: 80, max: 100 },
        slowQueries: { current: 5, average: 3 }
      },
      system: {
        cpuUsage: { current: 45, average: 40 },
        memoryUsage: { current: 60, average: 55, max: 100 },
        diskUsage: { current: 70, average: 68, max: 100 },
        networkUsage: { current: 30, average: 25 }
      },
      frontend: {
        loadTime: { current: 2000, average: 1800, p95: 3000, p99: 4000 },
        renderTime: { current: 150, average: 120 },
        bundleSize: { current: 2.5, average: 2.3 },
        assetCount: { current: 25, average: 23 }
      }
    });

    (getAlerts as any).mockResolvedValue([
      {
        id: '1',
        type: 'warning',
        category: 'API',
        title: 'High Response Time',
        description: 'API response time exceeded threshold',
        severity: 'medium',
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ]);

    (getOptimizationRecommendations as any).mockResolvedValue([
      {
        id: '1',
        type: 'caching',
        description: 'Implement Redis caching for API responses',
        estimatedImprovement: 25,
        priority: 'high',
        status: 'pending'
      }
    ]);

    (getBottlenecks as any).mockResolvedValue([
      {
        id: '1',
        type: 'database',
        severity: 'medium',
        description: 'Slow database queries detected',
        detectedAt: new Date().toISOString(),
        status: 'active'
      }
    ]);

    render(<PerformanceMonitoringDashboard />);
    
    // Wait for the component to load and check if the main title is rendered
    expect(await screen.findByText('Performance Monitoring Dashboard')).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    // Mock delayed API responses to test loading state
    const { getMetrics } = vi.hoisted(() => ({
      getMetrics: vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      )
    }));

    render(<PerformanceMonitoringDashboard />);
    
    // Should show loading message
    expect(screen.getByText('Loading performance data...')).toBeInTheDocument();
  });
});
