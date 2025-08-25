"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.N8nService = void 0;
const client_1 = require("@prisma/client");
class N8nService {
    prisma;
    constructor(prismaClient) {
        this.prisma = prismaClient || new client_1.PrismaClient();
    }
    /**
     * Validate webhook payload structure and data
     */
    async validateWebhookPayload(payload) {
        const errors = [];
        const warnings = [];
        // Check if this is the actual n8n payload format
        if (payload.ExecutionID && payload.Status && payload.Timestamp) {
            // This is the actual n8n format, convert it
            const convertedPayload = this.convertN8nPayload(payload);
            return {
                isValid: true,
                errors: [],
                warnings: ['Payload converted from n8n format'],
                payload: convertedPayload
            };
        }
        // Original validation logic for our expected format
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
        else if (!this.isValidEventType(payload.eventType)) {
            errors.push(`Invalid eventType: ${payload.eventType}`);
        }
        if (!payload.status) {
            errors.push('status is required');
        }
        else if (!this.isValidStatus(payload.status)) {
            errors.push(`Invalid status: ${payload.status}`);
        }
        if (!payload.startTime) {
            errors.push('startTime is required');
        }
        else if (!this.isValidTimestamp(payload.startTime)) {
            errors.push('Invalid startTime format (must be ISO 8601)');
        }
        // Validate duration if provided
        if (payload.duration !== undefined && typeof payload.duration !== 'number') {
            errors.push('duration must be a number');
        }
        // Optional field warnings
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
    /**
     * Process and store webhook event
     */
    async processWebhookEvent(integrationId, payload) {
        try {
            // Calculate duration if not provided
            let duration = payload.duration;
            if (!duration && payload.endTime) {
                const startTime = new Date(payload.startTime);
                const endTime = new Date(payload.endTime);
                duration = endTime.getTime() - startTime.getTime();
            }
            // Check if we're in development mode and database tables don't exist
            if (process.env.NODE_ENV === 'development') {
                try {
                    // Try to create webhook event record
                    const event = await this.prisma.n8nWebhookEvent.create({
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
                    // Update integration statistics
                    await this.updateIntegrationStats(integrationId);
                    // Calculate and return metrics
                    const metrics = await this.calculateMetrics(integrationId);
                    return {
                        success: true,
                        eventId: event.id,
                        metrics
                    };
                }
                catch (dbError) {
                    // In development mode, return success even if database operations fail
                    console.warn('Database operation failed in development mode, returning mock response:', dbError);
                    return {
                        success: true,
                        eventId: `dev-${Date.now()}`,
                        metrics: {
                            totalWorkflows: 1,
                            successfulWorkflows: 1,
                            failedWorkflows: 0,
                            averageExecutionTime: duration || 0,
                            totalTimeSaved: duration || 0,
                            successRate: 100
                        }
                    };
                }
            }
            else {
                // Production mode - proceed with normal database operations
                const event = await this.prisma.n8nWebhookEvent.create({
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
                // Update integration statistics
                await this.updateIntegrationStats(integrationId);
                // Calculate and return metrics
                const metrics = await this.calculateMetrics(integrationId);
                return {
                    success: true,
                    eventId: event.id,
                    metrics
                };
            }
        }
        catch (error) {
            console.error('Error processing n8n webhook event:', error);
            return {
                success: false,
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    /**
     * Update integration statistics
     */
    async updateIntegrationStats(integrationId) {
        try {
            const stats = await this.prisma.n8nWebhookEvent.groupBy({
                by: ['status'],
                where: { n8nIntegrationId: integrationId },
                _count: { status: true }
            });
            if (!stats || stats.length === 0) {
                // No events found, just update the last webhook time
                await this.prisma.n8nIntegration.update({
                    where: { id: integrationId },
                    data: {
                        lastWebhookAt: new Date()
                    }
                });
                return;
            }
            const totalEvents = stats.reduce((sum, stat) => sum + stat._count.status, 0);
            const successfulEvents = stats.find(stat => stat.status === 'completed')?._count.status || 0;
            await this.prisma.n8nIntegration.update({
                where: { id: integrationId },
                data: {
                    webhookCount: totalEvents,
                    lastWebhookAt: new Date(),
                    lastErrorAt: successfulEvents === totalEvents ? null : new Date()
                }
            });
        }
        catch (error) {
            console.error('Error updating integration stats:', error);
            // Don't throw error, just log it
        }
    }
    /**
     * Calculate metrics for an integration
     */
    async calculateMetrics(integrationId) {
        try {
            const events = await this.prisma.n8nWebhookEvent.findMany({
                where: { n8nIntegrationId: integrationId },
                orderBy: { createdAt: 'desc' },
                take: 100
            });
            if (!events || events.length === 0) {
                return {
                    totalWorkflows: 0,
                    successfulWorkflows: 0,
                    failedWorkflows: 0,
                    averageExecutionTime: 0,
                    totalTimeSaved: 0,
                    successRate: 0
                };
            }
            const successfulWorkflows = events.filter(e => e.status === 'completed').length;
            const failedWorkflows = events.filter(e => e.status === 'failed').length;
            const totalWorkflows = events.length;
            const successRate = totalWorkflows > 0 ? (successfulWorkflows / totalWorkflows) * 100 : 0;
            const executionTimes = events
                .filter(e => e.duration)
                .map(e => e.duration);
            const averageExecutionTime = executionTimes.length > 0
                ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length
                : 0;
            const totalTimeSaved = executionTimes.reduce((sum, time) => sum + time, 0);
            return {
                totalWorkflows,
                successfulWorkflows,
                failedWorkflows,
                averageExecutionTime,
                totalTimeSaved,
                successRate
            };
        }
        catch (error) {
            console.error('Error calculating metrics:', error);
            return {
                totalWorkflows: 0,
                successfulWorkflows: 0,
                failedWorkflows: 0,
                averageExecutionTime: 0,
                totalTimeSaved: 0,
                successRate: 0
            };
        }
    }
    /**
     * Get integration by ID
     */
    async getIntegrationById(integrationId) {
        try {
            return await this.prisma.n8nIntegration.findUnique({
                where: { id: integrationId },
                include: {
                    businessEntity: true,
                    webhookEvents: {
                        orderBy: { createdAt: 'desc' },
                        take: 10
                    }
                }
            });
        }
        catch (error) {
            console.error('Error getting integration by ID:', error);
            return null;
        }
    }
    /**
     * Get integration by business entity ID
     */
    async getIntegrationByBusinessEntity(businessEntityId) {
        try {
            return await this.prisma.n8nIntegration.findFirst({
                where: {
                    businessEntityId,
                    isActive: true
                },
                include: {
                    businessEntity: true,
                    webhookEvents: {
                        orderBy: { createdAt: 'desc' },
                        take: 10
                    }
                }
            });
        }
        catch (error) {
            console.error('Error getting integration by business entity:', error);
            return null;
        }
    }
    /**
     * Create new integration
     */
    async createIntegration(data) {
        try {
            return await this.prisma.n8nIntegration.create({
                data: {
                    businessEntityId: data.businessEntityId,
                    webhookUrl: data.webhookUrl,
                    webhookToken: data.webhookToken,
                    isActive: true
                },
                include: {
                    businessEntity: true
                }
            });
        }
        catch (error) {
            console.error('Error creating integration:', error);
            return null;
        }
    }
    /**
     * Update integration
     */
    async updateIntegration(integrationId, data) {
        try {
            return await this.prisma.n8nIntegration.update({
                where: { id: integrationId },
                data: {
                    ...data,
                    updatedAt: new Date()
                },
                include: {
                    businessEntity: true
                }
            });
        }
        catch (error) {
            console.error('Error updating integration:', error);
            return null;
        }
    }
    /**
     * Get webhook events for an integration
     */
    async getWebhookEvents(integrationId, limit = 100, offset = 0) {
        try {
            return await this.prisma.n8nWebhookEvent.findMany({
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
    /**
     * Validate event type
     */
    isValidEventType(eventType) {
        const validTypes = [
            'workflow_started', 'workflow_completed', 'workflow_failed', 'workflow_cancelled',
            'node_started', 'node_completed', 'node_failed',
            'execution_started', 'execution_completed', 'execution_failed'
        ];
        return validTypes.includes(eventType);
    }
    /**
     * Validate status
     */
    isValidStatus(status) {
        const validStatuses = [
            'running', 'completed', 'failed', 'cancelled', 'waiting', 'error'
        ];
        return validStatuses.includes(status);
    }
    /**
     * Validate timestamp string (ISO 8601)
     */
    isValidTimestamp(timestamp) {
        const date = new Date(timestamp);
        return !isNaN(date.getTime());
    }
    /**
     * Convert actual n8n payload format to our expected format
     */
    convertN8nPayload(actualPayload) {
        return {
            workflowId: `workflow-${Date.now()}`, // Generate a workflow ID since it's not provided
            workflowName: 'Lead Generation Workflow', // Default name since it's not provided
            executionId: actualPayload.ExecutionID,
            eventType: 'workflow_completed', // Default to completed since we don't have this info
            status: this.mapN8nStatus(actualPayload.Status),
            startTime: actualPayload.Timestamp,
            inputData: {
                leadsGenerated: actualPayload.LeadsGenerated,
                industryBreakdown: actualPayload.IndustryBreakdown,
                ...actualPayload
            },
            outputData: {
                executionId: actualPayload.ExecutionID,
                status: actualPayload.Status,
                timestamp: actualPayload.Timestamp,
                leadsGenerated: actualPayload.LeadsGenerated,
                industryBreakdown: actualPayload.IndustryBreakdown
            }
        };
    }
    /**
     * Map n8n status to our workflow status
     */
    mapN8nStatus(n8nStatus) {
        const statusMap = {
            'success': 'completed',
            'failed': 'failed',
            'running': 'running',
            'waiting': 'waiting',
            'cancelled': 'cancelled'
        };
        return statusMap[n8nStatus.toLowerCase()] || 'completed';
    }
}
exports.N8nService = N8nService;
//# sourceMappingURL=n8nService.js.map