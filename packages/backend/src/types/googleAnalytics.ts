export interface GoogleAnalyticsCredentials {
  clientId: string;
  clientSecret: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiry: Date;
}

export interface GoogleAnalyticsIntegration {
  id: string;
  businessEntityId: string;
  propertyId: string;
  clientId: string;
  clientSecret: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiry: Date;
  isActive: boolean;
  lastSyncAt?: Date;
  syncStatus: 'PENDING' | 'ACTIVE' | 'ERROR' | 'DISABLED';
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GA4Metrics {
  sessions: number;
  users: number;
  pageviews: number;
  date: string;
}

export interface GA4MetricsRequest {
  propertyId: string;
  startDate: string;
  endDate: string;
  metrics: string[];
  dimensions?: string[];
}

export interface GA4MetricsResponse {
  propertyId: string;
  startDate: string;
  endDate: string;
  metrics: GA4Metrics[];
  totalRows: number;
  rowCount: number;
  metricHeaders: Array<{
    name: string;
    type: string;
  }>;
  dimensionHeaders: Array<{
    name: string;
  }>;
  rows: Array<{
    dimensionValues: Array<{
      value: string;
    }>;
    metricValues: Array<{
      value: string;
    }>;
  }>;
  fallback?: boolean;
  message?: string;
}

export interface GoogleAnalyticsError {
  code: string;
  message: string;
  details?: any;
}
