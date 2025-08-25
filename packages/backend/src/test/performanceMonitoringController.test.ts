import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Request, Response } from 'express';
import { PerformanceMonitoringController } from '../controllers/performanceMonitoringController';
import PerformanceMonitoringService from '../services/performanceMonitoringService';

// Mock the performance monitoring service
jest.mock('../services/performanceMonitoringService');

describe('PerformanceMonitoringController', () => {
  let controller: PerformanceMonitoringController;
  let mockService: jest.Mocked<PerformanceMonitoringService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock service
    mockService = {
      getMetrics: jest.fn(),
      getMetricsSummary: jest.fn(),
      getAlerts: jest.fn(),
      getConfig: jest.fn(),
      updateConfig: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      emit: jest.fn(),
      on: jest.fn(),
      removeListener: jest.fn()
    } as any;

    // Create controller instance
    controller = new PerformanceMonitoringController(mockService);

    // Create mock request and response objects
    mockRequest = {
      query: {},
      body: {},
      params: {}
    };

    mockResponse = {
      json: jest.fn() as any,
      status: jest.fn().mockReturnThis() as any
    };
  });

  describe('getMetrics', () => {
    it('should return metrics successfully', async () => {
      const mockMetrics = [
        {
          id: '1',
          type: 'api' as const,
          name: 'GET /api/test',
          value: 150,
          unit: 'ms',
          timestamp: new Date(),
          metadata: {}
        }
      ];

      mockService.getMetrics.mockReturnValue(mockMetrics);

      const result = await controller.getMetrics();

      expect(mockService.getMetrics).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        data: {
          metrics: mockMetrics,
          count: 1,
          type: 'all'
        }
      });
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Service error');
      mockService.getMetrics.mockImplementation(() => {
        throw error;
      });

      await expect(controller.getMetrics()).rejects.toThrow('Failed to retrieve performance metrics');
    });
  });

  describe('getMetricsSummary', () => {
    it('should return metrics summary successfully', async () => {
      const mockSummary = {
        totalMetrics: 100,
        totalAlerts: 5,
        recentMetrics: 25,
        dailyMetrics: 100,
        activeAlerts: 2,
        averageApiResponseTime: 150,
        averageDatabaseQueryTime: 75,
        averageFrontendLoadTime: 2000,
        systemHealth: 'healthy' as const
      };

      mockService.getMetricsSummary.mockReturnValue(mockSummary);

      const result = await controller.getMetricsSummary();

      expect(mockService.getMetricsSummary).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        data: mockSummary
      });
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Service error');
      mockService.getMetricsSummary.mockImplementation(() => {
        throw error;
      });

      await expect(controller.getMetricsSummary()).rejects.toThrow('Failed to retrieve metrics summary');
    });
  });

  describe('getAlerts', () => {
    it('should return alerts successfully', async () => {
      const mockAlerts = [
        {
          id: '1',
          metricId: 'metric1',
          type: 'warning' as const,
          message: 'API response time exceeded threshold',
          threshold: 200,
          actualValue: 250,
          timestamp: new Date()
        }
      ];

      mockService.getAlerts.mockReturnValue(mockAlerts);

      const result = await controller.getAlerts();

      expect(mockService.getAlerts).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        data: {
          alerts: mockAlerts,
          count: 1,
          type: 'all'
        }
      });
    });
  });

  describe('getConfiguration', () => {
    it('should return configuration successfully', async () => {
      const mockConfig = {
        apiResponseTimeThreshold: 200,
        databaseQueryTimeThreshold: 100,
        frontendLoadTimeThreshold: 3000,
        systemMemoryThreshold: 80,
        alertEnabled: true,
        metricsRetentionDays: 30
      };

      mockService.getConfig.mockReturnValue(mockConfig);

      const result = await controller.getConfig();

      expect(mockService.getConfig).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        data: mockConfig
      });
    });
  });

  describe('updateConfiguration', () => {
    it('should update configuration successfully', async () => {
      const updateData = {
        apiResponseTimeThreshold: 150,
        databaseQueryTimeThreshold: 75
      };

      const updatedConfig = {
        apiResponseTimeThreshold: 150,
        databaseQueryTimeThreshold: 75,
        frontendLoadTimeThreshold: 3000,
        systemMemoryThreshold: 80,
        alertEnabled: true,
        metricsRetentionDays: 30
      };

      mockService.updateConfig.mockReturnValue(updatedConfig as any);

      const result = await controller.updateConfig(updateData);

      expect(mockService.updateConfig).toHaveBeenCalledWith(updateData);
      expect(result).toEqual({
        success: true,
        data: updatedConfig
      });
    });
  });

  describe('startMonitoring', () => {
    it('should start monitoring successfully', async () => {
      await controller.startMonitoring();

      expect(mockService.start).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Service error');
      mockService.start.mockImplementation(() => {
        throw error;
      });

      await expect(controller.startMonitoring()).rejects.toThrow('Failed to start monitoring');
    });
  });

  describe('stopMonitoring', () => {
    it('should stop monitoring successfully', async () => {
      await controller.stopMonitoring();

      expect(mockService.stop).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Service error');
      mockService.stop.mockImplementation(() => {
        throw error;
      });

      await expect(controller.stopMonitoring()).rejects.toThrow('Failed to stop monitoring');
    });
  });

  describe('Legacy Methods', () => {
    describe('getMetricsLegacy', () => {
      it('should handle request/response correctly', async () => {
        const mockMetrics = [
          {
            id: '1',
            type: 'api' as const,
            name: 'GET /api/test',
            value: 150,
            unit: 'ms',
            timestamp: new Date(),
            metadata: {}
          }
        ];

        mockService.getMetrics.mockReturnValue(mockMetrics);
        mockRequest.query = { type: 'api', limit: '50' };

        await controller.getMetricsLegacy(mockRequest as Request, mockResponse as Response);

        expect(mockService.getMetrics).toHaveBeenCalledWith('api', 50);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: true,
          data: {
            metrics: mockMetrics,
            count: 1,
            type: 'api'
          }
        });
      });
    });

    describe('getAlertsLegacy', () => {
      it('should handle request/response correctly', async () => {
        const mockAlerts = [
          {
            id: '1',
            metricId: 'metric1',
            type: 'warning' as const,
            message: 'API response time exceeded threshold',
            threshold: 200,
            actualValue: 250,
            timestamp: new Date()
          }
        ];

        mockService.getAlerts.mockReturnValue(mockAlerts);
        mockRequest.query = { type: 'warning', limit: '25' };

        await controller.getAlertsLegacy(mockRequest as Request, mockResponse as Response);

        expect(mockService.getAlerts).toHaveBeenCalledWith('warning', 25);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: true,
          data: {
            alerts: mockAlerts,
            count: 1,
            type: 'warning'
          }
        });
      });
    });

    describe('updateConfigurationLegacy', () => {
      it('should handle request/response correctly', async () => {
        const updateData = {
          apiResponseTimeThreshold: 150,
          databaseQueryTimeThreshold: 75
        };

        const updatedConfig = {
          apiResponseTimeThreshold: 150,
          databaseQueryTimeThreshold: 75,
          frontendLoadTimeThreshold: 3000,
          systemMemoryThreshold: 80,
          alertEnabled: true,
          metricsRetentionDays: 30
        };

        mockService.updateConfig.mockReturnValue(updatedConfig as any);
        mockRequest.body = updateData;

        await controller.updateConfigurationLegacy(mockRequest as Request, mockResponse as Response);

        expect(mockService.updateConfig).toHaveBeenCalledWith(updateData);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: true,
          data: updatedConfig
        });
      });
    });
  });
});
