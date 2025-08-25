import { Request, Response } from 'express';
import { SystemHealthController } from '../controllers/systemHealthController';

// Mock the service
const mockSystemHealthService = {
  getCurrentHealth: jest.fn(),
  getHealthHistory: jest.fn(),
  getActiveAlerts: jest.fn(),
  getHealthCheckResults: jest.fn(),
  startMonitoring: jest.fn(),
  stopMonitoring: jest.fn(),
  isMonitoringActive: jest.fn(),
  performHealthCheck: jest.fn(),
  createAlert: jest.fn(),
  acknowledgeAlert: jest.fn(),
  cleanup: jest.fn()
} as any;

// Mock logger
jest.mock('../utils/logger', () => ({
  logger: {
    error: jest.fn()
  }
}));

describe('SystemHealthController', () => {
  let controller: SystemHealthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new SystemHealthController(mockSystemHealthService);
    
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    
    mockRequest = {};
    mockResponse = {
      json: mockJson,
      status: mockStatus
    };
  });

  describe('getCurrentHealth', () => {
    it('should return current health data successfully', async () => {
      const mockHealth = {
        systemStatus: 'healthy',
        performanceScore: 95,
        uptime: 3600,
        memoryUsage: { used: 1000000000, total: 8589934592, percentage: 11.6 },
        cpuUsage: { current: 5, average: 3, percentage: 5 },
        databaseStatus: 'connected',
        apiStatus: 'operational',
        lastHealthCheck: new Date(),
        activeAlerts: 0
      };

      mockSystemHealthService.getCurrentHealth.mockResolvedValue(mockHealth);

      await controller.getCurrentHealth(mockRequest as Request, mockResponse as Response);

      expect(mockSystemHealthService.getCurrentHealth).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'System health retrieved successfully',
        data: mockHealth
      });
    });

    it('should return 404 when no health data available', async () => {
      mockSystemHealthService.getCurrentHealth.mockResolvedValue(null);

      await controller.getCurrentHealth(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'No health data available',
        data: null
      });
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Service error');
      mockSystemHealthService.getCurrentHealth.mockRejectedValue(error);

      await controller.getCurrentHealth(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to retrieve system health',
        error: 'Service error'
      });
    });
  });

  describe('getHealthHistory', () => {
    it('should return health history successfully', async () => {
      const mockHistory = [
        {
          timestamp: new Date(),
          metrics: { systemStatus: 'healthy' },
          alerts: []
        }
      ];

      mockSystemHealthService.getHealthHistory.mockResolvedValue(mockHistory);

      mockRequest.query = { limit: '50' };

      await controller.getHealthHistory(mockRequest as Request, mockResponse as Response);

      expect(mockSystemHealthService.getHealthHistory).toHaveBeenCalledWith(50);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Health history retrieved successfully',
        data: {
          history: mockHistory,
          count: 1,
          limit: 50
        }
      });
    });

    it('should use default limit when not specified', async () => {
      const mockHistory: any[] = [];
      mockSystemHealthService.getHealthHistory.mockResolvedValue(mockHistory);

      mockRequest.query = {};

      await controller.getHealthHistory(mockRequest as Request, mockResponse as Response);

      expect(mockSystemHealthService.getHealthHistory).toHaveBeenCalledWith(100);
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Service error');
      mockSystemHealthService.getHealthHistory.mockRejectedValue(error);

      mockRequest.query = {};

      await controller.getHealthHistory(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to retrieve health history',
        error: 'Service error'
      });
    });
  });

  describe('getActiveAlerts', () => {
    it('should return active alerts successfully', async () => {
      const mockAlerts = [
        {
          id: 'alert1',
          type: 'warning',
          category: 'system',
          message: 'Test alert',
          timestamp: new Date(),
          acknowledged: false,
          severity: 'medium',
          source: 'test'
        }
      ];

      mockSystemHealthService.getActiveAlerts.mockResolvedValue(mockAlerts);

      await controller.getActiveAlerts(mockRequest as Request, mockResponse as Response);

      expect(mockSystemHealthService.getActiveAlerts).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Active alerts retrieved successfully',
        data: {
          alerts: mockAlerts,
          count: 1
        }
      });
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Service error');
      mockSystemHealthService.getActiveAlerts.mockRejectedValue(error);

      await controller.getActiveAlerts(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to retrieve active alerts',
        error: 'Service error'
      });
    });
  });

  describe('getHealthCheckResults', () => {
    it('should return health check results successfully', async () => {
      const mockResults = [
        {
          status: 'pass',
          message: 'Database check passed',
          timestamp: new Date(),
          responseTime: 50
        }
      ];

      mockSystemHealthService.getHealthCheckResults.mockResolvedValue(mockResults);

      await controller.getHealthCheckResults(mockRequest as Request, mockResponse as Response);

      expect(mockSystemHealthService.getHealthCheckResults).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Health check results retrieved successfully',
        data: {
          results: mockResults,
          count: 1
        }
      });
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Service error');
      mockSystemHealthService.getHealthCheckResults.mockRejectedValue(error);

      await controller.getHealthCheckResults(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to retrieve health check results',
        error: 'Service error'
      });
    });
  });

  describe('startMonitoring', () => {
    it('should start monitoring successfully', async () => {
      mockSystemHealthService.startMonitoring.mockResolvedValue(undefined);

      mockRequest.body = { intervalMs: 60000 };

      await controller.startMonitoring(mockRequest as Request, mockResponse as Response);

      expect(mockSystemHealthService.startMonitoring).toHaveBeenCalledWith(60000);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'System health monitoring started successfully',
        data: {
          intervalMs: 60000,
          status: 'monitoring'
        }
      });
    });

    it('should use default interval when not specified', async () => {
      mockSystemHealthService.startMonitoring.mockResolvedValue(undefined);

      mockRequest.body = {};

      await controller.startMonitoring(mockRequest as Request, mockResponse as Response);

      expect(mockSystemHealthService.startMonitoring).toHaveBeenCalledWith(30000);
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Service error');
      mockSystemHealthService.startMonitoring.mockRejectedValue(error);

      mockRequest.body = {};

      await controller.startMonitoring(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to start system health monitoring',
        error: 'Service error'
      });
    });
  });

  describe('stopMonitoring', () => {
    it('should stop monitoring successfully', async () => {
      mockSystemHealthService.stopMonitoring.mockResolvedValue(undefined);

      await controller.stopMonitoring(mockRequest as Request, mockResponse as Response);

      expect(mockSystemHealthService.stopMonitoring).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'System health monitoring stopped successfully',
        data: {
          status: 'stopped'
        }
      });
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Service error');
      mockSystemHealthService.stopMonitoring.mockRejectedValue(error);

      await controller.stopMonitoring(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to stop system health monitoring',
        error: 'Service error'
      });
    });
  });

  describe('getMonitoringStatus', () => {
    it('should return monitoring status successfully', async () => {
      mockSystemHealthService.isMonitoringActive.mockReturnValue(true);

      await controller.getMonitoringStatus(mockRequest as Request, mockResponse as Response);

      expect(mockSystemHealthService.isMonitoringActive).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Monitoring status retrieved successfully',
        data: {
          isActive: true,
          status: 'monitoring'
        }
      });
    });

    it('should return stopped status when not monitoring', async () => {
      mockSystemHealthService.isMonitoringActive.mockReturnValue(false);

      await controller.getMonitoringStatus(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Monitoring status retrieved successfully',
        data: {
          isActive: false,
          status: 'stopped'
        }
      });
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Service error');
      mockSystemHealthService.isMonitoringActive.mockImplementation(() => {
        throw error;
      });

      await controller.getMonitoringStatus(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to retrieve monitoring status',
        error: 'Service error'
      });
    });
  });

  describe('performHealthCheck', () => {
    it('should perform health check successfully', async () => {
      const mockHealth = {
        systemStatus: 'healthy',
        performanceScore: 100
      };

      mockSystemHealthService.performHealthCheck.mockResolvedValue(mockHealth);

      await controller.performHealthCheck(mockRequest as Request, mockResponse as Response);

      expect(mockSystemHealthService.performHealthCheck).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Health check performed successfully',
        data: mockHealth
      });
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Service error');
      mockSystemHealthService.performHealthCheck.mockRejectedValue(error);

      await controller.performHealthCheck(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to perform health check',
        error: 'Service error'
      });
    });
  });

  describe('createAlert', () => {
    it('should create alert successfully', async () => {
      const mockAlert = {
        id: 'alert1',
        type: 'warning',
        category: 'system',
        message: 'Test alert',
        timestamp: new Date(),
        acknowledged: false,
        severity: 'medium',
        source: 'test'
      };

      mockSystemHealthService.createAlert.mockResolvedValue(mockAlert);

      mockRequest.body = {
        type: 'warning',
        category: 'system',
        message: 'Test alert',
        severity: 'medium',
        source: 'test'
      };

      await controller.createAlert(mockRequest as Request, mockResponse as Response);

      expect(mockSystemHealthService.createAlert).toHaveBeenCalledWith({
        type: 'warning',
        category: 'system',
        message: 'Test alert',
        timestamp: expect.any(Date),
        severity: 'medium',
        source: 'test'
      });
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Alert created successfully',
        data: mockAlert
      });
    });

    it('should return 400 when required fields are missing', async () => {
      mockRequest.body = {
        type: 'warning',
        // Missing required fields
      };

      await controller.createAlert(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Missing required fields: type, category, message, severity, source'
      });
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Service error');
      mockSystemHealthService.createAlert.mockRejectedValue(error);

      mockRequest.body = {
        type: 'warning',
        category: 'system',
        message: 'Test alert',
        severity: 'medium',
        source: 'test'
      };

      await controller.createAlert(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to create alert',
        error: 'Service error'
      });
    });
  });

  describe('acknowledgeAlert', () => {
    it('should acknowledge alert successfully', async () => {
      const mockAlert = {
        id: 'alert1',
        type: 'warning',
        category: 'system',
        message: 'Test alert',
        timestamp: new Date(),
        acknowledged: true,
        acknowledgedBy: 'admin',
        acknowledgedAt: new Date(),
        severity: 'medium',
        source: 'test'
      };

      mockSystemHealthService.acknowledgeAlert.mockResolvedValue(mockAlert);

      mockRequest.params = { alertId: 'alert1' };
      mockRequest.body = { acknowledgedBy: 'admin' };

      await controller.acknowledgeAlert(mockRequest as Request, mockResponse as Response);

      expect(mockSystemHealthService.acknowledgeAlert).toHaveBeenCalledWith('alert1', 'admin');
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Alert acknowledged successfully',
        data: mockAlert
      });
    });

    it('should return 400 when acknowledgedBy is missing', async () => {
      mockRequest.params = { alertId: 'alert1' };
      mockRequest.body = {};

      await controller.acknowledgeAlert(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'acknowledgedBy field is required'
      });
    });

    it('should return 404 when alert not found', async () => {
      mockSystemHealthService.acknowledgeAlert.mockResolvedValue(null);

      mockRequest.params = { alertId: 'non-existent' };
      mockRequest.body = { acknowledgedBy: 'admin' };

      await controller.acknowledgeAlert(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Alert not found'
      });
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Service error');
      mockSystemHealthService.acknowledgeAlert.mockRejectedValue(error);

      mockRequest.params = { alertId: 'alert1' };
      mockRequest.body = { acknowledgedBy: 'admin' };

      await controller.acknowledgeAlert(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to acknowledge alert',
        error: 'Service error'
      });
    });
  });

  describe('getHealthSummary', () => {
    it('should return health summary successfully', async () => {
      const mockHealth = { systemStatus: 'healthy', performanceScore: 95 };
      const mockAlerts = [
        { severity: 'critical' },
        { severity: 'high' },
        { severity: 'medium' }
      ];
      const mockResults = [
        { status: 'pass' },
        { status: 'warn' },
        { status: 'fail' }
      ];

      mockSystemHealthService.getCurrentHealth.mockResolvedValue(mockHealth);
      mockSystemHealthService.getActiveAlerts.mockResolvedValue(mockAlerts);
      mockSystemHealthService.getHealthCheckResults.mockResolvedValue(mockResults);
      mockSystemHealthService.isMonitoringActive.mockReturnValue(true);

      await controller.getHealthSummary(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Health summary retrieved successfully',
        data: {
          currentHealth: mockHealth,
          activeAlerts: {
            count: 3,
            critical: 1,
            high: 1,
            medium: 1,
            low: 0
          },
          healthChecks: {
            total: 3,
            passed: 1,
            warnings: 1,
            failed: 1
          },
          monitoringStatus: true
        }
      });
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Service error');
      mockSystemHealthService.getCurrentHealth.mockRejectedValue(error);

      await controller.getHealthSummary(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to retrieve health summary',
        error: 'Service error'
      });
    });
  });

  describe('cleanup', () => {
    it('should perform cleanup successfully', async () => {
      mockSystemHealthService.cleanup.mockResolvedValue(undefined);

      await controller.cleanup(mockRequest as Request, mockResponse as Response);

      expect(mockSystemHealthService.cleanup).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Cleanup completed successfully',
        data: {
          timestamp: expect.any(Date),
          status: 'completed'
        }
      });
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Service error');
      mockSystemHealthService.cleanup.mockRejectedValue(error);

      await controller.cleanup(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to perform cleanup',
        error: 'Service error'
      });
    });
  });
});
