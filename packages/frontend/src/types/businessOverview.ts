export interface BusinessKPI {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  category: 'traffic' | 'engagement' | 'conversion' | 'automation' | 'business';
  target?: number;
  status: 'good' | 'warning' | 'critical';
}

export interface BusinessHealthScore {
  overall: number; // 0-100
  traffic: number;
  engagement: number;
  conversion: number;
  automation: number;
  lastUpdated: string;
  trend: 'improving' | 'declining' | 'stable';
  recommendations: string[];
}

export interface BusinessTrend {
  date: string;
  traffic: number;
  engagement: number;
  conversion: number;
  automation: number;
  overallHealth: number;
}

export interface BusinessGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  progress: number; // 0-100
  status: 'on-track' | 'at-risk' | 'behind' | 'completed';
}

export interface BusinessRecommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'traffic' | 'engagement' | 'conversion' | 'automation' | 'general';
  priority: number;
  actionable: boolean;
  estimatedEffort: string;
}

export interface CustomMetric {
  id: string;
  name: string;
  formula: string;
  description: string;
  category: string;
  unit: string;
  isActive: boolean;
  createdAt: string;
  lastCalculated: string;
  value?: number;
}

export interface BusinessOverviewData {
  kpis: BusinessKPI[];
  healthScore: BusinessHealthScore;
  trends: BusinessTrend[];
  goals: BusinessGoal[];
  recommendations: BusinessRecommendation[];
  customMetrics: CustomMetric[];
  lastUpdated: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface BusinessOverviewFilters {
  dateRange: {
    start: string;
    end: string;
  };
  categories: string[];
  includeCustomMetrics: boolean;
  includeRecommendations: boolean;
}
