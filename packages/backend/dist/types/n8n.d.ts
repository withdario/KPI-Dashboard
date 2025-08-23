export interface N8nWebhookPayload {
    workflowId: string;
    workflowName: string;
    executionId: string;
    eventType: N8nEventType;
    status: N8nWorkflowStatus;
    startTime: string;
    endTime?: string;
    duration?: number;
    inputData?: Record<string, any>;
    outputData?: Record<string, any>;
    errorMessage?: string;
    metadata?: {
        tags?: string[];
        notes?: string;
        priority?: string;
        category?: string;
        [key: string]: any;
    };
    nodeId?: string;
    nodeName?: string;
    retryCount?: number;
    source?: string;
}
export type N8nEventType = 'workflow_started' | 'workflow_completed' | 'workflow_failed' | 'workflow_cancelled' | 'node_started' | 'node_completed' | 'node_failed' | 'execution_started' | 'execution_completed' | 'execution_failed';
export type N8nWorkflowStatus = 'running' | 'completed' | 'failed' | 'cancelled' | 'waiting' | 'error';
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
    totalTimeSaved: number;
    successRate: number;
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
//# sourceMappingURL=n8n.d.ts.map