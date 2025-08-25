import { Request, Response } from 'express';
import { BackupService } from '../services/backupService';
import {
  CreateBackupConfigRequest,
  UpdateBackupConfigRequest,
  CreateBackupJobRequest,
  CreateRecoveryJobRequest,
  BackupFilter,
  RecoveryFilter
} from '../types/backup';

export class BackupController {
  private backupService: BackupService;

  constructor(backupService: BackupService) {
    this.backupService = backupService;
  }

  /**
   * Create a new backup configuration
   */
  async createBackupConfig(req: Request, res: Response): Promise<void> {
    try {
      const request: CreateBackupConfigRequest = req.body;
      
      // Validate required fields
      if (!request.businessEntityId || !request.backupType || !request.schedule || !request.retentionDays) {
        res.status(400).json({
          error: 'Missing required fields',
          required: ['businessEntityId', 'backupType', 'schedule', 'retentionDays']
        });
        return;
      }

      const config = await this.backupService.createBackupConfig(request);
      
      res.status(201).json({
        message: 'Backup configuration created successfully',
        data: config
      });
    } catch (error) {
      console.error('Failed to create backup config:', error);
      res.status(500).json({
        error: 'Failed to create backup configuration',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get backup configuration by ID
   */
  async getBackupConfig(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          error: 'Backup configuration ID is required'
        });
        return;
      }

      const config = await this.backupService.getBackupConfig(id);
      
      if (!config) {
        res.status(404).json({
          error: 'Backup configuration not found'
        });
        return;
      }

      res.status(200).json({
        data: config
      });
    } catch (error) {
      console.error('Failed to get backup config:', error);
      res.status(500).json({
        error: 'Failed to retrieve backup configuration',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update backup configuration
   */
  async updateBackupConfig(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const request: UpdateBackupConfigRequest = req.body;
      
      if (!id) {
        res.status(400).json({
          error: 'Backup configuration ID is required'
        });
        return;
      }

      const config = await this.backupService.updateBackupConfig(id, request);
      
      res.status(200).json({
        message: 'Backup configuration updated successfully',
        data: config
      });
    } catch (error) {
      console.error('Failed to update backup config:', error);
      res.status(500).json({
        error: 'Failed to update backup configuration',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * List backup configurations
   */
  async listBackupConfigs(req: Request, res: Response): Promise<void> {
    try {
      const { businessEntityId } = req.query;
      
      const configs = await this.backupService.listBackupConfigs(
        businessEntityId as string
      );
      
      res.status(200).json({
        data: configs,
        count: configs.length
      });
    } catch (error) {
      console.error('Failed to list backup configs:', error);
      res.status(500).json({
        error: 'Failed to retrieve backup configurations',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete backup configuration
   */
  async deleteBackupConfig(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          error: 'Backup configuration ID is required'
        });
        return;
      }

      // Note: This would need to be implemented in the service
      // For now, we'll return a not implemented response
      res.status(501).json({
        error: 'Delete backup configuration not yet implemented'
      });
    } catch (error) {
      console.error('Failed to delete backup config:', error);
      res.status(500).json({
        error: 'Failed to delete backup configuration',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create a new backup job
   */
  async createBackupJob(req: Request, res: Response): Promise<void> {
    try {
      const request: CreateBackupJobRequest = req.body;
      
      // Validate required fields
      if (!request.businessEntityId || !request.backupConfigId) {
        res.status(400).json({
          error: 'Missing required fields',
          required: ['businessEntityId', 'backupConfigId']
        });
        return;
      }

      const backupJob = await this.backupService.createBackupJob(request);
      
      res.status(201).json({
        message: 'Backup job created successfully',
        data: backupJob
      });
    } catch (error) {
      console.error('Failed to create backup job:', error);
      res.status(500).json({
        error: 'Failed to create backup job',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Execute a backup job
   */
  async executeBackup(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          error: 'Backup job ID is required'
        });
        return;
      }

      const backupJob = await this.backupService.executeBackup(id);
      
      res.status(200).json({
        message: 'Backup job executed successfully',
        data: backupJob
      });
    } catch (error) {
      console.error('Failed to execute backup:', error);
      res.status(500).json({
        error: 'Failed to execute backup job',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get backup job by ID
   */
  async getBackupJob(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          error: 'Backup job ID is required'
        });
        return;
      }

      // Note: This would need to be implemented in the service
      // For now, we'll return a not implemented response
      res.status(501).json({
        error: 'Get backup job not yet implemented'
      });
    } catch (error) {
      console.error('Failed to get backup job:', error);
      res.status(500).json({
        error: 'Failed to retrieve backup job',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * List backup jobs with filtering
   */
  async listBackupJobs(req: Request, res: Response): Promise<void> {
    try {
      const {
        businessEntityId,
        backupType,
        status,
        startDate,
        endDate,
        limit,
        offset
      } = req.query;

      const filter: BackupFilter = {
        ...(businessEntityId && { businessEntityId: businessEntityId as string }),
        ...(backupType && { backupType: backupType as any }),
        ...(status && { status: status as any }),
        ...(startDate && { startDate: new Date(startDate as string) }),
        ...(endDate && { endDate: new Date(endDate as string) }),
        ...(limit && { limit: parseInt(limit as string) }),
        ...(offset && { offset: parseInt(offset as string) })
      };

      const backupJobs = await this.backupService.listBackupJobs(filter);
      
      res.status(200).json({
        data: backupJobs,
        count: backupJobs.length
      });
    } catch (error) {
      console.error('Failed to list backup jobs:', error);
      res.status(500).json({
        error: 'Failed to retrieve backup jobs',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Verify a backup
   */
  async verifyBackup(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          error: 'Backup job ID is required'
        });
        return;
      }

      const verification = await this.backupService.verifyBackup(id);
      
      res.status(200).json({
        message: 'Backup verification completed successfully',
        data: verification
      });
    } catch (error) {
      console.error('Failed to verify backup:', error);
      res.status(500).json({
        error: 'Failed to verify backup',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create a recovery job
   */
  async createRecoveryJob(req: Request, res: Response): Promise<void> {
    try {
      const request: CreateRecoveryJobRequest = req.body;
      
      // Validate required fields
      if (!request.businessEntityId || !request.backupJobId || !request.recoveryType || !request.targetLocation) {
        res.status(400).json({
          error: 'Missing required fields',
          required: ['businessEntityId', 'backupJobId', 'recoveryType', 'targetLocation']
        });
        return;
      }

      const recoveryJob = await this.backupService.createRecoveryJob(request);
      
      res.status(201).json({
        message: 'Recovery job created successfully',
        data: recoveryJob
      });
    } catch (error) {
      console.error('Failed to create recovery job:', error);
      res.status(500).json({
        error: 'Failed to create recovery job',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Execute a recovery job
   */
  async executeRecovery(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          error: 'Recovery job ID is required'
        });
        return;
      }

      const recoveryJob = await this.backupService.executeRecovery(id);
      
      res.status(200).json({
        message: 'Recovery job executed successfully',
        data: recoveryJob
      });
    } catch (error) {
      console.error('Failed to execute recovery:', error);
      res.status(500).json({
        error: 'Failed to execute recovery job',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * List recovery jobs with filtering
   */
  async listRecoveryJobs(req: Request, res: Response): Promise<void> {
    try {
      const {
        businessEntityId,
        status,
        recoveryType,
        startDate,
        endDate,
        limit,
        offset
      } = req.query;

      const filter: RecoveryFilter = {
        ...(businessEntityId && { businessEntityId: businessEntityId as string }),
        ...(status && { status: status as any }),
        ...(recoveryType && { recoveryType: recoveryType as any }),
        ...(startDate && { startDate: new Date(startDate as string) }),
        ...(endDate && { endDate: new Date(endDate as string) }),
        ...(limit && { limit: parseInt(limit as string) }),
        ...(offset && { offset: parseInt(offset as string) })
      };

      const recoveryJobs = await this.backupService.listRecoveryJobs(filter);
      
      res.status(200).json({
        data: recoveryJobs,
        count: recoveryJobs.length
      });
    } catch (error) {
      console.error('Failed to list recovery jobs:', error);
      res.status(500).json({
        error: 'Failed to retrieve recovery jobs',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get backup metrics
   */
  async getBackupMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { businessEntityId } = req.query;
      
      const metrics = await this.backupService.getBackupMetrics(
        businessEntityId as string
      );
      
      res.status(200).json({
        data: metrics
      });
    } catch (error) {
      console.error('Failed to get backup metrics:', error);
      res.status(500).json({
        error: 'Failed to retrieve backup metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get recovery metrics
   */
  async getRecoveryMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { businessEntityId } = req.query;
      
      const metrics = await this.backupService.getRecoveryMetrics(
        businessEntityId as string
      );
      
      res.status(200).json({
        data: metrics
      });
    } catch (error) {
      console.error('Failed to get recovery metrics:', error);
      res.status(500).json({
        error: 'Failed to retrieve recovery metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Clean up old backups
   */
  async cleanupOldBackups(_req: Request, res: Response): Promise<void> {
    try {
      await this.backupService.cleanupOldBackups();
      
      res.status(200).json({
        message: 'Old backups cleaned up successfully'
      });
    } catch (error) {
      console.error('Failed to cleanup old backups:', error);
      res.status(500).json({
        error: 'Failed to cleanup old backups',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get backup service status
   */
  async getServiceStatus(_req: Request, res: Response): Promise<void> {
    try {
      // Note: This would need to be implemented in the service
      // For now, we'll return a basic status
      res.status(200).json({
        data: {
          status: 'running',
          message: 'Backup service is operational',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to get service status:', error);
      res.status(500).json({
        error: 'Failed to retrieve service status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Start backup service
   */
  async startService(_req: Request, res: Response): Promise<void> {
    try {
      await this.backupService.start();
      
      res.status(200).json({
        message: 'Backup service started successfully'
      });
    } catch (error) {
      console.error('Failed to start backup service:', error);
      res.status(500).json({
        error: 'Failed to start backup service',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Stop backup service
   */
  async stopService(_req: Request, res: Response): Promise<void> {
    try {
      await this.backupService.stop();
      
      res.status(200).json({
        message: 'Backup service stopped successfully'
      });
    } catch (error) {
      console.error('Failed to stop backup service:', error);
      res.status(500).json({
        error: 'Failed to stop backup service',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
