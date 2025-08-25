import { GA4Metrics, GA4MetricsRequest, GA4MetricsResponse } from '../types/googleAnalytics';
export declare class GoogleAnalyticsService {
    private oauth2Client;
    private analyticsDataClient;
    constructor();
    generateAuthUrl(state?: string): string;
    exchangeCodeForTokens(code: string): Promise<{
        accessToken: string;
        refreshToken: string;
        expiryDate: Date;
    }>;
    refreshAccessToken(refreshToken: string): Promise<{
        accessToken: string;
        expiryDate: Date;
    }>;
    setCredentials(accessToken: string, refreshToken?: string): void;
    getMetrics(request: GA4MetricsRequest): Promise<GA4MetricsResponse>;
    validatePropertyAccess(propertyId: string): Promise<boolean>;
    getAvailableProperties(): Promise<Array<{
        propertyId: string;
        displayName: string;
    }>>;
    checkHealth(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        message: string;
    }>;
    getBasicMetrics(propertyId: string, startDate: string, endDate: string): Promise<GA4Metrics[]>;
    validatePropertyId(propertyId: string): boolean;
}
//# sourceMappingURL=googleAnalyticsService.d.ts.map