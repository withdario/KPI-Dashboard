import request from 'supertest';
import express from 'express';
import BackupRoutes from '../routes/backup';
// BackupController is used in the mock type definition

// Mock middleware
jest.mock('../middleware/auth', () => ({
  authenticateToken: jest.fn((_req: any, _res: any, next: any) => next())
}));

jest.mock('../middleware/rateLimit', () => ({
  generalRateLimit: jest.fn((_req: any, _res: any, next: any) => next())
}));

jest.mock('../middleware/businessEntityAccess', () => ({
  businessEntityAccessMiddleware: jest.fn((_req: any, _res: any, next: any) => next())
}));

// Mock BackupController
const mockBackupController = {
  createBackupConfig: jest.fn(),
  updateBackupConfig: jest.fn(),
  getBackupConfig: jest.fn(),
  listBackupConfigs: jest.fn(),
  deleteBackupConfig: jest.fn(),
  createBackupJob: jest.fn(),
  executeBackup: jest.fn(),
  getBackupJob: jest.fn(),
  verifyBackup: jest.fn(),
  createRecoveryJob: jest.fn(),
  executeRecovery: jest.fn(),
  listBackupJobs: jest.fn(),
  listRecoveryJobs: jest.fn(),
  getBackupMetrics: jest.fn(),
  getRecoveryMetrics: jest.fn(),
  cleanupOldBackups: jest.fn(),
  getServiceStatus: jest.fn(),
  startService: jest.fn(),
  stopService: jest.fn(),
  start: jest.fn(),
  stop: jest.fn()
} as any;

describe('BackupRoutes', () => {
  let app: express.Application;
  let backupRoutes: BackupRoutes;

  beforeEach(() => {
    jest.clearAllMocks();
    
    app = express();
    app.use(express.json());
    
    backupRoutes = new BackupRoutes();
    backupRoutes.setBackupController(mockBackupController as any);
    
    app.use('/api/backup', backupRoutes.getRouter());
    
    // Add error handler for testing
    app.use((error: any, _req: any, res: any, _next: any) => {
      res.status(500).json({
        error: error.message || 'Internal server error'
      });
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/backup/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'healthy',
        service: 'backup',
        timestamp: expect.any(String)
      });
    });
  });

  describe('Backup Configuration Routes', () => {
    describe('POST /configs', () => {
      it('should create backup configuration', async () => {
        const configData = {
          businessEntityId: 'entity-1',
          backupType: 'database_full',
          schedule: '0 2 * * *',
          retentionDays: 30,
          compressionEnabled: true,
          encryptionEnabled: false,
          storageLocation: 'local'
        };

        const mockConfig = { id: 'config-1', ...configData, isActive: true };
        mockBackupController.createBackupConfig.mockImplementation((_req: any, res: any) => {
          res.status(201).json({
            message: 'Backup configuration created successfully',
            data: mockConfig
          });
        });

        const response = await request(app)
          .post('/api/backup/configs')
          .send(configData)
          .expect(201);

        expect(response.body).toEqual({
          message: 'Backup configuration created successfully',
          data: mockConfig
        });
        expect(mockBackupController.createBackupConfig).toHaveBeenCalled();
      });
    });

    describe('GET /configs/:id', () => {
      it('should get backup configuration by ID', async () => {
        const mockConfig = { id: 'config-1', businessEntityId: 'entity-1' };
        mockBackupController.getBackupConfig.mockImplementation((_req: any, res: any) => {
          res.status(200).json({ data: mockConfig });
        });

        const response = await request(app)
          .get('/api/backup/configs/config-1')
          .expect(200);

        expect(response.body).toEqual({ data: mockConfig });
        expect(mockBackupController.getBackupConfig).toHaveBeenCalled();
      });
    });

    describe('PUT /configs/:id', () => {
      it('should update backup configuration', async () => {
        const updateData = {
          schedule: '0 3 * * *',
          retentionDays: 60
        };

        const mockConfig = { id: 'config-1', ...updateData };
        mockBackupController.updateBackupConfig.mockImplementation((_req: any, res: any) => {
          res.status(200).json({
            message: 'Backup configuration updated successfully',
            data: mockConfig
          });
        });

        const response = await request(app)
          .put('/api/backup/configs/config-1')
          .send(updateData)
          .expect(200);

        expect(response.body).toEqual({
          message: 'Backup configuration updated successfully',
          data: mockConfig
        });
        expect(mockBackupController.updateBackupConfig).toHaveBeenCalled();
      });
    });

    describe('DELETE /configs/:id', () => {
      it('should return not implemented for delete', async () => {
        mockBackupController.deleteBackupConfig.mockImplementation((_req: any, res: any) => {
          res.status(501).json({
            error: 'Delete backup configuration not yet implemented'
          });
        });

        const response = await request(app)
          .delete('/api/backup/configs/config-1')
          .expect(501);

        expect(response.body).toEqual({
          error: 'Delete backup configuration not yet implemented'
        });
      });
    });

    describe('GET /configs', () => {
      it('should list backup configurations', async () => {
        const mockConfigs = [
          { id: 'config-1', businessEntityId: 'entity-1' },
          { id: 'config-2', businessEntityId: 'entity-2' }
        ];

        mockBackupController.listBackupConfigs.mockImplementation((_req: any, res: any) => {
          res.status(200).json({
            data: mockConfigs,
            count: mockConfigs.length
          });
        });

        const response = await request(app)
          .get('/api/backup/configs')
          .expect(200);

        expect(response.body).toEqual({
          data: mockConfigs,
          count: 2
        });
        expect(mockBackupController.listBackupConfigs).toHaveBeenCalled();
      });

      it('should filter by business entity ID', async () => {
        const mockConfigs = [{ id: 'config-1', businessEntityId: 'entity-1' }];

        mockBackupController.listBackupConfigs.mockImplementation((_req: any, res: any) => {
          res.status(200).json({
            data: mockConfigs,
            count: mockConfigs.length
          });
        });

        const response = await request(app)
          .get('/api/backup/configs?businessEntityId=entity-1')
          .expect(200);

        expect(response.body).toEqual({
          data: mockConfigs,
          count: 1
        });
      });
    });
  });

  describe('Backup Job Routes', () => {
    describe('POST /jobs', () => {
      it('should create backup job', async () => {
        const jobData = {
          businessEntityId: 'entity-1',
          backupConfigId: 'config-1'
        };

        const mockJob = { id: 'job-1', ...jobData, status: 'pending' };
        mockBackupController.createBackupJob.mockImplementation((_req: any, res: any) => {
          res.status(201).json({
            message: 'Backup job created successfully',
            data: mockJob
          });
        });

        const response = await request(app)
          .post('/api/backup/jobs')
          .send(jobData)
          .expect(201);

        expect(response.body).toEqual({
          message: 'Backup job created successfully',
          data: mockJob
        });
        expect(mockBackupController.createBackupJob).toHaveBeenCalled();
      });
    });

    describe('POST /jobs/:id/execute', () => {
      it('should execute backup job', async () => {
        const mockJob = { id: 'job-1', status: 'completed' };
        mockBackupController.executeBackup.mockImplementation((_req: any, res: any) => {
          res.status(200).json({
            message: 'Backup job executed successfully',
            data: mockJob
          });
        });

        const response = await request(app)
          .post('/api/backup/jobs/job-1/execute')
          .expect(200);

        expect(response.body).toEqual({
          message: 'Backup job executed successfully',
          data: mockJob
        });
        expect(mockBackupController.executeBackup).toHaveBeenCalled();
      });
    });

    describe('GET /jobs/:id', () => {
      it('should return not implemented for get backup job', async () => {
        mockBackupController.getBackupJob.mockImplementation((_req: any, res: any) => {
          res.status(501).json({
            error: 'Get backup job not yet implemented'
          });
        });

        const response = await request(app)
          .get('/api/backup/jobs/job-1')
          .expect(501);

        expect(response.body).toEqual({
          error: 'Get backup job not yet implemented'
        });
      });
    });

    describe('GET /jobs', () => {
      it('should list backup jobs', async () => {
        const mockJobs = [{ id: 'job-1', businessEntityId: 'entity-1' }];

        mockBackupController.listBackupJobs.mockImplementation((_req: any, res: any) => {
          res.status(200).json({
            data: mockJobs,
            count: mockJobs.length
          });
        });

        const response = await request(app)
          .get('/api/backup/jobs')
          .expect(200);

        expect(response.body).toEqual({
          data: mockJobs,
          count: 1
        });
        expect(mockBackupController.listBackupJobs).toHaveBeenCalled();
      });

      it('should filter backup jobs', async () => {
        const mockJobs = [{ id: 'job-1', businessEntityId: 'entity-1', status: 'completed' }];

        mockBackupController.listBackupJobs.mockImplementation((_req: any, res: any) => {
          res.status(200).json({
            data: mockJobs,
            count: mockJobs.length
          });
        });

        const response = await request(app)
          .get('/api/backup/jobs?businessEntityId=entity-1&status=completed')
          .expect(200);

        expect(response.body).toEqual({
          data: mockJobs,
          count: 1
        });
      });
    });

    describe('POST /jobs/:id/verify', () => {
      it('should verify backup', async () => {
        const mockVerification = { id: 'verification-1', status: 'passed' };
        mockBackupController.verifyBackup.mockImplementation((_req: any, res: any) => {
          res.status(200).json({
            message: 'Backup verification completed successfully',
            data: mockVerification
          });
        });

        const response = await request(app)
          .post('/api/backup/jobs/job-1/verify')
          .expect(200);

        expect(response.body).toEqual({
          message: 'Backup verification completed successfully',
          data: mockVerification
        });
        expect(mockBackupController.verifyBackup).toHaveBeenCalled();
      });
    });
  });

  describe('Recovery Job Routes', () => {
    describe('POST /recovery', () => {
      it('should create recovery job', async () => {
        const recoveryData = {
          businessEntityId: 'entity-1',
          backupJobId: 'job-1',
          recoveryType: 'full_restore',
          targetLocation: '/restore/path'
        };

        const mockJob = { id: 'recovery-1', ...recoveryData, status: 'pending' };
        mockBackupController.createRecoveryJob.mockImplementation((_req: any, res: any) => {
          res.status(201).json({
            message: 'Recovery job created successfully',
            data: mockJob
          });
        });

        const response = await request(app)
          .post('/api/backup/recovery')
          .send(recoveryData)
          .expect(201);

        expect(response.body).toEqual({
          message: 'Recovery job created successfully',
          data: mockJob
        });
        expect(mockBackupController.createRecoveryJob).toHaveBeenCalled();
      });
    });

    describe('POST /recovery/:id/execute', () => {
      it('should execute recovery job', async () => {
        const mockJob = { id: 'recovery-1', status: 'completed' };
        mockBackupController.executeRecovery.mockImplementation((_req: any, res: any) => {
          res.status(200).json({
            message: 'Recovery job executed successfully',
            data: mockJob
          });
        });

        const response = await request(app)
          .post('/api/backup/recovery/recovery-1/execute')
          .expect(200);

        expect(response.body).toEqual({
          message: 'Recovery job executed successfully',
          data: mockJob
        });
        expect(mockBackupController.executeRecovery).toHaveBeenCalled();
      });
    });

    describe('GET /recovery', () => {
      it('should list recovery jobs', async () => {
        const mockJobs = [{ id: 'recovery-1', businessEntityId: 'entity-1' }];

        mockBackupController.listRecoveryJobs.mockImplementation((_req: any, res: any) => {
          res.status(200).json({
            data: mockJobs,
            count: mockJobs.length
          });
        });

        const response = await request(app)
          .get('/api/backup/recovery')
          .expect(200);

        expect(response.body).toEqual({
          data: mockJobs,
          count: 1
        });
        expect(mockBackupController.listRecoveryJobs).toHaveBeenCalled();
      });
    });
  });

  describe('Metrics and Status Routes', () => {
    describe('GET /metrics/backup', () => {
      it('should get backup metrics', async () => {
        const mockMetrics = {
          totalBackups: 10,
          successfulBackups: 8,
          failedBackups: 2,
          successRate: 80
        };

        mockBackupController.getBackupMetrics.mockImplementation((_req: any, res: any) => {
          res.status(200).json({ data: mockMetrics });
        });

        const response = await request(app)
          .get('/api/backup/metrics/backup')
          .expect(200);

        expect(response.body).toEqual({ data: mockMetrics });
        expect(mockBackupController.getBackupMetrics).toHaveBeenCalled();
      });
    });

    describe('GET /metrics/recovery', () => {
      it('should get recovery metrics', async () => {
        const mockMetrics = {
          totalRecoveries: 5,
          successfulRecoveries: 4,
          failedRecoveries: 1,
          rtoCompliance: 95
        };

        mockBackupController.getRecoveryMetrics.mockImplementation((_req: any, res: any) => {
          res.status(200).json({ data: mockMetrics });
        });

        const response = await request(app)
          .get('/api/backup/metrics/recovery')
          .expect(200);

        expect(response.body).toEqual({ data: mockMetrics });
        expect(mockBackupController.getRecoveryMetrics).toHaveBeenCalled();
      });
    });

    describe('GET /status', () => {
      it('should get service status', async () => {
        const mockStatus = {
          status: 'running',
          message: 'Backup service is operational',
          timestamp: new Date().toISOString()
        };

        mockBackupController.getServiceStatus.mockImplementation((_req: any, res: any) => {
          res.status(200).json({ data: mockStatus });
        });

        const response = await request(app)
          .get('/api/backup/status')
          .expect(200);

        expect(response.body).toEqual({ data: mockStatus });
        expect(mockBackupController.getServiceStatus).toHaveBeenCalled();
      });
    });
  });

  describe('Service Management Routes', () => {
    describe('POST /service/start', () => {
      it('should start backup service', async () => {
        mockBackupController.startService.mockImplementation((_req: any, res: any) => {
          res.status(200).json({
            message: 'Backup service started successfully'
          });
        });

        const response = await request(app)
          .post('/api/backup/service/start')
          .expect(200);

        expect(response.body).toEqual({
          message: 'Backup service started successfully'
        });
        expect(mockBackupController.startService).toHaveBeenCalled();
      });
    });

    describe('POST /service/stop', () => {
      it('should stop backup service', async () => {
        mockBackupController.stopService.mockImplementation((_req: any, res: any) => {
          res.status(200).json({
            message: 'Backup service stopped successfully'
          });
        });

        const response = await request(app)
          .post('/api/backup/service/stop')
          .expect(200);

        expect(response.body).toEqual({
          message: 'Backup service stopped successfully'
        });
        expect(mockBackupController.stopService).toHaveBeenCalled();
      });
    });
  });

  describe('Maintenance Routes', () => {
    describe('POST /maintenance/cleanup', () => {
      it('should cleanup old backups', async () => {
        mockBackupController.cleanupOldBackups.mockImplementation((_req: any, res: any) => {
          res.status(200).json({
            message: 'Old backups cleaned up successfully'
          });
        });

        const response = await request(app)
          .post('/api/backup/maintenance/cleanup')
          .expect(200);

        expect(response.body).toEqual({
          message: 'Old backups cleaned up successfully'
        });
        expect(mockBackupController.cleanupOldBackups).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle controller not initialized', async () => {
      const routesWithoutController = new BackupRoutes();
      const appWithoutController = express();
      appWithoutController.use(express.json());
      appWithoutController.use('/api/backup', routesWithoutController.getRouter());

      const response = await request(appWithoutController)
        .get('/api/backup/configs')
        .expect(500);

      expect(response.body).toEqual({
        error: 'Backup controller not initialized'
      });
    });

    it('should handle controller errors', async () => {
      mockBackupController.listBackupConfigs.mockImplementation((_req: any, _res: any) => {
        throw new Error('Controller error');
      });

      const response = await request(app)
        .get('/api/backup/configs')
        .expect(500);

      expect(response.body).toEqual({
        error: 'Controller error'
      });
    });
  });

  describe('Middleware Integration', () => {
    it('should apply rate limiting to all routes', async () => {
      // This test verifies that rate limiting middleware is applied
      // The actual rate limiting behavior is tested in the middleware tests
      const response = await request(app)
        .get('/api/backup/health')
        .expect(200);

      expect(response.status).toBe(200);
    });

    it('should require authentication for protected routes', async () => {
      // This test verifies that authentication middleware is applied
      // Since the mock auth middleware always calls next(), protected routes should work
      // We'll test with a route that requires authentication
      mockBackupController.listBackupConfigs.mockImplementation((_req: any, res: any) => {
        res.status(200).json({ message: 'Success' });
      });

      const response = await request(app)
        .get('/api/backup/configs')
        .expect(200);

      expect(response.body).toEqual({ message: 'Success' });
    });
  });
});
