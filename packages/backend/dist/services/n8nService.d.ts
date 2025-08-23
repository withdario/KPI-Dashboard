import { N8nWebhookPayload, N8nWebhookValidationResult, N8nWebhookProcessingResult, N8nMetrics, N8nIntegration } from '../types/n8n';
export declare class N8nService {
    validateWebhookPayload(payload: any): Promise<N8nWebhookValidationResult>;
    processWebhookEvent(integrationId: string, payload: N8nWebhookPayload): Promise<N8nWebhookProcessingResult>;
    private updateIntegrationStats;
    calculateMetrics(integrationId: string): Promise<N8nMetrics>;
    getIntegration(integrationId: string): Promise<N8nIntegration | null>;
    getIntegrationByBusinessEntity(businessEntityId: string): Promise<N8nIntegration | null>;
    createIntegration(data: {
        businessEntityId: string;
        webhookUrl: string;
        webhookToken: string;
    }): Promise<N8nIntegration>;
    updateIntegration(integrationId: string, data: Partial<Pick<N8nIntegration, 'webhookUrl' | 'webhookToken' | 'isActive'>>): Promise<N8nIntegration>;
    getWebhookEvents(integrationId: string, limit?: number, offset?: number): Promise<{
        id: string;
        createdAt: Date;
        errorMessage: string | null;
        workflowId: string;
        workflowName: string;
        executionId: string;
        eventType: string;
        status: string;
        startTime: Date;
        endTime: Date | null;
        duration: number | null;
        inputData: import("@prisma/client/runtime/library").JsonValue;
        outputData: import("@prisma/client/runtime/library").JsonValue;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        n8nIntegrationId: string;
    }[]>;
    private isValidEventType;
    private isValidStatus;
    private isValidDate;
}
//# sourceMappingURL=n8nService.d.ts.map