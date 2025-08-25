import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Zap,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { N8nWorkflowStatus } from '../types/n8n';

interface WorkflowStatusCardProps {
  workflow: N8nWorkflowStatus;
  onWorkflowClick?: (workflow: N8nWorkflowStatus) => void;
}

const WorkflowStatusCard: React.FC<WorkflowStatusCardProps> = ({ 
  workflow, 
  onWorkflowClick 
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'waiting':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'waiting':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDuration = (milliseconds: number) => {
    if (milliseconds < 1000) return `${milliseconds}ms`;
    if (milliseconds < 60000) return `${(milliseconds / 1000).toFixed(1)}s`;
    if (milliseconds < 3600000) return `${(milliseconds / 60000).toFixed(1)}m`;
    if (milliseconds < 86400000) return `${(milliseconds / 3600000).toFixed(1)}h`;
    return `${(milliseconds / 86400000).toFixed(1)}d`;
  };

  const formatTimeSaved = (milliseconds: number) => {
    const hours = milliseconds / (1000 * 60 * 60);
    if (hours < 1) return `${(milliseconds / (1000 * 60)).toFixed(1)}m`;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    return `${(hours / 24).toFixed(1)}d`;
  };

  const formatLastRun = (timestamp: string) => {
    const now = new Date();
    const lastRun = new Date(timestamp);
    const diffMs = now.getTime() - lastRun.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (current < previous) return <TrendingDown className="h-3 w-3 text-red-500" />;
    return null;
  };

  return (
    <div 
      className={`
        bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer
        ${onWorkflowClick ? 'cursor-pointer' : 'cursor-default'}
      `}
      onClick={() => onWorkflowClick?.(workflow)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-indigo-500" />
          <h3 className="font-semibold text-gray-900 text-sm truncate max-w-[200px]">
            {workflow.name}
          </h3>
        </div>
        <span className={`
          inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
          ${getStatusColor(workflow.status)}
        `}>
          {getStatusIcon(workflow.status)}
          <span className="ml-1 capitalize">{workflow.status}</span>
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Success Rate */}
        <div className="text-center">
          <div className={`text-lg font-bold ${getSuccessRateColor(workflow.successRate)}`}>
            {workflow.successRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">Success Rate</div>
        </div>

        {/* Total Executions */}
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">
            {workflow.totalExecutions}
          </div>
          <div className="text-xs text-gray-500">Executions</div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="space-y-2 mb-3">
        {/* Execution Time */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Avg Time:</span>
          <span className="font-medium text-gray-900">
            {formatDuration(workflow.averageExecutionTime)}
          </span>
        </div>

        {/* Time Saved */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Time Saved:</span>
          <span className="font-medium text-blue-600">
            {formatTimeSaved(workflow.timeSaved)}
          </span>
        </div>

        {/* Last Run */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Last Run:</span>
          <span className="font-medium text-gray-900">
            {formatLastRun(workflow.lastRun)}
          </span>
        </div>
      </div>

      {/* Execution Breakdown */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
        <span>
          ✓ {workflow.successfulExecutions} successful
        </span>
        <span>
          ✗ {workflow.failedExecutions} failed
        </span>
      </div>

      {/* Metadata Tags */}
      {workflow.metadata && (workflow.metadata.category || workflow.metadata.priority) && (
        <div className="flex items-center space-x-2 mt-3 pt-2 border-t">
          {workflow.metadata.category && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
              {workflow.metadata.category}
            </span>
          )}
          {workflow.metadata.priority && (
            <span className={`
              inline-flex items-center px-2 py-1 rounded text-xs font-medium
              ${workflow.metadata.priority === 'high' ? 'bg-red-100 text-red-800' : 
                workflow.metadata.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-green-100 text-green-800'}
            `}>
              {workflow.metadata.priority}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkflowStatusCard;
