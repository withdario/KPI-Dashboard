import { GA4Metrics, GA4MetricsRequest, GA4MetricsResponse } from '../types/googleAnalytics';
export declare class GoogleAnalyticsService {
    private oauth2Client;
    private analyticsDataClient;
    constructor();
    /**
     * Generate OAuth2 authorization URL
     */
    generateAuthUrl(state?: string): string;
    /**
     * Exchange authorization code for tokens with enhanced error handling
     */
    exchangeCodeForTokens(code: string): Promise<{
        accessToken: string;
        refreshToken: string;
        expiryDate: Date;
    }>;
    /**
     * Refresh access token using refresh token with retry logic
     */
    refreshAccessToken(refreshToken: string): Promise<{
        accessToken: string;
        expiryDate: Date;
    }>;
    /**
     * Set credentials for API calls
     */
    setCredentials(accessToken: string, refreshToken?: string): void;
    /**
     * Get GA4 metrics with comprehensive error handling
     */
    getMetrics(request: GA4MetricsRequest): Promise<GA4MetricsResponse>;
    /**
     * Validate GA4 property access
     */
    validatePropertyAccess(propertyId: string): Promise<boolean>;
    /**
     * Get available GA4 properties for the authenticated user
     */
    getAvailableProperties(): Promise<Array<{
        propertyId: string;
        displayName: string;
    }>>;
    /**
     * Check service health
     */
    checkHealth(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        message: string;
    }>;
    getBasicMetrics(propertyId: string, startDate: string, endDate: string): Promise<GA4Metrics[]>;
    validatePropertyId(propertyId: string): boolean;
}
//# sourceMappingURL=googleAnalyticsService.d.ts.map