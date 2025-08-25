import request from 'supertest';
import express from 'express';
import dataSyncRoutes from '../routes/dataSync';
import { DataSyncService } from '../services/dataSyncService';

// Mock the DataSyncService
jest.mock('../services/dataSyncService');
jest.mock('../middleware/auth', () => ({
  authenticateToken: (_req: any, _res: any, next: any) => next()
}));
jest.mock('../middleware/validation', () => ({
  validateRequest: () => (_req: any, _res: any, next: any) => next()
}));
jest.mock('../middleware/rateLimit', () => ({
  rateLimit: () => (_req: any, _res: any, next: any) => next()
}));

const MockedDataSyncService = DataSyncService as jest.MockedClass<typeof DataSyncService>;

describe('DataSync Routes', () => {
  let app: express.Application;
  let mockDataSyncService: jest.Mocked<DataSyncService>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock service
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

    // Mock global.dataSyncService
    (global as any).dataSyncService = mockDataSyncService;

    // Create Express app
    app = express();
    app.use(express.json());
    app.use('/api/sync', dataSyncRoutes);
  });

  describe('GET /api/sync/jobs', () => {
    it('should return sync jobs successfully', async () => {
      const mockJobs = [
        {
          id: 'job1',
          businessEntityId: 'be1',
          jobType: 'ga4_daily' as const,
          status: 'completed' as const,
          startTime: new Date(),
          retryCount: 0,
          maxRetries: 3,
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockDataSyncService.getSyncJobs.mockResolvedValue(mockJobs);

      const response = await request(app)
        .get('/api/sync/jobs')
        .query({ businessEntityId: 'be1', status: 'completed' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockJobs);
      expect(response.body.count).toBe(1);
      expect(mockDataSyncService.getSyncJobs).toHaveBeenCalledWith({
        businessEntityId: 'be1',
        status: 'completed',
        startDate: undefined,
        endDate: undefined,
        limit: undefined,
        offset: undefined
      });
    });

    it('should handle service errors', async () => {
      mockDataSyncService.getSyncJobs.mockRejectedValue(new Error('Service error'));

      const response = await request(app)
        .get('/api/sync/jobs')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to retrieve sync jobs');
    });
  });

  describe('GET /api/sync/jobs/:id', () => {
    it('should return sync job by ID when found', async () => {
      const mockJob = {
        id: 'job1',
        businessEntityId: 'be1',
        jobType: 'ga4_daily' as const,
        status: 'completed' as const,
        startTime: new Date(),
        retryCount: 0,
        maxRetries: 3,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockDataSyncService.getSyncJobById.mockResolvedValue(mockJob);

      const response = await request(app)
        .get('/api/sync/jobs/job1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockJob);
      expect(mockDataSyncService.getSyncJobById).toHaveBeenCalledWith('job1');
    });

    it('should return 404 when job not found', async () => {
      mockDataSyncService.getSyncJobById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/sync/jobs/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Sync job not found');
    });
  });

  describe('GET /api/sync/stats/:businessEntityId', () => {
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

      mockDataSyncService.getSyncJobStats.mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/sync/stats/be1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockStats);
      expect(mockDataSyncService.getSyncJobStats).toHaveBeenCalledWith('be1');
    });
  });

  describe('POST /api/sync/config', () => {
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockDataSyncService.createSyncConfig.mockResolvedValue({
        success: true,
        data: mockConfig
      });

      const response = await request(app)
        .post('/api/sync/config')
        .send({
          businessEntityId: 'be1',
          ga4SyncEnabled: true
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockConfig);
      expect(mockDataSyncService.createSyncConfig).toHaveBeenCalledWith({
        businessEntityId: 'be1',
        ga4SyncEnabled: true
      });
    });

    it('should handle creation failure', async () => {
      mockDataSyncService.createSyncConfig.mockResolvedValue({
        success: false,
        error: 'Validation error'
      });

      const response = await request(app)
        .post('/api/sync/config')
        .send({
          businessEntityId: 'be1'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });
  });

  describe('GET /api/sync/config/:businessEntityId', () => {
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockDataSyncService.getSyncConfig.mockResolvedValue(mockConfig);

      const response = await request(app)
        .get('/api/sync/config/be1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockConfig);
      expect(mockDataSyncService.getSyncConfig).toHaveBeenCalledWith('be1');
    });

    it('should return 404 when config not found', async () => {
      mockDataSyncService.getSyncConfig.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/sync/config/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Sync configuration not found');
    });
  });

  describe('PUT /api/sync/config/:businessEntityId', () => {
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockDataSyncService.updateSyncConfig.mockResolvedValue({
        success: true,
        data: mockConfig
      });

      const response = await request(app)
        .put('/api/sync/config/be1')
        .send({
          ga4SyncEnabled: false,
          ga4SyncSchedule: '0 3 * * *'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockConfig);
      expect(mockDataSyncService.updateSyncConfig).toHaveBeenCalledWith('be1', {
        ga4SyncEnabled: false,
        ga4SyncSchedule: '0 3 * * *'
      });
    });
  });

  describe('POST /api/sync/manual', () => {
    it('should trigger manual sync successfully', async () => {
      mockDataSyncService.triggerManualSync.mockResolvedValue({
        success: true,
        jobId: 'job1',
        message: 'Manual sync completed successfully'
      });

      const response = await request(app)
        .post('/api/sync/manual')
        .send({
          businessEntityId: 'be1',
          jobType: 'ga4_daily'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.jobId).toBe('job1');
      expect(response.body.message).toBe('Manual sync completed successfully');
      expect(mockDataSyncService.triggerManualSync).toHaveBeenCalledWith({
        businessEntityId: 'be1',
        jobType: 'ga4_daily'
      });
    });

    it('should handle manual sync failure', async () => {
      mockDataSyncService.triggerManualSync.mockResolvedValue({
        success: false,
        error: 'Integration not found'
      });

      const response = await request(app)
        .post('/api/sync/manual')
        .send({
          businessEntityId: 'be1',
          jobType: 'ga4_daily'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Integration not found');
    });
  });

  describe('GET /api/sync/health/:businessEntityId', () => {
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

      mockDataSyncService.getSyncHealth.mockResolvedValue(mockHealth);

      const response = await request(app)
        .get('/api/sync/health/be1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockHealth);
      expect(mockDataSyncService.getSyncHealth).toHaveBeenCalledWith('be1');
    });
  });

  describe('POST /api/sync/initialize', () => {
    it('should initialize sync service successfully', async () => {
      mockDataSyncService.initialize.mockResolvedValue();

      const response = await request(app)
        .post('/api/sync/initialize')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Data synchronization service initialized successfully');
      expect(mockDataSyncService.initialize).toHaveBeenCalled();
    });

    it('should handle initialization errors', async () => {
      mockDataSyncService.initialize.mockRejectedValue(new Error('Initialization failed'));

      const response = await request(app)
        .post('/api/sync/initialize')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to initialize synchronization service');
    });
  });

  describe('POST /api/sync/shutdown', () => {
    it('should shutdown sync service successfully', async () => {
      mockDataSyncService.shutdown.mockResolvedValue();

      const response = await request(app)
        .post('/api/sync/shutdown')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Data synchronization service shut down successfully');
      expect(mockDataSyncService.shutdown).toHaveBeenCalled();
    });
  });
});
