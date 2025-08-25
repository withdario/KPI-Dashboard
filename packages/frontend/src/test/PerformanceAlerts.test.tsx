import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '../test/setup';
import PerformanceAlerts from '../components/PerformanceAlerts';
import { N8nPerformanceAlert } from '../types/n8n';

const mockAlerts: N8nPerformanceAlert[] = [
  {
    id: 'alert-1',
    workflowId: 'workflow-1',
    workflowName: 'Lead Generation Workflow',
    alertType: 'success_rate_drop',
    severity: 'critical',
    message: 'Success rate dropped to 65.2%',
    threshold: 90,
    currentValue: 65.2,
    triggeredAt: '2024-01-01T10:00:00Z',
    isResolved: false
  },
  {
    id: 'alert-2',
    workflowId: 'workflow-2',
    workflowName: 'Email Campaign Workflow',
    alertType: 'execution_time_increase',
    severity: 'high',
    message: 'Average execution time increased to 45.2s',
    threshold: 10000,
    currentValue: 45200,
    triggeredAt: '2024-01-01T09:30:00Z',
    isResolved: false
  },
  {
    id: 'alert-3',
    workflowId: 'workflow-3',
    workflowName: 'Data Sync Workflow',
    alertType: 'failure_spike',
    severity: 'medium',
    message: 'Failure count increased to 8',
    threshold: 5,
    currentValue: 8,
    triggeredAt: '2024-01-01T08:00:00Z',
    isResolved: false
  }
];

const mockResolvedAlert: N8nPerformanceAlert = {
  id: 'alert-4',
  workflowId: 'workflow-4',
  workflowName: 'Invoice Workflow',
  alertType: 'workflow_error',
  severity: 'low',
  message: 'Workflow encountered an error',
  threshold: 0,
  currentValue: 1,
  triggeredAt: '2024-01-01T07:00:00Z',
  isResolved: true,
  resolvedAt: '2024-01-01T07:30:00Z'
};

describe('PerformanceAlerts', () => {
  it('renders alerts correctly', () => {
    render(<PerformanceAlerts alerts={mockAlerts} />);
    
    expect(screen.getByText('Performance Alerts')).toBeInTheDocument();
    expect(screen.getByText('3 active alerts')).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByText('Lead Generation Workflow')).toBeInTheDocument();
    expect(screen.getByText('Email Campaign Workflow')).toBeInTheDocument();
    expect(screen.getByText('Data Sync Workflow')).toBeInTheDocument();
  });

  it('displays no alerts message when there are no alerts', () => {
    render(<PerformanceAlerts alerts={[]} />);
    
    expect(screen.getByText('All systems operational')).toBeInTheDocument();
    expect(screen.getByText('No performance alerts at this time.')).toBeInTheDocument();
  });

  it('displays critical alert indicator when critical alerts exist', () => {
    render(<PerformanceAlerts alerts={mockAlerts} />);
    
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  it('displays correct alert types with appropriate icons', () => {
    render(<PerformanceAlerts alerts={mockAlerts} />);
    
    expect(screen.getByText('Success Rate Drop')).toBeInTheDocument();
    expect(screen.getByText('Execution Time Increase')).toBeInTheDocument();
    expect(screen.getByText('Failure Spike')).toBeInTheDocument();
  });

  it('displays severity levels with appropriate styling', () => {
    render(<PerformanceAlerts alerts={mockAlerts} />);
    
    const criticalAlert = screen.getByText('critical');
    const highAlert = screen.getByText('high');
    const mediumAlert = screen.getByText('medium');
    
    expect(criticalAlert).toHaveClass('bg-red-100', 'text-red-800');
    expect(highAlert).toHaveClass('bg-red-100', 'text-red-800');
    expect(mediumAlert).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('displays alert messages correctly', () => {
    render(<PerformanceAlerts alerts={mockAlerts} />);
    
    expect(screen.getByText('Success rate dropped to 65.2%')).toBeInTheDocument();
    expect(screen.getByText('Average execution time increased to 45.2s')).toBeInTheDocument();
    expect(screen.getByText('Failure count increased to 8')).toBeInTheDocument();
  });

  it('formats values correctly for different alert types', () => {
    render(<PerformanceAlerts alerts={mockAlerts} />);
    
    // Success rate drop - check for the values in the metrics section
    expect(screen.getByText('65.2%')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
    
    // Execution time increase
    expect(screen.getByText('45.2s')).toBeInTheDocument();
    expect(screen.getByText('10.0s')).toBeInTheDocument();
    
    // Failure spike
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('formats timestamps correctly', () => {
    // Use more recent dates for the timestamp test
    const recentAlerts = [
      { ...mockAlerts[0], triggeredAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() }, // 30 min ago
      { ...mockAlerts[1], triggeredAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() }, // 1 hour ago
      { ...mockAlerts[2], triggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() } // 2 hours ago
    ];
    
    render(<PerformanceAlerts alerts={recentAlerts} />);
    
    expect(screen.getByText('30m ago')).toBeInTheDocument();
    expect(screen.getByText('1h ago')).toBeInTheDocument();
    expect(screen.getByText('2h ago')).toBeInTheDocument();
  });

  it('handles click events on alerts', () => {
    const mockOnClick = vi.fn();
    render(<PerformanceAlerts alerts={mockAlerts} onAlertClick={mockOnClick} />);
    
    const firstAlert = screen.getByText('Lead Generation Workflow').closest('div');
    fireEvent.click(firstAlert!);
    
    expect(mockOnClick).toHaveBeenCalledWith(mockAlerts[0]);
  });

  it('displays resolve button for unresolved alerts', () => {
    const mockOnResolve = vi.fn();
    render(<PerformanceAlerts alerts={mockAlerts} onResolveAlert={mockOnResolve} />);
    
    const resolveButtons = screen.getAllByText('Resolve');
    expect(resolveButtons).toHaveLength(3);
  });

  it('handles resolve button clicks', () => {
    const mockOnResolve = vi.fn();
    render(<PerformanceAlerts alerts={mockAlerts} onResolveAlert={mockOnResolve} />);
    
    const firstResolveButton = screen.getAllByText('Resolve')[0];
    fireEvent.click(firstResolveButton);
    
    expect(mockOnResolve).toHaveBeenCalledWith('alert-1');
  });

  it('displays resolved status for resolved alerts', () => {
    render(<PerformanceAlerts alerts={[mockResolvedAlert]} />);
    
    expect(screen.getByText('Resolved')).toBeInTheDocument();
    expect(screen.queryByText('Resolve')).not.toBeInTheDocument();
  });

  it('limits displayed alerts based on maxAlerts prop', () => {
    render(<PerformanceAlerts alerts={mockAlerts} maxAlerts={2} />);
    
    expect(screen.getByText('Lead Generation Workflow')).toBeInTheDocument();
    expect(screen.getByText('Email Campaign Workflow')).toBeInTheDocument();
    expect(screen.queryByText('Data Sync Workflow')).not.toBeInTheDocument();
    
    expect(screen.getByText('View 1 more alert')).toBeInTheDocument();
  });

  it('shows correct alert count in header', () => {
    render(<PerformanceAlerts alerts={mockAlerts} />);
    
    expect(screen.getByText('3 active alerts')).toBeInTheDocument();
  });

  it('shows singular form for single alert', () => {
    render(<PerformanceAlerts alerts={[mockAlerts[0]]} />);
    
    expect(screen.getByText('1 active alert')).toBeInTheDocument();
  });

  it('handles alerts with different severity levels correctly', () => {
    const mixedSeverityAlerts = [
      { ...mockAlerts[0], severity: 'critical' as const },
      { ...mockAlerts[1], severity: 'high' as const },
      { ...mockAlerts[2], severity: 'medium' as const },
      { ...mockResolvedAlert, severity: 'low' as const }
    ];
    
    render(<PerformanceAlerts alerts={mixedSeverityAlerts} />);
    
    expect(screen.getByText('critical')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('low')).toBeInTheDocument();
  });

  it('displays workflow names correctly', () => {
    render(<PerformanceAlerts alerts={mockAlerts} />);
    
    expect(screen.getByText('Lead Generation Workflow')).toBeInTheDocument();
    expect(screen.getByText('Email Campaign Workflow')).toBeInTheDocument();
    expect(screen.getByText('Data Sync Workflow')).toBeInTheDocument();
  });

  it('handles missing optional props gracefully', () => {
    render(<PerformanceAlerts alerts={mockAlerts} />);
    
    // Should render without errors even without optional callbacks
    expect(screen.getByText('Performance Alerts')).toBeInTheDocument();
    expect(screen.getByText('Lead Generation Workflow')).toBeInTheDocument();
  });

  it('prevents event bubbling when clicking resolve button', () => {
    const mockOnClick = vi.fn();
    const mockOnResolve = vi.fn();
    
    render(
      <PerformanceAlerts 
        alerts={mockAlerts} 
        onAlertClick={mockOnClick}
        onResolveAlert={mockOnResolve}
      />
    );
    
    const resolveButton = screen.getAllByText('Resolve')[0];
    fireEvent.click(resolveButton);
    
    expect(mockOnResolve).toHaveBeenCalledWith('alert-1');
    expect(mockOnClick).not.toHaveBeenCalled();
  });
});
