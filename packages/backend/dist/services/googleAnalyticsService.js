"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAnalyticsService = void 0;
const googleapis_1 = require("googleapis");
const errorHandler_1 = require("../middleware/errorHandler");
const errorHandler_2 = require("../middleware/errorHandler");
class GoogleAnalyticsService {
    oauth2Client;
    analyticsDataClient;
    constructor() {
        // Initialize OAuth2 client
        this.oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
        // Initialize Analytics Data API client
        this.analyticsDataClient = googleapis_1.google.analyticsdata({
            version: 'v1beta',
            auth: this.oauth2Client
        });
    }
    /**
     * Generate OAuth2 authorization URL
     */
    generateAuthUrl(state) {
        try {
            const scopes = [
                'https://www.googleapis.com/auth/analytics.readonly'
            ];
            return this.oauth2Client.generateAuthUrl({
                access_type: 'offline',
                prompt: 'consent',
                scope: scopes,
                state: state || 'default'
            });
        }
        catch (error) {
            throw new errorHandler_2.ValidationError(`Failed to generate auth URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Exchange authorization code for tokens with enhanced error handling
     */
    async exchangeCodeForTokens(code) {
        if (!code) {
            throw new errorHandler_2.ValidationError('Authorization code is required');
        }
        return (0, errorHandler_1.withCircuitBreaker)('google-analytics-auth', async () => {
            try {
                const { tokens } = await this.oauth2Client.getToken(code);
                if (!tokens.access_token || !tokens.refresh_token) {
                    throw new errorHandler_2.ExternalApiError('Failed to obtain access and refresh tokens', 400);
                }
                return {
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600000)
                };
            }
            catch (error) {
                if (error instanceof errorHandler_2.ExternalApiError) {
                    throw error;
                }
                throw new errorHandler_2.ExternalApiError(`Token exchange failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
            }
        }, 
        // Fallback: return cached tokens if available
        async () => {
            // This would typically check for cached tokens
            throw new errorHandler_2.ExternalApiError('No fallback tokens available', 503);
        });
    }
    /**
     * Refresh access token using refresh token with retry logic
     */
    async refreshAccessToken(refreshToken) {
        if (!refreshToken) {
            throw new errorHandler_2.ValidationError('Refresh token is required');
        }
        return (0, errorHandler_1.withRetry)(async () => {
            try {
                this.oauth2Client.setCredentials({
                    refresh_token: refreshToken
                });
                const { credentials } = await this.oauth2Client.refreshAccessToken();
                if (!credentials.access_token) {
                    throw new errorHandler_2.ExternalApiError('Failed to refresh access token', 400);
                }
                return {
                    accessToken: credentials.access_token,
                    expiryDate: credentials.expiry_date ? new Date(credentials.expiry_date) : new Date(Date.now() + 3600000)
                };
            }
            catch (error) {
                if (error instanceof errorHandler_2.ExternalApiError) {
                    throw error;
                }
                throw new errorHandler_2.ExternalApiError(`Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
            }
        }, 3, // maxRetries
        1000, // baseDelay
        10000 // maxDelay
        );
    }
    /**
     * Set credentials for API calls
     */
    setCredentials(accessToken, refreshToken) {
        if (!accessToken) {
            throw new errorHandler_2.ValidationError('Access token is required');
        }
        try {
            const credentials = {
                access_token: accessToken
            };
            if (refreshToken) {
                credentials.refresh_token = refreshToken;
            }
            this.oauth2Client.setCredentials(credentials);
        }
        catch (error) {
            throw new errorHandler_2.ValidationError(`Failed to set credentials: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get GA4 metrics with comprehensive error handling
     */
    async getMetrics(request) {
        if (!request.propertyId) {
            throw new errorHandler_2.ValidationError('Property ID is required');
        }
        if (!request.startDate || !request.endDate) {
            throw new errorHandler_2.ValidationError('Start date and end date are required');
        }
        return (0, errorHandler_1.withGracefulDegradation)(
        // Primary operation: fetch from Google Analytics
        async () => {
            try {
                const response = await this.analyticsDataClient.properties.runReport({
                    property: `properties/${request.propertyId}`,
                    requestBody: {
                        dateRanges: [
                            {
                                startDate: request.startDate,
                                endDate: request.endDate
                            }
                        ],
                        metrics: request.metrics,
                        dimensions: request.dimensions || []
                    }
                });
                if (!response.data.rows) {
                    return {
                        propertyId: request.propertyId,
                        startDate: request.startDate,
                        endDate: request.endDate,
                        metrics: [],
                        totalRows: 0,
                        rowCount: 0,
                        metricHeaders: [],
                        dimensionHeaders: [],
                        rows: []
                    };
                }
                const metrics = response.data.rows.map((row) => ({
                    date: row.dimensionValues?.[0]?.value || '',
                    sessions: parseInt(row.metricValues?.[0]?.value || '0'),
                    users: parseInt(row.metricValues?.[1]?.value || '0'),
                    pageViews: parseInt(row.metricValues?.[2]?.value || '0'),
                    bounceRate: parseFloat(row.metricValues?.[3]?.value || '0'),
                    avgSessionDuration: parseFloat(row.metricValues?.[4]?.value || '0')
                }));
                return {
                    propertyId: request.propertyId,
                    startDate: request.startDate,
                    endDate: request.endDate,
                    metrics,
                    totalRows: response.data.rowCount || 0,
                    rowCount: metrics.length,
                    metricHeaders: response.data.metricHeaders || [],
                    dimensionHeaders: response.data.dimensionHeaders || [],
                    rows: response.data.rows || []
                };
            }
            catch (error) {
                if (error instanceof errorHandler_2.ExternalApiError) {
                    throw error;
                }
                throw new errorHandler_2.ExternalApiError(`Failed to fetch GA4 metrics: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
            }
        }, 
        // Fallback: return cached or default data
        async () => {
            // This would typically return cached data or default metrics
            return {
                propertyId: request.propertyId,
                startDate: request.startDate,
                endDate: request.endDate,
                metrics: [],
                totalRows: 0,
                rowCount: 0,
                metricHeaders: [],
                dimensionHeaders: [],
                rows: [],
                fallback: true,
                message: 'Using fallback data due to Google Analytics API unavailability'
            };
        }, 'google-analytics-metrics');
    }
    /**
     * Validate GA4 property access
     */
    async validatePropertyAccess(propertyId) {
        if (!propertyId) {
            throw new errorHandler_2.ValidationError('Property ID is required');
        }
        return (0, errorHandler_1.withCircuitBreaker)('google-analytics-validation', async () => {
            try {
                await this.analyticsDataClient.properties.get({
                    name: `properties/${propertyId}`
                });
                return true;
            }
            catch (error) {
                if (error instanceof errorHandler_2.ExternalApiError) {
                    throw error;
                }
                throw new errorHandler_2.ExternalApiError(`Failed to validate property access: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
            }
        });
    }
    /**
     * Get available GA4 properties for the authenticated user
     */
    async getAvailableProperties() {
        return (0, errorHandler_1.withCircuitBreaker)('google-analytics-properties', async () => {
            try {
                const response = await this.analyticsDataClient.properties.list();
                if (!response.data.properties) {
                    return [];
                }
                return response.data.properties.map((property) => ({
                    propertyId: property.name?.replace('properties/', '') || '',
                    displayName: property.displayName || 'Unknown Property'
                }));
            }
            catch (error) {
                if (error instanceof errorHandler_2.ExternalApiError) {
                    throw error;
                }
                throw new errorHandler_2.ExternalApiError(`Failed to fetch properties: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
            }
        }, 
        // Fallback: return empty array
        async () => []);
    }
    /**
     * Check service health
     */
    async checkHealth() {
        try {
            // Try to make a simple API call to check connectivity
            await this.analyticsDataClient.properties.list({ pageSize: 1 });
            return {
                status: 'healthy',
                message: 'Google Analytics API is accessible'
            };
        }
        catch (error) {
            if (error instanceof errorHandler_2.ExternalApiError) {
                return {
                    status: 'degraded',
                    message: `Google Analytics API error: ${error.message}`
                };
            }
            return {
                status: 'unhealthy',
                message: `Google Analytics API is not accessible: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    // Legacy method for backward compatibility
    async getBasicMetrics(propertyId, startDate, endDate) {
        const request = {
            propertyId,
            startDate,
            endDate,
            metrics: ['sessions', 'newUsers', 'screenPageViews'],
            dimensions: ['date']
        };
        const response = await this.getMetrics(request);
        return response.metrics;
    }
    // Legacy method for backward compatibility
    validatePropertyId(propertyId) {
        // GA4 property IDs are typically numeric
        return /^\d+$/.test(propertyId);
    }
}
exports.GoogleAnalyticsService = GoogleAnalyticsService;
//# sourceMappingURL=googleAnalyticsService.js.map