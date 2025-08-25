import * as cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { GoogleAnalyticsService } from './googleAnalyticsService';
import { N8nService } from './n8nService';
import { MetricsService } from './metricsService';
import { 
  SyncJob, 
  SyncJobInput, 
  SyncJobUpdate, 
  SyncJobQuery, 
  SyncJobResponse, 
  SyncJobStats, 
  SyncConfig, 
  SyncConfigInput, 
  SyncConfigUpdate, 
  ManualSyncRequest, 
  ManualSyncResponse, 
  SyncHealthResponse
} from '../types/dataSync';
import { logger } from '../utils/logger';

export class DataSyncService {
  private prisma: PrismaClient;
  private googleAnalyticsService: GoogleAnalyticsService;
  private n8nService: N8nService;
  private metricsService: MetricsService;
  private cronJobs: Map<string, cron.ScheduledTask> = new Map();
  private isInitialized = false;

  constructor(
    prisma: PrismaClient,
    googleAnalyticsService: GoogleAnalyticsService,
    n8nService: N8nService,
    metricsService: MetricsService
  ) {
    this.prisma = prisma;
    this.googleAnalyticsService = googleAnalyticsService;
    this.n8nService = n8nService;
    this.metricsService = metricsService;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      logger.info('Initializing DataSyncService...');
      
      // Load all sync configurations and start cron jobs
      const configs = await this.getAllSyncConfigs();
      for (const config of configs) {
        await this.startCronJobs(config);
      }
      
      this.isInitialized = true;
      logger.info('DataSyncService initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize DataSyncService:', error);
      throw error;
    }
  }

  async startCronJobs(syncConfig: SyncConfig): Promise<void> {
    const { businessEntityId, ga4SyncEnabled, ga4SyncSchedule, n8nSyncEnabled, n8nSyncSchedule, cleanupSyncEnabled, cleanupSyncSchedule } = syncConfig;

    // Stop existing cron jobs for this business entity
    this.stopCronJobs(businessEntityId);

    // Start GA4 daily sync
    if (ga4SyncEnabled) {
      const ga4Job = cron.schedule(ga4SyncSchedule, async () => {
        await this.executeGA4DailySync(businessEntityId);
      });
      this.cronJobs.set(`${businessEntityId}_ga4`, ga4Job);
      logger.info(`Started GA4 sync cron job for business entity ${businessEntityId}`);
    }

    // Start n8n real-time sync
    if (n8nSyncEnabled) {
      const n8nJob = cron.schedule(n8nSyncSchedule, async () => {
        await this.executeN8nSync(businessEntityId);
      });
      this.cronJobs.set(`${businessEntityId}_n8n`, n8nJob);
      logger.info(`Started n8n sync cron job for business entity ${businessEntityId}`);
    }

    // Start cleanup sync
    if (cleanupSyncEnabled) {
      const cleanupJob = cron.schedule(cleanupSyncSchedule, async () => {
        await this.executeCleanupSync(businessEntityId);
      });
      this.cronJobs.set(`${businessEntityId}_cleanup`, cleanupJob);
      logger.info(`Started cleanup sync cron job for business entity ${businessEntityId}`);
    }
  }

  stopCronJobs(businessEntityId: string): void {
    const jobKeys = Array.from(this.cronJobs.keys()).filter(key => key.startsWith(businessEntityId));
    
    for (const key of jobKeys) {
      const job = this.cronJobs.get(key);
      if (job) {
        job.stop();
        this.cronJobs.delete(key);
        logger.info(`Stopped cron job: ${key}`);
      }
    }
  }

  async executeGA4DailySync(businessEntityId: string): Promise<void> {
    const syncJob = await this.createSyncJob({
      businessEntityId,
      jobType: 'ga4_daily',
      metadata: { source: 'cron_scheduled' }
    });

    try {
      logger.info(`Starting GA4 daily sync for business entity ${businessEntityId}`);
      
      // Get GA4 integration for this business entity
      const ga4Integration = await this.prisma.googleAnalyticsIntegration.findFirst({
        where: { businessEntityId, isActive: true }
      });

      if (!ga4Integration) {
        throw new Error('No active GA4 integration found');
      }

      // Get yesterday's date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const startDate = yesterday.toISOString().split('T')[0];
      const endDate = startDate;

      // Fetch GA4 metrics
      const metrics = await this.googleAnalyticsService.getBasicMetrics(
        ga4Integration.propertyId,
        startDate,
        endDate
      );

      // Transform and store metrics
      for (const metric of metrics) {
        // Create sessions metric
        if (metric.sessions) {
          const sessionsInput = {
            businessEntityId,
            metricType: 'ga4_session' as any,
            metricName: 'sessions',
            metricValue: metric.sessions,
            metricUnit: 'count',
            source: 'google_analytics' as any,
            date: new Date(metric.date),
            timezone: 'UTC',
            metadata: { source: 'ga4-api', date: metric.date },
            tags: ['ga4', 'sessions']
          };
          await this.metricsService.createMetric(sessionsInput);
        }

        // Create users metric
        if (metric.users) {
          const usersInput = {
            businessEntityId,
            metricType: 'ga4_user' as any,
            metricName: 'users',
            metricValue: metric.users,
            metricUnit: 'count',
            source: 'google_analytics' as any,
            date: new Date(metric.date),
            timezone: 'UTC',
            metadata: { source: 'ga4-api', date: metric.date },
            tags: ['ga4', 'users']
          };
          await this.metricsService.createMetric(usersInput);
        }

        // Create pageviews metric
        if (metric.pageviews) {
          const pageviewsInput = {
            businessEntityId,
            metricType: 'ga4_pageview' as any,
            metricName: 'pageviews',
            metricValue: metric.pageviews,
            metricUnit: 'count',
            source: 'google_analytics' as any,
            date: new Date(metric.date),
            timezone: 'UTC',
            metadata: { source: 'ga4-api', date: metric.date },
            tags: ['ga4', 'pageviews']
          };
          await this.metricsService.createMetric(pageviewsInput);
        }
      }

      // Update integration last sync time
      await this.prisma.googleAnalyticsIntegration.update({
        where: { id: ga4Integration.id },
        data: { lastSyncAt: new Date() }
      });

      // Mark job as completed
      await this.updateSyncJob(syncJob.id, {
        status: 'completed',
        endTime: new Date(),
        duration: Date.now() - syncJob.startTime.getTime()
      });

      logger.info(`GA4 daily sync completed successfully for business entity ${businessEntityId}`);
    } catch (error) {
      await this.handleSyncJobFailure(syncJob.id, error);
    }
  }

  async executeN8nSync(businessEntityId: string): Promise<void> {
    const syncJob = await this.createSyncJob({
      businessEntityId,
      jobType: 'n8n_realtime',
      metadata: { source: 'cron_scheduled' }
    });

    try {
      logger.info(`Starting n8n sync for business entity ${businessEntityId}`);
      
      // Get n8n integration for this business entity
      const n8nIntegration = await this.prisma.n8nIntegration.findFirst({
        where: { businessEntityId, isActive: true }
      });

      if (!n8nIntegration) {
        throw new Error('No active n8n integration found');
      }

      // Process any pending webhook events
      const pendingEvents = await this.prisma.n8nWebhookEvent.findMany({
        where: {
          n8nIntegrationId: n8nIntegration.id,
          status: 'pending'
        }
      });

      for (const event of pendingEvents) {
        // Convert the database event to the expected payload format
        const payload = {
          workflowId: event.workflowId,
          workflowName: event.workflowName,
          executionId: event.executionId,
          eventType: event.eventType as any,
          status: event.status as any,
          startTime: event.startTime.toISOString(),
          ...(event.endTime && { endTime: event.endTime.toISOString() }),
          ...(event.duration !== null && { duration: event.duration }),
          inputData: event.inputData as Record<string, any>,
          outputData: event.outputData as Record<string, any>,
          ...(event.errorMessage && { errorMessage: event.errorMessage }),
          metadata: event.metadata as Record<string, any>
        };
        
        await this.n8nService.processWebhookEvent(n8nIntegration.id, payload);
      }

      // Mark job as completed
      await this.updateSyncJob(syncJob.id, {
        status: 'completed',
        endTime: new Date(),
        duration: Date.now() - syncJob.startTime.getTime()
      });

      logger.info(`n8n sync completed successfully for business entity ${businessEntityId}`);
    } catch (error) {
      await this.handleSyncJobFailure(syncJob.id, error);
    }
  }

  async executeCleanupSync(businessEntityId: string): Promise<void> {
    const syncJob = await this.createSyncJob({
      businessEntityId,
      jobType: 'cleanup',
      metadata: { source: 'cron_scheduled' }
    });

    try {
      logger.info(`Starting cleanup sync for business entity ${businessEntityId}`);
      
      // Execute data cleanup (retention policy enforcement)
      await this.metricsService.cleanupOldData(businessEntityId, 90); // 90 days retention

      // Mark job as completed
      await this.updateSyncJob(syncJob.id, {
        status: 'completed',
        endTime: new Date(),
        duration: Date.now() - syncJob.startTime.getTime()
      });

      logger.info(`Cleanup sync completed successfully for business entity ${businessEntityId}`);
    } catch (error) {
      await this.handleSyncJobFailure(syncJob.id, error);
    }
  }

  private async handleSyncJobFailure(syncJobId: string, error: any): Promise<void> {
    const syncJob = await this.getSyncJobById(syncJobId);
    if (!syncJob) return;

    const config = await this.getSyncConfig(syncJob.businessEntityId);
    if (!config) return;

    const { retryConfig } = config;
    const currentRetryCount = syncJob.retryCount + 1;

    if (currentRetryCount <= retryConfig.maxRetries) {
      // Calculate next retry time with exponential backoff
      const delay = Math.min(
        retryConfig.initialDelay * Math.pow(retryConfig.backoffMultiplier, currentRetryCount - 1),
        retryConfig.maxDelay
      );

      const nextRetryAt = new Date(Date.now() + delay);

      await this.updateSyncJob(syncJobId, {
        status: 'pending',
        retryCount: currentRetryCount,
        nextRetryAt,
        errorMessage: error.message,
        errorCode: error.code || 'UNKNOWN_ERROR'
      });

      logger.info(`Scheduled retry ${currentRetryCount}/${retryConfig.maxRetries} for job ${syncJobId} at ${nextRetryAt}`);
    } else {
      // Max retries exceeded, mark as failed
      await this.updateSyncJob(syncJobId, {
        status: 'failed',
        endTime: new Date(),
        errorMessage: `Max retries exceeded: ${error.message}`,
        errorCode: 'MAX_RETRIES_EXCEEDED'
      });

      logger.error(`Job ${syncJobId} failed after ${retryConfig.maxRetries} retries`);
      
      // Send alert if enabled
      if (config.alerting.enabled) {
        await this.sendSyncFailureAlert(config, syncJob, error);
      }
    }
  }

  private async sendSyncFailureAlert(config: SyncConfig, syncJob: SyncJob, error: any): Promise<void> {
    try {
      const alertMessage = `Sync job failed for business entity ${syncJob.businessEntityId}:
        Job Type: ${syncJob.jobType}
        Error: ${error.message}
        Retry Count: ${syncJob.retryCount}
        Time: ${new Date().toISOString()}`;

      // TODO: Implement actual alerting (email, Slack, etc.)
      logger.warn('Sync failure alert:', alertMessage);
      
      // Log the alert configuration for debugging
      logger.info(`Alerting config: enabled=${config.alerting.enabled}, recipients=${config.alerting.emailRecipients.join(', ')}`);
    } catch (alertError) {
      logger.error('Failed to send sync failure alert:', alertError);
    }
  }

  async createSyncJob(input: SyncJobInput): Promise<SyncJob> {
    const syncJob = await this.prisma.syncJob.create({
      data: {
        businessEntityId: input.businessEntityId,
        jobType: input.jobType,
        status: 'pending',
        startTime: new Date(),
        retryCount: 0,
        maxRetries: 3,
        metadata: input.metadata || {}
      }
    });

    return {
      ...syncJob,
      jobType: syncJob.jobType as 'ga4_daily' | 'n8n_realtime' | 'manual' | 'cleanup',
      status: syncJob.status as 'pending' | 'running' | 'completed' | 'failed' | 'cancelled',
      metadata: syncJob.metadata as Record<string, any>
    };
  }

  async getSyncJobById(id: string): Promise<SyncJob | null> {
    const syncJob = await this.prisma.syncJob.findUnique({
      where: { id }
    });

    if (!syncJob) return null;

    return {
      ...syncJob,
      jobType: syncJob.jobType as 'ga4_daily' | 'n8n_realtime' | 'manual' | 'cleanup',
      status: syncJob.status as 'pending' | 'running' | 'completed' | 'failed' | 'cancelled',
      metadata: syncJob.metadata as Record<string, any>
    };
  }

  async updateSyncJob(id: string, update: SyncJobUpdate): Promise<SyncJob> {
    const syncJob = await this.prisma.syncJob.update({
      where: { id },
      data: update
    });

    return {
      ...syncJob,
      jobType: syncJob.jobType as 'ga4_daily' | 'n8n_realtime' | 'manual' | 'cleanup',
      status: syncJob.status as 'pending' | 'running' | 'completed' | 'failed' | 'cancelled',
      metadata: syncJob.metadata as Record<string, any>
    };
  }

  async getSyncJobs(query: SyncJobQuery): Promise<SyncJobResponse> {
    const { businessEntityId, jobType, status, limit = 50, offset = 0 } = query;
    
    const where: any = {};
    if (businessEntityId) where.businessEntityId = businessEntityId;
    if (jobType) where.jobType = jobType;
    if (status) where.status = status;

    const [syncJobs, total] = await Promise.all([
      this.prisma.syncJob.findMany({
        where,
        orderBy: { startTime: 'desc' },
        take: limit,
        skip: offset
      }),
      this.prisma.syncJob.count({ where })
    ]);

    return {
      syncJobs: syncJobs.map(job => ({
        ...job,
        jobType: job.jobType as 'ga4_daily' | 'n8n_realtime' | 'manual' | 'cleanup',
        status: job.status as 'pending' | 'running' | 'completed' | 'failed' | 'cancelled',
        metadata: job.metadata as Record<string, any>
      })),
      total,
      limit,
      offset
    };
  }

  async getSyncJobStats(businessEntityId: string): Promise<SyncJobStats> {
    const [totalJobs, completedJobs, failedJobs, runningJobs, pendingJobs] = await Promise.all([
      this.prisma.syncJob.count({ where: { businessEntityId } }),
      this.prisma.syncJob.count({ where: { businessEntityId, status: 'completed' } }),
      this.prisma.syncJob.count({ where: { businessEntityId, status: 'failed' } }),
      this.prisma.syncJob.count({ where: { businessEntityId, status: 'running' } }),
      this.prisma.syncJob.count({ where: { businessEntityId, status: 'pending' } })
    ]);

    // Calculate average duration and success rate
    const completedJobsWithDuration = await this.prisma.syncJob.findMany({
      where: { businessEntityId, status: 'completed', duration: { not: null } },
      select: { duration: true }
    });

    const averageDuration = completedJobsWithDuration.length > 0
      ? completedJobsWithDuration.reduce((sum, job) => sum + (job.duration || 0), 0) / completedJobsWithDuration.length
      : 0;

    const successRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;

    // Get last sync time
    const lastSyncJob = await this.prisma.syncJob.findFirst({
      where: { businessEntityId, status: 'completed' },
      orderBy: { endTime: 'desc' }
    });

    return {
      totalJobs,
      completedJobs,
      failedJobs,
      runningJobs,
      pendingJobs,
      averageDuration,
      successRate,
      lastSyncAt: lastSyncJob?.endTime || null
    };
  }

  async createSyncConfig(input: SyncConfigInput): Promise<SyncConfig> {
    const syncConfig = await this.prisma.syncConfig.create({
      data: {
        businessEntityId: input.businessEntityId,
        ga4SyncEnabled: input.ga4SyncEnabled ?? true,
        ga4SyncSchedule: input.ga4SyncSchedule ?? '0 2 * * *',
        n8nSyncEnabled: input.n8nSyncEnabled ?? true,
        n8nSyncSchedule: input.n8nSyncSchedule ?? '*/5 * * * *',
        cleanupSyncEnabled: input.cleanupSyncEnabled ?? true,
        cleanupSyncSchedule: input.cleanupSyncSchedule ?? '0 3 * * 0',
        retryConfig: input.retryConfig ?? {
          maxRetries: 3,
          initialDelay: 60000,
          maxDelay: 3600000,
          backoffMultiplier: 2
        },
        alerting: input.alerting ?? {
          enabled: false,
          emailRecipients: []
        }
      }
    });

    return {
      ...syncConfig,
      retryConfig: syncConfig.retryConfig as {
        maxRetries: number;
        initialDelay: number;
        maxDelay: number;
        backoffMultiplier: number;
      },
      alerting: syncConfig.alerting as {
        enabled: boolean;
        emailRecipients: string[];
      }
    };
  }

  async getSyncConfig(businessEntityId: string): Promise<SyncConfig | null> {
    const syncConfig = await this.prisma.syncConfig.findUnique({
      where: { businessEntityId }
    });

    if (!syncConfig) return null;

    return {
      ...syncConfig,
      retryConfig: syncConfig.retryConfig as {
        maxRetries: number;
        initialDelay: number;
        maxDelay: number;
        backoffMultiplier: number;
      },
      alerting: syncConfig.alerting as {
        enabled: boolean;
        emailRecipients: string[];
      }
    };
  }

  async getAllSyncConfigs(): Promise<SyncConfig[]> {
    const syncConfigs = await this.prisma.syncConfig.findMany();

    return syncConfigs.map(config => ({
      ...config,
      retryConfig: config.retryConfig as {
        maxRetries: number;
        initialDelay: number;
        maxDelay: number;
        backoffMultiplier: number;
      },
      alerting: config.alerting as {
        enabled: boolean;
        emailRecipients: string[];
      }
    }));
  }

  async updateSyncConfig(businessEntityId: string, update: SyncConfigUpdate): Promise<SyncConfig> {
    const syncConfig = await this.prisma.syncConfig.update({
      where: { businessEntityId },
      data: update
    });

    // Restart cron jobs if schedules changed
    if (update.ga4SyncSchedule || update.n8nSyncSchedule || update.cleanupSyncSchedule) {
      const updatedConfig = await this.getSyncConfig(businessEntityId);
      if (updatedConfig) {
        await this.startCronJobs(updatedConfig);
      }
    }

    return {
      ...syncConfig,
      retryConfig: syncConfig.retryConfig as {
        maxRetries: number;
        initialDelay: number;
        maxDelay: number;
        backoffMultiplier: number;
      },
      alerting: syncConfig.alerting as {
        enabled: boolean;
        emailRecipients: string[];
      }
    };
  }

  async triggerManualSync(businessEntityId: string, request: ManualSyncRequest): Promise<ManualSyncResponse> {
    const syncJob = await this.createSyncJob({
      businessEntityId,
      jobType: request.jobType,
      metadata: {
        ...request.metadata,
        manualTrigger: true
      }
    });

    // Execute the sync immediately
    try {
      switch (request.jobType) {
        case 'ga4_daily':
          await this.executeGA4DailySync(businessEntityId);
          break;
        case 'n8n_realtime':
          await this.executeN8nSync(businessEntityId);
          break;
        case 'cleanup':
          await this.executeCleanupSync(businessEntityId);
          break;
        default:
          throw new Error(`Unsupported job type: ${request.jobType}`);
      }

      return {
        success: true,
        syncJobId: syncJob.id,
        message: `Manual sync for ${request.jobType} completed successfully`
      };
    } catch (error) {
      return {
        success: false,
        syncJobId: syncJob.id,
        message: `Manual sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async getSyncHealth(businessEntityId: string): Promise<SyncHealthResponse> {
    const stats = await this.getSyncJobStats(businessEntityId);
    const config = await this.getSyncConfig(businessEntityId);

    const issues: string[] = [];
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    // Check for failed jobs
    if (stats.failedJobs > 0) {
      issues.push(`${stats.failedJobs} failed sync jobs`);
      status = 'degraded';
    }

    // Check for running jobs
    if (stats.runningJobs > 5) {
      issues.push('Too many running sync jobs');
      status = 'degraded';
    }

    // Check success rate
    if (stats.successRate < 90) {
      issues.push(`Low success rate: ${stats.successRate.toFixed(1)}%`);
      status = 'unhealthy';
    }

    // Check if cron jobs are running
    if (config) {
      const expectedJobs = [
        config.ga4SyncEnabled ? 'ga4' : null,
        config.n8nSyncEnabled ? 'n8n' : null,
        config.cleanupSyncEnabled ? 'cleanup' : null
      ].filter(Boolean).length;

      const actualJobs = Array.from(this.cronJobs.keys())
        .filter(key => key.startsWith(businessEntityId))
        .length;

      if (actualJobs < expectedJobs) {
        issues.push('Some cron jobs are not running');
        status = 'degraded';
      }
    }

    return {
      status,
      lastSyncAt: stats.lastSyncAt,
      activeJobs: stats.runningJobs,
      failedJobs: stats.failedJobs,
      averageSyncTime: stats.averageDuration,
      successRate: stats.successRate,
      issues
    };
  }

  async shutdown(): Promise<void> {
    logger.info('Shutting down DataSyncService...');
    
    // Stop all cron jobs
    for (const [key, job] of this.cronJobs) {
      job.stop();
      logger.info(`Stopped cron job: ${key}`);
    }
    this.cronJobs.clear();
    
    this.isInitialized = false;
    logger.info('DataSyncService shutdown complete');
  }
}
