// Data Synchronization Types

// Sync Job Types
export interface SyncJob {
  id: string;
  businessEntityId: string;
  jobType: 'ga4_daily' | 'n8n_realtime' | 'manual' | 'cleanup';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime: Date | null;
  duration: number | null; // Duration in milliseconds
  errorMessage: string | null;
  errorCode: string | null;
  retryCount: number;
  maxRetries: number;
  nextRetryAt: Date | null;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncJobInput {
  businessEntityId: string;
  jobType: 'ga4_daily' | 'n8n_realtime' | 'manual' | 'cleanup';
  metadata?: Record<string, any>;
}

export interface SyncJobUpdate {
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  endTime?: Date;
  duration?: number;
  errorMessage?: string;
  errorCode?: string;
  retryCount?: number;
  nextRetryAt?: Date;
  metadata?: Record<string, any>;
}

export interface SyncJobQuery {
  businessEntityId?: string;
  jobType?: 'ga4_daily' | 'n8n_realtime' | 'manual' | 'cleanup';
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  limit?: number;
  offset?: number;
}

export interface SyncJobResponse {
  syncJobs: SyncJob[];
  total: number;
  limit: number;
  offset: number;
}

export interface SyncJobStats {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  runningJobs: number;
  pendingJobs: number;
  averageDuration: number;
  successRate: number;
  lastSyncAt: Date | null;
}

// Sync Configuration Types
export interface SyncConfig {
  id: string;
  businessEntityId: string;
  ga4SyncEnabled: boolean;
  ga4SyncSchedule: string; // Cron expression
  n8nSyncEnabled: boolean;
  n8nSyncSchedule: string; // Cron expression
  cleanupSyncEnabled: boolean;
  cleanupSyncSchedule: string; // Cron expression
  retryConfig: {
    maxRetries: number;
    initialDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
  };
  alerting: {
    enabled: boolean;
    emailRecipients: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncConfigInput {
  businessEntityId: string;
  ga4SyncEnabled?: boolean;
  ga4SyncSchedule?: string;
  n8nSyncEnabled?: boolean;
  n8nSyncSchedule?: string;
  cleanupSyncEnabled?: boolean;
  cleanupSyncSchedule?: string;
  retryConfig?: {
    maxRetries: number;
    initialDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
  };
  alerting?: {
    enabled: boolean;
    emailRecipients: string[];
  };
}

export interface SyncConfigUpdate {
  ga4SyncEnabled?: boolean;
  ga4SyncSchedule?: string;
  n8nSyncEnabled?: boolean;
  n8nSyncSchedule?: string;
  cleanupSyncEnabled?: boolean;
  cleanupSyncSchedule?: string;
  retryConfig?: {
    maxRetries: number;
    initialDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
  };
  alerting?: {
    enabled: boolean;
    emailRecipients: string[];
  };
}

// Manual Sync Types
export interface ManualSyncRequest {
  businessEntityId: string;
  jobType: 'ga4_daily' | 'n8n_realtime' | 'cleanup';
  metadata?: Record<string, any>;
}

export interface ManualSyncResponse {
  success: boolean;
  syncJobId: string;
  message: string;
}

// Sync Health Types
export interface SyncHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastSyncAt: Date | null;
  activeJobs: number;
  failedJobs: number;
  averageSyncTime: number;
  successRate: number;
  issues: string[];
}
