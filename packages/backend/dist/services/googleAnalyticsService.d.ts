import { GA4Metrics } from '../types/googleAnalytics';
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
    getBasicMetrics(propertyId: string, startDate: string, endDate: string): Promise<GA4Metrics[]>;
    private parseMetricsResponse;
    isTokenExpired(expiryDate: Date): boolean;
    getTokenExpirySeconds(expiryDate: Date): number;
    validatePropertyId(propertyId: string): boolean;
}
//# sourceMappingURL=googleAnalyticsService.d.ts.map