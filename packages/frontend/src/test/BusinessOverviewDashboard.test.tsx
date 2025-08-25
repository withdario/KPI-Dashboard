import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import BusinessOverviewDashboard from '../components/BusinessOverviewDashboard';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  RefreshCw: () => <div data-testid="refresh-icon">RefreshCw</div>,
  Download: () => <div data-testid="download-icon">Download</div>,
  Filter: () => <div data-testid="filter-icon">Filter</div>,
  TrendingUp: () => <div data-testid="trending-up-icon">TrendingUp</div>,
  BarChart3: () => <div data-testid="bar-chart-icon">BarChart3</div>,
  Target: () => <div data-testid="target-icon">Target</div>,
  Lightbulb: () => <div data-testid="lightbulb-icon">Lightbulb</div>,
  Calculator: () => <div data-testid="calculator-icon">Calculator</div>,
  Calendar: () => <div data-testid="calendar-icon">Calendar</div>,
  Eye: () => <div data-testid="eye-icon">Eye</div>,
  EyeOff: () => <div data-testid="eye-off-icon">EyeOff</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  Edit: () => <div data-testid="edit-icon">Edit</div>,
  Trash2: () => <div data-testid="trash-icon">Trash2</div>,
  AlertTriangle: () => <div data-testid="alert-icon">AlertTriangle</div>,
  CheckCircle: () => <div data-testid="check-icon">CheckCircle</div>,
  XCircle: () => <div data-testid="x-icon">XCircle</div>,
  TrendingDown: () => <div data-testid="trending-down-icon">TrendingDown</div>,
  Minus: () => <div data-testid="minus-icon">Minus</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>,
  Zap: () => <div data-testid="zap-icon">Zap</div>
}));

// Mock the useBusinessOverview hook
vi.mock('../hooks/useBusinessOverview', () => ({
  useBusinessOverview: () => ({
    businessOverview: {
      kpis: [
        {
          id: '1',
          name: 'Total Revenue',
          value: 125000,
          unit: 'USD',
          change: 12.5,
          changePercent: 12.5,
          trend: 'up',
          status: 'good',
          category: 'revenue',
          target: 150000,
          description: 'Total revenue generated'
        }
      ],
      healthScore: {
        overall: 85,
        traffic: 90,
        engagement: 80,
        conversion: 85,
        automation: 85,
        lastUpdated: '2024-01-15T10:00:00Z',
        trend: 'improving',
        recommendations: ['Focus on improving engagement metrics', 'Continue optimizing conversion funnels']
      },
      goals: [
        {
          id: '1',
          name: 'Increase Revenue',
          target: 150000,
          current: 125000,
          deadline: '2024-12-31',
          status: 'on-track'
        }
      ],
      recommendations: [
        {
          id: '1',
          title: 'Optimize Conversion Funnel',
          description: 'Focus on improving conversion rates',
          impact: 'high',
          priority: 'high',
          effort: 'medium'
        }
      ],
      customMetrics: [
        {
          id: '1',
          name: 'Customer Lifetime Value',
          formula: 'Revenue per customer * Average customer lifespan',
          description: 'Total value of a customer over time',
          category: 'customer',
          unit: 'USD',
          isVisible: true
        }
      ]
    },
    isLoading: false,
    error: null,
    refreshData: vi.fn(),
    exportData: vi.fn(),
    isExporting: false,
    getSummaryStats: vi.fn(() => ({
      totalRevenue: 125000,
      totalVisitors: 50000,
      conversionRate: 2.5,
      automationEfficiency: 85
    })),
    isDataStale: vi.fn(() => false)
  })
}));

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('BusinessOverviewDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dashboard with all components', () => {
    renderWithQueryClient(<BusinessOverviewDashboard />);
    
    // Check main sections
    expect(screen.getByText('Business Overview')).toBeInTheDocument();
    expect(screen.getByText('Comprehensive view of your business performance and insights')).toBeInTheDocument();
    expect(screen.getByText('Refresh')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('displays summary statistics correctly', () => {
    renderWithQueryClient(<BusinessOverviewDashboard />);
    
    expect(screen.getByText('KPI Health')).toBeInTheDocument();
    expect(screen.getByText('Goals Progress')).toBeInTheDocument();
    expect(screen.getByText('Actionable Items')).toBeInTheDocument();
    expect(screen.getAllByText('Custom Metrics')).toHaveLength(2); // Appears twice in the DOM
  });

  it('shows date range picker', () => {
    renderWithQueryClient(<BusinessOverviewDashboard />);
    
    expect(screen.getByText('Date Range:')).toBeInTheDocument();
    expect(screen.getByText('7D')).toBeInTheDocument();
    expect(screen.getByText('30D')).toBeInTheDocument();
    expect(screen.getByText('90D')).toBeInTheDocument();
  });

  it('has refresh and export buttons', () => {
    renderWithQueryClient(<BusinessOverviewDashboard />);
    
    expect(screen.getByText('Refresh')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('renders with proper structure', () => {
    renderWithQueryClient(<BusinessOverviewDashboard />);
    
    // Check that the main dashboard container is rendered
    expect(screen.getByText('Business Overview')).toBeInTheDocument();
    
    // Check that summary stats are displayed
    expect(screen.getByText('KPI Health')).toBeInTheDocument();
    expect(screen.getByText('Goals Progress')).toBeInTheDocument();
    expect(screen.getByText('Actionable Items')).toBeInTheDocument();
    expect(screen.getAllByText('Custom Metrics')).toHaveLength(2); // Appears twice in the DOM
  });
});
