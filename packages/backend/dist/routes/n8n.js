"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const n8nService_1 = require("../services/n8nService");
const webhookSecurity_1 = require("../middleware/webhookSecurity");
const router = (0, express_1.Router)();
const n8nService = new n8nService_1.N8nService();
router.post('/webhooks/n8n', webhookSecurity_1.webhookRateLimit, (0, webhookSecurity_1.webhookPayloadValidation)('1mb'), (0, webhookSecurity_1.webhookIpValidation)(process.env.ALLOWED_WEBHOOK_IPS?.split(',') || []), webhookSecurity_1.webhookSignatureValidation, webhookSecurity_1.webhookMonitoring, webhookSecurity_1.webhookAuth, async (req, res) => {
    try {
        const integration = req.webhookIntegration;
        const payload = req.body;
        const validation = await n8nService.validateWebhookPayload(payload);
        if (!validation.isValid) {
            console.warn('Invalid webhook payload:', validation.errors);
            return res.status(400).json({
                error: 'Invalid webhook payload',
                details: validation.errors,
                warnings: validation.warnings
            });
        }
        const result = await n8nService.processWebhookEvent(integration.id, validation.payload);
        if (!result.success) {
            console.error('Failed to process webhook event:', result.errors);
            return res.status(500).json({
                error: 'Webhook processing failed',
                details: result.errors
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Webhook processed successfully',
            eventId: result.eventId,
            metrics: result.metrics
        });
    }
    catch (error) {
        console.error('Webhook processing error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to process webhook'
        });
    }
});
router.get('/integration/:businessEntityId', async (req, res) => {
    try {
        const { businessEntityId } = req.params;
        const integration = await n8nService.getIntegrationByBusinessEntity(businessEntityId);
        if (!integration) {
            return res.status(404).json({
                error: 'Integration not found',
                message: 'No active n8n integration found for this business entity'
            });
        }
        const { webhookToken, ...safeIntegration } = integration;
        return res.status(200).json({
            success: true,
            integration: safeIntegration
        });
    }
    catch (error) {
        console.error('Error getting n8n integration:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve integration details'
        });
    }
});
router.post('/integration', async (req, res) => {
    try {
        const { businessEntityId, webhookUrl, webhookToken } = req.body;
        if (!businessEntityId || !webhookUrl || !webhookToken) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'businessEntityId, webhookUrl, and webhookToken are required'
            });
        }
        const existingIntegration = await n8nService.getIntegrationByBusinessEntity(businessEntityId);
        if (existingIntegration) {
            return res.status(409).json({
                error: 'Integration already exists',
                message: 'An n8n integration already exists for this business entity'
            });
        }
        const integration = await n8nService.createIntegration({
            businessEntityId,
            webhookUrl,
            webhookToken
        });
        const { webhookToken: token, ...safeIntegration } = integration;
        return res.status(201).json({
            success: true,
            message: 'n8n integration created successfully',
            integration: safeIntegration
        });
    }
    catch (error) {
        console.error('Error creating n8n integration:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create integration'
        });
    }
});
router.put('/integration/:integrationId', async (req, res) => {
    try {
        const { integrationId } = req.params;
        const { webhookUrl, webhookToken, isActive } = req.body;
        if (!webhookUrl && !webhookToken && isActive === undefined) {
            return res.status(400).json({
                error: 'Missing update fields',
                message: 'At least one field must be provided for update'
            });
        }
        const existingIntegration = await n8nService.getIntegration(integrationId);
        if (!existingIntegration) {
            return res.status(404).json({
                error: 'Integration not found',
                message: 'n8n integration not found'
            });
        }
        const updateData = {};
        if (webhookUrl !== undefined)
            updateData.webhookUrl = webhookUrl;
        if (webhookToken !== undefined)
            updateData.webhookToken = webhookToken;
        if (isActive !== undefined)
            updateData.isActive = isActive;
        const integration = await n8nService.updateIntegration(integrationId, updateData);
        const { webhookToken: token, ...safeIntegration } = integration;
        return res.status(200).json({
            success: true,
            message: 'n8n integration updated successfully',
            integration: safeIntegration
        });
    }
    catch (error) {
        console.error('Error updating n8n integration:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update integration'
        });
    }
});
router.get('/events/:integrationId', async (req, res) => {
    try {
        const { integrationId } = req.params;
        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;
        if (limit > 1000) {
            return res.status(400).json({
                error: 'Invalid limit',
                message: 'Limit cannot exceed 1000'
            });
        }
        const integration = await n8nService.getIntegration(integrationId);
        if (!integration) {
            return res.status(404).json({
                error: 'Integration not found',
                message: 'n8n integration not found'
            });
        }
        const events = await n8nService.getWebhookEvents(integrationId, limit, offset);
        return res.status(200).json({
            success: true,
            events,
            pagination: {
                limit,
                offset,
                total: events.length
            }
        });
    }
    catch (error) {
        console.error('Error getting webhook events:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve webhook events'
        });
    }
});
router.get('/metrics/:integrationId', async (req, res) => {
    try {
        const { integrationId } = req.params;
        const integration = await n8nService.getIntegration(integrationId);
        if (!integration) {
            return res.status(404).json({
                error: 'Integration not found',
                message: 'n8n integration not found'
            });
        }
        const metrics = await n8nService.calculateMetrics(integrationId);
        return res.status(200).json({
            success: true,
            metrics
        });
    }
    catch (error) {
        console.error('Error getting metrics:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve metrics'
        });
    }
});
router.post('/test/webhook', (0, webhookSecurity_1.webhookPayloadValidation)('1mb'), async (req, res) => {
    try {
        const payload = req.body;
        const validation = await n8nService.validateWebhookPayload(payload);
        if (!validation.isValid) {
            return res.status(400).json({
                error: 'Invalid test payload',
                details: validation.errors,
                warnings: validation.warnings
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Test payload is valid',
            payload: validation.payload,
            warnings: validation.warnings
        });
    }
    catch (error) {
        console.error('Test webhook error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to validate test payload'
        });
    }
});
exports.default = router;
//# sourceMappingURL=n8n.js.map