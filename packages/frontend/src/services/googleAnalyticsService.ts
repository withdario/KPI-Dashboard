import axios from 'axios';
import { 
  GA4Metrics, 
  ExtendedGA4Metrics,
  MetricsDisplayData,
  MetricsFilter
} from '../types/googleAnalytics';

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

class GoogleAnalyticsService {
  private api = axios.create({
    baseURL: `${API_BASE_URL}/google-analytics`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add auth token to requests
  setAuthToken(token: string) {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Remove auth token
  clearAuthToken() {
    delete this.api.defaults.headers.common['Authorization'];
  }

  /**
   * Get basic metrics from GA4
   */
  async getBasicMetrics(propertyId: string, startDate: string, endDate: string): Promise<GA4Metrics[]> {
    try {
      const response = await this.api.get('/metrics', {
        params: { propertyId, startDate, endDate }
      });
      
      if (response.data.success) {
        return response.data.data.metrics || [];
      }
      
      throw new Error(response.data.error || 'Failed to fetch metrics');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to fetch metrics');
      }
      throw error;
    }
  }

  /**
   * Get extended metrics including engagement and conversion data
   */
  async getExtendedMetrics(filter: MetricsFilter): Promise<ExtendedGA4Metrics[]> {
    try {
      // For now, we'll use the basic metrics endpoint and simulate extended data
      // In a real implementation, this would call a more comprehensive endpoint
      const basicMetrics = await this.getBasicMetrics(
        filter.propertyId,
        filter.dateRange.startDate,
        filter.dateRange.endDate
      );

      // Simulate extended metrics data
      return basicMetrics.map(metric => ({
        ...metric,
        bounceRate: Math.random() * 100, // Simulated data
        sessionDuration: Math.random() * 300, // Simulated data in seconds
        conversionRate: Math.random() * 10, // Simulated data
        goalCompletions: Math.floor(Math.random() * 50), // Simulated data
        revenue: Math.random() * 1000, // Simulated data
      }));
    } catch (error) {
      throw new Error(`Failed to fetch extended metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get metrics display data for dashboard
   */
  async getMetricsDisplayData(filter: MetricsFilter): Promise<MetricsDisplayData> {
    try {
      const extendedMetrics = await this.getExtendedMetrics(filter);
      
      if (extendedMetrics.length === 0) {
        throw new Error('No metrics data available for the specified date range');
      }

      // Calculate aggregated metrics
      const totalSessions = extendedMetrics.reduce((sum, m) => sum + m.sessions, 0);
      const totalUsers = extendedMetrics.reduce((sum, m) => sum + m.users, 0);
      const totalPageviews = extendedMetrics.reduce((sum, m) => sum + m.pageviews, 0);
      
      const avgBounceRate = extendedMetrics.reduce((sum, m) => sum + (m.bounceRate || 0), 0) / extendedMetrics.length;
      const avgSessionDuration = extendedMetrics.reduce((sum, m) => sum + (m.sessionDuration || 0), 0) / extendedMetrics.length;
      const pagesPerSession = totalPageviews / totalSessions;

      const totalConversions = extendedMetrics.reduce((sum, m) => sum + (m.goalCompletions || 0), 0);
      const conversionRate = totalUsers > 0 ? (totalConversions / totalUsers) * 100 : 0;
      const totalRevenue = extendedMetrics.reduce((sum, m) => sum + (m.revenue || 0), 0);

      return {
        traffic: {
          sessions: totalSessions,
          users: totalUsers,
          pageviews: totalPageviews,
        },
        engagement: {
          bounceRate: avgBounceRate,
          sessionDuration: avgSessionDuration,
          pagesPerSession: pagesPerSession,
        },
        conversions: {
          conversionRate: conversionRate,
          goalCompletions: totalConversions,
          revenue: totalRevenue,
        },
        trends: extendedMetrics,
      };
    } catch (error) {
      throw new Error(`Failed to get metrics display data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get metrics comparison data (current vs previous period)
   */
  async getMetricsComparison(
    propertyId: string, 
    currentStart: string, 
    currentEnd: string,
    previousStart: string,
    previousEnd: string
  ): Promise<{
    traffic: Record<string, any>;
    engagement: Record<string, any>;
    conversions: Record<string, any>;
  }> {
    try {
      const [currentData, previousData] = await Promise.all([
        this.getMetricsDisplayData({
          propertyId,
          dateRange: { startDate: currentStart, endDate: currentEnd },
          includeEngagement: true,
          includeConversions: true,
        }),
        this.getMetricsDisplayData({
          propertyId,
          dateRange: { startDate: previousStart, endDate: previousEnd },
          includeEngagement: true,
          includeConversions: true,
        }),
      ]);

      const calculateComparison = (current: number, previous: number) => {
        const change = current - previous;
        const changePercent = previous > 0 ? (change / previous) * 100 : 0;
        const trend: 'up' | 'down' | 'stable' = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';
        
        return { current, previous, change, changePercent, trend };
      };

      return {
        traffic: {
          sessions: calculateComparison(currentData.traffic.sessions, previousData.traffic.sessions),
          users: calculateComparison(currentData.traffic.users, previousData.traffic.users),
          pageviews: calculateComparison(currentData.traffic.pageviews, previousData.traffic.pageviews),
        },
        engagement: {
          bounceRate: calculateComparison(currentData.engagement.bounceRate, previousData.engagement.bounceRate),
          sessionDuration: calculateComparison(currentData.engagement.sessionDuration, previousData.engagement.sessionDuration),
          pagesPerSession: calculateComparison(currentData.engagement.pagesPerSession, previousData.engagement.pagesPerSession),
        },
        conversions: {
          conversionRate: calculateComparison(currentData.conversions.conversionRate, previousData.conversions.conversionRate),
          goalCompletions: calculateComparison(currentData.conversions.goalCompletions, previousData.conversions.goalCompletions),
          revenue: calculateComparison(currentData.conversions.revenue, previousData.conversions.revenue),
        },
      };
    } catch (error) {
      throw new Error(`Failed to get metrics comparison: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export metrics data as CSV
   */
  async exportMetricsCSV(filter: MetricsFilter): Promise<string> {
    try {
      const data = await this.getMetricsDisplayData(filter);
      
      // Create CSV content
      const headers = ['Date', 'Sessions', 'Users', 'Pageviews', 'Bounce Rate', 'Session Duration', 'Conversion Rate', 'Goal Completions', 'Revenue'];
      const csvRows = [headers.join(',')];
      
      data.trends.forEach(metric => {
        const row = [
          metric.date,
          metric.sessions,
          metric.users,
          metric.pageviews,
          metric.bounceRate || 0,
          metric.sessionDuration || 0,
          metric.conversionRate || 0,
          metric.goalCompletions || 0,
          metric.revenue || 0,
        ].join(',');
        csvRows.push(row);
      });
      
      return csvRows.join('\n');
    } catch (error) {
      throw new Error(`Failed to export metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check service health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.api.get('/health');
      return response.data.success;
    } catch (error) {
      return false;
    }
  }
}

export const googleAnalyticsService = new GoogleAnalyticsService();
export default googleAnalyticsService;
