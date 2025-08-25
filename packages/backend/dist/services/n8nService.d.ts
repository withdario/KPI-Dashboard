import { PrismaClient } from '@prisma/client';
import { N8nWebhookPayload, N8nWebhookValidationResult, N8nWebhookProcessingResult, N8nMetrics, N8nIntegration } from '../types/n8n';
export declare class N8nService {
    private prisma;
    constructor(prismaClient?: PrismaClient);
    validateWebhookPayload(payload: any): Promise<N8nWebhookValidationResult>;
    processWebhookEvent(integrationId: string, payload: N8nWebhookPayload): Promise<N8nWebhookProcessingResult>;
    private updateIntegrationStats;
    calculateMetrics(integrationId: string): Promise<N8nMetrics>;
    getIntegrationById(integrationId: string): Promise<N8nIntegration | null>;
    getIntegrationByBusinessEntity(businessEntityId: string): Promise<N8nIntegration | null>;
    createIntegration(data: {
        businessEntityId: string;
        webhookUrl: string;
        webhookToken: string;
    }): Promise<N8nIntegration | null>;
    updateIntegration(integrationId: string, data: Partial<Pick<N8nIntegration, 'webhookUrl' | 'webhookToken' | 'isActive'>>): Promise<N8nIntegration | null>;
    getWebhookEvents(integrationId: string, limit?: number, offset?: number): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        errorMessage: string | null;
        duration: number | null;
        workflowId: string;
        workflowName: string;
        executionId: string;
        eventType: string;
        startTime: Date;
        endTime: Date | null;
        inputData: import("@prisma/client/runtime/library").JsonValue;
        outputData: import("@prisma/client/runtime/library").JsonValue;
        n8nIntegrationId: string;
    }[]>;
    private isValidEventType;
    private isValidStatus;
    private isValidTimestamp;
    private convertN8nPayload;
    private mapN8nStatus;
}
//# sourceMappingURL=n8nService.d.ts.map