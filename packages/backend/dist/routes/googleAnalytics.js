"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const googleAnalyticsService_1 = require("../services/googleAnalyticsService");
const auth_1 = require("../middleware/auth");
const express_rate_limit_1 = require("express-rate-limit");
const router = (0, express_1.Router)();
const googleAnalyticsService = new googleAnalyticsService_1.GoogleAnalyticsService();
const analyticsRateLimit = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests to Google Analytics API, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
router.use(analyticsRateLimit);
router.get('/test/oauth-url', (req, res) => {
    try {
        const state = req.query.state || 'test123';
        const authUrl = googleAnalyticsService.generateAuthUrl(state);
        res.json({
            success: true,
            message: 'TEST ENDPOINT - OAuth2 URL generated successfully',
            data: {
                authUrl,
                state,
                instructions: [
                    '1. Visit this URL in your browser',
                    '2. Authorize the application',
                    '3. Copy the authorization code from the redirect URL',
                    '4. Use the code with /test/oauth-callback endpoint'
                ]
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to generate authorization URL',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/test/oauth-callback', async (req, res) => {
    try {
        const { code, state } = req.query;
        if (!code) {
            return res.status(400).json({
                success: false,
                error: 'Authorization code is missing from redirect'
            });
        }
        return res.json({
            success: true,
            message: 'OAuth2 callback received successfully!',
            data: {
                code: code,
                state: state,
                instructions: [
                    'Copy this authorization code',
                    'Use it with the POST endpoint to exchange for tokens',
                    'POST to /api/google-analytics/test/oauth-callback with:',
                    '{ "code": "YOUR_CODE_HERE", "propertyId": "502230694" }'
                ]
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'OAuth2 callback processing failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/test/oauth-callback', async (req, res) => {
    try {
        const { code, propertyId } = req.body;
        if (!code || !propertyId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters: code and propertyId'
            });
        }
        if (!googleAnalyticsService.validatePropertyId(propertyId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid GA4 property ID format'
            });
        }
        const tokens = await googleAnalyticsService.exchangeCodeForTokens(code);
        googleAnalyticsService.setCredentials(tokens.accessToken, tokens.refreshToken);
        return res.json({
            success: true,
            message: 'TEST ENDPOINT - OAuth2 flow completed successfully!',
            data: {
                propertyId,
                tokenExpiry: tokens.expiryDate.toISOString(),
                accessTokenLength: tokens.accessToken.length,
                refreshTokenLength: tokens.refreshToken.length,
                nextSteps: [
                    'Store these tokens securely in production',
                    'Use access token for API calls',
                    'Refresh token when access token expires'
                ]
            }
        });
    }
    catch (error) {
        console.error('OAuth2 callback failed:', error);
        return res.status(500).json({
            success: false,
            error: 'OAuth2 callback failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/test/health', (_req, res) => {
    try {
        const requiredEnvVars = [
            'GOOGLE_CLIENT_ID',
            'GOOGLE_CLIENT_SECRET',
            'GOOGLE_REDIRECT_URI'
        ];
        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        if (missingVars.length > 0) {
            return res.status(503).json({
                success: false,
                error: 'Service configuration incomplete',
                details: `Missing environment variables: ${missingVars.join(', ')}`
            });
        }
        return res.json({
            success: true,
            message: 'TEST ENDPOINT - Google Analytics service is healthy',
            data: {
                status: 'operational',
                timestamp: new Date().toISOString(),
                environment: {
                    clientId: process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing',
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
                    redirectUri: process.env.GOOGLE_REDIRECT_URI ? '✅ Set' : '❌ Missing',
                    propertyId: process.env.GOOGLE_ANALYTICS_PROPERTY_ID ? '✅ Set' : '❌ Missing'
                }
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Health check failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/test/metrics', async (req, res) => {
    try {
        const { propertyId, startDate, endDate } = req.query;
        if (!propertyId || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters: propertyId, startDate, endDate'
            });
        }
        const metrics = await googleAnalyticsService.getBasicMetrics(propertyId, startDate, endDate);
        return res.json({
            success: true,
            message: 'TEST ENDPOINT - GA4 metrics retrieved successfully',
            data: {
                propertyId,
                dateRange: { startDate, endDate },
                metrics,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('Error retrieving GA4 metrics:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to retrieve GA4 metrics',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/auth/url', auth_1.authenticateToken, (req, res) => {
    try {
        const state = req.query.state || 'default';
        const authUrl = googleAnalyticsService.generateAuthUrl(state);
        res.json({
            success: true,
            data: {
                authUrl,
                state
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to generate authorization URL',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/auth/callback', auth_1.authenticateToken, async (req, res) => {
    try {
        const { code, businessEntityId, propertyId } = req.body;
        if (!code || !businessEntityId || !propertyId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: code, businessEntityId, propertyId'
            });
        }
        if (!googleAnalyticsService.validatePropertyId(propertyId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid GA4 property ID format'
            });
        }
        const tokens = await googleAnalyticsService.exchangeCodeForTokens(code);
        return res.json({
            success: true,
            data: {
                message: 'Authorization successful',
                propertyId,
                businessEntityId,
                tokenExpiry: tokens.expiryDate,
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Authorization failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/refresh-token', auth_1.authenticateToken, async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                error: 'Refresh token is required'
            });
        }
        const tokens = await googleAnalyticsService.refreshAccessToken(refreshToken);
        return res.json({
            success: true,
            data: {
                message: 'Token refreshed successfully',
                tokenExpiry: tokens.expiryDate,
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Token refresh failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/metrics', auth_1.authenticateToken, async (req, res) => {
    try {
        const { propertyId, startDate, endDate } = req.query;
        if (!propertyId || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: 'Missing required query parameters: propertyId, startDate, endDate'
            });
        }
        if (!googleAnalyticsService.validatePropertyId(propertyId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid GA4 property ID format'
            });
        }
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid date format. Use YYYY-MM-DD'
            });
        }
        return res.status(501).json({
            success: false,
            error: 'Metrics retrieval not yet implemented - requires database integration',
            details: 'This endpoint will work once the database schema is properly migrated and tokens are stored'
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to retrieve metrics',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/health', auth_1.authenticateToken, (_req, res) => {
    try {
        const requiredEnvVars = [
            'GOOGLE_CLIENT_ID',
            'GOOGLE_CLIENT_SECRET',
            'GOOGLE_REDIRECT_URI'
        ];
        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        if (missingVars.length > 0) {
            return res.status(503).json({
                success: false,
                error: 'Service configuration incomplete',
                details: `Missing environment variables: ${missingVars.join(', ')}`
            });
        }
        return res.json({
            success: true,
            data: {
                message: 'Google Analytics service is healthy',
                status: 'operational',
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Health check failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=googleAnalytics.js.map