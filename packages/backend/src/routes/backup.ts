import { Router, Request, Response, NextFunction } from 'express';
import { BackupController } from '../controllers/backupController';
import { authenticateToken } from '../middleware/auth';
import { generalRateLimit as rateLimit } from '../middleware/rateLimit';



export default class BackupRoutes {
  private router: Router;
  private backupController: BackupController | null = null;

  constructor() {
    this.router = Router();
    this.setupRoutes();
  }

  /**
   * Set the backup controller for dependency injection
   */
  setBackupController(backupController: BackupController): void {
    this.backupController = backupController;
  }

  /**
   * Setup all backup routes
   */
  private setupRoutes(): void {
    // Apply rate limiting to all backup routes
    this.router.use(rateLimit);

    // Backup Configuration Routes
    this.router.post('/configs', authenticateToken, this.validateController, this.createBackupConfig);
    this.router.get('/configs/:id', authenticateToken, this.validateController, this.getBackupConfig);
    this.router.put('/configs/:id', authenticateToken, this.validateController, this.updateBackupConfig);
    this.router.delete('/configs/:id', authenticateToken, this.validateController, this.deleteBackupConfig);
    this.router.get('/configs', authenticateToken, this.validateController, this.listBackupConfigs);

    // Backup Job Routes
    this.router.post('/jobs', authenticateToken, this.validateController, this.createBackupJob);
    this.router.post('/jobs/:id/execute', authenticateToken, this.validateController, this.executeBackup);
    this.router.get('/jobs/:id', authenticateToken, this.validateController, this.getBackupJob);
    this.router.get('/jobs', authenticateToken, this.validateController, this.listBackupJobs);
    this.router.post('/jobs/:id/verify', authenticateToken, this.validateController, this.verifyBackup);

    // Recovery Job Routes
    this.router.post('/recovery', authenticateToken, this.validateController, this.createRecoveryJob);
    this.router.post('/recovery/:id/execute', authenticateToken, this.validateController, this.executeRecovery);
    this.router.get('/recovery', authenticateToken, this.validateController, this.listRecoveryJobs);

    // Metrics and Status Routes
    this.router.get('/metrics/backup', authenticateToken, this.validateController, this.getBackupMetrics);
    this.router.get('/metrics/recovery', authenticateToken, this.validateController, this.getRecoveryMetrics);
    this.router.get('/status', authenticateToken, this.validateController, this.getServiceStatus);

    // Service Management Routes
    this.router.post('/service/start', authenticateToken, this.validateController, this.startService);
    this.router.post('/service/stop', authenticateToken, this.validateController, this.stopService);

    // Maintenance Routes
    this.router.post('/maintenance/cleanup', authenticateToken, this.validateController, this.cleanupOldBackups);

    // Health check endpoint
    this.router.get('/health', this.healthCheck);
  }

  /**
   * Validate that the controller is set
   */
  private validateController = (_req: Request, res: Response, next: NextFunction): void => {
    if (!this.backupController) {
      res.status(500).json({
        error: 'Backup controller not initialized'
      });
      return;
    }
    next();
  };

  /**
   * Health check endpoint
   */
  private healthCheck = (_req: Request, res: Response): void => {
    res.status(200).json({
      status: 'healthy',
      service: 'backup',
      timestamp: new Date().toISOString()
    });
  };

  // Backup Configuration Routes

  /**
   * Create a new backup configuration
   */
  private createBackupConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Business entity access is handled by middleware
      // No additional validation needed here

      await this.backupController!.createBackupConfig(req, res);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get backup configuration by ID
   */
  private getBackupConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.backupController!.getBackupConfig(req, res);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update backup configuration
   */
  private updateBackupConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.backupController!.updateBackupConfig(req, res);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete backup configuration
   */
  private deleteBackupConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.backupController!.deleteBackupConfig(req, res);
    } catch (error) {
      next(error);
    }
  };

  /**
   * List backup configurations
   */
  private listBackupConfigs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Business entity access is handled by middleware
      // No additional validation needed here

      await this.backupController!.listBackupConfigs(req, res);
    } catch (error) {
      next(error);
    }
  };

  // Backup Job Routes

  /**
   * Create a new backup job
   */
  private createBackupJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Business entity access is handled by middleware
      // No additional validation needed here

      await this.backupController!.createBackupJob(req, res);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Execute a backup job
   */
  private executeBackup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.backupController!.executeBackup(req, res);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get backup job by ID
   */
  private getBackupJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.backupController!.getBackupJob(req, res);
    } catch (error) {
      next(error);
    }
  };

  /**
   * List backup jobs with filtering
   */
  private listBackupJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Business entity access is handled by middleware
      // No additional validation needed here

      await this.backupController!.listBackupJobs(req, res);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Verify a backup
   */
  private verifyBackup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.backupController!.verifyBackup(req, res);
    } catch (error) {
      next(error);
    }
  };

  // Recovery Job Routes

  /**
   * Create a recovery job
   */
  private createRecoveryJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Business entity access is handled by middleware
      // No additional validation needed here

      await this.backupController!.createRecoveryJob(req, res);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Execute a recovery job
   */
  private executeRecovery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.backupController!.executeRecovery(req, res);
    } catch (error) {
      next(error);
    }
  };

  /**
   * List recovery jobs with filtering
   */
  private listRecoveryJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Business entity access is handled by middleware
      // No additional validation needed here

      await this.backupController!.listRecoveryJobs(req, res);
    } catch (error) {
      next(error);
    }
  };

  // Metrics and Status Routes

  /**
   * Get backup metrics
   */
  private getBackupMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Business entity access is handled by middleware
      // No additional validation needed here

      await this.backupController!.getBackupMetrics(req, res);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get recovery metrics
   */
  private getRecoveryMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Business entity access is handled by middleware
      // No additional validation needed here

      await this.backupController!.getRecoveryMetrics(req, res);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get backup service status
   */
  private getServiceStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.backupController!.getServiceStatus(req, res);
    } catch (error) {
      next(error);
    }
  };

  // Service Management Routes

  /**
   * Start backup service
   */
  private startService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.backupController!.startService(req, res);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Stop backup service
   */
  private stopService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.backupController!.stopService(req, res);
    } catch (error) {
      next(error);
    }
  };

  // Maintenance Routes

  /**
   * Clean up old backups
   */
  private cleanupOldBackups = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.backupController!.cleanupOldBackups(req, res);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get the router instance
   */
  getRouter(): Router {
    return this.router;
  }
}
