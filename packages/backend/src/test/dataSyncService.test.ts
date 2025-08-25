import { DataSyncService } from '../services/dataSyncService';
import { PrismaClient } from '@prisma/client';
import { GoogleAnalyticsService } from '../services/googleAnalyticsService';
import { N8nService } from '../services/n8nService';
import { MetricsService } from '../services/metricsService';
import { DataTransformationService } from '../services/dataTransformationService';
// Mock logger to avoid console output during tests

// Mock dependencies
jest.mock('@prisma/client');
jest.mock('../services/googleAnalyticsService');
jest.mock('../services/n8nService');
jest.mock('../services/metricsService');
jest.mock('../services/dataTransformationService');
jest.mock('../utils/logger');

const MockedPrismaClient = PrismaClient as jest.MockedClass<typeof PrismaClient>;
const MockedGoogleAnalyticsService = GoogleAnalyticsService as jest.MockedClass<typeof GoogleAnalyticsService>;
const MockedN8nService = N8nService as jest.MockedClass<typeof N8nService>;
const MockedMetricsService = MetricsService as jest.MockedClass<typeof MetricsService>;
const MockedDataTransformationService = DataTransformationService as jest.MockedClass<typeof DataTransformationService>;

describe('DataSyncService', () => {
  let dataSyncService: DataSyncService;
  let mockPrisma: jest.Mocked<PrismaClient>;
  let mockGoogleAnalyticsService: jest.Mocked<GoogleAnalyticsService>;
  let mockN8nService: jest.Mocked<N8nService>;
  let mockMetricsService: jest.Mocked<MetricsService>;
  let mockDataTransformationService: jest.Mocked<DataTransformationService>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock instances
    mockPrisma = new MockedPrismaClient() as jest.Mocked<PrismaClient>;
    mockGoogleAnalyticsService = new MockedGoogleAnalyticsService() as jest.Mocked<GoogleAnalyticsService>;
    mockN8nService = new MockedN8nService() as jest.Mocked<N8nService>;
    mockMetricsService = new MockedMetricsService(mockPrisma) as jest.Mocked<MetricsService>;
    mockDataTransformationService = new MockedDataTransformationService() as jest.Mocked<DataTransformationService>;

    // Create service instance
    dataSyncService = new DataSyncService(
      mockPrisma,
      mockGoogleAnalyticsService,
      mockN8nService,
      mockMetricsService,
      mockDataTransformationService
    );
  });

  describe('initialize', () => {
    it('should initialize successfully with existing configs', async () => {
      const mockConfigs = [
        {
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
        }
      ];

      mockPrisma.syncConfig.findMany.mockResolvedValue(mockConfigs);

      await dataSyncService.initialize();

      expect(mockPrisma.syncConfig.findMany).toHaveBeenCalled();
    });

    it('should handle initialization errors gracefully', async () => {
      mockPrisma.syncConfig.findMany.mockRejectedValue(new Error('Database error'));

      await expect(dataSyncService.initialize()).rejects.toThrow('Database error');
    });
  });

  describe('createSyncJob', () => {
    it('should create a sync job successfully', async () => {
      const mockJob = {
        id: 'job1',
        businessEntityId: 'be1',
        jobType: 'ga4_daily' as const,
        status: 'pending',
        startTime: new Date(),
        retryCount: 0,
        maxRetries: 3,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.syncJob.create.mockResolvedValue(mockJob);

      const result = await dataSyncService.createSyncJob({
        businessEntityId: 'be1',
        jobType: 'ga4_daily'
      });

      expect(result).toBe('job1');
      expect(mockPrisma.syncJob.create).toHaveBeenCalledWith({
        data: {
          businessEntityId: 'be1',
          jobType: 'ga4_daily',
          status: 'pending',
          startTime: expect.any(Date),
          retryCount: 0,
          maxRetries: 3,
          metadata: {}
        }
      });
    });
  });

  describe('getSyncJobById', () => {
    it('should return sync job when found', async () => {
      const mockJob = {
        id: 'job1',
        businessEntityId: 'be1',
        jobType: 'ga4_daily' as const,
        status: 'completed',
        startTime: new Date(),
        endTime: new Date(),
        duration: 5000,
        retryCount: 0,
        maxRetries: 3,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.syncJob.findUnique.mockResolvedValue(mockJob);

      const result = await dataSyncService.getSyncJobById('job1');

      expect(result).toEqual(mockJob);
      expect(mockPrisma.syncJob.findUnique).toHaveBeenCalledWith({
        where: { id: 'job1' }
      });
    });

    it('should return null when job not found', async () => {
      mockPrisma.syncJob.findUnique.mockResolvedValue(null);

      const result = await dataSyncService.getSyncJobById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('updateSyncJob', () => {
    it('should update sync job successfully', async () => {
      const updates = {
        status: 'completed' as const,
        endTime: new Date(),
        duration: 5000
      };

      mockPrisma.syncJob.update.mockResolvedValue({} as any);

      await dataSyncService.updateSyncJob('job1', updates);

      expect(mockPrisma.syncJob.update).toHaveBeenCalledWith({
        where: { id: 'job1' },
        data: {
          ...updates,
          updatedAt: expect.any(Date)
        }
      });
    });
  });

  describe('getSyncJobs', () => {
    it('should return filtered sync jobs', async () => {
      const mockJobs = [
        {
          id: 'job1',
          businessEntityId: 'be1',
          jobType: 'ga4_daily' as const,
          status: 'completed',
          startTime: new Date(),
          retryCount: 0,
          maxRetries: 3,
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockPrisma.syncJob.findMany.mockResolvedValue(mockJobs);

      const query = {
        businessEntityId: 'be1',
        status: 'completed' as const,
        limit: 10
      };

      const result = await dataSyncService.getSyncJobs(query);

      expect(result).toEqual(mockJobs);
      expect(mockPrisma.syncJob.findMany).toHaveBeenCalledWith({
        where: {
          businessEntityId: 'be1',
          status: 'completed'
        },
        orderBy: { startTime: 'desc' },
        take: 10,
        skip: 0
      });
    });

    it('should handle date range queries', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      mockPrisma.syncJob.findMany.mockResolvedValue([]);

      await dataSyncService.getSyncJobs({ startDate, endDate });

      expect(mockPrisma.syncJob.findMany).toHaveBeenCalledWith({
        where: {
          startTime: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { startTime: 'desc' },
        take: 100,
        skip: 0
      });
    });
  });

  describe('getSyncJobStats', () => {
    it('should return correct statistics', async () => {
      mockPrisma.syncJob.count
        .mockResolvedValueOnce(10) // totalJobs
        .mockResolvedValueOnce(8)  // completedJobs
        .mockResolvedValueOnce(1)  // failedJobs
        .mockResolvedValueOnce(1)  // runningJobs
        .mockResolvedValueOnce(0); // pendingJobs

      mockPrisma.syncJob.findMany.mockResolvedValue([
        { duration: 5000 },
        { duration: 3000 }
      ]);

      mockPrisma.syncJob.findFirst.mockResolvedValue({
        endTime: new Date('2024-01-01')
      } as any);

      const result = await dataSyncService.getSyncJobStats('be1');

      expect(result).toEqual({
        totalJobs: 10,
        completedJobs: 8,
        failedJobs: 1,
        runningJobs: 1,
        pendingJobs: 0,
        averageDuration: 4000,
        successRate: 80,
        lastSyncAt: expect.any(Date)
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

      mockPrisma.syncConfig.create.mockResolvedValue(mockConfig);

      const input = {
        businessEntityId: 'be1',
        ga4SyncEnabled: true
      };

      const result = await dataSyncService.createSyncConfig(input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockConfig);
      expect(mockPrisma.syncConfig.create).toHaveBeenCalled();
    });

    it('should handle creation errors', async () => {
      mockPrisma.syncConfig.create.mockRejectedValue(new Error('Database error'));

      const input = {
        businessEntityId: 'be1'
      };

      const result = await dataSyncService.createSyncConfig(input);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('triggerManualSync', () => {
    it('should trigger GA4 daily sync successfully', async () => {
      const mockJobId = 'job1';
      const mockGA4Integration = {
        id: 'ga4_1',
        propertyId: 'property1',
        businessEntityId: 'be1'
      };

      mockPrisma.syncJob.create.mockResolvedValue({ id: mockJobId } as any);
      mockPrisma.googleAnalyticsIntegration.findFirst.mockResolvedValue(mockGA4Integration as any);
      mockGoogleAnalyticsService.getBasicMetrics.mockResolvedValue([]);
      mockDataTransformationService.transformGoogleAnalyticsData.mockResolvedValue([]);
      mockPrisma.googleAnalyticsIntegration.update.mockResolvedValue({} as any);

      const request = {
        businessEntityId: 'be1',
        jobType: 'ga4_daily' as const
      };

      const result = await dataSyncService.triggerManualSync(request);

      expect(result.success).toBe(true);
      expect(result.jobId).toBe(mockJobId);
      expect(mockGoogleAnalyticsService.getBasicMetrics).toHaveBeenCalled();
    });

    it('should trigger n8n sync successfully', async () => {
      const mockJobId = 'job1';
      const mockN8nIntegration = {
        id: 'n8n_1',
        businessEntityId: 'be1'
      };

      mockPrisma.syncJob.create.mockResolvedValue({ id: mockJobId } as any);
      mockPrisma.n8nIntegration.findFirst.mockResolvedValue(mockN8nIntegration as any);
      mockPrisma.n8nWebhookEvent.findMany.mockResolvedValue([]);
      // Mock the private method by making it public for testing
      (mockN8nService as any).updateIntegrationStats = jest.fn().mockResolvedValue();

      const request = {
        businessEntityId: 'be1',
        jobType: 'n8n_realtime' as const
      };

      const result = await dataSyncService.triggerManualSync(request);

      expect(result.success).toBe(true);
      expect(result.jobId).toBe(mockJobId);
      expect((mockN8nService as any).updateIntegrationStats).toHaveBeenCalled();
    });

    it('should handle unsupported job types', async () => {
      const request = {
        businessEntityId: 'be1',
        jobType: 'unsupported' as any
      };

      const result = await dataSyncService.triggerManualSync(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported job type');
    });
  });

  describe('getSyncHealth', () => {
    it('should return healthy status when all checks pass', async () => {
      const mockStats = {
        totalJobs: 10,
        completedJobs: 10,
        failedJobs: 0,
        runningJobs: 0,
        pendingJobs: 0,
        averageDuration: 5000,
        successRate: 100,
        lastSyncAt: new Date()
      };

      const mockConfig = {
        ga4SyncEnabled: true,
        n8nSyncEnabled: true,
        cleanupSyncEnabled: false
      };

      jest.spyOn(dataSyncService, 'getSyncJobStats').mockResolvedValue(mockStats);
      jest.spyOn(dataSyncService, 'getSyncConfig').mockResolvedValue(mockConfig as any);

      const result = await dataSyncService.getSyncHealth('be1');

      expect(result.status).toBe('healthy');
      expect(result.issues).toHaveLength(0);
    });

    it('should return degraded status when there are issues', async () => {
      const mockStats = {
        totalJobs: 10,
        completedJobs: 8,
        failedJobs: 2,
        runningJobs: 0,
        pendingJobs: 0,
        averageDuration: 5000,
        successRate: 80,
        lastSyncAt: new Date()
      };

      const mockConfig = {
        ga4SyncEnabled: true,
        n8nSyncEnabled: true,
        cleanupSyncEnabled: false
      };

      jest.spyOn(dataSyncService, 'getSyncJobStats').mockResolvedValue(mockStats);
      jest.spyOn(dataSyncService, 'getSyncConfig').mockResolvedValue(mockConfig as any);

      const result = await dataSyncService.getSyncHealth('be1');

      expect(result.status).toBe('degraded');
      expect(result.issues).toContain('2 failed sync jobs');
    });
  });

  describe('shutdown', () => {
    it('should shutdown service gracefully', async () => {
      // Mock the cronJobs Map
      const mockCronJob = {
        stop: jest.fn()
      };

      // Use any to access private property for testing
      (dataSyncService as any).cronJobs = new Map([
        ['be1_ga4', mockCronJob],
        ['be1_n8n', mockCronJob]
      ]);
      (dataSyncService as any).isInitialized = true;

      await dataSyncService.shutdown();

      expect(mockCronJob.stop).toHaveBeenCalledTimes(2);
      expect((dataSyncService as any).isInitialized).toBe(false);
    });
  });
});
