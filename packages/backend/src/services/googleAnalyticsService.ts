import { google } from 'googleapis';
import { GA4Metrics, GA4MetricsRequest, GA4MetricsResponse } from '../types/googleAnalytics';

export class GoogleAnalyticsService {
  private oauth2Client: any;
  private analyticsDataClient: any;

  constructor() {
    // Initialize OAuth2 client
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Initialize Analytics Data API client
    this.analyticsDataClient = google.analyticsdata({
      version: 'v1beta',
      auth: this.oauth2Client
    });
  }

  /**
   * Generate OAuth2 authorization URL
   */
  generateAuthUrl(state?: string): string {
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

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiryDate: Date;
  }> {
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
    } catch (error) {
      throw new Error(`Token exchange failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    expiryDate: Date;
  }> {
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
    } catch (error) {
      throw new Error(`Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Set credentials for API calls
   */
  setCredentials(accessToken: string, refreshToken?: string): void {
    const credentials: any = {
      access_token: accessToken
    };
    
    if (refreshToken) {
      credentials.refresh_token = refreshToken;
    }
    
    this.oauth2Client.setCredentials(credentials);
  }

  /**
   * Get basic metrics from GA4
   */
  async getBasicMetrics(propertyId: string, startDate: string, endDate: string): Promise<GA4Metrics[]> {
    try {
      const request: GA4MetricsRequest = {
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
    } catch (error) {
      throw new Error(`Failed to retrieve GA4 metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse GA4 API response into structured format
   */
  private parseMetricsResponse(response: GA4MetricsResponse): GA4Metrics[] {
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

  /**
   * Check if access token is expired
   */
  isTokenExpired(expiryDate: Date): boolean {
    return new Date() >= expiryDate;
  }

  /**
   * Get token expiry time in seconds
   */
  getTokenExpirySeconds(expiryDate: Date): number {
    const now = new Date();
    const expiry = new Date(expiryDate);
    return Math.max(0, Math.floor((expiry.getTime() - now.getTime()) / 1000));
  }

  /**
   * Validate GA4 property ID format
   */
  validatePropertyId(propertyId: string): boolean {
    // GA4 property IDs are typically numeric
    return /^\d+$/.test(propertyId);
  }
}
