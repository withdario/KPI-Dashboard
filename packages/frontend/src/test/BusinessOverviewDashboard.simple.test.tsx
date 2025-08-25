import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
    businessOverview: null,
    isLoading: true,
    error: null,
    refreshData: vi.fn(),
    exportData: vi.fn(),
    isExporting: false,
    getSummaryStats: vi.fn(),
    isDataStale: vi.fn()
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

describe('BusinessOverviewDashboard - Simple Tests', () => {
  it('renders loading state correctly', () => {
    renderWithQueryClient(<BusinessOverviewDashboard />);
    expect(screen.getByText('Loading business overview...')).toBeInTheDocument();
  });

  it('renders with proper structure', () => {
    renderWithQueryClient(<BusinessOverviewDashboard />);
    expect(screen.getByText('Loading business overview...')).toBeInTheDocument();
  });
});
