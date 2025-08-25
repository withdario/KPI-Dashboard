import { Request, Response } from 'express';
import { BackupController } from '../controllers/backupController';
// BackupService is used in the mock type definition

// Mock BackupService
const mockBackupService = {
  createBackupConfig: jest.fn(),
  updateBackupConfig: jest.fn(),
  getBackupConfig: jest.fn(),
  listBackupConfigs: jest.fn(),
  createBackupJob: jest.fn(),
  executeBackup: jest.fn(),
  verifyBackup: jest.fn(),
  createRecoveryJob: jest.fn(),
  executeRecovery: jest.fn(),
  listBackupJobs: jest.fn(),
  listRecoveryJobs: jest.fn(),
  getBackupMetrics: jest.fn(),
  getRecoveryMetrics: jest.fn(),
  cleanupOldBackups: jest.fn(),
  start: jest.fn(),
  stop: jest.fn()
} as any;

describe('BackupController', () => {
  let backupController: BackupController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    backupController = new BackupController(mockBackupService);
    
    mockRequest = {
      body: {},
      params: {},
      query: {}
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('createBackupConfig', () => {
    it('should create backup config successfully', async () => {
      const requestBody = {
        businessEntityId: 'entity-1',
        backupType: 'database_full',
        schedule: '0 2 * * *',
        retentionDays: 30,
        compressionEnabled: true,
        encryptionEnabled: false,
        storageLocation: 'local'
      };
      
      const mockConfig = { id: 'config-1', ...requestBody, isActive: true };
      
      mockRequest.body = requestBody;
      mockBackupService.createBackupConfig.mockResolvedValue(mockConfig);
      
      await backupController.createBackupConfig(mockRequest as Request, mockResponse as Response);
      
      expect(mockBackupService.createBackupConfig).toHaveBeenCalledWith(requestBody);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Backup configuration created successfully',
        data: mockConfig
      });
    });

    it('should return 400 for missing required fields', async () => {
      const requestBody = {
        businessEntityId: 'entity-1'
        // Missing required fields
      };
      
      mockRequest.body = requestBody;
      
      await backupController.createBackupConfig(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Missing required fields',
        required: ['businessEntityId', 'backupType', 'schedule', 'retentionDays']
      });
    });

    it('should handle service errors', async () => {
      const requestBody = {
        businessEntityId: 'entity-1',
        backupType: 'database_full',
        schedule: '0 2 * * *',
        retentionDays: 30,
        compressionEnabled: true,
        encryptionEnabled: false,
        storageLocation: 'local'
      };
      
      mockRequest.body = requestBody;
      mockBackupService.createBackupConfig.mockRejectedValue(new Error('Service error'));
      
      await backupController.createBackupConfig(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to create backup configuration',
        message: 'Service error'
      });
    });
  });

  describe('getBackupConfig', () => {
    it('should get backup config successfully', async () => {
      const mockConfig = { id: 'config-1', businessEntityId: 'entity-1' };
      
      mockRequest.params = { id: 'config-1' };
      mockBackupService.getBackupConfig.mockResolvedValue(mockConfig);
      
      await backupController.getBackupConfig(mockRequest as Request, mockResponse as Response);
      
      expect(mockBackupService.getBackupConfig).toHaveBeenCalledWith('config-1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockConfig
      });
    });

    it('should return 400 for missing ID', async () => {
      mockRequest.params = {};
      
      await backupController.getBackupConfig(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Backup configuration ID is required'
      });
    });

    it('should return 404 for non-existent config', async () => {
      mockRequest.params = { id: 'config-1' };
      mockBackupService.getBackupConfig.mockResolvedValue(null);
      
      await backupController.getBackupConfig(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Backup configuration not found'
      });
    });
  });

  describe('updateBackupConfig', () => {
    it('should update backup config successfully', async () => {
      const updateData = {
        schedule: '0 3 * * *',
        retentionDays: 60
      };
      
      const mockConfig = { id: 'config-1', ...updateData };
      
      mockRequest.params = { id: 'config-1' };
      mockRequest.body = updateData;
      mockBackupService.updateBackupConfig.mockResolvedValue(mockConfig);
      
      await backupController.updateBackupConfig(mockRequest as Request, mockResponse as Response);
      
      expect(mockBackupService.updateBackupConfig).toHaveBeenCalledWith('config-1', updateData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Backup configuration updated successfully',
        data: mockConfig
      });
    });

    it('should return 400 for missing ID', async () => {
      mockRequest.params = {};
      
      await backupController.updateBackupConfig(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Backup configuration ID is required'
      });
    });
  });

  describe('listBackupConfigs', () => {
    it('should list backup configs successfully', async () => {
      const mockConfigs = [
        { id: 'config-1', businessEntityId: 'entity-1' },
        { id: 'config-2', businessEntityId: 'entity-2' }
      ];
      
      mockRequest.query = {};
      mockBackupService.listBackupConfigs.mockResolvedValue(mockConfigs);
      
      await backupController.listBackupConfigs(mockRequest as Request, mockResponse as Response);
      
      expect(mockBackupService.listBackupConfigs).toHaveBeenCalledWith(undefined);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockConfigs,
        count: 2
      });
    });

    it('should filter by business entity ID', async () => {
      const mockConfigs = [{ id: 'config-1', businessEntityId: 'entity-1' }];
      
      mockRequest.query = { businessEntityId: 'entity-1' };
      mockBackupService.listBackupConfigs.mockResolvedValue(mockConfigs);
      
      await backupController.listBackupConfigs(mockRequest as Request, mockResponse as Response);
      
      expect(mockBackupService.listBackupConfigs).toHaveBeenCalledWith('entity-1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockConfigs,
        count: 1
      });
    });
  });

  describe('createBackupJob', () => {
    it('should create backup job successfully', async () => {
      const requestBody = {
        businessEntityId: 'entity-1',
        backupConfigId: 'config-1'
      };
      
      const mockJob = { id: 'job-1', ...requestBody, status: 'pending' };
      
      mockRequest.body = requestBody;
      mockBackupService.createBackupJob.mockResolvedValue(mockJob);
      
      await backupController.createBackupJob(mockRequest as Request, mockResponse as Response);
      
      expect(mockBackupService.createBackupJob).toHaveBeenCalledWith(requestBody);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Backup job created successfully',
        data: mockJob
      });
    });

    it('should return 400 for missing required fields', async () => {
      const requestBody = {
        businessEntityId: 'entity-1'
        // Missing backupConfigId
      };
      
      mockRequest.body = requestBody;
      
      await backupController.createBackupJob(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Missing required fields',
        required: ['businessEntityId', 'backupConfigId']
      });
    });
  });

  describe('executeBackup', () => {
    it('should execute backup successfully', async () => {
      const mockJob = { id: 'job-1', status: 'completed' };
      
      mockRequest.params = { id: 'job-1' };
      mockBackupService.executeBackup.mockResolvedValue(mockJob);
      
      await backupController.executeBackup(mockRequest as Request, mockResponse as Response);
      
      expect(mockBackupService.executeBackup).toHaveBeenCalledWith('job-1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Backup job executed successfully',
        data: mockJob
      });
    });

    it('should return 400 for missing ID', async () => {
      mockRequest.params = {};
      
      await backupController.executeBackup(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Backup job ID is required'
      });
    });
  });

  describe('verifyBackup', () => {
    it('should verify backup successfully', async () => {
      const mockVerification = { id: 'verification-1', status: 'passed' };
      
      mockRequest.params = { id: 'job-1' };
      mockBackupService.verifyBackup.mockResolvedValue(mockVerification);
      
      await backupController.verifyBackup(mockRequest as Request, mockResponse as Response);
      
      expect(mockBackupService.verifyBackup).toHaveBeenCalledWith('job-1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Backup verification completed successfully',
        data: mockVerification
      });
    });
  });

  describe('createRecoveryJob', () => {
    it('should create recovery job successfully', async () => {
      const requestBody = {
        businessEntityId: 'entity-1',
        backupJobId: 'job-1',
        recoveryType: 'full_restore',
        targetLocation: '/restore/path'
      };
      
      const mockJob = { id: 'recovery-1', ...requestBody, status: 'pending' };
      
      mockRequest.body = requestBody;
      mockBackupService.createRecoveryJob.mockResolvedValue(mockJob);
      
      await backupController.createRecoveryJob(mockRequest as Request, mockResponse as Response);
      
      expect(mockBackupService.createRecoveryJob).toHaveBeenCalledWith(requestBody);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Recovery job created successfully',
        data: mockJob
      });
    });

    it('should return 400 for missing required fields', async () => {
      const requestBody = {
        businessEntityId: 'entity-1'
        // Missing required fields
      };
      
      mockRequest.body = requestBody;
      
      await backupController.createRecoveryJob(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Missing required fields',
        required: ['businessEntityId', 'backupJobId', 'recoveryType', 'targetLocation']
      });
    });
  });

  describe('executeRecovery', () => {
    it('should execute recovery successfully', async () => {
      const mockJob = { id: 'recovery-1', status: 'completed' };
      
      mockRequest.params = { id: 'recovery-1' };
      mockBackupService.executeRecovery.mockResolvedValue(mockJob);
      
      await backupController.executeRecovery(mockRequest as Request, mockResponse as Response);
      
      expect(mockBackupService.executeRecovery).toHaveBeenCalledWith('recovery-1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Recovery job executed successfully',
        data: mockJob
      });
    });
  });

  describe('listBackupJobs', () => {
    it('should list backup jobs with filtering', async () => {
      const mockJobs = [{ id: 'job-1', businessEntityId: 'entity-1' }];
      
      mockRequest.query = {
        businessEntityId: 'entity-1',
        status: 'completed',
        limit: '10',
        offset: '0'
      };
      
      mockBackupService.listBackupJobs.mockResolvedValue(mockJobs);
      
      await backupController.listBackupJobs(mockRequest as Request, mockResponse as Response);
      
      expect(mockBackupService.listBackupJobs).toHaveBeenCalledWith({
        businessEntityId: 'entity-1',
        status: 'completed',
        limit: 10,
        offset: 0
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockJobs,
        count: 1
      });
    });
  });

  describe('listRecoveryJobs', () => {
    it('should list recovery jobs with filtering', async () => {
      const mockJobs = [{ id: 'recovery-1', businessEntityId: 'entity-1' }];
      
      mockRequest.query = {
        businessEntityId: 'entity-1',
        status: 'completed',
        limit: '10',
        offset: '0'
      };
      
      mockBackupService.listRecoveryJobs.mockResolvedValue(mockJobs);
      
      await backupController.listRecoveryJobs(mockRequest as Request, mockResponse as Response);
      
      expect(mockBackupService.listRecoveryJobs).toHaveBeenCalledWith({
        businessEntityId: 'entity-1',
        status: 'completed',
        limit: 10,
        offset: 0
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockJobs,
        count: 1
      });
    });
  });

  describe('getBackupMetrics', () => {
    it('should get backup metrics successfully', async () => {
      const mockMetrics = {
        totalBackups: 10,
        successfulBackups: 8,
        failedBackups: 2,
        successRate: 80
      };
      
      mockRequest.query = {};
      mockBackupService.getBackupMetrics.mockResolvedValue(mockMetrics);
      
      await backupController.getBackupMetrics(mockRequest as Request, mockResponse as Response);
      
      expect(mockBackupService.getBackupMetrics).toHaveBeenCalledWith(undefined);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockMetrics
      });
    });

    it('should filter by business entity ID', async () => {
      const mockMetrics = { totalBackups: 5, successRate: 100 };
      
      mockRequest.query = { businessEntityId: 'entity-1' };
      mockBackupService.getBackupMetrics.mockResolvedValue(mockMetrics);
      
      await backupController.getBackupMetrics(mockRequest as Request, mockResponse as Response);
      
      expect(mockBackupService.getBackupMetrics).toHaveBeenCalledWith('entity-1');
    });
  });

  describe('getRecoveryMetrics', () => {
    it('should get recovery metrics successfully', async () => {
      const mockMetrics = {
        totalRecoveries: 5,
        successfulRecoveries: 4,
        failedRecoveries: 1,
        rtoCompliance: 95
      };
      
      mockRequest.query = {};
      mockBackupService.getRecoveryMetrics.mockResolvedValue(mockMetrics);
      
      await backupController.getRecoveryMetrics(mockRequest as Request, mockResponse as Response);
      
      expect(mockBackupService.getRecoveryMetrics).toHaveBeenCalledWith(undefined);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockMetrics
      });
    });
  });

  describe('cleanupOldBackups', () => {
    it('should cleanup old backups successfully', async () => {
      mockBackupService.cleanupOldBackups.mockResolvedValue(undefined);
      
      await backupController.cleanupOldBackups(mockRequest as Request, mockResponse as Response);
      
      expect(mockBackupService.cleanupOldBackups).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Old backups cleaned up successfully'
      });
    });
  });

  describe('getServiceStatus', () => {
    it('should return service status', async () => {
      await backupController.getServiceStatus(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: {
          status: 'running',
          message: 'Backup service is operational',
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('startService', () => {
    it('should start service successfully', async () => {
      mockBackupService.start.mockResolvedValue(undefined);
      
      await backupController.startService(mockRequest as Request, mockResponse as Response);
      
      expect(mockBackupService.start).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Backup service started successfully'
      });
    });
  });

  describe('stopService', () => {
    it('should stop service successfully', async () => {
      mockBackupService.stop.mockResolvedValue(undefined);
      
      await backupController.stopService(mockRequest as Request, mockResponse as Response);
      
      expect(mockBackupService.stop).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Backup service stopped successfully'
      });
    });
  });

  describe('deleteBackupConfig', () => {
    it('should return not implemented', async () => {
      mockRequest.params = { id: 'config-1' };
      
      await backupController.deleteBackupConfig(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(501);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Delete backup configuration not yet implemented'
      });
    });
  });

  describe('getBackupJob', () => {
    it('should return not implemented', async () => {
      mockRequest.params = { id: 'job-1' };
      
      await backupController.getBackupJob(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(501);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Get backup job not yet implemented'
      });
    });
  });
});
