import { PrismaClient } from '@prisma/client';
import { N8nWebhookPayload, N8nWebhookValidationResult, N8nWebhookProcessingResult, N8nMetrics, N8nIntegration } from '../types/n8n';
export declare class N8nService {
    private prisma;
    constructor(prismaClient?: PrismaClient);
    /**
     * Validate webhook payload structure and data
     */
    validateWebhookPayload(payload: any): Promise<N8nWebhookValidationResult>;
    /**
     * Process and store webhook event
     */
    processWebhookEvent(integrationId: string, payload: N8nWebhookPayload): Promise<N8nWebhookProcessingResult>;
    /**
     * Update integration statistics
     */
    private updateIntegrationStats;
    /**
     * Calculate metrics for an integration
     */
    calculateMetrics(integrationId: string): Promise<N8nMetrics>;
    /**
     * Get integration by ID
     */
    getIntegrationById(integrationId: string): Promise<N8nIntegration | null>;
    /**
     * Get integration by business entity ID
     */
    getIntegrationByBusinessEntity(businessEntityId: string): Promise<N8nIntegration | null>;
    /**
     * Create new integration
     */
    createIntegration(data: {
        businessEntityId: string;
        webhookUrl: string;
        webhookToken: string;
    }): Promise<N8nIntegration | null>;
    /**
     * Update integration
     */
    updateIntegration(integrationId: string, data: Partial<Pick<N8nIntegration, 'webhookUrl' | 'webhookToken' | 'isActive'>>): Promise<N8nIntegration | null>;
    /**
     * Get webhook events for an integration
     */
    getWebhookEvents(integrationId: string, limit?: number, offset?: number): Promise<{
        status: string;
        id: string;
        createdAt: Date;
        startTime: Date;
        endTime: Date | null;
        duration: number | null;
        errorMessage: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        executionId: string;
        inputData: import("@prisma/client/runtime/library").JsonValue;
        outputData: import("@prisma/client/runtime/library").JsonValue;
        workflowId: string;
        workflowName: string;
        eventType: string;
        n8nIntegrationId: string;
    }[]>;
    /**
     * Validate event type
     */
    private isValidEventType;
    /**
     * Validate status
     */
    private isValidStatus;
    /**
     * Validate timestamp string (ISO 8601)
     */
    private isValidTimestamp;
    /**
     * Convert actual n8n payload format to our expected format
     */
    private convertN8nPayload;
    /**
     * Map n8n status to our workflow status
     */
    private mapN8nStatus;
}
//# sourceMappingURL=n8nService.d.ts.map