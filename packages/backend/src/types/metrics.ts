// Types for Metrics Storage System

export interface Metric {
  id: string;
  businessEntityId: string;
  metricType: MetricType;
  metricName: string;
  metricValue: number;
  metricUnit?: string;
  source: MetricSource;
  sourceId?: string;
  date: Date;
  timezone: string;
  metadata: Record<string, any>;
  tags: string[];
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AutomationExecution {
  id: string;
  businessEntityId: string;
  automationType: AutomationType;
  automationName: string;
  executionId: string;
  status: AutomationStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  triggerType: TriggerType;
  triggerData: Record<string, any>;
  inputData: Record<string, any>;
  outputData: Record<string, any>;
  errorMessage?: string;
  errorCode?: string;
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: Date;
  metadata: Record<string, any>;
  tags: string[];
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DataArchive {
  id: string;
  businessEntityId: string;
  archiveType: ArchiveType;
  sourceTable: string;
  sourceRecordId: string;
  archivedData: Record<string, any>;
  archiveDate: Date;
  retentionPolicy: string;
  compressionRatio?: number;
  storageLocation?: string;
  isRestorable: boolean;
  createdAt: Date;
}

// Enums
export enum MetricType {
  GA4_PAGEVIEW = 'ga4_pageview',
  GA4_SESSION = 'ga4_session',
  GA4_USER = 'ga4_user',
  N8N_WORKFLOW_EXECUTION = 'n8n_workflow_execution',
  CUSTOM = 'custom'
}

export enum MetricSource {
  GOOGLE_ANALYTICS = 'google_analytics',
  N8N = 'n8n',
  CUSTOM = 'custom'
}

export enum AutomationType {
  N8N_WORKFLOW = 'n8n_workflow',
  ZAPIER_AUTOMATION = 'zapier_automation',
  CUSTOM_SCRIPT = 'custom_script'
}

export enum AutomationStatus {
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PENDING = 'pending'
}

export enum TriggerType {
  SCHEDULED = 'scheduled',
  MANUAL = 'manual',
  WEBHOOK = 'webhook',
  EVENT_BASED = 'event_based'
}

export enum ArchiveType {
  METRICS = 'metrics',
  AUTOMATION_EXECUTIONS = 'automation_executions',
  WEBHOOK_EVENTS = 'webhook_events'
}

// Input types for creating/updating
export interface CreateMetricInput {
  businessEntityId: string;
  metricType: MetricType;
  metricName: string;
  metricValue: number;
  metricUnit?: string;
  source: MetricSource;
  sourceId?: string;
  date: Date;
  timezone?: string;
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface CreateAutomationExecutionInput {
  businessEntityId: string;
  automationType: AutomationType;
  automationName: string;
  executionId: string;
  status: AutomationStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  triggerType: TriggerType;
  triggerData?: Record<string, any>;
  inputData?: Record<string, any>;
  outputData?: Record<string, any>;
  errorMessage?: string;
  errorCode?: string;
  retryCount?: number;
  maxRetries?: number;
  nextRetryAt?: Date;
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface CreateDataArchiveInput {
  businessEntityId: string;
  archiveType: string;
  sourceTable: string;
  sourceRecordId: string;
  archivedData: Record<string, any>;
  archiveDate: Date;
  retentionPolicy: string;
  compressionRatio?: number;
  storageLocation?: string;
  isRestorable?: boolean;
}

// Query types
export interface MetricQuery {
  businessEntityId: string;
  metricType?: MetricType;
  source?: MetricSource;
  startDate?: Date;
  endDate?: Date;
  tags?: string[];
  isArchived?: boolean;
  limit?: number;
  offset?: number;
}

export interface AutomationExecutionQuery {
  businessEntityId: string;
  automationType?: AutomationType;
  status?: AutomationStatus;
  startDate?: Date;
  endDate?: Date;
  triggerType?: TriggerType;
  isArchived?: boolean;
  limit?: number;
  offset?: number;
}

export interface DataArchiveQuery {
  businessEntityId: string;
  archiveType?: ArchiveType;
  sourceTable?: string;
  startDate?: Date;
  endDate?: Date;
  isRestorable?: boolean;
  limit?: number;
  offset?: number;
}

// Response types
export interface MetricsResponse {
  metrics: Metric[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface AutomationExecutionsResponse {
  executions: AutomationExecution[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface DataArchivesResponse {
  archives: DataArchive[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
