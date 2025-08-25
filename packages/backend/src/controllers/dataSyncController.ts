import { Request, Response } from 'express';
import { DataSyncService } from '../services/dataSyncService';
import { 
  SyncJobQuery, 
  SyncConfigInput, 
  SyncConfigUpdate, 
  ManualSyncRequest 
} from '../types/dataSync';
import { logger } from '../utils/logger';

export class DataSyncController {
  private dataSyncService: DataSyncService;

  constructor(dataSyncService: DataSyncService) {
    this.dataSyncService = dataSyncService;
  }

  /**
   * Get sync jobs with filtering
   */
  async getSyncJobs(req: Request, res: Response): Promise<void> {
    try {
      const query: SyncJobQuery = {
        businessEntityId: req.query.businessEntityId as string,
        jobType: req.query.jobType as any,
        status: req.query.status as any,
        ...(req.query.limit && { limit: parseInt(req.query.limit as string) }),
        ...(req.query.offset && { offset: parseInt(req.query.offset as string) })
      };

      const jobs = await this.dataSyncService.getSyncJobs(query);

      res.json({
        success: true,
        data: jobs.syncJobs,
        count: jobs.total
      });
    } catch (error) {
      logger.error('Failed to get sync jobs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve sync jobs'
      });
    }
  }

  /**
   * Get sync job by ID
   */
  async getSyncJobById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const job = await this.dataSyncService.getSyncJobById(id);

      if (!job) {
        res.status(404).json({
          success: false,
          error: 'Sync job not found'
        });
        return;
      }

      res.json({
        success: true,
        data: job
      });
    } catch (error) {
      logger.error('Failed to get sync job by ID:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve sync job'
      });
    }
  }

  /**
   * Get sync job statistics
   */
  async getSyncJobStats(req: Request, res: Response): Promise<void> {
    try {
      const { businessEntityId } = req.params;
      const stats = await this.dataSyncService.getSyncJobStats(businessEntityId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Failed to get sync job stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve sync job statistics'
      });
    }
  }

  /**
   * Create sync configuration
   */
  async createSyncConfig(req: Request, res: Response): Promise<void> {
    try {
      const input: SyncConfigInput = req.body;
      const result = await this.dataSyncService.createSyncConfig(input);

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Failed to create sync config:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create sync configuration'
      });
    }
  }

  /**
   * Get sync configuration for a business entity
   */
  async getSyncConfig(req: Request, res: Response): Promise<void> {
    try {
      const { businessEntityId } = req.params;
      const config = await this.dataSyncService.getSyncConfig(businessEntityId);

      if (!config) {
        res.status(404).json({
          success: false,
          error: 'Sync configuration not found'
        });
        return;
      }

      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      logger.error('Failed to get sync config:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve sync configuration'
      });
    }
  }

  /**
   * Update sync configuration
   */
  async updateSyncConfig(req: Request, res: Response): Promise<void> {
    try {
      const { businessEntityId } = req.params;
      const updates: SyncConfigUpdate = req.body;
      const result = await this.dataSyncService.updateSyncConfig(businessEntityId, updates);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Failed to update sync config:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update sync configuration'
      });
    }
  }

  /**
   * Trigger manual synchronization
   */
  async triggerManualSync(req: Request, res: Response): Promise<void> {
    try {
      const request: ManualSyncRequest = req.body;
      const result = await this.dataSyncService.triggerManualSync(request.businessEntityId, request);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      logger.error('Failed to trigger manual sync:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to trigger manual synchronization'
      });
    }
  }

  /**
   * Get sync service health status
   */
  async getSyncHealth(req: Request, res: Response): Promise<void> {
    try {
      const { businessEntityId } = req.params;
      const health = await this.dataSyncService.getSyncHealth(businessEntityId);

      res.json({
        success: true,
        data: health
      });
    } catch (error) {
      logger.error('Failed to get sync health:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve sync service health'
      });
    }
  }

  /**
   * Initialize the sync service
   */
  async initializeSyncService(_req: Request, res: Response): Promise<void> {
    try {
      await this.dataSyncService.initialize();

      res.json({
        success: true,
        message: 'Data synchronization service initialized successfully'
      });
    } catch (error) {
      logger.error('Failed to initialize sync service:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to initialize synchronization service'
      });
    }
  }

  /**
   * Shutdown the sync service
   */
  async shutdownSyncService(_req: Request, res: Response): Promise<void> {
    try {
      await this.dataSyncService.shutdown();

      res.json({
        success: true,
        message: 'Data synchronization service shut down successfully'
      });
    } catch (error) {
      logger.error('Failed to shutdown sync service:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to shutdown synchronization service'
      });
    }
  }
}
