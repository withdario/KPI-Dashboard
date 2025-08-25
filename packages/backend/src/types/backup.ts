export interface BackupConfig {
  id: string;
  businessEntityId: string;
  backupType: BackupType;
  schedule: string; // Cron expression
  retentionDays: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  encryptionKey?: string;
  storageLocation: StorageLocation;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BackupJob {
  id: string;
  businessEntityId: string;
  backupConfigId: string;
  status: BackupStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number; // Duration in milliseconds
  fileSize?: number; // Size in bytes
  filePath?: string;
  checksum?: string;
  errorMessage?: string;
  errorCode?: string;
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BackupVerification {
  id: string;
  backupJobId: string;
  status: VerificationStatus;
  verificationType: VerificationType;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  checksumVerified: boolean;
  integrityVerified: boolean;
  restoreTested: boolean;
  errorMessage?: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface RecoveryJob {
  id: string;
  businessEntityId: string;
  backupJobId: string;
  status: RecoveryStatus;
  recoveryType: RecoveryType;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  targetLocation: string;
  recoveredRecords?: number;
  errorMessage?: string;
  errorCode?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface DisasterRecoveryPlan {
  id: string;
  businessEntityId: string;
  planName: string;
  description: string;
  rto: number; // Recovery Time Objective in minutes
  rpo: number; // Recovery Point Objective in minutes
  procedures: RecoveryProcedure[];
  contacts: RecoveryContact[];
  isActive: boolean;
  lastTestedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecoveryProcedure {
  id: string;
  stepNumber: number;
  description: string;
  action: string;
  expectedOutcome: string;
  estimatedDuration: number; // in minutes
  dependencies: string[];
  rollbackSteps: string[];
}

export interface RecoveryContact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  escalationLevel: number;
  isPrimary: boolean;
}

export interface BackupMetrics {
  totalBackups: number;
  successfulBackups: number;
  failedBackups: number;
  totalSize: number; // in bytes
  averageDuration: number; // in milliseconds
  successRate: number; // percentage
  lastBackupAt?: Date;
  nextScheduledBackup?: Date;
}

export interface RecoveryMetrics {
  totalRecoveries: number;
  successfulRecoveries: number;
  failedRecoveries: number;
  averageRecoveryTime: number; // in minutes
  rtoCompliance: number; // percentage
  rpoCompliance: number; // percentage
  lastRecoveryAt?: Date;
}

export type BackupType = 
  | 'database_full'
  | 'database_incremental'
  | 'file_system'
  | 'application_data'
  | 'configuration'
  | 'logs';

export type BackupStatus = 
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'verifying';

export type VerificationStatus = 
  | 'pending'
  | 'running'
  | 'passed'
  | 'failed'
  | 'cancelled';

export type VerificationType = 
  | 'checksum'
  | 'integrity'
  | 'restore_test'
  | 'full_verification';

export type RecoveryStatus = 
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'verifying';

export type RecoveryType = 
  | 'full_restore'
  | 'point_in_time'
  | 'selective_restore'
  | 'disaster_recovery';

export type StorageLocation = 
  | 'local'
  | 's3'
  | 'gcs'
  | 'azure_blob'
  | 'ftp'
  | 'sftp';

export interface CreateBackupConfigRequest {
  businessEntityId: string;
  backupType: BackupType;
  schedule: string;
  retentionDays: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  encryptionKey?: string;
  storageLocation: StorageLocation;
}

export interface UpdateBackupConfigRequest {
  schedule?: string;
  retentionDays?: number;
  compressionEnabled?: boolean;
  encryptionEnabled?: boolean;
  encryptionKey?: string;
  storageLocation?: StorageLocation;
  isActive?: boolean;
}

export interface CreateBackupJobRequest {
  businessEntityId: string;
  backupConfigId: string;
  metadata?: Record<string, any>;
}

export interface CreateRecoveryJobRequest {
  businessEntityId: string;
  backupJobId: string;
  recoveryType: RecoveryType;
  targetLocation: string;
  metadata?: Record<string, any>;
}

export interface BackupFilter {
  businessEntityId?: string;
  backupType?: BackupType;
  status?: BackupStatus;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface RecoveryFilter {
  businessEntityId?: string;
  status?: RecoveryStatus;
  recoveryType?: RecoveryType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}
