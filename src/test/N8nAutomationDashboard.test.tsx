import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import N8nAutomationDashboard from '../components/N8nAutomationDashboard';
import { useN8nAutomation } from '../hooks/useN8nAutomation';

// Mock the custom hook
jest.mock('../hooks/useN8nAutomation');
const mockUseN8nAutomation = useN8nAutomation as jest.MockedFunction<typeof useN8nAutomation>;

// Mock child components
jest.mock('../components/WorkflowStatusCard', () => {
  return function MockWorkflowStatusCard({ workflow, onWorkflowClick }: any) {
    return (
      <div data-testid="workflow-status-card" onClick={() => onWorkflowClick?.(workflow)}>
        {workflow.name} - {workflow.status}
      </div>
    );
  };
});

jest.mock('../components/PerformanceAlerts', () => {
  return function MockPerformanceAlerts({ alerts, onAlertClick, onResolveAlert }: any) {
    return (
      <div data-testid="performance-alerts">
        {alerts.map((alert: any, index: number) => (
          <div key={index} data-testid={`alert-${index}`} onClick={() => onAlertClick?.(alert)}>
            {alert.message}
            {!alert.isResolved && (
              <button onClick={(e) => { e.stopPropagation(); onResolveAlert?.(alert.id); }}>
                Resolve
              </button>
            )}
          </div>
        ))}
      </div>
    );
  };
});

jest.mock('../components/ROIMetrics', () => {
  return function MockROIMetrics({ roiData, onWorkflowClick }: any) {
    return (
      <div data-testid="roi-metrics">
        {roiData.map((roi: any, index: number) => (
          <div key={index} data-testid={`roi-${index}`} onClick={() => onWorkflowClick?.(roi)}>
            {roi.workflowName} - {roi.roiPercentage}%
          </div>
        ))}
      </div>
    );
  };
});

jest.mock('../components/WorkflowFilters', () => {
  return function MockWorkflowFilters({ filters, onFiltersChange, onRefresh }: any) {
    return (
      <div data-testid="workflow-filters">
        <button onClick={() => onFiltersChange({ ...filters, search: 'test' })}>
          Update Filters
        </button>
        <button onClick={onRefresh}>Refresh</button>
      </div>
    );
  };
});

jest.mock('../components/DashboardWidget', () => {
  return function MockDashboardWidget({ title, subtitle, children }: any) {
    return (
      <div data-testid="dashboard-widget">
        {title && <h3>{title}</h3>}
        {subtitle && <p>{subtitle}</p>}
        {children}
      </div>
    );
  };
});

jest.mock('../components/DashboardGrid', () => {
  return function MockDashboardGrid({ children, cols, gap }: any) {
    return (
      <div data-testid="dashboard-grid" data-cols={cols} data-gap={gap}>
        {children}
      </div>
    );
  };
});

const mockQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithQueryClient = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={mockQueryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('N8nAutomationDashboard', () => {
  const defaultMockData = {
    integration: {
      webhookUrl: 'https://test.com/webhook',
      isActive: true,
      webhookCount: 42,
      lastWebhookAt: '2024-01-01T10:00:00Z'
    },
    metrics: {
      activeWorkflows: 5,
      totalWorkflows: 10,
      successRate: 85.5,
      successfulWorkflows: 8,
      totalTimeSaved: 3600000 // 1 hour in ms
    },
    workflows: [
      {
        id: 'workflow-1',
        name: 'Test Workflow 1',
        status: 'running',
        lastRunAt: '2024-01-01T10:00:00Z',
        duration: 300000,
        timeSaved: 1800000,
        successRate: 90,
        metadata: { category: 'marketing', priority: 'high' }
      },
      {
        id: 'workflow-2',
        name: 'Test Workflow 2',
        status: 'completed',
        lastRunAt: '2024-01-01T09:00:00Z',
        duration: 600000,
        timeSaved: 2400000,
        successRate: 95,
        metadata: { category: 'sales', priority: 'medium' }
      }
    ],
    alerts: [
      {
        id: 'alert-1',
        message: 'Workflow performance degraded',
        severity: 'warning',
        isResolved: false,
        workflowName: 'Test Workflow 1'
      },
      {
        id: 'alert-2',
        message: 'Critical workflow failure',
        severity: 'critical',
        isResolved: false,
        workflowName: 'Test Workflow 2'
      }
    ],
    roi: [
      {
        id: 'roi-1',
        workflowName: 'Test Workflow 1',
        roiPercentage: 150,
        costSavings: 5000,
        timeSavings: 3600000
      }
    ],
    isLoading: false,
    hasError: false,
    refreshAll: jest.fn(),
    exportMutation: {
      mutate: jest.fn(),
      isPending: false
    },
    getFilteredWorkflows: jest.fn().mockReturnValue([
      {
        id: 'workflow-1',
        name: 'Test Workflow 1',
        status: 'running',
        lastRunAt: '2024-01-01T10:00:00Z',
        duration: 300000,
        timeSaved: 1800000,
        successRate: 90,
        metadata: { category: 'marketing', priority: 'high' }
      }
    ])
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseN8nAutomation.mockReturnValue(defaultMockData);
  });

  it('renders the dashboard header correctly', () => {
    renderWithQueryClient(<N8nAutomationDashboard />);
    
    expect(screen.getByText('n8n Automation Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Monitor workflow performance, track ROI, and manage automation health')).toBeInTheDocument();
  });

  it('renders summary metrics correctly', () => {
    renderWithQueryClient(<N8nAutomationDashboard />);
    
    expect(screen.getByText('Active Workflows')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('of 10 total')).toBeInTheDocument();
    
    expect(screen.getByText('Success Rate')).toBeInTheDocument();
    expect(screen.getByText('85.5%')).toBeInTheDocument();
    expect(screen.getByText('8 successful')).toBeInTheDocument();
    
    expect(screen.getByText('Time Saved')).toBeInTheDocument();
    expect(screen.getByText('1.0h')).toBeInTheDocument();
    expect(screen.getByText('This month')).toBeInTheDocument();
    
    expect(screen.getByText('Active Alerts')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1 critical')).toBeInTheDocument();
  });

  it('renders workflow filters', () => {
    renderWithQueryClient(<N8nAutomationDashboard />);
    
    expect(screen.getByTestId('workflow-filters')).toBeInTheDocument();
  });

  it('renders workflow status overview', () => {
    renderWithQueryClient(<N8nAutomationDashboard />);
    
    expect(screen.getByText('Workflow Status Overview')).toBeInTheDocument();
    expect(screen.getByText('Individual workflow performance and health')).toBeInTheDocument();
    expect(screen.getByTestId('workflow-status-card')).toBeInTheDocument();
  });

  it('renders performance alerts section', () => {
    renderWithQueryClient(<N8nAutomationDashboard />);
    
    expect(screen.getByText('Performance Alerts')).toBeInTheDocument();
    expect(screen.getByText('Active notifications and warnings')).toBeInTheDocument();
    expect(screen.getByTestId('performance-alerts')).toBeInTheDocument();
  });

  it('renders ROI metrics section', () => {
    renderWithQueryClient(<N8nAutomationDashboard />);
    
    expect(screen.getByText('Automation ROI Analysis')).toBeInTheDocument();
    expect(screen.getByText('Return on investment calculations and cost savings')).toBeInTheDocument();
    expect(screen.getByTestId('roi-metrics')).toBeInTheDocument();
  });

  it('renders integration status when available', () => {
    renderWithQueryClient(<N8nAutomationDashboard />);
    
    expect(screen.getByText('n8n Integration Status')).toBeInTheDocument();
    expect(screen.getByText('Connected to https://test.com/webhook')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('42 webhooks received')).toBeInTheDocument();
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('handles refresh button click', () => {
    renderWithQueryClient(<N8nAutomationDashboard />);
    
    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);
    
    expect(defaultMockData.refreshAll).toHaveBeenCalled();
  });

  it('handles export button click', () => {
    renderWithQueryClient(<N8nAutomationDashboard />);
    
    const exportButton = screen.getByText('Export Data');
    fireEvent.click(exportButton);
    
    expect(defaultMockData.exportMutation.mutate).toHaveBeenCalled();
  });

  it('handles workflow click events', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    renderWithQueryClient(<N8nAutomationDashboard />);
    
    const workflowCard = screen.getByTestId('workflow-status-card');
    fireEvent.click(workflowCard);
    
    expect(consoleSpy).toHaveBeenCalledWith('Workflow clicked:', expect.any(Object));
    consoleSpy.mockRestore();
  });

  it('handles alert click events', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    renderWithQueryClient(<N8nAutomationDashboard />);
    
    const alertElement = screen.getByTestId('alert-0');
    fireEvent.click(alertElement);
    
    expect(consoleSpy).toHaveBeenCalledWith('Alert clicked:', expect.any(Object));
    consoleSpy.mockRestore();
  });

  it('handles alert resolve events', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    renderWithQueryClient(<N8nAutomationDashboard />);
    
    const resolveButton = screen.getByText('Resolve');
    fireEvent.click(resolveButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Resolve alert:', 'alert-1');
    consoleSpy.mockRestore();
  });

  it('handles ROI click events', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    renderWithQueryClient(<N8nAutomationDashboard />);
    
    const roiElement = screen.getByTestId('roi-0');
    fireEvent.click(roiElement);
    
    expect(consoleSpy).toHaveBeenCalledWith('ROI clicked:', expect.any(Object));
    consoleSpy.mockRestore();
  });

  it('displays loading state correctly', () => {
    mockUseN8nAutomation.mockReturnValue({
      ...defaultMockData,
      isLoading: true
    });
    
    renderWithQueryClient(<N8nAutomationDashboard />);
    
    const refreshButton = screen.getByText('Refresh');
    expect(refreshButton).toBeDisabled();
    
    const exportButton = screen.getByText('Export Data');
    expect(exportButton).toBeDisabled();
  });

  it('displays error state correctly', () => {
    mockUseN8nAutomation.mockReturnValue({
      ...defaultMockData,
      hasError: true
    });
    
    renderWithQueryClient(<N8nAutomationDashboard />);
    
    expect(screen.getByText('Error Loading Dashboard')).toBeInTheDocument();
    expect(screen.getByText('There was an error loading the automation dashboard. Please check your connection and try again.')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('handles retry button click in error state', () => {
    mockUseN8nAutomation.mockReturnValue({
      ...defaultMockData,
      hasError: true
    });
    
    renderWithQueryClient(<N8nAutomationDashboard />);
    
    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);
    
    expect(defaultMockData.refreshAll).toHaveBeenCalled();
  });

  it('displays no workflows message when no workflows exist', () => {
    mockUseN8nAutomation.mockReturnValue({
      ...defaultMockData,
      workflows: [],
      getFilteredWorkflows: jest.fn().mockReturnValue([])
    });
    
    renderWithQueryClient(<N8nAutomationDashboard />);
    
    expect(screen.getByText('No Workflows Found')).toBeInTheDocument();
    expect(screen.getByText('No workflows have been configured yet.')).toBeInTheDocument();
  });

  it('displays no ROI data message when no ROI data exists', () => {
    mockUseN8nAutomation.mockReturnValue({
      ...defaultMockData,
      roi: []
    });
    
    renderWithQueryClient(<N8nAutomationDashboard />);
    
    expect(screen.getByText('No ROI data available yet.')).toBeInTheDocument();
  });

  it('applies custom className prop', () => {
    renderWithQueryClient(<N8nAutomationDashboard className="custom-class" />);
    
    const dashboard = screen.getByText('n8n Automation Dashboard').closest('div');
    expect(dashboard).toHaveClass('custom-class');
  });

  it('handles missing integration gracefully', () => {
    mockUseN8nAutomation.mockReturnValue({
      ...defaultMockData,
      integration: null
    });
    
    renderWithQueryClient(<N8nAutomationDashboard />);
    
    expect(screen.queryByText('n8n Integration Status')).not.toBeInTheDocument();
  });

  it('handles missing metrics gracefully', () => {
    mockUseN8nAutomation.mockReturnValue({
      ...defaultMockData,
      metrics: null
    });
    
    renderWithQueryClient(<N8nAutomationDashboard />);
    
    expect(screen.getByText('0')).toBeInTheDocument(); // Default values
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('0h')).toBeInTheDocument();
  });

  it('handles missing workflows gracefully', () => {
    mockUseN8nAutomation.mockReturnValue({
      ...defaultMockData,
      workflows: null
    });
    
    renderWithQueryClient(<N8nAutomationDashboard />);
    
    expect(screen.getByText('No Workflows Found')).toBeInTheDocument();
  });

  it('handles missing alerts gracefully', () => {
    mockUseN8nAutomation.mockReturnValue({
      ...defaultMockData,
      alerts: null
    });
    
    renderWithQueryClient(<N8nAutomationDashboard />);
    
    expect(screen.getByText('0')).toBeInTheDocument(); // Default value for active alerts
  });

  it('handles missing ROI data gracefully', () => {
    mockUseN8nAutomation.mockReturnValue({
      ...defaultMockData,
      roi: null
    });
    
    renderWithQueryClient(<N8nAutomationDashboard />);
    
    expect(screen.getByText('No ROI data available yet.')).toBeInTheDocument();
  });
});
