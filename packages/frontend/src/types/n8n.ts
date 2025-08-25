/**
 * n8n Automation Types
 * Frontend interfaces for n8n automation data and dashboard components
 */

export interface N8nWorkflowStatus {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled' | 'waiting' | 'error';
  executionId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  successRate: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  timeSaved: number;
  lastRun: string;
  metadata?: {
    category?: string;
    priority?: string;
    tags?: string[];
    description?: string;
  };
}

export interface N8nExecutionMetrics {
  totalWorkflows: number;
  activeWorkflows: number;
  successfulWorkflows: number;
  failedWorkflows: number;
  averageExecutionTime: number;
  totalTimeSaved: number;
  successRate: number;
  lastExecutionAt?: string;
  monthlyTrends: {
    month: string;
    executions: number;
    successRate: number;
    timeSaved: number;
  }[];
}

export interface N8nWorkflowEvent {
  id: string;
  workflowId: string;
  workflowName: string;
  executionId: string;
  eventType: 'workflow_started' | 'workflow_completed' | 'workflow_failed' | 'workflow_cancelled';
  status: 'running' | 'completed' | 'failed' | 'cancelled' | 'waiting' | 'error';
  startTime: string;
  endTime?: string;
  duration?: number;
  inputData?: Record<string, any>;
  outputData?: Record<string, any>;
  errorMessage?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface N8nIntegration {
  id: string;
  businessEntityId: string;
  webhookUrl: string;
  isActive: boolean;
  lastWebhookAt?: string;
  webhookCount: number;
  lastErrorAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface N8nPerformanceAlert {
  id: string;
  workflowId: string;
  workflowName: string;
  alertType: 'success_rate_drop' | 'execution_time_increase' | 'failure_spike' | 'workflow_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold: number;
  currentValue: number;
  triggeredAt: string;
  isResolved: boolean;
  resolvedAt?: string;
}

export interface N8nROICalculation {
  workflowId: string;
  workflowName: string;
  timeSavedPerExecution: number;
  totalExecutions: number;
  totalTimeSaved: number;
  estimatedCostSavings: number;
  automationCost: number;
  roi: number;
  paybackPeriod: number;
}

export interface N8nDashboardFilters {
  dateRange: {
    start: string;
    end: string;
  };
  status?: string[];
  category?: string[];
  priority?: string[];
  search?: string;
}

export interface N8nExportData {
  workflows: N8nWorkflowStatus[];
  metrics: N8nExecutionMetrics;
  events: N8nWorkflowEvent[];
  alerts: N8nPerformanceAlert[];
  roi: N8nROICalculation[];
  exportDate: string;
  dateRange: {
    start: string;
    end: string;
  };
}
