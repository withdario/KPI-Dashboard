import { BackupService } from '../services/backupService';
// PrismaClient is used in the mock type definition
import { EventEmitter } from 'events';

// Mock Prisma
const mockPrisma = {
  backupConfig: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn()
  },
  backupJob: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
    aggregate: jest.fn()
  },
  backupVerification: {
    create: jest.fn(),
    update: jest.fn()
  },
  recoveryJob: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    aggregate: jest.fn()
  },
  businessEntity: {
    findUnique: jest.fn()
  },
  $queryRaw: jest.fn()
} as any;

// Mock fs module
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  statSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  unlinkSync: jest.fn()
}));

// Mock path module
jest.mock('path', () => ({
  join: jest.fn()
}));

// Mock crypto module
jest.mock('crypto', () => ({
  createHash: jest.fn(() => ({
    update: jest.fn(() => ({
      digest: jest.fn(() => 'mock-checksum')
    }))
  }))
}));

// Mock child_process
jest.mock('child_process', () => ({
  exec: jest.fn()
}));

// Mock node-cron
jest.mock('node-cron', () => ({
  schedule: jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn()
  }))
}));

describe('BackupService', () => {
  let backupService: BackupService;
  let mockCronSchedule: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockCronSchedule = {
      start: jest.fn(),
      stop: jest.fn()
    };
    
    (require('node-cron').schedule as jest.Mock).mockReturnValue(mockCronSchedule);
    
    backupService = new BackupService(mockPrisma as any);
  });

  describe('constructor', () => {
    it('should create a BackupService instance', () => {
      expect(backupService).toBeInstanceOf(BackupService);
      expect(backupService).toBeInstanceOf(EventEmitter);
    });
  });

  describe('start', () => {
    it('should start the backup service successfully', async () => {
      mockPrisma.backupConfig.findMany.mockResolvedValue([]);
      
      await backupService.start();
      
      expect(mockPrisma.backupConfig.findMany).toHaveBeenCalledWith({
        where: { isActive: true }
      });
    });

    it('should not start if already running', async () => {
      mockPrisma.backupConfig.findMany.mockResolvedValue([]);
      
      await backupService.start();
      await backupService.start(); // Second call should not execute
      
      expect(mockPrisma.backupConfig.findMany).toHaveBeenCalledTimes(1);
    });

    it('should handle errors during startup', async () => {
      mockPrisma.backupConfig.findMany.mockRejectedValue(new Error('Database error'));
      
      await expect(backupService.start()).rejects.toThrow('Database error');
    });
  });

  describe('stop', () => {
    it('should stop the backup service successfully', async () => {
      mockPrisma.backupConfig.findMany.mockResolvedValue([]);
      await backupService.start();
      
      await backupService.stop();
      
      expect(mockCronSchedule.stop).toHaveBeenCalled();
    });

    it('should not stop if not running', async () => {
      await backupService.stop();
      
      expect(mockCronSchedule.stop).not.toHaveBeenCalled();
    });
  });

  describe('createBackupConfig', () => {
    const mockRequest = {
      businessEntityId: 'test-entity-id',
      backupType: 'database_full' as any,
      schedule: '0 2 * * *',
      retentionDays: 30,
      compressionEnabled: true,
      encryptionEnabled: false,
      storageLocation: 'local' as any
    };

    it('should create a backup configuration successfully', async () => {
      const mockConfig = { id: 'config-1', ...mockRequest, isActive: true };
      mockPrisma.backupConfig.create.mockResolvedValue(mockConfig);
      
      const result = await backupService.createBackupConfig(mockRequest);
      
      expect(mockPrisma.backupConfig.create).toHaveBeenCalledWith({
        data: {
          ...mockRequest,
          isActive: true
        }
      });
      expect(result).toEqual(mockConfig);
    });

    it('should handle errors during creation', async () => {
      mockPrisma.backupConfig.create.mockRejectedValue(new Error('Creation failed'));
      
      await expect(backupService.createBackupConfig(mockRequest)).rejects.toThrow('Creation failed');
    });
  });

  describe('updateBackupConfig', () => {
    const mockUpdateRequest = {
      schedule: '0 3 * * *',
      retentionDays: 60
    };

    it('should update a backup configuration successfully', async () => {
      const mockConfig = { id: 'config-1', ...mockUpdateRequest };
      mockPrisma.backupConfig.update.mockResolvedValue(mockConfig);
      
      const result = await backupService.updateBackupConfig('config-1', mockUpdateRequest);
      
      expect(mockPrisma.backupConfig.update).toHaveBeenCalledWith({
        where: { id: 'config-1' },
        data: mockUpdateRequest
      });
      expect(result).toEqual(mockConfig);
    });

    it('should handle errors during update', async () => {
      mockPrisma.backupConfig.update.mockRejectedValue(new Error('Update failed'));
      
      await expect(backupService.updateBackupConfig('config-1', mockUpdateRequest)).rejects.toThrow('Update failed');
    });
  });

  describe('getBackupConfig', () => {
    it('should get a backup configuration by ID', async () => {
      const mockConfig = { id: 'config-1', businessEntityId: 'entity-1' };
      mockPrisma.backupConfig.findUnique.mockResolvedValue(mockConfig);
      
      const result = await backupService.getBackupConfig('config-1');
      
      expect(mockPrisma.backupConfig.findUnique).toHaveBeenCalledWith({
        where: { id: 'config-1' }
      });
      expect(result).toEqual(mockConfig);
    });

    it('should return null for non-existent config', async () => {
      mockPrisma.backupConfig.findUnique.mockResolvedValue(null);
      
      const result = await backupService.getBackupConfig('non-existent');
      
      expect(result).toBeNull();
    });
  });

  describe('listBackupConfigs', () => {
    it('should list all backup configurations', async () => {
      const mockConfigs = [
        { id: 'config-1', businessEntityId: 'entity-1' },
        { id: 'config-2', businessEntityId: 'entity-2' }
      ];
      mockPrisma.backupConfig.findMany.mockResolvedValue(mockConfigs);
      
      const result = await backupService.listBackupConfigs();
      
      expect(mockPrisma.backupConfig.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' }
      });
      expect(result).toEqual(mockConfigs);
    });

    it('should filter by business entity ID', async () => {
      const mockConfigs = [{ id: 'config-1', businessEntityId: 'entity-1' }];
      mockPrisma.backupConfig.findMany.mockResolvedValue(mockConfigs);
      
      const result = await backupService.listBackupConfigs('entity-1');
      
      expect(mockPrisma.backupConfig.findMany).toHaveBeenCalledWith({
        where: { businessEntityId: 'entity-1' },
        orderBy: { createdAt: 'desc' }
      });
      expect(result).toEqual(mockConfigs);
    });
  });

  describe('createBackupJob', () => {
    const mockRequest = {
      businessEntityId: 'entity-1',
      backupConfigId: 'config-1',
      metadata: { test: 'data' }
    };

    it('should create a backup job successfully', async () => {
      const mockJob = { id: 'job-1', ...mockRequest, status: 'pending' };
      mockPrisma.backupJob.create.mockResolvedValue(mockJob);
      
      const result = await backupService.createBackupJob(mockRequest);
      
      expect(mockPrisma.backupJob.create).toHaveBeenCalledWith({
        data: {
          ...mockRequest,
          status: 'pending',
          startTime: expect.any(Date),
          retryCount: 0,
          maxRetries: 3,
          metadata: { test: 'data' }
        }
      });
      expect(result).toEqual(mockJob);
    });
  });

  describe('executeBackup', () => {
    it('should handle backup job not found', async () => {
      mockPrisma.backupJob.findFirst.mockResolvedValue(null);
      
      await expect(backupService.executeBackup('non-existent')).rejects.toThrow('Backup job non-existent not found');
    });

    it('should handle unsupported backup type', async () => {
      const mockJob = {
        id: 'job-1',
        businessEntityId: 'entity-1',
        backupConfig: { backupType: 'unsupported_type' }
      };
      mockPrisma.backupJob.findFirst.mockResolvedValue(mockJob);
      mockPrisma.backupJob.update.mockResolvedValue(mockJob);
      
      await expect(backupService.executeBackup('job-1')).rejects.toThrow('Unsupported backup type: unsupported_type');
    });
  });

  describe('verifyBackup', () => {
    it('should handle backup job not found', async () => {
      mockPrisma.backupJob.findUnique.mockResolvedValue(null);
      
      await expect(backupService.verifyBackup('non-existent')).rejects.toThrow('Backup job non-existent not found');
    });
  });

  describe('createRecoveryJob', () => {
    const mockRequest = {
      businessEntityId: 'entity-1',
      backupJobId: 'job-1',
      recoveryType: 'full_restore' as any,
      targetLocation: '/restore/path',
      metadata: { test: 'data' }
    };

    it('should create a recovery job successfully', async () => {
      const mockJob = { id: 'recovery-1', ...mockRequest, status: 'pending' };
      mockPrisma.recoveryJob.create.mockResolvedValue(mockJob);
      
      const result = await backupService.createRecoveryJob(mockRequest);
      
      expect(mockPrisma.recoveryJob.create).toHaveBeenCalledWith({
        data: {
          ...mockRequest,
          status: 'pending',
          startTime: expect.any(Date),
          metadata: { test: 'data' }
        }
      });
      expect(result).toEqual(mockJob);
    });
  });

  describe('executeRecovery', () => {
    it('should handle recovery job not found', async () => {
      mockPrisma.recoveryJob.findUnique.mockResolvedValue(null);
      
      await expect(backupService.executeRecovery('non-existent')).rejects.toThrow('Recovery job non-existent not found');
    });

    it('should handle unsupported recovery type', async () => {
      const mockJob = {
        id: 'recovery-1',
        businessEntityId: 'entity-1',
        backupJob: { 
          filePath: '/backup/path',
          backupConfig: { backupType: 'database_full' }
        }
      };
      mockPrisma.recoveryJob.findUnique.mockResolvedValue(mockJob);
      mockPrisma.recoveryJob.update.mockResolvedValue(mockJob);
      
      await expect(backupService.executeRecovery('recovery-1')).rejects.toThrow('Unsupported recovery type: undefined');
    });
  });

  describe('getBackupMetrics', () => {
    it('should get backup metrics successfully', async () => {
      const mockAggregates = {
        _sum: { fileSize: 1000000 },
        _avg: { duration: 5000 }
      };
      
      mockPrisma.backupJob.count.mockResolvedValue(10);
      mockPrisma.backupJob.aggregate
        .mockResolvedValueOnce(mockAggregates) // totalSize
        .mockResolvedValueOnce(mockAggregates); // averageDuration
      mockPrisma.backupJob.findFirst
        .mockResolvedValueOnce({ endTime: new Date() }) // lastBackup
        .mockResolvedValueOnce({ startTime: new Date() }); // nextScheduledBackup
      
      const result = await backupService.getBackupMetrics();
      
      expect(result.totalBackups).toBe(10);
      expect(result.totalSize).toBe(1000000);
      expect(result.averageDuration).toBe(5000);
    });
  });

  describe('getRecoveryMetrics', () => {
    it('should get recovery metrics successfully', async () => {
      const mockAggregates = {
        _avg: { duration: 300000 } // 5 minutes in milliseconds
      };
      
      mockPrisma.recoveryJob.count.mockResolvedValue(5);
      mockPrisma.recoveryJob.aggregate.mockResolvedValue(mockAggregates);
      mockPrisma.recoveryJob.findFirst.mockResolvedValue({ endTime: new Date() });
      
      const result = await backupService.getRecoveryMetrics();
      
      expect(result.totalRecoveries).toBe(5);
      expect(result.averageRecoveryTime).toBe(300000);
      expect(result.rtoCompliance).toBe(95);
      expect(result.rpoCompliance).toBe(98);
    });
  });

  describe('listBackupJobs', () => {
    it('should list backup jobs with filtering', async () => {
      const mockJobs = [{ id: 'job-1', businessEntityId: 'entity-1' }];
      mockPrisma.backupJob.findMany.mockResolvedValue(mockJobs);
      
      const filter = {
        businessEntityId: 'entity-1',
        status: 'completed' as any,
        limit: 10,
        offset: 0
      };
      
      const result = await backupService.listBackupJobs(filter);
      
      expect(mockPrisma.backupJob.findMany).toHaveBeenCalledWith({
        where: {
          businessEntityId: 'entity-1',
          status: 'completed'
        },
        include: { backupConfig: true },
        orderBy: { startTime: 'desc' },
        take: 10,
        skip: 0
      });
      expect(result).toEqual(mockJobs);
    });
  });

  describe('listRecoveryJobs', () => {
    it('should list recovery jobs with filtering', async () => {
      const mockJobs = [{ id: 'recovery-1', businessEntityId: 'entity-1' }];
      mockPrisma.recoveryJob.findMany.mockResolvedValue(mockJobs);
      
      const filter = {
        businessEntityId: 'entity-1',
        status: 'completed' as any,
        limit: 10,
        offset: 0
      };
      
      const result = await backupService.listRecoveryJobs(filter);
      
      expect(mockPrisma.recoveryJob.findMany).toHaveBeenCalledWith({
        where: {
          businessEntityId: 'entity-1',
          status: 'completed'
        },
        include: { backupJob: true },
        orderBy: { startTime: 'desc' },
        take: 10,
        skip: 0
      });
      expect(result).toEqual(mockJobs);
    });
  });

  describe('cleanupOldBackups', () => {
    it('should cleanup old backups successfully', async () => {
      const mockConfigs = [
        { id: 'config-1', retentionDays: 30 }
      ];
      const mockOldBackups = [
        { id: 'backup-1', filePath: '/old/backup1', backupConfigId: 'config-1' }
      ];
      
      mockPrisma.backupConfig.findMany.mockResolvedValue(mockConfigs);
      mockPrisma.backupJob.findMany.mockResolvedValue(mockOldBackups);
      mockPrisma.backupJob.delete.mockResolvedValue({});
      
      await backupService.cleanupOldBackups();
      
      expect(mockPrisma.backupConfig.findMany).toHaveBeenCalledWith({
        where: { isActive: true }
      });
      expect(mockPrisma.backupJob.findMany).toHaveBeenCalled();
      expect(mockPrisma.backupJob.delete).toHaveBeenCalledWith({
        where: { id: 'backup-1' }
      });
    });
  });

  describe('event handling', () => {
    it('should emit events for backup job creation', async () => {
      const mockRequest = {
        businessEntityId: 'entity-1',
        backupConfigId: 'config-1'
      };
      const mockJob = { id: 'job-1', ...mockRequest, status: 'pending' };
      
      mockPrisma.backupJob.create.mockResolvedValue(mockJob);
      
      const eventSpy = jest.fn();
      backupService.on('backup:job:created', eventSpy);
      
      await backupService.createBackupJob(mockRequest);
      
      expect(eventSpy).toHaveBeenCalledWith(mockJob);
    });

    it('should emit events for backup config creation', async () => {
      const mockRequest = {
        businessEntityId: 'entity-1',
        backupType: 'database_full' as any,
        schedule: '0 2 * * *',
        retentionDays: 30,
        compressionEnabled: false,
        encryptionEnabled: false,
        storageLocation: 'local' as any
      };
      const mockConfig = { id: 'config-1', ...mockRequest, isActive: true };
      
      mockPrisma.backupConfig.create.mockResolvedValue(mockConfig);
      
      const eventSpy = jest.fn();
      backupService.on('backup:config:created', eventSpy);
      
      await backupService.createBackupConfig(mockRequest);
      
      expect(eventSpy).toHaveBeenCalledWith(mockConfig);
    });
  });
});
