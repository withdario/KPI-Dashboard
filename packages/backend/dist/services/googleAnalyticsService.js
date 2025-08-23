"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAnalyticsService = void 0;
const googleapis_1 = require("googleapis");
class GoogleAnalyticsService {
    oauth2Client;
    analyticsDataClient;
    constructor() {
        this.oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
        this.analyticsDataClient = googleapis_1.google.analyticsdata({
            version: 'v1beta',
            auth: this.oauth2Client
        });
    }
    generateAuthUrl(state) {
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
    async exchangeCodeForTokens(code) {
        try {
            const { tokens } = await this.oauth2Client.getToken(code);
            if (!tokens.access_token || !tokens.refresh_token) {
                throw new Error('Failed to obtain access and refresh tokens');
            }
            return {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600000)
            };
        }
        catch (error) {
            throw new Error(`Token exchange failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async refreshAccessToken(refreshToken) {
        try {
            this.oauth2Client.setCredentials({
                refresh_token: refreshToken
            });
            const { credentials } = await this.oauth2Client.refreshAccessToken();
            if (!credentials.access_token) {
                throw new Error('Failed to refresh access token');
            }
            return {
                accessToken: credentials.access_token,
                expiryDate: credentials.expiry_date ? new Date(credentials.expiry_date) : new Date(Date.now() + 3600000)
            };
        }
        catch (error) {
            throw new Error(`Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    setCredentials(accessToken, refreshToken) {
        const credentials = {
            access_token: accessToken
        };
        if (refreshToken) {
            credentials.refresh_token = refreshToken;
        }
        this.oauth2Client.setCredentials(credentials);
    }
    async getBasicMetrics(propertyId, startDate, endDate) {
        try {
            const request = {
                propertyId,
                startDate,
                endDate,
                metrics: ['sessions', 'newUsers', 'screenPageViews'],
                dimensions: ['date']
            };
            const response = await this.analyticsDataClient.properties.runReport({
                property: `properties/${propertyId}`,
                requestBody: {
                    dateRanges: [
                        {
                            startDate: request.startDate,
                            endDate: request.endDate
                        }
                    ],
                    metrics: request.metrics.map(metric => ({ name: metric })),
                    dimensions: request.dimensions?.map(dimension => ({ name: dimension })) || []
                }
            });
            return this.parseMetricsResponse(response.data);
        }
        catch (error) {
            throw new Error(`Failed to retrieve GA4 metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    parseMetricsResponse(response) {
        if (!response.rows || response.rows.length === 0) {
            return [];
        }
        return response.rows.map(row => {
            const date = row.dimensionValues[0]?.value || '';
            const sessions = parseInt(row.metricValues[0]?.value || '0', 10);
            const users = parseInt(row.metricValues[1]?.value || '0', 10);
            const pageviews = parseInt(row.metricValues[2]?.value || '0', 10);
            return {
                date,
                sessions,
                users,
                pageviews
            };
        });
    }
    isTokenExpired(expiryDate) {
        return new Date() >= expiryDate;
    }
    getTokenExpirySeconds(expiryDate) {
        const now = new Date();
        const expiry = new Date(expiryDate);
        return Math.max(0, Math.floor((expiry.getTime() - now.getTime()) / 1000));
    }
    validatePropertyId(propertyId) {
        return /^\d+$/.test(propertyId);
    }
}
exports.GoogleAnalyticsService = GoogleAnalyticsService;
//# sourceMappingURL=googleAnalyticsService.js.map