import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '../test/setup';
import WorkflowStatusCard from '../components/WorkflowStatusCard';
import { N8nWorkflowStatus } from '../types/n8n';

const mockWorkflow: N8nWorkflowStatus = {
  id: 'workflow-1',
  name: 'Lead Generation Workflow',
  status: 'completed',
  executionId: 'exec-123',
  startTime: '2024-01-01T10:00:00Z',
  endTime: '2024-01-01T10:05:00Z',
  duration: 300000, // 5 minutes
  successRate: 95.5,
  totalExecutions: 100,
  successfulExecutions: 95,
  failedExecutions: 5,
  averageExecutionTime: 300000,
  timeSaved: 30000000, // 8.33 hours
  lastRun: '2024-01-01T10:00:00Z',
  metadata: {
    category: 'marketing',
    priority: 'high'
  }
};

const mockWorkflowRunning: N8nWorkflowStatus = {
  ...mockWorkflow,
  id: 'workflow-2',
  name: 'Email Campaign Workflow',
  status: 'running',
  endTime: undefined,
  duration: undefined,
  lastRun: '2024-01-01T09:55:00Z'
};

const mockWorkflowFailed: N8nWorkflowStatus = {
  ...mockWorkflow,
  id: 'workflow-3',
  name: 'Data Sync Workflow',
  status: 'failed',
  successRate: 45.0,
  successfulExecutions: 45,
  failedExecutions: 55,
  lastRun: '2024-01-01T08:00:00Z'
};

describe('WorkflowStatusCard', () => {
  it('renders workflow information correctly', () => {
    render(<WorkflowStatusCard workflow={mockWorkflow} />);
    
    expect(screen.getByText('Lead Generation Workflow')).toBeInTheDocument();
    expect(screen.getByText('95.5%')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('5.0m')).toBeInTheDocument();
    expect(screen.getByText('8.3h')).toBeInTheDocument();
    expect(screen.getByText('marketing')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
  });

  it('displays correct status with appropriate styling', () => {
    render(<WorkflowStatusCard workflow={mockWorkflow} />);
    
    const statusElement = screen.getByText('completed');
    expect(statusElement).toBeInTheDocument();
    // Check the outer span element for the styling classes
    const statusContainer = statusElement.closest('span')?.parentElement;
    expect(statusContainer).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('displays running status correctly', () => {
    render(<WorkflowStatusCard workflow={mockWorkflowRunning} />);
    
    expect(screen.getByText('running')).toBeInTheDocument();
    const statusContainer = screen.getByText('running').closest('span')?.parentElement;
    expect(statusContainer).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('displays failed status correctly', () => {
    render(<WorkflowStatusCard workflow={mockWorkflowFailed} />);
    
    expect(screen.getByText('failed')).toBeInTheDocument();
    const statusContainer = screen.getByText('failed').closest('span')?.parentElement;
    expect(statusContainer).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('formats duration correctly for different time ranges', () => {
    const shortDurationWorkflow = { ...mockWorkflow, averageExecutionTime: 500 }; // 500ms
    const longDurationWorkflow = { ...mockWorkflow, averageExecutionTime: 7200000 }; // 2 hours
    
    render(<WorkflowStatusCard workflow={shortDurationWorkflow} />);
    expect(screen.getByText('500ms')).toBeInTheDocument();
    
    render(<WorkflowStatusCard workflow={longDurationWorkflow} />);
    expect(screen.getByText('2.0h')).toBeInTheDocument();
  });

  it('formats time saved correctly for different durations', () => {
    const shortTimeWorkflow = { ...mockWorkflow, timeSaved: 1800000 }; // 30 minutes
    const longTimeWorkflow = { ...mockWorkflow, timeSaved: 259200000 }; // 3 days
    
    render(<WorkflowStatusCard workflow={shortTimeWorkflow} />);
    expect(screen.getByText('30.0m')).toBeInTheDocument();
    
    render(<WorkflowStatusCard workflow={longTimeWorkflow} />);
    expect(screen.getByText('3.0d')).toBeInTheDocument();
  });

  it('displays success rate with appropriate color coding', () => {
    const highSuccessWorkflow = { ...mockWorkflow, successRate: 98.5 };
    const mediumSuccessWorkflow = { ...mockWorkflow, successRate: 85.0 };
    const lowSuccessWorkflow = { ...mockWorkflow, successRate: 65.0 };
    
    render(<WorkflowStatusCard workflow={highSuccessWorkflow} />);
    expect(screen.getByText('98.5%')).toHaveClass('text-green-600');
    
    render(<WorkflowStatusCard workflow={mediumSuccessWorkflow} />);
    expect(screen.getByText('85.0%')).toHaveClass('text-yellow-600');
    
    render(<WorkflowStatusCard workflow={lowSuccessWorkflow} />);
    expect(screen.getByText('65.0%')).toHaveClass('text-red-600');
  });

  it('displays execution breakdown correctly', () => {
    render(<WorkflowStatusCard workflow={mockWorkflow} />);
    
    expect(screen.getByText('✓ 95 successful')).toBeInTheDocument();
    expect(screen.getByText('✗ 5 failed')).toBeInTheDocument();
  });

  it('formats last run time correctly', () => {
    // Use a more recent date for "Just now" test
    const recentWorkflow = { ...mockWorkflow, lastRun: new Date().toISOString() };
    // Use a date that's exactly 1 day ago for the "1d ago" test
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const oldWorkflow = { ...mockWorkflow, lastRun: oneDayAgo.toISOString() };
    
    render(<WorkflowStatusCard workflow={recentWorkflow} />);
    expect(screen.getByText('Just now')).toBeInTheDocument();
    
    render(<WorkflowStatusCard workflow={oldWorkflow} />);
    expect(screen.getByText('1d ago')).toBeInTheDocument();
  });

  it('displays metadata tags when available', () => {
    render(<WorkflowStatusCard workflow={mockWorkflow} />);
    
    expect(screen.getByText('marketing')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
  });

  it('does not display metadata tags when not available', () => {
    const workflowWithoutMetadata = { ...mockWorkflow, metadata: {} };
    render(<WorkflowStatusCard workflow={workflowWithoutMetadata} />);
    
    expect(screen.queryByText('marketing')).not.toBeInTheDocument();
    expect(screen.queryByText('high')).not.toBeInTheDocument();
  });

  it('handles click events when callback is provided', () => {
    const mockOnClick = vi.fn();
    render(<WorkflowStatusCard workflow={mockWorkflow} onWorkflowClick={mockOnClick} />);
    
    const card = screen.getByText('Lead Generation Workflow').closest('div');
    fireEvent.click(card!);
    
    expect(mockOnClick).toHaveBeenCalledWith(mockWorkflow);
  });

  it('does not have cursor pointer when no click callback is provided', () => {
    render(<WorkflowStatusCard workflow={mockWorkflow} />);
    
    const card = screen.getByText('Lead Generation Workflow').closest('div');
    expect(card).not.toHaveClass('cursor-pointer');
  });

  it('handles workflows with missing optional fields gracefully', () => {
    const minimalWorkflow: N8nWorkflowStatus = {
      id: 'minimal-workflow',
      name: 'Minimal Workflow',
      status: 'completed',
      executionId: 'exec-minimal',
      startTime: '2024-01-01T10:00:00Z',
      successRate: 100,
      totalExecutions: 1,
      successfulExecutions: 1,
      failedExecutions: 0,
      averageExecutionTime: 0,
      timeSaved: 0,
      lastRun: '2024-01-01T10:00:00Z'
    };
    
    render(<WorkflowStatusCard workflow={minimalWorkflow} />);
    
    expect(screen.getByText('Minimal Workflow')).toBeInTheDocument();
    expect(screen.getByText('100.0%')).toBeInTheDocument();
    expect(screen.getByText('0ms')).toBeInTheDocument();
    expect(screen.getByText('0.0m')).toBeInTheDocument();
  });

  it('displays priority with appropriate color coding', () => {
    const highPriorityWorkflow = { ...mockWorkflow, metadata: { priority: 'high' } };
    const mediumPriorityWorkflow = { ...mockWorkflow, metadata: { priority: 'medium' } };
    const lowPriorityWorkflow = { ...mockWorkflow, metadata: { priority: 'low' } };
    
    render(<WorkflowStatusCard workflow={highPriorityWorkflow} />);
    expect(screen.getByText('high')).toHaveClass('bg-red-100', 'text-red-800');
    
    render(<WorkflowStatusCard workflow={mediumPriorityWorkflow} />);
    expect(screen.getByText('medium')).toHaveClass('bg-yellow-100', 'text-yellow-800');
    
    render(<WorkflowStatusCard workflow={lowPriorityWorkflow} />);
    expect(screen.getByText('low')).toHaveClass('bg-green-100', 'text-green-800');
  });
});
