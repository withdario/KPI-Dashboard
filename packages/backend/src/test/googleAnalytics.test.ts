import { GoogleAnalyticsService } from '../services/googleAnalyticsService';

// Mock googleapis
jest.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: jest.fn().mockImplementation(() => ({
        generateAuthUrl: jest.fn().mockReturnValue('https://accounts.google.com/oauth2/auth?client_id=test&redirect_uri=test'),
        getToken: jest.fn().mockResolvedValue({
          tokens: {
            access_token: 'test-access-token',
            refresh_token: 'test-refresh-token',
            expiry_date: Date.now() + 3600000
          }
        }),
        refreshAccessToken: jest.fn().mockResolvedValue({
          credentials: {
            access_token: 'new-access-token',
            expiry_date: Date.now() + 3600000
          }
        }),
        setCredentials: jest.fn()
      }))
    },
    analyticsdata: jest.fn().mockReturnValue({
      properties: {
        runReport: jest.fn().mockResolvedValue({
          data: {
            metricHeaders: [
              { name: 'sessions' },
              { name: 'users' },
              { name: 'pageviews' }
            ],
            dimensionHeaders: [
              { name: 'date' }
            ],
            rows: [
              {
                dimensionValues: [{ value: '2024-01-01' }],
                metricValues: [
                  { value: '100' },
                  { value: '50' },
                  { value: '200' }
                ]
              }
            ],
            rowCount: 1
          }
        })
      }
    })
  }
}));

describe('GoogleAnalyticsService', () => {
  let service: GoogleAnalyticsService;

  beforeEach(() => {
    // Set required environment variables for testing
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
    process.env.GOOGLE_REDIRECT_URI = 'http://localhost:3000/callback';
    
    service = new GoogleAnalyticsService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAuthUrl', () => {
    it('should generate OAuth2 authorization URL with default state', () => {
      const authUrl = service.generateAuthUrl();
      expect(authUrl).toContain('https://accounts.google.com/oauth2/auth');
      expect(authUrl).toContain('client_id=test');
    });

    it('should generate OAuth2 authorization URL with custom state', () => {
      const customState = 'custom-state-value';
      const authUrl = service.generateAuthUrl(customState);
      expect(authUrl).toContain('https://accounts.google.com/oauth2/auth');
    });
  });

  describe('exchangeCodeForTokens', () => {
    it('should exchange authorization code for tokens', async () => {
      const code = 'test-auth-code';
      const result = await service.exchangeCodeForTokens(code);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiryDate');
      expect(result.accessToken).toBe('test-access-token');
      expect(result.refreshToken).toBe('test-refresh-token');
    });

    it('should throw error when tokens are missing', async () => {
      // Mock the getToken to return empty tokens
      const mockOAuth2 = require('googleapis').google.auth.OAuth2;
      mockOAuth2.mockImplementationOnce(() => ({
        generateAuthUrl: jest.fn(),
        getToken: jest.fn().mockResolvedValue({
          tokens: {}
        }),
        setCredentials: jest.fn()
      }));

      const newService = new GoogleAnalyticsService();
      const code = 'test-auth-code';

      await expect(newService.exchangeCodeForTokens(code)).rejects.toThrow('Failed to obtain access and refresh tokens');
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token using refresh token', async () => {
      const refreshToken = 'test-refresh-token';
      const result = await service.refreshAccessToken(refreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('expiryDate');
      expect(result.accessToken).toBe('new-access-token');
    });

    it('should throw error when new access token is missing', async () => {
      // Mock the refreshAccessToken to return empty credentials
      const mockOAuth2 = require('googleapis').google.auth.OAuth2;
      mockOAuth2.mockImplementationOnce(() => ({
        generateAuthUrl: jest.fn(),
        getToken: jest.fn(),
        refreshAccessToken: jest.fn().mockResolvedValue({
          credentials: {}
        }),
        setCredentials: jest.fn()
      }));

      const newService = new GoogleAnalyticsService();
      const refreshToken = 'test-refresh-token';

      await expect(newService.refreshAccessToken(refreshToken)).rejects.toThrow('Failed to refresh access token');
    });
  });

  describe('getBasicMetrics', () => {
    it('should retrieve basic metrics from GA4', async () => {
      const propertyId = '123456789';
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      const result = await service.getBasicMetrics(propertyId, startDate, endDate);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('sessions');
      expect(result[0]).toHaveProperty('users');
      expect(result[0]).toHaveProperty('pageviews');
    });

    it('should handle empty response from GA4 API', async () => {
      // Mock empty response
      const mockAnalyticsData = require('googleapis').google.analyticsdata;
      mockAnalyticsData.mockReturnValueOnce({
        properties: {
          runReport: jest.fn().mockResolvedValue({
            data: {
              metricHeaders: [],
              dimensionHeaders: [],
              rows: [],
              rowCount: 0
            }
          })
        }
      });

      const newService = new GoogleAnalyticsService();
      const propertyId = '123456789';
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      const result = await newService.getBasicMetrics(propertyId, startDate, endDate);
      expect(result).toEqual([]);
    });
  });

  describe('validatePropertyId', () => {
    it('should validate correct GA4 property ID format', () => {
      const validPropertyIds = ['123456789', '987654321', '123'];
      
      validPropertyIds.forEach(propertyId => {
        expect(service.validatePropertyId(propertyId)).toBe(true);
      });
    });

    it('should reject invalid GA4 property ID format', () => {
      const invalidPropertyIds = ['abc123', '123abc', 'abc', '', '12.34'];
      
      invalidPropertyIds.forEach(propertyId => {
        expect(service.validatePropertyId(propertyId)).toBe(false);
      });
    });
  });

  describe('token management', () => {
    it('should check if token is expired', () => {
      const futureDate = new Date(Date.now() + 3600000); // 1 hour from now
      const pastDate = new Date(Date.now() - 3600000);   // 1 hour ago

      expect(service.isTokenExpired(futureDate)).toBe(false);
      expect(service.isTokenExpired(pastDate)).toBe(true);
    });

    it('should calculate token expiry time in seconds', () => {
      const futureDate = new Date(Date.now() + 5000); // 5 seconds from now
      const pastDate = new Date(Date.now() - 5000);   // 5 seconds ago

      expect(service.getTokenExpirySeconds(futureDate)).toBeGreaterThan(0);
      expect(service.getTokenExpirySeconds(pastDate)).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should handle API errors gracefully', async () => {
      // Mock API error
      const mockAnalyticsData = require('googleapis').google.analyticsdata;
      mockAnalyticsData.mockReturnValueOnce({
        properties: {
          runReport: jest.fn().mockRejectedValue(new Error('API quota exceeded'))
        }
      });

      const newService = new GoogleAnalyticsService();
      const propertyId = '123456789';
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      await expect(newService.getBasicMetrics(propertyId, startDate, endDate))
        .rejects.toThrow('Failed to retrieve GA4 metrics: API quota exceeded');
    });
  });
});
