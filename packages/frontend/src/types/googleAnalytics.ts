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
  rowCount: number;
}

export interface GoogleAnalyticsError {
  code: string;
  message: string;
  details?: any;
}

// Extended metrics for the dashboard display
export interface ExtendedGA4Metrics extends GA4Metrics {
  bounceRate?: number;
  sessionDuration?: number;
  conversionRate?: number;
  goalCompletions?: number;
  revenue?: number;
}

export interface MetricsDisplayData {
  traffic: {
    sessions: number;
    users: number;
    pageviews: number;
  };
  engagement: {
    bounceRate: number;
    sessionDuration: number;
    pagesPerSession: number;
  };
  conversions: {
    conversionRate: number;
    goalCompletions: number;
    revenue: number;
  };
  trends: ExtendedGA4Metrics[];
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface MetricsFilter {
  dateRange: DateRange;
  propertyId: string;
  includeEngagement?: boolean;
  includeConversions?: boolean;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label: string;
}

export interface MetricsComparison {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}
