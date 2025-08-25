import { Request, Response } from 'express';
import { DataSyncController } from '../controllers/dataSyncController';
import { DataSyncService } from '../services/dataSyncService';

// Mock the DataSyncService
jest.mock('../services/dataSyncService');
jest.mock('../utils/logger');

const MockedDataSyncService = DataSyncService as jest.MockedClass<typeof DataSyncService>;

describe('DataSyncController', () => {
  let dataSyncController: DataSyncController;
  let mockDataSyncService: jest.Mocked<DataSyncService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a mock service with required constructor parameters
    mockDataSyncService = {
      getSyncJobs: jest.fn(),
      getSyncJobById: jest.fn(),
      getSyncJobStats: jest.fn(),
      createSyncConfig: jest.fn(),
      getSyncConfig: jest.fn(),
      updateSyncConfig: jest.fn(),
      triggerManualSync: jest.fn(),
      getSyncHealth: jest.fn(),
      initialize: jest.fn(),
      shutdown: jest.fn()
    } as jest.Mocked<DataSyncService>;
    dataSyncController = new DataSyncController(mockDataSyncService);

    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    mockResponse = {
      json: mockJson,
      status: mockStatus
    };
  });

  describe('getSyncJobs', () => {
    it('should return sync jobs successfully', async () => {
      const mockJobs = [
        {
          id: 'job1',
          businessEntityId: 'be1',
          jobType: 'ga4_daily',
          status: 'completed',
          startTime: new Date(),
          retryCount: 0,
          maxRetries: 3,
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockRequest = {
        query: {
          businessEntityId: 'be1',
          status: 'completed'
        }
      };

      mockDataSyncService.getSyncJobs.mockResolvedValue(mockJobs);

      await dataSyncController.getSyncJobs(mockRequest as Request, mockResponse as Response);

      expect(mockDataSyncService.getSyncJobs).toHaveBeenCalledWith({
        businessEntityId: 'be1',
        status: 'completed',
        startDate: undefined,
        endDate: undefined,
        limit: undefined,
        offset: undefined
      });

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockJobs,
        count: 1
      });
    });

    it('should handle date range queries', async () => {
      mockRequest = {
        query: {
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        }
      };

      mockDataSyncService.getSyncJobs.mockResolvedValue([]);

      await dataSyncController.getSyncJobs(mockRequest as Request, mockResponse as Response);

      expect(mockDataSyncService.getSyncJobs).toHaveBeenCalledWith({
        businessEntityId: undefined,
        jobType: undefined,
        status: undefined,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        limit: undefined,
        offset: undefined
      });
    });

    it('should handle service errors', async () => {
      mockRequest = { query: {} };
      mockDataSyncService.getSyncJobs.mockRejectedValue(new Error('Service error'));

      await dataSyncController.getSyncJobs(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to retrieve sync jobs'
      });
    });
  });

  describe('getSyncJobById', () => {
    it('should return sync job when found', async () => {
      const mockJob = {
        id: 'job1',
        businessEntityId: 'be1',
        jobType: 'ga4_daily',
        status: 'completed',
        startTime: new Date(),
        retryCount: 0,
        maxRetries: 3,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRequest = {
        params: { id: 'job1' }
      };

      mockDataSyncService.getSyncJobById.mockResolvedValue(mockJob);

      await dataSyncController.getSyncJobById(mockRequest as Request, mockResponse as Response);

      expect(mockDataSyncService.getSyncJobById).toHaveBeenCalledWith('job1');
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockJob
      });
    });

    it('should return 404 when job not found', async () => {
      mockRequest = {
        params: { id: 'nonexistent' }
      };

      mockDataSyncService.getSyncJobById.mockResolvedValue(null);

      await dataSyncController.getSyncJobById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Sync job not found'
      });
    });
  });

  describe('getSyncJobStats', () => {
    it('should return sync job statistics', async () => {
      const mockStats = {
        totalJobs: 10,
        completedJobs: 8,
        failedJobs: 1,
        runningJobs: 1,
        pendingJobs: 0,
        averageDuration: 5000,
        successRate: 80,
        lastSyncAt: new Date()
      };

      mockRequest = {
        params: { businessEntityId: 'be1' }
      };

      mockDataSyncService.getSyncJobStats.mockResolvedValue(mockStats);

      await dataSyncController.getSyncJobStats(mockRequest as Request, mockResponse as Response);

      expect(mockDataSyncService.getSyncJobStats).toHaveBeenCalledWith('be1');
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockStats
      });
    });
  });

  describe('createSyncConfig', () => {
    it('should create sync config successfully', async () => {
      const mockConfig = {
        id: 'config1',
        businessEntityId: 'be1',
        ga4SyncEnabled: true,
        ga4SyncSchedule: '0 2 * * *',
        n8nSyncEnabled: true,
        n8nSyncSchedule: '*/5 * * * *',
        cleanupSyncEnabled: true,
        cleanupSyncSchedule: '0 3 * * 0',
        retryConfig: { maxRetries: 3, initialDelay: 60000, maxDelay: 3600000, backoffMultiplier: 2 },
        alerting: { enabled: false, emailRecipients: [] },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRequest = {
        body: {
          businessEntityId: 'be1',
          ga4SyncEnabled: true
        }
      };

      mockDataSyncService.createSyncConfig.mockResolvedValue({
        success: true,
        data: mockConfig
      });

      await dataSyncController.createSyncConfig(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockConfig
      });
    });

    it('should handle creation failure', async () => {
      mockRequest = {
        body: {
          businessEntityId: 'be1'
        }
      };

      mockDataSyncService.createSyncConfig.mockResolvedValue({
        success: false,
        error: 'Validation error'
      });

      await dataSyncController.createSyncConfig(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Validation error'
      });
    });
  });

  describe('getSyncConfig', () => {
    it('should return sync config when found', async () => {
      const mockConfig = {
        id: 'config1',
        businessEntityId: 'be1',
        ga4SyncEnabled: true,
        ga4SyncSchedule: '0 2 * * *',
        n8nSyncEnabled: true,
        n8nSyncSchedule: '*/5 * * * *',
        cleanupSyncEnabled: true,
        cleanupSyncSchedule: '0 3 * * 0',
        retryConfig: { maxRetries: 3, initialDelay: 60000, maxDelay: 3600000, backoffMultiplier: 2 },
        alerting: { enabled: false, emailRecipients: [] },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRequest = {
        params: { businessEntityId: 'be1' }
      };

      mockDataSyncService.getSyncConfig.mockResolvedValue(mockConfig);

      await dataSyncController.getSyncConfig(mockRequest as Request, mockResponse as Response);

      expect(mockDataSyncService.getSyncConfig).toHaveBeenCalledWith('be1');
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockConfig
      });
    });

    it('should return 404 when config not found', async () => {
      mockRequest = {
        params: { businessEntityId: 'nonexistent' }
      };

      mockDataSyncService.getSyncConfig.mockResolvedValue(null);

      await dataSyncController.getSyncConfig(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Sync configuration not found'
      });
    });
  });

  describe('updateSyncConfig', () => {
    it('should update sync config successfully', async () => {
      const mockConfig = {
        id: 'config1',
        businessEntityId: 'be1',
        ga4SyncEnabled: false,
        ga4SyncSchedule: '0 3 * * *',
        n8nSyncEnabled: true,
        n8nSyncSchedule: '*/5 * * * *',
        cleanupSyncEnabled: true,
        cleanupSyncSchedule: '0 3 * * 0',
        retryConfig: { maxRetries: 3, initialDelay: 60000, maxDelay: 3600000, backoffMultiplier: 2 },
        alerting: { enabled: false, emailRecipients: [] },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRequest = {
        params: { businessEntityId: 'be1' },
        body: {
          ga4SyncEnabled: false,
          ga4SyncSchedule: '0 3 * * *'
        }
      };

      mockDataSyncService.updateSyncConfig.mockResolvedValue({
        success: true,
        data: mockConfig
      });

      await dataSyncController.updateSyncConfig(mockRequest as Request, mockResponse as Response);

      expect(mockDataSyncService.updateSyncConfig).toHaveBeenCalledWith('be1', {
        ga4SyncEnabled: false,
        ga4SyncSchedule: '0 3 * * *'
      });

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockConfig
      });
    });
  });

  describe('triggerManualSync', () => {
    it('should trigger manual sync successfully', async () => {
      mockRequest = {
        body: {
          businessEntityId: 'be1',
          jobType: 'ga4_daily'
        }
      };

      mockDataSyncService.triggerManualSync.mockResolvedValue({
        success: true,
        jobId: 'job1',
        message: 'Manual sync completed successfully'
      });

      await dataSyncController.triggerManualSync(mockRequest as Request, mockResponse as Response);

      expect(mockDataSyncService.triggerManualSync).toHaveBeenCalledWith({
        businessEntityId: 'be1',
        jobType: 'ga4_daily'
      });

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        jobId: 'job1',
        message: 'Manual sync completed successfully'
      });
    });

    it('should handle manual sync failure', async () => {
      mockRequest = {
        body: {
          businessEntityId: 'be1',
          jobType: 'ga4_daily'
        }
      };

      mockDataSyncService.triggerManualSync.mockResolvedValue({
        success: false,
        error: 'Integration not found'
      });

      await dataSyncController.triggerManualSync(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Integration not found'
      });
    });
  });

  describe('getSyncHealth', () => {
    it('should return sync health status', async () => {
      const mockHealth = {
        status: 'healthy' as const,
        lastSyncAt: new Date(),
        activeJobs: 0,
        failedJobs: 0,
        averageSyncTime: 5000,
        successRate: 100,
        issues: []
      };

      mockRequest = {
        params: { businessEntityId: 'be1' }
      };

      mockDataSyncService.getSyncHealth.mockResolvedValue(mockHealth);

      await dataSyncController.getSyncHealth(mockRequest as Request, mockResponse as Response);

      expect(mockDataSyncService.getSyncHealth).toHaveBeenCalledWith('be1');
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockHealth
      });
    });
  });

  describe('initializeSyncService', () => {
    it('should initialize sync service successfully', async () => {
      mockRequest = {};
      mockDataSyncService.initialize.mockResolvedValue();

      await dataSyncController.initializeSyncService(mockRequest as Request, mockResponse as Response);

      expect(mockDataSyncService.initialize).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Data synchronization service initialized successfully'
      });
    });

    it('should handle initialization errors', async () => {
      mockRequest = {};
      mockDataSyncService.initialize.mockRejectedValue(new Error('Initialization failed'));

      await dataSyncController.initializeSyncService(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to initialize synchronization service'
      });
    });
  });

  describe('shutdownSyncService', () => {
    it('should shutdown sync service successfully', async () => {
      mockRequest = {};
      mockDataSyncService.shutdown.mockResolvedValue();

      await dataSyncController.shutdownSyncService(mockRequest as Request, mockResponse as Response);

      expect(mockDataSyncService.shutdown).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Data synchronization service shut down successfully'
      });
    });
  });
});
