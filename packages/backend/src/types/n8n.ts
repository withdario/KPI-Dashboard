/**
 * n8n Webhook Integration Types
 * Defines the structure for n8n webhook data and integration management
 */

// Actual n8n payload format being sent
export interface N8nActualPayload {
  ExecutionID: string;
  Status: string;
  Timestamp: string;
  LeadsGenerated?: number;
  IndustryBreakdown?: Record<string, number>;
  [key: string]: any; // Allow additional fields
}

export interface N8nWebhookPayload {
  // Core workflow information
  workflowId: string;
  workflowName: string;
  executionId: string;
  eventType: N8nEventType;
  status: N8nWorkflowStatus;
  
  // Timing information
  startTime: string; // ISO 8601 timestamp
  endTime?: string;  // ISO 8601 timestamp (optional for running workflows)
  duration?: number; // Duration in milliseconds
  
  // Data payloads
  inputData?: Record<string, any>;
  outputData?: Record<string, any>;
  errorMessage?: string;
  
  // Metadata
  metadata?: {
    tags?: string[];
    notes?: string;
    priority?: string;
    category?: string;
    [key: string]: any;
  };
  
  // n8n specific fields
  nodeId?: string;
  nodeName?: string;
  retryCount?: number;
  source?: string;
}

export type N8nEventType = 
  | 'workflow_started'
  | 'workflow_completed'
  | 'workflow_failed'
  | 'workflow_cancelled'
  | 'node_started'
  | 'node_completed'
  | 'node_failed'
  | 'execution_started'
  | 'execution_completed'
  | 'execution_failed';

export type N8nWorkflowStatus = 
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'waiting'
  | 'error';

export interface N8nIntegration {
  id: string;
  businessEntityId: string;
  webhookUrl: string;
  webhookToken: string;
  isActive: boolean;
  lastWebhookAt: Date | null;
  webhookCount: number;
  lastErrorAt: Date | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface N8nWebhookEvent {
  id: string;
  n8nIntegrationId: string;
  workflowId: string;
  workflowName: string;
  executionId: string;
  eventType: N8nEventType;
  status: N8nWorkflowStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  inputData?: Record<string, any>;
  outputData?: Record<string, any>;
  errorMessage?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface N8nWebhookRequest {
  headers: {
    'x-n8n-signature'?: string;
    'x-n8n-timestamp'?: string;
    'user-agent'?: string;
    [key: string]: string | undefined;
  };
  body: N8nWebhookPayload;
  ip: string;
}

export interface N8nMetrics {
  totalWorkflows: number;
  successfulWorkflows: number;
  failedWorkflows: number;
  averageExecutionTime: number;
  totalTimeSaved: number; // in milliseconds
  successRate: number; // percentage
  lastExecutionAt?: Date;
}

export interface N8nWebhookValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  payload?: N8nWebhookPayload;
}

export interface N8nWebhookProcessingResult {
  success: boolean;
  eventId?: string;
  errors?: string[];
  metrics?: N8nMetrics;
}
