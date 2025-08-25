import { 
  BusinessOverviewData, 
  BusinessKPI, 
  BusinessHealthScore, 
  BusinessTrend,
  BusinessGoal,
  BusinessRecommendation,
  CustomMetric,
  BusinessOverviewFilters
} from '../types/businessOverview';
import { MetricsDisplayData } from '../types/googleAnalytics';
import { N8nExecutionMetrics } from '../types/n8n';
import GoogleAnalyticsService from './googleAnalyticsService';
import N8nService from './n8nService';

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

class BusinessOverviewService {
  private gaService: GoogleAnalyticsService;
  private n8nService: N8nService;

  constructor() {
    this.gaService = GoogleAnalyticsService;
    this.n8nService = N8nService;
  }

  setAuthToken(token: string) {
    this.gaService.setAuthToken(token);
  }

  /**
   * Get comprehensive business overview data
   */
  async getBusinessOverview(filters: BusinessOverviewFilters): Promise<BusinessOverviewData> {
    try {
      // Fetch data from multiple sources
      const [gaData, n8nData, goals, customMetrics] = await Promise.all([
        this.getGoogleAnalyticsData(filters.dateRange),
        this.getN8nAutomationData(),
        this.getBusinessGoals(),
        this.getCustomMetrics()
      ]);

      // Calculate business health score
      const healthScore = this.calculateBusinessHealthScore(gaData, n8nData);

      // Generate KPIs
      const kpis = this.generateKPIs(gaData, n8nData, healthScore);

      // Generate trends
      const trends = this.generateTrends(gaData, n8nData);

      // Generate recommendations
      const recommendations = this.generateRecommendations(gaData, n8nData, healthScore);

      return {
        kpis,
        healthScore,
        trends,
        goals,
        recommendations,
        customMetrics,
        lastUpdated: new Date().toISOString(),
        dateRange: filters.dateRange
      };
    } catch (error) {
      throw new Error(`Failed to fetch business overview: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get Google Analytics data for business overview
   */
  private async getGoogleAnalyticsData(dateRange: { start: string; end: string }) {
    try {
      const filter = {
        dateRange,
        propertyId: 'default', // This should come from user settings
        includeEngagement: true,
        includeConversions: true
      };
      
      return await this.gaService.getMetricsDisplayData(filter);
    } catch (error) {
      console.warn('Failed to fetch GA data:', error);
      return null;
    }
  }

  /**
   * Get n8n automation data for business overview
   */
  private async getN8nAutomationData() {
    try {
      // For now, we'll use mock data since we need a business entity ID
      // In production, this would come from user context
      const mockIntegrationId = 'mock-integration-id';
      return await this.n8nService.getMetrics(mockIntegrationId);
    } catch (error) {
      console.warn('Failed to fetch n8n data:', error);
      return null;
    }
  }

  /**
   * Get business goals (mock data for now)
   */
  private async getBusinessGoals(): Promise<BusinessGoal[]> {
    return [
      {
        id: 'goal-1',
        name: 'Increase Website Traffic',
        target: 10000,
        current: 7500,
        unit: 'visitors/month',
        deadline: '2024-12-31',
        progress: 75,
        status: 'on-track'
      },
      {
        id: 'goal-2',
        name: 'Improve Conversion Rate',
        target: 5,
        current: 3.2,
        unit: '%',
        deadline: '2024-12-31',
        progress: 64,
        status: 'at-risk'
      },
      {
        id: 'goal-3',
        name: 'Automate 80% of Manual Tasks',
        target: 80,
        current: 65,
        unit: '%',
        deadline: '2024-12-31',
        progress: 81,
        status: 'on-track'
      }
    ];
  }

  /**
   * Get custom metrics (mock data for now)
   */
  private async getCustomMetrics(): Promise<CustomMetric[]> {
    return [
      {
        id: 'custom-1',
        name: 'Customer Acquisition Cost',
        formula: 'Marketing Spend / New Customers',
        description: 'Cost to acquire a new customer',
        category: 'marketing',
        unit: 'USD',
        isActive: true,
        createdAt: '2024-01-01',
        lastCalculated: '2024-01-15',
        value: 45.50
      },
      {
        id: 'custom-2',
        name: 'Customer Lifetime Value',
        formula: 'Average Order Value × Purchase Frequency × Customer Lifespan',
        description: 'Total value a customer brings over their lifetime',
        category: 'business',
        unit: 'USD',
        isActive: true,
        createdAt: '2024-01-01',
        lastCalculated: '2024-01-15',
        value: 1250.00
      }
    ];
  }

  /**
   * Calculate business health score based on multiple metrics
   */
  private calculateBusinessHealthScore(
    gaData: MetricsDisplayData | null, 
    n8nData: N8nExecutionMetrics | null
  ): BusinessHealthScore {
    let trafficScore = 50;
    let engagementScore = 50;
    let conversionScore = 50;
    let automationScore = 50;

    if (gaData) {
      // Calculate traffic score based on sessions trend
      const sessions = gaData.traffic.sessions;
      if (sessions > 10000) trafficScore = 90;
      else if (sessions > 5000) trafficScore = 75;
      else if (sessions > 1000) trafficScore = 60;
      else trafficScore = 40;

      // Calculate engagement score based on bounce rate and session duration
      const bounceRate = gaData.engagement.bounceRate;
      const sessionDuration = gaData.engagement.sessionDuration;
      
      if (bounceRate < 30 && sessionDuration > 180) engagementScore = 90;
      else if (bounceRate < 50 && sessionDuration > 120) engagementScore = 75;
      else if (bounceRate < 70 && sessionDuration > 60) engagementScore = 60;
      else engagementScore = 40;

      // Calculate conversion score
      const conversionRate = gaData.conversions.conversionRate;
      if (conversionRate > 5) conversionScore = 90;
      else if (conversionRate > 3) conversionScore = 75;
      else if (conversionRate > 1) conversionScore = 60;
      else conversionScore = 40;
    }

    if (n8nData) {
      // Calculate automation score based on success rate and time savings
      const successRate = n8nData.successRate;
      const timeSaved = n8nData.totalTimeSaved;
      
      if (successRate > 95 && timeSaved > 100) automationScore = 90;
      else if (successRate > 90 && timeSaved > 50) automationScore = 75;
      else if (successRate > 80 && timeSaved > 20) automationScore = 60;
      else automationScore = 40;
    }

    const overall = Math.round((trafficScore + engagementScore + conversionScore + automationScore) / 4);
    
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (overall > 75) trend = 'improving';
    else if (overall < 50) trend = 'declining';

    const recommendations = this.generateRecommendationTexts(overall, trafficScore, engagementScore, conversionScore, automationScore);

    return {
      overall,
      traffic: trafficScore,
      engagement: engagementScore,
      conversion: conversionScore,
      automation: automationScore,
      lastUpdated: new Date().toISOString(),
      trend,
      recommendations
    };
  }

  /**
   * Generate KPI data from aggregated sources
   */
  private generateKPIs(
    gaData: MetricsDisplayData | null, 
    n8nData: N8nExecutionMetrics | null,
    healthScore: BusinessHealthScore
  ): BusinessKPI[] {
    const kpis: BusinessKPI[] = [];

    if (gaData) {
      // Traffic KPIs
      kpis.push({
        id: 'kpi-traffic-sessions',
        name: 'Total Sessions',
        value: gaData.traffic.sessions,
        unit: 'sessions',
        change: 12.5,
        changePercent: 8.2,
        trend: 'up',
        category: 'traffic',
        status: 'good'
      });

      kpis.push({
        id: 'kpi-traffic-users',
        name: 'Unique Users',
        value: gaData.traffic.users,
        unit: 'users',
        change: 8.3,
        changePercent: 5.1,
        trend: 'up',
        category: 'traffic',
        status: 'good'
      });

      // Engagement KPIs
      kpis.push({
        id: 'kpi-engagement-bounce',
        name: 'Bounce Rate',
        value: gaData.engagement.bounceRate,
        unit: '%',
        change: -2.1,
        changePercent: -4.2,
        trend: 'down',
        category: 'engagement',
        status: 'good',
        target: 30
      });

      kpis.push({
        id: 'kpi-engagement-duration',
        name: 'Session Duration',
        value: Math.round(gaData.engagement.sessionDuration / 60),
        unit: 'minutes',
        change: 0.5,
        changePercent: 3.3,
        trend: 'up',
        category: 'engagement',
        status: 'good'
      });

      // Conversion KPIs
      kpis.push({
        id: 'kpi-conversion-rate',
        name: 'Conversion Rate',
        value: gaData.conversions.conversionRate,
        unit: '%',
        change: 0.3,
        changePercent: 10.3,
        trend: 'up',
        category: 'conversion',
        status: 'good',
        target: 5
      });
    }

    if (n8nData) {
      // Automation KPIs
      kpis.push({
        id: 'kpi-automation-success',
        name: 'Automation Success Rate',
        value: n8nData.successRate,
        unit: '%',
        change: 1.2,
        changePercent: 1.3,
        trend: 'up',
        category: 'automation',
        status: 'good'
      });

      kpis.push({
        id: 'kpi-automation-time',
        name: 'Time Saved',
        value: Math.round(n8nData.totalTimeSaved / 60),
        unit: 'hours',
        change: 15.5,
        changePercent: 12.8,
        trend: 'up',
        category: 'automation',
        status: 'good'
      });
    }

    // Business Health KPI
    kpis.push({
      id: 'kpi-business-health',
      name: 'Business Health Score',
      value: healthScore.overall,
      unit: '/100',
      change: 5,
      changePercent: 7.1,
      trend: 'up',
      category: 'business',
      status: healthScore.overall > 75 ? 'good' : healthScore.overall > 50 ? 'warning' : 'critical'
    });

    return kpis;
  }

  /**
   * Generate trend data for charts
   */
  private generateTrends(
    gaData: MetricsDisplayData | null, 
    n8nData: N8nExecutionMetrics | null
  ): BusinessTrend[] {
    const trends: BusinessTrend[] = [];
    const days = 30;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      let traffic = 0;
      let engagement = 0;
      let conversion = 0;
      let automation = 0;

      if (gaData && gaData.trends.length > 0) {
        const trendData = gaData.trends.find(t => t.date === dateStr);
        if (trendData) {
          traffic = trendData.sessions;
          engagement = trendData.bounceRate || 0;
          conversion = trendData.conversionRate || 0;
        }
      }

      if (n8nData && n8nData.monthlyTrends.length > 0) {
        const monthStr = date.toISOString().substring(0, 7);
        const monthData = n8nData.monthlyTrends.find(t => t.month === monthStr);
        if (monthData) {
          automation = monthData.successRate;
        }
      }

      const overallHealth = Math.round((traffic / 1000 + (100 - engagement) / 100 + conversion * 10 + automation) / 4);

      trends.push({
        date: dateStr,
        traffic,
        engagement,
        conversion,
        automation,
        overallHealth
      });
    }

    return trends;
  }

  /**
   * Generate business recommendations based on data analysis
   */
  private generateRecommendations(
    gaData: MetricsDisplayData | null, 
    n8nData: N8nExecutionMetrics | null,
    healthScore: BusinessHealthScore
  ): BusinessRecommendation[] {
    const recommendations: BusinessRecommendation[] = [];

    if (gaData) {
      if (gaData.engagement.bounceRate > 70) {
        recommendations.push({
          id: 'rec-1',
          title: 'Reduce Bounce Rate',
          description: 'Your bounce rate is high. Consider improving page load speed, content quality, and user experience.',
          impact: 'high',
          category: 'engagement',
          priority: 1,
          actionable: true,
          estimatedEffort: '2-3 weeks'
        });
      }

      if (gaData.conversions.conversionRate < 2) {
        recommendations.push({
          id: 'rec-2',
          title: 'Improve Conversion Rate',
          description: 'Low conversion rate suggests issues with call-to-action placement or landing page optimization.',
          impact: 'high',
          category: 'conversion',
          priority: 2,
          actionable: true,
          estimatedEffort: '3-4 weeks'
        });
      }
    }

    if (n8nData && n8nData.successRate < 90) {
      recommendations.push({
        id: 'rec-3',
        title: 'Fix Automation Failures',
        description: 'Automation success rate is below optimal. Review failed workflows and implement error handling.',
        impact: 'medium',
        category: 'automation',
        priority: 3,
        actionable: true,
        estimatedEffort: '1-2 weeks'
      });
    }

    if (healthScore.overall < 60) {
      recommendations.push({
        id: 'rec-4',
        title: 'Overall Business Health',
        description: 'Business health score indicates areas need attention. Focus on improving weakest metrics first.',
        impact: 'high',
        category: 'general',
        priority: 1,
        actionable: true,
        estimatedEffort: '4-6 weeks'
      });
    }

    // Sort by priority and impact
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.impact] - priorityOrder[a.impact] || a.priority - b.priority;
    });
  }

  /**
   * Generate recommendation text for health score
   */
  private generateRecommendationTexts(
    overall: number,
    traffic: number,
    engagement: number,
    conversion: number,
    automation: number
  ): string[] {
    const recommendations: string[] = [];

    if (overall < 60) {
      recommendations.push('Focus on improving core business metrics');
    }

    if (traffic < 60) {
      recommendations.push('Increase marketing efforts and SEO optimization');
    }

    if (engagement < 60) {
      recommendations.push('Improve website user experience and content quality');
    }

    if (conversion < 60) {
      recommendations.push('Optimize conversion funnels and landing pages');
    }

    if (automation < 60) {
      recommendations.push('Review and fix automation workflows');
    }

    return recommendations;
  }

  /**
   * Export business overview data
   */
  async exportBusinessOverview(filters: BusinessOverviewFilters): Promise<string> {
    try {
      const data = await this.getBusinessOverview(filters);
      const csv = this.convertToCSV(data);
      return csv;
    } catch (error) {
      throw new Error(`Failed to export business overview: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert business overview data to CSV format
   */
  private convertToCSV(data: BusinessOverviewData): string {
    const headers = ['Metric', 'Value', 'Unit', 'Change', 'Change %', 'Status'];
    const rows = data.kpis.map(kpi => [
      kpi.name,
      kpi.value.toString(),
      kpi.unit,
      kpi.change.toString(),
      `${kpi.changePercent}%`,
      kpi.status
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }
}

export default BusinessOverviewService;
