// Data Processing Pipeline Types

export interface RawMetricsData {
  source: 'google-analytics' | 'n8n';
  businessEntityId: string;
  timestamp: Date;
  data: any;
  metadata?: any;
}

export interface BusinessMetrics {
  businessEntityId: string;
  date: string; // YYYY-MM-DD format
  source: 'google-analytics' | 'n8n';
  metricType: string;
  value: number;
  unit?: string;
  metadata?: any;
}

export interface DataQualityCheck {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  dataSource: string;
  timestamp: Date;
}

export interface ProcessingPipelineResult {
  success: boolean;
  processedRecords: number;
  errors: string[];
  warnings: string[];
  processingTime: number;
  dataQuality: DataQualityCheck;
}

// Google Analytics specific types
export interface GoogleAnalyticsRawData {
  propertyId: string;
  sessions?: string | number;
  users?: string | number;
  pageviews?: string | number;
  conversions?: string | number;
  revenue?: string | number;
  bounceRate?: string | number;
  sessionDuration?: string | number;
  [key: string]: any;
}

export interface GoogleAnalyticsMetrics extends BusinessMetrics {
  source: 'google-analytics';
  metricType: 'sessions' | 'users' | 'pageviews' | 'conversions' | 'revenue' | 'bounceRate' | 'sessionDuration';
}

// n8n specific types
export interface N8nRawData {
  workflowId: string;
  workflowName: string;
  executionId: string;
  eventType: 'workflow_started' | 'workflow_completed' | 'workflow_failed' | 'workflow_cancelled';
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: string | Date;
  endTime?: string | Date;
  duration?: number; // Duration in milliseconds
  inputData?: any;
  outputData?: any;
  errorMessage?: string;
  metadata?: any;
}

export interface N8nMetrics extends BusinessMetrics {
  source: 'n8n';
  metricType: 'workflow_executions' | 'workflow_duration' | 'workflow_successes' | 'workflow_failures';
}

// Data aggregation types
export type AggregationPeriod = 'daily' | 'weekly' | 'monthly';

export interface AggregationRequest {
  businessEntityId: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  aggregationPeriod?: AggregationPeriod;
}

export interface AggregatedMetrics {
  businessEntityId: string;
  period: AggregationPeriod;
  startDate: Date;
  endDate: Date;
  metrics: BusinessMetrics[];
  totals: {
    [metricType: string]: number;
  };
  averages: {
    [metricType: string]: number;
  };
}

// Pipeline monitoring types
export interface PipelineStats {
  businessEntityId: string;
  totalProcessedRecords: number;
  successfulProcessing: number;
  failedProcessing: number;
  averageProcessingTime: number;
  lastProcessedAt: Date | null;
  dataSources: string[];
  errorRate: number;
  throughput: number; // records per minute
}

export interface PipelineHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  service: string;
  version: string;
  components: {
    [componentName: string]: 'operational' | 'degraded' | 'down';
  };
  lastError?: string;
  uptime: number; // seconds
}

// Data lineage types
export interface DataLineage {
  id: string;
  sourceDataId: string;
  businessEntityId: string;
  source: string;
  timestamp: Date;
  transformationSteps: TransformationStep[];
  outputMetrics: string[]; // Array of metric IDs
  processingResult: ProcessingPipelineResult;
  metadata?: any;
}

export interface TransformationStep {
  stepNumber: number;
  stepName: string;
  inputData: any;
  outputData: any;
  timestamp: Date;
  duration: number; // milliseconds
  success: boolean;
  error?: string;
}

// Error handling types
export interface DataProcessingError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  businessEntityId?: string;
  source?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// API request/response types
export interface ProcessDataRequest {
  source: 'google-analytics' | 'n8n';
  businessEntityId: string;
  timestamp: string; // ISO date string
  data: any;
  metadata?: any;
}

export interface ProcessDataResponse {
  success: boolean;
  message: string;
  result: ProcessingPipelineResult;
}

export interface TransformDataResponse {
  success: boolean;
  message: string;
  metrics: BusinessMetrics[];
  count: number;
}

export interface ValidateDataResponse {
  success: boolean;
  message: string;
  qualityCheck: DataQualityCheck;
}

export interface AggregateMetricsResponse {
  success: boolean;
  message: string;
  aggregation: {
    businessEntityId: string;
    startDate: Date;
    endDate: Date;
    period: AggregationPeriod;
    metrics: BusinessMetrics[];
    count: number;
  };
}

export interface PipelineStatsResponse {
  success: boolean;
  message: string;
  stats: PipelineStats;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  service: string;
  version: string;
  components: {
    [componentName: string]: 'operational' | 'degraded' | 'down';
  };
  error?: string;
}

// Configuration types
export interface DataProcessingConfig {
  batchSize: number;
  maxRetries: number;
  retryDelay: number; // milliseconds
  timeout: number; // milliseconds
  enableDataLineage: boolean;
  enableQualityChecks: boolean;
  enableEnrichment: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

// Performance monitoring types
export interface PerformanceMetrics {
  processingTime: number; // milliseconds
  memoryUsage: number; // MB
  cpuUsage: number; // percentage
  throughput: number; // records per second
  latency: number; // milliseconds
  timestamp: Date;
}

// Data quality rules
export interface DataQualityRule {
  id: string;
  name: string;
  description: string;
  field: string;
  ruleType: 'required' | 'format' | 'range' | 'custom';
  validation: (value: any, data?: any) => boolean;
  errorMessage: string;
  severity: 'error' | 'warning';
}

export interface DataQualityReport {
  businessEntityId: string;
  timestamp: Date;
  source: string;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  qualityScore: number; // 0-100
  ruleViolations: {
    [ruleId: string]: {
      count: number;
      examples: any[];
    };
  };
  recommendations: string[];
}

// Data quality metrics
export interface DataQualityMetrics {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  qualityScore: number; // 0-100
  errorRate: number; // percentage
  warningRate: number; // percentage
  completenessScore: number; // 0-100
  accuracyScore: number; // 0-100
  consistencyScore: number; // 0-100
  timelinessScore: number; // 0-100
}

// Anomaly detection
export interface AnomalyDetectionResult {
  hasAnomalies: boolean;
  anomalies: Anomaly[];
  confidence: number; // 0-1
  recommendations: string[];
}

export interface Anomaly {
  type: 'outlier' | 'trend_change' | 'seasonal_break' | 'data_drift';
  metric: string;
  value: number;
  expectedRange: [number, number];
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
}

// Data quality alerts
export interface DataQualityAlert {
  id: string;
  businessEntityId: string;
  alertType: 'quality_threshold' | 'anomaly_detected' | 'validation_failure' | 'data_drift';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: any;
  timestamp: Date;
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}
