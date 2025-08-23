"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.N8nService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class N8nService {
    async validateWebhookPayload(payload) {
        const errors = [];
        const warnings = [];
        if (!payload.workflowId) {
            errors.push('workflowId is required');
        }
        if (!payload.workflowName) {
            errors.push('workflowName is required');
        }
        if (!payload.executionId) {
            errors.push('executionId is required');
        }
        if (!payload.eventType) {
            errors.push('eventType is required');
        }
        if (!payload.status) {
            errors.push('status is required');
        }
        if (!payload.startTime) {
            errors.push('startTime is required');
        }
        if (payload.eventType && !this.isValidEventType(payload.eventType)) {
            errors.push(`Invalid eventType: ${payload.eventType}`);
        }
        if (payload.status && !this.isValidStatus(payload.status)) {
            errors.push(`Invalid status: ${payload.status}`);
        }
        if (payload.startTime && !this.isValidDate(payload.startTime)) {
            errors.push('Invalid startTime format');
        }
        if (payload.endTime && !this.isValidDate(payload.endTime)) {
            errors.push('Invalid endTime format');
        }
        if (payload.duration && typeof payload.duration !== 'number') {
            errors.push('duration must be a number');
        }
        if (!payload.inputData) {
            warnings.push('inputData is missing (optional but recommended)');
        }
        if (!payload.outputData) {
            warnings.push('outputData is missing (optional but recommended)');
        }
        const isValid = errors.length === 0;
        return {
            isValid,
            errors,
            warnings,
            payload: isValid ? payload : undefined
        };
    }
    async processWebhookEvent(integrationId, payload) {
        try {
            let duration = payload.duration;
            if (!duration && payload.endTime) {
                const startTime = new Date(payload.startTime);
                const endTime = new Date(payload.endTime);
                duration = endTime.getTime() - startTime.getTime();
            }
            const event = await prisma.n8nWebhookEvent.create({
                data: {
                    n8nIntegrationId: integrationId,
                    workflowId: payload.workflowId,
                    workflowName: payload.workflowName,
                    executionId: payload.executionId,
                    eventType: payload.eventType,
                    status: payload.status,
                    startTime: new Date(payload.startTime),
                    endTime: payload.endTime ? new Date(payload.endTime) : null,
                    duration: duration || null,
                    inputData: payload.inputData || {},
                    outputData: payload.outputData || {},
                    errorMessage: payload.errorMessage || null,
                    metadata: payload.metadata || {}
                }
            });
            await this.updateIntegrationStats(integrationId);
            const metrics = await this.calculateMetrics(integrationId);
            return {
                success: true,
                eventId: event.id,
                metrics
            };
        }
        catch (error) {
            console.error('Error processing n8n webhook event:', error);
            return {
                success: false,
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async updateIntegrationStats(integrationId) {
        try {
            const stats = await prisma.n8nWebhookEvent.groupBy({
                by: ['n8nIntegrationId'],
                where: { n8nIntegrationId: integrationId },
                _count: { id: true },
                _max: { createdAt: true }
            });
            if (stats.length > 0) {
                await prisma.n8nIntegration.update({
                    where: { id: integrationId },
                    data: {
                        webhookCount: stats[0]._count.id,
                        lastWebhookAt: stats[0]._max.createdAt || new Date(),
                        lastErrorAt: null,
                        errorMessage: null
                    }
                });
            }
        }
        catch (error) {
            console.error('Error updating integration stats:', error);
        }
    }
    async calculateMetrics(integrationId) {
        try {
            const events = await prisma.n8nWebhookEvent.findMany({
                where: { n8nIntegrationId: integrationId },
                orderBy: { createdAt: 'desc' },
                take: 1000
            });
            if (events.length === 0) {
                return {
                    totalWorkflows: 0,
                    successfulWorkflows: 0,
                    failedWorkflows: 0,
                    averageExecutionTime: 0,
                    totalTimeSaved: 0,
                    successRate: 0
                };
            }
            const totalWorkflows = events.length;
            const successfulWorkflows = events.filter((e) => e.status === 'completed').length;
            const failedWorkflows = events.filter((e) => e.status === 'failed').length;
            const completedEvents = events.filter((e) => e.duration && e.status === 'completed');
            const averageExecutionTime = completedEvents.length > 0
                ? completedEvents.reduce((sum, e) => sum + (e.duration || 0), 0) / completedEvents.length
                : 0;
            const totalTimeSaved = completedEvents.reduce((sum, e) => sum + (e.duration || 0), 0);
            const successRate = (successfulWorkflows / totalWorkflows) * 100;
            return {
                totalWorkflows,
                successfulWorkflows,
                failedWorkflows,
                averageExecutionTime,
                totalTimeSaved,
                successRate,
                lastExecutionAt: events[0]?.createdAt
            };
        }
        catch (error) {
            console.error('Error calculating metrics:', error);
            throw error;
        }
    }
    async getIntegration(integrationId) {
        try {
            return await prisma.n8nIntegration.findUnique({
                where: { id: integrationId }
            });
        }
        catch (error) {
            console.error('Error getting n8n integration:', error);
            throw error;
        }
    }
    async getIntegrationByBusinessEntity(businessEntityId) {
        try {
            return await prisma.n8nIntegration.findFirst({
                where: {
                    businessEntityId,
                    isActive: true
                }
            });
        }
        catch (error) {
            console.error('Error getting n8n integration by business entity:', error);
            throw error;
        }
    }
    async createIntegration(data) {
        try {
            return await prisma.n8nIntegration.create({
                data: {
                    businessEntityId: data.businessEntityId,
                    webhookUrl: data.webhookUrl,
                    webhookToken: data.webhookToken,
                    isActive: true
                }
            });
        }
        catch (error) {
            console.error('Error creating n8n integration:', error);
            throw error;
        }
    }
    async updateIntegration(integrationId, data) {
        try {
            return await prisma.n8nIntegration.update({
                where: { id: integrationId },
                data: {
                    ...data,
                    updatedAt: new Date()
                }
            });
        }
        catch (error) {
            console.error('Error updating n8n integration:', error);
            throw error;
        }
    }
    async getWebhookEvents(integrationId, limit = 100, offset = 0) {
        try {
            return await prisma.n8nWebhookEvent.findMany({
                where: { n8nIntegrationId: integrationId },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset
            });
        }
        catch (error) {
            console.error('Error getting webhook events:', error);
            throw error;
        }
    }
    isValidEventType(eventType) {
        const validTypes = [
            'workflow_started', 'workflow_completed', 'workflow_failed', 'workflow_cancelled',
            'node_started', 'node_completed', 'node_failed',
            'execution_started', 'execution_completed', 'execution_failed'
        ];
        return validTypes.includes(eventType);
    }
    isValidStatus(status) {
        const validStatuses = [
            'running', 'completed', 'failed', 'cancelled', 'waiting', 'error'
        ];
        return validStatuses.includes(status);
    }
    isValidDate(dateString) {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    }
}
exports.N8nService = N8nService;
//# sourceMappingURL=n8nService.js.map